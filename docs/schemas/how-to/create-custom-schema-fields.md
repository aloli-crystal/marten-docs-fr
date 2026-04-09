---
title: Créer des champs de schema personnalisés
description: Comment créer des champs de schema personnalisés.
---

Marten vous donne la possibilité de créer vos propres implémentations de champs de schema personnalisés. Ceux-ci peuvent impliquer des validations, des comportements et des erreurs personnalisés. Vous pouvez utiliser ces champs personnalisés dans les définitions de schema de votre projet, et vous pouvez même les distribuer pour permettre à d'autres projets de les utiliser.

## Champs de schema : portée et responsabilités

Les champs de schema ont les responsabilités suivantes :

* ils définissent comment les valeurs de champ sont désérialisées et sérialisées
* ils définissent comment ces valeurs sont validées

Lors de la création d'un champ de schema personnalisé, il y a généralement deux approches que vous pouvez envisager selon le niveau de personnalisation que vous souhaitez implémenter. Vous pouvez soit :

* utiliser un champ de schema intégré existant (par exemple integer, string, etc.) et y ajouter des comportements et validations personnalisés
* soit créer un nouveau champ de schema de zéro

## Enregistrer de nouveaux champs de schema

Quelle que soit l'approche que vous adoptez pour définir de nouvelles classes de champs de schema ([sous-classer des champs existants](#sous-classer-des-champs-de-schema-existants), ou [en créer de nouveaux de zéro](#créer-de-nouveaux-champs-de-schema-de-zéro)), ces classes doivent être enregistrées dans le registre global des champs de Marten afin de les rendre disponibles lors de la définition de schemas.

Pour ce faire, vous devrez appeler la méthode [`Marten::Schema::Field#register`](https://martenframework.com/docs/api/dev/Marten/Schema/Field.html#register(id%2Cfield_klass)-macro) avec l'identifiant du champ que vous souhaitez utiliser, et la classe de champ réelle. Par exemple :

```crystal
Marten::Schema::Field.register(:foo, FooField)
```

L'identifiant que vous passez à `#register` peut être un symbole ou une chaîne. C'est l'identifiant qui est ensuite rendu disponible aux classes schema pour définir leurs champs :

```crystal
class MySchema < Marten::Schema
  field :title, :string
  // highlight-next-line
  field :test, :foo
end
```

L'appel à `#register` peut être effectué depuis n'importe où dans votre code, mais évidemment, vous voudrez vous assurer qu'il est fait avant de requérir vos classes schema : en effet, Marten fera échouer la compilation de votre projet s'il ne peut pas trouver le type de champ que vous essayez d'utiliser dans une définition de schema.

## Sous-classer des champs de schema existants

C'est probablement la manière la plus simple de créer un champ personnalisé : si le champ que vous voulez créer peut être dérivé de l'un des [champs de schema intégrés](../reference/fields.md) (ceux-ci correspondent généralement à des types primitifs), alors vous pouvez facilement sous-classer la classe correspondante et la personnaliser pour qu'elle réponde à vos besoins.

Par exemple, implémenter un champ « email » personnalisé pourrait être fait en sous-classant la classe existante [`Marten::Schema::Field::String`](https://martenframework.com/docs/api/dev/Marten/Schema/Field/String.html). En effet, un champ « email » est essentiellement une chaîne avec une taille maximale prédéfinie et une logique de validation supplémentaire :

```crystal
class EmailField < Marten::Schema::Field::String
  def initialize(
    @id : ::String,
    @required : ::Bool = true,
    @max_size : ::Int32? = 254,
    @min_size : ::Int32? = nil
  )
    @strip = true
  end

  def validate(schema, value)
    return if !value.is_a?(::String)

    # Leverage string's built-in validations (max size, min size).
    super

    if !EmailValidator.valid?(value)
      schema.errors.add(id, "Provide a valid email address")
    end
  end
end
```

Dans le fragment ci-dessus, la classe `EmailField` surcharge simplement la méthode `#validate` afin d'implémenter des règles de validation spécifiques au cas d'utilisation des adresses email (tout en s'assurant que les validations classiques de chaîne sont également exécutées).

Tout ce qui est décrit dans la section suivante sur la [création de champs de schema de zéro](#créer-de-nouveaux-champs-de-schema-de-zéro) s'applique également au cas du sous-classement de champs existants : les mêmes méthodes peuvent être surchargées si nécessaire, mais utiliser une classe existante peut vous faire gagner du temps.

## Créer de nouveaux champs de schema de zéro

Créer de nouveaux champs de schema de zéro implique de sous-classer la classe abstraite [`Marten::Schema::Field::Base`](https://martenframework.com/docs/api/dev/Marten/Schema/Field/Base.html). De ce fait, la nouvelle classe de champ doit implémenter un ensemble de méthodes obligatoires. Ces méthodes obligatoires, et d'autres qui sont optionnelles (mais intéressantes en termes de fonctionnalités), sont décrites dans les sections suivantes.

### Méthodes obligatoires

#### `deserialize`

La méthode `#deserialize` est responsable de la désérialisation d'une valeur de champ de schema. En effet, la valeur brute d'un champ de schema provient généralement des données d'une requête et doit être convertie dans un autre format. Par exemple, un champ `uuid` pourrait avoir besoin de convertir une valeur `String` en un objet `UUID` approprié :

```crystal
def deserialize(value) : ::UUID?
  return if empty_value?(value)

  case value
  when Nil
    value
  when ::String
    value.empty? ? nil : ::UUID.new(value)
  when JSON::Any
    deserialize(value.raw)
  else
    raise_unexpected_field_value(value)
  end
rescue ArgumentError
  raise_unexpected_field_value(value)
end
```

Les champs peuvent être configurés comme obligatoires ou non (option [`required`](../reference/fields.md#required)), ce qui signifie que vous voudrez généralement gérer le cas des valeurs `nil` dans cette méthode et retourner `nil` si la valeur entrante est `nil`. Il est également à noter que les valeurs entrantes peuvent être n'importe quelle donnée JSON (`JSON::Any`), ce qui signifie que vous devez gérer ce cas correctement également.

Si la valeur ne peut pas être traitée correctement par votre classe de champ, il peut être nécessaire de lever une exception. Pour cela, vous pouvez utiliser la méthode `#raise_unexpected_field_value`, qui lèvera une exception `Marten::Schema::Errors::UnexpectedFieldValue`.

#### `serialize`

La méthode `#serialize` est responsable de la sérialisation d'une valeur de champ, ce qui est essentiellement l'inverse de la méthode [`#deserialize`](#deserialize). En tant que telle, cette méthode doit convertir une valeur de champ de la représentation « Crystal » vers la représentation brute du schema.

Par exemple, cette méthode pourrait retourner la représentation en chaîne d'un objet `UUID` :

```crystal
def serialize(value) : ::String?
  value.try(&.to_s)
end
```

Encore une fois, si la valeur ne peut pas être traitée correctement par la classe de champ, il peut être nécessaire de lever une exception. Pour cela, vous pouvez utiliser la méthode `#raise_unexpected_field_value`, qui lèvera une exception `Marten::Schema::Errors::UnexpectedFieldValue`.

### Autres méthodes utiles

#### `initialize`

La méthode `#initialize` par défaut fournie par [`Marten::Schema::Field::Base`](https://martenframework.com/docs/api/dev/Marten/Schema/Field/Base.html) est assez simple et ressemble à ceci :

```crystal
def initialize(
  @id : ::String,
  @required : ::Bool = true
)
end
```

Selon les exigences de votre champ, vous pourriez vouloir surcharger cette méthode complètement afin de supporter des paramètres supplémentaires (tels que des options liées à la validation par défaut par exemple).

#### `validate`

La méthode `#validate` ne fait rien par défaut et peut être surchargée sur une base par classe de champ afin d'implémenter une logique de validation personnalisée. Cette méthode prend l'objet schema en cours de validation et la valeur du champ comme arguments, ce qui vous permet d'exécuter facilement des vérifications de validation et d'ajouter des [erreurs de validation](../validations.md) à l'objet schema.

Par exemple :

```crystal
def validate(schema, value)
  return if !value.is_a?(::String)

  if !EmailValidator.valid?(value)
    schema.errors.add(id, "Provide a valid email address")
  end
end
```

### Un exemple

Considérons le cas d'utilisation du champ « email » mis en évidence dans [Sous-classer des champs de schema existants](#sous-classer-des-champs-de-schema-existants). Le même champ exactement pourrait être implémenté de zéro avec le fragment suivant :

```crystal
class EmailField < Marten::Schema::Field::Base
  getter max_size
  getter min_size

  def initialize(
    @id : ::String,
    @required : ::Bool = true,
    @max_size : ::Int32? = 254,
    @min_size : ::Int32? = nil,
    @strip : ::Bool = true
  )
  end

  def deserialize(value) : ::String?
    strip? ? value.to_s.strip : value.to_s
  end

  def serialize(value) : ::String?
    value.try(&.to_s)
  end

  def strip?
    @strip
  end

  def validate(schema, value)
    return if !value.is_a?(::String)

    if !min_size.nil? && value.size < min_size.not_nil!
      schema.errors.add(id, "The minimum allowed length is #{min_size} characters")
    end

    if !max_size.nil? && value.size > max_size.not_nil!
      schema.errors.add(id, "The maximum allowed length is #{max_size} characters")
    end

    if !EmailValidator.valid?(value)
      record.errors.add(id, "Provide a valid email address")
    end
  end
end
```
