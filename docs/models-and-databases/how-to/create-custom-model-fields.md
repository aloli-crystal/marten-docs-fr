---
title: Créer des fields de modèle personnalisés
description: Guide pratique pour créer des fields de modèle personnalisés.
---

Marten vous donne la possibilité de créer vos propres implémentations de fields de modèle personnalisés, qui peuvent impliquer des logiques de validation personnalisées, des erreurs et des comportements personnalisés. Vous pouvez choisir d'utiliser ces fields personnalisés dans les définitions de modèles de votre projet, et vous pouvez même les distribuer pour permettre à d'autres projets de les utiliser.

## Fields de modèle : portée et responsabilités

Les fields de modèle ont les responsabilités suivantes :

* ils définissent le type et les propriétés de la colonne sous-jacente au niveau de la base de données
* ils définissent les bindings Crystal nécessaires au niveau de la classe de modèle : cela signifie qu'ils peuvent contribuer des méthodes personnalisées ou des variables d'instance aux modèles qui les utilisent (par ex. getters, setters, etc.)
* ils définissent comment les valeurs des fields sont validées et/ou assainies

Créer un field de modèle personnalisé ne signifie pas nécessairement que toutes ces responsabilités doivent être prises en charge dans l'implémentation du field personnalisé. Cela dépend vraiment de si vous souhaitez :

* utiliser un field de modèle intégré existant (par ex. integer, string, etc.)
* ou créer un nouveau field de modèle à partir de zéro.

## Enregistrer de nouveaux fields de modèle

Quelle que soit l'approche que vous adoptez pour définir de nouvelles classes de fields de modèle ([sous-classer des fields intégrés](#sous-classer-des-fields-de-modèle-existants) ou [en créer de nouveaux à partir de zéro](#créer-de-nouveaux-fields-de-modèle-à-partir-de-zéro)), ces classes doivent être enregistrées dans le registre global de fields de Marten afin de les rendre disponibles pour utilisation lors de la définition de modèles.

Pour ce faire, vous devrez appeler la méthode [`Marten::DB::Field#register`](pathname:///api/dev/Marten/DB/Field.html#register(id%2Cfield_klass)-macro) avec l'identifiant du field que vous souhaitez utiliser et la classe de field réelle. Par exemple :

```crystal
Marten::DB::Field.register(:foo, FooField)
```

L'identifiant que vous passez à `#register` peut être un symbole ou une chaîne. C'est l'identifiant qui est ensuite mis à disposition des classes de modèles pour définir leurs fields :

```crystal
class MyModel < Marten::DB::Model
  field :id, :big_int, primary_key: true, auto: true
  // highlight-next-line
  field :test, :foo, blank: true, null: true
end
```

L'appel à `#register` peut être fait depuis n'importe où dans votre code, mais évidemment, vous voudrez vous assurer qu'il est fait avant de requérir vos classes de modèles : en effet, Marten fera échouer la compilation de votre projet s'il ne peut pas trouver le type de field que vous essayez d'utiliser dans une définition de modèle.

## Sous-classer des fields de modèle existants

La manière la plus simple d'introduire un field de modèle est probablement de sous-classer l'un des [fields de modèle intégrés](../reference/fields.md) fournis par Marten. Cela peut avoir beaucoup de sens si le "type" du field que vous essayez d'implémenter est déjà supporté par Marten.

Par exemple, implémenter un field "email" personnalisé pourrait être fait en sous-classant la classe existante [`Marten::DB::Field::String`](pathname:///api/dev/Marten/DB/Field/String.html). En effet, un field "email" est essentiellement une chaîne avec une taille maximale prédéfinie et une logique de validation supplémentaire :

```crystal
class EmailField < Marten::DB::Field::String
  def initialize(
    @id : ::String,
    @max_size : ::Int32 = 254,
    @primary_key = false,
    @default : ::String? = nil,
    @blank = false,
    @null = false,
    @unique = false,
    @index = false,
    @db_column = nil
  )
  end

  def validate(record, value)
    return if !value.is_a?(::String)

    # Leverage string's built-in validations (max size).
    super

    if !EmailValidator.valid?(value)
      record.errors.add(id, "Provide a valid email address")
    end
  end

  macro check_definition(field_id, kwargs)
    # No-op max_size automatic checks...
  end
end
```

Tout ce qui est décrit dans la section suivante sur la [création de fields de modèle à partir de zéro](#créer-de-nouveaux-fields-de-modèle-à-partir-de-zéro) s'applique également au cas du sous-classement de fields existants : les mêmes méthodes peuvent être redéfinies si nécessaire, mais utiliser une classe existante peut vous économiser du travail.

## Créer de nouveaux fields de modèle à partir de zéro

Créer de nouveaux fields de modèle à partir de zéro implique de sous-classer la classe abstraite [`Marten::DB::Field::Base`](pathname:///api/dev/Marten/DB/Field/Base.html). Pour cette raison, la nouvelle classe de field doit implémenter un ensemble de méthodes obligatoires. Ces méthodes obligatoires, et d'autres qui sont optionnelles (mais intéressantes en termes de capacités), sont décrites dans les sections suivantes.

### Méthodes obligatoires

#### `default`

La méthode `#default` est responsable de retourner la valeur par défaut du field, le cas échéant. Tous les fields ne supportent pas les valeurs par défaut ; si cela ne s'applique pas à votre cas d'utilisation de field, vous pouvez simplement faire un "no-op" de cette méthode :

```crystal
def default
  # no-op
end
```

D'un autre côté, si votre field peut être initialisé avec un argument `default` (et s'il définit une variable d'instance `@default`), une autre possibilité est de définir un getter `#default` :

```crystal
getter default
```

#### `from_db`

La méthode `#from_db` est responsable de convertir la valeur brute DB passée vers la bonne valeur de field. En effet, la valeur lue depuis la base de données devra généralement être convertie dans un autre format. Par exemple, un field `uuid` pourrait avoir besoin de convertir une valeur `String` en un objet `UUID` approprié :

```crystal
def from_db(value) : ::UUID?
  case value
  when Nil
    value.as?(Nil)
  when ::String
    ::UUID.new(value.as(::String))
  when ::UUID
    value.as(::UUID)
  else
    raise_unexpected_field_value(value)
  end
end
```

Il est à noter que vous voudrez généralement gérer le cas des valeurs `nil` dans cette méthode puisque les fields peuvent être configurés comme nullable via l'option [`null: true`](../reference/fields.md#null).

Si la valeur ne peut pas être traitée correctement par votre classe de field, il peut être nécessaire de lever une exception. Pour cela, vous pouvez utiliser la méthode `#raise_unexpected_field_value`, qui lèvera une exception `Marten::DB::Errors::UnexpectedFieldValue`.

#### `from_db_result_set`

La méthode `#from_db_result_set` est responsable d'extraire la valeur du field d'un ensemble de résultats DB et de retourner le bon objet correspondant à cette valeur. Cette méthode sera généralement appelée lors de la récupération de la valeur de votre field depuis la base de données (lors de l'utilisation de l'ORM Marten). La méthode prend un objet standard `DB::ResultSet` comme argument et il est attendu que vous utilisiez `#read` pour récupérer la valeur de colonne visée. Voir la [documentation de référence Crystal](https://crystal-lang.org/reference/1.5/database/index.html#reading-query-results) pour plus de détails sur ces objets et méthodes.

Par exemple :

```crystal
def from_db_result_set(result_set : ::DB::ResultSet) : ::UUID?
  from_db(result_set.read(Nil | ::String | ::UUID))
end
```

La méthode `#from_db_result_set` est supposée retourner la valeur lue dans la bonne "représentation", c'est-à-dire l'objet final représentant la valeur du field avec laquelle les utilisateurs interagiront lors de la manipulation des enregistrements de modèles (par exemple un objet `UUID` créé à partir d'une chaîne). Ainsi, vous voudrez généralement appeler [`#from_db`](#from_db) une fois que vous aurez obtenu la valeur de l'ensemble de résultats de la base de données afin de retourner la valeur finale.

#### `to_column`

La plupart des fields de modèle contribueront une colonne correspondante au niveau de la base de données ; ces colonnes sont lues par Marten afin de générer des migrations à partir des définitions de modèles. La colonne retournée par la méthode `#to_column` doit être une instance d'une sous-classe de [`Marten::DB::Management::Column::Base`](pathname:///api/dev/Marten/DB/Management/Column/Base.html).

Par exemple, un field "email" pourrait retourner une colonne string dans sa méthode `#to_column` :

```crystal
def to_column : Marten::DB::Management::Column::Base?
  Marten::DB::Management::Column::String.new(
    name: db_column!,
    max_size: max_size,
    primary_key: primary_key?,
    null: null?,
    unique: unique?,
    index: index?,
    default: to_db(default)
  )
end
```

Si pour une raison quelconque votre field personnalisé ne contribue aucune colonne au modèle de base de données, il est possible de simplement faire un "no-op" de la méthode `#to_column` en retournant `nil` à la place.

#### `to_db`

La méthode `#to_db` convertit une valeur de field de la représentation "Crystal" vers la représentation base de données. Ainsi, cette méthode effectue l'opération inverse de la méthode [`#from_db`](#from_db).

Par exemple, cette méthode pourrait retourner la représentation en chaîne d'un objet `UUID` :

```crystal
def to_db(value) : ::DB::Any
  case value
  when Nil
    nil
  when ::UUID
    value.hexstring
  else
    raise_unexpected_field_value(value)
  end
end
```

Encore une fois, si la valeur ne peut pas être traitée correctement par la classe de field, il peut être nécessaire de lever une exception. Pour cela, vous pouvez utiliser la méthode `#raise_unexpected_field_value`, qui lèvera une exception `Marten::DB::Errors::UnexpectedFieldValue`.

### Autres méthodes utiles

#### `initialize`

La méthode `#initialize` par défaut fournie par [`Marten::DB::Field::Base`](pathname:///api/dev/Marten/DB/Field/Base.html) est assez simple et ressemble à ceci :

```crystal
def initialize(
  @id : ::String,
  @primary_key = false,
  @blank = false,
  @null = false,
  @unique = false,
  @index = false,
  @db_column = nil
)
end
```

Selon les exigences de votre field, vous pourriez vouloir redéfinir complètement cette méthode afin de supporter des paramètres supplémentaires (tels que des valeurs par défaut, des tailles maximales, des options liées à la validation, etc.).

#### `validate`

La méthode `#validate` ne fait rien par défaut et peut être redéfinie par classe de field afin d'implémenter une logique de validation personnalisée. Cette méthode prend l'enregistrement de modèle en cours de validation et la valeur du field comme arguments, ce qui vous permet d'exécuter facilement des vérifications de validation et d'ajouter des [erreurs de validation](../validations.md) à l'enregistrement de modèle.

Par exemple :

```crystal
def validate(record, value)
  return if !value.is_a?(::String)

  if !EmailValidator.valid?(value)
    record.errors.add(id, "Provide a valid email address")
  end
end
```

### Un exemple

Considérons le cas d'utilisation du field "email" mis en évidence dans [Sous-classer des fields de modèle existants](#sous-classer-des-fields-de-modèle-existants). Le même field pourrait être implémenté à partir de zéro avec l'extrait suivant :

```crystal
class EmailField < Marten::DB::Field::Base
  getter default
  getter max_size

  def initialize(
    @id : ::String,
    @max_size : ::Int32 = 254,
    @primary_key = false,
    @default : ::String? = nil,
    @blank = false,
    @null = false,
    @unique = false,
    @index = false,
    @db_column = nil
  )
  end

  def from_db(value) : ::String?
    case value
    when Nil | ::String
      value.as?(Nil | ::String)
    else
      raise_unexpected_field_value(value)
    end
  end

  def from_db_result_set(result_set : ::DB::ResultSet) : ::String?
    result_set.read(::String?)
  end

  def to_column : Marten::DB::Management::Column::Base?
    Marten::DB::Management::Column::String.new(
      name: db_column!,
      max_size: max_size,
      primary_key: primary_key?,
      null: null?,
      unique: unique?,
      index: index?,
      default: to_db(default)
    )
  end

  def to_db(value) : ::DB::Any
    case value
    when Nil
      nil
    when ::String
      value
    when Symbol
      value.to_s
    else
      raise_unexpected_field_value(value)
    end
  end

  def validate(record, value)
    return if !value.is_a?(::String)

    if value.size > @max_size
      record.errors.add(id, "The maximum allowed length is #{@max_size} characters")
    end

    if !EmailValidator.valid?(value)
      record.errors.add(id, "Provide a valid email address")
    end
  end
end
```
