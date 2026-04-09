---
title: Query set
description: Référence des query sets.
---

Cette page fournit une référence pour toutes les méthodes de query set et les prédicats disponibles qui peuvent être utilisés lors du filtrage des enregistrements de modèles.

## Évaluation paresseuse des query sets

Les query sets sont **évalués paresseusement** : définir un query set n'impliquera généralement aucune opération de base de données. De plus, la plupart des méthodes fournies par les query sets retournent également de nouveaux objets query set. Les query sets ne sont traduits en requêtes SQL touchant la base de données sous-jacente que lorsque les enregistrements doivent être extraits ou manipulés par le code considéré.

Par exemple :

```crystal
qset = Article.filter(title__startswith: "Top") # le query set n'est pas évalué
qset = qset.filter(author__first_name: "John")  # le query set n'est pas évalué
puts qset                                       # le query set est évalué
```

Dans l'exemple ci-dessus, les deux filtres sont simplement chaînés sans que cela ne résulte en des accès à la base de données. Le query set n'est évalué que lorsque les enregistrements réels doivent être affichés.

De manière générale, les query sets sont évalués dans les situations suivantes :

* lors de l'itération sur les enregistrements sous-jacents (par ex. lors de l'utilisation de `#each`)

  ```crystal
  Article.filter(title__startswith: "Top").each do |article|
    puts article
  end
  ```

* lors de la récupération des enregistrements pour une plage spécifique

  ```crystal
  Article.filter(title__startswith: "Top")[4..10]
  ```

* lors de l'affichage de l'objet query set (par ex. en utilisant `puts`)

## Méthodes qui retournent de nouveaux query sets

Les query sets fournissent un ensemble de méthodes qui permettent de générer d'autres query sets (potentiellement filtrés). L'appel de ces méthodes n'entraînera pas l'évaluation du query set.

### `[](range)`

Retourne les enregistrements correspondant à la plage passée.

Si aucun enregistrement ne correspond à la plage passée, une exception `IndexError` est levée. Si le query set actuel a déjà été évalué (les enregistrements ont été récupérés de la base de données), un tableau d'enregistrements sera retourné. Sinon, un autre query set tronqué sera retourné :

```crystal
qset_1 = Article.all
qset_1.each { }
qset_1[2..6] # retourne un tableau d'enregistrements Article

qset_2 = Article.all
qset_2[2..6] # retourne un query set "tronqué"
```

### `[]?(range)`

Retourne les enregistrements correspondant à la plage passée.

`nil` est retourné si aucun enregistrement ne correspond à la plage passée. Si le query set actuel a déjà été évalué (les enregistrements ont été récupérés de la base de données), un tableau d'enregistrements sera retourné. Sinon, un autre query set tronqué sera retourné :

```crystal
qset_1 = Article.all
qset_1.each { }
qset_1[2..6]? # retourne un tableau d'enregistrements Article

qset_2 = Article.all
qset_2[2..6]? # retourne un query set "tronqué"
```

### `&` (AND)

Combine le query set actuel avec un autre en utilisant l'opérateur **AND**.

Cette méthode retourne un nouveau query set qui est le résultat de la combinaison du query set actuel avec un autre en utilisant l'opérateur SQL AND.

Par exemple :

```crystal
query_set_1 = Post.all.filter(title: "Test")
query_set_2 = Post.all.filter(is_published: true)

combined_query_set = query_set_1 & query_set_2
```

### `|` (OR)

Combine le query set actuel avec un autre en utilisant l'opérateur **OR**.

Cette méthode retourne un nouveau query set qui est le résultat de la combinaison du query set actuel avec un autre en utilisant l'opérateur SQL OR.

Par exemple :

```crystal
query_set_1 = Post.all.filter(title: "Test")
query_set_2 = Post.all.filter(is_published: true)

combined_query_set = query_set_1 | query_set_2
```

### `^` (XOR)

Combine le query set actuel avec un autre en utilisant l'opérateur **XOR**.

Cette méthode retourne un nouveau query set qui est le résultat de la combinaison du query set actuel avec un autre en utilisant l'opérateur SQL XOR.

Par exemple :

```crystal
query_set_1 = Post.all.filter(title: "Test")
query_set_2 = Post.all.filter(is_published: true)

combined_query_set = query_set_1 ^ query_set_2
```

:::info
Le XOR est supporté nativement sur MariaDB et MySQL uniquement. Les autres backends de base de données (PostgreSQL et SQLite) utiliseront des instructions `case ... when` afin d'effectuer les opérations XOR au niveau SQL.
:::

### `all`

Permet de récupérer tous les enregistrements d'un modèle spécifique. `#all` peut être utilisé comme méthode de classe depuis n'importe quelle classe de modèle, ou comme méthode d'instance depuis n'importe quel objet query set. Dans ce dernier cas, appeler `#all` retourne une copie du query set actuel.

Par exemple :

```crystal
qset = Article.all # retourne un query set correspondant à "tous" les enregistrements du modèle Article
qset2 = qset.all   # retourne une copie du query set initial
```

### `annotate`

Retourne un nouveau query set qui inclura les annotations spécifiées.

Cette méthode retourne un nouveau query set avec les annotations spécifiées. Les annotations sont spécifiées en utilisant un bloc où chaque annotation doit être encapsulée avec la méthode `#annotate`. Par exemple :

```crystal
query_set = Book.all.annotate { count(:authors) }
other_query_set = Book.all.annotate do
  count(:authors, alias_name: :author_count)
  sum(:pages, alias_name: :total_pages)
end
```

Chacune des annotations spécifiées est ensuite disponible pour une utilisation ultérieure dans le query set (afin de filtrer ou ordonner les enregistrements). Les annotations sont également disponibles dans les enregistrements de modèle récupérés via la méthode [`#annotations`](https://martenframework.com/docs/api/dev/Marten/DB/Model.html#annotations%3AHash(String%2CBool|File|Float32|Float64|Int32|Int64|JSON%3A%3AAny|JSON%3A%3ASerializable|Marten%3A%3ADB%3A%3AField%3A%3AFile%3A%3AFile|Marten%3A%3AHTTP%3A%3AUploadedFile|String|Symbol|Time|Time%3A%3ASpan|UUID|Nil)-instance-method), qui retourne un hash contenant les annotations comme clés et leurs valeurs comme valeurs.

Voici les types d'annotation supportés :

| Méthode d'agrégation | Description |
|---------------------|-------------|
| `count` | Compte le nombre d'enregistrements |
| `sum` | Retourne la somme des valeurs d'un field donné |
| `average` | Retourne la moyenne des valeurs d'un field donné |
| `minimum` | Retourne la valeur minimale d'un field donné |
| `maximum` | Retourne la valeur maximale d'un field donné |

Veuillez vous référer à la section [Annoter les query sets avec des données agrégées](../queries.md#annoter-les-query-sets-avec-des-données-agrégées) pour en savoir plus sur l'utilisation des annotations.

### `distinct`

Retourne un nouveau query set qui utilisera `SELECT DISTINCT` ou `SELECT DISTINCT ON` dans sa requête SQL.

Si vous utilisez cette méthode sans arguments, une instruction `SELECT DISTINCT` sera utilisée au niveau de la base de données. Si vous passez des noms de fields comme arguments, une instruction `SELECT DISTINCT ON` sera utilisée pour éliminer les lignes dupliquées en fonction des fields spécifiés :

```crystal
query_set_1 = Post.all.distinct
query_set_2 = Post.all.distinct(:title)
```

Il est à noter qu'il est également possible de suivre les associations de modèles directement liés en utilisant la [notation double underscores](../queries.md#filtrer-les-relations) (`__`). Par exemple, la requête suivante sélectionnera des enregistrements distincts basés sur un attribut "author" joint :

```
query_set = Post.all.distinct(:author__name)
```

Enfin, il est à noter que `#distinct` ne peut pas être utilisé sur des [query sets tronqués](#range).

### `exclude`

Retourne un query set dont les enregistrements ne correspondent pas à l'ensemble de filtres donné.

Les filtres passés à cette méthode peuvent être spécifiés en utilisant le [format de prédicat standard](../queries.md#capacités-de-requêtage-basiques). Si plusieurs filtres sont spécifiés, ils seront joints en utilisant un opérateur **AND** au niveau SQL :

```crystal
query_set = Post.all
query_set.exclude(title: "Test")
query_set.exclude(title__startswith: "A")
```

Des filtres complexes peuvent également être utilisés dans le cadre de cette méthode en utilisant les [expressions `q`](../queries.md#filtres-complexes-avec-les-expressions-q) :

```crystal
query_set = Post.all
query_set.exclude { (q(name: "Foo") | q(name: "Bar")) & q(is_published: True) }
```

### `filter`

Retourne un query set correspondant à un ensemble spécifique de filtres.

Les filtres passés à cette méthode peuvent être spécifiés en utilisant le [format de prédicat standard](../queries.md#capacités-de-requêtage-basiques). Si plusieurs filtres sont spécifiés, ils seront joints en utilisant un opérateur **AND** au niveau SQL :

```crystal
query_set = Post.all
query_set.filter(title: "Test")
query_set.filter(title__startswith: "A")
```

Des filtres complexes peuvent également être utilisés dans le cadre de cette méthode en utilisant les [expressions `q`](../queries.md#filtres-complexes-avec-les-expressions-q) :

```crystal
query_set = Post.all
query_set.filter { (q(name: "Foo") | q(name: "Bar")) & q(is_published: True) }
```

### `join`

Retourne un query set dont les `relations` spécifiées sont "suivies" et jointes à chaque résultat (voir [Requêtes](../queries.md#filtrer-les-relations) pour une introduction sur cette fonctionnalité).

Avec `#join`, les relations spécifiées seront suivies et chaque enregistrement retourné par le query set aura les objets liés correspondants déjà sélectionnés et remplis. L'utilisation de `#join` peut entraîner des améliorations de performances puisqu'elle peut aider à réduire le nombre de requêtes SQL, comme illustré par l'exemple suivant :

```crystal
query_set = Post.all

p1 = query_set.get(id: 1)
puts p1.author # accède à la base de données pour récupérer l'"author" lié

p2 = query_set.join(:author).get(id: 1)
puts p2.author # n'accède pas à la base de données puisque l'"author" lié a déjà été sélectionné
```

Il est à noter qu'il est également possible de suivre les clés étrangères de modèles directement liés en utilisant la notation double underscores (`__`). Par exemple, la requête suivante sélectionnera l'"author" joint et son "profile" associé :

```crystal
query_set = Post.all
query_set.join(:author__profile)
```

:::info
La méthode `#join` supporte également le ciblage de la relation inverse d'un field [`one_to_one`](./fields.md#one_to_one) (une telle relation inverse peut être définie via l'utilisation de l'option de field [`related`](./fields.md#related-2)). De cette manière, vous pouvez traverser un field [`one_to_one`](./fields.md#one_to_one) pour revenir à l'enregistrement de modèle sur lequel le field est spécifié.
:::

### `limit`

Retourne un query set qui limitera le nombre d'enregistrements retournés.

Cette méthode permet de spécifier le nombre maximum d'enregistrements à retourner. Par exemple :

```crystal
query_set = Post.all.limit(10)
```

Dans l'exemple ci-dessus, seuls les 10 premiers enregistrements seront retournés.

### `none`

Retourne un query set qui retournera toujours un tableau vide d'enregistrements, sans interroger la base de données.

Une fois cette méthode utilisée, tout appel de méthode ultérieur (tel que des filtres supplémentaires) continuera à retourner un tableau vide d'enregistrements :

```crystal
query_set = Post.all
query_set.none.exists? # => false
```

### `offset`

Retourne un query set qui décalera les enregistrements retournés.

Cette méthode permet de spécifier le point de départ pour les enregistrements à retourner. Par exemple :

```crystal
query_set = Post.all.offset(10)
```

Dans l'exemple ci-dessus, les enregistrements seront retournés à partir du 10e enregistrement.

### `order`

Permet de spécifier l'ordre dans lequel les enregistrements doivent être retournés lors de l'évaluation du query set.

Plusieurs fields peuvent être spécifiés afin de définir l'ordre final. Par exemple :

```crystal
query_set = Post.all
query_set.order("-published_at", "title")
```

Dans l'exemple ci-dessus, les enregistrements seraient ordonnés par date de publication décroissante (à cause du préfixe `-`), puis par titre (croissant).

### `prefetch`

Retourne un query set qui pré-chargera automatiquement en un seul lot les enregistrements pour les relations spécifiées (voir [Requêtes](../queries.md#pré-charger-les-relations) pour une introduction sur cette fonctionnalité).

Avec `#prefetch`, les enregistrements correspondant aux relations spécifiées seront pré-chargés en lots uniques et chaque enregistrement retourné par le query set aura les objets liés correspondants déjà sélectionnés et remplis. L'utilisation de `#prefetch` peut entraîner des améliorations de performances puisqu'elle peut aider à réduire le nombre de requêtes SQL, comme illustré par l'exemple suivant :

```crystal
posts_1 = Post.all.to_a
# accède à la base de données pour récupérer les "tags" liés (relation many-to-many)
puts posts_1[0].tags.to_a

posts_2 = Post.all.prefetch(:tags).to_a
# n'accède pas à la base de données puisque la relation "tags" a déjà été pré-chargée
puts posts_2[0].tags
```

Il est à noter qu'il est également possible de suivre les relations et relations inverses en utilisant la notation double underscores (`__`). Par exemple, la requête suivante pré-chargera la relation "author" puis la relation "favorite tags" des enregistrements author :

```crystal
query_set = Post.all
query_set.prefetch(:author__favorite_tags)
```

Dans certaines situations, il peut être nécessaire d'utiliser un query set personnalisé pour les enregistrements pré-chargés. Ceci est possible en utilisant une variante de la méthode `#prefetch` dans laquelle un seul nom de relation et le query set associé (argument `query_set`) sont fournis :

```crystal
# Interroger toutes les listes et ordonner les éléments de liste par position
query_set = List.prefetch(:items, query_set: Item.order(:position))
```

Enfin, il est intéressant de mentionner que plusieurs relations peuvent être spécifiées à `#prefetch`. Par exemple :

```crystal
Author.all.prefetch(:books__genres, :publisher)
```

:::tip
La méthode `#prefetch` peut également être appelée directement sur les classes de modèle :

```crystal
Author.prefetch(:books__genres, :publisher)
```
:::

### `raw`

Retourne un query set brut pour la requête SQL passée et les paramètres optionnels.

Cette méthode retourne un objet [`Marten::DB::Query::RawSet`](https://martenframework.com/docs/api/dev/Marten/DB/Query/RawSet.html), qui permet d'itérer sur les enregistrements de modèle correspondant à la requête SQL passée. Par exemple :

```crystal
Article.all.raw("SELECT * FROM articles")
```

Des paramètres supplémentaires peuvent également être spécifiés si la requête doit être paramétrée. Ceux-ci peuvent être spécifiés comme arguments positionnels ou nommés. Par exemple :

```crystal
# En utilisant des paramètres positionnels splat :
Article.all.raw("SELECT * FROM articles WHERE title = ? and created_at > ?", "Hello World!", "2022-10-30")

# En utilisant un tableau de paramètres positionnels :
Article.all.raw("SELECT * FROM articles WHERE title = ? and created_at > ?", ["Hello World!", "2022-10-30"])

# En utilisant des paramètres nommés double splat :
Article.all.raw(
  "SELECT * FROM articles WHERE title = :title and created_at > :created_at",
  title: "Hello World!",
  created_at: "2022-10-30"
)

# En utilisant un hash de paramètres nommés :
Article.all.raw(
  "SELECT * FROM articles WHERE title = :title and created_at > :created_at",
  {
    title:      "Hello World!",
    created_at: "2022-10-30",
  }
)
```

Veuillez vous référer à [SQL brut](../raw-sql.md) pour en savoir plus sur l'exécution de requêtes SQL brutes.

### `reverse`

Permet d'inverser l'ordre du query set actuel.

Par exemple, ceci retournerait tous les enregistrements `Article` ordonnés par titre décroissant :

```crystal
query_set = Article.all.order(:title)
query_set.reverse
```

### `using`

Permet de définir quel alias de base de données doit être utilisé lors de l'évaluation du query set.

Par exemple :

```crystal
query_set_1 = Article.all.filter(published: true)               # les enregistrements sont récupérés de la base de données par défaut
query_set_2 = Article.all.filter(published: true).using(:other) # les enregistrements sont récupérés de la base de données "other"
```

La valeur passée à `#using` doit être un alias de base de données valide qui a été utilisé pour configurer une base de données supplémentaire dans les [paramètres de base de données](../../development/reference/settings.md#database-settings).

## Méthodes qui ne retournent pas de nouveaux query sets

Les query sets fournissent également un ensemble de méthodes qui entraîneront généralement l'exécution de requêtes SQL spécifiques afin de retourner des valeurs qui ne correspondent pas à de nouveaux query sets.

### `average`

Permet de calculer la moyenne d'un field numérique à travers les enregistrements d'un modèle spécifique. La méthode `#average` peut être utilisée comme méthode de classe depuis n'importe quelle classe de modèle, ou comme méthode d'instance depuis n'importe quel objet query set. Lorsqu'elle est utilisée sur un query set, elle calcule la moyenne du field spécifié pour les enregistrements de ce query set.

Par exemple :

```crystal
average_price = Product.average(:price) # Calcule le prix moyen de tous les produits

# Calcule la note moyenne pour une catégorie spécifique de produits
electronic_products = Product.filter(category: "Electronics")
average_rating = electronic_products.average(:rating)
```

### `build`

Initialise une nouvelle instance de modèle.

Cette méthode permet d'initialiser une nouvelle instance de modèle en utilisant les arguments définis dans le double splat passé.

```crystal
new_post = Post.all.build(title: "My blog post")
```

Cette méthode peut également être appelée avec un bloc qui est exécuté pour le nouvel objet :

```crystal
new_post = Post.all.build(title: "My blog post") do |p|
  p.complex_attribute = compute_complex_attribute
end
```

### `bulk_create`

Insère en masse les instances de modèle passées dans la base de données.

Cette méthode permet d'insérer plusieurs instances de modèle dans la base de données en une seule requête. Cela peut être utile lorsqu'il s'agit de grandes quantités de données qui doivent être insérées dans la base de données. Par exemple :

```crystal
query_set = Post.all
query_set.bulk_create(
  [
    Post.new(title: "First post"),
    Post.new(title: "Second post"),
    Post.new(title: "Third post"),
  ]
)
```

Un argument optionnel `batch_size` peut être passé à cette méthode afin de spécifier le nombre d'enregistrements qui doivent être insérés en une seule requête. Par défaut, tous les enregistrements sont insérés en une seule requête (sauf pour les bases de données SQLite où la limite de variables dans une seule requête est de 999). Par exemple :

```crystal
query_set = Post.all
query_set.bulk_create(
  [
    Post.new(title: "First post"),
    Post.new(title: "Second post"),
    Post.new(title: "Third post"),
  ],
  batch_size: 2
)
```

:::tip
La méthode `#bulk_create` peut également être appelée directement sur les classes de modèle :

```crystal
Post.bulk_create(
  [
    Post.new(title: "First post"),
    Post.new(title: "Second post"),
    Post.new(title: "Third post"),
  ]
)
```
:::

Il est intéressant de mentionner que cette méthode a quelques mises en garde :

* Les enregistrements spécifiés sont supposés être valides et aucun [callback](../callbacks.md) ne sera appelé sur eux.
* L'insertion en masse d'enregistrements utilisant l'héritage multi-table n'est pas supportée.
* Si le field de clé primaire du modèle est auto-incrémenté au niveau de la base de données, les nouvelles clés primaires insérées ne seront assignées aux enregistrements que sur certaines bases de données qui supportent la récupération des lignes insérées en masse (à savoir MariaDB, PostgreSQL et SQLite).

### `count`

Retourne le nombre d'enregistrements ciblés par le query set actuel.

Par exemple :

```crystal
Article.all.count                              # retourne le nombre d'enregistrements article
Article.all.count(:subtitle)                   # retourne le nombre d'articles où le sous-titre n'est pas null
Article.filter(title__startswith: "Top").count # retourne le nombre d'articles dont le titre commence par "Top"
```

Notez que cette méthode déclenchera une requête SQL `SELECT COUNT` si le query set n'a pas encore été évalué : dans ce cas, aucun enregistrement de modèle ne sera instancié puisque le comptage sera déterminé au niveau de la base de données. Si le query set a déjà été évalué, le tableau sous-jacent d'enregistrements sera utilisé pour retourner le comptage au lieu d'exécuter une requête SQL dédiée.

### `create`

Crée une instance de modèle et la sauvegarde dans la base de données si elle est valide.

La nouvelle instance de modèle est initialisée en utilisant les attributs définis dans le double splat passé. Qu'elle soit valide ou non (et donc persistée dans la base de données ou non), l'instance de modèle initialisée est retournée par cette méthode :

```crystal
query_set = Post.all
query_set.create(title: "My blog post")
```

Cette méthode peut également être appelée avec un bloc qui est exécuté pour le nouvel objet. Ce bloc peut être utilisé pour initialiser directement l'objet avant qu'il ne soit persisté dans la base de données :

```crystal
query_set = Post.all
query_set.create(title: "My blog post") do |post|
  post.complex_attribute = compute_complex_attribute
end
```

### `create!`

Crée une instance de modèle et la sauvegarde dans la base de données si elle est valide.

L'instance de modèle est initialisée en utilisant les attributs définis dans le double splat passé. Si l'instance de modèle est valide, elle est persistée dans la base de données ; sinon une exception `Marten::DB::Errors::InvalidRecord` est levée.

```crystal
query_set = Post.all
query_set.create!(title: "My blog post")
```

Cette méthode peut également être appelée avec un bloc qui est exécuté pour le nouvel objet. Ce bloc peut être utilisé pour initialiser directement l'objet avant qu'il ne soit persisté dans la base de données :

```crystal
query_set = Post.all
query_set.create!(title: "My blog post") do |post|
  post.complex_attribute = compute_complex_attribute
end
```

### `delete`

Supprime les enregistrements correspondant au query set actuel et retourne le nombre d'enregistrements supprimés.

Par défaut, les objets liés seront supprimés en suivant la [stratégie de suppression](./fields.md#on_delete) définie dans chaque field de clé étrangère le cas échéant, sauf si l'argument `raw` est défini à `true`. Lorsque l'argument `raw` est défini à `true`, une instruction SQL de suppression brute sera utilisée pour supprimer tous les enregistrements correspondant aux filtres actuellement appliqués. Notez que l'utilisation de cette option pourrait causer des erreurs si la base de données sous-jacente applique l'intégrité référentielle.

```crystal
Article.all.delete                              # supprime tous les enregistrements Article
Article.filter(title__startswith: "Top").delete # supprime tous les articles dont le titre commence par "Top"
```

### `each`

Permet d'itérer sur les enregistrements ciblés par le query set actuel.

Cette méthode peut être utilisée pour définir un bloc qui itère sur les enregistrements ciblés par un query set :

```crystal
Post.all.each do |post|
  # Faire quelque chose avec le post
end
```

### `exists?`

Retourne `true` si le query set actuel correspond à au moins un enregistrement, ou `false` sinon.

```crystal
Article.filter(title__startswith: "Top").exists?
```

Notez que cette méthode déclenchera une requête SQL très simple `SELECT EXISTS` si le query set n'a pas encore été évalué : dans ce cas, aucun enregistrement de modèle ne sera instancié puisque l'existence des enregistrements sera déterminée au niveau de la base de données. Si le query set a déjà été évalué, le tableau sous-jacent d'enregistrements sera utilisé pour déterminer si des enregistrements existent ou non.

Il est à noter que `#exists?` peut également prendre des filtres supplémentaires ou des expressions `q()` comme arguments. Cela permet d'appliquer des filtres supplémentaires au query set considéré afin d'effectuer la vérification. Par exemple :

```crystal
query_set = Tag.filter(name__startswith: "c")
query_set.exists?(is_active: true)
query_set.exists? { q(is_active: true) }
```

### `first`

Retourne le premier enregistrement correspondant au query set, ou `nil` si aucun enregistrement n'est trouvé.

```crystal
Article.first
Article.filter(title__startswith: "Top").first
```

### `first!`

Retourne le premier enregistrement correspondant au query set, ou lève une exception `NilAssertionError` si aucun enregistrement n'est trouvé.

```crystal
Article.first!
Article.filter(title__startswith: "Top").first!
```

### `get`

Retourne l'instance de modèle correspondant à l'ensemble de filtres donné.

Les fields de modèle tels que les clés primaires ou les fields avec une contrainte d'unicité doivent être utilisés ici afin de récupérer un enregistrement spécifique :

```crystal
query_set = Post.all
post_1 = query_set.get(id: 123)
post_2 = query_set.get(id: 456, is_published: false)
```

Des filtres complexes peuvent également être utilisés dans le cadre de cette méthode en utilisant les [expressions `q`](../queries.md#filtres-complexes-avec-les-expressions-q) :

```crystal
query_set = Post.all
post_1 = query_set.get { q(id: 123) }
post_2 = query_set.get { q(id: 456, is_published: false) }
```

Si l'ensemble de filtres spécifié ne correspond à aucun enregistrement, la valeur retournée sera `nil`. De plus, afin d'assurer la cohérence des données, cette méthode lèvera une exception `Marten::DB::Errors::MultipleRecordsFound` si plusieurs enregistrements correspondent à l'ensemble de filtres spécifié.

Notez que `#get` peut être utilisé pour récupérer un enregistrement avec un prédicat SQL brut. Par exemple :

```crystal
Author.get("id=?", 42)
Author.get("id=:id", id: 42)
```

### `get!`

Retourne l'instance de modèle correspondant à l'ensemble de filtres donné.

Les fields de modèle tels que les clés primaires ou les fields avec une contrainte d'unicité doivent être utilisés ici afin de récupérer un enregistrement spécifique :

```crystal
query_set = Post.all
post_1 = query_set.get!(id: 123)
post_2 = query_set.get!(id: 456, is_published: false)
```

Des filtres complexes peuvent également être utilisés dans le cadre de cette méthode en utilisant les [expressions `q`](../queries.md#filtres-complexes-avec-les-expressions-q) :

```crystal
query_set = Post.all
post_1 = query_set.get! { q(id: 123) }
post_2 = query_set.get! { q(id: 456, is_published: false) }
```

Si l'ensemble de filtres spécifié ne correspond à aucun enregistrement, une exception `Marten::DB::Errors::RecordNotFound` sera levée. De plus, afin d'assurer la cohérence des données, cette méthode lèvera une exception `Marten::DB::Errors::MultipleRecordsFound` si plusieurs enregistrements correspondent à l'ensemble de filtres spécifié.

Notez que `#get` peut être utilisé pour récupérer un enregistrement avec un prédicat SQL brut. Par exemple :

```crystal
Author.get!("id=?", 42)
Author.get!("id=:id", id: 42)
```

### `get_or_create`

Retourne l'enregistrement de modèle correspondant à l'ensemble de filtres donné ou en crée un nouveau si aucun n'est trouvé.

Les fields de modèle qui identifient de manière unique un enregistrement doivent être utilisés ici. Par exemple :

```crystal
tag = Tag.all.get_or_create(label: "crystal")
```

Lorsqu'aucun enregistrement n'est trouvé, la nouvelle instance de modèle est initialisée en utilisant les attributs définis dans les arguments double splat. Qu'elle soit valide ou non (et donc persistée dans la base de données ou non), l'instance de modèle initialisée est retournée par cette méthode.

Cette méthode peut également être appelée avec un bloc qui est exécuté pour les nouveaux objets. Ce bloc peut être utilisé pour initialiser directement les nouveaux enregistrements avant qu'ils ne soient persistés dans la base de données :

```crystal
tag = Tag.all.get_or_create(label: "crystal") do |new_tag|
  new_tag.active = false
end
```

Afin d'assurer la cohérence des données, cette méthode lèvera une exception `Marten::DB::Errors::MultipleRecordsFound` si plusieurs enregistrements correspondent à l'ensemble de filtres spécifié.

### `get_or_create!`

Retourne l'enregistrement de modèle correspondant à l'ensemble de filtres donné ou en crée un nouveau si aucun n'est trouvé.

Les fields de modèle qui identifient de manière unique un enregistrement doivent être utilisés ici. Par exemple :

```crystall
tag = Tag.all.get_or_create!(label: "crystal")
```

Lorsqu'aucun enregistrement n'est trouvé, la nouvelle instance de modèle est initialisée en utilisant les attributs définis dans les arguments double splat. Si la nouvelle instance de modèle est valide, elle est persistée dans la base de données ; sinon une exception `Marten::DB::Errors::InvalidRecord` est levée.

Cette méthode peut également être appelée avec un bloc qui est exécuté pour les nouveaux objets. Ce bloc peut être utilisé pour initialiser directement les nouveaux enregistrements avant qu'ils ne soient persistés dans la base de données :

```crystal
tag = Tag.all.get_or_create!(label: "crystal") do |new_tag|
  new_tag.active = false
end
```

Afin d'assurer la cohérence des données, cette méthode lèvera une exception `Marten::DB::Errors::MultipleRecordsFound` si plusieurs enregistrements correspondent à l'ensemble de filtres spécifié.

### `includes?`

Retourne `true` si un enregistrement de modèle spécifique est inclus dans le query set.

Cette méthode peut être utilisée pour vérifier l'appartenance d'un enregistrement de modèle spécifique à un query set donné. Si le query set n'est pas encore évalué, une requête SQL dédiée sera exécutée afin d'effectuer cette vérification (sans charger la liste entière des enregistrements ciblés par le query set). Ceci est particulièrement intéressant pour les grands query sets où nous ne voulons pas que tous les enregistrements soient chargés en mémoire pour effectuer une telle vérification.

```crystal
tag = Tag.get!(name: "crystal")
query_set = Tag.filter(name__startswith: "c")
query_set.includes?(tag) # => true
```

### `last`

Retourne le dernier enregistrement correspondant au query set, ou `nil` si aucun enregistrement n'est trouvé.

```crystal
Article.last
Article.filter(title__startswith: "Top").last
```

### `last!`

Retourne le dernier enregistrement correspondant au query set, ou lève une exception `NilAssertionError` si aucun enregistrement n'est trouvé.

```crystal
Article.last!
Article.filter(title__startswith: "Top").last!
```

### `maximum`

Récupère la valeur maximale d'un field spécifique à travers tous les enregistrements d'un query set.

```crystal
Product.all.maximum(:price)  # Récupère le prix le plus élevé parmi tous les produits
# => 125.25
```

### `minimum`

Récupère la valeur minimale d'un field spécifique à travers tous les enregistrements d'un query set.

```crystal
Product.all.minimum(:price)  # Récupère le prix le plus bas parmi tous les produits
# => 15.99
```

### `paginator`

Retourne un paginateur qui peut être utilisé pour paginer le query set actuel.

Cette méthode retourne un objet [`Marten::DB::Query::Paginator`](https://martenframework.com/docs/api/dev/Marten/DB/Query/Paginator.html), qui peut ensuite être utilisé pour récupérer des pages spécifiques. Une taille de page doit être spécifiée lors de l'appel de cette méthode.

Par exemple :

```crystal
query_set = Article.all
paginator = query_set.paginator(10)
paginator.page(1) # Retourne la première page d'enregistrements
```

### `pick`

Retourne les valeurs de colonnes spécifiques pour un seul enregistrement sans le charger réellement.

Cette méthode permet de sélectionner facilement des valeurs de colonnes spécifiques pour un seul enregistrement du query set actuel. Cela permet de récupérer des valeurs de colonnes spécifiques sans charger l'enregistrement entier, et en tant que tel c'est particulièrement utile pour les query sets qui ont été restreints pour correspondre à un seul enregistrement. La méthode retourne un tableau contenant les valeurs de colonnes demandées, ou `nil` si aucun enregistrement ne correspond au query set actuel.

Par exemple :

```crystal
Post.filter(pk: 1).pick("title", "published")
# => ["First article", true]
```

### `pick!`

Retourne les valeurs de colonnes spécifiques pour un seul enregistrement sans le charger réellement.

Cette méthode permet de sélectionner facilement des valeurs de colonnes spécifiques pour un seul enregistrement du query set actuel. Cela permet de récupérer des valeurs de colonnes spécifiques sans charger l'enregistrement entier, et en tant que tel c'est particulièrement utile pour les query sets qui ont été restreints pour correspondre à un seul enregistrement. La méthode retourne un tableau contenant les valeurs de colonnes demandées, ou lève une `NilAssertionError` si aucun enregistrement ne correspond au query set actuel.

Par exemple :

```crystal
Post.filter(pk: 1).pick!("title", "published")
# => ["First article", true]
```

### `pks`

Retourne les valeurs de clé primaire des enregistrements de modèle considérés ciblés par le query set actuel.

Cette méthode retourne un tableau contenant les valeurs de clé primaire des enregistrements de modèle ciblés par le query set actuel.

Par exemple :

```crystal
Post.all.pks # => [1, 2, 3]
```

### `pluck`

Retourne les valeurs de colonnes spécifiques sans charger les objets enregistrement entiers.

Cette méthode permet de sélectionner facilement des valeurs de colonnes spécifiques du query set actuel. Cela permet de récupérer des valeurs de colonnes spécifiques sans charger les enregistrements entiers. La méthode retourne un tableau contenant un tableau avec les valeurs de colonnes réelles pour chaque enregistrement ciblé par le query set.

Par exemple :

```crystal
Post.all.pluck("title", "published")
# => [["First article", true], ["Upcoming article", false]]
```

### `size`

Alias pour [`#count`](#count) : retourne le nombre d'enregistrements ciblés par le query set.

### `sum`

Calcule la somme totale des valeurs d'un field spécifique à travers tous les enregistrements d'un query set.

Exemple :

```crystal
Order.all.sum(:amount)  # Calcule le montant total de toutes les commandes
# => 7
```

### `to_s`

Retourne une représentation en chaîne du query set considéré.

### `to_sql`

Retourne la représentation SQL du query set considéré.

Par exemple :

```crystal
Tag.filter(name__startswith: "r").to_sql
# => "SELECT app_tag.id, app_tag.name, app_tag.is_active FROM \"app_tag\" WHERE app_tag.name LIKE $1"
```

:::note
Le SQL produit variera en fonction du backend de base de données utilisé.
:::

### `update_or_create`

Met à jour l'enregistrement de modèle correspondant à l'ensemble de filtres donné, ou en crée un nouveau si aucun n'est trouvé.

Les fields de modèle qui identifient de manière unique un enregistrement doivent être utilisés ici. Cette méthode tente d'abord de récupérer un enregistrement correspondant aux filtres spécifiés. S'il existe, l'enregistrement est mis à jour en utilisant les attributs fournis dans l'argument `updates` requis :

```crystal
user = User.all.update_or_create(
  updates: {first_name: "Jane"},
  username: "abc"
)
```

Si aucun enregistrement correspondant n'est trouvé, un nouveau est créé en utilisant les attributs définis dans `updates`. Si des attributs supplémentaires ne doivent être utilisés que lors de la création de nouveaux enregistrements, un argument `defaults` peut être fourni (ces attributs seront alors utilisés à la place de `updates` lors de la création de l'enregistrement) :

```crystal
user = User.all.update_or_create(
  updates: {first_name: "Jane"},
  defaults: {first_name: "Jane", is_admin: true},
  username: "abc"
)
```

Afin d'assurer la cohérence des données, cette méthode lèvera une exception `Marten::DB::Errors::MultipleRecordsFound` si plusieurs enregistrements correspondent à l'ensemble de filtres spécifié.

### `update_or_create!`

Met à jour l'enregistrement de modèle correspondant à l'ensemble de filtres donné, ou en crée un nouveau si aucun n'est trouvé.

Les fields de modèle qui identifient de manière unique un enregistrement doivent être utilisés ici. Cette méthode tente d'abord de récupérer un enregistrement correspondant aux filtres spécifiés. S'il existe, l'enregistrement est mis à jour en utilisant les attributs fournis dans l'argument `updates` requis :

```crystal
user = User.all.update_or_create!(
  updates: {first_name: "Jane"},
  username: "abc"
)
```

Si aucun enregistrement correspondant n'est trouvé, un nouveau est créé en utilisant les attributs définis dans `updates`. Si des attributs supplémentaires ne doivent être utilisés que lors de la création de nouveaux enregistrements, un argument `defaults` peut être fourni (ces attributs seront alors utilisés à la place de `updates` lors de la création de l'enregistrement) :

```crystal
user = User.all.update_or_create!(
  updates: {first_name: "Jane"},
  defaults: {first_name: "Jane", is_admin: true},
  username: "abc"
)
```

Afin d'assurer la cohérence des données, cette méthode lèvera une exception `Marten::DB::Errors::MultipleRecordsFound` si plusieurs enregistrements correspondent à l'ensemble de filtres spécifié.

Lève une exception `Marten::DB::Errors::InvalidRecord` si l'enregistrement mis à jour ou créé est invalide.
```

### `update` {#update}

Met à jour tous les enregistrements correspondant au query set actuel avec les valeurs passées.

Cette méthode permet de mettre à jour tous les enregistrements correspondant au query set actuel avec les valeurs définies dans le double splat passé. Elle retourne le nombre d'enregistrements qui ont été mis à jour :

```crystal
query_set = Post.all
query_set.update(title: "Updated") # => 42
```

Il est à noter que cette méthode résulte en une instruction SQL `UPDATE` régulière. En tant que tel, les enregistrements mis à jour via l'utilisation de cette méthode ne seront pas instanciés ni validés, et aucun callback ne sera exécuté pour eux non plus.

## Prédicats de field

Ci-dessous sont listés tous les [prédicats de field](../queries.md#prédicats-de-field) disponibles qui peuvent être utilisés lors du filtrage des query sets.

### `contains`

Permet de filtrer les enregistrements en fonction des valeurs de field qui contiennent une sous-chaîne spécifique. Notez que c'est un prédicat **sensible à la casse**.

```crystal
Article.all.filter(title__contains: "tech")
```

### `endswith`

Permet de filtrer les enregistrements en fonction des valeurs de field qui se terminent par une sous-chaîne spécifique. Notez que c'est un prédicat **sensible à la casse**.

```crystal
Article.all.filter(title__endswith: "travel")
```

### `exact`

Permet de filtrer les enregistrements en fonction d'une valeur de field spécifique (correspondance exacte). Notez que fournir une valeur `nil` résultera en une vérification `IS NULL` au niveau SQL.

C'est le prédicat par défaut ; en tant que tel, il n'est pas nécessaire de le spécifier lors du filtrage des enregistrements. Les deux query sets suivants sont équivalents :

```crystal
Article.all.filter(published: true)
Article.all.filter(published__exact: true)
```

### `gte`

Permet de filtrer les enregistrements en fonction des valeurs de field qui sont supérieures ou égales à une valeur spécifiée.

```crystal
Article.all.filter(rating__gte: 10)
```

### `gt`

Permet de filtrer les enregistrements en fonction des valeurs de field qui sont supérieures à une valeur spécifiée.

```crystal
Article.all.filter(rating__gt: 10)
```

### `icontains`

Permet de filtrer les enregistrements en fonction des valeurs de field qui contiennent une sous-chaîne spécifique, de manière insensible à la casse.

```crystal
Article.all.filter(title__icontains: "tech")
```

### `iendswith`

Permet de filtrer les enregistrements en fonction des valeurs de field qui se terminent par une sous-chaîne spécifique, de manière insensible à la casse.

```crystal
Article.all.filter(title__iendswith: "travel")
```

### `iexact`

Permet de filtrer les enregistrements en fonction d'une valeur de field spécifique (correspondance exacte), de manière insensible à la casse.

```crystal
Article.all.filter(title__iexact: "Top blog posts")
```

### `istartswith`

Permet de filtrer les enregistrements en fonction des valeurs de field qui commencent par une sous-chaîne spécifique, de manière insensible à la casse.

```crystal
Article.all.filter(title__istartswith: "top")
```

### `in`

Permet de filtrer les enregistrements en fonction des valeurs de field qui sont contenues dans un tableau spécifique de valeurs.

```crystal
Tag.all.filter(slug__in=["foo", "bar", "xyz"])
```

Notez que ce prédicat peut également être utilisé pour filtrer les fields de relation (tels que les fields [`many_to_one`](./fields.md#many_to_one) ou [`one_to_one`](./fields.md#one_to_one)) en utilisant des tableaux d'enregistrements de modèle. Par exemple :

```crystal
authors = Author.filter(first_name: "John")
articles = Article.filter(author__in: authors)
```

### `isnull`

Permet de filtrer les enregistrements en fonction des valeurs de field qui doivent être null ou non null.

```crystal
Article.all.filter(subtitle__isnull: true)
Article.all.filter(subtitle__isnull: false)
```

### `lte`

Permet de filtrer les enregistrements en fonction des valeurs de field qui sont inférieures ou égales à une valeur spécifiée.

```crystal
Article.all.filter(rating__lte: 10)
```

### `lt`

Permet de filtrer les enregistrements en fonction des valeurs de field qui sont inférieures à une valeur spécifiée.

```crystal
Article.all.filter(rating__lt: 10)
```

### `startswith`

Permet de filtrer les enregistrements en fonction des valeurs de field qui commencent par une sous-chaîne spécifique. Notez que c'est un prédicat **sensible à la casse**.

```crystal
Article.all.filter(title__startswith: "Top")
```
