---
title: Commandes de gestion
description: Référence des commandes de gestion.
toc_max_heading_level: 2
---

Cette page fournit une référence pour toutes les commandes de gestion disponibles et leurs options.

## `clearsessions`

**Utilisation :** `marten clearsessions [options]`

Efface toutes les sessions expirées pour le store de sessions configuré.

Veuillez consulter [Sessions](../../handlers-and-http/sessions.md) pour en savoir plus sur les sessions.

### Options

* `--no-input` - N'affiche pas de messages d'invite à l'utilisateur

### Exemples

```bash
marten clearsessions            # Efface toutes les sessions expirées
marten clearsessions --no-input # Efface toutes les sessions expirées sans aucune invite
```

## `collectassets`

**Utilisation :** `marten collectassets [options]`

Collecte tous les assets et les copie dans un stockage unique.

Veuillez consulter [Gestion des assets](../../assets/introduction.md) pour en savoir plus sur quand et comment les assets sont "collectés".

### Options

* `--no-input` - N'affiche pas de messages d'invite à l'utilisateur
* `--fingerprint` - Attache une empreinte aux assets collectés
* `--manifest-path` - Configure l'emplacement de stockage du manifest.json. Pertinent uniquement si `--fingerprint` est activé. (par défaut `src/manifest.json`)

### Exemples

```bash
marten collectassets            # Collecte tous les assets
marten collectassets --no-input # Collecte tous les assets sans aucune invite
```

## `gen`

**Utilisation :** `marten gen [options] [generator] [arguments]`

Génère diverses structures, abstractions et valeurs au sein d'un projet existant.

### Options

Les générateurs prennent en charge leurs propres options spécifiques. Pour une liste exacte des options des générateurs, veuillez consulter la [référence des générateurs](./generators.md).

### Arguments

* `generator` - Nom du générateur à utiliser
* `arguments` - Arguments spécifiques au générateur

Les générateurs prennent en charge leurs propres arguments spécifiques. Pour une liste exacte des arguments des générateurs, veuillez consulter la [référence des générateurs](./generators.md).

### Exemples

```bash
marten gen secretkey                    # Générer une valeur de clé secrète
marten gen email WelcomeEmail           # Générer un email WelcomeEmail dans l'application principale
marten gen handler MyHandler --app=blog # Générer un handler MyHandler dans l'application blog
```

:::tip
Vous pouvez également utiliser l'alias `g` pour exécuter des générateurs spécifiques :

```bash
marten g model Test label:string:uniq
```
:::

## `genmigrations`

**Utilisation :** `marten genmigrations [options] [app_label]`

Génère de nouvelles migrations de base de données.

Cette commande analysera la définition de table correspondant à vos modèles actuels et la comparera aux tables équivalentes qui sont définies par vos fichiers de migration. Sur la base du résultat de cette analyse, un nouvel ensemble de migrations sera créé et persisté dans les dossiers `migrations` de vos applications. Veuillez consulter [Migrations](../../models-and-databases/migrations.md) pour en savoir plus sur ce mécanisme.

### Options

* `--empty` - Crée une migration vide

### Arguments

* `app_label` - Le nom d'une application pour laquelle générer des migrations (optionnel)

### Exemples

```bash
marten genmigrations             # Génère de nouvelles migrations pour toutes les applications installées
marten genmigrations foo         # Génère de nouvelles migrations pour l'application "foo"
marten genmigrations foo --empty # Génère une migration vide pour l'application "foo"
```

## `listmigrations`

**Utilisation :** `marten listmigrations [options] [app_label]`

Liste toutes les migrations de base de données disponibles.

Cette commande inspectera votre projet et vos applications installées pour lister les migrations disponibles, et indiquera si elles ont déjà été appliquées ou non. Veuillez consulter [Migrations](../../models-and-databases/migrations.md) pour en savoir plus sur ce mécanisme.

### Options

* `--db=ALIAS` - Permet de spécifier l'alias de la base de données sur laquelle les migrations seront appliquées ou annulées (par défaut `default`)

### Arguments

* `app_label` - Le nom d'une application pour laquelle lister les migrations (optionnel)

### Exemples

```bash
marten listmigrations     # Liste toutes les migrations pour toutes les applications installées
marten listmigrations foo # Liste toutes les migrations de l'application "foo"
```

## `migrate`

**Utilisation :** `marten migrate [options] [app_label] [migration]`

Exécute les migrations de base de données.

La commande `migrate` vous permet d'appliquer (ou d'annuler) des migrations sur vos bases de données. Par défaut, lorsqu'elle est exécutée sans arguments, elle exécutera toutes les migrations non appliquées pour vos applications installées. Cela dit, il est possible de s'assurer que seules les migrations d'une application spécifique sont appliquées en spécifiant un argument `app_label` supplémentaire. Pour annuler certaines migrations (ou en appliquer certaines jusqu'à une certaine version uniquement), il est possible de spécifier un autre argument `migration` correspondant à la version d'une migration ciblée. Veuillez consulter [Migrations](../../models-and-databases/migrations.md) pour en savoir plus sur ce mécanisme.

### Options

* `--fake` - Permet de marquer les migrations comme appliquées ou annulées sans les exécuter réellement
* `--plan` - Fournit un aperçu complet des opérations qui seront effectuées par les migrations appliquées ou annulées
* `--db=ALIAS` - Permet de spécifier l'alias de la base de données sur laquelle les migrations seront appliquées ou annulées (par défaut `default`)

### Arguments

* `app_label` - Le nom d'une application pour laquelle exécuter les migrations
* `migration` - Une cible de migration (nom ou version) jusqu'à laquelle la base de données devrait être migrée. Utilisez `zero` pour annuler toutes les migrations d'une application spécifique

### Exemples

```bash
marten migrate                     # Applique toutes les migrations non appliquées pour toutes les applications installées
marten migrate foo                 # Applique les migrations pour l'application "foo"
marten migrate foo 202203111821451 # Applique (ou annule) les migrations pour l'application "foo" jusqu'à la migration "202203111821451"
```

## `new`

**Utilisation :** `marten new [options] [type] [name]`

Initialise une nouvelle structure de dépôt de projet ou d'application Marten.

La commande de gestion `new` peut être utilisée pour créer soit un nouveau dépôt de projet soit un nouveau dépôt d'[application](../applications.md). Cela peut être pratique lors de la création de nouveaux projets, ou lors de la création de nouvelles applications destinées à être distribuées comme des shards dédiés, car cela garantit que vous suivez les bonnes pratiques et conventions de Marten.

La commande vous permet de définir entièrement le nom de votre projet ou application, et dans quel dossier il doit être créé.

### Options

* `-d DIR, --dir=DIR` - Un répertoire de destination optionnel
* `--with-auth` - Ajoute une application d'authentification aux projets nouvellement créés. Voir [Authentification](../../authentication.mdx) pour en savoir plus sur cette capacité
* `--with-image-support` - Ajoute le support des [champs image](../../models-and-databases/reference/fields.md#image) en s'assurant que le shard requis est ajouté au projet et requis dans le fichier `src/project.cr`.
* `--database` - Préconfigure la base de données de l'application. Actuellement `mysql`, `postgresql` et `sqlite3` sont supportés tandis que `none` peut être utilisé pour générer un projet sans base de données configurée. Voir [Paramètres de base de données](../../development/reference/settings.md#database-settings) pour plus d'informations
* `-e, --edge` - Utiliser la version de développement de Marten

### Arguments

* `type` - Le type de structure à créer (doit être soit `project` soit `app`)
* `name` - Le nom du projet ou de l'application à créer

:::tip
Les arguments `type` et `name` sont optionnels : s'ils ne sont pas fournis, un mode interactif sera utilisé et la commande demandera à l'utilisateur de saisir le type de structure, le nom de l'application ou du projet, et si l'application d'authentification doit être générée.
:::

### Exemples

```bash
marten new project myblog                         # Crée une structure de dépôt de projet "myblog"
marten new project myblog --dir=./projects/myblog # Crée un projet "myblog" dans le dossier "./projects/myblog"
marten new project myblog --database=postgresql   # Crée un projet "myblog" avec une base de données PostgreSQL
marten new project myblog --database=none         # Crée un projet "myblog" sans base de données configurée
marten new app auth                               # Crée une structure de dépôt d'application "auth"
```

## `play`

**Utilisation :** `marten play [options]`

Démarre un serveur Crystal playground initialisé pour le projet actuel.

### Options

* `-b HOST, --bind=HOST` - Lie le playground à l'IP spécifiée
* `-p PORT, --port=PORT` - Exécute le playground sur le port spécifié
* `--open` - Ouvre automatiquement le playground dans le navigateur par défaut

### Exemples

```bash
marten play        # Démarre le Crystal playground en utilisant l'hôte/port par défaut
marten play --open # Démarre le Crystal playground en utilisant l'hôte/port par défaut et l'ouvre dans le navigateur par défaut
```

## `resetmigrations`

**Utilisation :** `marten resetmigrations [options] [app_label]`

Réinitialise un ensemble existant de migrations en une seule. Veuillez consulter [Réinitialisation des migrations](../../models-and-databases/migrations.md#resetting-migrations) pour en savoir plus sur cette capacité.

### Arguments

* `app_label` - Le nom d'une application pour laquelle réinitialiser les migrations

### Exemples

```bash
marten resetmigrations foo # Réinitialise les migrations de l'application "foo"
```

## `routes`

**Utilisation :** `marten routes [options]`

Affiche toutes les routes de l'application.

## `seed`

**Utilisation :** `marten seed [options]`

Peuple la base de données en exécutant le fichier seed.

### Options

* `-f PATH, --file=PATH` - Spécifie un chemin personnalisé vers le fichier seed

## `serve`

**Utilisation :** `marten serve [options]`

Démarre un serveur de développement qui est automatiquement recompilé lorsque les fichiers sources changent.

### Options

* `-b HOST, --bind=HOST` - Permet de spécifier un hôte personnalisé pour la liaison
* `-p PORT, --port=PORT` - Permet de spécifier un port personnalisé pour écouter les connexions
* `--open` - Ouvre automatiquement le serveur dans le navigateur par défaut

### Exemples

```bash
marten serve         # Démarre un serveur de développement en utilisant l'hôte et le port configurés
marten serve -p 3000 # Démarre un serveur de développement en surchargeant le port
marten serve --open  # Démarre un serveur de développement et l'ouvre dans le navigateur par défaut
```

:::tip
Vous pouvez également utiliser l'alias `s` pour démarrer le serveur de développement :

```bash
marten s
```
:::

## `version`

**Utilisation :** `marten version [options]`

Affiche la version de Marten.
