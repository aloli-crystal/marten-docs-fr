---
title: Cookies
description: Apprenez à utiliser les cookies pour persister des données côté client.
---

Les handlers peuvent interagir avec un magasin de cookies que vous pouvez utiliser pour stocker de petites quantités de données - appelées cookies - côté client. Ces données seront persistées entre les requêtes et seront rendues accessibles à chaque requête entrante.

## Utilisation de base

### Accéder au magasin de cookies

Les cookies peuvent être manipulés en utilisant un magasin de cookies : une instance de [`Marten::HTTP::Cookies`](pathname:///api/dev/Marten/HTTP/Cookies.html) qui fournit une interface de type hash permettant de récupérer et stocker des valeurs de cookies. Ce magasin de cookies est accessible depuis trois endroits différents :

* Les handlers peuvent y accéder via la méthode [`#cookies`](pathname:///api/dev/Marten/Handlers/Cookies.html#cookies(*args%2C**options)-instance-method).
* Les objets [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html) donnent accès aux cookies associés à la requête via la méthode [`#cookies`](pathname:///api/dev/Marten/HTTP/Request.html#cookies-instance-method).
* Les objets [`Marten::HTTP::Response`](pathname:///api/dev/Marten/HTTP/Response.html) donnent accès aux cookies qui seront retournés avec la réponse HTTP via la méthode [`#cookies`](pathname:///api/dev/Marten/HTTP/Response.html#cookies%3AMarten%3A%3AHTTP%3A%3ACookies-instance-method).


Voici un exemple très simple d'interaction avec le magasin de cookies dans un handler :

```crystal
class MyHandler < Marten::Handler
  def get
    cookies[:foo] = "bar"
    respond "Hello World!"
  end
end
```

### Récupérer des valeurs de cookies

La manière la plus simple de récupérer la valeur d'un cookie est d'utiliser la méthode [`#[]`](pathname:///api/dev/Marten/HTTP/Cookies.html#[](name%3AString|Symbol)-instance-method) ou l'une de ses variantes.

Par exemple, les lignes suivantes pourraient être utilisées pour lire la valeur d'un cookie nommé `foo` :

```crystal
request.cookies[:foo]  # => returns the value of "foo" or raises a KeyError if not found
request.cookies[:foo]? # => returns the value of "foo" or returns nil if not found
```

Alternativement, la méthode [`#fetch`](pathname:///api/dev/Marten/HTTP/Cookies.html#fetch(name%3AString|Symbol%2Cdefault%3Dnil)-instance-method) peut également être utilisée pour exécuter un bloc ou retourner une valeur par défaut si le cookie spécifié n'est pas trouvé :

```crystal
request.cookies.fetch(:foo, "defaultval")
request.cookies.fetch(:foo) { "defaultval" }
```

### Définir des cookies

La manière la plus simple de définir un nouveau cookie est d'appeler la méthode [`#[]=`](pathname:///api/dev/Marten/HTTP/Cookies.html#[]%3D(name%2Cvalue)-instance-method) sur un magasin de cookies. Par exemple :

```crystal
request.cookies[:foo] = "bar"
```

Appeler cette méthode créera un nouveau cookie avec le nom et la valeur spécifiés. Il convient de noter que les cookies créés avec la méthode [`#[]=`](pathname:///api/dev/Marten/HTTP/Cookies.html#[]%3D(name%2Cvalue)-instance-method) n'expireront _pas_, seront associés au chemin racine (`/`), et ne seront pas sécurisés.

Alternativement, il est possible d'utiliser la méthode [`#set`](pathname:///api/dev/Marten/HTTP/Cookies.html#set(name%3AString|Symbol%2Cvalue%2Cexpires%3ATime|Nil%3Dnil%2Cpath%3AString%3D"/"%2Cdomain%3AString|Nil%3Dnil%2Csecure%3ABool%3Dfalse%2Chttp_only%3ABool%3Dfalse%2Csame_site%3ANil|String|Symbol%3Dnil)%3ANil-instance-method) pour spécifier des propriétés de cookie personnalisées lors de la définition de nouvelles valeurs de cookies. Par exemple :

```crystal
request.cookies.set(
  :foo,
  "bar",
  expires: 2.days.from_now,
  secure: true,
  same_site: "lax"
)
```

En plus du nom et de la valeur du cookie, la méthode [`#set`](pathname:///api/dev/Marten/HTTP/Cookies.html#set(name%3AString|Symbol%2Cvalue%2Cexpires%3ATime|Nil%3Dnil%2Cpath%3AString%3D"/"%2Cdomain%3AString|Nil%3Dnil%2Csecure%3ABool%3Dfalse%2Chttp_only%3ABool%3Dfalse%2Csame_site%3ANil|String|Symbol%3Dnil)%3ANil-instance-method) permet de définir certaines propriétés supplémentaires du cookie :

* La date et heure d'expiration du cookie (argument `expires`).
* Le `path` du cookie.
* Le `domain` associé (utile pour définir des cookies inter-domaines).
* Si le cookie doit être envoyé uniquement pour les requêtes HTTPS (argument `secure`).
* Si les scripts côté client doivent avoir accès au cookie (argument `http_only`).
* La politique `same_site` (les valeurs acceptées sont `"lax"` ou `"strict"`).

### Supprimer des cookies

Les cookies peuvent être supprimés en utilisant la méthode [`#delete`](pathname:///api/dev/Marten/HTTP/Cookies.html#delete(name%3AString|Symbol%2Cpath%3AString%3D"/"%2Cdomain%3AString|Nil%3Dnil%2Csame_site%3ANil|String|Symbol%3Dnil)%3AString|Nil-instance-method). Cette méthode supprimera un cookie spécifique et retournera sa valeur, ou `nil` si le cookie n'existe pas :

```crystal
request.cookies.delete(:foo)
```

En plus du nom du cookie, cette méthode permet de définir certaines propriétés supplémentaires du cookie à supprimer :

* Le `path` du cookie.
* Le `domain` associé (utile pour définir des cookies inter-domaines).
* La politique `same_site` (les valeurs acceptées sont `"lax"` ou `"strict"`).

Notez que les valeurs `path`, `domain` et `same_site` doivent toujours être les mêmes que celles utilisées pour créer le cookie à l'origine. Sinon, le cookie pourrait ne pas être supprimé correctement.

## Cookies signés

En plus du [magasin de cookies classique](#accéder-au-magasin-de-cookies), Marten fournit une version de magasin de cookies signés (accessible via la méthode [`Marten::HTTP::Cookies#signed`](pathname:///api/dev/Marten/HTTP/Cookies.html#signed-instance-method)) où les cookies sont signés (mais **pas** chiffrés). Cela signifie que lorsqu'un cookie est demandé depuis ce magasin, la représentation signée de la valeur correspondante sera vérifiée. Cela est utile pour créer des cookies qui ne peuvent pas être falsifiés par les utilisateurs, mais il convient de noter que les données réelles peuvent toujours être lues par le client techniquement.

Toutes les méthodes utilisables avec le magasin de cookies classique mises en évidence dans [Utilisation de base](#utilisation-de-base) peuvent également être utilisées avec le magasin de cookies signés :

```crystal
# Retrieving cookies...
request.signed.cookies[:foo]
request.signed.cookies[:foo]?
request.signed.cookies.fetch(:foo, "defaultval")
request.signed.cookies.fetch(:foo) { "defaultval" }

# Setting cookies...
request.signed.cookies[:foo] = "bar"
request.signed.cookies.set(:foo, "bar", expires: 2.days.from_now)

# Deleting cookies...
request.signed.cookies.delete(:foo)
```

Le magasin de cookies signés utilise un objet signataire [`Marten::Core::Signer`](pathname:///api/dev/Marten/Core/Signer.html) pour signer les valeurs des cookies et vérifier la signature des cookies récupérés. Cela signifie que les cookies sont signés avec des signatures HMAC utilisant l'algorithme de hachage **SHA256**.

:::info
Seules les _valeurs_ des cookies sont signées. Les _noms_ des cookies ne sont pas signés.
:::

## Cookies chiffrés

En plus du [magasin de cookies classique](#accéder-au-magasin-de-cookies), Marten fournit une version de magasin de cookies chiffrés (accessible via la méthode [`Marten::HTTP::Cookies#encrypted`](pathname:///api/dev/Marten/HTTP/Cookies.html#encrypted-instance-method)) où les cookies sont signés et chiffrés. Cela signifie que lorsqu'un cookie est demandé depuis ce magasin, la valeur brute du cookie sera déchiffrée et sa signature sera vérifiée. Cela est utile pour créer des cookies dont les valeurs ne peuvent être ni lues ni falsifiées par les utilisateurs.

Toutes les méthodes utilisables avec le magasin de cookies classique mises en évidence dans [Utilisation de base](#utilisation-de-base) peuvent également être utilisées avec le magasin de cookies chiffrés :

```crystal
# Retrieving cookies...
request.encrypted.cookies[:foo]
request.encrypted.cookies[:foo]?
request.encrypted.cookies.fetch(:foo, "defaultval")
request.encrypted.cookies.fetch(:foo) { "defaultval" }

# Setting cookies...
request.encrypted.cookies[:foo] = "bar"
request.encrypted.cookies.set(:foo, "bar", expires: 2.days.from_now)

# Deleting cookies...
request.encrypted.cookies.delete(:foo)
```

Le magasin de cookies chiffrés utilise un objet chiffreur [`Marten::Core::Encryptor`](pathname:///api/dev/Marten/Core/Encryptor.html) pour chiffrer et signer les valeurs des cookies. Cela signifie que les cookies sont :

* chiffrés avec un chiffrement **aes-256-cbc**.
* signés avec des signatures HMAC utilisant l'algorithme de hachage **SHA256**.

:::info
Seules les _valeurs_ des cookies sont chiffrées et signées. Les _noms_ des cookies ne sont pas chiffrés.
:::
