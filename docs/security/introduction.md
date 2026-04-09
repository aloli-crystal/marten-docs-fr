---
title: La sécurité dans Marten
description: Découvrez les principales fonctionnalités de sécurité fournies par le framework Marten.
sidebar_label: Introduction
---

Ce document décrit les principales fonctionnalités de sécurité fournies par le framework web Marten.

## Protection contre les Cross-Site Request Forgery

Les attaques Cross-Site Request Forgery (CSRF) impliquent généralement un site web malveillant essayant d'effectuer des actions sur une application web au nom d'un utilisateur déjà authentifié.

Marten dispose d'un [mécanisme de protection CSRF](./csrf.md) intégré qui est automatiquement activé pour vos [handlers](../handlers-and-http.mdx). L'utilisation de ce mécanisme de protection CSRF est contrôlée par un ensemble de [paramètres dédiés](../development/reference/settings.md#csrf-settings).

:::caution
Vous devriez être prudent lorsque vous modifiez ces paramètres et éviter de désactiver cette protection sauf si cela est absolument nécessaire.
:::

La protection CSRF fournie par Marten est basée sur la vérification d'un token qui doit être fourni pour chaque requête HTTP non sûre (c'est-à-dire les requêtes dont les méthodes ne sont pas `GET`, `HEAD`, `OPTIONS` ou `TRACE`). Ce token est stocké dans les cookies du client et il doit être spécifié lors de la soumission de requêtes non sûres (soit dans les données elles-mêmes soit en utilisant un en-tête spécifique) : si les tokens ne sont pas valides, ou si le token basé sur le cookie ne correspond pas à celui fourni dans les données, alors cela signifie que la requête est malveillante et qu'elle doit être rejetée.

Vous pouvez en savoir plus sur la protection CSRF fournie par Marten et les outils associés dans la [documentation dédiée](./csrf.md).

## Protection contre le clickjacking

Les attaques de clickjacking impliquent un site web malveillant intégrant un autre site web non protégé dans un cadre. Cela peut conduire les utilisateurs à effectuer des actions non intentionnelles sur le site ciblé.

Marten dispose d'un [mécanisme de protection contre le clickjacking](./clickjacking.md) intégré, qui implique l'utilisation d'un middleware dédié (le [middleware X-Frame-Options](../handlers-and-http/reference/middlewares.md#x-frame-options-middleware)). Ce middleware est toujours automatiquement activé pour les projets générés via la commande de gestion [`new`](../development/reference/management-commands.md#new) et, comme son nom l'indique, il implique la définition de l'en-tête X-Frame-Options afin d'empêcher le site Marten considéré d'être inséré dans un cadre.

Vous pouvez en savoir plus sur la protection contre le clickjacking fournie par Marten et les outils associés dans la [documentation dédiée](./clickjacking.md).

## Protection contre le Cross Site Scripting

Les attaques Cross Site Scripting (XSS) impliquent un utilisateur malveillant injectant des scripts côté client dans le navigateur d'un autre utilisateur. Cela se produit généralement lors du rendu de données HTML stockées en base de données ou lors de la génération de contenu HTML et de son affichage dans un navigateur : si ces contenus HTML ne sont pas correctement assainis, alors cela peut permettre l'exécution du JavaScript d'un attaquant dans le navigateur.

Pour prévenir cela, les [templates](../templates.mdx) Marten échappent automatiquement les contenus HTML dans les sorties de variables, sauf si ceux-ci sont marqués comme "safe". Vous pouvez en savoir plus sur cette capacité dans [Auto-Escaping](../templates/introduction.md#auto-escaping).

Il convient de noter que ce mécanisme d'auto-échappement peut être désactivé en utilisant un [filtre](../templates/reference/filters.md#safe) spécifique si nécessaire, mais vous devriez être conscient des risques en le faisant et vous assurer que vos contenus HTML sont correctement assainis afin d'éviter les vulnérabilités XSS.

## Protection contre les attaques par en-tête HTTP Host

Les attaques par en-tête HTTP Host se produisent lorsque des sites web qui traitent la valeur de l'en-tête Host (par exemple pour générer des URLs pleinement qualifiées) font confiance implicitement à cette valeur d'en-tête sans la vérifier.

Marten implémente un mécanisme de protection contre ce type d'attaque en validant l'en-tête Host par rapport à un ensemble d'hôtes explicitement autorisés qui doivent être spécifiés dans le paramètre [`allowed_hosts`](../development/reference/settings.md#allowed_hosts). L'en-tête X-Forwarded-Host peut également être utilisé pour déterminer l'hôte si l'utilisation de cet en-tête est activée (paramètre [`use_x_forwarded_host`](../development/reference/settings.md#use_x_forwarded_host)).

## Protection contre l'injection SQL

Les attaques par injection SQL se produisent lorsqu'un utilisateur malveillant est capable d'exécuter des requêtes SQL arbitraires sur une base de données, ce qui se produit généralement lors de la soumission de données d'entrée à une application web. Cela peut entraîner la fuite et/ou l'altération des enregistrements de la base de données.

L'API de [query sets](../models-and-databases/queries.md) fournie par Marten génère du code SQL en utilisant la paramétration des requêtes. Cela signifie que le code réel d'une requête est défini séparément de ses paramètres, ce qui garantit que tout paramètre fourni par l'utilisateur est échappé par le driver de base de données considéré avant l'exécution de la requête.

## Content Security Policy

L'en-tête [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) est un ensemble de directives que le navigateur suit pour autoriser des sources spécifiques pour les scripts, les styles, le contenu embarqué et plus encore. Il garantit que seules ces sources approuvées sont autorisées tout en bloquant toutes les autres sources.

Marten dispose d'un [mécanisme Content Security Policy](./content-security-policy.md) intégré, qui implique l'utilisation d'un middleware dédié (le [middleware Content-Security-Policy](../handlers-and-http/reference/middlewares.md#content-security-policy-middleware)). Ce middleware garantit la présence de l'en-tête Content-Security-Policy dans les en-têtes de la réponse.

Vous pouvez en savoir plus sur l'en-tête Content-Security-Policy et comment le configurer dans la [documentation dédiée](./content-security-policy.md).
