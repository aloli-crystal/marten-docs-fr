---
title: Contribuer au projet Marten
description: Découvrez comment commencer à contribuer au projet Marten.
sidebar_label: Contribuer
---

Marten est un grand projet qui continuera d'évoluer au fil du temps. Si vous le souhaitez, il existe de nombreuses façons de vous impliquer !

## Avant toute chose...

Le projet Marten adhère au [Code de conduite Contributor Covenant](https://github.com/martenframework/marten/blob/main/CODE_OF_CONDUCT.md). Toute personne contribuant au projet Marten est tenue de respecter ce code.

## Signaler des problèmes

Vous devez utiliser le [système de suivi des problèmes du projet](https://github.com/martenframework/marten/issues) hébergé sur GitHub si vous avez trouvé un bug ou si vous souhaitez proposer une nouvelle fonctionnalité.

### À propos des rapports de bugs

Si vous avez trouvé un bug lié au framework web Marten **qui n'est pas un problème de sécurité**, alors vous devez (i) rechercher dans les [problèmes existants](https://github.com/martenframework/marten/issues) pour vérifier qu'il n'a pas déjà été signalé et (ii) [créer un nouveau problème](https://github.com/martenframework/marten/issues/new) si ce n'est pas le cas. N'oubliez pas d'inclure autant de détails que possible dans vos tickets : une description explicative du problème en question et comment le reproduire, des extraits de code et/ou des traces d'erreurs si cela est approprié, etc.

### À propos des problèmes de sécurité

Si vous avez trouvé un problème de sécurité, veuillez **ne pas ouvrir un problème GitHub**. Envoyez plutôt un email à `security@martenframework.com`. Nous examinerons alors ensemble le problème pour le résoudre afin de pouvoir faire une annonce concernant la solution en même temps que la vulnérabilité.

## Contribuer du code

La façon privilégiée de contribuer au framework Marten est de soumettre des pull requests vers le [dépôt GitHub](https://github.com/martenframework/marten) du projet. Si vous ne savez pas par où commencer et souhaitez commencer à contribuer du code au framework Marten, vous pouvez consulter les [Good first issues](https://github.com/martenframework/marten/issues?q=is%3Aissue+is%3Aopen+label%3A%22Good+first+issue%22).

Vous trouverez ci-dessous quelques conseils généraux concernant la contribution de code : environnements de développement, exécution des tests, etc.

### Environnement de développement

:::info
Les étapes suivantes supposent que vous avez au moins [git](https://git-scm.com/), [Crystal](https://crystal-lang.org/) et [Node.js](https://nodejs.org) installés sur votre système.
:::

Tout d'abord, vous devez [forker](https://github.com/martenframework/marten/fork) le dépôt git de Marten. Ensuite, vous pouvez obtenir une copie locale du projet en utilisant la commande suivante :

```bash
git clone git@github.com:<username>/marten.git
```

Une fois cela fait, vous devez vous placer dans le répertoire `marten` et installer les dépendances du framework en exécutant la commande suivante :

```bash
make
```

Cela installera un ensemble de shards Crystal et quelques dépendances Node.js (qui sont nécessaires pour travailler sur la documentation basée sur [Docusaurus](https://docusaurus.io/)).

### Configurer un projet de test avec Marten

Cette section explique comment créer et configurer un projet de test en utilisant l'environnement de développement Marten. Cela vous permet d'expérimenter et de développer des fonctionnalités de manière isolée, en vous assurant que tout fonctionne correctement avant de valider des modifications dans la base de code principale.

#### Créer un nouveau projet de test

Commencez par créer un nouveau projet de test en utilisant l'outil CLI de Marten :

```bash
./path/to/development/marten new project test-project [options]
```

Remplacez `test-project` par le nom de projet souhaité. Après l'installation, placez-vous dans le répertoire du projet.

#### Configurer l'environnement de test

Pour utiliser le projet Marten de développement au lieu de celui fourni par `shard.yml`, vous devez créer un fichier `shard.override.yml`.

```yaml
name: test-project
version: 0.1.0

dependencies:
  marten:
    path: /path/to/development/marten
```

Exécutez `shards install`. Votre projet de test est maintenant configuré pour utiliser votre environnement de développement Marten local.

### Style de code

De manière générale, Marten essaie de se conformer au [guide de style](https://crystal-lang.org/reference/conventions/coding_style.html) de Crystal et vous devez vous assurer que vos modifications s'y conforment également si vous contribuez du code au projet.

En plus de cela, la base de code de Marten est vérifiée à l'aide d'[ameba](https://github.com/crystal-ameba/ameba) et via la commande standard [`crystal tool format`](https://crystal-lang.org/reference/man/crystal/index.html#crystal-tool-format). Chaque pull request ouverte sur le [dépôt GitHub de Marten](https://github.com/martenframework/marten) sera automatiquement vérifiée à l'aide de ces outils. Si nécessaire, vous pouvez vérifier que ces contrôles passent localement en exécutant les commandes suivantes :

```bash
make qa            # Run both ameba and the Crystal formatting checks
make lint          # Run ameba checks only
make format_checks # Run Crystal formatting checks only
```

De plus, vous pouvez également appliquer le formatage par défaut de Crystal à la base de code en exécutant :

```bash
make format
```

### Tests

Vous ne devez pas soumettre de pull requests sans fournir de tests. Marten utilise le module standard [spec](https://crystal-lang.org/reference/guides/testing.html) et dispose d'une suite de tests étendue.

Les specs doivent être définies dans le dossier `spec`, à la racine du dépôt du projet. Vous pouvez exécuter l'ensemble de la suite de tests en utilisant la commande suivante (qui est équivalente à exécuter `crystal spec`) :

```bash
make tests
```

Par défaut, les specs seront exécutées en utilisant une base de données SQLite en mémoire. Si vous le souhaitez, vous pouvez configurer des bases de données supplémentaires en mettant à jour le fichier `.spec.env.json` qui devrait avoir été automatiquement généré par la commande `make` précédente (cf. [Environnement de développement](#environnement-de-développement)). Ce fichier définit un ensemble de valeurs de paramètres "d'environnement" qui sont automatiquement utilisées pour configurer le projet de test utilisé lors de l'exécution des specs. Il ressemble à ceci :

```json title=.spec.env.json
{
  "MARIADB_DEFAULT_DB_NAME": "example",
  "MARIADB_OTHER_DB_NAME": "other_example",
  "MARIADB_DB_USER": "example",
  "MARIADB_DB_PASSWORD": "",
  "MARIADB_DB_HOST": "",
  "MYSQL_DEFAULT_DB_NAME": "example",
  "MYSQL_OTHER_DB_NAME": "other_example",
  "MYSQL_DB_USER": "example",
  "MYSQL_DB_PASSWORD": "",
  "MYSQL_DB_HOST": "",
  "POSTGRESQL_DEFAULT_DB_NAME": "example",
  "POSTGRESQL_OTHER_DB_NAME": "other_example",
  "POSTGRESQL_DB_USER": "example",
  "POSTGRESQL_DB_PASSWORD": "",
  "POSTGRESQL_DB_HOST": ""
}
```

Comme vous pouvez le voir, vous devez spécifier deux bases de données pour chaque backend de base de données (MariaDB, MySQL et PostgreSQL). Cela est obligatoire car les specs de Marten testent également les cas où plusieurs bases de données sont configurées et utilisées simultanément pour le même projet.

Les specs sont toujours exécutées en utilisant un _seul_ backend de base de données. Comme mentionné précédemment, ce backend est celui de SQLite par défaut, mais vous pouvez spécifier celui à utiliser lors de l'exécution des specs en définissant la variable d'environnement `MARTEN_SPEC_DB_CONNECTION`. Par exemple :

```bash
MARTEN_SPEC_DB_CONNECTION=mariadb make tests    # Will run specs using the MariaDB DB backend
MARTEN_SPEC_DB_CONNECTION=mysql make tests      # Will run specs using the MySQL DB backend
MARTEN_SPEC_DB_CONNECTION=postgresql make tests # Will run specs using the PostgreSQL DB backend
```

### Documentation

La documentation de Marten est rédigée en Markdown. Elle est alimentée par [Docusaurus](https://docusaurus.io/) et se trouve dans le dossier `docs`.

Pour lancer le serveur de documentation en local, vous pouvez vous placer dans `docs` et utiliser la commande suivante :

```bash
npm run start
```

Cela démarrera le serveur Docusaurus à l'adresse [http://localhost:3000/docs/](http://localhost:3000/docs/) et vous pourrez facilement voir et tester les modifications que vous apportez aux fichiers sources de la documentation.
