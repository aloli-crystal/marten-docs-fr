---
title: Middlewares
description: Apprenez à exploiter les middlewares pour modifier les requêtes et réponses HTTP.
sidebar_label: Middlewares
---


Les middlewares sont utilisés pour se « brancher » sur le cycle requête/réponse de Marten. Ils peuvent être utilisés pour modifier ou implémenter une logique basée sur les requêtes HTTP entrantes et les réponses HTTP résultantes. Ces hooks prennent une requête HTTP en entrée et produisent une réponse HTTP en sortie ; dans le processus, ils peuvent implémenter toute logique qu'ils jugent nécessaire pour effectuer des actions basées sur la requête entrante et/ou la réponse associée.

## Comment fonctionnent les middlewares

Les middlewares sont des sous-classes de la classe abstraite [`Marten::Middleware`](https://martenframework.com/docs/api/dev/Marten/Middleware.html). Ils doivent implémenter une méthode `#call` qui prend un objet de requête (instance de [`Marten::HTTP::Request`](https://martenframework.com/docs/api/dev/Marten/HTTP/Request.html)) et un proc `get_response` (permettant d'obtenir la réponse finale) comme arguments, et qui retourne un objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html) :

```crystal
class TestMiddleware < Marten::Middleware
  def call(request : Marten::HTTP::Request, get_response : Proc(Marten::HTTP::Response)) : Marten::HTTP::Response
    # Do something with the request object.

    response = get_response.call

    # Do something with the response object.

    response
  end
end
```

Le proc `get_response` appellera soit le middleware suivant dans la chaîne de middlewares, soit le handler traitant la requête et retournant la réponse. Lequel de ces deux est effectivement appelé est un détail masqué par le proc `get_response`, et cela n'a pas d'importance au niveau d'un middleware individuel.

## Activer les middlewares

Pour être utilisées, les classes de middleware doivent être spécifiées dans le paramètre [`middleware`](../development/reference/settings.md#middleware). Ce paramètre est un tableau de classes de middleware qui définit la « chaîne » de middlewares qui seront « branchés » sur le cycle requête/réponse de Marten.

Par exemple :

```crystal
config.middleware = [
  Marten::Middleware::Session,
  Marten::Middleware::I18n,
  Marten::Middleware::GZip,
]
```

Il convient de noter que l'ordre des middlewares est important. Par exemple, si l'un de vos middlewares dépend d'une valeur de session, vous voudrez vous assurer qu'il apparaît _après_ la classe `Marten::Middleware::Session` dans le paramètre `middleware`.

## Middlewares disponibles

Tous les middlewares disponibles sont listés dans la [section de référence dédiée](./reference/middlewares.md).
