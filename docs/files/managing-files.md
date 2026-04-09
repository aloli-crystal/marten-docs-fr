---
title: Gérer les fichiers
description: Apprenez à gérer les fichiers téléversés.
sidebar_label: Gérer les fichiers
---

Marten vous donne la possibilité d'associer des fichiers téléversés à des enregistrements de modèle et de personnaliser entièrement comment et où ces fichiers sont persistés. Cette section couvre les bases de l'utilisation des fichiers avec les modèles, comment interagir avec les objets fichier, et introduit le concept de stockage de fichiers.

## Utiliser des fichiers avec les modèles

Vous pouvez utiliser les champs [`file`](../models-and-databases/reference/fields.md#file) ou [`image`](../models-and-databases/reference/fields.md#image) lors de la définition de modèles : cela permet d'associer un fichier téléversé à des enregistrements de modèle spécifiques.

Par exemple, considérons le modèle suivant :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, blank: false, null: false
end
```

Tout enregistrement du modèle `Attachment` aura un attribut `uploaded_file` permettant d'interagir avec le fichier attaché :

```crystal
attachment = Attachment.first!
attachment.uploaded_file           # => #<Marten::DB::Field::File::File:0x102dd0ac0 ...>
attachment.uploaded_file.attached? # => true
attachment.uploaded_file.name      # => "test.txt"
attachment.uploaded_file.size      # => 5796929
attachment.uploaded_file.url       # => "/media/test.txt"
```

L'objet retourné par la méthode `Attachment#uploaded_file` est un « objet fichier » : une instance de [`Marten::DB::Field::File::File`](pathname:///api/dev/Marten/DB/Field/File/File.html). Ces objets et leurs fonctionnalités associées sont décrits ci-dessous dans [Objets fichier](#objets-fichier).

:::tip Sous quel chemin les fichiers sont-ils persistés ?
Les fichiers sont stockés à la racine du [stockage](#stockages-de-fichiers) media par défaut. Il est à noter que le chemin utilisé pour persister les fichiers dans les stockages peut être configuré en définissant l'option `upload_to` du champ [`file`](../models-and-databases/reference/fields.md#file).

Par exemple, le modèle `Attachment` précédent pourrait être réécrit comme suit pour s'assurer que les fichiers sont persistés dans un dossier `foo/bar` :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, blank: false, null: false, upload_to: "foo/bar"
end
```

Il est également à noter que `upload_to` peut correspondre à un proc qui prend le nom du fichier à sauvegarder, ce qui peut être utilisé pour implémenter une logique de génération de chemin de fichier plus complexe si nécessaire :

```crystal
class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, blank: false, null: false, upload_to: ->(name : String) { File.join("files/uploads", name) }
end
```
:::

Il est à noter que sauvegarder un enregistrement de modèle résultera automatiquement en la sauvegarde et la persistance de tous les fichiers associés dans le bon [stockage](#stockages-de-fichiers) automatiquement. Par exemple, le fragment suivant lit un fichier disponible localement et l'attache à un nouvel enregistrement de modèle :

```crystal
attachment = Attachment.new

File.open("test.txt") do |file|
  attachment.uploaded_file = file
  attachment.save!
end
```

:::info
Vous n'avez pas besoin de vous soucier des collisions possibles entre les noms de fichiers attachés : Marten s'assure automatiquement que les fichiers téléversés ont un nom de fichier unique dans le stockage de destination afin d'éviter les conflits possibles.
:::

## Objets fichier

Comme mentionné précédemment, les objets fichier sont utilisés en interne par Marten pour permettre l'interaction avec les fichiers associés aux enregistrements de modèle. Ces objets sont des instances de la classe [`Marten::DB::Field::File::File`](pathname:///api/dev/Marten/DB/Field/File/File.html). Ils donnent accès aux propriétés de base du fichier et permettent d'interagir avec l'IO associé.

Il est à noter que ces « objets fichier » sont **toujours** associés à un enregistrement de modèle (persisté ou non), et en tant que tels, ils ne sont utilisés que dans le contexte du champ de modèle [`file`](../models-and-databases/reference/fields.md#file).

Enfin, il convient de mentionner que les objets fichier peuvent être **attachés** et/ou **validés** :

* un objet fichier **attaché** a un fichier associé défini : dans ce cas, sa méthode [`#attached?`](pathname:///api/dev/Marten/DB/Field/File/File.html#attached%3F-instance-method) retourne `true`
* un objet fichier **validé** a un fichier associé qui est _persisté_ dans le [stockage](#stockages-de-fichiers) sous-jacent : dans ce cas, sa méthode [`#committed?`](pathname:///api/dev/Marten/DB/Field/File/File.html#committed%3F%3ABool-instance-method) retourne `true`

Par exemple :

```crystal
attachment = Attachment.last!
attachment.uploaded_file.attached?  # => true
attachment.uploaded_file.committed? # => true
```

### Accéder aux propriétés du fichier

Les objets fichier donnent accès aux propriétés de base du fichier via les méthodes suivantes :

| Méthode | Description |
| ----------- | ----------- |
| `#file` | Retourne l'objet fichier associé / « encapsulé ». Il peut s'agir d'un véritable objet [`File`](https://crystal-lang.org/api/File.html), d'un fichier téléversé (instance de [`Marten::HTTP::UploadedFile`](pathname:///api/dev/Marten/HTTP/UploadedFile.html)), ou `nil` si aucun fichier n'est encore associé. |
| `#name` | Retourne le nom du fichier. |
| `#size` | Retourne la taille du fichier, en utilisant le [stockage](#stockages-de-fichiers) associé. |
| `#url` | Retourne l'URL du fichier, en utilisant le [stockage](#stockages-de-fichiers) associé. |

### Accéder au contenu du fichier sous-jacent

Les objets fichier vous permettent d'accéder au contenu du fichier sous-jacent via la méthode [`#open`](pathname:///api/dev/Marten/DB/Field/File/File.html#open%3AIO-instance-method). Cette méthode retourne un objet [`IO`](https://crystal-lang.org/api/IO.html).

Par exemple :

```crystal
attachment = Attachment.last!
file_io = attachment.uploaded_file.open
puts file_io.gets_to_end
```

### Mettre à jour le fichier attaché

Il est possible de mettre à jour le fichier réel d'un « objet fichier » en utilisant la méthode [`#save`](pathname:///api/dev/Marten/DB/Field/File/File.html#save(filepath%3A%3A%3AString%2Ccontent%3AIO%2Csave%3Dfalse)%3ANil-instance-method). Cette méthode permet de sauvegarder le contenu d'un objet [`IO`](https://crystal-lang.org/api/IO.html) spécifié et de l'associer à un chemin de fichier spécifique dans le [stockage](#stockages-de-fichiers) sous-jacent.

Par exemple :

```crystal
attachment = Attachment.new

File.open("test.txt") do |file|
  attachment.uploaded_file.save("path/to/test.txt", file)
  attachment.save!
end

attachment.uploaded_file.url # => "/media/path/to/test.txt"
```

### Supprimer le fichier attaché

Il est également possible de « supprimer » manuellement le fichier associé à l'« objet fichier ». Pour ce faire, la méthode [`#delete`](pathname:///api/dev/Marten/DB/Field/File/File.html#delete(save%3Dfalse)%3ANil-instance-method) peut être utilisée. Il est à noter que l'appel de cette méthode supprimera l'association entre l'enregistrement de modèle et le fichier ET supprimera également le fichier dans le [stockage](#stockages-de-fichiers) considéré.

Par exemple :

```crystal
attachment = Attachment.last!
attachment.uploaded_file.delete
attachment.uploaded_file.attached?  # => false
attachment.uploaded_file.committed? # => false
```

## Stockages de fichiers

Marten utilise un mécanisme de stockage de fichiers pour effectuer les opérations sur les fichiers comme la sauvegarde, la suppression, la génération d'URL, etc. Ce mécanisme de stockage de fichiers permet de sauvegarder les fichiers dans différents backends en utilisant une API standardisée (par exemple dans le système de fichiers local, dans un bucket cloud, etc.).

Par défaut, les champs de modèle [`file`](../models-and-databases/reference/fields.md#file) utilisent le stockage « media » configuré. Ce stockage utilise les paramètres [`settings.media_files`](../development/reference/settings.md#media-files-settings) pour déterminer quel backend de stockage utiliser, et où persister les fichiers. Par défaut, le stockage media utilise le backend de stockage [`Marten::Core::Store::FileSystem`](pathname:///api/dev/Marten/Core/Storage/FileSystem.html), qui garantit que les fichiers sont persistés dans le système de fichiers local, là où l'application Marten s'exécute.

Tous les stockages de fichiers disponibles sont listés dans la [référence des stockages de fichiers](./reference/stores.md).

### Interagir avec le stockage de fichiers media

Vous n'aurez généralement pas besoin d'interagir directement avec le stockage de fichiers, mais il convient de mentionner que les objets de stockage partagent la même API. En effet, la classe de ces objets de stockage doit hériter de la classe abstraite [`Marten::Core::Storage::Base`](pathname:///api/dev/Marten/Core/Storage/Base.html) et implémenter un ensemble de méthodes obligatoires qui fournissent les fonctionnalités suivantes :

* sauvegarder des fichiers ([`#save`](pathname:///api/dev/Marten/Core/Storage/Base.html#save(filepath%3AString%2Ccontent%3AIO)%3AString-instance-method))
* supprimer des fichiers ([`#delete`](pathname:///api/dev/Marten/Core/Storage/Base.html#delete(filepath%3AString)%3ANil-instance-method))
* ouvrir des fichiers ([`#open`](pathname:///api/dev/Marten/Core/Storage/Base.html#open(filepath%3AString)%3AIO-instance-method))
* vérifier que des fichiers existent ([`#exist?`](pathname:///api/dev/Marten/Core/Storage/Base.html#exists%3F(filepath%3AString)%3ABool-instance-method))
* récupérer les tailles de fichiers ([`#size`](pathname:///api/dev/Marten/Core/Storage/Base.html#size(filepath%3AString)%3AInt64-instance-method))
* récupérer les URL de fichiers ([`#url`](pathname:///api/dev/Marten/Core/Storage/Base.html#url(filepath%3AString)%3AString-instance-method))

Ces fonctionnalités sont illustrées dans l'exemple suivant, où le stockage media est utilisé pour interagir avec des fichiers :

```crystal
file = File.open("test.txt")
storage = Marten.media_files_storage

filepath = storage.save("test.txt", file)
storage.exists?(filepath)  # => true
storage.exists?("unknown") # => false
storage.size(filepath)     # => 13
storage.url(filepath)      # => "/media/test_c43ba020.txt"
storage.delete(filepath)   # => nil
storage.exists?(filepath)  # => false
```

Il est à noter que tout ce qui précède pourrait également être fait avec un stockage personnalisé initialisé manuellement :

```crystal
file = File.open("test.txt")
storage = Marten::Core::Storage::FileSystem.new(root: "/tmp", base_url: "/tmp")

filepath = storage.save("test.txt", file)
storage.exists?(filepath)  # => true
storage.exists?("unknown") # => false
storage.size(filepath)     # => 13
storage.url(filepath)      # => "/tmp/test.txt"
storage.delete(filepath)   # => nil
storage.exists?(filepath)  # => false
```

### Utiliser un stockage différent avec les modèles

Comme mentionné précédemment, les champs de modèle [`file`](../models-and-databases/reference/fields.md#file) utilisent le stockage « media » configuré par défaut. Cela dit, il est possible d'utiliser l'option `storage` pour utiliser un autre stockage si nécessaire.

Par exemple :

```crystal
custom_storage = Marten::Core::Storage::FileSystem.new(root: "/tmp", base_url: "/tmp")

class Attachment < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :uploaded_file, :file, blank: false, null: false, storage: custom_storage
end
```

Ce faisant, toutes les opérations sur les fichiers seront effectuées en utilisant le stockage configuré au lieu du stockage media par défaut.

## Servir les fichiers téléversés pendant le développement

Marten fournit un handler que vous pouvez utiliser pour servir les fichiers media uniquement dans les environnements de développement. Ce handler ([`Marten::Handlers::Defaults::Development::ServeMediaFile`](pathname:///api/dev/Marten/Handlers/Defaults/Development/ServeMediaFile.html)) est automatiquement associé à une route lors de la création de nouveaux projets via l'utilisation de la commande de gestion [`new`](../development/reference/management-commands.md#new) :

```crystal
Marten.routes.draw do
  # Other routes...

  if Marten.env.development?
    path "#{Marten.settings.media_files.url}<path:path>", Marten::Handlers::Defaults::Development::ServeMediaFile, name: "media_file"
  end
end
```

Comme vous pouvez le voir, cette route utilisera automatiquement l'URL configurée dans le paramètre de fichiers media [`url`](../development/reference/settings.md#url-1). Par exemple, cela signifie qu'un fichier media `foo/bar.txt` serait servi par la route `/media/foo/bar.txt` en développement si le paramètre [`url`](../development/reference/settings.md#url-1) est défini à `/media/`.

:::warning
Il est très important de comprendre que ce handler ne devrait être utilisé **que** dans les environnements de développement. En effet, le handler [`Marten::Handlers::Defaults::Development::ServeMediaFile`](pathname:///api/dev/Marten/Handlers/Defaults/Development/ServeMediaFile.html) n'est pas adapté aux environnements de production car il n'est pas vraiment efficace ni sécurisé. Une meilleure façon de servir les fichiers téléversés est d'utiliser un serveur web ou un bucket cloud par exemple (en fonction du stockage de fichiers media configuré).
:::
