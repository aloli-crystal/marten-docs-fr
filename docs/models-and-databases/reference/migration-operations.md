---
title: Opérations de migration
description: Référence des opérations de migration.
---

Cette page fournit une référence pour toutes les opérations de migration disponibles qui peuvent être utilisées lors de l'écriture de migrations.

## `add_column`

L'opération `add_column` permet d'ajouter une colonne à une table existante. Elle doit être appelée avec un nom de table comme premier argument, suivi d'une définition de colonne (nom de colonne et attributs).

Par exemple :

```crystal
add_column :test_table, :foo, :string, max_size: 255
add_column :test_table, :new_id, :reference, to_table: :target_table, to_column: :id
```

## `add_index`

L'opération `add_index` permet d'ajouter un index à une table existante. Elle doit être appelée avec un nom de table comme premier argument, suivi d'une définition d'index (nom d'index et noms de colonnes indexées).

Par exemple :

```crystal
add_index :test_table, :test_index, [:foo, :bar]
```

## `add_unique_constraint`

L'opération `add_unique_constraint` permet d'ajouter une contrainte d'unicité à une table existante. Elle doit être appelée avec un nom de table comme premier argument, suivi d'une définition de contrainte d'unicité (nom de la contrainte et noms de colonnes ciblées).

Par exemple :

```crystal
add_unique_constraint :test_table, :test_constraint, [:foo, :bar]
```

## `change_column`

L'opération `change_column` permet de modifier une définition de colonne existante. Elle doit être appelée avec un nom de table comme premier argument, suivi d'une définition de colonne (nom de colonne et attributs).

Par exemple :

```crystal
change_column :test_table, :test_column, :string, max_size: 155, null: true
```

## `create_table`

L'opération `create_table` permet de créer une nouvelle table, incluant les définitions de colonnes sous-jacentes, les index et les contraintes d'unicité. Elle doit être appelée avec un nom de table comme premier argument et nécessite un bloc où les colonnes, index et contraintes d'unicité sont définis.

Par exemple :

```crystal
create_table :test_table do
  column :id, :big_int, primary_key: true, auto: true
  column :foo, :int, null: true
  column :bar, :int, null: true

  unique_constraint :cname, [:foo, :bar]
  index :index_name, [:foo, :bar]
end
```

## `delete_table`

L'opération `delete_table` permet de supprimer une table existante. Elle doit être appelée avec un nom de table comme premier argument.

Par exemple :

```crystal
delete_table :test_table
```

## `execute`

L'opération `execute` permet d'exécuter des instructions SQL personnalisées dans le cadre d'une migration. Elle doit être appelée avec une instruction d'application comme premier argument positionnel, et elle peut également prendre un second argument positionnel afin de spécifier l'instruction à exécuter lors de l'annulation de la migration.

Par exemple :

```crystal
execute(
  (
    <<-SQL
      SELECT 1
      SQL
  ),
  (
    <<-SQL
      SELECT 2
      SQL
  )
)
```

## `remove_column`

L'opération `remove_column` permet de supprimer une colonne existante d'une table. Elle doit être appelée avec un nom de table comme premier argument, suivi d'un nom de colonne.

Par exemple :

```crystal
remove_column :test_table, :test_column
```

## `remove_index`

L'opération `remove_index` permet de supprimer un index existant d'une table. Elle doit être appelée avec un nom de table comme premier argument, suivi d'un nom d'index.

Par exemple :

```crystal
remove_index :test_table, :test_index
```

## `remove_unique_constraint`

L'opération `remove_unique_constraint` permet de supprimer une contrainte d'unicité existante d'une table. Elle doit être appelée avec un nom de table comme premier argument, suivi d'un nom de contrainte d'unicité.

Par exemple :

```crystal
remove_unique_constraint :test_table, :test_constraint
```

## `rename_column`

L'opération `rename_column` permet de renommer une colonne existante dans une table. Elle doit être appelée avec un nom de table comme premier argument, suivi de l'ancien nom de colonne et du nouveau.

Par exemple :

```crystal
rename_column :test_table, :old_column, :new_column
```

## `rename_table`

L'opération `rename_table` permet de renommer une table existante. Elle doit être appelée avec le nom de table existant comme premier argument, suivi du nouveau nom de table.

Par exemple :

```crystal
rename_table :old_table, :new_table
```

## `run_code`

L'opération `run_code` permet de définir que des méthodes arbitraires seront appelées lors de l'application et de l'annulation d'une migration. Elle doit être appelée avec un nom de méthode comme premier argument positionnel (la méthode qui sera appelée lors de l'application de la migration), et elle peut également prendre un argument supplémentaire afin de spécifier le nom de la méthode à exécuter lors de l'annulation de la migration.

Par exemple :

```crystal
run_code :run_forward_code, :run_backward_code
```
