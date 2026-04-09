---
title: Handlers d'erreur
description: Découvrez les handlers d'erreur intégrés et comment les configurer.
sidebar_label: Handlers d'erreur
---

Marten fournit des handlers d'erreur par défaut que vous pouvez exploiter pour afficher des conditions d'erreur spécifiques à vos utilisateurs : lorsqu'une page n'est pas trouvée, lorsqu'une opération est interdite, en cas d'erreur serveur, etc.

## Les handlers d'erreur par défaut

Marten fournit des handlers d'erreur par défaut pour les situations suivantes :

* lorsqu'**un enregistrement ou une route n'est pas trouvé(e)**, il retournera une réponse Page Non Trouvée (404) par défaut
* lorsqu'**une erreur inattendue survient**, il retournera une réponse Erreur Interne du Serveur (500) par défaut
* lorsqu'**une opération suspecte est détectée**, il retournera une réponse Requête Incorrecte (400) par défaut
* lorsqu'**une action est interdite**, il retournera une réponse Interdit (403) par défaut

Notez que vous n'avez pas besoin d'interagir manuellement avec ces handlers d'erreur par défaut : ils sont automatiquement utilisés par le serveur Marten lorsque les conditions d'erreur ci-dessus sont remplies.

### Page Non Trouvée (404)

Une réponse Page Non Trouvée (404) est automatiquement retournée par le handler [`Marten::Handlers::Defaults::PageNotFound`](pathname:///api/dev/Marten/Handlers/Defaults/PageNotFound.html) lorsque :

* une route ne peut pas être trouvée pour une requête entrante
* l'exception [`Marten::HTTP::Errors::NotFound`](pathname:///api/dev/Marten/HTTP/Errors/NotFound.html) est levée

:::info
Si votre projet s'exécute en mode debug, Marten affichera automatiquement une page différente contenant des informations spécifiques sur la requête originale au lieu d'utiliser le handler Page Non Trouvée par défaut.
:::

### Erreur Interne du Serveur (500)

Une réponse Erreur Interne du Serveur (500) est automatiquement retournée par le handler [`Marten::Handlers::Defaults::ServerError`](pathname:///api/dev/Marten/Handlers/Defaults/ServerError.html) lorsqu'une exception non gérée est interceptée par le serveur Marten.

:::info
Si votre projet s'exécute en mode debug, Marten affichera automatiquement une page différente contenant des informations spécifiques sur l'erreur survenue (traceback, détails de la requête, etc) au lieu d'utiliser le handler Erreur Interne du Serveur par défaut.
:::

### Requête Incorrecte (400)

Une réponse Requête Incorrecte (400) est automatiquement retournée par le handler [`Marten::Handlers::Defaults::BadRequest`](pathname:///api/dev/Marten/Handlers/Defaults/BadRequest.html) lorsque l'exception [`Marten::HTTP::Errors::SuspiciousOperation`](pathname:///api/dev/Marten/HTTP/Errors/SuspiciousOperation.html) est levée.

### Interdit (403)

Une réponse Interdit (403) est automatiquement retournée par le handler [`Marten::Handlers::Defaults::PermissionDenied`](pathname:///api/dev/Marten/Handlers/Defaults/PermissionDenied.html) lorsque l'exception [`Marten::HTTP::Errors::PermissionDenied`](pathname:///api/dev/Marten/HTTP/Errors/PermissionDenied.html) est levée.

## Personnaliser les handlers d'erreur

Chacun des handlers d'erreur mentionnés ci-dessus peut être facilement personnalisé : par défaut, ils fournissent une réponse serveur « brute » avec un message standard, et il peut être pertinent sur la base d'un projet de personnaliser la manière dont ils s'affichent à vos utilisateurs. À ce titre, chaque handler est associé à un nom de template dédié qui sera rendu si votre projet le définit. Chacun de ces handlers peut également être remplacé par un handler personnalisé en utilisant les paramètres appropriés.

Ces options de personnalisation sont listées ci-dessous :

| Erreur | Nom du template | Paramètre du handler | 
| ----- | ------------- | ------------ |
| Page Non Trouvée (404) | `404.html` | [`handler404`](../development/reference/settings.md#handler404) |
| Erreur Interne du Serveur (500) | `500.html` | [`handler500`](../development/reference/settings.md#handler500) |
| Requête Incorrecte (400) | `400.html` | [`handler400`](../development/reference/settings.md#handler400) |
| Interdit (403) | `403.html` | [`handler403`](../development/reference/settings.md#handler403) |

Par exemple, vous pourriez définir un template « Page Non Trouvée » par défaut en définissant un fichier de template HTML `404.html` dans le dossier `templates` de votre projet.
