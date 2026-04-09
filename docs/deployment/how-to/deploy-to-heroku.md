---
title: Déployer sur Heroku
description: Apprenez à déployer un projet Marten sur Heroku.
---

Ce guide couvre comment déployer un projet Marten sur [Heroku](https://heroku.com).

## Prérequis

Pour compléter les étapes de ce guide, vous aurez besoin de :

* Un compte actif sur [Heroku](https://heroku.com).
* Le [CLI Heroku](https://devcenter.heroku.com/articles/heroku-cli) installé et correctement configuré.
* Un projet Marten fonctionnel.

## Rendre votre projet Marten prêt pour Heroku

Avant de créer l'application Heroku, il est important de s'assurer que votre projet est correctement configuré pour le déploiement sur Heroku. Cette section décrit quelques étapes nécessaires pour s'assurer que votre projet peut être déployé sur Heroku sans problèmes.

### Créer un `Procfile`

Vous devez d'abord vous assurer que votre projet définit un [`Procfile`](https://devcenter.heroku.com/articles/procfile), à la racine du dossier de votre projet. Un Procfile spécifie les commandes que les dynos Heroku exécutent, définissant les types de processus comme les serveurs web et les workers en arrière-plan.

Votre Procfile devrait contenir le contenu suivant au minimum :

```procfile title="Procfile"
web: bin/server --port $PORT
```

:::info
La variable d'environnement `PORT` est automatiquement définie par Heroku. C'est pourquoi nous devons nous assurer que sa valeur est transmise à votre serveur.
:::

Si votre application nécessite l'utilisation d'une base de données, vous devriez également ajouter un [processus de release](https://devcenter.heroku.com/articles/procfile#the-release-process-type) qui exécute la commande de gestion [`migrate`](../../development/reference/management-commands.md#migrate) à votre Procfile :

```procfile title="Procfile"
web: bin/server --port $PORT
release: marten migrate
```

Cela garantira que votre base de données est correctement migrée lors de chaque déploiement.

### Configurer le chemin racine

Lors du déploiement sur Heroku, votre application est préparée et compilée dans un répertoire temporaire, qui est distinct de l'emplacement où le serveur exécute votre application. Plus précisément, la racine de votre application sera disponible sous le dossier `/app` sur la plateforme Heroku. Il est important de garder cela à l'esprit lors de la configuration de votre application pour le déploiement sur Heroku.

Le [mécanisme d'application](../../development/applications.md) de Marten s'appuie fortement sur les chemins pour localiser des choses comme les [templates](../../templates.mdx), les [traductions](../../i18n.mdx) ou les [assets](../../assets.mdx). Comme le chemin où votre application est compilée sera différent du chemin où elle s'exécute, nous devons nous assurer que vous configurez explicitement Marten pour qu'il puisse trouver la structure de votre projet.

Pour résoudre cela, nous devons définir un "chemin racine" spécifique pour votre projet en production. Le chemin racine spécifie l'emplacement réel des sources du projet dans votre système. Cela peut s'avérer utile dans les scénarios où le projet a été compilé dans un emplacement spécifique différent de la destination finale où les sources du projet (et le dossier `lib`) sont copiés, ce qui est le cas avec Heroku.

Dans cette optique, nous pouvons définir le paramètre [`root_path`](../../development/reference/settings.md#root_path) sur `/app` comme suit :

```crystal title="config/settings/production.cr"
Marten.configure :production do |config|
  config.root_path = "/app"

  # Autres paramètres...
end
```

Comme souligné dans l'exemple ci-dessus, cela devrait être fait dans votre fichier de paramètres "production".

### Configurer les paramètres clés depuis les variables d'environnement

Lors du déploiement sur Heroku, vous devrez définir quelques variables d'environnement (plus tard dans ce guide) qui seront utilisées pour remplir les paramètres clés. Cela devrait être le cas pour les paramètres [`secret_key`](../../development/reference/settings.md#secret_key) et [`allowed_hosts`](../../development/reference/settings.md#allowed_hosts) au minimum.

Ainsi, il est important de s'assurer que votre projet remplit ces paramètres en lisant leurs valeurs dans les variables d'environnement correspondantes. Cela peut être réalisé en mettant à jour votre fichier de paramètres de production `config/settings/production.cr` comme suit :

```crystal title="config/settings/production.cr"
Marten.configure :production do |config|
  config.secret_key = ENV.fetch("MARTEN_SECRET_KEY")
  config.allowed_hosts = ENV.fetch("MARTEN_ALLOWED_HOSTS", "").split(",")

  # Autres paramètres...
end
```

Il convient de noter que si votre application nécessite une base de données, vous devriez également vous assurer d'analyser la variable d'environnement `DATABASE_URL` et de configurer vos [paramètres de base de données](../../development/reference/settings.md#database-settings) à partir des propriétés de l'URL de base de données analysée. La variable `DATABASE_URL` contient une chaîne encodée en URL qui spécifie les détails de connexion de votre base de données, comme le type de base de données, le nom d'hôte, le port, le nom d'utilisateur, le mot de passe et le nom de la base de données.

Cela peut être accompli en fournissant la valeur de la variable d'environnement `DATABASE_URL` à la méthode de configuration [`#database`](pathname:///api/dev/Marten/Conf/GlobalSettings.html#database%28id%3DDB%3A%3AConnection%3A%3ADEFAULT_CONNECTION_NAME%2Curl%3AString%7CNil%3Dnil%29-instance-method) :

```crystal title="config/settings/production.cr"
Marten.configure :production do |config|
  config.database url: ENV.fetch("DATABASE_URL")

  # Autres paramètres...
end
```

### Optionnel : configurer le middleware de service d'assets

Afin de servir facilement les assets de votre application sur Heroku, vous pouvez utiliser le middleware [`Marten::Middleware::AssetServing`](../../handlers-and-http/reference/middlewares.md#asset-serving-middleware). En effet, il ne sera pas possible de configurer un serveur web comme [Nginx](https://nginx.org) pour servir directement vos assets sur Heroku si vous avez l'intention d'utiliser un store d'assets "système de fichiers local" (comme [`Marten::Core::Store::FileSystem`](pathname:///api/dev/Marten/Core/Storage/FileSystem.html)).

Pour pallier cela, vous pouvez utiliser le middleware [`Marten::Middleware::AssetServing`](../../handlers-and-http/reference/middlewares.md#asset-serving-middleware). Évidemment, cela n'est pas nécessaire si vous avez l'intention d'utiliser un fournisseur de stockage cloud (comme Amazon S3 ou GCS) pour stocker et servir vos assets collectés (dans ce cas, vous pouvez simplement passer cette section).

Pour utiliser ce middleware, vous pouvez "insérer" la classe correspondante au début du paramètre [`middleware`](../../development/reference/settings.md#middleware) lors de la définition des paramètres de production. Par exemple :

```crystal
Marten.configure :production do |config|
  config.middleware.unshift(Marten::Middleware::AssetServing)

  # Autres paramètres...
end
```

Le middleware servira les assets collectés disponibles sous la racine des assets (paramètre [`assets.root`](../../development/reference/settings.md#root)). Il est également important de noter que le paramètre [`assets.url`](../../development/reference/settings.md#url) doit correspondre au domaine de l'application Marten ou correspondre à un chemin d'URL relatif (ex. `/assets/`) pour que ce middleware fonctionne correctement.

## Créer l'application Heroku

Pour commencer, l'action initiale requise est de générer votre application Heroku elle-même. Cela peut être réalisé en exécutant la commande `heroku create` comme suit :

```bash
heroku create <yourapp>
```

:::info
Dans ce guide, l'espace réservé `<yourapp>` fait référence au nom de l'application Heroku que vous avez choisi pour votre projet. Vous devriez remplacer `<yourapp>` par le nom réel de votre application dans toutes les commandes et extraits de code pertinents mentionnés dans ce guide.
:::

## Configurer les buildpacks requis

Heroku utilise des [buildpacks](https://devcenter.heroku.com/articles/buildpacks) pour "compiler" les applications web (ce qui peut inclure l'installation de dépendances, la compilation de binaires réels, etc). Dans le contexte d'un projet Marten, il est recommandé d'utiliser deux buildpacks :

1. Premièrement, le [buildpack officiel Node.js](https://github.com/heroku/heroku-buildpack-nodejs) pour "construire" les assets de votre projet.
2. Deuxièmement, le [buildpack officiel Marten](https://github.com/martenframework/heroku-buildpack-marten) pour (i) compiler le binaire de votre serveur, (ii) compiler le CLI Marten, et (iii) [collecter les assets](../../assets/introduction.md).

La séquence des buildpacks appliqués pendant le processus de déploiement est critique : le buildpack Node.js doit être le premier appliqué, pour s'assurer que Heroku peut initier les installations et configurations Node.js nécessaires. Cette approche garantira que lorsque le buildpack Marten est activé, les assets auront déjà été créés et sont prêts à être "collectés" via la commande de gestion [`collectassets`](../../development/reference/management-commands.md#collectassets).

Vous pouvez vous assurer que ces buildpacks sont utilisés en exécutant les commandes suivantes :

```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/martenframework/heroku-buildpack-marten
```

:::tip
Il est important de mentionner que l'utilisation du [buildpack officiel Node.js](https://github.com/heroku/heroku-buildpack-nodejs) est complètement optionnelle : vous ne devriez l'utiliser que si votre projet utilise Node.js pour construire des assets.
:::

## Configurer les variables d'environnement

### `MARTEN_ENV`

Au moins une variable d'environnement doit être configurée pour s'assurer que votre projet Marten fonctionne en mode production sur Heroku : la variable `MARTEN_ENV`. Cette variable détermine l'environnement actuel (et les paramètres associés à appliquer).

Pour définir cette variable d'environnement, vous pouvez utiliser la commande `heroku config:set` comme suit :

```bash
heroku config:set MARTEN_ENV=production
```

### `MARTEN_SECRET_KEY`

Il est également recommandé de définir la variable d'environnement `MARTEN_SECRET_KEY` afin de remplir le paramètre [`secret_key`](../../development/reference/settings.md#secret_key), comme mentionné dans [Configurer les paramètres clés depuis les variables d'environnement](#configurer-les-paramètres-clés-depuis-les-variables-denvironnement).

Pour définir cette variable d'environnement, vous pouvez utiliser la commande `heroku config:set` comme suit :

```bash
heroku config:set MARTEN_SECRET_KEY=$(openssl rand -hex 16)
```

### `MARTEN_ALLOWED_HOSTS`

Enfin, nous voulons nous assurer que le paramètre [`allowed_hosts`](../../development/reference/settings.md#allowed_hosts) contient le domaine réel de votre application Heroku, ce qui est requis dans le cadre du [mécanisme de protection contre les attaques par en-tête HTTP Host](../../security/introduction.md#protection-contre-les-attaques-par-en-tête-http-host) de Marten.

Pour définir cette variable d'environnement, vous pouvez utiliser la commande suivante :

```bash
heroku config:set MARTEN_ALLOWED_HOSTS=<yourapp>.herokuapp.com
```

## Configurer une base de données

Vous devrez provisionner une base de données PostgreSQL Heroku si votre application utilise des modèles et des migrations. Pour ce faire, vous pouvez utiliser la commande suivante :

```bash
heroku addons:create heroku-postgresql:essential-0
```

:::info
Vous devriez remplacer `essential-0` dans la commande ci-dessus par le [plan Postgres](https://devcenter.heroku.com/articles/heroku-postgres-plans) souhaité.
:::

## Télécharger l'application

La dernière étape est de télécharger le code de votre application sur Heroku. Cela peut être fait en utilisant la commande standard `git push` pour copier la branche `main` locale vers la branche `main` sur Heroku :

```bash
git push heroku main
```

Il est important de mentionner que quelques choses se produiront lorsque vous pousserez le code de votre application sur Heroku comme dans l'exemple ci-dessus. En effet, Heroku détectera le type de votre application et appliquera les buildpacks que vous [avez configurés précédemment](#configurer-les-buildpacks-requis) (c'est-à-dire d'abord celui de Node.js puis celui de Marten). Dans le cadre de cette étape, les dépendances de votre application seront installées et votre projet sera compilé. Si vous avez défini un processus `release` dans votre `Procfile` (comme expliqué dans [Créer un Procfile](#créer-un-procfile)), la commande spécifiée sera également exécutée (par exemple pour exécuter les migrations de votre projet).

Quelques éléments supplémentaires devraient également être notés :

* Le binaire du serveur compilé sera placé sous le chemin `bin/server`.
* Le fichier `manage.cr` de votre projet sera également compilé et sera disponible en appelant simplement la commande `marten`. Cela signifie que vous pouvez exécuter `marten <command>` si vous devez appeler des [commandes de gestion](../../development/management-commands.md) spécifiques.
* Le buildpack Marten appellera automatiquement la commande de gestion [`collectassets`](../../development/reference/management-commands.md#collectassets) pour collecter les [assets](../../assets/introduction.md) de votre projet et les copier vers le stockage d'assets configuré. Vous pouvez définir la variable d'environnement `DISABLE_COLLECTASSETS` sur `1` si vous ne voulez pas ce comportement.

## Exécuter des commandes de gestion

Si vous devez exécuter des [commandes de gestion](../../development/management-commands.md) supplémentaires dans votre application provisionnée, vous pouvez utiliser la commande `heroku run`. Par exemple :

```bash
heroku run marten listmigrations
```
