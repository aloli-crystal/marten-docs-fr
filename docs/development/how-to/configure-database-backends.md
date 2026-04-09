---
title: Configurer les backends de base de données
description: Comment configurer les backends de base de données.
---

Ce guide fournit des instructions pour configurer de nouveaux backends de base de données ou changer le backend de base de données existant dans vos projets Marten existants.

## Contexte

Marten prend officiellement en charge les bases de données **MariaDB**, **MySQL**, **PostgreSQL** et **SQLite3**. Les nouveaux projets Marten utilisent par défaut une base de données SQLite3, une application de base de données légère sans serveur qui est généralement préinstallée sur la plupart des systèmes d'exploitation existants. Cela en fait un excellent choix pour une base de données de développement ou de test, mais vous pourriez vouloir utiliser une base de données plus puissante comme MariaDB, MySQL ou PostgreSQL. Dans cette optique, ce guide explique quelles étapes doivent être suivies pour utiliser le backend de base de données de votre choix dans un projet Marten.

## Prérequis

Ce guide suppose que vous disposez déjà d'un projet Marten fonctionnel. Si ce n'est pas le cas, vous pouvez facilement en créer un en utilisant la commande suivante :

```bash
marten new project
```

De plus, il suppose que votre base de données préférée est correctement configurée et prête à l'emploi. Si ce n'est pas le cas, veuillez consulter la documentation officielle respective pour installer la base de données de votre choix :

* [Guide d'installation PostgreSQL](https://wiki.postgresql.org/wiki/Detailed_installation_guides)
* [Guide d'installation MariaDB](https://mariadb.com/kb/en/getting-installing-and-upgrading-mariadb)
* [Guide d'installation MySQL](https://dev.mysql.com/doc/refman/8.0/en/installing.html)
* [Guide d'installation SQLite](https://www.tutorialspoint.com/sqlite/sqlite_installation.htm)

## Installer le bon shard de base de données

Pour chaque base de données, un shard Crystal dédié est requis. Selon la base de données choisie, vous devez inclure l'une des entrées suivantes dans le fichier `shard.yml` de votre projet :

* [crystal-pg](https://github.com/will/crystal-pg) (requis pour les bases de données PostgreSQL)
* [crystal-mysql](https://github.com/crystal-lang/crystal-mysql) (requis pour les bases de données MariaDB ou MySQL)
* [crystal-sqlite3](https://github.com/crystal-lang/crystal-sqlite3) (requis pour les bases de données SQLite3)

Cela signifie que votre fichier `shard.yml` devrait ressembler à l'un des exemples suivants :

### MariaDB ou MySQL

```yaml
name: myproject
version: 0.1.0

dependencies:
  marten:
    github: martenframework/marten
  // highlight-next-line
  mysql:
  // highlight-next-line
    github: crystal-lang/crystal-mysql
```

### PostgreSQL

```yaml
name: myproject
version: 0.1.0

dependencies:
  marten:
    github: martenframework/marten
  // highlight-next-line
  pg:
  // highlight-next-line
    github: will/crystal-pg
```

### SQLite3

```yaml
name: myproject
version: 0.1.0

dependencies:
  marten:
    github: martenframework/marten
  // highlight-next-line
  sqlite3:
  // highlight-next-line
    github: crystal-lang/crystal-sqlite3
```

## Ajouter le bon require Crystal pour la base de données

Après avoir inclus le bon shard Crystal dans le fichier `shard.yml` de votre projet, la tâche suivante est d'ajouter le require correspondant dans le fichier `src/project.cr`. Ce fichier contient tous les requires de votre projet (y compris Marten lui-même) et est automatiquement généré par la commande de gestion [`new`](../reference/management-commands.md#new).

Veuillez consulter les exemples ci-dessous pour déterminer quel require vous devez inclure en fonction du backend de base de données sélectionné :

### MariaDB ou MySQL

```crystal
# Third party requirements.
require "marten"
// highlight-next-line
require "mysql"

# Project requirements.
# [...]

# Configuration requirements.
# [...]
```

### PostgreSQL

```crystal
# Third party requirements.
require "marten"
// highlight-next-line
require "pg"
```

### SQLite3

```crystal
# Third party requirements.
require "marten"
// highlight-next-line
require "sqlite3"
```

## Configurer votre base de données

La dernière étape consiste à configurer les paramètres de base de données afin qu'ils ciblent la base de données que vous souhaitez utiliser avec votre projet Marten. Bien qu'une liste complète des options de configuration soit disponible dans la [référence des paramètres de base de données](../reference/settings.md#database-settings), les sections suivantes offrent des exemples de configuration adaptés à chaque backend de base de données pris en charge.

### MariaDB ou MySQL

```crystal
# En utilisant un bloc :
config.database do |db|
  db.backend = :mysql
  db.host = "localhost"
  db.port = 1234
  db.name = "my_db"
  db.user = "my_user"
  db.password = "insecure"
end

# En utilisant une URL de connexion :
config.database url: "mysql://my_user:insecure@localhost:1234/my_db"
```

### PostgreSQL

```crystal
# En utilisant un bloc :
config.database do |db|
  db.backend = :postgresql
  db.host = "localhost"
  db.port = 1234
  db.name = "my_db"
  db.user = "my_user"
  db.password = "insecure"
end

# En utilisant une URL de connexion :
config.database url: "postgres://my_user:insecure@localhost:1234/my_db"
```

### SQLite3

```crystal
# En utilisant un bloc :
config.database do |db|
  db.backend = :sqlite
  db.name = "my_db.db"
end

# En utilisant une URL de connexion :
config.database url: "sqlite3://my_db.db"
```
