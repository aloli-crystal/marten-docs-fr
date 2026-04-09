---
title: Fields de modèle
description: Référence des fields de modèle.
---

Cette page fournit une référence pour toutes les options de field et types de field disponibles qui peuvent être utilisés lors de la définition de modèles.

## Options communes des fields

Les options de field suivantes peuvent être utilisées pour tous les types de field disponibles lors de la déclaration de fields de modèle avec la macro `field`.

### `blank`

L'argument `blank` permet de définir si un field est autorisé à recevoir des valeurs vides du point de vue de la validation. Les fields avec `blank: false` qui reçoivent des valeurs vides feront échouer la validation de l'enregistrement de modèle associé. La valeur par défaut de cet argument est `false`.

### `db_column`

L'argument `db_column` peut être utilisé pour spécifier le nom de la colonne correspondant au field au niveau de la base de données. Sauf spécification contraire, le nom de la colonne de base de données correspondra au nom du field.

### `default`

L'argument `default` permet de définir une valeur par défaut pour un field donné. La valeur par défaut de cet argument est `nil`.

### `index`

L'argument `index` peut être utilisé pour spécifier qu'un index de base de données doit être créé pour la colonne correspondante. La valeur par défaut de cet argument est `false`.

### `primary_key`

L'argument `primary_key` peut être utilisé pour spécifier qu'un field correspond à la clé primaire de la table du modèle considéré. La valeur par défaut de cet argument est `false`.

### `null`

L'argument `null` permet de définir si un field est autorisé à stocker des valeurs `NULL` dans la base de données. La valeur par défaut de cet argument est `false`.

### `unique`

L'argument `unique` permet de définir que les valeurs d'un field spécifique doivent être uniques dans toute la table associée. La valeur par défaut de cet argument est `false`.

## Types de field

### `big_int`

Un field `big_int` permet de persister des entiers 64 bits. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `auto`

L'argument `auto` active l'auto-incrémentation pour la colonne de base de données considérée. Par défaut : `false`.

Cet argument sera principalement utilisé lors de la définition d'ID entiers qui s'incrémentent automatiquement :

```crystal
class MyModel < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  # ...
end
```

### `bool`

Un field `bool` permet de persister des booléens.

### `date`

Un field `date` permet de persister des valeurs de date, qui correspondent à des objets `Time` en Crystal. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `auto_now`

L'argument `auto_now` permet de s'assurer que la valeur du field correspondant est automatiquement définie à l'heure actuelle chaque fois qu'un enregistrement est sauvegardé. Cela fournit un moyen pratique de définir des fields `updated_at`. Par défaut : `false`.

#### `auto_now_add`

L'argument `auto_now_add` permet de s'assurer que la valeur du field correspondant est automatiquement définie à l'heure actuelle chaque fois qu'un enregistrement est créé. Cela fournit un moyen pratique de définir des fields `created_at`. Par défaut : `false`.

### `date_time`

Un field `date_time` permet de persister des valeurs date-heure, qui correspondent à des objets `Time` en Crystal. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `auto_now`

L'argument `auto_now` permet de s'assurer que la valeur du field correspondant est automatiquement définie à l'heure actuelle chaque fois qu'un enregistrement est sauvegardé. Cela fournit un moyen pratique de définir des fields `updated_at`. Par défaut : `false`.

#### `auto_now_add`

L'argument `auto_now_add` permet de s'assurer que la valeur du field correspondant est automatiquement définie à l'heure actuelle chaque fois qu'un enregistrement est créé. Cela fournit un moyen pratique de définir des fields `created_at`. Par défaut : `false`.

### `duration`

Un field `duration` permet de persister des valeurs de durée, qui correspondent à des objets [`Time::Span`](https://crystal-lang.org/api/Time/Span.html) en Crystal. Les fields `duration` sont persistés comme des valeurs entières longues (nombre de nanosecondes) au niveau de la base de données.

### `email`

Un field `email` permet de persister des adresses email _valides_. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `max_size`

L'argument `max_size` est optionnel et par défaut à 254 caractères (conformément aux RFC 3696 et 5321). Il permet de spécifier la taille maximale des adresses email persistées. Cette taille maximale est utilisée pour la définition de colonne correspondante et lors de la validation des valeurs de field.

### `enum`

Un field `enum` permet de persister la valeur d'un [`Enum`](https://crystal-lang.org/api/Enum.html). Lors de la définition de fields `enum`, il est nécessaire de spécifier un argument `values` qui correspond à l'enum réel :

```crystal
enum Category
  NEWS
  BLOG
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :category, :enum, values: Category
end

article = Article.last!
article.category # => Category::BLOG
```

:::info
La manière dont les enums sont gérés au niveau de la base de données dépend du backend de base de données utilisé. En effet, un type ENUM est utilisé pour les bases de données MySQL tandis que des vérifications de colonnes sont utilisées pour les bases de données SQLite et PostgreSQL.
:::

En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `values`

L'argument `values` **est requis** et permet de spécifier la classe d'enum réelle qui doit être utilisée pour le field. Il est intéressant de mentionner que l'enum configuré impactera les valeurs autorisées pour la colonne correspondante au niveau de la base de données.

### `file`

Un field `file` permet de persister la référence à un fichier téléchargé.

:::warning
Les fields `file` ne peuvent pas être configurés comme clés primaires.
:::

#### `storage`

Cet argument optionnel peut être utilisé pour configurer le stockage qui sera utilisé pour persister les fichiers réels. Il est par défaut le stockage des fichiers média (configuré via le paramètre `media_files.storage`), mais peut être remplacé par field si nécessaire :

```crystal
my_storage = Marten::Core::Storage::FileSystem.new(root: "files", base_url: "/files/")

class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, storage: my_storage
end
```

Veuillez vous référer à [Gestion des fichiers](../../files/managing-files.md) pour plus de détails sur la gestion des fichiers téléchargés et les stockages associés.

#### `upload_to`

Cet argument optionnel peut être utilisé pour configurer l'emplacement de persistance des fichiers téléchargés dans le stockage. Il est par défaut une chaîne vide et peut être défini comme une chaîne ou un proc.

S'il est défini comme une chaîne, il permet de définir dans quel répertoire du stockage sous-jacent les fichiers seront persistés :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, upload_to: "foo/bar"
end
```

S'il est défini comme un proc, il permet de personnaliser la logique permettant de générer le chemin _et_ le nom de fichier résultants :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, upload_to: ->(filename : String) { File.join("files/uploads", filename) }
end
```

### `float`

Un field `float` permet de persister des nombres à virgule flottante (objets `Float64`).

### `image`

Un field `image` permet de persister la référence à un fichier image téléchargé.

:::info
Le shard [crystal-vips](https://github.com/naqvis/crystal-vips) est requis pour définir des fields de modèle `image`. Si ce shard n'est pas installé et requis par votre projet, il ne sera pas possible d'utiliser des fields de modèle `image` et des erreurs de compilation seront levées.

Assurez-vous donc que :

1. Le `shard.yml` de votre projet inclut :

```yaml
dependencies:
  vips:
    github: naqvis/crystal-vips
```

2. Le fichier `src/project.cr` de votre projet inclut :

```crystal
require "vips"
```
:::

:::warning
Les fields `image` ne peuvent pas être configurés comme clés primaires.
:::

#### `storage`

Cet argument optionnel peut être utilisé pour configurer le stockage qui sera utilisé pour persister les fichiers image réels. Il est par défaut le stockage des fichiers média (configuré via le paramètre `media_files.storage`), mais peut être remplacé par field si nécessaire :

```crystal
my_storage = Marten::Core::Storage::FileSystem.new(root: "files", base_url: "/files/")

class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_image, :image, storage: my_storage
end
```

Veuillez vous référer à [Gestion des fichiers](../../files/managing-files.md) pour plus de détails sur la gestion des fichiers téléchargés et les stockages associés.

#### `upload_to`

Cet argument optionnel peut être utilisé pour configurer l'emplacement de persistance des fichiers image téléchargés dans le stockage. Il est par défaut une chaîne vide et peut être défini comme une chaîne ou un proc.

S'il est défini comme une chaîne, il permet de définir dans quel répertoire du stockage sous-jacent les fichiers seront persistés :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_image, :image, upload_to: "foo/bar"
end
```

S'il est défini comme un proc, il permet de personnaliser la logique permettant de générer le chemin _et_ le nom de fichier résultants :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_image, :image, upload_to: ->(filename : String) { File.join("files/uploads", filename) }
end
```

### `int`

Un field `int` permet de persister des entiers 32 bits. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `auto`

L'argument `auto` active l'auto-incrémentation pour la colonne de base de données considérée. Par défaut : `false`.

Cet argument sera principalement utilisé lors de la définition d'ID entiers qui s'incrémentent automatiquement :

```crystal
class MyModel < Marten::Model
  field :id, :int, primary_key: true, auto: true
  # ...
end
```

### `json`

Un field `json` permet de persister des valeurs JSON dans la base de données.

Les valeurs JSON sont automatiquement analysées depuis la colonne de base de données sous-jacente et exposées comme un objet [`JSON::Any`](https://crystal-lang.org/api/JSON/Any.html) (ou `nil` si aucune valeur n'est disponible) par défaut en Crystal :

```crystal
class MyModel < Marten::Model
  # Other fields...
  field :metadata, :json
end

MyModel.last!.metadata # => JSON::Any object
```

De plus, il est également possible de spécifier une option [`serializable`](#serializable) afin de spécifier une classe qui utilise [`JSON::Serializable`](https://crystal-lang.org/api/JSON/Serializable.html). Ce faisant, l'analyse des valeurs JSON résultera en l'initialisation des objets sérialisables correspondants :

```crystal
class MySerializable
  include JSON::Serializable

  property a : Int32 | Nil
  property b : String | Nil
end

class MyModel < Marten::Model
  # Other fields...
  field :metadata, :json, serializable: MySerializable
end

MyModel.last!.metadata # => MySerializable object
```

:::info
Il est à noter que les fields `json` sont mappés à :

* des colonnes `jsonb` dans les bases de données PostgreSQL
* des colonnes `text` dans les bases de données MySQL
* des colonnes `text` dans les bases de données SQLite
:::

#### `serializable`

L'argument `serializable` permet de spécifier qu'une classe utilisant [`JSON::Serializable`](https://crystal-lang.org/api/JSON/Serializable.html) doit être utilisée pour analyser les valeurs JSON du field de modèle considéré. Lors de la spécification d'une classe `serializable`, les valeurs retournées pour les fields de modèle considérés seront des instances de cette classe au lieu d'objets [`JSON::Any`](https://crystal-lang.org/api/JSON/Any.html).

### `slug`

Un field `slug` permet de persister des valeurs de slug _valides_ (c'est-à-dire des chaînes qui ne peuvent contenir que des caractères, des chiffres, des tirets et des underscores). En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

:::info
Puisque les fields slug sont généralement utilisés pour interroger des enregistrements, ils sont indexés par défaut. Vous pouvez utiliser l'option [`index`](#index) (`index: false`) pour désactiver l'indexation automatique.
:::

#### `max_size`

L'argument `max_size` est optionnel et par défaut à 50 caractères. Il permet de spécifier la taille maximale des valeurs de slug persistées. Cette taille maximale est utilisée pour la définition de colonne correspondante et lors de la validation des valeurs de field.

#### `slugify`

L'argument `slugify` permet de spécifier le field à partir duquel le slug doit être généré. Ceci est utile lorsque vous souhaitez que le slug soit automatiquement dérivé d'un autre field.

```crystal
class Article < Marten::Model
  field :title, :string
  field :slug, :slug, slugify: :title
end

article = Article.create!(title: "My Article")

article.slug # => "my-article"
```

Lorsqu'un objet `Article` est sauvegardé, le field slug générera automatiquement un slug basé sur le field title si aucun slug personnalisé n'est fourni.

:::warning
La fonctionnalité de slugification transforme également les caractères Unicode et les symboles. Lors du filtrage d'un modèle par le paramètre de requête, il peut être nécessaire de décoder le paramètre slug au préalable, car bien que le navigateur puisse vous montrer les caractères Unicode, il enverra les caractères encodés dans la requête HTTP :

```crystal
class ArticleDetailsHandler < Marten::Handler
  def get
    article = Article.get(slug: URI.decode(params[:slug].to_s))

    # …
  end
end
```
:::

### `string`

Un field `string` permet de persister des valeurs de chaînes de petite ou moyenne taille. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `max_size`

L'argument `max_size` **est requis** et permet de spécifier la taille maximale de la chaîne persistée. Cette taille maximale est utilisée pour la définition de colonne correspondante et lors de la validation des valeurs de field.

#### `min_size`

L'argument `min_size` permet de définir la taille minimale autorisée pour la chaîne persistée. La valeur par défaut de cet argument est `nil`, ce qui signifie que la taille minimale n'est pas validée par défaut.

### `text`

Un field `text` permet de persister des valeurs de texte volumineuses. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `max_size`

L'argument `max_size` permet de spécifier la taille maximale de la chaîne persistée. Cette taille maximale est utilisée lors de la validation des valeurs de field. Par défaut : `nil`.

### `url`

Un field `url` permet de persister des adresses URL _valides_. En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `max_size`

L'argument `max_size` est optionnel et par défaut à 200 caractères. Il permet de spécifier la taille maximale des URL persistées. Cette taille maximale est utilisée pour la définition de colonne correspondante et lors de la validation des valeurs de field.

### `uuid`

Un field `uuid` permet de persister des identifiants universellement uniques (objets `UUID`).

## Types de field de relation

### `many_to_many`

Un field `many_to_many` permet de définir une relation many-to-many. Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier la classe de modèle à laquelle le modèle actuel est relié.

Par exemple, un modèle `Article` pourrait avoir un field many-to-many vers un modèle `Tag`. Dans ce cas, un enregistrement `Article` pourrait avoir de nombreux enregistrements `Tag` associés, et chaque enregistrement `Tag` pourrait également être associé à de nombreux enregistrements `Article` :

```crystal
class Tag < Marten::Model
  # ...
end

class Article < Marten::Model
  # ...
  field :tags, :many_to_many, to: Tag
end
```

En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `to`

L'argument `to` **est requis** et permet de spécifier la classe de modèle qui est reliée au modèle où le field `many_to_many` est défini.

#### `related`

L'argument `related` permet de définir le nom de la relation inverse (ou backward) sur le modèle ciblé. Si nous considérons l'exemple précédent, il serait possible de définir une relation inverse `articles` afin de permettre aux enregistrements `Tag` d'exposer leurs enregistrements `Article` liés :

```crystal
class Tag < Marten::Model
  # ...
end

class Article < Marten::Model
  # ...
  field :tags, :many_to_many, to: Tag, related: :articles
end
```

Lorsque l'argument `related` est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que tous les enregistrements `Article` utilisant un enregistrement `Tag` spécifique pourraient être accessibles via l'utilisation de la méthode `Tag#articles` dans l'extrait précédent.

La valeur par défaut est `nil`, ce qui signifie qu'aucune relation inverse n'est définie sur le modèle ciblé par défaut.

### `many_to_one`

Un field `many_to_one` permet de définir une relation many-to-one. Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier la classe de modèle à laquelle le modèle actuel est relié.

Par exemple, un modèle `Article` pourrait avoir un field many-to-one vers un modèle `Author`. Dans ce cas, un enregistrement `Article` n'aurait qu'un seul enregistrement `Author` associé, mais chaque enregistrement `Author` pourrait être associé à de nombreux enregistrements `Article` :

```crystal
class Author < Marten::Model
  # ...
end

class Article < Marten::Model
  # ...
  field :author, :many_to_one, to: Author
end
```

En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `to`

L'argument `to` **est requis** et permet de spécifier la classe de modèle qui est reliée au modèle où le field `many_to_one` est défini.

#### `related`

L'argument `related` permet de définir le nom de la relation inverse (ou backward) sur le modèle ciblé. Si nous considérons l'exemple précédent, il serait possible de définir une relation inverse `articles` afin de permettre aux enregistrements `Author` d'exposer leurs enregistrements `Article` liés :

```crystal
class Author < Marten::Model
  # ...
end

class Article < Marten::Model
  # ...
  field :author, :many_to_one, to: Author, related: :articles
end
```

Lorsque l'argument `related` est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que tous les enregistrements `Article` associés à un enregistrement `Author` spécifique pourraient être accessibles via l'utilisation de la méthode `Author#articles` dans l'extrait précédent.

La valeur par défaut est `nil`, ce qui signifie qu'aucune relation inverse n'est définie sur le modèle ciblé par défaut.

#### `on_delete`

L'argument `on_delete` permet de spécifier la stratégie de suppression à adopter lorsqu'un enregistrement lié (celui qui est ciblé par le field `many_to_one`) est supprimé. Les stratégies suivantes peuvent être spécifiées (en tant que symboles) :

* `:do_nothing` : c'est la stratégie par défaut. Avec cette stratégie, Marten ne fera rien pour s'assurer que les enregistrements référençant l'enregistrement supprimé sont supprimés ou mis à jour. Si la base de données applique l'intégrité référentielle (ce qui sera le cas pour les fields de clé étrangère), cela signifie que supprimer un enregistrement pourrait entraîner des erreurs de base de données.
* `:cascade` : cette stratégie peut être utilisée pour effectuer des suppressions en cascade. Lors de la suppression d'un enregistrement, Marten essaiera d'abord de détruire les autres enregistrements qui référencent l'objet supprimé.
* `:protect` : cette stratégie permet d'empêcher explicitement la suppression d'enregistrements s'ils sont référencés par d'autres enregistrements. Cela signifie que tenter de supprimer un enregistrement "protégé" entraînera une erreur `Marten::DB::Errors::ProtectedRecord`.
* `:set_null` : cette stratégie mettra la colonne de référence à `null` lorsque l'enregistrement lié est supprimé.

### `one_to_one`

Un field `one_to_one` permet de définir une relation one-to-one. Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier la classe de modèle à laquelle le modèle actuel est relié.

Par exemple, un modèle `User` pourrait avoir un field one-to-one vers un modèle `Profile`. Dans ce cas, le modèle `User` ne pourrait avoir qu'un seul enregistrement `Profile` associé, et l'inverse serait également vrai (un enregistrement `Profile` ne pourrait avoir qu'un seul enregistrement `User` associé). En fait, un field one-to-one est très similaire à un field many-to-one, mais avec une contrainte d'unicité supplémentaire :

```crystal
class Profile < Marten::Model
  # ...
end

class User < Marten::Model
  # ...
  field :profile, :one_to_one, to: Profile
end
```

En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `to`

L'argument `to` **est requis** et permet de spécifier la classe de modèle qui est reliée au modèle où le field `one_to_one` est défini.

#### `related`

L'argument `related` permet de définir le nom de la relation inverse (ou backward) sur le modèle ciblé. Si nous considérons l'exemple précédent, il serait possible de définir une relation inverse `user` afin de permettre aux enregistrements `Profile` d'exposer leur enregistrement `User` lié :

```crystal
class Profile < Marten::Model
  # ...
end

class User < Marten::Model
  # ...
  field :profile, :one_to_one, to: Profile, related: :user
end
```

Lorsque l'argument `related` est utilisé, une méthode sera automatiquement créée sur le modèle ciblé en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que l'enregistrement `User` associé à un enregistrement `Profile` spécifique pourrait être accessible via l'utilisation de la méthode `Profile#user` dans l'extrait précédent.

La valeur par défaut est `nil`, ce qui signifie qu'aucune relation inverse n'est définie sur le modèle ciblé par défaut.

#### `on_delete`

Identique à [l'option similaire pour le field `#many_to_one`](#on_delete).

### `polymorphic`

Un field `polymorphic` permet de définir une relation polymorphique. Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier les classes de modèle auxquelles le modèle actuel peut être relié.

Par exemple, un modèle `Comment` pourrait avoir un field polymorphique vers un modèle `Article` ou un modèle `Recipe`. Dans ce cas, un enregistrement `Comment` pourrait être associé à un enregistrement `Article` ou `Recipe` :

```crystal
class Article < Marten::Model
  # ...
end

class Recipe < Marten::Model
  # ...
end

class Comment < Marten::Model
  # ...
  field :target, :polymorphic, to: [Article, Recipe]
end
```

En plus des [options communes des fields](#options-communes-des-fields), ces fields supportent les arguments suivants :

#### `to`

L'argument `to` **est requis** et permet de spécifier les classes de modèle qui peuvent être reliées au modèle où le field `polymorphic` est défini.

#### `related`

L'argument `related` permet de définir le nom de la relation inverse (ou backward) sur le modèle ciblé. Si nous considérons l'exemple précédent, il serait possible de définir une relation inverse `comments` afin de permettre aux enregistrements `Article` et `Recipe` d'accéder à leurs enregistrements `Comment` liés :

```crystal
class Article < Marten::Model
  # ...
end

class Recipe < Marten::Model
  # ...
end

class Comment < Marten::Model
  # ...
  field :target, :polymorphic, to: [Article, Recipe], related: :comments
end
```

Lorsque l'argument `related` est utilisé, une méthode sera automatiquement créée sur les modèles associés en utilisant la valeur de l'argument choisi. Par exemple, cela signifie que tous les enregistrements `Comment` associés à un enregistrement `Article` ou `Recipe` spécifique pourraient être accessibles via l'utilisation des méthodes `Article#comments` ou `Recipe#comments` dans l'extrait précédent.

La valeur par défaut est `nil`, ce qui signifie qu'aucune relation inverse n'est définie sur les modèles associés par défaut.
