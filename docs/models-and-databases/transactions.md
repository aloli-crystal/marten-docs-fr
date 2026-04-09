---
title: Transactions de base de données
description: Apprenez à utiliser les transactions de base de données.
sidebar_label: Transactions
---

Les transactions sont des blocs dont les instructions SQL sous-jacentes sont validées dans la base de données comme une seule action atomique uniquement si elles peuvent s'exécuter sans erreur. Marten fournit quelques mécanismes pour contrôler comment les transactions de base de données sont effectuées et gérées.

## Les bases

Les transactions sont essentielles pour garantir l'intégrité de la base de données. Chaque fois que vous êtes dans une situation où vous avez plus d'une opération SQL qui doit être exécutée ensemble ou pas du tout, vous devriez envisager d'encapsuler toutes ces opérations dans une transaction dédiée. Les blocs de transaction peuvent être créés en utilisant la méthode `#transaction`, qui peut être appelée soit sur des [enregistrements de modèle](pathname:///api/dev/Marten/DB/Model/Connection.html#transaction(using%3ANil|String|Symbol%3Dnil%2C%26block)-instance-method), soit sur des [classes de modèle](pathname:///api/dev/Marten/DB/Model/Connection/ClassMethods.html#transaction(using%3ANil|String|Symbol%3Dnil%2C%26)-instance-method).

Par exemple :

```crystal
MyModel.transaction do
  my_record.save!
  my_other_record.save!
end
```

Avec l'extrait ci-dessus, les deux enregistrements ne seront sauvegardés _que_ si chaque opération de sauvegarde se termine avec succès (c'est-à-dire si aucune exception n'est levée). Si une exception se produit dans le cadre de l'une des opérations de sauvegarde (par ex. si l'un des enregistrements est invalide), alors aucun enregistrement ne sera sauvegardé.

Il est à noter qu'il n'y a aucune différence entre appeler `#transaction` sur [un enregistrement de modèle](pathname:///api/dev/Marten/DB/Model/Connection.html#transaction(using%3ANil|String|Symbol%3Dnil%2C%26block)-instance-method) ou sur [une classe de modèle](pathname:///api/dev/Marten/DB/Model/Connection/ClassMethods.html#transaction(using%3ANil|String|Symbol%3Dnil%2C%26)-instance-method). Il est également intéressant de mentionner que les modèles manipulés au sein d'un bloc de transaction qui résultent en des instructions SQL peuvent être de classes différentes. Par exemple, les deux transactions suivantes seraient équivalentes :

```crystal
MyModel.transaction do
  MyModel.create!(foo: "bar")
  MyOtherModel.create!(foo: "bar")
end

MyOtherModel.transaction do
  MyModel.create!(foo: "bar")
  MyOtherModel.create!(foo: "bar")
end
```

:::info
Lorsque des blocs de transaction sont imbriqués, cela entraîne l'ajout de toutes les instructions de base de données de la transaction interne à la transaction externe. Ainsi, il n'y a qu'une seule transaction "effective" à un moment donné lorsque des blocs de transaction sont imbriqués.
:::

## Transactions automatiques

Les opérations de base de modèle telles que la [création](./introduction.md#créer), la [mise à jour](./introduction.md#mettre-à-jour) ou la [suppression](./introduction.md#supprimer) d'enregistrements sont automatiquement encapsulées dans une transaction. Cela permet de s'assurer que toute exception levée dans le contexte des validations ou dans le cadre de [callbacks](./callbacks.md) `after_*` (c'est-à-dire `after_create`, `after_update`, `after_save` et `after_delete`) entraînera également l'annulation de la transaction en cours.

La conséquence de cela est que les modifications que vous apportez à la base de données dans ces callbacks ne seront pas "visibles" tant que la transaction n'est pas terminée. Par exemple, cela signifie que si vous déclenchez quelque chose (comme un job asynchrone) qui a besoin d'utiliser les modifications introduites par une opération de modèle, alors vous ne devriez probablement pas utiliser les callbacks `after_*` réguliers. À la place, vous devriez utiliser les callbacks [`after_commit`](./callbacks.md#after_commit) (qui sont les seuls callbacks déclenchés _après_ qu'une opération de modèle a été validée dans la base de données).

## Gestion des exceptions et annulations

Comme mentionné précédemment, toute exception levée depuis l'intérieur d'un bloc de transaction entraînera l'annulation de la transaction considérée. De plus, il est à noter que les exceptions levées seront également propagées en dehors du bloc de transaction, ce qui signifie que votre code devrait les intercepter de manière appropriée le cas échéant.

Si vous devez annuler une transaction _manuellement_ depuis l'intérieur d'une transaction elle-même tout en vous assurant qu'aucune exception n'est propagée en dehors du bloc, alors vous pouvez utiliser l'exception [`Marten::DB::Errors::Rollback`](pathname:///api/dev/Marten/DB/Errors/Rollback.html) : lorsque cette exception spécifique est levée depuis l'intérieur d'un bloc de transaction, la transaction sera annulée et le bloc de transaction retournera `false`.

Par exemple :

```crystal
transaction_committed = MyModel.transaction do
  MyModel.create!(foo: "bar")
  MyOtherModel.create!(foo: "bar")

  raise Marten::DB::Errors::Rollback.new("Stop!") if should_rollback?
end

transaction_committed # => false
```
