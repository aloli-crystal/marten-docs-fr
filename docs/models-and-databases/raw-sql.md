---
title: Exécuter des requêtes SQL brutes
description: Apprenez à exécuter des requêtes SQL brutes.
sidebar_label: SQL brut
---

Marten vous donne la possibilité d'exécuter du SQL brut si les capacités fournies par les [query sets](./queries.md) ne sont pas suffisantes pour la tâche à accomplir. Ce faisant, plusieurs solutions peuvent être envisagées : vous pouvez soit décider d'effectuer des requêtes brutes qui sont mappées à des instances de modèle réelles, soit exécuter des instructions SQL entièrement personnalisées.

## Effectuer des requêtes brutes

Il est possible d'effectuer des requêtes SQL brutes et de s'attendre à ce que les enregistrements correspondants soient mappés à des instances de modèle réelles. Ceci est possible en utilisant la méthode de query set [`#raw`](./reference/query-set.md#raw).

Par exemple, l'extrait suivant permettrait d'itérer sur tous les enregistrements du modèle `Article` (en supposant que la table de base de données correspondante est `main_article`) :

```crystal
Article.raw("select * from main_article").each do |article|
  # Do something with `article` record
end
```

:::tip
Vous devez connaître le nom de la table du modèle que vous ciblez pour utiliser la méthode de query set [`#raw`](./reference/query-set.md#raw). Sauf si vous avez explicitement remplacé ce nom en utilisant la méthode de classe [`#db_table`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Table/ClassMethods.html#db_table(db_table%3AString|Symbol)-instance-method), le nom de la table du modèle est automatiquement généré par Marten en utilisant le format suivant : `<app_name>_<model_name>` (`model_name` étant la version en underscore du nom de classe du modèle).
:::

Il est à noter que vous pouvez également "injecter" des paramètres dans votre requête SQL. Pour ce faire, vous avez deux options : soit vous spécifiez ces paramètres comme arguments positionnels, soit vous les spécifiez comme arguments nommés. Les paramètres positionnels doivent être spécifiés en utilisant la syntaxe `?` tandis que les paramètres nommés doivent être spécifiés en utilisant le format `:param`.

Par exemple, la requête suivante utilise des paramètres positionnels :

```crystal
Article.raw("SELECT * FROM articles WHERE title = ? and created_at > ?", "Hello World!", "2022-10-30")
```

Et la suivante utilise des paramètres nommés :

```crystal
Article.raw(
  "SELECT * FROM articles WHERE title = :title and created_at > :created_at",
  title: "Hello World!",
  created_at: "2022-10-30"
)
```

:::caution
**N'utilisez pas l'interpolation de chaînes dans vos requêtes SQL !**

Vous ne devez jamais utiliser l'interpolation de chaînes dans vos requêtes SQL brutes car cela exposerait votre code à des attaques par injection SQL (où des attaquants peuvent injecter et exécuter du SQL arbitraire dans votre base de données).

Ainsi, ne faites jamais - au grand jamais - quelque chose comme ceci :

```crystal
Article.raw("SELECT * FROM articles WHERE title = '#{title}'")
```

Et à la place, faites quelque chose comme ceci :

```crystal
Article.raw("SELECT * FROM articles WHERE title = ?", title)
```

Notez également que les paramètres sont laissés **sans guillemets** dans les requêtes SQL brutes : c'est très important car ne pas le faire exposerait votre code à des vulnérabilités d'injection SQL. Les paramètres sont automatiquement mis entre guillemets par le backend de base de données sous-jacent.
:::

Enfin, il est à noter que Marten ne valide pas les requêtes SQL que vous spécifiez à la méthode de query set [`#raw`](./reference/query-set.md#raw). Il est de la responsabilité du développeur de s'assurer que ces requêtes sont (i) valides et (ii) qu'elles retournent des enregistrements qui correspondent au modèle considéré.

## Filtrer avec des prédicats SQL bruts

Marten fournit une fonctionnalité pour filtrer les query sets en utilisant des prédicats SQL bruts au sein de la méthode `#filter`. Ceci est utile lorsque vous avez besoin d'une logique de filtrage plus complexe que de simples comparaisons de fields, tout en souhaitant tirer parti des capacités de construction de requêtes de Marten.

L'utilisation de prédicats SQL bruts implique de spécifier une chaîne contenant le prédicat réel et des paramètres optionnels à la méthode `#filter` du query set. Par exemple :

```crystal
Author.filter("author_id IS NOT NULL")
Author.filter("first_name = ?", "John")
```

### Spécifier des paramètres

Vous pouvez "injecter" des paramètres dans vos prédicats SQL bruts lors de l'utilisation de la méthode `#filter`. Pour ce faire, vous avez deux options : soit vous spécifiez ces paramètres comme arguments positionnels, soit vous les spécifiez comme arguments nommés. Les paramètres positionnels doivent être spécifiés en utilisant la syntaxe `?` tandis que les paramètres nommés doivent être spécifiés en utilisant le format `:param`.

Par exemple, la requête suivante utilise des paramètres positionnels :

```crystal
Article.filter("title = ? and created_at > ?", "Hello World!", "2022-10-30")
```

Et la suivante utilise des paramètres nommés :

```crystal
Article.filter(
  "title = :title and created_at > :created_at",
  title: "Hello World!",
  created_at: "2022-10-30"
)
```

:::caution
**N'utilisez pas l'interpolation de chaînes dans vos prédicats SQL !**

Vous ne devez jamais utiliser l'interpolation de chaînes dans vos prédicats SQL bruts car cela exposerait votre code à des attaques par injection SQL (où des attaquants peuvent injecter et exécuter du SQL arbitraire dans votre base de données).

Ainsi, ne faites jamais - au grand jamais - quelque chose comme ceci :

```crystal
Article.filter("title = '#{title}'")
```

Et à la place, faites quelque chose comme ceci :

```crystal
Article.filter("title = ?", title)
```

Notez également que les paramètres sont laissés **sans guillemets** dans les requêtes SQL brutes : c'est très important car ne pas le faire exposerait votre code à des vulnérabilités d'injection SQL. Les paramètres sont automatiquement mis entre guillemets par le backend de base de données sous-jacent.
:::

### Utiliser les expressions `q`

Pour encore plus de flexibilité, vous pouvez combiner des prédicats SQL bruts avec la syntaxe des [expressions `q`](./queries#filtres-complexes-avec-les-expressions-q) au sein d'un bloc :

```crystal
Post.all.filter { q(category: "news") & q("created_at > ?", Time.local - 7.days) }
```

## Récupérer des enregistrements individuels avec des prédicats SQL bruts

Marten vous permet de récupérer des enregistrements individuels directement en utilisant des conditions SQL brutes avec les méthodes [`get`](./reference/query-set.md#get) et [`get!`](./reference/query-set.md#get-1). Ces méthodes fournissent une interface intuitive pour récupérer des enregistrements individuels tout en maintenant la sécurité et la flexibilité des requêtes paramétrées.

La méthode [`get`](./reference/query-set.md#get) récupère un seul enregistrement correspondant à la condition SQL brute. Elle retourne `nil` si aucun enregistrement ne correspond à la condition.

Par exemple, utilisez `get` avec des paramètres positionnels :

```crystal
article = Article.get("title = ? AND created_at > ?", "Hello World!", "2022-10-30")
```

La méthode [`get!`](./reference/query-set.md#get-1) est similaire mais lève une exception si aucun enregistrement n'est trouvé.

Par exemple, utilisez `get!` avec des paramètres nommés :

```crystal
article = Article.get!(
  "title = :title AND created_at > :created_at",
  title: "Hello World!",
  created_at: "2022-10-30"
)
```

## Exécuter d'autres instructions SQL

S'il est nécessaire d'exécuter d'autres instructions SQL qui ne relèvent pas du périmètre de ce que fournit la méthode de query set [`#raw`](./reference/query-set.md#raw), alors il est possible de s'appuyer sur les capacités de connexion DB de bas niveau.

Les connexions DB de Marten sont essentiellement des wrappers autour des connexions DB fournies par le package [crystal-db](https://github.com/crystal-lang/crystal-db). Elles peuvent être ouvertes, ce qui vous permet essentiellement d'exécuter n'importe quelle requête sur la base de données considérée.

Par exemple, l'extrait suivant ouvrirait une connexion à la base de données par défaut et exécuterait une requête simple :

```crystal
Marten::DB::Connection.default.open do |db|
  db.scalar("SELECT 1")
end
```

:::tip
Si vous utilisez plusieurs bases de données et devez exécuter des instructions SQL sur une base de données qui n'est pas celle par défaut, vous pouvez récupérer l'objet de connexion DB considéré en utilisant la méthode [`Marten::DB::Connection#get`](https://martenframework.com/docs/api/dev/Marten/DB/Connection.html#get(db_alias%3AString|Symbol)-class-method). Cette méthode nécessite simplement un argument correspondant à l'alias DB que vous souhaitez récupérer (c'est-à-dire l'alias que vous avez assigné à la base de données dans la [configuration des bases de données](../development/reference/settings.md#database-settings)) et retourne la connexion DB correspondante :

```crystal
db = Marten::DB::Connection.get(:other_db)

db.open do |db|
  db.scalar("SELECT 1")
end
```
:::

La méthode [`#open`](https://martenframework.com/docs/api/dev/Marten/DB/Connection/Base.html#open(%26)-instance-method) permet d'ouvrir une connexion à la base de données considérée, que vous pouvez ensuite utiliser pour effectuer des requêtes. Cette méthode utilise le [mécanisme d'ouverture DB de Crystal](https://crystal-lang.org/reference/database/index.html#open-database) et elle retourne les mêmes objets de connexion DB que vous obtiendriez si vous utilisiez `DB#open` directement :

```crystal
Marten::DB::Connection.default.open do |db|
  db.exec "create table contacts (name varchar(30), age int)"
end
```

Veuillez vous référer à [la documentation officielle de Crystal sur l'interaction avec les bases de données](https://crystal-lang.org/reference/database/index.html) pour en savoir plus sur cette API de bas niveau.
