---
title: Interroger les enregistrements de modèles
description: Apprenez à interroger les enregistrements de modèles.
sidebar_label: Requêtes
---

Une fois que les [modèles sont correctement définis](./introduction.md), il est possible d'utiliser l'API de requêtage pour interagir avec les enregistrements de modèles. Cette API vous permet de construire ce qu'on appelle communément des "query sets" : c'est-à-dire des représentations de collections d'enregistrements qui peuvent être lues, filtrées, mises à jour ou supprimées.

Ce document couvre les principales fonctionnalités de l'[API des query sets](./reference/query-set.md). La plupart des exemples utilisés pour illustrer ces fonctionnalités feront référence aux modèles suivants :

```crystal
class City < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :name, :string, max_size: 255
  field :population, :int, null: true, blank: true
end

class Author < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :first_name, :string, max_size: 255
  field :last_name, :string, max_size: 255
  field :hometown, :foreign_key, to: City, blank: true, null: true
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :subtitle, :string, max_size: 255, blank: true, null: true
  field :content, :text
  field :author, :many_to_one, to: Author, related: :articles
end
```

## Créer de nouveaux enregistrements

De nouveaux enregistrements de modèles peuvent être créés via l'utilisation des méthodes `#new` et `#create`. La méthode `#new` initialisera simplement un nouvel enregistrement de modèle qui n'est pas persisté dans la base de données. La méthode `#create` initialisera le nouvel enregistrement de modèle en utilisant les attributs spécifiés, puis le persistera dans la base de données.

Par exemple, il est possible de créer un nouvel enregistrement du modèle `Author` en spécifiant les valeurs de ses attributs `first_name` et `last_name` via l'utilisation de la méthode `create` comme ceci :

```crystal
Author.create(first_name: "John", last_name: "Doe")
```

Le même enregistrement `Author` pourrait être initialisé (mais pas sauvegardé !) via l'utilisation de la méthode `new` comme suit :

```crystal
Author.new(first_name: "John", last_name: "Doe")
```

Dans l'exemple précédent, l'instance de modèle ne sera pas automatiquement persistée dans la base de données. Pour la sauvegarder explicitement dans la base de données, il est possible d'utiliser la méthode `#save` :

```crystal
author = Author.new(first_name: "John", last_name: "Doe") # pas encore persisté !
author.save                                               # l'auteur est maintenant persisté dans la base de données !
```

Enfin, il est à noter que `#create` et `#new` supportent un bloc optionnel qui recevra l'enregistrement de modèle initialisé. Cela permet d'initialiser des attributs ou d'appeler des méthodes supplémentaires sur l'enregistrement en cours d'initialisation :

```crystal
Author.create do |author|
  author.first_name = "John"
  author.last_name = "Doe"
end
```

:::caution
Les enregistrements de modèles seront validés avant d'être sauvegardés dans la base de données. Si cette validation échoue, les méthodes `#create` et `#save` échoueront silencieusement : `#create` retournera l'instance de modèle invalide tandis que `#save` retournera `false`. Les méthodes `#create` et `#save` ont également des variantes bang (`#create!` et `#save!`) qui lèveront explicitement une erreur de validation (`Marten::DB::Errors::InvalidRecord`) en cas d'enregistrement invalide.

Veuillez vous référer à [Validations](./validations.md) pour en savoir plus sur les validations de modèles.
:::

## Capacités de requêtage basiques

Pour interagir avec une collection d'enregistrements de modèles, il est nécessaire de construire un "query set". Un query set représente une collection d'enregistrements de modèles dans la base de données. Il peut avoir des filtres, être paginé, etc. Sauf si une opération d'"écriture" spécifique est effectuée sur ces query sets, ils seront généralement mappés à une instruction `SELECT` standard où les filtres sont convertis en clauses `WHERE`.

Les query sets peuvent être construits à partir d'un modèle spécifique en utilisant des méthodes telles que `#all`, `#filter` ou `#exclude` (celles-ci sont décrites ci-dessous). L'une des caractéristiques clés des query sets est qu'ils sont **évalués paresseusement** : définir un query set n'impliquera généralement aucune opération de base de données. De plus, la plupart des méthodes fournies par les query sets retournent également de nouveaux objets query set. Les query sets ne sont traduits en requêtes SQL touchant la base de données sous-jacente que lorsque les enregistrements doivent être extraits ou manipulés par le code considéré.

Par exemple, des filtres peuvent être chaînés sur un query set sans qu'il soit évalué. Le query set n'est évalué que lorsque les enregistrements réels doivent être affichés ou lorsqu'il devient nécessaire d'interagir avec eux :

```crystal
qset = Article.filter(title__startswith: "Top") # le query set n'est pas évalué
qset = qset.filter(author__first_name: "John")  # le query set n'est pas évalué
puts qset                                       # le query set est évalué
```

Dans l'exemple ci-dessus, les deux filtres sont simplement chaînés sans que cela ne résulte en des accès à la base de données. Le query set n'est évalué que lorsque les enregistrements réels doivent être affichés.

Les query sets sont **itérables** : ils offrent la possibilité d'itérer sur les enregistrements résultants (ce qui forcera également l'évaluation du query set lorsque cela se produit) :

```crystal
qset = Article.filter(title__startswith: "Top") # le query set n'est pas évalué
qset.each { |article| puts article }            # le query set est évalué
```

### Interroger tous les enregistrements

La récupération de tous les enregistrements d'un modèle spécifique peut être réalisée via l'utilisation de la méthode `#all` :

```crystal
Author.all
```

"Tous les enregistrements" ne signifie pas nécessairement tous les enregistrements de la table considérée. Par exemple, `#all` peut être chaîné à un query set existant qui a été filtré (ce qui est généralement inutile puisque cela ne modifie pas les enregistrements résultants) :

```crystal
Author.filter(first_name: "John").all
```

### Filtrer des enregistrements spécifiques

Le filtrage des enregistrements est réalisé via l'utilisation de la méthode `#filter`. La méthode `#filter` nécessite un ou plusieurs arguments nommés de prédicat (dans le format décrit dans [Prédicats de field](#prédicats-de-field)). Par exemple :

```crystal
Author.filter(first_name: "John")
```

Le query set ci-dessus retournera les enregistrements `Author` dont le prénom est "John".

Il est possible de filtrer les enregistrements en utilisant plusieurs filtres. Par exemple, les requêtes suivantes sont équivalentes :

```crystal
Author.filter(first_name: "John").filter(last_name: "Doe")
Author.filter(first_name: "John", last_name: "Doe")
```

Par défaut, les filtres impliquant plusieurs paramètres comme dans les exemples ci-dessus produisent toujours des requêtes SQL dont les paramètres sont combinés avec "AND". Des requêtes plus complexes (par ex. utilisant des conditions AND, OR, XOR ou NOT) peuvent être réalisées via l'utilisation du DSL `q` (décrit dans [Filtres complexes avec les expressions `q`](#filtres-complexes-avec-les-expressions-q)), comme illustré par les exemples suivants :

```crystal
# Obtenir les enregistrements Author avec "Bob" ou "Alice" comme prénom
Author.filter { q(first_name: "Bob") | q(first_name: "Alice") }

# Obtenir les enregistrements Author dont les prénoms ne sont pas "John"
Author.filter { -q(first_name: "Alice") }
```

Marten offre également la possibilité de filtrer les query sets en utilisant des [prédicats SQL bruts](./raw-sql#filtrer-avec-des-prédicats-sql-bruts). Ceci est utile lorsque vous souhaitez exploiter la flexibilité du SQL pour des conditions spécifiques, tout en laissant Marten gérer la sélection des colonnes et la construction de la requête pour le reste. Pour utiliser des prédicats SQL bruts, vous pouvez spécifier une chaîne contenant le prédicat avec des paramètres optionnels à la méthode `#filter` du query set :

```crystal
Author.filter("first_name = :first_name", first_name: "John")
Author.filter("first_name = ?", "John")
Author.filter { q("first_name = :first_name", first_name: "John") }
```

### Exclure des enregistrements spécifiques

L'exclusion d'enregistrements est réalisée via l'utilisation de la méthode `#exclude`. Cette méthode fournit exactement la même API que la méthode [`#filter`](#filtrer-des-enregistrements-spécifiques) décrite précédemment. Elle nécessite un ou plusieurs arguments nommés de prédicat (dans le format décrit dans [Prédicats de field](#prédicats-de-field)). Par exemple :

```crystal
Author.exclude(first_name: "John")

Author.exclude(first_name: "John").exclude(last_name: "Doe")
Author.exclude(first_name: "John", last_name: "Doe")

Author.exclude { q(first_name: "Bob") | q(first_name: "Alice") }
```

### Récupérer un enregistrement spécifique

La récupération d'un enregistrement spécifique est réalisée via l'utilisation de la méthode `#get`, qui nécessite un ou plusieurs arguments nommés de prédicat (dans le format décrit dans [Prédicats de field](#prédicats-de-field)). Par exemple :

```crystal
Author.get(id: 1)
Author.get(first_name: "John")
```

Si l'enregistrement n'est pas trouvé, `nil` sera retourné. Il est à noter qu'une version bang de cette méthode existe également : `#get!`. Cette méthode alternative lève une erreur `Marten::DB::Errors::RecordNotFound` si l'enregistrement n'est pas trouvé. Quelle que soit la méthode utilisée, si plusieurs enregistrements sont trouvés pour les prédicats passés, une erreur `Marten::DB::Errors::MultipleRecordsFound` est levée.

Il est également possible de chaîner un appel `#get` sur un query set déjà filtré :

```crystal
Author.filter(first_name: "John").get(id: 42)
```

Un enregistrement peut également être récupéré avec un prédicat SQL brut. Par exemple :

```crystal
Author.get("id=?", 42)
Author.get("id=:id", id: 42)
```

### Récupérer le premier ou le dernier enregistrement

Les méthodes `#first` et `#last` peuvent être utilisées pour récupérer le premier ou le dernier enregistrement d'un query set donné.

```crystal
Author.filter(first_name: "John").first
Author.filter(first_name: "John").last
```

Si le query set considéré est vide, la valeur retournée sera `nil`. Il est à noter que ces méthodes ont un équivalent bang (`#first!` et `#last!`) qui lèvent toutes deux une `NilAssertionError` si le query set est vide.

### Prédicats de field

Les prédicats de field permettent de définir des filtres qui sont appliqués à un query set donné. Ils correspondent aux clauses `WHERE` dans les requêtes SQL produites.

Par exemple :

```crystal
Article.filter(title__icontains: "top")
```

Sera traduit en une requête SQL comme la suivante (en utilisant la syntaxe PostgreSQL) :

```sql
SELECT * FROM articles WHERE title LIKE UPPER("top")
```

Les prédicats de field contiennent toujours un nom de field obligatoire (`title` dans l'exemple précédent) et un type de prédicat optionnel (`icontains` dans l'exemple précédent). Le nom du field et le type de prédicat sont toujours séparés par une notation double underscore (`__`). Cette notation (`<field_name>__<predicate_type>`) est utilisée comme nom d'argument nommé tandis que la valeur de l'argument est utilisée pour définir la valeur à utiliser pour effectuer le filtrage.

:::tip
Le nom du field peut correspondre à n'importe lequel des fields définis dans le modèle filtré. Pour les fields `many_to_one` ou `one_to_one`, il est possible d'ajouter un `_id` à la fin du nom du field pour filtrer explicitement sur l'ID brut de l'enregistrement lié :

```crystal
Article.all.filter(author_id: 42)
```
:::

Marten supporte de nombreux types de prédicats, qui sont tous documentés dans la [référence des prédicats de field](./reference/query-set.md#prédicats-de-field). Ceux que vous rencontrerez le plus fréquemment sont décrits ci-dessous :

#### `exact`

Le prédicat de field `exact` peut être utilisé pour des correspondances "exactes" : seuls les enregistrements dont les valeurs de field correspondent exactement à la valeur spécifiée seront retournés. C'est le type de prédicat par défaut, et il n'est pas nécessaire de le spécifier lors du filtrage des enregistrements de modèles.

Ainsi, les deux exemples suivants sont équivalents :

```crystal
Author.filter(first_name: "John")
Author.filter(first_name__exact: "John")
```

#### `iexact`

Ce prédicat de field peut être utilisé pour des correspondances insensibles à la casse.

Par exemple, le filtre suivant retournerait les enregistrements `Article` dont les titres sont `Test`, `TEST` ou `test` :

```crystal
Article.filter(title__iexact: "test")
```

#### `contains`

Ce prédicat de field peut être utilisé pour filtrer les chaînes qui doivent contenir une valeur spécifique. Par exemple :

```crystal
Article.filter(title__contains: "top")
```

Un équivalent insensible à la casse (`icontains`) est également disponible.

## Capacités de requêtage avancées

### Filtres complexes avec les expressions `q`

Comme mentionné précédemment, les prédicats de field exprimés en tant qu'arguments nommés utiliseront un opérateur AND dans les clauses `WHERE` produites. Pour produire des conditions utilisant d'autres opérateurs, il est nécessaire d'utiliser les expressions `q`.

Pour produire de telles expressions, les méthodes comme `#filter`, `#exclude` ou `#get` peuvent recevoir un bloc permettant de définir des conditions complexes. À l'intérieur de ce bloc, une méthode `#q` peut être utilisée pour définir des noeuds de conditions qui peuvent être combinés ensemble en utilisant les opérateurs suivants :

* `&` pour effectuer un "AND" logique
* `|` pour effectuer un "OR" logique
* `^` pour effectuer un "XOR" logique
* `-` pour effectuer une négation logique

Par exemple, l'extrait suivant retournera tous les enregistrements `Article` dont le titre commence par "Top" ou "10" :

```crystal
Article.filter { q(title__startswith: "Top") | q(title__startswith: "10") }
```

En utilisant cette approche, il est possible de produire des conditions complexes en combinant des expressions `q()` avec les opérateurs `&`, `|`, `^` et `-`. Des parenthèses peuvent également être utilisées pour regrouper les instructions :

```crystal
Article.filter {
  (q(title__startswith: "Top") | q(title__startswith: "10")) & -q(author__first_name: "John")
}
```

Enfin, il est à noter que vous pouvez définir plusieurs prédicats de field _à l'intérieur_ des expressions `q()`. Lorsque vous le faites, les prédicats de field seront combinés avec "AND" :

```crystal
Article.filter {
  q(title__startswith: "Top") & -q(author__first_name: "John", author__last_name: "Doe")
}
```

### Filtrer les relations

La notation double underscores décrite précédemment (`__`) peut également être utilisée pour filtrer en fonction des fields de modèles liés. Par exemple, dans les définitions de modèles considérées, nous avons un modèle `Article` qui définit une relation (field `many_to_one`) vers le modèle `Author` via le field `author`. Le modèle `Author` lui-même définit également une relation vers un enregistrement `City` via le field `hometown`.

Étant donné ce modèle de données, nous pourrions facilement récupérer les enregistrements `Article` dont le prénom de l'auteur est "John" avec le query set suivant :

```crystal
Article.filter(author__first_name: "John")
```

Nous pourrions même récupérer tous les enregistrements `Article` dont les auteurs sont situés à "Montréal" avec le query set suivant :

```crystal
Article.filter(author__hometown__name: "Montreal")
```

Et évidemment, les query sets ci-dessus pourraient également être utilisés avec des types de prédicats de field plus spécifiques. Par exemple :

```crystal
Author.filter(author__hometown__name__startswith: "New")
```

Lors d'un "filtrage en profondeur" comme celui-ci, les tables de modèles liés sont automatiquement "jointes" au niveau SQL pour effectuer la requête (des jointures internes ou des jointures externes gauches sont utilisées selon la nullabilité des fields filtrés).

Il est intéressant de noter que cette capacité de filtrage fonctionne également pour les [relations many-to-many](./relationships.md#relations-many-to-many) et les relations inverses. Par exemple, en supposant que le modèle `Article` définit un field `tags` [many-to-many](./reference/fields.md#many_to_many) vers un modèle hypothétique `Tag`, la requête suivante serait possible :

```crystal
Article.filter(tags__label: "crystal")
```

### Pré-sélectionner les relations avec des jointures

Il est également possible de définir explicitement qu'un query set spécifique doit "joindre" un ensemble de relations. Cela peut entraîner de belles améliorations de performances puisque cela peut aider à réduire le nombre de requêtes SQL effectuées pour un code donné. Ceci est réalisé via l'utilisation de la méthode [`#join`](./reference/query-set.md#join) :

```crystal
author_1 = Author.filter(first_name: "John")
puts author_1.hometown # Accès à la base de données pour récupérer l'enregistrement City associé

author_2 = Author.join(:hometown).filter(first_name: "John")
puts author_2.hometown # Pas d'accès supplémentaire à la base de données
```

La notation double underscores peut également être utilisée dans le contexte des jointures. Par exemple :

```crystal
# Les enregistrements Author et City associés seront sélectionnés et entièrement initialisés
# avec l'enregistrement Article sélectionné.
Article.join(:author__hometown).get(id: 42)
```

Enfin, il est intéressant de mentionner que plusieurs relations peuvent être spécifiées à [`#join`](./reference/query-set.md#join). Par exemple :

```crystal
Article.join(:author__hometown, :edited_by)
```

:::info
Veuillez noter que la méthode de query set [`#join`](./reference/query-set.md#join) ne peut être utilisée que sur les relations [many-to-one](./relationships.md#relations-many-to-one), les relations [one-to-one](./relationships.md#relations-one-to-one) et les relations one-to-one inverses. Pour les relations multi-valeurs, veuillez considérer le [pré-chargement des enregistrements](#pré-charger-les-relations).
:::

### Pré-charger les relations

Alors que la [pré-sélection des relations avec des jointures](#pré-sélectionner-les-relations-avec-des-jointures) peut entraîner des améliorations de performances (et aider à réduire le nombre de requêtes SQL) en effectuant des jointures au niveau SQL, il est également possible de _pré-charger les relations_ en utilisant la méthode [`#prefetch`](./reference/query-set.md#prefetch).

Les deux méthodes servent un objectif commun, visant à atténuer les problèmes N+1 couramment rencontrés lors de l'accès aux objets liés. Cependant, leurs stratégies divergent dans leur approche :

* Avec [`#join`](./reference/query-set.md#join), les relations spécifiées sont suivies et chaque enregistrement retourné par le query set considéré a les objets liés correspondants déjà sélectionnés et remplis. Les améliorations de performances sont obtenues en réduisant le nombre de requêtes SQL puisque les enregistrements liés sont récupérés en créant une jointure SQL et en incluant leurs fields dans l'instruction SELECT principale. Pour cette raison, [`#join`](./reference/query-set.md#join) ne peut être utilisé que sur des relations à valeur unique : les relations [many-to-one](./relationships.md#relations-many-to-one), les relations [one-to-one](./relationships.md#relations-one-to-one) et les relations one-to-one inverses.
* Avec [`#prefetch`](./reference/query-set.md#prefetch), les enregistrements correspondant aux relations spécifiées seront pré-chargés en lots uniques et chaque enregistrement retourné par le query set original aura les objets liés correspondants déjà sélectionnés et remplis. Ainsi, [`#prefetch`](./reference/query-set.md#prefetch) peut être utilisé avec tout type de relation : les relations [many-to-one](./relationships.md#relations-many-to-one), les relations [one-to-one](./relationships.md#relations-one-to-one), les relations [many-to-many](./relationships.md#relations-many-to-many) et tous les types de relations inverses.

Par exemple, en supposant qu'un modèle `Post` définit un field many-to-many `tags` :

```crystal
posts_1 = Post.all.to_a
# accède à la base de données pour récupérer les "tags" liés (relation many-to-many)
puts posts_1[0].tags.to_a

posts_2 = Post.all.prefetch(:tags).to_a
# n'accède pas à la base de données puisque la relation "tags" a déjà été pré-chargée
puts posts_2[0].tags.to_a
```

La notation double underscores peut également être utilisée lors du pré-chargement des relations. Dans ce cas, les enregistrements ciblés par le query set original seront décorés avec les enregistrements pré-chargés, et ces enregistrements seront décorés avec les enregistrements pré-chargés suivants. Par exemple :

```crystal
# Les enregistrements Book et BookGenres associés seront pré-chargés et entièrement initialisés
# au niveau des enregistrements Author et Book.
Author.prefetch(:books__genres)
```

Enfin, il est intéressant de mentionner que plusieurs relations peuvent être spécifiées à [`#prefetch`](./reference/query-set.md#prefetch). Par exemple :

```crystal
Author.prefetch(:books__genres, :publisher)
```

### Pagination

Marten fournit un mécanisme de pagination que vous pouvez utiliser pour itérer facilement sur les enregistrements répartis sur plusieurs pages de données. Cela fonctionne comme suit : chaque objet query set vous permet de générer un "paginateur" (instance de [`Marten::DB::Query::Paginator`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Paginator.html)) à partir d'une taille de page donnée (le nombre d'enregistrements que vous souhaitez sur chaque page). Vous pouvez ensuite utiliser ce paginateur pour demander des pages spécifiques, ce qui vous donne accès aux enregistrements correspondants et à des métadonnées de pagination supplémentaires.

Par exemple :

```crystal
query_set = Article.filter(published: true)

paginator = query_set.paginator(10)
paginator.page_size   # => 10
paginator.pages_count # => 6
paginator.total_count # => 60

# Récupérer la première page et itérer sur les enregistrements sous-jacents
page = paginator.page(1)
page.each { |article| puts article }
page.number               # 1
page.previous_page?       # => false
page.previous_page_number # => nil
page.next_page?           # => true
page.next_page_number     # => 2
page.total_count          # => 60
```

Comme vous pouvez le voir, les objets paginateur vous permettent de demander des pages spécifiques en fournissant un numéro de page (indexé à partir de 1 !) à la méthode [`#page`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Paginator.html#page(number%3AInt)-instance-method). Ces pages sont des instances de [`Marten::DB::Query::Page`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Page.html) et vous donnent la possibilité d'itérer facilement sur les enregistrements correspondants. Elles vous donnent également la possibilité de récupérer des informations liées à la pagination (par ex. sur les pages précédente et suivante en utilisant les méthodes [`#previous_page?`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Page.html#previous_page%3F-instance-method), [`#previous_page_number`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Page.html#previous_page_number-instance-method), [`#next_page?`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Page.html#next_page%3F-instance-method) et [`#next_page_number`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Page.html#next_page_number-instance-method)).

## Mettre à jour des enregistrements

Une fois qu'un enregistrement de modèle a été récupéré de la base de données, il est possible de le mettre à jour en modifiant ses attributs et en appelant la méthode `#save` (déjà mentionnée précédemment) :

```crystal
article = Article.get(id: 42)
article.title = "Updated!"
article.save
```

Il est également possible de mettre à jour des enregistrements via l'utilisation de query sets. Pour ce faire, la méthode `#update` peut être chaînée à un query set prédéfini afin de mettre à jour tous les enregistrements résultants :

```crystal
Article.filter(title: "My article").update(title: "Updated!")
```

Lors de l'appel de la méthode `#update` comme dans l'exemple précédent, la mise à jour est effectuée au niveau SQL (en utilisant une instruction SQL `UPDATE` régulière) et la méthode retourne le nombre d'enregistrements impactés. Il est donc important de se rappeler que les enregistrements mis à jour de cette manière ne seront pas instanciés ni validés avant la mise à jour, et qu'aucun callback ne sera exécuté pour eux.

## Supprimer des enregistrements

Les enregistrements de modèles individuels récupérés de la base de données peuvent être supprimés en utilisant la méthode `#delete` :

```crystal
article = Article.get(id: 42)
article.delete
```

Marten fournit également la possibilité de supprimer les enregistrements ciblés par un query set spécifique via l'utilisation de la méthode `#delete`, comme dans l'exemple suivant :

```crystal
Article.filter(title: "My article").delete
```

Par défaut, les objets liés qui sont associés aux enregistrements supprimés seront également supprimés en suivant la stratégie de suppression définie dans chaque field de relation (option `on_delete`, voir la [référence](./reference/fields.md#on_delete) pour plus de détails). La méthode retourne toujours le nombre d'enregistrements supprimés.

## Scopes

Les scopes permettent la pré-définition de query sets filtrés spécifiques, qui peuvent être facilement appliqués aux classes de modèles et aux query sets de modèles. Lors de la définition de ces scopes, toutes les capacités de query set qui ont été couvertes précédemment (telles que le [filtrage d'enregistrements](#filtrer-des-enregistrements-spécifiques), l'[exclusion d'enregistrements](#exclure-des-enregistrements-spécifiques), etc.) peuvent être utilisées.

### Définir des scopes

Les scopes peuvent être définis via l'utilisation de la macro [`#scope`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Querying.html#scope(name%2C%26block)-macro). Cette macro attend un nom de scope (littéral de chaîne ou symbole) comme premier argument et nécessite un bloc où la logique de filtrage du query set est définie.

Par exemple :

```crystal
class Post < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :is_published, :bool, default: false
  field :created_at, :date_time

  // highlight-next-line
  scope :published { filter(is_published: true) }
  // highlight-next-line
  scope :unpublished { filter(is_published: false) }
  // highlight-next-line
  scope :recent { filter(created_at__gt: 1.year.ago) }
end
```

Avec la définition de modèle ci-dessus, il est possible d'obtenir les posts publiés en utilisant l'appel de méthode suivant :

```crystal
Post.published # => Post::QuerySet [...]>
```

De même, récupérer tous les posts publiés à partir d'un objet query set peut être accompli en appelant la méthode `#published` sur l'objet query set :

```crystal
query_set = Post.all
query_set.published # => Post::QuerySet [...]>
```

Grâce à cette capacité, il est important de noter que les scopes peuvent techniquement être chaînés. Par exemple, l'extrait suivant retournera tous les posts publiés qui ont été créés il y a moins d'un an :

```crystal
Post.published.recent # => Post::QuerySet [...]>
```

### Définir des scopes avec des arguments

Si nécessaire, vous pouvez définir des scopes qui nécessitent des arguments. Pour ce faire, incluez simplement les arguments requis dans le bloc du scope.

Par exemple :

```crystal
class Post < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :author, :many_to_one, to: Author

  // highlight-next-line
  scope :by_author_id { |author_id| filter(author_id: author_id) }
end
```

Les scopes qui nécessitent des arguments peuvent être utilisés de la même manière que les scopes sans argument ; ils peuvent être appelés sur les classes de modèles ou les query sets de modèles :

```crystal
Post.by_author_id(42)      # => Post::QuerySet [...]>

query_set = Post.all
query_set.by_author_id(42) # => Post::QuerySet [...]>
```

### Définir des scopes par défaut

Par défaut, interroger tous les enregistrements de modèle retourne des query sets non filtrés. Cependant, vous pouvez définir un scope par défaut pour appliquer automatiquement un filtre spécifique à toutes les requêtes pour ce modèle. Cela garantit que certains critères sont systématiquement appliqués sans avoir besoin d'inclure explicitement un filtre spécifique dans chaque requête.

Les scopes par défaut peuvent être définis via l'utilisation de la macro [`#default_scope`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Querying.html#default_scope-macro). Cette macro nécessite un bloc où la logique de filtrage du query set est définie.

Par exemple :

```crystal
class Post < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :is_published, :bool, default: false
  field :created_at, :date_time

  // highlight-next-line
  default_scope { filter(is_published: true) }
end
```

### Désactiver le scoping

Il est intéressant de mentionner que les enregistrements de modèle sans scope sont toujours accessibles via l'utilisation de la méthode de classe [`#unscoped`](https://martenframework.com/docs/api/dev/Marten/DB/Model/Querying/ClassMethods.html#unscoped-instance-method). Ceci est particulièrement utile si votre modèle définit un scope par défaut et que vous devez le contourner pour certaines requêtes.

Par exemple :

```crystal
class Post < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :is_published, :bool, default: false
  field :created_at, :date_time

  // highlight-next-line
  default_scope { filter(is_published: true) }
end
```

Avec la définition de modèle ci-dessus, vous pouvez récupérer tous les enregistrements `Post` en contournant le scope par défaut avec :

```crystal
Post.unscoped # => Post::QuerySet [...]>
```

## Agrégations

Les sections précédentes ont couvert les moyens de filtrer et d'ordonner les enregistrements de modèles. Cependant, il arrive que vous ayez besoin de récupérer des valeurs calculées qui résument ou agrègent des collections d'objets. Cette section décrit comment générer et retourner des valeurs agrégées en utilisant l'API de requêtes de Marten.

Concernant les agrégations, on peut généralement considérer deux cas d'utilisation principaux :

* Retourner une seule valeur calculée à partir d'un query set donné.
* Annoter un query set avec des données agrégées supplémentaires sur lesquelles on peut filtrer et qui sont disponibles pour chaque enregistrement du query set.

### Retourner une seule valeur agrégée

#### Compter des objets

L'agrégation la plus basique est le comptage du nombre d'objets dans un query set. Cela peut être fait en utilisant la méthode [`#count`](./reference/query-set.md#count).

Par exemple :

```crystal
Article.all.count                              # retourne le nombre d'enregistrements article
Article.all.count(:subtitle)                   # retourne le nombre d'articles où le sous-titre n'est pas null
Article.filter(title__startswith: "Top").count # retourne le nombre d'articles dont le titre commence par "Top"
```

#### Sommer des valeurs

La méthode [`#sum`](./reference/query-set.md#sum) retourne la somme des valeurs d'un field de modèle donné.

Par exemple :

```crystal
City.all.sum(:population) # retourne la somme des valeurs de population de toutes les villes
```

#### Calculer des moyennes

La méthode [`#average`](./reference/query-set.md#average) retourne la moyenne des valeurs d'un field de modèle donné.

Par exemple :

```crystal
City.all.average(:population) # retourne la moyenne des valeurs de population de toutes les villes
```

#### Calculer des valeurs minimales et maximales

Les méthodes [`#minimum`](./reference/query-set.md#minimum) et [`#maximum`](./reference/query-set.md#maximum) retournent respectivement les valeurs minimale et maximale d'un field de modèle donné à travers un query set.

Par exemple :

```crystal
City.all.minimum(:population) # retourne la valeur de population minimale de toutes les villes
City.all.maximum(:population) # retourne la valeur de population maximale de toutes les villes
```

### Annoter les query sets avec des données agrégées

Les sections précédentes ont couvert les moyens de récupérer une seule valeur agrégée à partir d'un query set donné. Cependant, parfois vous aurez besoin de "conserver" les valeurs agrégées pour chaque enregistrement du query set (éventuellement pour un filtrage ultérieur ou pour utiliser les valeurs agrégées lors de la manipulation d'enregistrements individuels). Cela peut être réalisé en utilisant la méthode [`#annotate`](./reference/query-set.md#annotate).

Cette méthode nécessite l'utilisation d'un bloc qui sera utilisé pour définir la valeur agrégée pour chaque enregistrement du query set. Par exemple :

```crystal
query_set = Author.all.annotate { count(:articles) }
```

Tous les types de méthodes d'agrégation couverts précédemment peuvent être utilisés dans le bloc. Par exemple :

| Méthode d'agrégation | Description |
|---------------------|-------------|
| `count` | Compte le nombre d'enregistrements |
| `sum` | Retourne la somme des valeurs d'un field donné |
| `average` | Retourne la moyenne des valeurs d'un field donné |
| `minimum` | Retourne la valeur minimale d'un field donné |
| `maximum` | Retourne la valeur maximale d'un field donné |

Par exemple :

```crystal
Author.all.annotate { count(:articles) }
Author.all.annotate { sum(:articles__score) }
Author.all.annotate { average(:articles__score) }
Author.all.annotate { minimum(:articles__score) }
Author.all.annotate { maximum(:articles__score) }
```

#### Accéder aux valeurs annotées

Une fois qu'un query set annoté a été récupéré, il est possible d'accéder aux valeurs annotées pour chaque enregistrement en utilisant la méthode [`#annotations`](https://martenframework.com/docs/api/dev/Marten/DB/Model.html#annotations%3AHash(String%2CBool|File|Float32|Float64|Int32|Int64|JSON%3A%3AAny|JSON%3A%3ASerializable|Marten%3A%3ADB%3A%3AField%3A%3AFile%3A%3AFile|Marten%3A%3AHTTP%3A%3AUploadedFile|String|Symbol|Time|Time%3A%3ASpan|UUID|Nil)-instance-method). Cette méthode retourne un hash où les clés sont les noms des fields annotés et les valeurs sont les valeurs annotées.

Par exemple :

```crystal
annotated_query_set = Author.all.annotate { count(:articles) }
annotated_query_set.each do |author|
  puts author.annotations["articles_count"]
end
```

Il est intéressant de mentionner que les noms d'annotations sont générés en concaténant le nom du field ou de la relation avec le type d'annotation. Par exemple, le nom d'annotation pour l'annotation `count` sur la relation inverse `articles` est `articles_count`, sauf si [un nom d'alias est spécifié](#spécifier-un-nom-dalias-pour-une-annotation).

#### Spécifier plusieurs annotations

Il est également possible de spécifier plusieurs annotations à la fois lors de l'utilisation de la méthode [`#annotate`](./reference/query-set.md#annotate). Cela peut être réalisé en appelant la méthode plusieurs fois ou en définissant le bloc sur plusieurs lignes.

Par exemple, les deux query sets suivants sont équivalents :

```crystal
query_set_1 = Author.all
  .annotate { count(:articles) }
  .annotate { sum(:articles__score) }

query_set_2 = Article.all.annotate do
  count(:articles)
  sum(:articles__score)
end
```

#### Spécifier un nom d'alias pour une annotation

Il est également possible de spécifier un nom d'alias pour une annotation en utilisant la méthode `#as`. Cela peut être réalisé en appelant la méthode d'annotation avec le nom d'alias spécifié via l'argument `alias_name` ou en appelant la méthode `#alias` sur l'objet annotation lui-même.

Par exemple, les deux query sets suivants sont équivalents :

```crystal
query_set_1 = Author.all.annotate { count(:articles, alias_name: :my_ann) }
query_set_2 = Author.all.annotate { count(:articles).alias(:my_ann) }
```

Dans les exemples précédents, la valeur d'annotation sera disponible sous la clé `my_ann` au lieu de la clé par défaut `articles_count` lors de l'[accès aux valeurs annotées](#accéder-aux-valeurs-annotées).

#### Calculer des annotations distinctes

Il est également possible de calculer des annotations distinctes en spécifiant l'argument `distinct: true` à la méthode d'annotation ou en appelant la méthode `#distinct` sur l'objet annotation lui-même.

Par exemple, les deux query sets suivants sont équivalents :

```crystal
query_set_1 = Author.all.annotate { sum(:articles__score, distinct: true) }
query_set_2 = Author.all.annotate { sum(:articles__score).distinct }
```

Dans les exemples précédents, la valeur d'annotation sera calculée en sommant les valeurs distinctes du field `score`.

#### Ordonner par valeurs annotées

Il est possible d'ordonner les enregistrements d'un query set par une valeur annotée en utilisant la méthode [`#order`](./reference/query-set.md#order). Pour ce faire, vous pouvez simplement spécifier les alias des valeurs annotées par lesquelles vous souhaitez ordonner.

Par exemple :

```crystal
Author.all.annotate { count(:articles) }.order(:articles_count)
Author.all.annotate { count(:articles) }.order("-articles_count")
```

#### Filtrer sur les valeurs annotées

Pour filtrer sur les valeurs annotées, vous pouvez utiliser la méthode [`#filter`](./reference/query-set.md#filter) et utiliser les alias des valeurs annotées sur lesquelles vous souhaitez filtrer.

Par exemple :

```crystal
Author.all.annotate { count(:articles) }.filter(articles_count__gt: 10)
Author
  .filter(first_name: "John")
  .annotate { count(:articles) }
  .filter(articles_count__gt: 10)
```

:::warning
Le filtrage sur les valeurs annotées est une fonctionnalité expérimentale. Tous les backends de base de données supportés par Marten permettent le filtrage sur les valeurs annotées tant que ces filtres sont appliqués séparément des filtres ciblant d'autres fields.

Si vous souhaitez combiner des filtres dans un seul appel `#filter` qui cible à la fois des valeurs annotées et d'autres fields, vous devez noter que cela n'est actuellement supporté que par les backends PostgreSQL et SQLite.
:::
