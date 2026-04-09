---
title: Déployer des projets Marten
description: Découvrez les éléments à considérer lors du déploiement d'applications web Marten.
sidebar_label: Introduction
---

Cette section décrit ce qui est impliqué lors du déploiement d'une application web Marten et met en évidence certaines choses importantes à considérer avant d'effectuer des déploiements.

## Vue d'ensemble

Chaque pipeline de déploiement est unique et variera d'un projet à l'autre. Cela dit, quelques éléments et exigences seront couramment rencontrés lors du déploiement d'un projet Marten :

1. installer les dépendances de votre projet
2. compiler le serveur de votre projet et le [CLI de gestion](../development/management-commands.md)
3. collecter les [assets](../assets/introduction.md) de votre projet
4. appliquer les migrations en attente à votre base de données
5. démarrer le serveur compilé

Où, quand et comment ces étapes sont effectuées variera d'un projet à l'autre. Chacune de ces étapes est détaillée ci-dessous avec quelques recommandations.

Il convient également de noter que quelques guides mettant en évidence des stratégies de déploiement courantes peuvent être utilisés si nécessaire :

* [Déployer sur un serveur Ubuntu](./how-to/deploy-to-an-ubuntu-server)

### Installer les dépendances

L'une des premières choses à faire lors du déploiement d'un projet Marten est de s'assurer que les dépendances du projet sont disponibles. Dans cette optique, vous pouvez utiliser la commande `shards install` pour installer les dépendances Crystal de votre projet (en supposant que Crystal est installé sur votre machine de destination). Évidemment, votre projet peut nécessiter l'installation d'autres types de dépendances (comme des dépendances Node.js par exemple), dont vous devez vous occuper également.

### Compiler votre projet

Le serveur de votre projet et le [CLI de gestion](../development/management-commands.md) doivent être compilés pour exécuter le serveur de votre projet et pour exécuter des commandes de gestion supplémentaires liées au déploiement (ex. pour [collecter les assets](#collecter-les-assets) ou [appliquer les migrations](#appliquer-les-migrations)).

Concernant le serveur de votre projet, vous devrez généralement compiler le fichier `src/server.cr` (qui est automatiquement créé lors de la génération de nouveaux projets via la commande de gestion [`new`](../development/reference/management-commands.md#new)). Cela peut être réalisé avec la commande suivante :

```bash
crystal build src/server.cr -o bin/server --release
```

:::tip
Dans l'exemple ci-dessus, le binaire du serveur est compilé en utilisant l'option `-o bin/server`, ce qui garantit que le binaire compilé sera nommé `server` et stocké dans le dossier `bin` associé. Vous devriez évidemment adapter cela à votre environnement de production.
:::

Le [CLI de gestion](../development/management-commands.md) est fourni par le fichier `manage.cr` situé à la racine de votre projet. Comme d'habitude, ce fichier est également généré automatiquement pour vous lors de la création de projets Marten via la commande de gestion [`new`](../development/reference/management-commands.md#new). La compilation de ce binaire peut être effectuée avec la commande suivante :

```bash
crystal build manage.cr -o bin/manage --release
```

:::info
Les commandes de compilation ci-dessus utilisent le flag `--release`, qui active les optimisations du compilateur. En conséquence, la compilation des binaires finaux peut prendre un certain temps selon votre projet. Vous pouvez également éviter d'utiliser `--release` si nécessaire mais techniquement les performances pourraient être impactées. Voir [Release builds](https://crystal-lang.org/reference/man/crystal/index.html#release-builds) pour plus de détails sur ce sujet.
:::

### Collecter les assets

Vous devez vous assurer que les assets de votre projet et de vos applications (ex. JavaScripts, fichiers CSS, etc.) sont "collectés" au moment du déploiement afin qu'ils soient placés à la destination finale depuis laquelle ils seront servis : cette opération est rendue disponible via la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets). Cette "destination" dépend de votre stratégie de déploiement et de vos [paramètres d'assets](../development/reference/settings.md#assets-settings) configurés : cela peut être aussi simple que de déplacer tous ces assets dans un dossier dédié sur votre serveur (afin qu'ils puissent être servis par votre serveur web), ou cela peut impliquer le téléchargement de ces assets vers un bucket S3 ou GCS par exemple.

Pour collecter les assets au moment du déploiement, vous voudrez utiliser le binaire `manage` compilé et exécuter la commande de gestion [`collectassets`](../development/reference/management-commands.md#collectassets) (comme mentionné précédemment) avec le flag `--no-input` défini pour désactiver les invites utilisateur :

```bash
bin/manage collectassets --no-input
```

:::info
La documentation sur la gestion des assets fournit également quelques [directives](../assets/introduction.md#serving-assets-in-production) sur la façon de servir les fichiers d'assets en production qui méritent d'être lues.
:::

### Appliquer les migrations

Vos projets utiliseront probablement des modèles, ce qui signifie que vous devrez vous assurer que ceux-ci sont correctement créés au niveau de votre base de données configurée en exécutant les migrations associées.

Pour ce faire, vous pouvez utiliser le binaire `manage` compilé et exécuter la commande de gestion [`migrate`](../development/reference/management-commands.md#migrate) :

```bash
bin/manage migrate
```

Veuillez consulter [Migrations](../models-and-databases/migrations.md) pour en savoir plus sur les migrations de modèles.

### Exécuter le serveur

Vous pouvez exécuter le serveur Marten compilé en utilisant la commande suivante (évidemment l'emplacement du binaire dépend de [la façon dont la compilation a été effectuée](#compiler-votre-projet)) :

```bash
bin/server
```

Il est important de noter que le serveur Marten est destiné à être utilisé derrière un reverse proxy tel que [Nginx](https://www.nginx.com/) ou [Apache](https://httpd.apache.org/) : vous voudrez généralement configurer un tel reverse proxy pour qu'il cible l'hôte et le port de votre serveur Marten configuré. Dans cette optique, vous devriez vous assurer que votre serveur Marten n'utilise pas le port HTTP 80 (il pourrait plutôt utiliser quelque chose comme 8080 ou 8000 par exemple).

Selon vos cas d'utilisation, un reverse proxy vous permettra également de servir facilement d'autres contenus tels que des [assets](../assets/introduction.md) ou des [fichiers téléchargés](../files/managing-files.md), et d'utiliser SSL/TLS.

:::tip
Il est possible d'exécuter plusieurs processus du même serveur derrière un reverse proxy tel que Nginx. En effet, chaque serveur compilé peut accepter des paramètres optionnels pour surcharger l'hôte et/ou le port utilisés. Ces paramètres sont respectivement `--bind` (ou `-b`) et `--port` (ou `-p`). Par exemple :

```bash
bin/server -b 127.0.0.1
bin/server -p 8080
```
:::

## Conseils supplémentaires

Cette section liste quelques éléments supplémentaires à considérer lors du déploiement de projets Marten.

### Sécuriser les valeurs de paramètres critiques

Vous devriez prêter attention à la valeur de certains de vos paramètres dans les environnements de production.

#### Mode debug

Vous devriez vous assurer que le paramètre [`debug`](../development/reference/settings.md#debug) est toujours défini sur `false` dans les environnements de production. En effet, le mode debug peut aider à des fins de développement car il affiche des tracebacks utiles et des informations liées au site. Mais il y a un risque que toutes ces informations fuient quelque part si vous activez ce mode en production.

#### Clé secrète

Vous devriez vous assurer que la valeur du paramètre [`secret_key`](../development/reference/settings.md#secret_key) n'est pas codée en dur dans vos [fichiers de configuration](../development/settings.md). En effet, cette valeur de paramètre doit être gardée secrète et vous devriez vous assurer qu'elle est chargée dynamiquement à la place. Par exemple, la valeur de ce paramètre pourrait être définie dans une variable d'environnement dédiée (ou un fichier dotenv) et chargée comme suit :

```crystal
Marten.configure do |config|
  config.secret_key = ENV.fetch("MARTEN_SECRET_KEY") { raise "Missing MARTEN_SECRET_KEY env variable" }

  # [...]
end
```

:::tip
Il est possible de générer une nouvelle clé secrète en utilisant les outils disponibles.
Marten fournit un générateur de clé secrète qui peut être utilisé pour générer une clé aléatoire qui peut ensuite être stockée dans une variable d'environnement.

```bash
bin/manage gen secretkey
```
:::
