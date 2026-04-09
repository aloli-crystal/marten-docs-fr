---
title: Stores de mise en cache
description: Référence des stores de mise en cache.
sidebar_label: Stores
---

## Stores intégrés

### Store en mémoire

C'est le store par défaut utilisé dans le cadre du paramètre [`cache_store`](../../development/reference/settings.md#cache_store).

Ce cache store est implémenté dans la classe [`Marten::Cache::Store::Memory`](pathname:///api/dev/Marten/Cache/Store/Memory.html). Ce cache stocke toutes les données en mémoire au sein du même processus, ce qui en fait une option rapide et fiable pour la mise en cache dans des environnements à processus unique. Cependant, il est important de noter que si vous exécutez plusieurs instances de votre application, les données du cache ne seront pas partagées entre elles.

Par exemple :

```crystal
Marten.configure do |config|
  config.cache_store = Marten::Cache::Store::Memory.new(expires_in: 24.hours)
end
```

### Store null

Une implémentation de cache store qui ne stocke aucune donnée.

Ce cache store est implémenté dans la classe [`Marten::Cache::Store::Null`](pathname:///api/dev/Marten/Cache/Store/Null.html). Ce cache store ne stocke aucune donnée, mais fournit un moyen de passer par l'interface de mise en cache. Cela peut être utile dans les environnements de développement et de test lorsque la mise en cache n'est pas souhaitée.

Par exemple :

```crystal
Marten.configure do |config|
  config.cache_store = Marten::Cache::Store::Null.new(expires_in: 24.hours)
end
```

## Autres stores

Des shards de cache store supplémentaires sont également maintenus sous l'égide du projet Marten ou par la communauté elle-même et peuvent être utilisés dans votre application selon vos besoins spécifiques de mise en cache :

* [`marten-memcached-cache`](https://github.com/martenframework/marten-memcached-cache) fournit un cache store [Memcached](https://memcached.org)
* [`marten-redis-cache`](https://github.com/martenframework/marten-redis-cache) fournit un cache store [Redis](https://redis.io)

:::info
N'hésitez pas à contribuer à cette page et à ajouter des liens vers vos shards si vous avez créé des cache stores qui ne sont pas listés ici !
:::
