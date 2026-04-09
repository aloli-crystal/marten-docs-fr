---
title: Commandes de gestion
description: Apprenez les bases de l'outil CLI de gestion de Marten.
sidebar_label: Commandes de gestion
---

Marten est livré avec un outil en ligne de commande (CLI) intégré que les développeurs peuvent utiliser pour effectuer des actions courantes et interagir avec le framework. Cet outil fournit un ensemble de sous-commandes intégrées qui peuvent être facilement étendues avec de nouvelles commandes.

## Utilisation

La commande `marten` est disponible avec chaque installation de Marten, et elle est également compilée automatiquement lorsque le shard Marten est installé. Cela signifie que vous pouvez soit utiliser la commande `marten` depuis n'importe où sur votre système (si le CLI Marten a été installé globalement comme décrit dans [Installation](../getting-started/installation.md)), soit exécuter la commande relative `bin/marten` depuis l'intérieur de la structure de votre projet.

Lorsque la commande `marten` est exécutée, elle recherchera un fichier relatif `manage.cr` pour identifier votre projet actuel, ses [paramètres](./settings.md), et ses [applications](./applications.md) installées, qui à leur tour définiront les sous-commandes disponibles que vous pouvez exécuter.

La commande `marten` est destinée à être utilisée comme suit :

```bash
marten [command] [options] [arguments]
```

Comme vous pouvez le voir, le CLI `marten` doit être utilisé avec une **commande** spécifique, éventuellement suivie d'**options** et d'**arguments** (qui peuvent être requis ou non selon la commande considérée). Toutes les commandes intégrées sont listées dans la [référence des commandes de gestion](./reference/management-commands.md).

### Afficher les informations d'aide

Vous pouvez afficher les informations d'aide d'une commande de gestion spécifique en utilisant le CLI `marten` comme suit :

```bash
marten help [command]
marten [command] --help
```

### Lister les commandes

Il est possible de lister toutes les commandes disponibles dans un projet en exécutant le CLI `marten` comme suit :

```bash
marten help
```

Cela devrait produire quelque chose comme ceci :

```bash
Usage: marten [command] [options] [arguments]

Available commands:

[marten]

  › clearsessions    Clear all expired sessions.
  › collectassets    Collect all the assets and copy them in a unique storage.
  › gen / g          Generate various structures, abstractions, and values within an existing project.
  › genmigrations    Generate new database migrations.
  › listmigrations   List all database migrations.
  › migrate          Run database migrations.
  › new              Initialize a new Marten project or application repository.
  › play             Start a Crystal playground server initialized for the current project.
  › resetmigrations  Reset an existing set of migrations into a single one.
  › routes           Display all the routes of the application.
  › seed             Populate the database by running the seed file.
  › serve / s        Start a development server that is automatically recompiled when source files change.
  › version          Show the Marten version.

Run a command followed by --help to see command specific information, ex:
marten [command] --help
```

Toutes les commandes disponibles sont listées par application : par défaut, seules les commandes `marten` sont listées évidemment (si aucune autre application n'est installée), mais il convient de noter que les [applications](./applications.md) peuvent également contribuer des commandes de gestion. Si c'est le cas, ces commandes supplémentaires seront automatiquement listées aussi.

### Options partagées {#shared-options}

Chaque commande peut accepter son propre ensemble d'arguments et d'options, mais il convient de noter que toutes les commandes disponibles acceptent toujours les options suivantes :

* `--error-trace` - Permet d'afficher la trace d'erreur complète (si une compilation est impliquée)
* `--log-level=level` - Définit le niveau de log (par défaut "info")
* `--no-color` - Désactive les sorties colorées
* `-h, --help` - Affiche les informations d'aide sur la commande considérée

## Commandes disponibles

Veuillez vous rendre sur la [référence des commandes de gestion](./reference/management-commands.md) pour voir la liste de toutes les commandes de gestion disponibles. L'implémentation de commandes de gestion personnalisées est également une possibilité documentée dans [Créer des commandes personnalisées](./how-to/create-custom-commands.md).
