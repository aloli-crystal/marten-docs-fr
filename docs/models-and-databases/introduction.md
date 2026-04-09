---
title: Introduction aux modèles
description: Apprenez à définir des modèles et à interagir avec les enregistrements de modèles.
sidebar_label: Introduction
---

Les modèles définissent quelles données peuvent être persistées et manipulées par une application Marten. Ils spécifient explicitement les fields et les règles qui correspondent aux tables et colonnes de la base de données. En tant que tels, ils correspondent à la couche du framework responsable de la représentation des données et de la logique métier.

## Définition basique d'un modèle

Les modèles Marten doivent être définis comme des sous-classes de la classe de base [`Marten::Model`](pathname:///api/dev/Marten/DB/Model.html) ; ils définissent explicitement des "fields" via l'utilisation de la macro `field`. Ces classes et fields correspondent aux tables et colonnes de la base de données qui peuvent être interrogées grâce à une API d'accès à la base de données générée automatiquement (voir [Requêtes](./queries.md) pour plus de détails).

Par exemple, l'extrait de code suivant définit un modèle `Article` simple :

```crystal
class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :content, :text
end
```

Dans l'exemple ci-dessus, `id`, `title` et `content` sont des fields du modèle `Article`. Chacun de ces fields correspond à une colonne de base de données dans une table dont le nom est automatiquement déduit du nom du modèle (et de son application associée). Si elle devait être créée manuellement en SQL pur, le modèle `Article` correspondrait à l'instruction suivante (en utilisant la syntaxe PostgreSQL) :

```sql
CREATE TABLE myapp_articles (
  "id" bigserial NOT NULL PRIMARY KEY,
  "title" varchar(255) NOT NULL,
  "content" text NOT NULL
);
```

## Modèles et applications installées

L'application d'un modèle doit être explicitement ajoutée à la liste des applications installées pour le projet considéré. En effet, Marten exige que les projets déclarent explicitement les applications qu'ils utilisent dans l'option de configuration `installed_apps`. Les tables et migrations de modèles ne seront créées/appliquées que pour les classes de modèles fournies par les _applications installées_.

Par exemple, si le modèle `Article` ci-dessus était associé à une classe d'application `MyApp`, il serait possible de s'assurer qu'il est utilisé en vérifiant que l'option de configuration `installed_app` est la suivante :

```crystal
Marten.configure do |config|
  config.installed_apps = [
    MyApp,
    # other apps...
  ]
end
```

## Fields de modèle

Les classes de modèles doivent définir des _fields_. Les fields permettent de spécifier les attributs d'un modèle et ils correspondent aux colonnes réelles de la base de données. Ils sont définis via l'utilisation de la macro `field`.

Par exemple :

```crystal
class Author < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :first_name, :string, max_size: 255
  field :last_name, :string, max_size: 255
end

class Article < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
  field :content, :text
  field :author, :many_to_one, to: Author
end
```

### Identifiant et type de field

Chaque field dans une classe de modèle doit contenir deux arguments positionnels obligatoires : un identifiant de field et un type de field.

L'identifiant de field est utilisé par Marten pour déterminer le nom de la colonne de base de données correspondante. Cet identifiant est également utilisé pour générer les bindings Crystal qui vous permettent d'interagir avec les valeurs des fields via des getters et setters.

Le type de field détermine plusieurs choses :

* le type de la colonne de base de données correspondante (par exemple `INTEGER`, `TEXT`, etc.)
* les méthodes getter et setter qui sont générées pour le field dans la classe de modèle
* la manière dont les valeurs du field sont effectivement validées

Marten fournit de nombreux types de fields intégrés qui couvrent les besoins courants du développement web. La liste complète des fields supportés est disponible dans la [référence des fields de modèle](./reference/fields.md).

:::note
Il est possible d'écrire des fields de modèle personnalisés et de les utiliser dans vos définitions de modèles. Voir [Guide pratique : créer des fields de modèle personnalisés](./how-to/create-custom-model-fields.md) pour plus de détails.
:::

### Options communes des fields

En plus de leurs identifiants et types, les fields peuvent prendre des arguments nommés qui permettent de configurer davantage leurs comportements et la manière dont ils correspondent aux colonnes de la base de données. La plupart du temps, ces arguments nommés supplémentaires sont optionnels, mais ils peuvent être obligatoires selon le type de field considéré.

Certains de ces arguments optionnels sont partagés par tous les fields disponibles. Voici une liste de ceux que vous rencontrerez le plus fréquemment.

#### `null`

L'argument `null` permet de définir si un field est autorisé à stocker des valeurs `NULL` dans la base de données. La valeur par défaut de cet argument est `false`.

#### `blank`

L'argument `blank` permet de définir si un field est autorisé à recevoir des valeurs vides du point de vue de la validation. Les fields avec `blank: false` qui reçoivent des valeurs vides feront échouer la validation de l'enregistrement de modèle associé. La valeur par défaut de cet argument est `false`.

#### `default`

L'argument `default` permet de définir une valeur par défaut pour un field donné. La valeur par défaut de cet argument est `nil`.

#### `unique`

L'argument `unique` permet de définir que les valeurs d'un field spécifique doivent être uniques dans toute la table associée. La valeur par défaut de cet argument est `false`.

### Clé primaire obligatoire

Tous les modèles Marten doivent définir un (et un seul) field de clé primaire. Ce field de clé primaire sera généralement un field `int` ou `big_int` utilisant les arguments `primary_key: true` et `auto: true`, comme dans l'exemple suivant :

```crystal
class MyModel < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
end
```

Il est à noter que la clé primaire peut correspondre à tout autre type de field. Par exemple, votre clé primaire pourrait correspondre à un field `uuid` :

```crystal
class MyModel < Marten::Model
  field :id, :uuid, primary_key: true

  after_initialize :initialize_id

  def initialize_id
    @id ||= UUID.random
  end
end
```

### Relations

Marten fournit des fields spéciaux permettant de définir les trois types les plus courants de relations de base de données : many-to-many, many-to-one et one-to-one.

#### Relations many-to-one

Les relations many-to-one peuvent être définies via l'utilisation de fields [`many_to_one`](./reference/fields.md#many_to_one). Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier la classe de modèle à laquelle le modèle actuel est relié.

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

:::tip
Il est possible de définir des relations récursives en utilisant le mot-clé `self`. Par exemple, si vous souhaitez définir un field de relation many-to-one qui cible le même modèle, vous pouvez le faire facilement en utilisant `self` comme valeur de l'argument `to` :

```crystal
class TreeNode < Marten::Model
  # ...
  field :parent, :many_to_one, to: self
end
```
:::

:::info
Veuillez vous référer à [Relations many-to-one](./relationships.md#relations-many-to-one) pour en savoir plus sur ce type de relation de modèle.
:::

#### Relations one-to-one

Les relations one-to-one peuvent être définies via l'utilisation de fields [`one_to_one`](./reference/fields.md#one_to_one). Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier la classe de modèle à laquelle le modèle actuel est relié.

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

:::info
Veuillez vous référer à [Relations one-to-one](./relationships.md#relations-one-to-one) pour en savoir plus sur ce type de relation de modèle.
:::

#### Relations many-to-many

Les relations many-to-many peuvent être définies via l'utilisation de fields [`many_to_many`](./reference/fields.md#many_to_many). Ce type de field spécial nécessite l'utilisation d'un argument spécial `to` afin de spécifier la classe de modèle à laquelle le modèle actuel est relié.

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

:::info
Veuillez vous référer à [Relations many-to-many](./relationships.md#relations-many-to-many) pour en savoir plus sur ce type de relation de modèle.
:::

### Horodatages

Marten vous permet d'ajouter facilement des fields [`date_time`](./reference/fields.md#date_time) automatiques `created_at` / `updated_at` à vos modèles en utilisant la macro [`#with_timestamp_fields`](pathname:///api/dev/Marten/DB/Model/Table.html#with_timestamp_fields-macro) :

```crystal
class Article < Marten::Model
  // highlight-next-line
  with_timestamp_fields

  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
end
```

Le field `created_at` est rempli avec l'heure actuelle lors de la création de nouveaux enregistrements, tandis que le field `updated_at` est actualisé avec l'heure actuelle à chaque mise à jour des enregistrements.

Notez que l'utilisation de [`#with_timestamp_fields`](pathname:///api/dev/Marten/DB/Model/Table.html#with_timestamp_fields-macro) est techniquement équivalente à définir deux fields [`date_time`](./reference/fields.md#date_time) `created_at` et `updated_at` comme suit :

```crystal
class Article < Marten::Model
  // highlight-next-line
  field :created_at, :date_time, auto_now_add: true
  // highlight-next-line
  field :updated_at, :date_time, auto_now: true

  field :id, :big_int, primary_key: true, auto: true
  field :title, :string, max_size: 255
end
```

## Index et contraintes d'unicité multi-fields

Les fields de modèle individuels peuvent être indexés ou associés à une contrainte d'unicité _individuellement_ en utilisant les options de field [`index`](./reference/fields.md#index) et [`unique`](./reference/fields.md#unique). Cependant, il est parfois nécessaire de configurer des index ou des contraintes d'unicité multi-fields.

### Index multi-fields

Les index multi-fields peuvent être configurés dans un modèle en utilisant la méthode de classe [`#db_index`](pathname:///api/dev/Marten/DB/Model/Table/ClassMethods.html#db_index(name%3AString|Symbol%2Cfield_names%3AArray(String)|Array(Symbol))%3ANil-instance-method). Cette méthode nécessite un argument de nom d'index ainsi qu'un tableau de noms de fields ciblés.

Par exemple :

```crystal
class Person < Marten::Model
  field :id, :int, primary_key: true, auto: true
  field :first_name, :string, max_size: 50
  field :last_name, :string, max_size: 50

  db_index :person_full_name_index, field_names: [:first_name, :last_name]
end
```

### Contraintes d'unicité multi-fields

Les contraintes d'unicité multi-fields peuvent être configurées dans un modèle en utilisant la méthode de classe [`#db_unique_constraint`](pathname:///api/dev/Marten/DB/Model/Table/ClassMethods.html#db_unique_constraint(name%3AString|Symbol%2Cfield_names%3AArray(String)|Array(Symbol))%3ANil-instance-method). Cette méthode nécessite un argument de nom d'index ainsi qu'un tableau de noms de fields ciblés.

Par exemple :

```crystal
class Booking < Marten::Model
  field :id, :int, primary_key: true, auto: true
  field :room, :string, max_size: 50
  field :date, :date, max_size: 50

  db_unique_constraint :booking_room_date_constraint, field_names: [:room, :date]
end
```

La contrainte ci-dessus garantit que chaque salle ne peut être réservée qu'une seule fois par date.

## Opérations CRUD

CRUD signifie **C**reate (Créer), **R**ead (Lire), **U**pdate (Mettre à jour) et **D**elete (Supprimer). Marten fournit un ensemble de méthodes et d'outils permettant aux applications de lire et manipuler les données stockées dans les tables de modèles.

### Créer

Les enregistrements de modèles peuvent être créés via l'utilisation des méthodes `#new` et `#create`. La méthode `#new` initialisera simplement un nouvel enregistrement de modèle qui n'est pas persisté dans la base de données. La méthode `#create` initialisera le nouvel enregistrement de modèle en utilisant les attributs spécifiés et le persistera dans la base de données.

Par exemple, il serait possible de créer un nouvel enregistrement du modèle `Article` en spécifiant les valeurs de ses attributs `title` et `content` via l'utilisation de la méthode `#create` comme suit :

```crystal
Article.create(title: "My article", content: "Learn how to build web apps with Marten!")
```

Le même enregistrement `Article` pourrait être initialisé (mais pas sauvegardé !) via l'utilisation de la méthode `new` comme suit :

```crystal
Article.new(title: "My article", content: "Learn how to build web apps with Marten!")
```

Il est à noter que les valeurs des fields peuvent être assignées après l'initialisation d'une instance de modèle. Par exemple, l'exemple précédent est équivalent à l'extrait suivant :

```crystal
article = Article.new
article.title = "My article"
article.content = "Learn how to build web apps with Marten!"
```

Une instance de modèle initialisée comme dans l'exemple précédent ne sera pas automatiquement persistée dans la base de données. Dans cette situation, il est possible de s'assurer que l'enregistrement correspondant est créé dans la base de données en utilisant la méthode `#save` (`article.save`).

Enfin, il est à noter que `#create` et `#new` supportent un bloc optionnel qui recevra l'enregistrement de modèle initialisé. Cela permet d'initialiser des attributs ou d'appeler des méthodes supplémentaires sur l'enregistrement en cours d'initialisation :

```crystal
Article.create do |article|
  article.title = "My article"
  article.content = "Learn how to build web apps with Marten!"
end
```

### Lire

Les modèles Marten fournissent une API puissante permettant de lire et interroger les enregistrements. Ceci est réalisé en construisant des "query sets". Un query set est une représentation de collections d'enregistrements de la base de données qui peuvent être filtrés.

Par exemple, il est possible de retourner une collection de tous les enregistrements du modèle `Article` en utilisant :

```crystal
Article.all
```

Il est possible de récupérer un enregistrement spécifique correspondant à un ensemble de filtres (par exemple la valeur d'un identifiant) en utilisant :

```crystal
Article.get(id: 42)
```

Enfin, l'extrait suivant montre comment filtrer les enregistrements `Article` par titre et les trier par date de création en ordre chronologique inverse :

```crystal
Article.filter(name: "My article").order("-created_at")
```

Veuillez consulter le guide [Requêtes de modèles](./queries.md) pour en savoir plus sur les capacités de requêtage des modèles.

### Mettre à jour

Une fois qu'un enregistrement de modèle a été récupéré de la base de données, il est possible de le mettre à jour en modifiant ses attributs et en appelant la méthode `#save` :

```crystal
article = Article.get(id: 42)
article.title = "Updated!"
article.save
```

Marten fournit également la possibilité de mettre à jour les enregistrements ciblés par un query set spécifique via l'utilisation de la méthode `#update`, comme dans l'exemple suivant :

```crystal
Article.filter(title: "My article").update(title: "Updated!")
```

#### Mise à jour de colonnes spécifiques {#updating-specific-columns}

Si vous devez mettre à jour uniquement des colonnes spécifiques sans exécuter les validations ou les callbacks, vous pouvez utiliser les méthodes `#update_columns` ou `#update_columns!` :

```crystal
article = Article.get(id: 42)
article.update_columns(title: "Updated!")
```

Ces méthodes sont utiles lorsque vous souhaitez mettre à jour efficacement un sous-ensemble de fields sans déclencher le cycle de vie complet de la sauvegarde. La variante `#update_columns!` lèvera une erreur si elle est appelée sur un enregistrement nouveau (non sauvegardé) :

```crystal
article = Article.new
article.update_columns!(title: "New article")  # Raises Marten::DB::Errors::UnmetSaveCondition
```

:::caution
Les méthodes `#update_columns` et `#update_columns!` contournent les validations de modèle et les callbacks du cycle de vie (tels que `before_update`, `after_update`, etc.). Utilisez-les avec prudence et uniquement lorsque vous êtes certain que sauter ces vérifications est sûr pour votre application.
:::

### Supprimer

Une fois qu'un enregistrement de modèle a été récupéré de la base de données, il est possible de le supprimer en utilisant la méthode `#delete` :

```crystal
article = Article.get(id: 42)
article.delete
```

Marten fournit également la possibilité de supprimer les enregistrements ciblés par un query set spécifique via l'utilisation de la méthode `#delete`, comme dans l'exemple suivant :

```crystal
Article.filter(title: "My article").delete
```

## Validations

Marten vous permet de spécifier comment valider les enregistrements de modèles avant qu'ils ne soient persistés dans la base de données. Ces règles de validation peuvent être héritées des fields de votre modèle selon les options que vous avez utilisées (par exemple, les fields utilisant `blank: false` feront échouer la validation de l'enregistrement associé si la valeur du field est vide). Elles peuvent également être spécifiées explicitement dans votre classe de modèle, ce qui est utile si vous devez implémenter des logiques de validation personnalisées.

Par exemple :

```crystal
class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :name, :string, max_size: 255

  validate :validate_name

  private def validate_name
    errors.add(:name, "Name must not be less than 3 characters!") if name && name!.size < 3
  end
end
```

La plupart des méthodes présentées ci-dessus qui persistent effectivement les enregistrements de modèles dans la base de données (comme `#create` ou `#save`) exécutent ces règles de validation. Cela signifie qu'elles valideront automatiquement les enregistrements considérés avant de propager les modifications vers la base de données. Il est à noter que dans le cas où un enregistrement est invalide, ces méthodes retourneront `false` pour indiquer que l'objet considéré est invalide (et elles retourneront `true` si l'objet est valide). Les méthodes `#create` et `#save` ont également des variantes bang (`#create!` et `#save!`) qui lèveront explicitement une erreur de validation en cas d'enregistrements invalides :

```crystal
article = Article.new
article.save
# => false
article.save!
# => Unhandled exception: Record is invalid (Marten::DB::Errors::InvalidRecord)
```

Veuillez consulter le guide [Validations de modèles](./validations.md) pour en savoir plus sur les validations de modèles.

## Héritage

Les classes de modèles peuvent hériter les unes des autres. Cela vous permet de réutiliser facilement les définitions de fields et les attributs de table d'un modèle parent dans un modèle enfant.

Actuellement, le framework web Marten permet [l'héritage de modèle abstrait](#héritage-de-modèle-abstrait) (utile pour réutiliser des fields de modèle et des patterns partagés sur plusieurs modèles enfants sans qu'une table de base de données soit créée pour le modèle parent) et [l'héritage multi-table](#héritage-multi-table).

### Héritage de modèle abstrait

Vous pouvez définir des classes de modèles abstraites en utilisant [le mécanisme de type abstrait de Crystal](https://crystal-lang.org/reference/syntax_and_semantics/virtual_and_abstract_types.html). Cela permet de réutiliser facilement les définitions de fields, les propriétés de table et les logiques personnalisées dans les modèles enfants. Dans cette situation, le modèle parent ne contribue aucune table à la base de données considérée.

Par exemple :

```crystal
abstract class Person < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :name, :string, max_size: 255
  field :email, :string, max_size: 255
end

class Student < Person
  field :grade, :string, max_size: 15
end
```

Le modèle `Student` aura quatre fields au total (`id`, `name`, `email` et `grade`). De plus, toutes les méthodes des fields du modèle parent seront disponibles sur le modèle enfant. Il est à noter que dans ce cas, le modèle `Person` ne peut pas être utilisé comme un modèle régulier : par exemple, essayer d'interroger des enregistrements retournera une erreur puisqu'aucune table n'est réellement associée au modèle abstrait. Puisqu'il s'agit d'un [type abstrait](https://crystal-lang.org/reference/syntax_and_semantics/virtual_and_abstract_types.html), la classe `Student` ne peut pas non plus être instanciée.

### Héritage multi-table

Marten supporte également une autre forme d'héritage de modèle, où chaque modèle dans la hiérarchie est un modèle concret (c'est-à-dire un modèle qui n'est pas abstrait). Dans cette situation, chaque modèle peut être utilisé/interrogé individuellement et possède sa propre table associée. Le framework maintient des "liens" entre chaque modèle qui utilise l'héritage multi-table et ses modèles parents afin de s'assurer que la structure relationnelle et la hiérarchie d'héritage sont correctement maintenues.

Par exemple, considérons les modèles suivants :

```crystal
class Person < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :first_name, :string, max_size: 100
  field :last_name, :string, max_size: 100
end

class Employee < Person
  field :company_name, :string, max_size: 100
end
```

Tous les fields définis dans le modèle `Person` seront accessibles lors de l'interaction avec les enregistrements du modèle `Employee`, malgré le fait que les données elles-mêmes sont stockées dans des tables distinctes. Cela signifie qu'il sera possible de filtrer les enregistrements `Employee` en utilisant les fields définis dans le modèle `Person`, et d'interagir avec les attributs correspondants lors de la manipulation des instances de modèle obtenues :

```crystal
employee = Employee.filter(first_name: "John").first!
employee.first_name # => "John"
```

L'initialisation ou la création d'enregistrements `Employee` fonctionnera également comme vous l'attendriez si tous les fields étaient définis dans la classe de modèle `Employee` :

```crystal
employee = Employee.create!(
  first_name: "John",
  last_name: "Doe",
  company_name: "Super org"
)
```

De plus, il est important de noter que tenter de filtrer ou récupérer des enregistrements `Person` retournera des instances `Person`. Lors de la manipulation d'une instance de modèle parent, il est possible d'obtenir un enregistrement de modèle enfant en appelant la méthode `#<child_model>` - où `child_model` est la version en minuscules du nom du modèle enfant. Par exemple :

```crystal
person = Person.filter(first_name: "John").first!
person.employee # => #<Employee:0x101590c40 person_ptr_id: 1, first_name: "John" ...>
```

Vous devez noter que si l'enregistrement `Person` n'est pas un employé, alors l'appel à `#employee` retournera `nil`.

:::note
Il est important de noter que lors de la récupération et du filtrage d'enregistrements de modèles qui utilisent l'héritage multi-table (comme les enregistrements de modèles enfants), il y aura des opérations de jointure supplémentaires dans les requêtes SQL sous-jacentes. Ces jointures sont nécessaires pour assembler les données complètes à partir des différentes tables liées, ce qui peut potentiellement affecter les performances globales des requêtes.
:::

## Callbacks

Il est possible de définir des callbacks dans votre modèle afin de lier des méthodes et des logiques à des événements spécifiques du cycle de vie de vos enregistrements de modèles. Par exemple, il est possible de définir des callbacks qui s'exécutent avant la création d'un enregistrement, ou avant sa destruction.

Veuillez consulter le guide [Callbacks de modèles](./callbacks.md) pour en savoir plus sur les callbacks de modèles.

## Migrations

Lorsque vous travaillez avec des modèles, il est nécessaire de s'assurer que toute modification apportée aux définitions de modèles est appliquée au niveau de la base de données. Ceci est réalisé grâce à l'utilisation des migrations.

Marten fournit un mécanisme de migrations conçu pour être automatique : cela signifie que les migrations seront automatiquement générées à partir de vos définitions de modèles lorsque vous exécuterez une commande dédiée (la commande `genmigrations`). Veuillez consulter [Migrations de modèles](./migrations.md) pour en savoir plus sur la génération de migrations et les workflows associés.
