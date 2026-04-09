---
title: Bases de données multiples
description: Apprenez à utiliser plusieurs bases de données dans un projet Marten.
---

Cette section explique comment utiliser plusieurs bases de données au sein d'un projet Marten : comment configurer ces bases de données supplémentaires et comment les interroger.

:::caution
Le support des projets multi-bases de données est encore expérimental et manque de fonctionnalités telles que le routage de base de données.
:::

## Définir plusieurs bases de données

Chaque projet Marten utilisant une seule base de données utilise ce qu'on appelle une base de données "par défaut". C'est la base de données dont la configuration est définie lors de l'appel à la méthode de configuration [`#database`](https://martenframework.com/docs/api/dev/Marten/Conf/GlobalSettings.html#database(id%3DDB%3A%3AConnection%3A%3ADEFAULT_CONNECTION_NAME%2C%26)-instance-method) :

```crystal
config.database do |db|
  db.backend = :sqlite
  db.name = "default_db.db"
end
```

La base de données "par défaut" est implicite chaque fois que vous interagissez avec la base de données (par ex. en effectuant des requêtes, en créant des enregistrements, etc.), sauf indication contraire.

La méthode de configuration [`#database`](https://martenframework.com/docs/api/dev/Marten/Conf/GlobalSettings.html#database(id%3DDB%3A%3AConnection%3A%3ADEFAULT_CONNECTION_NAME%2C%26)-instance-method) peut prendre un argument supplémentaire afin de définir des bases de données additionnelles. Par exemple :

```crystal
config.database :other_db do |db|
  db.backend = :sqlite
  db.name = "other_db.db"
end
```

Considérez cet argument supplémentaire comme un "identifiant de base de données" ou un alias que vous pouvez choisir et qui vous permettra d'interagir avec cette base de données spécifique ultérieurement.

## Appliquer les migrations à vos bases de données

La commande de gestion [`migrate`](../development/reference/management-commands.md#migrate) opère sur la base de données "par défaut" par défaut, mais elle accepte également une option `--db` optionnelle qui vous permet de spécifier à quelle base de données les migrations doivent être appliquées. La valeur que vous spécifiez pour cette option doit correspondre à l'alias que vous avez configuré lors de la définition de vos bases de données dans la configuration de votre projet. Par exemple :

```bash
marten migrate --db=other_db
```

Notez que l'exécution d'une telle commande appliquerait **toutes** les migrations à la base de données `other_db`. Il n'existe actuellement aucun moyen de s'assurer que seuls des modèles ou des migrations spécifiques sont appliqués à une base de données particulière.

## Sélectionner manuellement les bases de données

Marten vous permet de sélectionner quelle base de données vous souhaitez utiliser lors de l'exécution d'opérations liées aux modèles. Sauf indication contraire, la base de données "par défaut" est toujours implicite, mais il est possible de définir explicitement à quelle base de données les opérations doivent être appliquées.

### Interroger les enregistrements

Lors de l'interrogation des enregistrements, vous pouvez utiliser la méthode de query set [`#using`](./reference/query-set.md#using) afin de spécifier la base de données cible. Par exemple :

```crystal
Article.all                  # Ciblera la base de données "par défaut"
Article.using(:other_db).all # Ciblera la base de données "other_db"
```

### Persister les enregistrements

Lors de la création, la mise à jour ou la suppression d'enregistrements, il est possible de spécifier à quelle base de données l'opération doit être appliquée en utilisant l'argument `using`. Par exemple :

```crystal
tag = Tag.new(label: "crystal")
tag.save(using: :other_db)
tag.delete(using: :other_db)
```
