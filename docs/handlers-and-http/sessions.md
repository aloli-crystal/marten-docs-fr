---
title: Sessions
description: Apprenez à utiliser les sessions pour persister des données entre les requêtes.
sidebar_label: Sessions
---

Les sessions peuvent être utilisées pour stocker de petites quantités de données qui seront persistées entre les requêtes, sur une base par visiteur. Ces données sont généralement stockées côté serveur (selon le stockage de session choisi), et elles sont associées à un identifiant de session qui est persisté côté client via un cookie dédié.

## Configuration

Pour utiliser les sessions, vous devez vous assurer que le middleware [`Marten::Middleware::Session`](pathname:///api/dev/Marten/Middleware/Session.html) fait partie de la chaîne de middlewares de votre projet, qui peut être configurée dans le paramètre [`middleware`](../development/reference/settings.md#middleware). Notez que la classe du middleware de session est automatiquement ajoutée à ce paramètre lors de l'initialisation de nouveaux projets.

Si votre projet ne nécessite pas l'utilisation de sessions, vous pouvez simplement vous assurer que le paramètre [`middleware`](../development/reference/settings.md#middleware) n'inclut pas la classe de middleware [`Marten::Middleware::Session`](pathname:///api/dev/Marten/Middleware/Session.html).

La manière dont le cookie d'identifiant de session est généré peut également être ajustée en exploitant les paramètres suivants :

* [`sessions.cookie_domain`](../development/reference/settings.md#cookie_domain-1)
* [`sessions.cookie_http_only`](../development/reference/settings.md#cookie_http_only-1)
* [`sessions.cookie_max_age`](../development/reference/settings.md#cookie_max_age-1)
* [`sessions.cookie_name`](../development/reference/settings.md#cookie_name-1)
* [`sessions.cookie_same_site`](../development/reference/settings.md#cookie_same_site-1)
* [`sessions.cookie_secure`](../development/reference/settings.md#cookie_secure-1)

## Magasins de sessions

La manière dont les données de session sont effectivement persistées peut être définie en configurant le bon backend de magasin de sessions, ce qui peut être fait via le paramètre [`sessions.store`](../development/reference/settings.md#store).

Par défaut, les sessions sont chiffrées et stockées dans un seul cookie (magasin de sessions `:cookie`). Les cookies ont une limite de taille de 4K, ce qui est généralement suffisant pour persister des éléments comme un identifiant utilisateur et des messages flash. `:cookie` est le seul magasin intégré au framework web Marten actuellement.

:::info
Le magasin `cookie` utilise un objet chiffreur [`Marten::Core::Encryptor`](pathname:///api/dev/Marten/Core/Encryptor.html) pour chiffrer et signer les données de session. Cela signifie que les données de session sont chiffrées avec un chiffrement **aes-256-cbc** et signées avec des signatures HMAC utilisant l'algorithme de hachage **SHA256**.
:::

D'autres magasins de sessions peuvent être installés en tant que shards séparés. Par exemple, le shard [`marten-db-session`](https://github.com/martenframework/marten-db-session) peut être utilisé pour persister les données de session dans la base de données tandis que le shard [`marten-redis-session`](https://github.com/martenframework/marten-redis-session) peut être utilisé pour persister les données de session avec Redis.

## Utiliser les sessions

### Définir et récupérer des valeurs de session

Lorsque le middleware [`Marten::Middleware::Session`](pathname:///api/dev/Marten/Middleware/Session.html) est utilisé, chaque objet de requête HTTP aura une méthode [`#session`](pathname:///api/dev//Marten/HTTP/Request.html#session-instance-method) retournant le magasin de sessions pour la requête en cours. Le magasin de sessions est une instance de [`Marten::HTTP::Session::Store::Base`](pathname:///api/dev/Marten/HTTP/Session/Store/Base.html) et fournit une interface de type hash :

```crystal
# Persisting values:
request.session[:foo] = "bar"

# Accessing values:
request.session[:foo]
request.session[:foo]?

# Deleting values:
request.session.delete(:foo)

# Checking emptiness:
request.session.empty?
```

Les clés sous forme de symboles et de chaînes de caractères peuvent être utilisées pour interagir avec le magasin de sessions, mais seules des **valeurs de type chaîne** peuvent être stockées.

:::tip
Si vous essayez d'accéder au magasin de sessions depuis un handler, il convient de noter que vous pouvez utiliser la méthode `#session` au lieu d'utiliser l'objet de requête :

```crystal
class MyHandler < Marten::Handler
  def get
    session[:foo] = "bar"
    respond "Hello World!"
  end
end
```
:::

### Personnaliser les durées d'expiration des sessions

Par défaut, la plupart des magasins de sessions feront expirer les entrées de session en fonction de la valeur du paramètre [`sessions.cookie_max_age`](../development/reference/settings.md#cookie_max_age-1). Cela dit, il est possible de personnaliser le moment où une session spécifique est configurée pour expirer en utilisant l'une des méthodes suivantes :

* [`#expires_at=`](pathname:///api/dev/Marten/HTTP/Session/Store/Base.html#expires_at%3D(value%3ATime)-instance-method) permet de définir le moment où la session doit expirer en spécifiant un objet [`Time`](https://crystal-lang.org/api/Time.html) ou un entier (nombre de secondes).
* [`#expires_at_browser_close=`](pathname:///api/dev/Marten/HTTP/Session/Store/Base.html#expires_at_browser_close%3D(value%3ABool)-instance-method) permet de définir si la session doit expirer lorsque le navigateur est fermé.
* [`#expires_in=`](pathname:///api/dev/Marten/HTTP/Session/Store/Base.html#expires_in%3D(value%3ATime%3A%3ASpan)-instance-method) permet de définir la durée d'expiration de la session avec un objet [`Time::Span`](https://crystal-lang.org/api/Time/Span.html).

Par exemple :

```crystal
request.session[:foo] = "bar"

# Set the session to expire on a specific date time:
request.session.expires_at = 2.days.from_now

# Set the session to expire in a specific duration:
request.session.expires_in = 2.hours

# Set the session to expire when the browser is closed:
request.session.expires_at_browser_close = true
```
