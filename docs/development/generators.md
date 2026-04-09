---
title: Générateurs
description: Apprenez à utiliser les générateurs dans Marten.
---

Marten dispose d'un mécanisme de générateurs qui simplifie la création de diverses abstractions, fichiers et structures au sein d'un projet existant. Cette fonctionnalité facilite la génération de composants clés tels que les [modèles](../models-and-databases/introduction.md), les [schemas](../schemas/introduction.md), les [emails](../emailing/introduction.md) ou les [applications](./applications.md). En tirant parti des générateurs, les développeurs peuvent améliorer leur flux de travail et accélérer le développement de leurs projets Marten tout en suivant les bonnes pratiques.

## Utilisation

Les générateurs peuvent être invoqués en utilisant la commande de gestion [`marten gen`](./reference/management-commands.md#gen). Cette commande est destinée à être utilisée comme suit :

```bash
marten gen [generator] [options] [arguments]
```

Comme vous pouvez le voir, la commande `marten gen` doit être utilisée avec un nom de **générateur** spécifique, éventuellement suivi d'**options** et d'**arguments** (qui peuvent être requis ou non selon le générateur considéré). Tous les générateurs intégrés sont listés dans la [référence des générateurs](./reference/generators.md).

### Afficher les informations d'aide

Vous pouvez afficher les informations d'aide d'un générateur spécifique en utilisant la commande `marten gen` comme suit :

```bash
marten gen [generator] --help
```

### Lister les générateurs

Il est possible de lister tous les générateurs disponibles dans un projet en exécutant la commande `marten gen` comme suit :

```bash
marten gen
```

Cela devrait produire quelque chose comme ceci :

```
Usage: marten gen [options] [generator]

Generate various structures, abstractions, and values within an existing project.

Arguments:
    generator                        Name of the generator to use

Options:
    --error-trace                    Show full error trace (if a compilation is involved)
    --no-color                       Disable colored output
    -h, --help                       Show this help

Available generators are listed below.

[marten]

  › app
  › auth
  › email
  › handler
  › model
  › schema
  › secretkey

Run a generator followed by --help to see generator specific information, ex:
marten gen [generator] --help
```

## Exemples

### Générer un modèle

La génération d'un modèle peut être réalisée avec le générateur [`model`](./reference/generators.md#model) :

```bash
# Générer un modèle dans l'application principale :
marten gen model User name:string email:string

# Générer un modèle dans l'application admin :
marten gen model User name:string email:string --app admin

# Générer un modèle avec une référence many-to-one :
marten gen model Article label:string body:text author:many_to_one{User}

# Générer un modèle avec une classe parente :
marten gen model Admin::User name:string email:string --parent User

# Générer un modèle sans timestamps :
marten gen model User name:string email:string --no-timestamps
```

### Générer un email

La génération d'un email peut être réalisée avec le générateur [`email`](./reference/generators.md#email) :

```bash
marten gen email TestEmail            # Générer un nouvel email TestEmail dans l'application principale
marten gen email TestEmail --app blog # Générer un nouvel email TestEmail dans l'application blog
```

### Générer une application

La génération d'une application peut être réalisée avec le générateur [`app`](./reference/generators.md#app) :

```bash
marten gen app blogging # Générer une nouvelle application 'blogging'
```

## Générateurs disponibles

Veuillez vous rendre sur la [référence des générateurs](./reference/generators.md) pour voir la liste de tous les générateurs disponibles.
