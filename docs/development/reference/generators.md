---
title: Générateurs
description: Référence des générateurs.
toc_max_heading_level: 2
---

Cette page fournit une référence pour tous les générateurs disponibles et leurs options.

## `app`

**Utilisation :** `marten gen app [options] [label]`

Ajoute et configure une nouvelle [application](../applications.md) au projet actuel.

:::info
Ce générateur tentera d'ajouter l'application générée au paramètre [`installed_apps`](./settings.md#installed_apps) et configurera également les requires Crystal pour celle-ci (dans les fichiers `src/project.cr` et `src/cli.cr`).
:::

### Arguments

* `label` - Label de l'application à générer

### Exemples

```bash
marten gen app blogging # Générer une nouvelle application 'blogging'
```

## `auth`

**Utilisation :** `marten gen auth [options] [label]`

Génère et configure une application d'authentification entièrement fonctionnelle pour votre projet. Veuillez consulter [Authentification](../../authentication.mdx) pour en savoir plus sur l'authentification dans Marten, et [Fichiers générés](../../authentication/reference/generated-files.md) pour voir la liste des fichiers générés spécifiquement pour l'application d'authentification.

:::info
Ce générateur tentera d'ajouter l'application générée au paramètre [`installed_apps`](./settings.md#installed_apps) et configurera également les requires Crystal pour celle-ci (dans les fichiers `src/project.cr` et `src/cli.cr`). Il ajoutera également les paramètres liés à l'authentification à votre fichier de paramètres de base et ajoutera le shard [`marten-auth`](https://github.com/martenframework/marten-auth) au `shard.yml` de votre projet.
:::

### Arguments

* `label` - Label de l'application d'authentification à générer (par défaut "auth")

### Exemples

```bash
marten gen auth         # Générer une nouvelle application d'authentification avec le label 'auth'
marten gen auth my_auth # Générer une nouvelle application d'authentification avec le label 'my_auth'
```

## `email`

**Utilisation :** `marten gen email [options] [name]`

Génère un email. Veuillez consulter [Emailing](../../emailing.mdx) pour en savoir plus sur l'envoi d'emails dans Marten.

### Options

* `--app=APP` - Application cible où l'email doit être créé (par défaut l'[application principale](../applications.md#lapplication-principale))
* `--parent=PARENT` - Nom de la classe parente pour l'email généré

### Arguments

* `name` - Nom de l'email à générer (doit être en CamelCase)

### Exemples

```bash
marten gen email TestEmail            # Générer un nouvel email TestEmail dans l'application principale
marten gen email TestEmail --app blog # Générer un nouvel email TestEmail dans l'application blog
```

## `handler`

Génère un handler. Veuillez consulter [Handlers](../../handlers-and-http/introduction.md) pour en savoir plus sur les handlers.

### Options

* `--app=APP` - Application cible où le handler doit être créé (par défaut l'[application principale](../applications.md#lapplication-principale))
* `--parent=PARENT` - Nom de la classe parente pour le handler généré

### Arguments

* `name` - Nom du handler à générer (doit être en CamelCase)

### Exemples

```bash
marten gen handler TestHandler            # Générer un nouveau handler TestHandler dans l'application principale
marten gen handler TestHandler --app blog # Générer un nouveau handler TestHandler dans l'application blog
```

## `model`

Génère un modèle. Veuillez consulter [Modèles](../../models-and-databases/introduction.md) pour en savoir plus sur les modèles.

### Options

* `--app=APP` - Application cible où le modèle doit être créé (par défaut l'[application principale](../applications.md#lapplication-principale))
* `--parent=PARENT` - Nom de la classe parente pour le modèle généré
* `--no-timestamps` - Ne pas inclure les champs timestamp dans le modèle généré

### Arguments

* `name` - Nom du modèle à générer (doit être en CamelCase)
* `field_definitions` - Définitions des champs du modèle à générer

### Détails

Ce générateur peut générer un modèle avec le nom et les définitions de champs spécifiés. Le modèle est généré dans l'application spécifiée par l'option `--app` ou dans l'[application principale](../applications.md#lapplication-principale) si aucune application n'est spécifiée.

Les définitions de champs peuvent être spécifiées en utilisant les formats suivants :

```
name:type
name:type{qualifier}
name:type:modifier:modifier
```

Où `name` est le nom du champ et `type` est le type du champ.

`qualifier` peut être requis selon le type de champ considéré ; lorsque c'est le cas, il correspond à une option de champ obligatoire. Par exemple, `label:string{128}` produira un [champ string](../../models-and-databases/reference/fields.md#string) dont l'option `max_size` est définie sur `128`. Autre exemple : `author:many_to_one{User}` produira un [champ many-to-one](../../models-and-databases/reference/fields.md#many_to_one) dont l'option `to` est définie pour cibler le modèle `User`.

`modifier` est un modificateur de champ optionnel. Les modificateurs de champ sont utilisés pour spécifier des options de champ supplémentaires (mais non obligatoires). Par exemple : `name:string:uniq` produira un [champ string](../../models-and-databases/reference/fields.md#string) dont l'option `unique` est définie sur `true`. Autre exemple : `name:string:uniq:index` produira un [champ string](../../models-and-databases/reference/fields.md#string) dont les options `unique` et `index` sont définies sur `true`.

### Exemples

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

## `schema`

Génère un schema. Veuillez consulter [Schemas](../../schemas/introduction.md) pour en savoir plus sur les schemas.

### Options

* `--app=APP` - Application cible où le schema doit être créé (par défaut l'[application principale](../applications.md#lapplication-principale))
* `--parent=PARENT` - Nom de la classe parente pour le schema généré

### Arguments

* `name` - Nom du schema à générer (doit être en CamelCase)
* `field_definitions` - Définitions des champs du schema à générer

### Détails

Ce générateur peut générer un schema avec le nom et les définitions de champs spécifiés. Le schema est généré dans l'application spécifiée par l'option `--app` ou dans l'[application principale](../applications.md#lapplication-principale) si aucune application n'est spécifiée.

Les définitions de champs peuvent être spécifiées en utilisant les formats suivants :

```
name:type
name:type:modifier:modifier
```

Où `name` est le nom du champ et `type` est le type du champ.

`modifier` est un modificateur de champ optionnel. Les modificateurs de champ sont utilisés pour spécifier des options de champ supplémentaires (mais non obligatoires). Par exemple : `name:string:optional` produira un [champ string](../../schemas/reference/fields.md#string) dont l'option `required` est définie sur `false`.

### Exemples

```bash
# Générer un schema dans l'application principale :
marten gen schema ArticleSchema title:string body:string

# Générer un schema dans l'application blog :
marten gen schema ArticleSchema title:string body:string --app admin

# Générer un schema avec une classe parente :
marten gen schema ArticleSchema title:string body:string --parent BaseSchema
```

## `secretkey`

Génère une nouvelle valeur de clé secrète qui peut être utilisée dans le paramètre [`secret_key`](./settings.md#secret_key).

### Exemples

```bash
marten gen secretkey
```
