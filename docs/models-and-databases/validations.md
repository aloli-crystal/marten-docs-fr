---
title: Validations de modèles
description: Apprenez à valider les enregistrements de modèles.
sidebar_label: Validations
---

Les instances de modèles _doivent_ être validées avant d'être persistées dans la base de données. À ce titre, les modèles fournissent un moyen pratique de définir des règles de validation grâce à l'utilisation des fields de modèle et d'un DSL de règles de validation personnalisées. Les logiques de validation sous-jacentes sont entièrement indépendantes de la base de données, ne peuvent pas être contournées (sauf spécification explicite), et peuvent être facilement testées unitairement.

Les règles de validation peuvent être héritées des fields de votre modèle selon les options que vous avez utilisées et le type de vos fields (par exemple, les fields utilisant `blank: false` feront échouer la validation de l'enregistrement associé si la valeur du field est vide). Elles peuvent également être spécifiées explicitement dans votre classe de modèle, ce qui est utile si vous devez implémenter des logiques de validation personnalisées.

## Vue d'ensemble

### Un court exemple

Considérons l'exemple suivant :

```crystal
class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :name, :string, max_size: 128, blank: false
end
```

Dans l'extrait ci-dessus, un modèle `User` est défini et il est spécifié que le field `name` doit être présent (`blank: false`) et que la valeur associée ne peut pas dépasser 128 caractères.

Étant donné ces caractéristiques, il est possible de créer des instances `User` et de les valider via l'utilisation de la méthode `#valid?` :

```crystal
user_1 = User.new
user_1.valid?                       # => false

user_2 = User.new(name: "0" * 200)
user_2.valid?                       # => false

user_3 = User.new(name: "John Doe")
user_3.valid?                       # => true
```

Comme vous pouvez le voir dans les exemples ci-dessus, les deux premiers utilisateurs sont invalides car soit le `name` n'est pas spécifié, soit sa valeur dépasse la limite maximale de caractères. Le dernier utilisateur est cependant valide car il a un `name` de moins de 128 caractères.

### Quand la validation de modèle se produit-elle ?

Les instances de modèles sont validées lorsqu'elles sont créées ou mises à jour, avant que les valeurs ne soient persistées dans la base de données. Les méthodes comme `#create` ou `#save` exécutent automatiquement les validations. Elles retournent `false` pour indiquer que l'objet considéré est invalide (et elles retournent `true` si l'objet est valide). Les méthodes `#create` et `#save` ont également des variantes bang (`#create!` et `#save!`) qui lèveront explicitement une erreur de validation (instance de `Marten::DB::Errors::InvalidRecord`) en cas d'enregistrements invalides.

Par exemple :

```crystal
user = User.new
user.save
# => false
user.save!
# => Unhandled exception: Record is invalid (Marten::DB::Errors::InvalidRecord)
```

Lors de la validation des enregistrements de modèles, les règles de validation héritées des fields seront exécutées en premier, puis toute règle de validation personnalisée définie dans le modèle sera appliquée.

### Exécuter les validations de modèle

Comme mentionné précédemment, les règles de validation seront exécutées automatiquement lors de l'appel des méthodes `#create` ou `#save` sur un enregistrement de modèle. Il est également possible de vérifier manuellement si une instance de modèle est valide ou non en utilisant les méthodes `#valid?` et `#invalid?` :

```crystal
user = User.new
user.valid?     # => false
user.invalid?   # => true
```

## Règles de validation des fields

Comme mentionné précédemment, les fields peuvent contribuer des règles de validation à vos modèles. Ces règles de validation peuvent être héritées :

* du type de field lui-même : certains fields valideront que les valeurs sont d'un type spécifique (par exemple, un field `uuid` ne validera pas les valeurs qui ne correspondent pas à des UUID valides)
* des options de field que vous définissez (par exemple, les fields utilisant `blank: true` acceptent les valeurs vides)

Veuillez vous référer à la [référence des fields](./reference/fields.md) pour en savoir plus sur les types de fields supportés et leurs options associées.

## Règles de validation personnalisées

Les règles de validation personnalisées peuvent être définies via l'utilisation de la macro `#validate`. Cette macro vous permet de configurer le nom d'une méthode de validation qui sera appelée lorsqu'une instance de modèle est validée. À l'intérieur de cette méthode, vous pouvez implémenter toute logique de validation dont vous pourriez avoir besoin et ajouter des erreurs à vos instances de modèle si elles sont identifiées comme invalides.

Par exemple :

```crystal
class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :name, :string, max_size: 128, blank: false

  validate :validate_name_is_not_forbidden

  private def validate_name_is_not_forbidden
    errors.add(:name, "admin can't be used!") if name == "admin"
  end
end
```

Dans l'extrait ci-dessus, une méthode de validation personnalisée s'assure que le `name` d'une instance du modèle `User` ne peut pas être défini à `"admin"` : si le nom est défini à `"admin"`, alors une erreur spécifique (associée à l'attribut `name`) est ajoutée à l'instance de modèle (ce qui la rend invalide).

## Erreurs de validation

Les méthodes comme `#valid?` ou `#invalid?` vous permettent uniquement de savoir si une instance de modèle est valide ou invalide. Mais vous voudrez probablement connaître exactement les erreurs réelles ou savoir comment en ajouter de nouvelles.

À ce titre, chaque instance de modèle possède un ensemble d'erreurs associé, qui est une instance de [`Marten::Core::Validation::ErrorSet`](pathname:///api/dev/Marten/Core/Validation/ErrorSet.html).

### Inspecter les erreurs

Un ensemble d'erreurs d'instance de modèle vous permet d'accéder à toutes les erreurs d'une instance de modèle spécifique. Par exemple :

```crystal
user = User.new

user.valid?
# => false

user.errors.size
# => 1

user.errors
# => #<Marten::Core::Validation::ErrorSet:0x100e1b740
#      @errors=
#        [#<Marten::Core::Validation::Error:0x100db75d0
#          @field="name",
#          @message="This field cannot be blank.",
#          @type="blank">]>
```

Comme vous pouvez le voir, l'ensemble d'erreurs vous donne la possibilité de savoir combien d'erreurs affectent votre instance de modèle. Chaque erreur fournit également des informations supplémentaires :

* le nom du field associé (qui peut être `nil` si l'erreur est globale)
* le message d'erreur
* le type d'erreur, qui est optionnel (`blank` dans l'exemple précédent)

Vous pouvez également accéder très facilement aux erreurs associées à un field spécifique en utilisant la méthode `#[]` :

```crystal
user.errors[:name]
# => [#<Marten::Core::Validation::Error:0x104fb75d0
#      @field="name",
#      @message="This field cannot be blank.",
#      @type="blank">]
```

Les erreurs globales (erreurs affectant l'ensemble de l'instance de modèle ou plusieurs fields à la fois) peuvent être listées via l'utilisation de la méthode `#global`.

### Ajouter des erreurs

Des erreurs peuvent être ajoutées à un ensemble d'erreurs via l'utilisation de la méthode `#add`. Cette méthode prend un nom de field, un message et un type d'erreur optionnel :

```crystal
user.errors.add(:name, "Name is invalid")                      # error type is "invalid"
user.errors.add(:name, "Name is invalid", type: :invalid_name) # error type is "invalid_name"
```

Les erreurs globales peuvent être spécifiées via l'utilisation d'une méthode `#add` alternative qui ne prend pas de nom de field :

```crystal
user.errors.add("User is invalid")                      # error type is "invalid"
user.errors.add("User is invalid", type: :invalid_user) # error type is "invalid_user"
```

## Ignorer les validations

Les validations de modèle peuvent être explicitement ignorées lors de l'utilisation des méthodes `#save` ou `#save!`. Pour ce faire, l'argument `validate: false` peut être utilisé :

```crystal
user = User.new
user.save(validate: false)
```

:::caution
Il n'est généralement pas recommandé d'ignorer les validations de cette manière. Cette technique doit être utilisée avec prudence !
:::
