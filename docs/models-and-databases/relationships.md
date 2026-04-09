---
title: Relations
description: Apprenez à définir des relations dans les modèles.
---

Marten offre une solution puissante et intuitive pour définir les trois types les plus courants de relations de base de données (many-to-one, one-to-one et many-to-many) grâce à l'utilisation de [fields de modèle](./introduction.md#fields-de-modèle). En exploitant ces fields spéciaux, les développeurs peuvent améliorer la modélisation des données de leur application et simplifier l'accès aux données.

## Relations many-to-one

Les relations many-to-one peuvent être définies via l'utilisation de fields [`many_to_one`](./reference/fields.md#many_to_one). Ce type de field spécial nécessite l'utilisation de l'argument [`to`](./reference/fields.md#to-1), permettant de définir explicitement la classe de modèle cible associée au modèle actuel.

Par exemple, un modèle `Article` pourrait avoir un field many-to-one vers un modèle `Author`. Dans ce cas, un enregistrement `Article` n'aurait qu'un seul enregistrement `Author` associé, mais chaque enregistrement `Author` pourrait être associé à de nombreux enregistrements `Article` :

```crystal
class Author < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :full_name, :string, max_size: 128
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
  // highlight-next-line
  field :author, :many_to_one, to: Author
end
```

### Interagir avec les enregistrements liés

Comme pour tout autre [field de modèle](./introduction.md#fields-de-modèle), Marten génère automatiquement des getters et setters permettant d'interagir avec la valeur du field.

Avec l'extrait ci-dessus, il serait possible d'accéder à l'enregistrement `Author` associé à un enregistrement `Article` spécifique en utilisant les méthodes `#author` et `#author=`. Par exemple :

```crystal
# Créer deux auteurs
author_1 = Author.create!(full_name: "Foo Bar")
author_2 = Author.create!(full_name: "John Doe")

# Créer un article
article = Article.create!(title: "First article", author: author_1)
article.author!.id # => 1
article.author # => #<Author:0x101590c40 id: 1, full_name: "Foo Bar">

# Changer l'auteur de l'article
article.author = author_2
article.save!
article.author!.id # => 2
article.author # => #<Author:0x101590c41 id: 2, full_name: "John Doe">
```

:::tip
Notez que vous pouvez également accéder directement à l'ID de l'enregistrement lié sans le charger en utilisant la méthode `#<field_name>_id` (qui correspond au nom réel de la colonne utilisée pour persister la référence à la clé primaire de l'enregistrement lié dans la table du modèle).

Par exemple, en utilisant les définitions de modèle fournies précédemment, vous pourriez effectuer l'opération suivante :

```crystal
author = Author.create!(full_name: "Foo Bar")
article = Article.create!(title: "First article", author: author)
article.author_id # => 1
```
:::

### Relations inverses

Par défaut, les fields [`many_to_one`](./reference/fields.md#many_to_one) n'établissent pas de relation inverse. Cela signifie que vous ne pouvez pas directement récupérer les enregistrements qui ciblent un enregistrement lié spécifique à partir de l'enregistrement lié lui-même. Par exemple, par défaut, il n'est pas possible de récupérer tous les enregistrements `Article` associés à un enregistrement `Author` spécifique.

Pour activer cette fonctionnalité, vous devez utiliser l'argument [`related`](./reference/fields.md#related-1) lors de la définition de votre field [`many_to_one`](./reference/fields.md#many_to_one). Par exemple, nous pourrions modifier les définitions de modèle précédentes comme suit afin de définir une relation inverse `articles` et permettre aux enregistrements `Author` d'exposer leurs enregistrements `Article` liés :

```crystal
class Author < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :full_name, :string, max_size: 128
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
  // highlight-next-line
  field :author, :many_to_one, to: Author, related: :articles
end
```

Lorsque l'argument [`related`](./reference/fields.md#related-1) est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que tous les enregistrements `Article` associés à un enregistrement `Author` spécifique seront accessibles via l'utilisation de la méthode `Author#articles` :

```crystal
# Créer deux auteurs
author_1 = Author.create!(full_name: "Foo Bar")
author_2 = Author.create!(full_name: "John Doe")

# Créer des articles
article_1 = Article.create!(title: "First article", author: author_1)
article_2 = Article.create!(title: "Second article", author: author_2)
article_3 = Article.create!(title: "Third article", author: author_1)

# Lister les articles du premier auteur
author_1.articles.to_a # [#<Article:0x1036e3ee0 id: 1, title: "First article", author_id: 1>,
                       #  #<Article:0x1036e3e70 id: 3, title: "Third article", author_id: 1>]

# Créer un article associé au premier auteur
article_4 = author_1.articles.create!(title: "Fourth article")
article_4.author # => #<Author:0x101590c40 id: 1, full_name: "Foo Bar">
```

:::tip
La méthode générée pour la relation inverse retourne un [query set](./queries.md) que vous pouvez utiliser pour filtrer davantage la liste des enregistrements. Par exemple :

```crystal
author.articles.filter(title__startswith: "Top")
```
:::

### Stratégie de suppression

Lors de la définition de fields [`many_to_one`](./reference/fields.md#many_to_one), il est fortement conseillé de spécifier une stratégie de suppression pour la relation associée. Cette configuration détermine le comportement des enregistrements avec des fields many-to-one lorsque l'un des enregistrements référencés par ces fields est supprimé.

Un tel comportement peut être configuré en utilisant l'argument [`on_delete`](./reference/fields.md#on_delete) lors de la définition des fields [`many_to_one`](./reference/fields.md#many_to_one). Cet argument permet de spécifier la stratégie de suppression à adopter lorsqu'un enregistrement lié (celui qui est ciblé par le field [`many_to_one`](./reference/fields.md#many_to_one)) est supprimé. Cet argument accepte les valeurs suivantes (exprimées en tant que symboles) :

* `:do_nothing` : C'est la stratégie par défaut. Avec cette stratégie, Marten ne fera rien pour s'assurer que les enregistrements référençant l'enregistrement supprimé sont supprimés ou mis à jour. Si la base de données applique l'intégrité référentielle (ce qui sera le cas pour les fields de clé étrangère), cela signifie que supprimer un enregistrement pourrait entraîner des erreurs de base de données.
* `:cascade` : Cette stratégie peut être utilisée pour effectuer des suppressions en cascade. Lors de la suppression d'un enregistrement, Marten essaiera d'abord de détruire les autres enregistrements qui référencent l'objet supprimé.
* `:protect` : Cette stratégie permet d'empêcher explicitement la suppression d'enregistrements s'ils sont référencés par d'autres enregistrements. Cela signifie que tenter de supprimer un enregistrement "protégé" entraînera une erreur `Marten::DB::Errors::ProtectedRecord`.
* `:set_null` : Cette stratégie mettra la colonne de référence à `null` lorsque l'enregistrement lié est supprimé.

Par exemple, nous pourrions modifier notre définition de modèle précédente pour que les enregistrements `Article` soient supprimés en cascade si les enregistrements `Author` associés sont détruits :

```crystal
class Author < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :full_name, :string, max_size: 128
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
  // highlight-next-line
  field :author, :many_to_one, to: Author, related: :articles, on_delete: :cascade
end
```

Avec cette modification, si nous essayons de supprimer un enregistrement `Author`, nous devrions constater que les enregistrements `Article` associés sont également supprimés :

```crystal
# Créer deux auteurs
author_1 = Author.create!(full_name: "Foo Bar")
author_2 = Author.create!(full_name: "John Doe")

# Créer des articles
article_1 = Article.create!(title: "First article", author: author_1)
article_2 = Article.create!(title: "Second article", author: author_2)
article_3 = Article.create!(title: "Third article", author: author_1)

# Supprimer le premier auteur
author_1.delete

article_1.reload # => raises Marten::DB::Errors::RecordNotFound
```

## Relations one-to-one

Les relations one-to-one peuvent être définies via l'utilisation de fields [`one_to_one`](./reference/fields.md#one_to_one). Ce type de field spécial nécessite l'utilisation de l'argument [`to`](./reference/fields.md#to-2), permettant de définir explicitement la classe de modèle cible associée au modèle actuel.

Par exemple, un modèle `User` pourrait avoir un field one-to-one vers un modèle `Profile`. Dans ce cas, le modèle `User` ne pourrait avoir qu'un seul enregistrement `Profile` associé, et l'inverse serait également vrai (un enregistrement `Profile` ne pourrait avoir qu'un seul enregistrement `User` associé) :

```crystal
class Profile < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :full_name, :string, max_size: 128
end

class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :email, :email
  // highlight-next-line
  field :profile, :one_to_one, to: Profile
end
```

:::info
Un field one-to-one est très similaire à un field many-to-one, mais avec une contrainte d'unicité supplémentaire.
:::

### Interagir avec les enregistrements liés

Comme pour tout autre [field de modèle](./introduction.md#fields-de-modèle), Marten génère automatiquement des getters et setters permettant d'interagir avec la valeur du field.

Avec l'extrait ci-dessus, il serait possible d'accéder à l'enregistrement `Profile` associé à un enregistrement `User` spécifique en utilisant les méthodes `#profile` et `#profile=`. Par exemple :

```crystal
# Créer deux utilisateurs
user_1 = User.create!(email: "test1@example.com", profile: Profile.create!(full_name: "Foo Bar"))
user_2 = User.create!(email: "test2@example.com", profile: Profile.create!(full_name: "John Doe"))

# Accéder au profil d'un utilisateur
user_1.profile!.id # => 1
user_1.profile # => #<Profile:0x101590c40 id: 1, full_name: "Foo Bar">

# Changer le profil d'un utilisateur
user_1.profile = Profile.create!(full_name: "New Profile")
user_1.save!
user_1.profile!.id # => 3
user_1.profile # => #<Profile:0x101590c41 id: 3, full_name: "New Profile">
```

:::tip
Comme pour les [relations many-to-one](#relations-many-to-one), vous pouvez également accéder directement à l'ID de l'enregistrement lié sans le charger en utilisant la méthode `#<field_name>_id` (qui correspond au nom réel de la colonne utilisée pour persister la référence à la clé primaire de l'enregistrement lié dans la table du modèle).

Par exemple, en utilisant les définitions de modèle fournies précédemment, vous pourriez effectuer l'opération suivante :

```crystal
user = User.create!(email: "test1@example.com", profile: Profile.create!(full_name: "Foo Bar"))
user.profile_id # => 1
```
:::

### Relations inverses

Par défaut, les fields [`one_to_one`](./reference/fields.md#one_to_one) n'établissent pas de relation inverse. Cela signifie que vous ne pouvez pas directement récupérer l'enregistrement qui cible un enregistrement lié spécifique à partir de l'enregistrement lié lui-même. Par exemple, par défaut, il n'est pas possible de récupérer l'enregistrement `User` associé à un enregistrement `Profile` spécifique.

Pour activer cette fonctionnalité, vous devez utiliser l'argument [`related`](./reference/fields.md#related-2) lors de la définition de votre field [`one_to_one`](./reference/fields.md#one_to_one). Par exemple, nous pourrions modifier les définitions de modèle précédentes comme suit afin de définir une relation inverse `user` et permettre aux enregistrements `Profile` d'exposer leur enregistrement `User` lié :

```crystal
class Profile < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :full_name, :string, max_size: 128
end

class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :email, :email
  // highlight-next-line
  field :profile, :one_to_one, to: Profile, related: :user
end
```

Lorsque l'argument [`related`](./reference/fields.md#related-2) est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que l'enregistrement `User` associé à un enregistrement `Profile` spécifique sera accessible via l'utilisation de la méthode `Profile#user` :

```crystal
# Créer deux profils
profile_1 = Profile.create!(full_name: "Foo Bar")
profile_2 = Profile.create!(full_name: "John Doe")

# Créer deux utilisateurs
user_1 = User.create!(email: "test1@example.com", profile: profile_1)
user_2 = User.create!(email: "test2@example.com", profile: profile_2)

# Obtenir l'utilisateur du premier profil
profile_1.user # => #<User:0x1036e3ee0 id: 1, email: "test1@example.com", profile_id: 1>
```

:::tip
Notez que dans l'exemple précédent, `#user` pourrait retourner `nil` si aucun enregistrement `User` n'est disponible pour le profil considéré. Une version nil-safe de la méthode liée est également automatiquement définie avec le nom suivant : `#<related_name>!`. Par exemple :

```crystal
# Créer deux profils
profile_1 = Profile.create!(full_name: "Foo Bar")
profile_2 = Profile.create!(full_name: "John Doe")

# Créer deux utilisateurs
user_1 = User.create!(email: "test1@example.com", profile: profile_1)
user_2 = User.create!(email: "test2@example.com", profile: profile_2)

# Supprimer le premier utilisateur
user_1.delete

# Obtenir l'utilisateur du premier profil
profile_1.user! # => raises Marten::DB::Errors::RecordNotFound
```
:::

### Stratégie de suppression

Comme pour les [relations many-to-one](#stratégie-de-suppression), la stratégie de suppression à utiliser pour les fields [`one_to_one`](./reference/fields.md#one_to_one) peut être configurée en utilisant l'argument [`on_delete`](./reference/fields.md#on_delete-1). Cet argument permet de spécifier la stratégie de suppression à adopter lorsqu'un enregistrement lié (celui qui est ciblé par le field [`many_to_one`](./reference/fields.md#many_to_one)) est supprimé. Cet argument accepte les valeurs suivantes (exprimées en tant que symboles) :

* `:do_nothing` : C'est la stratégie par défaut. Avec cette stratégie, Marten ne fera rien pour s'assurer que l'enregistrement référençant l'enregistrement supprimé est supprimé ou mis à jour. Si la base de données applique l'intégrité référentielle (ce qui sera le cas pour les fields de clé étrangère), cela signifie que supprimer un enregistrement pourrait entraîner des erreurs de base de données.
* `:cascade` : Cette stratégie peut être utilisée pour effectuer des suppressions en cascade. Lors de la suppression d'un enregistrement, Marten essaiera d'abord de détruire l'autre enregistrement qui référence l'objet supprimé.
* `:protect` : Cette stratégie permet d'empêcher explicitement la suppression de l'enregistrement s'il est référencé par un autre enregistrement. Cela signifie que tenter de supprimer un enregistrement "protégé" entraînera une erreur `Marten::DB::Errors::ProtectedRecord`.
* `:set_null` : Cette stratégie mettra la colonne de référence à `null` lorsque l'enregistrement lié est supprimé.

Par exemple, nous pourrions modifier notre définition de modèle précédente pour qu'un enregistrement `User` soit supprimé en cascade si l'enregistrement `Profile` associé est détruit :

```crystal
class Profile < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :full_name, :string, max_size: 128
end

class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :email, :email
  // highlight-next-line
  field :profile, :one_to_one, to: Profile, related: :user, on_delete: :cascade
end
```

Avec cette modification, si nous essayons de supprimer un enregistrement `Profile`, nous devrions constater que l'enregistrement `User` associé est également supprimé :

```crystal
# Créer deux profils
profile_1 = Profile.create!(full_name: "Foo Bar")
profile_2 = Profile.create!(full_name: "John Doe")

# Créer deux utilisateurs
user_1 = User.create!(email: "test1@example.com", profile: profile_1)
user_2 = User.create!(email: "test2@example.com", profile: profile_2)

# Supprimer le premier profil
profile_1.delete

user_1.reload # => raises Marten::DB::Errors::RecordNotFound
```

## Relations many-to-many

Les relations many-to-many peuvent être définies via l'utilisation de fields [`many_to_many`](./reference/fields.md#many_to_many). Ce type de field spécial nécessite l'utilisation de l'argument [`to`](./reference/fields.md#to), permettant de définir explicitement la classe de modèle cible associée au modèle actuel.

Par exemple, un modèle `Article` pourrait avoir un field many-to-many vers un modèle `Tag`. Dans ce cas, un enregistrement `Article` pourrait avoir de nombreux enregistrements `Tag` associés, et chaque enregistrement `Tag` pourrait également être associé à de nombreux enregistrements `Article` :

```crystal
class Tag < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :label, :string, max_size: 128
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
  // highlight-next-line
  field :tags, :many_to_many, to: Tag
end
```

### Interagir avec les enregistrements liés

Les fields [`many_to_many`](./reference/fields.md#many_to_many) présentent des caractéristiques uniques par rapport aux autres fields de relation. Lorsque vous utilisez des fields [`many_to_many`](./reference/fields.md#many_to_many) dans Marten, le framework génère une méthode getter `#<field_name>` qui retourne un [query set](./queries.md) spécialisé qui non seulement permet le filtrage des enregistrements ciblés, mais facilite également l'ajout et la suppression dynamiques d'enregistrements vers/depuis l'ensemble.

Avec l'extrait ci-dessus, il serait possible d'accéder aux enregistrements `Tags` associés à un enregistrement `Article` spécifique en utilisant la méthode `#tags`. Par exemple :

```crystal
# Créer trois tags
tag_1 = Tag.create!(label: "Tag 1")
tag_2 = Tag.create!(label: "Tag 2")
tag_3 = Tag.create!(label: "Tag 3")

# Créer un article
article = Article.create!(title: "My article")

# Ajouter un tag à l'article
article.tags.add(tag_1)
article.tags.to_a # => [#<Tag:0x1036e3ee0 id: 1, label: "Tag 1">]

# Ajouter deux tags à l'article
article.tags.add(tag_2, tag_3)
article.tags.to_a # => [#<Tag:0x1036e3ee0 id: 1, label: "Tag 1">,
                  #     #<Tag:0x1036e3ee1 id: 2, label: "Tag 2">,
                  #     #<Tag:0x1036e3ee2 id: 3, label: "Tag 3">]

# Filtrer les tags de l'article
article.tags.filter(label: "Tag 1").to_a # => [#<Tag:0x1036e3ee0 id: 1, label: "Tag 1">]

# Supprimer un tag des tags de l'article
article.tags.remove(tag_2)
article.tags.to_a # => [#<Tag:0x1036e3ee0 id: 1, label: "Tag 1">,
                  #     #<Tag:0x1036e3ee2 id: 3, label: "Tag 3">]

# Vider les tags de l'article
article.tags.clear
```

Notez l'utilisation des méthodes [`#add`](pathname:///api/dev/Marten/DB/Query/ManyToManySet.html#add(*objs%3AM)-instance-method) et [`#remove`](pathname:///api/dev/Marten/DB/Query/ManyToManySet.html#remove(*objs%3AM)%3ANil-instance-method), qui facilitent l'ajout ou la suppression d'objets de la collection many-to-many d'éléments associés à l'enregistrement. Ces méthodes peuvent être appelées avec un ou plusieurs enregistrements comme paramètres, ainsi qu'avec des tableaux d'enregistrements pour un ajout ou une suppression simplifiés.

### Relations inverses

Par défaut, les fields [`many_to_many`](./reference/fields.md#many_to_many) n'établissent pas de relation inverse. Cela signifie que vous ne pouvez pas directement récupérer les enregistrements qui ciblent un enregistrement lié spécifique à partir de l'enregistrement lié lui-même. Par exemple, par défaut, il n'est pas possible de récupérer tous les enregistrements `Article` associés à un enregistrement `Tag` spécifique.

Pour activer cette fonctionnalité, vous devez utiliser l'argument [`related`](./reference/fields.md#related-1) lors de la définition de votre field [`many_to_many`](./reference/fields.md#many_to_many). Par exemple, nous pourrions modifier les définitions de modèle précédentes comme suit afin de définir une relation inverse `articles` et permettre aux enregistrements `Tag` d'exposer leurs enregistrements `Article` liés :

```crystal
class Tag < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :label, :string, max_size: 128
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
  // highlight-next-line
  field :tags, :many_to_many, to: Tag, related: :articles
end
```

Lorsque l'argument [`related`](./reference/fields.md#related) est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que tous les enregistrements `Article` associés à un enregistrement `Tag` spécifique seront accessibles via l'utilisation de la méthode `Tag#articles` :

```crystal
# Créer trois tags
tag_1 = Tag.create!(label: "Tag 1")
tag_2 = Tag.create!(label: "Tag 2")
tag_3 = Tag.create!(label: "Tag 3")

# Créer deux articles
article_1 = Article.create!(title: "First article")
article_2 = Article.create!(title: "Second article")

# Ajouter des tags aux articles
article_1.tags.add(tag_1, tag_2)
article_2.tags.add(tag_2, tag_3)

# Récupérer les articles du deuxième tag
tag_2.articles.to_a # => [#<Article:0x1036e3ee0 id: 1, title: "First article">,
                    #     #<Article:0x1036e3ee2 id: 3, title: "Second article">]
tag_2.articles.filter(title: "First article").to_a # => [#<Article:0x1036e3ee0 id: 1, title: "First article">]
```

## Relations polymorphiques

Les relations polymorphiques peuvent être définies via l'utilisation de fields [`polymorphic`](./reference/fields.md#polymorphic). Ceux-ci sont utiles lorsque vous souhaitez stocker une référence à un enregistrement dont le modèle peut varier parmi un ensemble prédéfini de types possibles.

Ce type de field spécial nécessite l'utilisation de l'argument [`to`](./reference/fields.md#to-3), permettant de définir explicitement les classes de modèle qui peuvent être liées au modèle où le field `polymorphic` est défini. Par exemple, un modèle `Comment` pourrait avoir un field polymorphique vers un modèle `Article` ou un modèle `Recipe`. Dans ce cas, un enregistrement `Comment` pourrait être associé à un enregistrement `Article` ou `Recipe`, et chacun de ces modèles pourrait avoir de nombreux enregistrements `Comment` associés :

```crystal
class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
end

class Recipe < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 128
end

class Comment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  // highlight-next-line
  field :target, :polymorphic, to: [Article, Recipe]
  field :text, :text
end
```

Sous le capot, le framework garde trace à la fois de la clé primaire de l'objet cible et de son type de modèle, lui permettant de résoudre la relation dynamiquement lors de l'accès. Cela signifie que les fields polymorphiques contribuent deux colonnes à la table du modèle : `<field_name>_type` et `<field_name>_id`, où `field_name` est le nom du field polymorphique. La colonne `_type` est utilisée pour stocker le type de l'enregistrement lié (le nom de classe de l'enregistrement lié), et la colonne `_id` est utilisée pour stocker l'ID de l'enregistrement lié. Dans l'exemple précédent, le modèle `Comment` aurait deux colonnes nommées `target_type` et `target_id` à cause du field polymorphique `target`.

### Interagir avec les enregistrements liés

Marten génère automatiquement des getters et setters pour les fields polymorphiques, permettant d'interagir avec la valeur du field. En plus de cela, Marten génère également un ensemble de méthodes permettant d'accéder à l'enregistrement lié en fonction de son type ainsi que de nombreuses méthodes utilitaires.

Par exemple :

```crystal
# Créer un article
article = Article.create!(title: "This is an article")

# Créer une recette
recipe = Recipe.create!(title: "This is a recipe")

# Créer un commentaire
comment = Comment.create!(text: "This is a comment", target: article)

# Méthodes getter standard
comment.target      # => #<Article:0x1036e3ee0 id: 1, title: "This is an article">
comment.target_type # => "Article"
comment.target_id   # => 1

# Méthode getter de classe de type
comment.target_class  # => Article (ou nil si aucun enregistrement lié n'est défini)
comment.target_class! # => Article (ou lève une exception si aucun enregistrement lié n'est défini)

# Méthodes de prédicat utilitaires
comment.article_target? # => true
comment.recipe_target?  # => false

# Méthodes getter typées
comment.article_target  # => Retourne l'enregistrement Recipe associé si l'enregistrement ciblé est bien un enregistrement Recipe (ou nil sinon)
comment.article_target! # => Retourne l'enregistrement Recipe associé si l'enregistrement ciblé est bien un enregistrement Recipe (ou lève une exception sinon)

# Scopes de modèle spécifiques au type (générés en fonction des classes de type spécifiées)
Comment.with_article_target # => Retourne tous les commentaires associés aux enregistrements Article
Comment.with_recipe_target  # => Retourne tous les commentaires associés aux enregistrements Recipe
```

### Relations inverses

Par défaut, les fields [`polymorphic`](./reference/fields.md#polymorphic) n'établissent pas de relation inverse. Cela signifie que vous ne pouvez pas directement récupérer les enregistrements qui ciblent un enregistrement lié spécifique à partir de l'enregistrement lié lui-même. Par exemple, par défaut, il n'est pas possible de récupérer tous les enregistrements `Comment` associés à un enregistrement `Article` ou `Recipe` spécifique.

Pour activer cette fonctionnalité, vous devez utiliser l'argument [`related`](./reference/fields.md#related-3) lors de la définition de votre field [`polymorphic`](./reference/fields.md#polymorphic). Par exemple, nous pourrions modifier les définitions de modèle précédentes comme suit afin de définir une relation inverse `comments` et permettre aux enregistrements `Article` et `Recipe` d'exposer leurs enregistrements `Comment` liés :

```crystal
class Comment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  // highlight-next-line
  field :target, :polymorphic, to: [Article, Recipe], related: :comments
  field :text, :text
end
```

Lorsque l'argument [`related`](./reference/fields.md#related-3) est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que tous les enregistrements `Comment` associés à un enregistrement `Article` ou `Recipe` spécifique seront accessibles via l'utilisation des méthodes `Article#comments` ou `Recipe#comments` :

```crystal
# Créer un article
article = Article.create!(title: "This is an article")

# Créer une recette
recipe = Recipe.create!(title: "This is a recipe")

# Créer des commentaires
Comment.create!(text: "This is a comment", target: article)
Comment.create!(text: "This is a comment", target: recipe)

# Obtenir les commentaires de l'article
article.comments.to_a # => [#<Comment:0x1036e3ee0 id: 1, text: "This is a comment">]

# Obtenir les commentaires de la recette
recipe.comments.to_a # => [#<Comment:0x1036e3ee1 id: 2, text: "This is a comment">]
```

:::tip
La méthode générée pour la relation inverse retourne un [query set](./queries.md) que vous pouvez utiliser pour filtrer davantage la liste des enregistrements. Par exemple :

```crystal
article.comments.filter(text__startswith: "This is")
```
:::

## Sujets avancés

### Relations récursives

Tous les fields de relation mentionnés précédemment supportent la définition de relations récursives, c'est-à-dire des relations qui ciblent le même modèle que celui définissant le field de relation. Pour ce faire, vous pouvez définir un field [`many_to_one`](./reference/fields.md#many_to_one), [`one_to_one`](./reference/fields.md#one_to_one) ou [`many_to_many`](./reference/fields.md#many_to_many) dont l'argument `to` est défini sur le mot-clé `self`.

Par exemple :

```crystal
class TreeNode < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :label, :string, max_size: 128
  // highlight-next-line
  field :parent, :many_to_one, to: self
end
```

Dans l'extrait ci-dessus, le modèle `TreeNode` aura une relation vers lui-même via le field `parent`.
