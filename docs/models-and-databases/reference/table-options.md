---
title: Options de table
description: Référence des options de table.
---

Cette page fournit une référence pour toutes les options de table qui peuvent être utilisées lors de la définition de modèles.

## Nom de la table

Les noms de table pour les modèles sont automatiquement générés à partir du nom du modèle et du label de l'application associée. Cela dit, il est possible de remplacer spécifiquement le nom de la table d'un modèle en utilisant la méthode de classe [`#db_table`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Table/ClassMethods.html#db_table(db_table%3AString|Symbol)-instance-method), qui nécessite une chaîne ou un symbole de nom de table.

Par exemple :

```crystal
class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :content, :text

// highlight-next-line
  db_table :articles
end
```

## Index de table

Les index multi-fields peuvent être configurés dans un modèle en utilisant la méthode de classe [`#db_index`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Table/ClassMethods.html#db_index(name%3AString|Symbol%2Cfield_names%3AArray(String)|Array(Symbol))%3ANil-instance-method). Cette méthode nécessite un argument de nom d'index ainsi qu'un tableau de noms de fields ciblés.

Par exemple :

```crystal
class Person < Marten::Model
  field :id, :int, primary_key: true, auto: true
  field :first_name, :string, max_size: 50
  field :last_name, :string, max_size: 50

// highlight-next-line
  db_index :person_full_name_index, field_names: [:first_name, :last_name]
end
```

## Contraintes d'unicité de table

Les contraintes d'unicité multi-fields peuvent être configurées dans un modèle en utilisant la méthode de classe [`#db_unique_constraint`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Table/ClassMethods.html#db_unique_constraint(name%3AString|Symbol%2Cfield_names%3AArray(String)|Array(Symbol))%3ANil-instance-method). Cette méthode nécessite un argument de nom d'index ainsi qu'un tableau de noms de fields ciblés.

Par exemple :

```crystal
class Booking < Marten::Model
  field :id, :int, primary_key: true, auto: true
  field :room, :string, max_size: 50
  field :date, :date, max_size: 50

// highlight-next-line
  db_unique_constraint :booking_room_date_constraint, field_names: [:room, :date]
end
```
