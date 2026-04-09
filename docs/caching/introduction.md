---
title: Introduction à la mise en cache
description: Apprenez à utiliser la mise en cache dans un projet Marten.
sidebar_label: Introduction
---

Marten fournit un ensemble de fonctionnalités vous permettant d'utiliser la mise en cache dans votre application. En utilisant la mise en cache, vous pouvez sauvegarder le résultat d'opérations coûteuses afin de ne pas avoir à les effectuer pour chaque requête.

## Configuration et cache stores

Afin de pouvoir utiliser la mise en cache dans votre application, vous devez configurer un "cache store". Un cache store permet d'interagir avec le système de cache sous-jacent et d'effectuer des opérations basiques telles que la récupération d'entrées en cache, l'écriture de nouvelles entrées, etc. Selon le cache store choisi, ces opérations pourraient être effectuées en mémoire ou en utilisant des systèmes de cache externes tels que [Redis](https://redis.io) ou [Memcached](https://memcached.org).

Le cache store global utilisé par Marten peut être configuré en utilisant le paramètre [`cache_store`](../development/reference/settings.md#cache_store). Tous les cache stores disponibles sont listés dans la [référence des cache stores](./reference/stores.md).

Par exemple, la configuration suivante configure un cache en mémoire comme cache global :

```crystal
Marten.configure do |config|
  config.cache_store = Marten::Cache::Store::Memory.new(expires_in: 24.hours)
end
```

:::info
Par défaut, Marten utilise un cache en mémoire (instance de [`Marten::Cache::Store::Memory`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Memory.html)). Notez que ce simple cache en mémoire ne permet pas d'effectuer de la mise en cache inter-processus puisque chaque processus exécutant votre application aura sa propre instance de cache privée. Dans les situations où vous avez plusieurs processus séparés exécutant votre application, il est préférable d'utiliser un système de mise en cache approprié comme [Redis](https://redis.io) ou [Memcached](https://memcached.org), ce qui peut être fait en utilisant respectivement les shards [`marten-redis-cache`](https://github.com/martenframework/marten-redis-cache) ou [`marten-memcached-cache`](https://github.com/martenframework/marten-memcached-cache).

Dans les environnements de test, vous pourriez configurer votre projet pour qu'il utilise une instance de [`Marten::Cache::Store::Null`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Null.html) comme cache global. Cette approche peut être utile lorsque la mise en cache n'est pas nécessaire, mais que vous voulez tout de même vous assurer que votre code passe par l'interface de mise en cache.
:::

## Mise en cache de bas niveau

### Utilisation basique

La mise en cache de bas niveau vous permet d'interagir directement avec le cache store global et d'effectuer des opérations de mise en cache. Pour ce faire, vous pouvez accéder au cache store global en appelant la méthode [`Marten#cache`](https://martenframework.com/docs/api/dev/Marten.html#cache%3ACache%3A%3AStore%3A%3ABase-class-method).

La principale façon de mettre de nouvelles valeurs en cache est d'utiliser la méthode [`#fetch`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#fetch(key%3AString|Symbol%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Cforce%3Dfalse%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil%2C%26)%3AString|Nil-instance-method), qui est fournie sur tous les cache stores. Cette méthode permet de récupérer des données du cache en utilisant une clé spécifique : si une entrée existe pour cette clé dans le cache, alors les données sont retournées. Sinon, la valeur de retour du bloc (qui _doit_ être spécifié lors de l'appel à [`#fetch`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#fetch(key%3AString|Symbol%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Cforce%3Dfalse%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil%2C%26)%3AString|Nil-instance-method)) est écrite dans le cache et retournée. Cette méthode supporte quelques arguments supplémentaires qui permettent de personnaliser davantage la façon dont l'entrée est écrite dans le cache (ex. le temps d'expiration associé à l'entrée).

Par exemple :

```crystal
Marten.cache.fetch("mykey", expires_in: 4.hours) do
  "myvalue"
end
```

### Lire et écrire dans le cache

Il est important de mentionner que vous pouvez également lire explicitement depuis le cache et écrire dans le cache en utilisant respectivement les méthodes [`#read`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#read(key%3AString|Symbol%2Cversion%3AInt32|Nil%3Dnil)%3AString|Nil-instance-method) et [`#write`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#write(key%3AString|Symbol%2Cvalue%3AString%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil)-instance-method). La vérification de l'existence d'une clé peut être effectuée en utilisant la méthode [`#exists?`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#exists%3F(key%3AString|Symbol%2Cversion%3AInt32|Nil%3Dnil)%3ABool-instance-method).

Par exemple :

```crystal
# Pas encore d'entrée dans le cache.
Marten.cache.read("foo") # => nil
Marten.cache.exists?("foo") # => false

# Ajoutons l'entrée au cache.
Marten.cache.write("foo", "bar", expires_in: 10.minutes) # => true

# Lisons depuis le cache.
Marten.cache.read("foo") # => "bar"
Marten.cache.exists?("foo") # => true
```

### Supprimer une entrée du cache

La suppression d'une entrée du cache est rendue possible grâce à la méthode [`#delete`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#delete(key%3AString|Symbol)%3ABool-instance-method). Cette méthode prend la clé de l'entrée à supprimer comme argument et retourne un booléen indiquant si une entrée a effectivement été supprimée.

Par exemple :

```crystal
# Pas encore d'entrée dans le cache.
Marten.cache.delete("foo") # => false

# Ajoutons une entrée au cache puis supprimons-la.
Marten.cache.write("foo", "bar", expires_in: 10.minutes) # => true
Marten.cache.delete("foo") # => true
```

### Incrémenter et décrémenter des valeurs

Si vous devez persister des valeurs entières destinées à être incrémentées ou décrémentées, vous pouvez utiliser les méthodes [`#increment`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#increment(key%3AString%2Camount%3AInt32%3D1%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil)%3AInt-instance-method) et [`#decrement`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#decrement(key%3AString%2Camount%3AInt32%3D1%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil)%3AInt-instance-method). L'avantage de procéder ainsi est que l'opération d'incrémentation/décrémentation sera effectuée de manière atomique selon le cache store que vous utilisez (ex. c'est le cas pour les stores fournis par les shards [`marten-memcached-cache`](https://github.com/martenframework/marten-memcached-cache) et [`marten-redis-cache`](https://github.com/martenframework/marten-redis-cache)).

Par exemple :

```crystal
Marten.cache.increment("mycounter") # => 1
Marten.cache.increment("mycounter", amount: 2) # => 3
Marten.cache.decrement("mycounter") # => 2
```

### Vider le cache

Il est possible de vider entièrement le contenu du cache en utilisant la méthode [`#clear`](https://martenframework.com/docs/api/dev/Marten/Cache/Store/Base.html#clear-instance-method).

Par exemple :

```crystal
# Ajoutons une entrée au cache puis vidons le cache.
Marten.cache.write("foo", "bar", expires_in: 10.minutes)
Marten.cache.clear
```

:::caution
Vous devriez être très prudent lors de l'utilisation de cette méthode car elle supprimera entièrement toutes les entrées stockées dans le cache. Selon l'implémentation du store, seules les entrées _namespacées_ peuvent être supprimées (c'est le cas pour le [cache store Redis](https://github.com/martenframework/marten-redis-cache) par exemple).
:::

## Mise en cache de fragments de template

Vous pouvez utiliser la mise en cache de fragments de template lorsque vous souhaitez mettre en cache certaines parties de vos [templates](../templates.mdx). Cette capacité est activée par l'utilisation du tag de template [`cache`](../templates/reference/tags.md#cache).

Ce tag de template permet de mettre en cache le contenu d'un fragment de template (enclos dans les tags `{% cache %}...{% endcache %}`) pour une durée spécifique. Cette opération de mise en cache est effectuée en utilisant le [cache store global](#configuration-et-cache-stores) configuré. Le tag lui-même prend au moins deux arguments : le nom à donner au fragment de cache et un timeout de cache - exprimé en secondes.

Par exemple, l'extrait suivant met en cache le contenu enclos dans les tags `{% cache %}...{% endcache %}` pour une durée de 3600 secondes et l'associe au nom de fragment "articles" :

```html
{% cache "articles" 3600 %}
  <ul>
  {% for article in articles %}
    <li>{{ article.title }}</li>
  {% endfor %}
  </ul>
{% endcache %}
```

Il est important de noter que le tag de template [`cache`](../templates/reference/tags.md#cache) permet l'inclusion d'arguments supplémentaires. Ces arguments, appelés valeurs "vary on", jouent un rôle crucial dans la génération de la clé de cache du fragment de template. Essentiellement, le cache est invalidé si la valeur de l'un de ces arguments change. Cette fonctionnalité est pratique lorsque vous devez vous assurer que le fragment de template est mis en cache en fonction d'autres valeurs dynamiques qui peuvent impacter la génération du contenu mis en cache lui-même.

Par exemple, supposons que le contenu mis en cache dépend de la locale actuelle. Dans ce cas, vous voudriez vous assurer que la valeur de la locale actuelle est prise en compte lors de la mise en cache du fragment de template. La capacité de passer des arguments supplémentaires comme valeurs "vary on" vous permet de réaliser précisément cela.

Par exemple :

```html
{% cache "articles" 3600 current_locale user.id %}
  <ul>
  {% for article in articles %}
    <li>{{ article.title }}</li>
  {% endfor %}
  </ul>
{% endcache %}
```

:::tip
La "clé" utilisée pour l'entrée de cache du fragment de template peut être une variable de template. Il en va de même pour le timeout du cache. Par exemple :

```html
{% cache fragment_name fragment_expiry %}
  <ul>
  {% for article in articles %}
    <li>{{ article.title }}</li>
  {% endfor %}
  </ul>
{% endcache %}
```
:::
