---
title: Champs de schema
description: Référence des champs de schema.
---

Cette page fournit une référence pour toutes les options de champ et types de champ disponibles qui peuvent être utilisés lors de la définition de schemas.

## Options communes des champs

Les options de champ suivantes peuvent être utilisées pour tous les types de champ disponibles lors de la déclaration de champs de schema avec la macro `field`.

### `required`

L'argument `required` peut être utilisé pour spécifier si un champ de schema est obligatoire ou non. La valeur par défaut de cet argument est `true`.

## Types de champ

### `array`

Un champ `array` permet de valider une liste de valeurs, chaque valeur étant soumise aux règles de validation d'un champ membre du tableau. Le type du champ membre du tableau sous-jacent doit être spécifié via l'utilisation de l'option [`of`](#of). Cette option doit référencer un [type de champ de schema existant](#types-de-champ) (tel que `string`, `enum`, etc.).

Par exemple, le schema suivant permet de valider un tableau de chaînes de caractères :

```crystal
class ColorsSchema < Marten::Schema
  field :colors, :array, of: :string
end
```

Il est possible de spécifier des options spécifiques au champ membre du tableau choisi. Par exemple :

```crystal
class ColorsSchema < Marten::Schema
  field :colors, :array, of: :string, max_size: 10
end
```

:::info
La définition de champs de tableau imbriqués n'est pas permise.
:::

#### `of`

L'option `of` est obligatoire pour les champs `array` et permet de spécifier le type du champ membre du tableau sous-jacent. Cette option doit référencer un [type de champ de schema existant](#types-de-champ) (tel que `string`, `enum`, etc.).

### `bool`

Un champ `bool` permet de valider des valeurs booléennes.

### `date`

Un champ `date` permet de valider des valeurs de date. Les champs utilisant ce type sont convertis en objets `Time` en Crystal.

:::info
Les champs `date` tentent automatiquement de désérialiser les valeurs entrantes en utilisant un ensemble prédéfini de formats d'entrée. Ces formats sont localisés et configurables via la clé de traduction `marten.schema.field.date.input_formats`. Si Marten ne fournit pas de traductions pour la locale que vous utilisez, vous pouvez définir des formats localisés personnalisés dans votre projet. Pour des instructions détaillées, voir [Définir des traductions](../../i18n/introduction.md#defining-translations). Par exemple :


```yaml
en:
  marten:
    schema:
      field:
        date:
          input_formats:
            - "%Y-%m-%d"
            - "%m/%d/%Y"
            - "%b %d %Y"
            - "%b %d, %Y"
            - "%d %b %Y"
            - "%d %b, %Y"
            - "%B %d %Y"
            - "%B %d, %Y"
            - "%d %B %Y"
            - "%d %B, %Y"
```

Si aucun des formats d'entrée localisés ne parvient à analyser la valeur de date brute entrante, les champs `date` se rabattront sur les formats spécifiés dans le paramètre [`date_input_formats`](../../development/reference/settings.md#date_input_formats).
:::

### `date_time`

Un champ `date_time` permet de valider des valeurs de date/heure. Les champs utilisant ce type sont convertis en objets `Time` en Crystal.

:::info
Les champs `date_time` tentent automatiquement de désérialiser les valeurs entrantes en utilisant un ensemble prédéfini de formats d'entrée. Ces formats sont localisés et configurables via la clé de traduction `marten.schema.field.date_time.input_formats`. Si Marten ne fournit pas de traductions pour la locale que vous utilisez, vous pouvez définir des formats localisés personnalisés dans votre projet. Pour des instructions détaillées, voir [Définir des traductions](../../i18n/introduction.md#defining-translations). Par exemple :


```yaml
en:
  marten:
    schema:
      field:
        date_time:
          input_formats:
            - "%Y-%m-%d %H:%M:%S"
            - "%Y-%m-%d %H:%M:%S.%f"
            - "%Y-%m-%d %H:%M"
            - "%m/%d/%Y %H:%M:%S"
            - "%m/%d/%Y %H:%M:%S.%f"
            - "%m/%d/%Y %H:%M"
```

Si aucun des formats d'entrée localisés ne parvient à analyser la valeur de date/heure brute entrante, les champs `date_time` se rabattront sur les formats spécifiés dans le paramètre [`date_time_input_formats`](../../development/reference/settings.md#date_time_input_formats).
:::

### `duration`

Un champ `duration` permet de valider des valeurs de durée, qui correspondent à des objets [`Time::Span`](https://crystal-lang.org/api/Time/Span.html) en Crystal. Les champs `duration` attendent des valeurs sérialisées au format `DD.HH:MM:SS.nnnnnnnnn` (avec `n` correspondant aux nanosecondes) ou au format [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) (par exemple `P3DT2H15M20S`, qui correspond à un intervalle de temps `3.2:15:20`).

### `email`

Un champ `email` permet de valider des valeurs d'adresses email. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `max_size`

L'argument `max_size` permet de définir la taille maximale autorisée pour la chaîne d'adresse email. La valeur par défaut de cet argument est `254` (conformément aux RFC 3696 et 5321).

#### `min_size`

L'argument `min_size` permet de définir la taille minimale autorisée pour la chaîne d'adresse email. La valeur par défaut de cet argument est `nil`, ce qui signifie que la taille minimale n'est pas validée par défaut.

#### `strip`

L'argument `strip` permet de définir si la valeur de la chaîne doit être débarrassée des espaces en début et en fin. La valeur par défaut est `true`.

### `enum`

Un champ `enum` permet de valider des valeurs de chaîne par rapport aux valeurs d'un [`Enum`](https://crystal-lang.org/api/Enum.html) spécifique. Lors de la définition de champs `enum`, il est nécessaire de spécifier un argument `values` qui correspond à l'enum réel :

```crystal
enum Category
  NEWS
  BLOG
end

class ArticleSchema < Marten::Schema
  field :title, :string
  field :category, :enum, values: Category
end

schema = ArticleSchema.new(
  Marten::HTTP::Params::Data{"title" => ["Test"], "category" => ["blog"]}
)

schema.valid?   # => true
schema.category # => Category::BLOG
```

En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `values`

L'argument `values` **est obligatoire** et permet de spécifier la classe enum réelle qui doit être utilisée pour le champ. Seules les valeurs de chaîne correspondant aux valeurs de l'enum seront validées par le champ.

### `file`

Un champ `file` permet de valider des fichiers téléversés. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `allow_empty_files`

L'argument `allow_empty_files` permet de définir si les fichiers vides sont autorisés ou non lors de la validation des fichiers. La valeur par défaut est `false`.

#### `max_name_size`

L'argument `max_name_size` permet de définir la taille maximale du nom de fichier autorisée. La valeur par défaut est `nil`, ce qui signifie que les tailles de nom de fichier téléversé ne sont pas validées.

### `float`

Un champ `float` permet de valider des valeurs à virgule flottante. Les champs utilisant ce type sont convertis en objets `Float64` en Crystal. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `max_value`

L'argument `max_value` permet de définir la valeur maximale autorisée. La valeur par défaut de cet argument est `nil`, ce qui signifie que la valeur maximale n'est pas validée par défaut.

#### `min_value`

L'argument `min_value` permet de définir la valeur minimale autorisée. La valeur par défaut de cet argument est `nil`, ce qui signifie que la valeur minimale n'est pas validée par défaut.

### `image`

Un champ `image` permet de valider des fichiers téléversés en s'assurant qu'il s'agit bien d'images. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

:::info
Le shard [crystal-vips](https://github.com/naqvis/crystal-vips) est requis pour définir des champs de schema `image`. Si ce shard n'est pas installé et requis par votre projet, il ne sera pas possible d'utiliser les champs de schema `image` et des erreurs de compilation seront levées.

En tant que tel, assurez-vous que :

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

#### `max_name_size`

L'argument `max_name_size` permet de définir la taille maximale du nom de fichier autorisée. La valeur par défaut est `nil`, ce qui signifie que les tailles de nom de fichier téléversé ne sont pas validées.

### `int`

Un champ `int` permet de valider des valeurs entières. Les champs utilisant ce type sont convertis en objets `Int64` en Crystal. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `max_value`

L'argument `max_value` permet de définir la valeur maximale autorisée. La valeur par défaut de cet argument est `nil`, ce qui signifie que la valeur maximale n'est pas validée par défaut.

#### `min_value`

L'argument `min_value` permet de définir la valeur minimale autorisée. La valeur par défaut de cet argument est `nil`, ce qui signifie que la valeur minimale n'est pas validée par défaut.

### `json`

Un champ `json` permet de valider des valeurs JSON, qui sont automatiquement analysées en objets [`JSON::Any`](https://crystal-lang.org/api/JSON/Any.html). De plus, il est possible d'utiliser l'option [`serializable`](#serializable) afin de spécifier une classe qui utilise [`JSON::Serializable`](https://crystal-lang.org/api/JSON/Serializable.html). Ce faisant, l'analyse des valeurs JSON résultera en l'initialisation des objets sérialisables correspondants :

```crystal
class MySerializable
  include JSON::Serializable

  property a : Int32 | Nil
  property b : String | Nil
end

class MySchema < Marten::Schema
  # Other fields...
  field :metadata, :json, serializable: MySerializable
end

schema = MySchema.new(Marten::Schema::DataHash{"metadata" => %{{"a": 42, "b": "foo"}}})
schema.valid?    # => true
schema.metadata! # => MySerializable object
```

#### `serializable`

L'argument `serializable` permet de spécifier qu'une classe utilisant [`JSON::Serializable`](https://crystal-lang.org/api/JSON/Serializable.html) doit être utilisée pour analyser les valeurs JSON du champ de schema en question. Lors de la spécification d'une classe `serializable`, les valeurs retournées pour les champs de schema considérés seront des instances de cette classe au lieu d'objets [`JSON::Any`](https://crystal-lang.org/api/JSON/Any.html).

### `slug`

Un champ `slug` permet de valider des valeurs de slug (c'est-à-dire des chaînes qui ne peuvent contenir que des caractères, des chiffres, des tirets et des tirets bas). En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `max_size`

L'argument `max_size` permet de définir la taille maximale autorisée pour la chaîne de slug. La valeur par défaut de cet argument est `50`.

#### `min_size`

L'argument `min_size` permet de définir la taille minimale autorisée pour la chaîne de slug. La valeur par défaut de cet argument est `nil`, ce qui signifie que la taille minimale n'est pas validée par défaut.

#### `strip`

L'argument `strip` permet de définir si la valeur de la chaîne doit être débarrassée des espaces en début et en fin. La valeur par défaut est `true`.

### `string`

Un champ `string` permet de valider des valeurs de chaîne de caractères. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `max_size`

L'argument `max_size` permet de définir la taille maximale autorisée pour la chaîne. La valeur par défaut de cet argument est `nil`, ce qui signifie que la taille maximale n'est pas validée par défaut.

#### `min_size`

L'argument `min_size` permet de définir la taille minimale autorisée pour la chaîne. La valeur par défaut de cet argument est `nil`, ce qui signifie que la taille minimale n'est pas validée par défaut.

#### `strip`

L'argument `strip` permet de définir si la valeur de la chaîne doit être débarrassée des espaces en début et en fin. La valeur par défaut est `true`.

### `uuid`

Un champ `uuid` permet de valider des valeurs d'identifiants universellement uniques (UUID). Les champs utilisant ce type sont convertis en objets `UUID` en Crystal.

### `url`

Un champ `url` permet de valider des valeurs d'adresses URL. En plus des [options communes des champs](#options-communes-des-champs), ces champs supportent les arguments suivants :

#### `max_size`

L'argument `max_size` permet de définir la taille maximale autorisée pour la chaîne URL. La valeur par défaut de cet argument est `200`.

#### `min_size`

L'argument `min_size` permet de définir la taille minimale autorisée pour la chaîne URL. La valeur par défaut de cet argument est `nil`, ce qui signifie que la taille minimale n'est pas validée par défaut.

#### `strip`

L'argument `strip` permet de définir si la valeur de la chaîne doit être débarrassée des espaces en début et en fin. La valeur par défaut est `true`.
