---
title: Applications
description: Apprenez à utiliser les applications pour structurer vos projets.
sidebar_label: Applications
---

Les projets Marten peuvent être organisés en composants logiques et réutilisables appelés "applications". Ces applications peuvent apporter des comportements et des abstractions spécifiques à un projet, notamment des [modèles](../models-and-databases.mdx), des [handlers](../handlers-and-http.mdx), des [schemas](../schemas/introduction.md), des [emails](../emailing/introduction.md) et des [templates](../templates.mdx). Elles peuvent également être empaquetées et réutilisées dans différents projets.

## Vue d'ensemble

Une **application** Marten est un ensemble d'abstractions (définies sous un dossier dédié et unique) qui fournit un ensemble de fonctionnalités. Ces abstractions peuvent correspondre à des [modèles](../models-and-databases.mdx), des [handlers](../handlers-and-http.mdx), des [templates](../templates.mdx), des [schemas](../schemas.mdx), des [emails](../emailing/introduction.md), etc.

Les projets Marten utilisent toujours une ou plusieurs applications. En effet, chaque projet Marten est livré avec une [application principale](#lapplication-principale) par défaut qui correspond au dossier standard `src` : les modèles, migrations ou autres classes définis dans ce dossier sont associés à l'application principale par défaut (à moins qu'ils ne fassent partie d'une autre application _explicitement définie_). Au fur et à mesure que les projets grandissent en taille et en portée, il est généralement encouragé de commencer à penser en termes d'applications et de répartir les modèles, handlers ou fonctionnalités entre plusieurs apps en fonction de leurs responsabilités prévues.

Un autre avantage des applications est qu'elles peuvent être empaquetées et réutilisées dans plusieurs projets. Cela permet aux bibliothèques tierces et aux shards de contribuer facilement des modèles, migrations, handlers ou templates à d'autres projets.

## Utiliser les applications

L'utilisation des applications doit être activée manuellement dans les projets : cela se fait via le paramètre [`installed_apps`](./reference/settings.md#installed_apps).

Ce paramètre correspond à un tableau de classes d'applications installées. En effet, chaque application Marten doit définir une sous-classe de [`Marten::App`](https://martenframework.com/docs/api/dev/Marten/App.html) pour spécifier certaines choses comme le label de l'application (voir [Créer des applications](#créer-des-applications) pour plus d'informations à ce sujet). Lorsque ces sous-classes sont spécifiées dans le paramètre `installed_apps`, les modèles, migrations, assets et templates des applications seront rendus disponibles pour le projet considéré.

Par exemple :

```crystal
Marten.configure do |config|
  config.installed_apps = [
    FooApp,
    BarApp,
  ]
end
```

Ajouter une classe d'application dans ce tableau aura l'impact suivant sur le projet considéré :

* les modèles de cette application et les migrations associées seront utilisés
* les templates de l'application seront rendus disponibles pour le moteur de templates
* les assets de l'application seront rendus disponibles pour le moteur d'assets
* les commandes de gestion définies par l'application seront rendues disponibles dans le CLI Marten

### L'application principale

L'application "principale" est une application par défaut qui est toujours implicitement utilisée par les projets Marten (ce qui signifie qu'elle n'apparaît pas dans le paramètre [`installed_apps`](./reference/settings.md#installed_apps)). Cette application est associée au dossier standard `src` : cela signifie que les modèles, migrations, assets ou templates définis dans ce dossier seront associés à l'application principale par défaut. Par exemple, les modèles définis sous un dossier `src/models` seraient associés à l'application principale.

:::info
L'application principale est associée au label `main`. Cela signifie que les modèles de l'application principale qui ne définissent pas un nom de table explicite auront des noms de table commençant par `main_`.
:::

Il convient de noter qu'il est possible de créer des applications _explicitement définies_ dont les structures résident également sous le dossier `src` : les abstractions (ex. modèles, migrations, etc.) de ces applications seront associées à elles et _non_ à l'application principale. C'est parce que les abstractions sont toujours associées à l'application la plus proche dans la structure de fichiers/dossiers.

En fin de compte, l'application principale offre un moyen pratique de démarrer des projets et de prototyper sans avoir besoin de planifier comment les projets seront organisés en termes d'applications au préalable. Cela dit, au fur et à mesure que les projets grandissent en taille et en portée, il est vraiment encouragé de commencer à penser en termes d'applications et de répartir les abstractions et fonctionnalités entre plusieurs apps en fonction de leurs responsabilités prévues.

### Ordre des applications installées

Vous devez noter que l'ordre dans lequel les applications installées sont définies dans le paramètre [`installed_apps`](./reference/settings.md#installed_apps) peut effectivement avoir de l'importance.

Par exemple, une application "foo" pourrait définir un template `test.html`, et un template similaire avec exactement le même nom pourrait être défini par une application "bar". Si l'application "foo" apparaît avant l'application "bar" dans le tableau des applications installées, alors la demande et le rendu du template `test.html` impliqueront en réalité uniquement le template de l'application "foo". C'est parce que les chargeurs de templates associés aux répertoires d'applications parcourent les applications dans l'ordre dans lequel elles sont définies dans le tableau des applications installées.

C'est pourquoi il est toujours important de _namespacer_ les abstractions, assets, templates et locales lors de la création d'applications. Ne pas le faire expose les apps à des conflits avec le code d'autres applications. Ainsi, dans l'exemple précédent, l'application "foo" aurait dû définir un template `foo/test.html` tandis que l'application "bar" aurait dû définir un template `bar/test.html` pour éviter les conflits possibles.

## Créer des applications

La création d'applications peut se faire très facilement grâce au générateur [`app`](./reference/generators.md#app). Par exemple :

```bash
marten gen app blog
```

L'exécution d'une telle commande ajoutera une nouvelle application `blog` au projet actuel avec la structure suivante :

```
src/blog
├── emails
├── handlers
├── migrations
├── models
├── schemas
├── templates
├── app.cr
└── cli.cr
```

Ces fichiers et dossiers sont décrits ci-dessous :

| Chemin | Description |
| ----------- | ----------- |
| `emails/` | Répertoire vide où les [emails](../emailing/introduction.md) de l'application seront définis. |
| `handlers/` | Répertoire vide où les [handlers de requêtes](../handlers-and-http/introduction.md) de l'application seront définis. |
| `migrations/` | Répertoire vide qui stockera les [migrations](../models-and-databases/migrations.md) qui seront générées pour les modèles de l'application. |
| `models/` | Répertoire vide où les [modèles](../models-and-databases/introduction.md) de l'application seront définis. |
| `schemas/` | Répertoire vide où les [schemas](../schemas/introduction.md) de l'application seront définis. |
| `templates/` | Répertoire vide où les [templates](../templates/introduction.md) de l'application seront définis. |
| `app.cr` | Définition de l'abstraction de configuration de l'application ; c'est également ici que les requirements de fichiers spécifiques à l'application doivent être faits. |
| `cli.cr` | Requirements des fichiers liés au CLI, comme les migrations par exemple. |
| `routes.cr` | Module contenant les [routes](../handlers-and-http/routing.md) de l'application. |

:::tip
Le générateur [`app`](./reference/generators.md#app) s'assure automatiquement que :

* L'application nouvellement créée est ajoutée au paramètre [`installed_apps`](./reference/settings.md#installed_apps). 
* Les requirements pour l'application elle-même sont ajoutés aux fichiers `src/project.cr` et `src/cli.cr`.
* Les routes de l'application sont incluses dans la carte de routes principale (qui se trouve dans le fichier `config/routes.cr`).
:::

Le fichier le plus important d'une application est le fichier `app.cr`. Ce fichier inclut généralement tous les requirements de l'app et définit la classe de configuration de l'application elle-même, qui doit être une sous-classe de la classe abstraite [`Marten::App`](https://martenframework.com/docs/api/dev/Marten/App.html). Cette classe permet principalement de définir l'identifiant "label" de l'application (via la méthode de classe [`#label`](https://martenframework.com/docs/api/dev/Marten/Apps/Config.html#label(label%3AString|Symbol)-class-method)) : cet identifiant doit être unique parmi toutes les applications installées d'un projet et est utilisé pour générer des choses comme les noms de tables de modèles ou les classes de migration.

Voici un exemple de contenu du fichier `app.cr` pour une application hypothétique "blog" :

```crystal
require "./emails/**"
require "./handlers/**"
require "./models/**"
require "./routes"
require "./schemas/**"

module Blog
  class App < Marten::App
    label "blog"
  end
end
```

:::info
L'emplacement du fichier `app.cr` est important : le répertoire où ce fichier est défini est également le répertoire où les dossiers clés comme `models`, `migrations`, `templates`, etc., doivent être présents. Cela est nécessaire pour s'assurer que ces fichiers et abstractions sont associés à l'app considérée.
:::

Un autre fichier très important est le fichier `cli.cr` : ce fichier est là pour définir tous les requirements liés au CLI et sera généralement requis directement par le fichier `manage.cr` de votre projet. _A minima_ le fichier `cli.cr` devrait requérir les migrations de modèles, mais il pourrait aussi requérir les commandes de gestion fournies par l'application. Par exemple :

```crystal
require "./cli/**"
require "./migrations/**"
```

### Définir des paramètres pour les applications

Les applications que vous créez dans le cadre de vos projets ou de bibliothèques tierces peuvent avoir leurs propres paramètres associés, configurables via l'utilisation de [fichiers de paramètres](./settings.md) classiques.

Pour définir des paramètres pour vos applications, la manière la plus simple est de créer un fichier `settings.cr` contenant une sous-classe de [`Marten::Conf::Settings`](https://martenframework.com/docs/api/dev/Marten/Conf/Settings.html) dans le dossier de votre application. Cette sous-classe doit utiliser la macro [`#namespace`](https://martenframework.com/docs/api/dev/Marten/Conf/Settings.html#namespace(ns)-macro) afin de définir le "namespace" du paramètre sous lequel les paramètres de votre application seront accessibles.

Par exemple :

```crystal
module Blog
  class Settings < Marten::Conf::Settings
    namespace :blog

    @my_setting : String = "foo"

    getter my_setting
    setter my_setting
  end
end
```

Avec l'exemple ci-dessus, il sera possible de configurer le paramètre `blog.my_setting` comme suit dans un fichier de paramètres du projet :

```crystal
Marten.configure do |config|
  config.blog.my_setting = "bar"
end
```

Comme vous pouvez le voir, les paramètres de l'application sont configurables comme n'importe quel autre paramètre intégré, mais ils sont namespacés à la valeur de namespace qui a été définie dans la classe `Blog::Settings` via la macro [`#namespace`](https://martenframework.com/docs/api/dev/Marten/Conf/Settings.html#namespace(ns)-macro).

Il est important de noter que les sous-classes de [`Marten::Conf::Settings`](https://martenframework.com/docs/api/dev/Marten/Conf/Settings.html) ont la flexibilité de définir toutes les méthodes nécessaires pour faciliter la configuration utilisateur pour l'application considérée. Alors que les paramètres basiques ne nécessitent généralement que des getters et setters pour la configuration, des scénarios plus complexes peuvent demander des méthodes supplémentaires, l'utilisation de blocs, ou d'autres complexités.
