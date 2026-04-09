---
title: Introduction aux handlers
description: Apprenez à définir des handlers et à répondre aux requêtes HTTP.
sidebar_label: Introduction
---

Les handlers sont des classes dont la responsabilité est de traiter les requêtes web et de retourner des réponses. Ils implémentent la logique nécessaire permettant de retourner cette réponse, ce qui peut impliquer le traitement de données de formulaire via l'utilisation de [schémas](../schemas.mdx) par exemple, la récupération d'[enregistrements de modèles](../models-and-databases.mdx) depuis la base de données, etc. Ils peuvent retourner des réponses correspondant à des pages HTML, des objets JSON, des redirections, ...

## Écrire des handlers

À leur base, les handlers sont des sous-classes de la classe [`Marten::Handler`](https://martenframework.com/docs/api/dev/Marten/Handlers/Base.html). Ces classes sont généralement définies dans un dossier `handlers`, à la racine d'un projet ou d'une application Marten. Voici un exemple de handler très simple :

```crystal
class SimpleHandler < Marten::Handler
  def dispatch
    respond "Hello World!"
  end
end
```

Le handler ci-dessus retourne une réponse `200 OK` contenant un court texte, quelle que soit la méthode de la requête HTTP entrante.

Les handlers sont initialisés à partir d'un objet [`Marten::HTTP::Request`](https://martenframework.com/docs/api/dev/Marten/HTTP/Request.html) et d'un ensemble optionnel de paramètres de routage. Leur logique interne est exécutée lors de l'appel de la méthode `#dispatch`, qui _doit_ retourner un objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html).

Lorsque la méthode `#dispatch` est explicitement redéfinie, elle est responsable de l'application de différentes logiques pour gérer les diverses méthodes de requête HTTP entrantes. Par exemple, un handler peut afficher une page HTML contenant un formulaire lors du traitement d'une requête `GET`, et traiter les éventuelles données du formulaire lors du traitement d'une requête `POST` :

```crystal
class FormHandler < Marten::Handler
  def dispatch
    if request.method == 'POST'
      # process form data
    else
      # return HTML page
    end
  end
end
```

Il convient de noter que cette logique de « dispatching » basée sur la méthode de la requête entrante n'a pas besoin de résider dans une méthode `#dispatch` redéfinie. Par défaut, chaque handler fournit des méthodes dont les noms correspondent aux verbes des méthodes HTTP. Cela permet d'écrire la logique de traitement des requêtes `GET` en redéfinissant la méthode `#get` par exemple, ou de traiter les requêtes `POST` en redéfinissant la méthode `#post` :

```crystal
class FormHandler < Marten::Handler
  def get
    # return HTML page
  end

  def post
    # process form data
  end
end
```

:::info
Si la logique d'un handler est définie comme dans l'exemple ci-dessus, tenter d'accéder à ce handler via un autre verbe HTTP (par ex. `DELETE`) entraînera automatiquement une réponse "Not allowed" (405).
:::

### Les objets `request` et `response`

Comme mentionné précédemment, un handler est toujours initialisé à partir d'un objet de requête HTTP entrante (instance de [`Marten::HTTP::Request`](https://martenframework.com/docs/api/dev/Marten/HTTP/Request.html)) et doit retourner un objet de réponse HTTP (instance de [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html)) dans le cadre de sa méthode `#dispatch`.

L'objet `request` donne accès à un ensemble d'informations et d'attributs utiles associés à la requête entrante. Des éléments comme le verbe de la requête HTTP, les en-têtes ou les paramètres de requête sont accessibles via cet objet. Les méthodes les plus courantes que vous pouvez utiliser sont listées ci-dessous :

| Méthode | Description |
| ----------- | ----------- |
| `#body` | Retourne le corps brut de la requête sous forme de chaîne de caractères. |
| `#cookies` | Retourne un objet de type hash (instance de [`Marten::HTTP::Cookies`](https://martenframework.com/docs/api/dev/Marten/HTTP/Cookies.html)) contenant les cookies associés à la requête. |
| `#data` | Retourne un objet de type hash (instance de [`Marten::HTTP::Params::Data`](https://martenframework.com/docs/api/dev/Marten/HTTP/Params/Data.html)) contenant les données de la requête. |
| `#flash` | Retourne un objet de type hash (instance de [`Marten::HTTP::FlashStore`](https://martenframework.com/docs/api/dev/Marten/HTTP/FlashStore.html)) contenant les messages flash disponibles pour la requête en cours. |
| `#headers` | Retourne un objet de type hash (instance de [`Marten::HTTP::Headers`](https://martenframework.com/docs/api/dev/Marten/HTTP/Headers.html)) contenant les en-têtes inclus dans la requête. |
| `#host` | Retourne l'hôte associé à la requête considérée. |
| `#method` | Retourne la méthode de la requête HTTP considérée (`GET`, `POST`, `PUT`, etc). |
| `#query_params` | Retourne un objet de type hash (instance de [`Marten::HTTP::Params::Query`](https://martenframework.com/docs/api/dev/Marten/HTTP/Params/Query.html)) contenant les paramètres HTTP GET inclus dans la requête. |
| `#session` | Retourne un objet de type hash (instance de [`Marten::HTTP::Session::Store::Base`](https://martenframework.com/docs/api/dev/Marten/HTTP/Session/Store/Base.html)) correspondant au magasin de sessions pour la requête en cours. |

L'objet `response` correspond à la réponse HTTP qui est retournée au client. Les objets de réponse peuvent être créés en instanciant directement la classe [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html) (ou l'une de ses sous-classes) ou en utilisant les [méthodes d'aide pour les réponses](#méthodes-daide-pour-les-réponses). Une fois initialisés, ces objets peuvent être modifiés pour configurer davantage ce qui est renvoyé au navigateur. Les méthodes les plus courantes que vous pouvez utiliser à cet égard sont listées ci-dessous :

| Méthode | Description |
| ----------- | ----------- |
| `#content` | Retourne le contenu de la réponse sous forme de chaîne de caractères. |
| `#content_type` | Retourne le type de contenu de la réponse sous forme de chaîne de caractères. |
| `#cookies` | Retourne un objet de type hash (instance de [`Marten::HTTP::Cookies`](https://martenframework.com/docs/api/dev/Marten/HTTP/Cookies.html)) contenant les cookies qui seront envoyés avec la réponse. |
| `#headers` | Retourne un objet de type hash (instance de [`Marten::HTTP::Headers`](https://martenframework.com/docs/api/dev/Marten/HTTP/Headers.html)) contenant les en-têtes qui seront utilisés pour la réponse. |
| `#status` | Retourne le statut de la réponse (par ex. 200 ou 404). |

### Paramètres

Les handlers sont associés à des URLs via une [configuration de routage](#associer-les-handlers-aux-urls). Certaines routes nécessitent des paramètres qui sont utilisés par le handler pour récupérer des objets ou effectuer toute logique arbitraire. Ces paramètres sont accessibles en utilisant la méthode `#params`, qui retourne un hash de tous les paramètres utilisés pour initialiser le handler considéré.

Par exemple, ces paramètres peuvent être utilisés pour récupérer une instance de modèle spécifique :

```crystal
class FormHandler < Marten::Handler
  def get
    if (record = MyModel.get(id: params["id"]))
      respond "Record found: #{record}"
    else
      respond "Record not found!", status: 404
    end
  end
end
```

:::tip
Notez que vous pouvez utiliser aussi bien des chaînes de caractères que des symboles lors de l'interaction avec les paramètres de routage retournés par la méthode `#params`.
:::

### Méthodes d'aide pour les réponses

Techniquement, il est possible de construire des réponses HTTP en instanciant directement la classe [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html) (ou l'une de ses sous-classes comme [`Marten::HTTP::Response::Found`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response/Found.html) par exemple). Cela dit, Marten fournit un ensemble de méthodes d'aide qui peuvent être utilisées pour construire facilement des réponses pour divers cas d'utilisation :

#### `respond`

Vous avez déjà vu `#respond` en action dans le [premier exemple](#écrire-des-handlers). En résumé, `#respond` permet de construire une réponse HTTP en spécifiant un contenu, un type de contenu et un code de statut :

```crystal
respond("Response content", content_type: "text/html", status: 200)
```

Sauf indication contraire, le `content_type` est défini à `text/html` et le `status` est défini à `200`.

:::tip
Vous pouvez également exprimer le `status` de la réponse sous forme de symbole qui doit correspondre aux valeurs de l'énumération [`HTTP::Status`](https://crystal-lang.org/api/HTTP/Status.html). Par exemple :

```crystal
respond("Response content", content_type: "text/html", status: :ok)
```
:::

#### `render`

`render` permet de retourner une réponse HTTP dont le contenu est généré en effectuant le rendu d'un [template](../templates.mdx) spécifique. Le template peut être rendu en spécifiant un hash ou un named tuple de contexte. Par exemple :

```crystal
render("path/to/template.html", context: { foo: "bar" }, content_type: "text/html", status: 200)
```

Sauf indication contraire, le `content_type` est défini à `text/html` et le `status` est défini à `200`.

:::tip
Vous pouvez également exprimer le `status` de la réponse sous forme de symbole qui doit correspondre aux valeurs de l'énumération [`HTTP::Status`](https://crystal-lang.org/api/HTTP/Status.html). Par exemple :

```crystal
render("path/to/template.html", context: { foo: "bar" }, content_type: "text/html", status: :ok)
```
:::

#### `redirect`

`#redirect` permet de construire une réponse HTTP de redirection. Il nécessite une `url` et accepte un argument optionnel `permanent` pour définir si une redirection permanente est retournée (301 Moved Permanently) ou une redirection temporaire (302 Found) :

```crystal
redirect("https://example.com", permanent: true)
```

Sauf indication contraire explicite, `permanent` sera automatiquement défini à `false`.

#### `#head`

`#head` permet de construire une réponse contenant des en-têtes mais sans contenu réel. La méthode accepte uniquement un code de statut :

```crystal
head(404)
```

:::tip
Vous pouvez également exprimer le `status` de la réponse sous forme de symbole qui doit correspondre aux valeurs de l'énumération [`HTTP::Status`](https://crystal-lang.org/api/HTTP/Status.html). Par exemple :

```crystal
head :not_found
```
:::

#### `json`

`json` permet de construire une réponse HTTP avec le type de contenu `application/json`. Il peut être utilisé avec une chaîne JSON brute ou tout objet sérialisable :

```crystal
json({ foo: "bar" }, status: 200)
```

Sauf indication contraire, le `status` est défini à `200`.

:::tip
Vous pouvez également exprimer le `status` de la réponse sous forme de symbole qui doit correspondre aux valeurs de l'énumération [`HTTP::Status`](https://crystal-lang.org/api/HTTP/Status.html). Par exemple :

```crystal
json({ foo: "bar" }, status: :ok)
```
:::

### Callbacks

Il est possible de définir des callbacks afin de lier des méthodes et des logiques à des événements spécifiques du cycle de vie de vos handlers. Par exemple, il est possible de définir des callbacks qui s'exécutent avant l'exécution de la méthode `#dispatch` d'un handler, ou après !

Veuillez consulter le guide [Callbacks de handler](./callbacks.md) pour en savoir plus sur les callbacks de handler.

### Handlers génériques

Marten fournit un ensemble de handlers génériques qui peuvent être utilisés pour effectuer des tâches courantes d'application telles que l'affichage de listes d'enregistrements, la suppression d'entrées ou le rendu de [templates](../templates/introduction.md). Cela évite aux développeurs de réinventer des patterns courants.

Veuillez consulter le guide [Handlers génériques](./generic-handlers.md) pour en savoir plus sur les handlers génériques disponibles.

### Contexte de template global

Tous les handlers ont accès à une méthode [`#context`](https://martenframework.com/docs/api/dev/Marten/Handlers/Base.html#context-instance-method) qui retourne un objet de contexte de [template](../templates/introduction.md). Cet objet de contexte « global » est disponible pendant toute la durée de vie du handler considéré et peut être modifié pour définir quelles variables sont rendues disponibles au runtime du template lors du rendu de templates via la méthode d'aide [`#render`](#render) ou lors du rendu de templates dans le cadre de sous-classes du handler générique [`Marten::Handlers::Template`](./generic-handlers.md#rendu-dun-template). 

Pour modifier efficacement cet objet de contexte, il est recommandé d'utiliser les callbacks [`before_render`](./callbacks.md#before_render), qui sont invoqués juste avant le rendu d'un template dans un handler. Par exemple, cela peut être réalisé comme suit lors de l'utilisation d'une sous-classe de [`Marten::Handlers::Template`](./generic-handlers.md#rendu-dun-template) :

```crystal
class MyHandler < Marten::Handlers::Template
  template_name "app/my_template.html"
  before_render :add_variable_to_context

  private def add_variable_to_context : Nil
    context["foo"] = "bar"
  end
end
```

### Retourner des erreurs

Il est facile de construire n'importe quelle réponse d'erreur en exploitant les aides `#respond` ou `#head` mentionnées [précédemment](#méthodes-daide-pour-les-réponses). En utilisant ces aides, il est possible de construire des réponses HTTP associées à des codes de statut d'erreur spécifiques et des contenus spécifiques. Par exemple :

```crystal
class MyHandler < Marten::Handler
  def get
    respond "Content not found", status: 404
  end
end
```

Il convient de noter que Marten prend également en charge quelques exceptions qui peuvent être levées pour déclencher automatiquement les handlers d'erreur par défaut. Par exemple, [`Marten::HTTP::Errors::NotFound`](https://martenframework.com/docs/api/dev/Marten/HTTP/Errors/NotFound.html) peut être levée depuis n'importe quel handler pour forcer le retour d'une réponse 404 Not Found. Les handlers d'erreur par défaut peuvent être retournés automatiquement par le framework dans de nombreuses situations (par ex. un enregistrement n'est pas trouvé, ou une exception non gérée est levée) ; vous pouvez en apprendre davantage à ce sujet dans [Handlers d'erreur](./error-handlers.md).

### Gestion des exceptions

Marten vous permet de définir des méthodes de callback qui sont invoquées lorsque certaines exceptions sont rencontrées durant l'exécution de la méthode `#dispatch` de votre handler. Ces callbacks de gestion d'exceptions peuvent être définis en utilisant la macro [`#rescue_from`](https://martenframework.com/docs/api/dev/Marten/Handlers/ExceptionHandling.html#rescue_from(*exception_klasses%2C**kwargs%2C%26block)-macro), qui accepte une ou plusieurs classes d'exception et un gestionnaire d'exception qui peut être spécifié par une option `:with` contenant le nom d'une méthode à invoquer ou un bloc contenant la logique de gestion de l'exception.

Par exemple, le handler suivant réagira aux éventuelles exceptions `Auth::UnauthorizedUser` en appelant la méthode privée `#handle_unauthorized_user` :

```crystal
class ProfileHandler < Marten::Handlers::Template
  include RequireSignedInUser

  template_name "auth/profile.html"

  rescue_from Auth::UnauthorizedUser, with: :handle_unauthorized_user

  private def handle_unauthorized_user
    head :forbidden
  end
end
```

Et le handler suivant fera exactement la même chose en invoquant le bloc spécifié :

```crystal
class ProfileHandler < Marten::Handlers::Template
  include RequireSignedInUser

  template_name "auth/profile.html"

  rescue_from Auth::UnauthorizedUser do
    head :forbidden
  end
end
```

Il est important de mentionner que les callbacks de gestion d'exceptions sont hérités et qu'ils sont recherchés de bas en haut dans la hiérarchie d'héritage.

:::warning
Vos callbacks de gestion d'exceptions doivent retourner des objets [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html). Si ce n'est pas le cas, la logique de votre callback de gestion d'exception sera exécutée mais l'exception originale sera autorisée à « remonter » (ce qui entraînera probablement une erreur serveur).
:::

## Associer les handlers aux URLs

Les handlers définissent la logique permettant de gérer les requêtes HTTP entrantes et de retourner les réponses HTTP correspondantes. Pour définir quel handler est appelé pour une URL spécifique (et quels sont les paramètres d'URL attendus), les handlers doivent être associés à une route spécifique. Cette configuration se fait généralement dans le fichier de configuration `config/routes.rb`, où vous pouvez définir des « chemins » et les associer à vos classes de handler :

```crystal title="config/routes.cr"
Marten.routes.draw do
  path "/", HomeHandler, name: "home"
  path "/articles", ArticlesHandler, name: "articles"
  path "/articles/<pk:int>", ArticleDetailHandler, name: "article_detail"
end
```

Veuillez vous référer à [Routage](./routing.md) pour plus d'informations concernant la configuration des routes.

## Utiliser les cookies

Les handlers peuvent interagir avec un magasin de cookies, que vous pouvez utiliser pour stocker de petites quantités de données côté client. Ces données seront persistées entre les requêtes et seront rendues accessibles à chaque requête entrante.

Le magasin de cookies est une instance de [`Marten::HTTP::Cookies`](https://martenframework.com/docs/api/dev/Marten/HTTP/Cookies.html) et fournit une interface de type hash permettant de récupérer et stocker des données. Les handlers peuvent y accéder via la méthode `#cookies`. Voici un exemple très simple d'interaction avec les cookies :

```crystal
class MyHandler < Marten::Handler
  def get
    cookies[:foo] = "bar"
    respond "Hello World!"
  end
end
```

Il convient de noter que le magasin de cookies donne accès à deux sous-magasins : un chiffré et un signé.

`cookies.encrypted` permet de définir des cookies qui seront signés et chiffrés. Lorsqu'un cookie est demandé depuis ce magasin, la valeur brute du cookie sera déchiffrée. Cela est utile pour créer des cookies dont les valeurs ne peuvent être ni lues ni falsifiées par les utilisateurs :

```crystal
cookies.encrypted[:secret_message] = "Hello!"
```

`cookies.signed` permet de définir des cookies qui seront signés mais non chiffrés. Cela signifie que lorsqu'un cookie est demandé depuis ce magasin, la représentation signée de la valeur correspondante sera vérifiée. Cela est utile pour créer des cookies qui ne peuvent pas être falsifiés par les utilisateurs, mais il convient de noter que les données réelles peuvent toujours être lues par le client.

```crystal
cookies.signed[:signed_message] = "Hello!"
```

Veuillez vous référer à [Cookies](./cookies.md) pour plus d'informations sur l'utilisation des cookies.

## Utiliser les sessions

Les handlers peuvent interagir avec un magasin de sessions, que vous pouvez utiliser pour stocker de petites quantités de données qui seront persistées entre les requêtes. La quantité de données que vous pouvez persister dans ce magasin dépend du backend de session utilisé. Le backend par défaut persiste les données de session en utilisant un cookie chiffré. Les cookies ont une limite de taille de 4K, ce qui est généralement suffisant pour persister des éléments comme un identifiant utilisateur et des messages flash.

Le magasin de sessions est une instance de [`Marten::HTTP::Session::Store::Base`](https://martenframework.com/docs/api/dev/Marten/HTTP/Session/Store/Base.html) et fournit une interface de type hash. Les handlers peuvent y accéder via la méthode `#session`. Par exemple :

```crystal
class MyHandler < Marten::Handler
  def get
    session[:foo] = "bar"
    respond "Hello World!"
  end
end
```

Veuillez vous référer à [Sessions](./sessions.md) pour plus d'informations concernant la configuration des sessions et les backends disponibles.

## Utiliser le magasin flash {#using-the-flash-store}

Le magasin flash fournit un moyen de transmettre des messages simples sous forme de chaînes de caractères d'un handler au suivant. Toute valeur de type chaîne définie dans ce magasin sera disponible pour le prochain handler traitant la prochaine requête, puis elle sera effacée. Un tel mécanisme offre un moyen pratique de créer des messages de notification ponctuels (tels que des alertes ou des avis).

Le magasin flash est une instance de [`Marten::HTTP::FlashStore`](https://martenframework.com/docs/api/dev/Marten/HTTP/FlashStore.html) et fournit une interface de type hash. Les handlers peuvent y accéder via la méthode `#flash`. Par exemple :

```crystal
class MyHandler < Marten::Handler
  def post
    flash[:notice] = "Article successfully created!"
    redirect("/success")
  end
end
```

Dans l'exemple ci-dessus, le handler crée un message flash avant de retourner une réponse de redirection vers une autre URL. C'est au handler traitant cette URL de décider quoi faire avec le message flash ; cela peut impliquer de l'afficher dans un template de base par exemple.

Notez qu'il est possible de conserver explicitement les messages flash actuels pour qu'ils restent tous accessibles au prochain handler traitant la prochaine requête. Cela peut être fait en utilisant la méthode `flash.keep`, qui peut prendre un argument optionnel pour conserver uniquement le message associé à une clé spécifique.

```crystal
flash.keep       # keeps all the flash messages for the next request
flash.keep(:foo) # keeps the message associated with the "foo" key only
```

L'opération inverse est également possible : vous pouvez décider de rejeter tous les messages flash actuels pour qu'aucun d'entre eux ne reste accessible au prochain handler traitant la prochaine requête. Cela peut être fait en utilisant la méthode `flash.discard`, qui peut prendre un argument optionnel pour rejeter uniquement le message associé à une clé spécifique.

```crystal
flash.discard       # discards all the flash messages
flash.discard(:foo) # discards the message associated with the "foo" key only
```

## Réponses en streaming

La classe de réponse [`Marten::HTTP::Response::Streaming`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response/Streaming.html) vous donne la possibilité de diffuser une réponse depuis Marten vers le navigateur. Cependant, contrairement à une réponse standard, cette classe spécialisée nécessite une initialisation à partir d'un [itérateur](https://crystal-lang.org/api/Iterator.html) de chaînes de caractères au lieu d'une chaîne de contenu. Cette approche s'avère bénéfique si vous avez l'intention de générer de longues réponses ou des réponses qui consomment une mémoire excessive (un exemple classique étant la génération de fichiers CSV volumineux).

Comparée à un objet [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html) classique, la classe [`Marten::HTTP::Response::Streaming`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response/Streaming.html) fonctionne différemment de deux manières :

* Au lieu de l'initialiser avec une chaîne de contenu, elle nécessite une initialisation à partir d'un [itérateur](https://crystal-lang.org/api/Iterator.html) de chaînes de caractères.
* Le contenu de la réponse n'est pas directement accessible. La seule façon d'obtenir le contenu réel de la réponse est d'itérer à travers l'itérateur de contenu diffusé, accessible via la méthode [`Marten::HTTP::Response::Streaming#streamed_content`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response/Streaming.html#streamed_content%3AIterator(String)-instance-method). Cependant, cela est géré par Marten lui-même lors de l'envoi de la réponse au navigateur, donc vous ne devriez pas avoir à vous en soucier.

Pour générer des réponses en streaming, vous pouvez soit instancier directement des objets [`Marten::HTTP::Response::Streaming`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response/Streaming.html), soit exploiter la méthode d'aide [`#respond`](https://martenframework.com/docs/api/dev/Marten/Handlers/Base.html#respond(streamed_content%3AIterator(String)%2Ccontent_type%3DHTTP%3A%3AResponse%3A%3ADEFAULT_CONTENT_TYPE%2Cstatus%3D200)-instance-method), qui fonctionne de manière similaire à la variante [`#respond`](#respond) pour les chaînes de contenu de réponse.

Par exemple, le handler suivant génère un CSV et diffuse son contenu en exploitant la méthode d'aide [`#respond`](https://martenframework.com/docs/api/dev/Marten/Handlers/Base.html#respond(streamed_content%3AIterator(String)%2Ccontent_type%3DHTTP%3A%3AResponse%3A%3ADEFAULT_CONTENT_TYPE%2Cstatus%3D200)-instance-method) :

```crystal
require "csv"

class StreamingTestHandler < Marten::Handler
  def get
    respond(streaming_iterator, content_type: "text/csv")
  end

  private def streaming_iterator
    csv_io = IO::Memory.new
    csv_builder = CSV::Builder.new(io: csv_io)

    (1..1000000).each.map do |idx|
      csv_builder.row("Row #{idx}", "Val #{idx}")

      row_content = csv_io.to_s

      csv_io.rewind
      csv_io.flush

      row_content
    end
  end
end
```

:::caution
Lorsque vous envisagez des réponses en streaming, il est crucial de comprendre que le processus de diffusion mobilise un processus worker pendant toute la durée de la réponse. Cela peut avoir un impact significatif sur les performances de votre worker, il est donc essentiel de n'utiliser cette approche que lorsque c'est nécessaire. En général, il est préférable d'effectuer les tâches de génération de contenu coûteuses en dehors du cycle requête-réponse pour éviter tout impact négatif sur les performances de votre worker.
:::
