---
title: Validations de schema
description: Apprenez à valider des données avec les schemas.
sidebar_label: Validations
---

L'objectif principal des schemas est de valider les données et les paramètres de requête. En tant que tels, les schemas fournissent un mécanisme pratique permettant de définir des règles de validation. Ces règles peuvent être héritées des champs de votre schema selon les options que vous avez utilisées et le type de vos champs. Elles peuvent également être explicitement spécifiées dans votre classe schema, ce qui est utile si vous devez implémenter des logiques de validation personnalisées.


## Vue d'ensemble

### Un court exemple

Considérons l'exemple suivant :

```crystal
class UserSchema < Marten::Schema
  field :name, :string, required: true, max_size: 128
end
```

Dans le fragment ci-dessus, un schema `UserSchema` est défini et il est spécifié que le champ `name` doit être présent (`required: true`) et que la valeur associée ne peut pas dépasser 128 caractères.

Étant donné ces caractéristiques, il est possible d'initialiser des instances de `UserSchema` et de valider des données via l'utilisation de la méthode `#valid?` :

```crystal
schema_1 = UserSchema.new(Marten::Schema::DataHash.new)
schema_1.valid?                       # => false

schema_2 = UserSchema.new(Marten::Schema::DataHash{ "name" => "0" * 200) })
schema_2.valid?                       # => false

schema_3 = UserSchema.new(Marten::Schema::DataHash{ "name" => "John Doe") })
schema_3.valid?                       # => true
```

Comme vous pouvez le voir dans les exemples ci-dessus, les deux premiers schemas sont invalides soit parce que le champ `name` n'est pas spécifié, soit parce que sa valeur dépasse la limite maximale de caractères. Le dernier schema est cependant valide car il a un champ `name` qui fait moins de 128 caractères.

### Exécuter les validations de schema

Comme souligné dans la section précédente, les règles de validation de schema seront exécutées lors de l'appel des méthodes `#valid?` et `#invalid?` : ces méthodes retournent `true` ou `false` selon que les données sont valides ou invalides.

```crystal
schema = UserSchema.new(Marten::Schema::DataHash.new)
schema.valid?     # => false
schema.invalid?   # => true
```

## Règles de validation des champs

Comme mentionné précédemment, les champs peuvent contribuer des règles de validation à vos schemas. Ces règles de validation peuvent être héritées :

* du type de champ lui-même : certains champs valideront que les valeurs sont d'un type spécifique (par exemple un champ `uuid` ne validera pas les valeurs qui ne correspondent pas à des UUID valides)
* des options de champ que vous définissez (par exemple les champs utilisant `required: true` résulteront en erreurs si le champ est manquant dans les données validées)

Veuillez consulter la [référence des champs](./reference/fields.md) pour en savoir plus sur les types de champs supportés et leurs options associées.

## Règles de validation personnalisées

Des règles de validation personnalisées peuvent être définies via l'utilisation de la macro `#validate`. Cette macro vous permet de configurer le nom d'une méthode de validation qui doit être appelée lorsqu'une instance de schema est validée. À l'intérieur de cette méthode, vous pouvez implémenter toute logique de validation dont vous pourriez avoir besoin et ajouter des erreurs à l'instance de schema si les données sont invalides.

Par exemple :

```crystal
class SignUpSchema < Marten::Schema
  field :email, :string, max_size: 254
  field :password1, :string, max_size: 128, strip: false
  field :password2, :string, max_size: 128, strip: false

  validate :validate_password

  def validate_password
    return unless validated_data["password1"]? && validated_data["password2"]?

    if validated_data["password1"] != validated_data["password2"]
      errors.add("The two password fields do not match")
    end
  end
end
```

Dans le fragment ci-dessus, une méthode de validation personnalisée s'assure que les champs `password1` et `password2` ont exactement la même valeur. Si ce n'est pas le cas, alors une erreur spécifique (qui n'est associée à aucun champ) est ajoutée à l'instance de schema (ce qui la rend invalide). Il est intéressant de noter l'utilisation de la méthode `#validated_data` ici : cette méthode retourne un hash de toutes les valeurs qui ont été précédemment assainies et validées. Vous pouvez l'utiliser lors de la définition de règles de validation personnalisées : en effet, ces règles s'exécutent toujours _après_ que tous les champs ont été individuellement validés en premier.

:::important
Vous pouvez définir plusieurs règles de validation dans vos classes schema. Ce faisant, n'oubliez pas que ces règles de validation personnalisées sont appelées dans l'ordre dans lequel elles sont définies.
:::

## Erreurs de validation

Des méthodes comme `#valid?` ou `#invalid?` vous permettent uniquement de savoir si une instance de schema est valide ou invalide pour un jeu de données spécifique. Mais vous voudrez probablement savoir exactement quelles sont les erreurs réelles ou comment en ajouter de nouvelles.

En tant que tel, chaque instance de schema a un ensemble d'erreurs associé, qui est une instance de [`Marten::Core::Validation::ErrorSet`](https://martenframework.com/docs/api/dev/Marten/Core/Validation/ErrorSet.html).

### Inspecter les erreurs

L'ensemble d'erreurs d'une instance de schema vous permet d'accéder à toutes les erreurs d'une instance de schema spécifique. Par exemple :

```crystal
schema = UserSchema.new(Marten::Schema::DataHash.new)

schema.valid?
# => false

schema.errors.size
# => 1

schema.errors
# => #<Marten::Core::Validation::ErrorSet:0x100e1b740
#      @errors=
#        [#<Marten::Core::Validation::Error:0x100db75d0
#          @field="name",
#          @message="This field is required.",
#          @type="required">]>
```

Comme vous pouvez le voir, l'ensemble d'erreurs vous donne la possibilité de connaître le nombre d'erreurs affectant votre instance de schema. Chaque erreur fournit également des informations supplémentaires :

* le nom du champ associé (qui peut être `nil` si l'erreur est globale)
* le message d'erreur
* le type d'erreur, qui est optionnel (`required` dans l'exemple précédent)

Vous pouvez également accéder aux erreurs associées à un champ spécifique très facilement en utilisant la méthode `#[]` :

```crystal
schema.errors[:name]
# => [#<Marten::Core::Validation::Error:0x104fb75d0
#      @field="name",
#      @message="This field is required.",
#      @type="required">]
```

Les erreurs globales (erreurs affectant l'ensemble de l'instance de schema ou plusieurs champs à la fois) peuvent être listées via l'utilisation de la méthode `#global`.

### Ajouter des erreurs

Les erreurs peuvent être ajoutées à un ensemble d'erreurs via l'utilisation de la méthode `#add`. Cette méthode prend un nom de champ, un message et un type d'erreur optionnel :

```crystal
schema.errors.add(:name, "Name is invalid")                      # error type is "invalid"
schema.errors.add(:name, "Name is invalid", type: :invalid_name) # error type is "invalid_name"
```

Les erreurs globales peuvent être spécifiées via l'utilisation d'une méthode `#add` alternative qui ne prend pas de nom de champ :

```crystal
schema.errors.add("User is invalid")                      # error type is "invalid"
schema.errors.add("User is invalid", type: :invalid_user) # error type is "invalid_user"
```
