---
title: Créer des cache stores
description: Comment créer des cache stores personnalisés.
---

Marten vous permet de créer facilement des [cache stores](../introduction.md#configuration-et-cache-stores) personnalisés que vous pouvez ensuite utiliser dans votre application pour effectuer des opérations de mise en cache.

## Définition basique d'un store

Définir un cache store est aussi simple que de créer une classe qui hérite de la classe abstraite [`Marten::Caching::Store::Base`](pathname:///api/dev/Marten/Cache/Store/Base.html) et qui implémente les méthodes suivantes :

* [`#clear`](pathname:///api/dev/Marten/Cache/Store/Base.html#clear-instance-method) - appelée lors du vidage du cache
* [`#decrement`](pathname:///api/dev/Marten/Cache/Store/Base.html#decrement(key%3AString%2Camount%3AInt32%3D1%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil)%3AInt-instance-method) - appelée lors de la décrémentation d'une valeur entière dans le cache
* [`#delete_entry`](pathname:///http://localhost:3000/docs/api/dev/Marten/Cache/Store/Base.html#delete_entry%28key%3AString%29%3ABool-instance-method) - appelée lors de la suppression d'une entrée du cache
* [`#increment`](pathname:///api/dev/Marten/Cache/Store/Base.html#increment(key%3AString%2Camount%3AInt32%3D1%2Cexpires_at%3ATime|Nil%3Dnil%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Cversion%3AInt32|Nil%3Dnil%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil%2Ccompress%3ABool|Nil%3Dnil%2Ccompress_threshold%3AInt32|Nil%3Dnil)%3AInt-instance-method) - appelée lors de l'incrémentation d'une valeur entière dans le cache
* [`#read_entry`](pathname:///api/dev/Marten/Cache/Store/Base.html#read_entry(key%3AString)%3AString|Nil-instance-method) - appelée lors de la lecture d'une entrée dans le cache
* [`#write_entry`](pathname:///api/dev/Marten/Cache/Store/Base.html#write_entry(key%3AString%2Cvalue%3AString%2Cexpires_in%3ATime%3A%3ASpan|Nil%3Dnil%2Crace_condition_ttl%3ATime%3A%3ASpan|Nil%3Dnil)-instance-method) - appelée lors de l'écriture d'une entrée dans le cache

Par exemple, l'extrait suivant implémente un store en mémoire qui persiste les entrées de cache dans un hash :

```crystal
class MemoryStore < Marten::Cache::Store::Base
  @data = {} of String => String

  def initialize(
    @namespace : String? = nil,
    @expires_in : Time::Span? = nil,
    @version : Int32? = nil,
    @compress = false,
    @compress_threshold = DEFAULT_COMPRESS_THRESHOLD
  )
    super
  end

  def clear : Nil
    @data.clear
  end

  def decrement(
    key : String,
    amount : Int32 = 1,
    expires_at : Time? = nil,
    expires_in : Time::Span? = nil,
    version : Int32? = nil,
    race_condition_ttl : Time::Span? = nil,
    compress : Bool? = nil,
    compress_threshold : Int32? = nil
  ) : Int
    apply_increment(
      key,
      amount: -amount,
      expires_at: expires_at,
      expires_in: expires_in,
      version: version,
      race_condition_ttl: race_condition_ttl,
      compress: compress,
      compress_threshold: compress_threshold
    )
  end

  def increment(
    key : String,
    amount : Int32 = 1,
    expires_at : Time? = nil,
    expires_in : Time::Span? = nil,
    version : Int32? = nil,
    race_condition_ttl : Time::Span? = nil,
    compress : Bool? = nil,
    compress_threshold : Int32? = nil
  ) : Int
    apply_increment(
      key,
      amount: amount,
      expires_at: expires_at,
      expires_in: expires_in,
      version: version,
      race_condition_ttl: race_condition_ttl,
      compress: compress,
      compress_threshold: compress_threshold
    )
  end

  private getter data

  private def apply_increment(
    key : String,
    amount : Int32 = 1,
    expires_at : Time? = nil,
    expires_in : Time::Span? = nil,
    version : Int32? = nil,
    race_condition_ttl : Time::Span? = nil,
    compress : Bool? = nil,
    compress_threshold : Int32? = nil
  )
    normalized_key = normalize_key(key.to_s)
    entry = deserialize_entry(read_entry(normalized_key))

    if entry.nil? || entry.expired? || entry.mismatched?(version || self.version)
      write(
        key: key,
        value: amount.to_s,
        expires_at: expires_at,
        expires_in: expires_in,
        version: version,
        race_condition_ttl: race_condition_ttl,
        compress: compress,
        compress_threshold: compress_threshold
      )
      amount
    else
      new_amount = entry.value.to_i + amount
      entry = Entry.new(new_amount.to_s, expires_at: entry.expires_at, version: entry.version)
      write_entry(normalized_key, serialize_entry(entry))
      new_amount
    end
  end

  private def delete_entry(key : String) : Bool
    deleted_entry = @data.delete(key)
    !!deleted_entry
  end

  private def read_entry(key : String) : String?
    data[key]?
  end

  private def write_entry(
    key : String,
    value : String,
    expires_in : Time::Span? = nil,
    race_condition_ttl : Time::Span? = nil
  )
    data[key] = value
    true
  end
end
```

## Activer l'utilisation de cache stores personnalisés

Les cache stores personnalisés peuvent être utilisés en assignant une instance de la classe correspondante au paramètre [`cache_store`](../../development/reference/settings.md#cache_store).

Par exemple :

```crystal
config.cache_store = MemoryStore.new
```
