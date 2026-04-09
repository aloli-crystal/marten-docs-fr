---
title: Gestion des assets
description: Apprenez à gérer les assets.
sidebar_label: Introduction
---

Les applications web ont généralement besoin de servir des « fichiers statiques » ou « assets » : images statiques, fichiers Javascript, fichiers CSS, etc. Marten fournit un ensemble d'aides pour vous aider à gérer les assets, à les référencer et à les téléverser vers des stockages spécifiques.

## Principe et portée

Les fichiers d'assets peuvent être définis à deux endroits :

* ils peuvent être fournis par les [applications](../development/applications.md) : par exemple, certaines applications ont besoin de s'appuyer sur des assets spécifiques pour fournir des interfaces utilisateur complètes
* ils peuvent être définis dans des [dossiers spécifiquement configurés](../development/reference/settings.md#dirs) dans les projets

Cela permet aux applications d'être relativement indépendantes et de s'appuyer sur leurs propres assets si elles en ont besoin, tout en permettant aux projets de définir des assets dans leur structure.

Lorsqu'un projet est déployé, il est attendu que tous ces fichiers d'assets soient « collectés » pour être placés à la destination finale depuis laquelle ils seront servis : cette opération est rendue disponible via l'utilisation de la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets). Cette « destination » dépend de votre stratégie de déploiement : cela peut être aussi simple que déplacer tous ces assets dans un dossier dédié sur votre serveur (pour qu'ils puissent être servis par votre serveur web), ou cela peut impliquer le téléversement de ces assets dans un bucket S3 ou GCS par exemple.

:::info
Le flux d'assets fourni par Marten est **intentionnellement simple**. En effet, Marten étant un framework orienté backend, ne peut pas prendre en compte toutes les façons dont les assets peuvent être empaquetés et/ou regroupés. Certains projets pourraient nécessiter une stratégie webpack pour regrouper les assets, d'autres pourraient nécessiter une étape de fingerprinting en plus, et d'autres encore pourraient avoir besoin de quelque chose d'entièrement différent. La façon dont ces chaînes d'outils sont configurées ou mises en place est laissée à la discrétion des développeurs d'applications web ; il est simplement attendu que ces opérations soient appliquées _avant_ l'exécution de la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets).
:::

Une fois les assets « collectés », il est possible de générer leurs URL via l'utilisation d'aides dédiées :

* en utilisant le [moteur d'assets](https://martenframework.com/docs/api/dev/Marten/Asset/Engine.html#url(filepath%3AString)%3AString-instance-method) en Crystal
* en utilisant le tag [`asset`](../templates/reference/tags.md#asset) dans les templates

La façon dont ces URL d'assets sont générées dépend du [stockage d'assets](../development/reference/settings.md#storage) configuré.

## Configurer les assets

Les assets peuvent être configurés via l'utilisation des [paramètres d'assets](../development/reference/settings.md#assets-settings), qui sont disponibles sous l'espace de noms `assets`.

Un exemple de configuration d'assets pourrait ressembler à ceci :

```crystal
config.assets.root = "assets"
config.assets.url = "/assets/"
```

### Stockage des assets

L'un des paramètres d'assets les plus importants est celui du [`storage`](../development/reference/settings.md#storage). En effet, Marten utilise un mécanisme de stockage de fichiers pour effectuer les opérations liées aux assets (comme le téléversement de fichiers, la génération d'URL, etc.) en utilisant une API standardisée. Par défaut, les assets utilisent le backend de stockage [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html), qui garantit que les fichiers d'assets sont collectés et placés dans un dossier spécifique du système de fichiers local : cela permet à ces fichiers d'être ensuite servis par un serveur web tel que Nginx par exemple.

### Répertoire racine des assets

Ce répertoire - qui peut être configuré via l'utilisation du paramètre [`root`](../development/reference/settings.md#root) - correspond au chemin absolu où les assets collectés seront persistés (lors de l'exécution de la commande [`collectassets`](../development/reference/management-commands.md#collectassets)). Par défaut, les assets seront persistés dans un dossier relatif au répertoire du projet Marten. Évidemment, ce dossier devrait être vide avant d'exécuter la commande `collectassets` afin de ne pas écraser les fichiers existants. La valeur par défaut est `assets`.

### URL des assets

L'URL des assets est utilisée lors de la génération des URL pour les assets. Cette URL de base sera utilisée par le stockage par défaut [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html) pour construire les URL d'assets. Par exemple, demander un asset `css/App.css` pourrait générer une URL `/assets/css/App.css`. La valeur par défaut est `/assets/`.

### Répertoires d'assets

Par défaut, Marten collectera les fichiers d'assets définis dans un dossier `assets` dans les répertoires des [applications](../development/applications.md). Cela dit, votre projet aura probablement des fichiers d'assets qui ne sont pas associés à une application particulière. C'est pourquoi vous pouvez également définir un tableau de répertoires supplémentaires où les assets doivent être recherchés.

Ce tableau de répertoires peut être défini via l'utilisation du paramètre d'assets [`dirs`](../development/reference/settings.md#dirs) :

```crystal
config.assets.dirs = [
  Path["src/path1/assets"],
  :"src/path2/assets",
]
```

### Manifestes d'assets et fingerprinting

Le fingerprinting consiste à ajouter une chaîne de caractères unique au nom de fichier de chaque asset. Cela permet au navigateur de mettre en cache le fichier en toute sécurité. Lorsqu'un asset est modifié, son empreinte change, incitant le navigateur à récupérer et utiliser la version mise à jour.

Les outils modernes de regroupement d'assets offrent souvent la possibilité de générer des fichiers de manifeste. Ces fichiers de manifeste contiennent généralement des correspondances entre les noms de fichiers d'assets originaux et leurs versions avec empreinte. Marten supporte la configuration de chemins vers ces fichiers de manifeste de sorte que la [résolution des assets](#résoudre-les-url-dassets) produise des URL incluant automatiquement la bonne version avec empreinte de chaque asset.

Cela peut être réalisé en ajoutant des chemins de manifeste au paramètre [`assets.manifests`](../development/reference/settings.md#manifests). Par exemple :

```crystal
config.assets.manifests = [
  "src/assets/build/manifest.json",
]
```

Il est supposé que les fichiers dont les chemins sont référencés dans ce paramètre sont des manifestes JSON classiques, contenant des correspondances entre les noms de fichiers d'assets originaux et leurs versions avec empreinte. Par exemple :

```json
{
  "app/home.css": "app/home.9495841be78cdf06c45d.css",
  "app/home.js": "app/home.9495841be78cdf06c45d.js"
}
```

En considérant l'exemple de manifeste ci-dessus, essayer de résoudre `app/home.css` produirait une URL se terminant par `app/home.9495841be78cdf06c45d.css` :

```crystal
Marten.assets.url("app/home.css") # => "/assets/app/home.9495841be78cdf06c45d.css"
```

:::info
De plus, la commande [`collectassets`](../development/reference/management-commands.md#collectassets) fournit une option `--fingerprint`. L'utilisation de cette option applique automatiquement le fingerprinting aux assets collectés et génère un fichier `manifest.json`, qui fait correspondre les chemins de fichiers originaux à leurs versions avec empreinte.

Lorsque l'option `--fingerprint` est utilisée, il est important d'inclure le chemin vers le « manifest.json » généré dans le fichier de configuration d'environnement approprié [`assets.manifests`](../development/reference/settings#manifests), sinon les assets collectés ne peuvent pas être trouvés lors de la résolution de l'URL.
:::

## Résoudre les URL d'assets

Comme mentionné précédemment, les assets sont collectés et persistés dans un stockage spécifique. Lors de la construction de [templates](../templates/introduction.md) HTML, vous aurez généralement besoin de « résoudre » l'URL des assets pour générer les URL absolues qui doivent être insérées dans les tags de feuilles de style ou de script (par exemple).

Une façon possible de faire cela est d'utiliser le tag de template [`asset`](../templates/reference/tags.md#asset). Ce tag de template prend un seul argument correspondant au chemin relatif de l'asset que vous souhaitez résoudre, et il affiche l'URL absolue de l'asset (en fonction de votre configuration d'assets).

Par exemple :

```html
<link rel="stylesheet" type="text/css" href="{% asset 'app/app.css' %}" />
```

Dans le fragment ci-dessus, l'asset `app/app.css` pourrait être résolu en `/assets/app/app.css` (en fonction de la configuration du projet évidemment).

Il est également possible de résoudre les URL d'assets de manière programmatique en Crystal. Pour ce faire, vous pouvez utiliser la méthode [`#url`](https://martenframework.com/docs/api/dev/Marten/Asset/Engine.html#url(filepath%3AString)%3AString-instance-method) du moteur d'assets de Marten :

```crystal
Marten.assets.url("app/app.css") # => "/assets/app/app.css"
```

## Servir les assets en développement

Marten fournit un handler que vous pouvez utiliser pour servir les assets uniquement dans les environnements de développement. Ce handler ([`Marten::Handlers::Defaults::Development::ServeAsset`](https://martenframework.com/docs/api/dev/Marten/Handlers/Defaults/Development/ServeAsset.html)) est automatiquement associé à une route lors de la création de nouveaux projets via l'utilisation de la commande de gestion [`new`](../development/reference/management-commands.md#new) :

```crystal
Marten.routes.draw do
  # Other routes...

  if Marten.env.development?
    path "#{Marten.settings.assets.url}<path:path>", Marten::Handlers::Defaults::Development::ServeAsset, name: "asset"
  end
end
```

Comme vous pouvez le voir, cette route utilisera automatiquement l'URL configurée dans le paramètre d'asset [`url`](../development/reference/settings.md#url). Par exemple, cela signifie qu'un asset `app/app.css` serait servi par la route `/assets/app/app.css` en développement si le paramètre [`url`](../development/reference/settings.md#url) est défini à `/assets/`.

:::warning
Il est très important de comprendre que ce handler ne devrait être utilisé **que** dans les environnements de développement. En effet, le handler [`Marten::Handlers::Defaults::Development::ServeAsset`](https://martenframework.com/docs/api/dev/Marten/Handlers/Defaults/Development/ServeAsset.html) ne nécessite pas que les assets aient été collectés au préalable via l'utilisation de la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets). Cela signifie qu'il essaiera de trouver les assets dans les répertoires `assets` de vos applications et dans les répertoires configurés dans le paramètre [`dirs`](../development/reference/settings.md#dirs). Ce mécanisme est utile en développement, mais il n'est pas adapté aux environnements de production car il est inefficace et (probablement) non sécurisé.
:::

## Servir les assets en production

Au moment du déploiement, vous devrez exécuter la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets) pour collecter tous les assets disponibles depuis les répertoires `assets` des applications et depuis les répertoires configurés dans le paramètre [`dirs`](../development/reference/settings.md#dirs). Cette commande identifiera et « collectera » ces assets, et s'assurera qu'ils sont « téléversés » vers leur destination finale en fonction du stockage actuellement utilisé.

:::tip
La commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets) devrait être exécutée _après_ que vos assets ont été regroupés et empaquetés. Par exemple, votre projet pourrait utiliser un pipeline [gulp](https://gulpjs.com/) pour compiler vos assets, les minifier et les placer dans un répertoire `src/app/assets/build`. En supposant que ce répertoire est également spécifié dans le paramètre [`dirs`](../development/reference/settings.md#dirs), ces assets préparés seraient également collectés et téléversés dans le stockage configuré. Ce qui vous permettrait ensuite de les référencer depuis les templates de votre projet.

Évidemment, chaque projet est différent et peut utiliser des outils différents et un pipeline de déploiement différent, mais la stratégie globale resterait la même.
:::

Il est à noter qu'il existe de nombreuses façons de servir les assets en production. Encore une fois, chaque situation de déploiement sera différente, mais nous pouvons identifier quelques stratégies génériques.

### Servir les assets depuis un serveur web

Comme mentionné précédemment, Marten utilise un mécanisme de stockage de fichiers pour effectuer les opérations liées aux assets et les « collecter ». Par défaut, les assets utilisent le backend de stockage [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html), qui garantit que les fichiers d'assets sont collectés et placés dans un dossier spécifique du système de fichiers local. Cela permet à ces assets d'être facilement servis par un serveur web local si vous en avez un correctement configuré.

Par exemple, vous pourriez utiliser un serveur web comme [Apache](https://httpd.apache.org/) ou [Nginx](https://nginx.org) pour servir vos assets collectés. La manière de configurer ces serveurs web variera évidemment d'une solution à une autre, mais vous devrez probablement définir un emplacement dont l'URL correspond à la valeur du paramètre [`url`](../development/reference/settings.md#url) et qui sert les fichiers depuis le dossier où les assets ont été collectés (le dossier [`root`](../development/reference/settings.md#root)).

Par exemple, une configuration de serveur [Nginx](https://nginx.org) permettant de servir les assets sous un emplacement `/assets` pourrait ressembler à ceci :

```conf
server {
  listen 443 ssl;
  server_name myapp.example.com;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_min_length 256;
  gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;

  error_log /var/log/nginx/myapp_error.log;
  access_log /var/log/nginx/myapp_access.log;

  location /assets/ {
    expires 365d;
    alias /myapp/assets/;
  }
}
```

### Servir les assets depuis un service cloud ou un CDN

Pour servir les assets depuis un stockage cloud (comme Amazon S3 ou GCS) et (optionnellement) un CDN (Content Delivery Network), vous devrez probablement écrire un stockage de fichiers personnalisé et configurer le paramètre [`storage`](../development/reference/settings.md#storage) en conséquence. L'avantage de procéder ainsi est que vous déléguez essentiellement la responsabilité de servir les assets à un stockage cloud dédié, ce qui peut souvent se traduire par des pages se chargeant plus rapidement pour vos utilisateurs finaux.

:::info
Marten ne fournit pas actuellement d'implémentations de stockage de fichiers pour les solutions de stockage cloud les plus couramment rencontrées. C'est cependant quelque chose qui est prévu pour les prochaines versions.
:::

Écrire une implémentation de stockage de fichiers personnalisée impliquera de sous-classer la classe abstraite [`Marten::Core::Storage::Base`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/Base.html) et d'implémenter un ensemble de méthodes obligatoires. La principale différence par rapport à un stockage « système de fichiers local » ici est que vous devrez utiliser l'API du stockage cloud choisi pour effectuer les opérations de fichiers de bas niveau (comme lire le contenu d'un fichier, vérifier qu'un fichier existe ou générer l'URL d'un fichier).

### Servir les assets en utilisant un middleware

Il existe des situations où il n'est pas possible de configurer facilement un serveur web tel que [Nginx](https://nginx.org) ou un service tiers (comme Amazon S3 ou GCS) pour servir vos assets directement. Pour pallier cela, Marten fournit le middleware [`Marten::Middleware::AssetServing`](../handlers-and-http/reference/middlewares.md#asset-serving-middleware).

Le but de ce middleware est de distribuer les assets collectés stockés sous la racine d'assets configurée (paramètre [`assets.root`](../development/reference/settings.md#root)). Ces assets sont supposés avoir été collectés en utilisant la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets), et il est également supposé qu'un stockage « système de fichiers local » (tel que [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html)) est utilisé.

Afin d'utiliser ce middleware, vous pouvez l'« insérer » au début du paramètre [`middleware`](../development/reference/settings.md#middleware) lors de la définition des paramètres de production. Par exemple :

```crystal
Marten.configure :production do |config|
  config.middleware.unshift(Marten::Middleware::AssetServing)

  # Other settings...
end
```

Il est important de noter que le paramètre [`assets.url`](../development/reference/settings.md#url) doit être aligné avec le domaine de l'application Marten ou correspondre à un chemin URL relatif (par exemple /assets/) pour que ce middleware fonctionne correctement. Cela garantit un mappage et une accessibilité corrects des assets au sein de l'application, leur permettant d'être servis par ce middleware.
