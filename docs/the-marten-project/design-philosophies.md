---
title: Philosophies de conception
description: Découvrez les philosophies de conception derrière le framework web Marten.
---

Ce document présente les philosophies de conception fondamentales qui ont influencé la création du framework web Marten. Il cherche à donner un aperçu du passé et à servir de référence pour l'avenir.

## Simple et facile à utiliser

Marten s'efforce de garantir que tout ce qu'il permet est aussi simple que possible et que la syntaxe fournie pour interagir avec les composants du framework reste évidente et facile à retenir (et certainement pas complexe ou obscure). Le framework rend aussi facile que possible l'exploitation de ses capacités et la réalisation d'opérations CRUD.

## Complet

Marten adhère à la philosophie "batteries incluses". Dès son installation, il fournit les outils et fonctionnalités couramment requis par les applications web : [ORM](../models-and-databases/introduction.md), [migrations](../models-and-databases/migrations.md), [traductions](../i18n/introduction.md), [moteur de templates](../templates/introduction.md), [sessions](../handlers-and-http/sessions.md), [envoi d'emails](../emailing/introduction.md) et [authentification](../authentication/introduction.md).

## Extensible

Marten donne aux développeurs la possibilité de contribuer facilement des fonctionnalités supplémentaires au framework. Des éléments comme les [implémentations de champs de modèle personnalisés](../models-and-databases/how-to/create-custom-model-fields.md), les [nouveaux types de paramètres de route](../handlers-and-http/how-to/create-custom-route-parameters.md), les [stores de session](../handlers-and-http/sessions.md#session-stores), etc. peuvent tous être enregistrés facilement dans le framework.

## Neutre vis-à-vis de la base de données

L'ORM du framework est et devrait rester utilisable avec plusieurs backends de base de données (notamment MariaDB, MySQL, PostgreSQL et SQLite).

## Orienté applications

Marten permet de séparer les projets en un ensemble d'« [applications](../development/applications.md) » logiques, ce qui contribue à améliorer l'organisation du code et facilite le travail de plusieurs développeurs sur différents composants. Chaque application peut apporter des abstractions et fonctionnalités spécifiques à un projet comme des modèles et des migrations, des templates, des handlers HTTP et des routes, etc. Ces applications peuvent également être extraites dans des shards Crystal afin de contribuer des fonctionnalités et comportements à d'autres projets Marten. L'objectif derrière cette capacité est de permettre la création d'un puissant écosystème d'applications au fil du temps et d'encourager la "réutilisabilité" et la "modularité".

:::tip
Dans cette optique, le dépôt [Awesome Marten](https://github.com/martenframework/awesome-marten) répertorie les applications que vous pouvez exploiter dans vos projets.
:::

## Orienté backend

Le framework est intentionnellement très "orienté backend" car l'idée est de ne pas faire trop d'hypothèses sur la manière dont le code frontend et les assets doivent être structurés, empaquetés ou regroupés. Le framework ne peut pas tenir compte de toutes les façons dont les assets peuvent être empaquetés et/ou regroupés et ne préconise pas de solutions spécifiques dans ce domaine. Certains projets peuvent nécessiter une stratégie webpack pour regrouper les assets, certains peuvent nécessiter une étape de fingerprinting en plus, et d'autres peuvent avoir besoin de quelque chose de complètement différent. La manière dont ces chaînes d'outils sont configurées ou mises en place est laissée à la discrétion des développeurs d'applications web, et le framework se contente de faciliter le [référencement de ces assets](../assets/introduction.md) et leur [collecte](../assets/introduction.md#serving-assets-in-production) au moment du déploiement pour les envoyer vers leur destination finale.
