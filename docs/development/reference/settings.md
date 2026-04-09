---
title: Paramètres
description: Référence des paramètres.
sidebar_label: Paramètres
---

Cette page fournit une référence pour tous les paramètres disponibles pouvant être utilisés pour configurer les projets Marten.

## Paramètres communs

### `allowed_hosts`

Défaut : `[] of String`

Un tableau explicite des hôtes autorisés pour l'application.

L'application doit être explicitement configurée pour servir une liste d'hôtes autorisés. Ceci permet d'atténuer les attaques par en-tête HTTP Host. Les chaînes de ce tableau peuvent correspondre à des noms de domaine réguliers ou des sous-domaines (ex. `example.com` ou `www.example.com`) ; dans ce cas, l'en-tête Host de la requête entrante sera vérifiée pour s'assurer qu'elle correspond exactement à l'un des hôtes autorisés configurés.

Il est également possible de faire correspondre tous les sous-domaines d'un domaine spécifique en ajoutant un `.` au début de la chaîne de l'hôte. Par exemple `.example.com` correspondra à `example.com`, `www.example.com`, `sub.example.com`, ou tout autre sous-domaine. Enfin, la chaîne spéciale `*` peut être utilisée pour correspondre à n'importe quelle valeur de Host, mais cette valeur joker doit être utilisée avec prudence car vous ne seriez pas protégé contre les attaques par en-tête Host.

Il convient de noter que ce paramètre est automatiquement défini au tableau suivant lorsqu'un projet s'exécute en [mode debug](#debug) (sauf s'il est explicitement défini) :

```crystal
[".localhost", "127.0.0.1", "[::1]"]
```

### `cache_store`

Défaut : `Marten::Cache::Store::Memory.new`

L'instance globale du cache store.

Ce paramètre permet de configurer le cache store retourné par la méthode [`Marten#cache`](https://martenframework.com/docs/api/dev/Marten.html#cache%3ACache%3A%3AStore%3A%3ABase-class-method) (qui peut être utilisée pour effectuer des opérations de mise en cache de bas niveau), et qui est également utilisé pour d'autres fonctionnalités de mise en cache comme la mise en cache de fragments de template. Veuillez consulter [Mise en cache](../../caching.mdx) pour en savoir plus sur les fonctionnalités de mise en cache fournies par Marten.

Par défaut, le cache store global est défini comme un cache en mémoire (instance de [`Marten::Cache::Store::Memory`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Memory.html)). Dans les environnements de test, vous pourriez vouloir utiliser le "null store" en assignant une instance de [`Marten::Cache::Store::Null`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Null.html) à ce paramètre. Des shards de cache store supplémentaires sont également maintenus sous l'égide du projet Marten ou par la communauté elle-même et peuvent être utilisés dans votre application selon vos besoins de mise en cache. Ces backends sont listés dans la [référence des stores de mise en cache](../../caching/reference/stores.md).

### `date_input_formats`

Défaut :

```crystal
[
  "%Y-%m-%d",  # '2024-10-25'
  "%m/%d/%Y",  # '10/25/2024'
  "%m/%d/%y",  # '10/25/06'
  "%b %d %Y",  # 'Oct 25 2024'
  "%b %d, %Y", # 'Oct 25, 2024'
  "%d %b %Y",  # '25 Oct 2024'
  "%d %b, %Y", # '25 Oct, 2024'
  "%B %d %Y",  # 'October 25 2024'
  "%B %d, %Y", # 'October 25, 2024'
  "%d %B %Y",  # '25 October 2024'
  "%d %B, %Y", # '25 October, 2024'
]
```

Un tableau de formats d'entrée de date par défaut.

Ce tableau de formats d'entrée de date par défaut est utilisé par le [champ de schema `date`](../../schemas/reference/fields.md#date) pour analyser les valeurs de date à partir de chaînes. Notez que les formats d'entrée de date provenant des locales seront utilisés en priorité par rapport aux formats définis dans ce tableau.

### `date_time_input_formats`

Défaut :

```crystal
[
  "%Y-%m-%d %H:%M:%S",    # '2024-10-25 14:30:00'
  "%Y-%m-%d %H:%M:%S.%f", # '2024-10-25 14:30:00.000000'
  "%Y-%m-%d %H:%M",       # '2024-10-25 14:30'
  "%m/%d/%Y %H:%M:%S",    # '10/25/2024 14:30:00'
  "%m/%d/%Y %H:%M:%S.%f", # '10/25/2024 14:30:00.000000'
  "%m/%d/%Y %H:%M",       # '10/25/2024 14:30'
]
```

Un tableau de formats d'entrée de date et heure par défaut.

Ce tableau de formats d'entrée de date et heure par défaut est utilisé par le [champ de schema `date_time`](../../schemas/reference/fields.md#date_time) pour analyser les valeurs de date et heure à partir de chaînes. Notez que les formats d'entrée de date et heure provenant des locales seront utilisés en priorité par rapport aux formats définis dans ce tableau.

### `debug`

Défaut : `false`

Un booléen permettant d'activer ou de désactiver le mode debug.

Lorsqu'il s'exécute en mode debug, Marten fournira automatiquement des informations détaillées sur les exceptions levées (y compris les tracebacks) et les requêtes HTTP entrantes. Ce mode est donc principalement utile pour les environnements de développement.

### `host`

Défaut : `"127.0.0.1"`

L'hôte sur lequel le serveur HTTP exécutant l'application écoutera.

### `installed_apps`

Défaut : `[] of Marten::Apps::Config.class`

Un tableau des classes d'applications installées. Chaque application Marten doit définir une sous-classe de [`Marten::Apps::Config`](https://martenframework.com/docs/api/dev/Marten/Apps/Config.html). Lorsque ces sous-classes sont spécifiées dans le paramètre `installed_apps`, les modèles, migrations, assets et templates des applications seront rendus disponibles pour le projet considéré. Veuillez consulter [Applications](../applications.md) pour en savoir plus sur les applications.

### `log_backend`

Défaut : `Log::IOBackend.new(...)`

Le backend de log utilisé par l'application. Tout objet `Log::Backend` peut être utilisé, ce qui permet de configurer facilement le formatage des logs par exemple.

### `log_level`

Défaut : `Log::Severity::Info`

Le niveau de log par défaut utilisé par l'application. Toute sévérité définie dans l'enum [`Log::Severity`](https://crystal-lang.org/api/Log/Severity.html) peut être utilisée.

:::info
Ce paramètre contrôle exclusivement le niveau de log pour le serveur Marten. Pour définir le niveau de log des [commandes de gestion](../management-commands.md), utilisez l'option de commande `--log-level` (voir [Options partagées](../management-commands.md#options-partagées)).
:::

### `middleware`

Défaut : `[] of Marten::Middleware.class`

Un tableau de middlewares utilisés par l'application. Par exemple :

```crystal
config.middleware = [
  Marten::Middleware::Session,
  Marten::Middleware::I18n,
  Marten::Middleware::GZip,
]
```

Les middlewares sont utilisés pour "s'accrocher" au cycle de vie requête / réponse de Marten. Ils peuvent être utilisés pour modifier ou implémenter des logiques basées sur les requêtes HTTP entrantes et les réponses HTTP résultantes. Veuillez consulter [Middlewares](../../handlers-and-http/middlewares.md) pour en savoir plus sur les middlewares.

### `port`

Défaut : `8000`

Le port sur lequel le serveur HTTP exécutant l'application écoutera.

### `port_reuse`

Défaut : `true`

Un booléen indiquant si plusieurs processus peuvent se lier au même port du serveur HTTP.

### `referrer_policy`

Défaut : `"same-origin"`

La valeur à utiliser pour l'en-tête [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) lorsque le middleware associé est utilisé. Cet en-tête contrôle la quantité d'informations de référent envoyées avec les requêtes de votre site vers d'autres origines, améliorant la confidentialité et la sécurité de l'utilisateur.

Les valeurs possibles pour l'en-tête Referrer-Policy incluent :

- `no-referrer` : L'en-tête Referer sera entièrement omis. Aucune information de référent n'est envoyée avec les requêtes.
- `no-referrer-when-downgrade` : L'en-tête Referer ne sera pas envoyé vers des destinations moins sécurisées (ex. de HTTPS vers HTTP), mais sera envoyé vers des destinations de même sécurité ou plus sécurisées.
- `origin` : Seule l'origine du document est envoyée comme référent.
- `origin-when-cross-origin` : L'URL complète est envoyée comme référent lors d'une requête de même origine, mais seule l'origine est envoyée pour les requêtes cross-origin.
- `same-origin` : L'en-tête Referer est envoyé avec les requêtes de même origine, mais pas avec les requêtes cross-origin.
- `strict-origin` : Seule l'origine est envoyée comme référent, et uniquement pour les requêtes de même origine.
- `strict-origin-when-cross-origin` : L'URL complète est envoyée comme référent lors d'une requête de même origine, mais seule l'origine est envoyée pour les requêtes cross-origin. Aucune information de référent n'est envoyée vers des destinations moins sécurisées.
- `unsafe-url` : L'URL complète est toujours envoyée comme référent, indépendamment de la sécurité de la requête.

Ce paramètre sera utilisé par le middleware [`Marten::Middleware::ReferrerPolicy`](../../handlers-and-http/reference/middlewares.md#referrer-policy-middleware) lors de l'insertion de l'en-tête Referrer-Policy dans les réponses HTTP. En configurant ce paramètre, vous pouvez contrôler la quantité d'informations de référent incluses avec les requêtes de votre site vers d'autres origines.

### `request_max_parameters`

Défaut : `1000`

Le nombre maximum de paramètres autorisés par requête (comme les paramètres GET ou POST).

Un grand nombre de paramètres nécessitera plus de temps de traitement et pourrait être le signe d'une attaque par déni de service, c'est pourquoi ce paramètre peut être utilisé. Cette protection peut également être désactivée en définissant `request_max_parameters` à `nil`.

### `root_path`

Défaut : `nil`

Le chemin racine de l'application.

Le chemin racine de l'application spécifie l'emplacement réel des sources du projet dans votre système. Cela peut s'avérer utile dans les scénarios où le projet a été compilé dans un emplacement spécifique différent de la destination finale où les sources du projet (et le dossier `lib`) sont copiés. Par exemple, les plateformes comme Heroku entrent souvent dans cette catégorie. En configurant le chemin racine, vous pouvez vous assurer que votre application localise correctement les sources du projet requises et évite toute divergence résultant de chemins de sources incohérents. Cela peut prévenir les problèmes liés aux dépendances manquantes ou aux fichiers liés à l'app manquants (ex. locales, assets ou templates) et rendre votre application plus robuste et fiable.

Par exemple, le déploiement d'une application Marten sur Heroku impliquera généralement de définir le chemin racine comme suit :

```crystal
config.root_path = "/app"
```

### `secret_key`

Défaut : `""`

Une clé secrète utilisée pour la signature cryptographique du projet Marten considéré.

La clé secrète doit être définie sur une valeur de chaîne unique et imprévisible. La clé secrète peut être utilisée par Marten pour chiffrer ou signer des messages (ex. pour les sessions basées sur les cookies), ou par d'autres applications d'authentification.

:::warning
La valeur du paramètre `secret_key` **doit** être gardée secrète. Vous ne devriez jamais committer cette valeur dans le contrôle de version (envisagez plutôt de la charger depuis des variables d'environnement par exemple).
:::

### `socket`

Défaut : `nil`

Le chemin du socket Unix sur lequel le serveur HTTP exécutant l'application écoutera.

Lorsque ce paramètre est configuré, le serveur se lie au socket Unix spécifié au lieu de se lier à un port TCP. Dans ce cas, les paramètres `host` et `port` sont ignorés. Ceci est particulièrement utile lors du déploiement d'une application Marten derrière un reverse proxy comme Nginx ou Caddy sur la même machine, car cela offre de meilleures performances et sécurité par rapport au bouclage TCP.

### `time_zone`

Défaut : `Time::Location.load("UTC")`

Le fuseau horaire par défaut utilisé par l'application pour le stockage des dates et heures en base de données et leur affichage. Tout objet [`Time::Location`](https://crystal-lang.org/api/Time/Location.html) peut être utilisé.

### `trailing_slash`

Défaut : `:do_nothing`

Le comportement du slash final appliqué lorsqu'une URL de requête entrante ne correspond à aucune des routes configurées.

Ce paramètre vous permet de configurer si une redirection HTTP permanente (301) doit être émise lorsqu'une URL entrante qui ne correspond à aucune des routes configurées se termine ou non par un slash. Trois valeurs sont prises en charge :

* `:do_nothing` - Aucune redirection n'est émise (c'est le comportement par défaut).
* `:add` - Si l'URL entrante ne se termine pas par un slash et ne correspond à aucune route, une redirection est émise vers la même URL avec un slash final ajouté.
* `:remove` - Si l'URL entrante se termine par un slash et ne correspond à aucune route, une redirection est émise vers la même URL avec le slash final supprimé.

### `unsupported_http_method_strategy`

Défaut : `:deny`

La stratégie à utiliser lorsqu'une méthode HTTP non prise en charge est rencontrée.

Ce paramètre vous permet de configurer la stratégie à utiliser lorsqu'un handler traite une méthode HTTP non prise en charge. La stratégie par défaut est `:deny`, ce qui signifie que l'application retournera une réponse 405 Method Not Allowed lorsqu'une méthode HTTP non prise en charge est rencontrée. L'autre stratégie disponible est `:hide`, qui entraînera le retour de réponses 404 Not Found à la place.

### `use_x_forwarded_host`

Défaut : `false`

Un booléen indiquant si l'en-tête `X-Forwarded-Host` est utilisé pour rechercher l'hôte. Ce paramètre peut être activé si l'application Marten est servie derrière un proxy qui définit cet en-tête.

### `use_x_forwarded_port`

Défaut : `false`

Un booléen indiquant si l'en-tête `X-Forwarded-Port` est utilisé pour déterminer le port d'une requête. Ce paramètre peut être activé si l'application Marten est servie derrière un proxy qui définit cet en-tête.

### `use_x_forwarded_proto`

Défaut : `false`

Un booléen indiquant si l'en-tête `X-Forwarded-Proto` est utilisé pour déterminer si une requête est sécurisée. Ce paramètre peut être activé si l'application Marten est servie derrière un proxy qui définit cet en-tête. Par exemple, si un tel proxy définit cet en-tête sur `https`, Marten supposera que la requête est sécurisée au niveau de l'application **uniquement** si `use_x_forwarded_proto` est défini sur `true`.

### `handler400`

Défaut : `Marten::Handlers::Defaults::BadRequest`

La classe de handler qui devrait générer des réponses pour les réponses Bad Request (HTTP 400). Veuillez consulter [Handlers d'erreur](../../handlers-and-http/error-handlers.md) pour en savoir plus sur les handlers d'erreur.

### `handler403`

Défaut : `Marten::Handlers::Defaults::PermissionDenied`

La classe de handler qui devrait générer des réponses pour les réponses Permission Denied (HTTP 403). Veuillez consulter [Handlers d'erreur](../../handlers-and-http/error-handlers.md) pour en savoir plus sur les handlers d'erreur.

### `handler404`

Défaut : `Marten::Handlers::Defaults::PageNotFound`

La classe de handler qui devrait générer des réponses pour les réponses Not Found (HTTP 404). Veuillez consulter [Handlers d'erreur](../../handlers-and-http/error-handlers.md) pour en savoir plus sur les handlers d'erreur.

### `handler500`

Défaut : `Marten::Handlers::Defaults::ServerError`

La classe de handler qui devrait générer des réponses pour les réponses Internal Error (HTTP 500). Veuillez consulter [Handlers d'erreur](../../handlers-and-http/error-handlers.md) pour en savoir plus sur les handlers d'erreur.

### `x_frame_options`

Défaut : `"DENY"`

La valeur à utiliser pour l'en-tête X-Frame-Options lorsque le middleware associé est utilisé. La valeur de ce paramètre sera utilisée par le middleware [`Marten::Middleware::XFrameOptions`](../../handlers-and-http/reference/middlewares.md#x-frame-options-middleware) lors de l'insertion de l'en-tête X-Frame-Options dans les réponses HTTP.

## Paramètres des assets

Les paramètres des assets permettent de configurer la façon dont Marten interagit avec les [assets](../../assets/introduction.md). Ces paramètres sont tous disponibles sous le namespace `assets` :

```crystal
config.assets.root = "assets"
config.assets.url = "/assets/"
```

### `app_dirs`

Défaut : `true`

Un booléen indiquant si les assets doivent être recherchés dans les dossiers des applications installées. Lorsque ce paramètre est défini sur `true`, cela signifie que les assets fournis par les applications installées seront collectés par la commande `collectassets` (veuillez consulter [Gestion des assets](../../assets/introduction.md) pour plus de détails sur la gestion des assets dans votre projet).

### `dirs`

Défaut : `[] of String`

Un tableau de répertoires où les assets doivent être recherchés. L'ordre de ces répertoires est important car il définit l'ordre dans lequel les assets sont recherchés.

Il convient de noter que des objets path ou des symboles peuvent également être utilisés pour configurer ce paramètre :

```crystal
config.assets.dirs = [
  Path["src/path1/assets"],
  :"src/path2/assets",
]
```

### `manifests`

Défaut : `[] of String`

Un tableau de chemins vers des fichiers JSON de manifeste à utiliser pour résoudre les URLs des assets. Les fichiers de manifeste seront utilisés pour retourner le bon chemin d'asset avec empreinte pour un chemin générique, ce qui peut être utile si votre stratégie de bundling d'assets le supporte. Vous pouvez en savoir plus sur cette capacité dans [Manifestes d'assets et fingerprinting](../../assets/introduction.md#asset-manifests-and-fingerprinting).

### `max_age`

Défaut : `3600`

Permet de définir la valeur de la directive max-age utilisée dans l'en-tête Cache-Control qui est défini par le middleware [`Marten::Middleware::AssetServing`](../../handlers-and-http/reference/middlewares.md#asset-serving-middleware).

### `root`

Défaut : `"assets"`

Une chaîne contenant le chemin absolu où les assets collectés seront persistés (lors de l'exécution de la commande `collectassets`). Par défaut, les assets seront persistés dans un dossier relatif au répertoire du projet Marten. Évidemment, ce dossier devrait être vide avant d'exécuter la commande `collectassets` afin de ne pas écraser les fichiers existants : les assets doivent être définis dans les dossiers `assets` de vos applications à la place.

:::info
Ce paramètre n'est utilisé que si `assets.storage` est `nil`.
:::

### `storage`

Défaut : `nil`

Un objet de stockage optionnel, qui doit être une instance d'une sous-classe de [`Marten::Core::Store::Base`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/Base.html). Cet objet de stockage sera utilisé lors de la collecte de fichiers d'assets pour les persister dans un emplacement donné.

Par défaut, la valeur de ce paramètre est définie sur `nil`, ce qui signifie qu'un stockage [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html) est automatiquement construit en utilisant les valeurs des paramètres `assets.root` et `assets.url` : dans cette situation, les fichiers d'assets sont collectés et persistés dans un répertoire local, et il est attendu qu'ils seront servis depuis ce répertoire par le serveur web exécutant l'application.

Un stockage spécifique peut être défini à la place pour s'assurer que les assets collectés sont persistés ailleurs dans le cloud et servis depuis là (par exemple dans un bucket Amazon S3). Dans ce cas, les valeurs des paramètres `assets.root` et `assets.url` sont essentiellement ignorées et remplacées par l'utilisation du stockage spécifié.

### `url`

Défaut : `"/assets/"`

L'URL de base à utiliser lors de l'exposition des URLs d'assets. Cette URL de base sera utilisée par le stockage par défaut [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html) pour construire les URLs d'assets. Par exemple, demander un asset `css/App.css` pourrait générer une URL `/assets/css/App.css` par défaut.

:::info
Ce paramètre n'est utilisé que si `assets.storage` est `nil`.
:::

## Paramètres CSRF

Les paramètres CSRF permettent de configurer la façon dont les mesures de protection contre les attaques Cross-Site Request Forgery (CSRF) sont implémentées au sein du projet Marten considéré. Veuillez consulter [Protection contre les Cross-Site Request Forgery](../../security/csrf.md) pour plus de détails sur ce sujet.

Les paramètres suivants sont tous disponibles sous le namespace `csrf` :

```crystal
config.csrf.protection_enabled = true
config.csrf.cookie_name = "csrf-token"
```

### `cookie_domain`

Défaut : `nil`

Un domaine optionnel à utiliser lors de la définition du cookie CSRF. Cela peut être utilisé pour partager le cookie CSRF entre plusieurs sous-domaines par exemple. Par exemple, définir cette option sur `.example.com` permettra d'envoyer une requête POST depuis un formulaire sur un sous-domaine (ex. `foo.example.com`) vers un autre sous-domaine (ex. `bar.example.com`).

### `cookie_http_only`

Défaut : `false`

Un booléen indiquant si les scripts côté client doivent être empêchés d'accéder au cookie du token CSRF. Si cette option est définie sur `true`, les scripts JavaScript ne pourront pas accéder au cookie CSRF.

### `cookie_max_age`

Défaut : `31_556_952` (environ un an)

L'âge maximum (en secondes) du cookie CSRF.

### `cookie_name`

Défaut : `"csrftoken"`

Le nom du cookie à utiliser pour le token CSRF. Ce nom de cookie doit être différent de tout autre cookie créé par votre application.

### `cookie_same_site`

Défaut : `"Lax"`

La valeur du [flag SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) à utiliser pour le cookie CSRF. Les valeurs acceptées sont `"Lax"`, `"Strict"` ou `"None"`.

### `cookie_secure`

Défaut : `false`

Un booléen indiquant s'il faut utiliser un cookie sécurisé pour le cookie CSRF. Définir ceci sur `true` forcera les navigateurs à envoyer le cookie avec une requête chiffrée via le protocole HTTPS uniquement.

### `protection_enabled`

Défaut : `true`

Un booléen indiquant si la protection CSRF est activée globalement. Lorsque défini sur `true`, les handlers effectueront automatiquement une vérification CSRF pour protéger les requêtes non sûres (c'est-à-dire les requêtes dont les méthodes ne sont pas `GET`, `HEAD`, `OPTIONS` ou `TRACE`). Indépendamment de la valeur de ce paramètre, il est toujours possible d'activer ou de désactiver explicitement la protection CSRF par handler. Voir [Protection contre les Cross-Site Request Forgery](../../security/csrf.md) pour plus de détails.

### `session_key`

Défaut : `"csrftoken"`

Le nom de la clé de session à utiliser pour le token CSRF. Cette clé de session doit être différente de toute autre clé de session créée par votre application.

:::info
Cette valeur n'est pertinente que si [`use_session`](#use_session) est défini sur `true`.
:::

### `trusted_origins`

Défaut : `[] of String`

Un tableau d'origines de confiance.

Ces origines seront considérées comme de confiance pour les requêtes protégées par CSRF (comme les requêtes POST) et elles seront utilisées pour vérifier soit l'en-tête `Origin` soit l'en-tête `Referer` selon le schéma de la requête. Cela est fait pour s'assurer qu'un sous-domaine spécifique comme `sub1.example.com` ne peut pas émettre une requête POST vers `sub2.example.com`. Pour activer les requêtes protégées par CSRF entre différentes origines, il est possible d'ajouter des origines de confiance à ce tableau. Par exemple `https://sub1.example.com` peut être configuré comme un domaine de confiance de cette façon, mais il est possible d'autoriser les requêtes protégées par CSRF pour tous les sous-domaines d'un domaine spécifique en utilisant `https://*.example.com`.

Par exemple :

```crystal
config.csrf.trusted_origins = [
  "https://*.example.com",
  "https://other.example.org",
]
```

### `use_session`

Défaut : `false`

Un booléen indiquant si le token CSRF doit être stocké dans une session.
Si défini sur `true`, le token CSRF sera stocké [dans une session](../../handlers-and-http/sessions.md) plutôt que dans un cookie.

## Paramètres Content-Security-Policy

Ces paramètres permettent de configurer le comportement du middleware [`Marten::Middleware::ContentSecurityPolicy`](../../handlers-and-http/reference/middlewares.md#content-security-policy-middleware) et les directives réelles de l'en-tête Content-Security-Policy qui sont définies par ce middleware.

```crystal
config.content_security_policy.report_only = true
config.content_security_policy.default_policy.default_src = [:self, "other"]
```

Veuillez consulter [Content Security Policy](../../security/content-security-policy.md) pour en savoir plus sur la protection par l'en-tête Content-Security-Policy.

:::tip
[Content-Security-Policy](https://www.w3.org/TR/CSP/) est un en-tête complexe et il y a potentiellement de nombreuses valeurs que vous pourriez avoir besoin d'ajuster. Assurez-vous de le comprendre avant de configurer les paramètres ci-dessous.
:::

### `default_policy`

Défaut : `Marten::HTTP::ContentSecurityPolicy.new`

L'objet Content-Security-Policy par défaut.

Cet objet [`Marten::HTTP::ContentSecurityPolicy`](https://martenframework.com/docs/api/dev/Marten/HTTP/ContentSecurityPolicy.html) sera utilisé pour définir l'en-tête Content-Security-Policy lorsque le middleware [`Marten::Middleware::ContentSecurityPolicy`](../../handlers-and-http/reference/middlewares.md#content-security-policy-middleware) est utilisé.

Tous les attributs qui peuvent être définis sur cet objet [`Marten::HTTP::ContentSecurityPolicy`](https://martenframework.com/docs/api/dev/Marten/HTTP/ContentSecurityPolicy.html) via des méthodes comme [`#default_src=`](https://martenframework.com/docs/api/dev/Marten/HTTP/ContentSecurityPolicy.html#default_src%3D(value%3AArray|Nil|String|Symbol|Tuple)-instance-method) ou [`#frame_src=`](https://martenframework.com/docs/api/dev/Marten/HTTP/ContentSecurityPolicy.html#frame_src%3D(value%3AArray|Nil|String|Symbol|Tuple)-instance-method) peuvent également être utilisés directement sur l'objet de paramètre `content_security_policy`. Par exemple :

```crystal
config.content_security_policy.default_src = [:self, "other"]
config.content_security_policy.block_all_mixed_content = true
```

### `nonce_directives`

Défaut : `["script-src", "style-src"]`

Un tableau de directives où un nonce généré dynamiquement sera inclus.

Par exemple, si ce paramètre est défini sur `["script-src"]`, une valeur `nonce-<b64-value>` sera ajoutée à la directive `script-src` dans la valeur de l'en-tête Content-Security-Policy.

### `report_only`

Défaut : `false`

Un booléen indiquant si les violations de politique sont signalées sans les appliquer.

Si ce paramètre est défini sur `true`, le middleware [`Marten::Middleware::ContentSecurityPolicy`](../../handlers-and-http/reference/middlewares.md#content-security-policy-middleware) définira un en-tête [Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only) au lieu de l'en-tête Content-Security-Policy habituel. Cela peut être utile pour expérimenter avec des politiques sans les appliquer.

## Paramètres de base de données {#database-settings}

Ces paramètres permettent de configurer les bases de données utilisées par le projet Marten considéré. Au moins une base de données par défaut doit être configurée si votre projet utilise des [modèles](../../models-and-databases/introduction.md), et des bases de données supplémentaires peuvent optionnellement être configurées également.

```crystal
# Base de données par défaut
config.database do |db|
  db.backend = :sqlite
  db.name = "default_db.db"
end

# Base de données supplémentaire
config.database :other do |db|
  db.backend = :sqlite
  db.name = "other_db.db"
end
```

La configuration d'autres backends de base de données tels que MariaDB, MySQL ou PostgreSQL implique généralement de spécifier plus de paramètres de connexion (ex. utilisateur, mot de passe, etc). Ainsi, vous devez définir un bloc pour configurer les options de base de données appropriées lors de l'appel à la méthode [`#database`](https://martenframework.com/docs/api/dev/Marten/Conf/GlobalSettings.html#database(id%3DDB%3A%3AConnection%3A%3ADEFAULT_CONNECTION_NAME%2Curl%3AString|Nil%3Dnil%2C%26)-instance-method). Par exemple :

```crystal
config.database do |db|
  db.backend = :postgresql
  db.host = "localhost"
  db.name = "my_db"
  db.user = "my_user"
  db.password = "my_password"
end
```

Il est important de mentionner que certains fournisseurs cloud ne fournissent qu'une chaîne de connexion pour se connecter à une base de données spécifique (généralement dans une variable d'environnement `DATABASE_URL`). Dans cette situation, il est possible de configurer automatiquement le backend de base de données en fournissant l'URL de connexion à la méthode [`#database`](https://martenframework.com/docs/api/dev/Marten/Conf/GlobalSettings.html#database%28id%3DDB%3A%3AConnection%3A%3ADEFAULT_CONNECTION_NAME%2Curl%3AString%7CNil%3Dnil%29-instance-method) également. Cette technique peut être utilisée pour configurer à la fois la base de données par défaut et les bases de données supplémentaires. Par exemple :

```crystal
# Base de données par défaut
config.database url: "postgres://my_user:my_db@localhost:1234/db"

# Base de données supplémentaire
config.database :my_other_db, url: "sqlite://other_db.db?journal_mode=wal&synchronous=normal"
```

:::tip
Vous pouvez combiner les deux techniques de configuration de base de données mentionnées ci-dessus si nécessaire. En effet, vous pouvez configurer une base de données via une chaîne de connexion et également la personnaliser davantage en ouvrant un bloc et en définissant des options supplémentaires :

```crystal
# Configurer la base de données avec une URL et un bloc
config.database url: "postgres://my_user:my_db@localhost:1234/db" do |db|
  db.retry_delay = 1.0
end
```
:::

Les sections suivantes fournissent des détails sur toutes les options de configuration de base de données disponibles.

### `backend`

Défaut : `nil`

Le backend de base de données à utiliser pour se connecter à la base de données considérée. Marten prend en charge trois backends actuellement :

* `:mysql`
* `:postgresql`
* `:sqlite`

### `checkout_timeout`

Défaut : `5.0`

Le nombre de secondes à attendre pour qu'une connexion devienne disponible lorsque la taille maximale du pool est atteinte.

### `host`

Défaut : `nil`

Une chaîne contenant l'hôte utilisé pour se connecter à la base de données. Aucune valeur signifie que l'hôte sera localhost.

### `initial_pool_size`

Défaut : `1`

Le nombre initial de connexions créées pour le pool de connexions de base de données.

### `max_idle_pool_size`

Défaut : `1`

Le nombre maximum de connexions inactives pour le pool de connexions de base de données. Concrètement, cela signifie que lorsqu'une connexion est libérée, elle ne sera fermée que s'il y a déjà `max_idle_pool_size` connexions inactives.

### `max_pool_size`

Défaut : `0`

Le nombre maximum de connexions qui seront maintenues par le pool de connexions de base de données. Lorsque défini sur `0`, cela signifie qu'il n'y a pas de limite au nombre de connexions.

### `name`

Défaut : `nil`

Le nom de la base de données à laquelle se connecter. Si vous utilisez le backend `sqlite`, cela peut être une chaîne ou un objet `Path` contenant le chemin (absolu ou relatif) vers le chemin de la base de données considérée.

### `options`

Défaut : `{} of String => String`

Un ensemble d'options de base de données supplémentaires. Ce paramètre peut être utilisé pour définir des options de base de données supplémentaires qui peuvent être requises pour se connecter à la base de données en question.

Par exemple :

```crystal
config.database do |db|
  db.backend = :postgresql
  db.host = "localhost"
  db.name = "my_db"
  db.user = "my_user"
  db.password = "my_password"
  // highlight-next-line
  db.options = {"sslmode" => "disable"}
end
```

Les options que vous pouvez définir ici varieront en fonction du backend de base de données choisi. Par exemple, vous pourriez définir l'option `sslmode` pour les bases de données PostgreSQL ou certaines [options pragma](https://github.com/crystal-lang/crystal-sqlite3?tab=readme-ov-file#setting-pragmas) pour les bases de données SQLite3.

Veuillez consulter la documentation du shard de liaison DB applicable pour plus de détails sur les options disponibles :

* [crystal-pg](https://github.com/will/crystal-pg) (PostgreSQL)
* [crystal-mysql](https://github.com/crystal-lang/crystal-mysql) (MariaDB, MySQL)
* [crystal-sqlite3](https://github.com/crystal-lang/crystal-sqlite3) (SQLite3)

### `password`

Défaut : `nil`

Une chaîne contenant le mot de passe à utiliser pour se connecter à la base de données configurée.

### `port`

Défaut : `nil`

Le port à utiliser pour se connecter à la base de données configurée. Aucune valeur signifie que le port par défaut sera utilisé.

### `retry_attempts`

Défaut : `1`

Le nombre maximum de tentatives pour rétablir une connexion perdue.

### `retry_delay`

Défaut : `1.0`

Le délai d'attente entre chaque tentative de rétablissement d'une connexion perdue.

### `user`

Défaut : `nil`

Une chaîne contenant le nom de l'utilisateur qui devrait être utilisé pour se connecter à la base de données configurée.

## Paramètres d'emailing

Les paramètres d'emailing permettent de configurer les paramètres liés à l'envoi d'emails. Veuillez consulter [Emailing](../../emailing.mdx) pour plus de détails sur la façon de définir et d'envoyer des emails dans vos projets.

Les paramètres suivants sont tous disponibles sous le namespace `emailing` :

```crystal
config.emailing.from_address = "no-reply@example.com"
config.emailing.backend = Marten::Emailing::Backend::Development.new(print_emails: true)
```

### `backend`

Défaut : `Marten::Emailing::Backend::Development.new`

Le backend à utiliser pour l'envoi d'emails. Les backends d'emailing définissent _comment_ les emails sont réellement envoyés.

Par défaut, un backend de développement (instance de [`Marten::Emailing::Backend::Dev`](https://martenframework.com/docs/api/dev/Marten/Emailing/Backend/Development.html)) est utilisé : ce backend "collecte" tous les emails qui sont "envoyés" par défaut (ce qui peut être utilisé dans les specs pour tester les emails envoyés), mais il peut aussi être configuré pour afficher les détails des emails sur la sortie standard si nécessaire (voir la [référence des backends d'emailing](../../emailing/reference/backends.md) pour plus de détails sur cette capacité).

Des shards de backend d'emailing supplémentaires sont également maintenus sous l'égide du projet Marten ou par la communauté elle-même et peuvent être utilisés dans votre application selon vos besoins spécifiques d'envoi d'emails. Ces backends sont listés dans la [référence des backends d'emailing](../../emailing/reference/backends.md#other-backends).

### `from_address`

Défaut : `"webmaster@localhost"`

L'adresse d'expédition par défaut utilisée dans les emails. Les définitions d'emails qui ne spécifient pas explicitement une adresse "from" utiliseront automatiquement cette adresse email pour l'expéditeur. Il convient de noter que cette adresse email d'expédition peut être définie comme une chaîne ou comme un objet [`Marten::Emailing::Address`](https://martenframework.com/docs/api/dev/Marten/Emailing/Address.html) (qui permet de spécifier le nom ET l'adresse de l'email expéditeur).

## Paramètres I18n

Les paramètres I18n permettent de configurer les paramètres liés à l'internationalisation. Veuillez consulter [Internationalisation](../../i18n.mdx) pour plus de détails sur la façon d'utiliser les traductions et le contenu localisé dans vos projets.

:::info
Marten utilise [crystal-i18n](https://crystal-i18n.github.io/) pour gérer les traductions et les locales. Des [options de configuration](https://crystal-i18n.github.io/configuration.html) supplémentaires sont également fournies par ce shard et peuvent être utilisées par tout projet Marten si nécessaire.
:::

Les paramètres suivants sont tous disponibles sous le namespace `i18n` :

```crystal
config.i18n.default_locale = :fr
```

### `available_locales`

Défaut : `nil`

Permet de définir les locales qui peuvent être activées pour effectuer des recherches de traduction et des localisations. Par exemple :

```crystal
config.i18n.available_locales = [:en, :fr]
```

### `default_locale`

Défaut : `"en"`

La locale par défaut utilisée par le projet Marten.

### `fallbacks`

Défaut : `["en"]`

Les locales de repli du projet.

En configurant les locales de repli, vous pouvez forcer votre projet à essayer de chercher les traductions dans d'autres locales (configurées) si la locale actuelle dans laquelle la traduction est demandée est manquante.

Les replis spécifiés peuvent être :

* un hash ou un named tuple définissant les chaînes de repli à utiliser pour des locales spécifiques.
* un simple tableau de replis. Dans ce cas, cette chaîne de locales de repli sera utilisée par défaut pour toutes les locales disponibles lorsque des traductions sont manquantes.
* un objet `I18n::Locale::Fallbacks`, vous permettant de spécifier un tableau de repli par défaut général et des mappings de repli en même temps (voir la [documentation crystal-i18n](https://crystal-i18n.github.io/configuration.html#fallbacks)).

Par exemple :

```crystal
# Chaîne de repli simple utilisée par toutes les locales configurées :
config.i18n.fallbacks = ["en-US", "en"]

# Chaînes de repli spécifiques par locale :
config.i18n.fallbacks = {"en-CA" => ["en-US", "en"], "fr-CA" => "fr"}

# Chaîne de repli par défaut et chaînes de repli spécifiques par locale :
config.i18n.fallbacks = ::I18n::Locale::Fallbacks.new(
  {"fr-CA-special": ["fr-CA", "fr", "en"]},
  default: ["en"]
)
```

### `locale_cookie_name`

Défaut : `"marten_locale"`

Le nom du cookie à utiliser pour sauvegarder la locale de l'utilisateur actuel et activer la bonne locale (lorsque le middleware [`Marten::Middleware::I18n`](../../handlers-and-http/reference/middlewares.md#i18n-middleware) est utilisé). Voir [Internationalisation](../../i18n/introduction.md) pour en savoir plus sur cette capacité.

## Paramètres des fichiers médias

Les paramètres des fichiers médias permettent de configurer la façon dont Marten interagit avec les [fichiers médias](../../files/managing-files.md). Ces paramètres sont tous disponibles sous le namespace `media_files` :

```crystal
config.media_files.root = "files"
config.media_files.url = "/files/"
```

### `root`

Défaut : `"media"`

Une chaîne contenant le chemin absolu où les fichiers téléchargés seront persistés. Par défaut, les fichiers téléchargés seront persistés dans un dossier relatif au répertoire du projet Marten.

:::info
Ce paramètre n'est utilisé que si `media_files.storage` est `nil`.
:::

### `storage`

Défaut : `nil`

Un objet de stockage optionnel, qui doit être une instance d'une sous-classe de [`Marten::Core::Store::Base`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/Base.html). Cet objet de stockage sera utilisé lors du téléchargement de fichiers pour les persister dans un emplacement donné.

Par défaut, la valeur de ce paramètre est définie sur `nil`, ce qui signifie qu'un stockage [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html) est automatiquement construit en utilisant les valeurs des paramètres `media_files.root` et `media_files.url` : dans cette situation, les fichiers médias sont persistés dans un répertoire local, et il est attendu qu'ils seront servis depuis ce répertoire par le serveur web exécutant l'application.

Un stockage spécifique peut être défini à la place pour s'assurer que les fichiers téléchargés sont persistés ailleurs dans le cloud et servis depuis là (par exemple dans un bucket Amazon S3). Dans ce cas, les valeurs des paramètres `media_files.root` et `media_files.url` sont essentiellement ignorées et remplacées par l'utilisation du stockage spécifié.

### `url`

Défaut : `"/media/"`

L'URL de base à utiliser lors de l'exposition des URLs de fichiers médias. Cette URL de base sera utilisée par le stockage par défaut [`Marten::Core::Store::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html) pour construire les URLs de fichiers médias. Par exemple, demander un fichier `foo/bar.txt` pourrait générer une URL `/media/foo/bar.txt` par défaut.

:::info
Ce paramètre n'est utilisé que si `media_files.storage` est `nil`.
:::

## Paramètres de remplacement de méthode

Les paramètres de remplacement de méthode permettent de configurer la façon dont le middleware [`MethodOverride`](../../handlers-and-http/reference/middlewares.md#method-override-middleware) gère les remplacements de méthode HTTP dans les formulaires. Ces paramètres sont tous disponibles sous le namespace `method_override` :

```crystal
config.method_override.allowed_methods = ["DELETE", "PATCH", "PUT"]
config.method_override.http_header_name = "X-Http-Method-Override"
config.method_override.input_name = "_method"
```

### `allowed_methods`

Défaut : `["DELETE", "PATCH", "PUT"]`

Un tableau de méthodes HTTP qui sont autorisées à être remplacées en utilisant le mécanisme `input_name`. Cela fournit une couche de contrôle, empêchant l'utilisation de méthodes HTTP arbitraires dans les remplacements.

### `http_header_name`

Défaut : `X-Http-Method-Override`

Le nom de l'en-tête HTTP utilisé pour signaler un remplacement de méthode.

### `input_name`

Défaut : `_method`

Le nom du champ de formulaire (ou paramètre de requête) utilisé pour signaler un remplacement de méthode.

## Paramètres de sessions

Les paramètres de sessions permettent de configurer la façon dont Marten gère les [sessions](../../handlers-and-http/introduction.md#using-sessions). Ces paramètres sont tous disponibles sous le namespace `sessions` :

```crystal
config.sessions.cookie_name = "_sessions"
config.sessions.store = :cookie
```

### `cookie_domain`

Défaut : `nil`

Un domaine optionnel à utiliser lors de la définition du cookie de session. Cela peut être utilisé pour partager le cookie de session entre plusieurs sous-domaines.

### `cookie_http_only`

Défaut : `false`

Un booléen indiquant si les scripts côté client doivent être empêchés d'accéder au cookie de session. Si cette option est définie sur `true`, les scripts JavaScript ne pourront pas accéder au cookie de session.

### `cookie_max_age`

Défaut : `1_209_600` (deux semaines)

L'âge maximum (en secondes) du cookie de session.


### `cookie_name`

Défaut : `"sessionid"`

Le nom du cookie à utiliser pour le token de session. Ce nom de cookie doit être différent de tout autre cookie créé par votre application.

### `cookie_same_site`

Défaut : `"Lax"`

La valeur du [flag SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) à utiliser pour le cookie de session. Les valeurs acceptées sont `"Lax"`, `"Strict"` ou `"None"`.

### `cookie_secure`

Défaut : `false`

Un booléen indiquant s'il faut utiliser un cookie sécurisé pour le cookie de session. Définir ceci sur `true` forcera les navigateurs à envoyer le cookie avec une requête chiffrée via le protocole HTTPS uniquement.

### `store`

Défaut : `"cookie"`

Une chaîne contenant l'identifiant du store utilisé pour gérer les sessions.

Par défaut, les sessions sont stockées dans un seul cookie. Les cookies ont une limite de taille de 4K, qui est généralement suffisante pour persister des choses comme un ID utilisateur et des messages flash. D'autres stores peuvent être implémentés et utilisés pour stocker les données de session ; voir [Sessions](../../handlers-and-http/sessions.md) pour plus de détails sur cette capacité.

## Paramètres de redirection SSL

Les paramètres de redirection SSL permettent de configurer la façon dont Marten redirige les requêtes non-HTTPS vers HTTPS lorsque le middleware [`Marten::Middleware::SSLRedirect`](../../handlers-and-http/reference/middlewares.md#ssl-redirect-middleware) est utilisé :

```crystal
config.ssl_redirect.host = "example-redirect.com"
config.exempted_paths = [/^\/no-ssl\/$/]
```

### `exempted_paths`

Défaut : `[] of Regex | String`

Permet de définir le tableau des chemins qui doivent être exemptés des redirections HTTPS. Les chaînes et les expressions régulières sont acceptées.

### `host`

Défaut : `nil`

Permet de définir l'hôte qui devrait être utilisé lors de la redirection des requêtes non-HTTPS. Si défini sur `nil`, la redirection HTTPS sera effectuée en utilisant l'hôte de la requête.

## Paramètres de politique de sécurité de transport stricte

Les paramètres de politique de sécurité de transport stricte permettent de configurer la façon dont Marten définit l'en-tête de réponse HTTP Strict-Transport-Security lorsque le middleware [`Marten::Middleware::StrictTransportSecurity`](../../handlers-and-http/reference/middlewares.md#strict-transport-security-middleware) est utilisé :

```crystal
config.strict_transport_security.max_age = 3_600
config.strict_transport_security.include_sub_domains = true
```

### `include_sub_domains`

Défaut : `false`

Définit si la directive `includeSubDomains` doit être insérée dans l'en-tête de réponse HTTP Strict-Transport-Security. Lorsque cette directive est définie, cela signifie que la politique s'appliquera également à tous les sous-domaines du site.

:::caution
Vous devriez être prudent lors de l'activation de cette option car cela empêchera les navigateurs de se connecter aux sous-domaines de votre site en utilisant HTTP pendant la durée définie par le paramètre [`max_age`](#max_age).
:::

### `max_age`

Défaut : `nil`

Définit la durée en secondes pendant laquelle les navigateurs doivent retenir que l'application web doit être accédée uniquement via HTTPS. Une valeur `nil` signifie que l'en-tête de réponse HTTP Strict-Transport-Security n'est pas inséré dans les réponses (ce qui équivaut à ne pas utiliser le middleware [`Marten::Middleware::StrictTransportSecurity`](../../handlers-and-http/reference/middlewares.md#strict-transport-security-middleware)).

:::caution
Vous devriez être prudent lors de la définition d'une valeur pour ce paramètre car cela empêchera les navigateurs de se connecter à votre site en utilisant HTTP pendant la durée que vous avez spécifiée.
:::

### `preload`

Défaut : `false`

Définit si la directive `preload` doit être insérée dans l'en-tête de réponse HTTP Strict-Transport-Security. Définir ceci sur `true` signifie que vous autorisez votre site à être soumis à la [liste de préchargement HSTS des navigateurs](https://hstspreload.org/) par les navigateurs.

## Paramètres des templates

Les paramètres des templates permettent de configurer la façon dont Marten découvre et rend les [templates](../../templates.mdx). Ces paramètres sont tous disponibles sous le namespace `templates` :

```crystal
config.templates.app_dirs = false
config.templates.cached = false
```

### `app_dirs`

Défaut : `true`

Un booléen indiquant si les templates doivent être recherchés dans les dossiers des applications installées (répertoires locaux `templates`). Lorsque ce paramètre est défini sur `true`, cela signifie que les templates fournis par les applications installées peuvent être chargés et rendus par le moteur de templates. Sinon, il ne serait pas possible de charger et de rendre ces templates d'application.

### `cached`

Défaut : `false`

Un booléen indiquant si les templates doivent être conservés dans un cache mémoire après avoir été chargés et analysés. Ce paramètre devrait probablement être défini sur `false` dans les environnements de développement (où les modifications des templates sont fréquentes) et sur `true` dans les environnements de production (pour éviter de charger et d'analyser les mêmes templates plusieurs fois).

### `context_producers`

Défaut : `[] of Marten::Template::ContextProducer.class`

Un tableau de classes de producteurs de contexte. Les producteurs de contexte sont des helpers qui s'assurent que les variables communes sont automatiquement insérées dans le contexte du template chaque fois qu'un template est rendu. Voir [Utiliser les producteurs de contexte](../../templates/introduction.md#using-context-producers) pour en savoir plus sur cette capacité.

### `dirs`

Défaut : `[] of String`

Un tableau de répertoires où les templates doivent être recherchés. L'ordre de ces répertoires est important car il définit l'ordre dans lequel les templates sont recherchés lors de la demande d'un template pour un chemin donné (ex. `foo/bar/template.html`).

Il convient de noter que des objets path ou des symboles peuvent également être utilisés pour configurer ce paramètre :

```crystal
config.templates.dirs = [
  Path["src/path1/templates"],
  :"src/path2/templates",
]
```

### `isolated_inclusions`

Défaut : `false`

Une option booléenne activant ou désactivant les inclusions isolées de templates lors de l'utilisation du tag de template [`include`](../../templates/reference/tags.md#include). Lorsque défini sur `true`, les templates inclus n'auront pas accès aux variables du contexte externe par défaut, sauf si le modificateur `contextual` est utilisé avec le tag de template `include`. Inversement, lorsque défini sur `false`, les templates inclus auront accès aux variables du contexte externe par défaut, sauf si cela est explicitement désactivé avec le modificateur `isolated` du tag de template `include`.

### `loaders`

Défaut : `nil`

Remplace le mécanisme de chargement des templates. Prend un tableau de classes héritant de `Marten::Template::Loader::Base`. Personnalisez ceci pour charger des templates depuis diverses sources comme des bases de données ou des structures en mémoire. Par exemple, pour charger des templates depuis un système de fichiers :

```crystal
config.templates.loaders = [Marten::Template::Loader::FileSystem.new("/path/to/templates")] of Marten::Template::Loader::Base
```

### `strict_variables`

Défaut : `false`

Un booléen permettant d'activer ou de désactiver les [variables strictes](../../templates/introduction.md#strict-variables) pour les templates. Lorsque ce paramètre est défini sur `true`, les variables inconnues rencontrées dans les templates entraîneront des exceptions [`Marten::Template::Errors::UnknownVariable`](https://martenframework.com/docs/api/dev/Marten/Template/Errors/UnknownVariable.html). Lorsque défini sur `false`, les variables inconnues seront simplement traitées comme des valeurs `nil` dans les templates.
