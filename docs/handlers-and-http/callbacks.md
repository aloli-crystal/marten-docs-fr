---
title: Callbacks de handler
description: Apprenez à définir des callbacks de handler.
sidebar_label: Callbacks
---

Les callbacks vous permettent de définir une logique qui est déclenchée à différentes étapes du cycle de vie d'un handler. Cette fonctionnalité vous permet d'intercepter les requêtes entrantes et de potentiellement contourner la méthode standard `#dispatch`. Ce document couvre les callbacks disponibles et vous présente l'API associée, que vous pouvez utiliser pour définir des hooks dans vos handlers.

## Vue d'ensemble

Comme indiqué ci-dessus, les callbacks sont des méthodes qui seront appelées lorsque des événements spécifiques se produisent pour une instance de handler spécifique. Ils doivent être enregistrés explicitement dans vos classes de handler. Il existe de nombreux types de callbacks : certains sont [partagés entre tous les types de handlers](#callbacks-partagés-entre-handlers) tandis que d'autres sont spécifiques à certains types de handlers génériques. Pour la plupart des types de callbacks, il est généralement possible d'enregistrer des callbacks « before » ou « after ».

Enregistrer un callback est aussi simple que d'appeler la bonne macro de callback (par ex. `#before_dispatch`) avec un symbole du nom de la méthode à appeler lorsque le callback est exécuté. 

Par exemple, le handler suivant utilise le callback [`#before_dispatch`](#before_dispatch) pour rediriger l'utilisateur vers une page de connexion s'il n'est pas déjà authentifié :

```crystal
class MyHandler < Marten::Handler
  before_dispatch :require_authenticated_user

  def get
    respond "Hello, authenticated user!"
  end

  private def require_authenticated_user
    redirect(login_url) unless user_authenticated?(request)
  end
end
```

## Callbacks partagés entre handlers

Les callbacks suivants sont partagés entre tous les types de handlers.

### `before_dispatch`

Les callbacks `before_dispatch` sont exécutés _avant_ qu'une requête ne soit traitée dans le cadre de la méthode `#dispatch` du handler. Par exemple, cette fonctionnalité peut être utilisée pour inspecter la requête entrante et vérifier qu'un utilisateur est connecté :

```crystal
class MyHandler < Marten::Handler
  before_dispatch :require_authenticated_user

  def get
    respond "Hello, authenticated user!"
  end

  private def require_authenticated_user
    redirect(login_url) unless user_authenticated?(request)
  end
end
```

Lorsque l'un des callbacks `before_dispatch` définis retourne un objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html) (comme c'est le cas dans l'exemple ci-dessus), cette réponse est toujours utilisée au lieu d'appeler la méthode `#dispatch` du handler (cette dernière est ainsi complètement contournée).

### `after_dispatch`

Les callbacks `after_dispatch` sont exécutés _après_ qu'une requête a été traitée dans le cadre de la méthode `#dispatch` du handler. Par exemple, un tel callback peut être utilisé pour ajouter automatiquement des en-têtes ou des cookies à la réponse retournée.

```crystal
class MyHandler < Marten::Handler
  after_dispatch :add_required_header

  def get
    respond "Hello, authenticated user!"
  end

  private def add_required_header : Nil
    response!.headers["X-Foo"] = "Bar"
  end
end
```

De manière similaire aux callbacks `#before_dispatch`, les callbacks `#after_dispatch` peuvent retourner un tout nouvel objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html). Lorsque c'est le cas, cette réponse est toujours utilisée au lieu de celle retournée par la méthode `#dispatch` du handler.

### `before_render`

Les callbacks `before_render` sont invoqués avant le rendu d'un template lors de la génération d'une réponse qui incorpore son contenu. Cela signifie que ces callbacks sont exécutés dans le cadre de la méthode d'aide [`#render`](./introduction.md#render) et lors du rendu de templates dans le cadre de sous-classes du handler générique [`Marten::Handlers::Template`](./generic-handlers.md#rendu-dun-template).

Typiquement, ces callbacks sont utilisés pour ajouter de nouvelles variables au [contexte de template global](./introduction.md#contexte-de-template-global), afin de les rendre accessibles au runtime du template. Par exemple :

```crystal
class MyHandler < Marten::Handlers::Template
  template_name "app/my_template.html"
  before_render :add_variable_to_context

  private def add_variable_to_context : Nil
    context["foo"] = "bar"
  end
end
```

Notez que les callbacks `before_render` peuvent techniquement être utilisés pour retourner un objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html). Lorsque cette situation se présente, cette réponse prend toujours le pas sur celle qui aurait été retournée suite au rendu du template.

## Callbacks de handler schema

Les callbacks suivants ne sont disponibles que pour les handlers qui héritent du [handler schema](./reference/generic-handlers.md#traitement-dun-schéma). C'est-à-dire les handlers qui héritent de [`Marten::Handlers::Schema`](https://martenframework.com/docs/api/dev/Marten/Handlers/Schema.html), mais aussi les handlers qui héritent de [`Marten::Handlers::RecordCreate`](https://martenframework.com/docs/api/dev/Marten/Handlers/RecordCreate.html) et [`Marten::Handlers::RecordUpdate`](https://martenframework.com/docs/api/dev/Marten/Handlers/RecordUpdate.html).

Ces callbacks vous permettent de définir des logiques qui sont déclenchées avant ou après la validation du schéma. Cela vous permet d'intercepter facilement la validation et de gérer la réponse indépendamment de la validité du schéma. Tous ces callbacks peuvent optionnellement retourner un objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html). Lorsqu'une réponse HTTP est retournée,
tous les callbacks suivants sont ignorés et la réponse obtenue est retournée directement, contournant ainsi les réponses qui auraient pu être retournées ensuite par le handler.

### `before_schema_validation`

Les callbacks `before_schema_validation` sont exécutés _avant_ qu'un schéma ne soit vérifié pour sa validité. Par exemple, cette fonctionnalité peut être utilisée pour définir un attribut sur l'objet schéma avant que la validité du schéma ne soit vérifiée :

```crystal
class ArticleCreateHandler < Marten::Handlers::Schema
  success_url "https://example.com/articles/list"
  template_name "articles/create.html"
  schema ArticleSchema

  before_schema_validation :prepare_schema

  private def prepare_schema
    schema.user = request.user
  end
end
```

### `after_schema_validation`

Les callbacks `after_schema_validation` sont exécutés juste _après_ qu'un schéma a été vérifié pour sa validité. Par exemple, cette fonctionnalité peut être utilisée pour appeler une méthode personnalisée sur l'instance du schéma :

```crystal
class ArticleCreateHandler < Marten::Handlers::Schema
  success_url "https://example.com/articles/list"
  template_name "articles/create.html"
  schema ArticleSchema

  after_schema_validation :run_schema_post_validation

  private def run_schema_post_validation : Nil
    schema.trigger_post_something
  end
end
```

### `after_successful_schema_validation`

Les callbacks `after_successful_schema_validation` sont exécutés juste _après_ qu'un schéma a été vérifié pour sa validité (et après les éventuels callbacks [`after_schema_validation`](#after_schema_validation)), et uniquement si la validation du schéma a réussi.
Par exemple, cette fonctionnalité peut être utilisée pour créer un message flash :

```crystal
class ArticleCreateHandler < Marten::Handlers::Schema
  success_url "https://example.com/articles/list"
  template_name "articles/create.html"
  schema ArticleSchema

  after_successful_schema_validation :generate_success_flash_message

  private def generate_success_flash_message : Nil
    flash[:notice] = "Article successfully created!"
  end
end
```

### `after_failed_schema_validation`

Les callbacks `after_failed_schema_validation` sont exécutés juste _après_ qu'un schéma a été vérifié pour sa validité (et après les éventuels callbacks
[`after_schema_validation`](#after_schema_validation)), mais uniquement si la validation du schéma a échoué. Par exemple, cette fonctionnalité peut être utilisée pour créer un message flash :

```crystal
class ArticleCreateHandler < Marten::Handlers::Schema
  success_url "https://example.com/articles/list"
  template_name "articles/create.html"
  schema ArticleSchema

  after_failed_schema_validation :generate_failure_flash_message

  private def generate_failure_flash_message : Nil
    flash[:notice] = "Article creation failed!"
  end
end
```
