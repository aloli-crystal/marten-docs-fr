---
title: Context producers
description: Référence des context producers.
---

Cette page fournit une référence pour tous les context producers disponibles qui peuvent être utilisés lors du rendu de [templates](../introduction.md).

## Context producer Debug

**Classe :** [`Marten::Template::ContextProducer::Debug`](pathname:///api/dev/Marten/Template/ContextProducer/Debug.html)

Le context producer Debug contribue une variable `debug` au contexte : la valeur associée est `true` ou `false` selon que le [mode debug](../../development/reference/settings.md#debug) est activé ou non pour le projet.

## Context producer Flash

**Classe :** [`Marten::Template::ContextProducer::Flash`](pathname:///api/dev/Marten/Template/ContextProducer/Flash.html)

Le context producer Flash contribue une variable `flash` au contexte : cette variable correspond au [store flash](../../handlers-and-http/introduction.md#using-the-flash-store) associé à la requête HTTP courante. Si le contexte du template n'est pas initialisé avec un objet de requête HTTP, aucune variable n'est insérée.

## Context producer I18n

**Classe :** [`Marten::Template::ContextProducer::I18n`](pathname:///api/dev/Marten/Template/ContextProducer/I18n.html)

Le context producer I18n contribue des variables liées à l'I18n au contexte :

* `locale` : la locale courante
* `available_locales` : un tableau de toutes les locales disponibles qui peuvent être activées pour le projet

## Context producer Request

**Classe :** [`Marten::Template::ContextProducer::Request`](pathname:///api/dev/Marten/Template/ContextProducer/Request.html)

Le context producer Request contribue une variable `request` au contexte : cette variable correspond à l'objet de requête HTTP courante. Si le contexte du template n'est pas initialisé avec un objet de requête HTTP, aucune variable n'est insérée.
