---
title: Créer des stockages de fichiers personnalisés
description: Apprenez à créer des stockages de fichiers personnalisés.
---

Marten utilise un mécanisme de stockage de fichiers pour effectuer les opérations sur les fichiers comme la sauvegarde, la suppression, la génération d'URL, etc. Ce mécanisme de stockage de fichiers permet de sauvegarder les fichiers dans différents backends en utilisant une API standardisée. Vous pouvez exploiter cette fonctionnalité pour implémenter des stockages de fichiers personnalisés (que vous pouvez ensuite utiliser pour les [assets](../../assets/introduction.md) ou dans le cadre de [champs de modèle file](../uploading-files.md#persister-les-fichiers-téléversés-dans-les-enregistrements-de-modèle)).

## Implémentation basique d'un stockage de fichiers

Les stockages de fichiers sont implémentés comme des sous-classes de la classe abstraite [`Marten::Core::Storage::Base`](pathname:///api/dev/Marten/Core/Storage/Base.html). En tant que tels, ils doivent implémenter un ensemble de méthodes obligatoires qui fournissent les fonctionnalités suivantes :

* sauvegarder des fichiers ([`#save`](pathname:///api/dev/Marten/Core/Storage/Base.html#save(filepath%3AString%2Ccontent%3AIO)%3AString-instance-method))
* supprimer des fichiers ([`#delete`](pathname:///api/dev/Marten/Core/Storage/Base.html#delete(filepath%3AString)%3ANil-instance-method))
* ouvrir des fichiers ([`#open`](pathname:///api/dev/Marten/Core/Storage/Base.html#open(filepath%3AString)%3AIO-instance-method))
* vérifier que des fichiers existent ([`#exist?`](pathname:///api/dev/Marten/Core/Storage/Base.html#exists%3F(filepath%3AString)%3ABool-instance-method))
* récupérer les tailles de fichiers ([`#size`](pathname:///api/dev/Marten/Core/Storage/Base.html#size(filepath%3AString)%3AInt64-instance-method))
* récupérer les URL de fichiers ([`#url`](pathname:///api/dev/Marten/Core/Storage/Base.html#url(filepath%3AString)%3AString-instance-method))

Notez que vous pouvez entièrement personnaliser la façon dont les objets de stockage de fichiers sont initialisés.

Par exemple, un stockage « système de fichiers » fait maison (qui lit et écrit des fichiers dans un dossier spécifique du système de fichiers local) pourrait être implémenté comme suit :

```crystal
require "file_utils"

class FileSystem < Marten::Core::Storage::Base
  def initialize(@root : String, @base_url : String)
  end

  def delete(filepath : String) : Nil
    File.delete(path(filepath))
  rescue File::NotFoundError
    raise Marten::Core::Storage::Errors::FileNotFound.new("File '#{filepath}' cannot be found")
  end

  def exists?(filepath : String) : Bool
    File.exists?(path(filepath))
  end

  def open(filepath : String) : IO
    File.open(path(filepath), mode: "rb")
  rescue File::NotFoundError
    raise Marten::Core::Storage::Errors::FileNotFound.new("File '#{filepath}' cannot be found")
  end

  def size(filepath : String) : Int64
    File.size(path(filepath))
  end

  def url(filepath : String) : String
    File.join(base_url, URI.encode_path(filepath))
  end

  def write(filepath : String, content : IO) : Nil
    new_path = path(filepath)

    FileUtils.mkdir_p(Path[new_path].dirname)

    File.open(new_path, "wb") do |new_file|
      IO.copy(content, new_file)
    end
  end

  private getter root
  private getter base_url

  private def path(filepath)
    File.join(root, filepath)
  end
end
```

## Utiliser des stockages de fichiers personnalisés

Vous avez plusieurs options lorsqu'il s'agit d'utiliser vos classes de stockage de fichiers personnalisées, et celles-ci dépendent de ce que vous essayez de faire :

* si vous souhaitez utiliser un stockage personnalisé pour les [assets](../../assets/introduction.md), vous voudrez probablement assigner une instance de votre classe de stockage personnalisée au paramètre [`assets.storage`](../../development/reference/settings.md#storage) (voir [Stockage des assets](../../assets/introduction.md#stockage-des-assets) pour en savoir plus sur les stockages d'assets spécifiquement)
* si vous souhaitez utiliser un stockage personnalisé pour tous vos [champs de modèle file](../../models-and-databases/reference/fields.md#file), vous voudrez probablement assigner une instance de votre classe de stockage personnalisée au paramètre [`media_files.storage`](../../development/reference/settings.md#storage-1) (voir [Stockages de fichiers](../managing-files.md#stockages-de-fichiers) pour en savoir plus sur les stockages de fichiers spécifiquement)
