---
title: Déployer sur Fly.io
description: Apprenez à déployer un projet Marten sur Fly.io.
---

Ce guide couvre comment déployer un projet Marten sur [Fly.io](https://fly.io).

## Prérequis

Pour compléter les étapes de ce guide, vous aurez besoin de :

* Un compte actif sur [Fly.io](https://fly.io).
* Le CLI Fly.io [installé](https://fly.io/docs/hands-on/install-flyctl/) et correctement [configuré](https://fly.io/docs/getting-started/log-in-to-fly/).
* Un projet Marten fonctionnel.

## Rendre votre projet Marten prêt pour Fly.io

Avant de créer l'application Fly.io, il est important de s'assurer que votre projet est correctement configuré pour le déploiement sur Fly.io. Cette section décrit quelques étapes pour s'assurer que votre projet peut être déployé sur Fly.io sans problèmes.

### Créer un `Dockerfile`

Nous déploierons notre projet Marten sur Fly.io en utilisant une [stratégie Dockerfile](https://fly.io/docs/languages-and-frameworks/dockerfile/). Un `Dockerfile` est un fichier texte qui contient un ensemble d'instructions pour construire une image [Docker](https://www.docker.com/). Il inclut typiquement une image de base, des commandes pour installer les dépendances, et des étapes pour configurer l'environnement et copier les fichiers dans l'image.

Votre `Dockerfile` devrait être placé à la racine du dossier de votre projet et devrait contenir le contenu suivant au minimum :

```Dockerfile title="Dockerfile"
FROM crystallang/crystal:latest
WORKDIR /app
COPY . .

ENV MARTEN_ENV=production

RUN apt-get update
RUN apt-get install -y curl cmake build-essential

RUN shards install
RUN bin/marten collectassets --no-input
RUN crystal build manage.cr -o bin/manage
RUN crystal build src/server.cr -o bin/server --release

CMD ["/app/bin/server"]
```

Comme vous pouvez le voir, ce Dockerfile construit une image Docker basée sur la dernière version de l'image du langage de programmation Crystal. Il installe également les dépendances Crystal de votre projet, exécute la commande de gestion [`collectassets`](../../development/reference/management-commands.md) et compile le binaire de votre serveur.

Il convient de noter que ce Dockerfile pourrait effectuer des opérations supplémentaires si nécessaire. Par exemple, certains projets peuvent nécessiter Node.js pour installer des dépendances supplémentaires et construire les assets de votre projet. Cela pourrait être réalisé avec les ajouts suivants :

```Dockerfile title="Dockerfile"
FROM crystallang/crystal:latest
WORKDIR /app
COPY . .

ENV MARTEN_ENV=production

RUN apt-get update
RUN apt-get install -y curl cmake build-essential
// highlight-next-line
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
// highlight-next-line
RUN apt-get install -y nodejs
// highlight-next-line

// highlight-next-line
RUN npm install
// highlight-next-line
RUN npm run build

RUN shards install
RUN bin/marten collectassets --no-input
RUN crystal build manage.cr -o bin/manage
RUN crystal build src/server.cr -o bin/server --release

CMD ["/app/bin/server"]
```

### Configurer l'hôte et le port du serveur de production

Vous devriez vous assurer que votre serveur de production peut être accédé depuis d'autres conteneurs, et sur un port spécifique. Pour ce faire, il est important de définir le paramètre [`host`](../../development/reference/settings.md#host) sur `0.0.0.0` et le paramètre [`port`](../../development/reference/settings.md#port) sur une valeur spécifique comme `8000` (qui est le port que nous utiliserons tout au long de ce guide).

Cela peut être réalisé en mettant à jour votre fichier de paramètres de production `config/settings/production.cr` comme suit :

```crystal title="config/settings/production.cr"
Marten.configure :production do |config|
  config.host = "0.0.0.0"
  config.port = 8000

  # Autres paramètres...
end
```

### Configurer les paramètres clés depuis les variables d'environnement

Lors du déploiement sur Fly.io, vous devrez définir quelques variables d'environnement (plus tard dans ce guide) qui seront utilisées pour remplir les paramètres clés. Cela devrait être le cas pour les paramètres [`secret_key`](../../development/reference/settings.md#secret_key) et [`allowed_hosts`](../../development/reference/settings.md#allowed_hosts) au minimum.

Ainsi, il est important de s'assurer que votre projet remplit ces paramètres en lisant leurs valeurs dans les variables d'environnement correspondantes. Cela peut être réalisé en mettant à jour votre fichier de paramètres de production `config/settings/production.cr` comme suit :

```crystal title="config/settings/production.cr"
Marten.configure :production do |config|
  config.secret_key = ENV.fetch("MARTEN_SECRET_KEY", "")
  config.allowed_hosts = ENV.fetch("MARTEN_ALLOWED_HOSTS", "").split(",")

  # Autres paramètres...
end
```

Il convient de noter que si votre application nécessite une base de données, vous devriez également vous assurer d'analyser la variable d'environnement `DATABASE_URL` et de configurer vos [paramètres de base de données](../../development/reference/settings.md#database-settings) à partir des propriétés de l'URL de base de données analysée. La variable `DATABASE_URL` contient une chaîne encodée en URL qui spécifie les détails de connexion de votre base de données, comme le type de base de données, le nom d'hôte, le port, le nom d'utilisateur, le mot de passe et le nom de la base de données.

Cela peut être accompli comme suit pour une base de données PostgreSQL :

```crystal title="config/settings/production.cr"
Marten.configure :production do |config|
  if ENV.has_key?("DATABASE_URL")
    # Note: DATABASE_URL n'est pas disponible au moment de la compilation...
    config.database url: ENV.fetch("DATABASE_URL") do |db|
      # Le Postgres de Fly.io fonctionne sur un réseau interne et chiffré qui ne supporte pas SSL.
      # Par conséquent, SSL doit être désactivé.
      db.options = {"sslmode" => "disable"}
    end
  end

  # Autres paramètres...
end
```

### Optionnel : configurer le middleware de service d'assets

Afin de servir facilement les assets de votre application sur Fly.io, vous pouvez utiliser le middleware [`Marten::Middleware::AssetServing`](../../handlers-and-http/reference/middlewares.md#asset-serving-middleware). En effet, il ne sera pas possible de configurer un serveur web comme [Nginx](https://nginx.org) pour servir directement vos assets sur Fly.io si vous avez l'intention d'utiliser un store d'assets "système de fichiers local" (comme [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html)).

Pour pallier cela, vous pouvez utiliser le middleware [`Marten::Middleware::AssetServing`](../../handlers-and-http/reference/middlewares.md#asset-serving-middleware). Évidemment, cela n'est pas nécessaire si vous avez l'intention d'utiliser un fournisseur de stockage cloud (comme Amazon S3 ou GCS) pour stocker et servir vos assets collectés (dans ce cas, vous pouvez simplement passer cette section).

Pour utiliser ce middleware, vous pouvez "insérer" la classe correspondante au début du paramètre [`middleware`](../../development/reference/settings.md#middleware) lors de la définition des paramètres de production. Par exemple :

```crystal
Marten.configure :production do |config|
  config.middleware.unshift(Marten::Middleware::AssetServing)

  # Autres paramètres...
end
```

Le middleware servira les assets collectés disponibles sous la racine des assets (paramètre [`assets.root`](../../development/reference/settings.md#root)). Il est également important de noter que le paramètre [`assets.url`](../../development/reference/settings.md#url) doit correspondre au domaine de l'application Marten ou correspondre à un chemin d'URL relatif (ex. `/assets/`) pour que ce middleware fonctionne correctement.

## Créer l'application Fly.io

Pour commencer, l'action initiale requise est de générer votre application Fly.io elle-même. Cela peut être réalisé en exécutant la commande `fly launch` comme suit :

```bash
fly launch --no-deploy --no-cache --internal-port 8000 --name <yourapp> --env MARTEN_ALLOWED_HOSTS=<yourapp>.fly.dev
```

La commande ci-dessus crée une application Fly.io dont le port interne est défini sur `8000` tout en s'assurant que la variable d'environnement `MARTEN_ALLOWED_HOSTS` est définie sur le futur domaine de votre application. La commande vous demandera de choisir une [région](https://fly.io/docs/reference/regions/) spécifique pour votre application et créera un fichier `fly.toml` dont le contenu devrait ressembler à ceci :

```toml title="fly.toml"
app = "<yourapp>"
primary_region = "<yourregion>"

[env]
  MARTEN_ALLOWED_HOSTS = "<yourapp>.fly.dev"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
```

Le `fly.toml` est un fichier de configuration utilisé par Fly.io pour savoir comment déployer votre application sur la plateforme Fly.io.

:::info
Dans ce guide, l'espace réservé `<yourapp>` fait référence au nom de l'application Fly.io que vous avez choisi pour votre projet. Vous devriez remplacer `<yourapp>` par le nom réel de votre application dans toutes les commandes et extraits de code pertinents mentionnés dans ce guide.
:::

## Configurer les secrets d'environnement

Il est recommandé de définir la variable d'environnement `MARTEN_SECRET_KEY` afin de remplir le paramètre [`secret_key`](../../development/reference/settings.md#secret_key), comme mentionné dans [Configurer les paramètres clés depuis les variables d'environnement](#configurer-les-paramètres-clés-depuis-les-variables-denvironnement).

Fly.io offre la possibilité de définir de telles valeurs de paramètres sensibles en utilisant des [secrets au runtime](https://fly.io/docs/reference/secrets/). Dans cette optique, nous pouvons créer un secret `MARTEN_SECRET_KEY` en utilisant la commande `fly secrets` comme suit :

```bash
fly secrets set MARTEN_SECRET_KEY=$(openssl rand -hex 16)
```

## Configurer une base de données

Vous devrez provisionner une base de données PostgreSQL Fly.io si votre application utilise des modèles et des migrations (sinon vous pouvez passer cette étape !).

Dans cette optique, vous devez d'abord créer un cluster PostgreSQL avec la commande suivante :

```bash
fly pg create --name <yourapp>-db
```

Ensuite, vous devrez "attacher" le cluster PostgreSQL que vous venez de créer à votre application réelle. Cela peut être réalisé avec la commande suivante :

```bash
fly postgres attach <yourapp>-db --app <yourapp>
```

De plus, vous voudrez vous assurer que les migrations sont automatiquement appliquées à chaque fois que votre projet est déployé. Pour ce faire, vous pouvez mettre à jour le fichier `fly.toml` qui a été généré précédemment et y ajouter la section suivante :

```toml title="fly.toml"
app = "<yourapp>"
primary_region = "<yourregion>"

[env]
  MARTEN_ALLOWED_HOSTS = "<yourapp>.fly.dev"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

// highlight-next-line
[deploy]
// highlight-next-line
  release_command = "bin/manage migrate"
```

## Déployer l'application

La dernière étape est de télécharger le code de votre application sur Fly.io. Cela peut être fait en utilisant la commande suivante :

```bash
fly deploy
```

Il est important de mentionner que quelques choses se produiront lorsque vous pousserez le code de votre application sur Fly.io comme dans l'exemple ci-dessus. En effet, Fly.io construira une image Docker de votre application basée sur le `Dockerfile` que vous avez défini [précédemment](#créer-un-dockerfile) puis la poussera vers le registre Fly.io (un registre Docker privé maintenu par Fly.io). Une fois cela fait, il lancera un conteneur Docker en utilisant l'image Docker obtenue, puis routera le trafic entrant vers le conteneur en cours d'exécution.
