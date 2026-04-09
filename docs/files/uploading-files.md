---
title: Téléverser des fichiers
description: Apprenez à téléverser des fichiers.
sidebar_label: Téléverser des fichiers
---

Marten vous donne la possibilité d'interagir avec les fichiers téléversés. Ces fichiers sont rendus disponibles avec chaque objet de requête HTTP, et il est également possible de les valider en utilisant des schemas. Le document suivant explique comment attendre et manipuler les fichiers téléversés, et quelles sont leurs caractéristiques associées.

## Accéder aux fichiers téléversés

Les fichiers téléversés sont rendus disponibles dans l'objet de type hash [`#data`](pathname:///api/dev/Marten/HTTP/Request.html#data%3AParams%3A%3AData-instance-method) de tout objet de requête HTTP (instance de [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html)). Ces objets fichier sont des instances de la classe [`Marten::HTTP::UploadedFile`](pathname:///api/dev/Marten/HTTP/UploadedFile.html).

Par exemple, vous pourriez accéder et traiter un fichier `uploaded_file` provenant d'un formulaire HTML en utilisant un handler comme celui-ci :

```crystal
class ProcessUploadedFileHandler < Marten::Handler
  def post
    file = request.data["uploaded_file"].as(Marten::HTTP::UploadedFile)
    respond "Processed file: #{file.filename}"
  end
end
```

Les objets [`Marten::HTTP::UploadedFile`](pathname:///api/dev/Marten/HTTP/UploadedFile.html) vous donnent accès aux méthodes clés suivantes, qui vous permettent d'interagir avec le fichier téléversé et son contenu :

* `#filename` retourne le nom du fichier téléversé
* `#size` retourne la taille du fichier téléversé
* `#io` retourne un objet [`IO`](https://crystal-lang.org/api/IO.html) classique permettant de lire le contenu du fichier et d'interagir avec lui

:::info Où sont stockés les fichiers téléversés ?
Tous les fichiers téléversés sont automatiquement persistés dans un fichier temporaire dans le répertoire temporaire du système (généralement cela correspond au dossier `/tmp`).
:::

## Attendre des fichiers téléversés avec les schemas

Si vous utilisez des [schemas](../schemas/introduction.md) pour valider les données d'entrée (telles que les données de formulaire), il est intéressant de noter que vous pouvez explicitement définir que vous attendez des fichiers dans les données validées. La façon la plus simple de faire cela est d'utiliser le champ de schema [`file`](../schemas/reference/fields.md#file) ou [`image`](../schemas/reference/fields.md#image).

Par exemple, vous pourriez définir le schema suivant :

```crystal
class UploadFileSchema < Marten::Schema
  field :uploaded_file, :file
end
```

Et l'utiliser dans un [handler générique de schema](../handlers-and-http/reference/generic-handlers.md#processing-a-schema) classique comme ceci :

```crystal
class UploadFileHandler < Marten::Handlers::Schema
  schema UploadFileSchema
  template_name "upload_file.html"
  success_url "/"

  def process_valid_schema
    file = schema.validated_data["uploaded_file"]
    # Do something with the uploaded file...

    super
  end
end
```

La présence/absence du fichier (et - optionnellement - certains de ses attributs) sera validée conformément à la définition du schema lorsque les requêtes `POST` seront traitées par le handler.

## Persister les fichiers téléversés dans les enregistrements de modèle

Les modèles peuvent définir des champs [`file`](../models-and-databases/reference/fields.md#file) ou [`image`](../models-and-databases/reference/fields.md#image) et persister des « références » de fichiers téléversés dans leurs lignes. Cela permet de « conserver » des fichiers téléversés spécifiques et d'associer leurs références à des enregistrements de modèle spécifiques.

Par exemple, nous pourrions modifier le handler de la section précédente pour qu'il persiste et associe le fichier téléversé à un nouvel enregistrement `Attachment` comme suit :

```crystal
class UploadFileHandler < Marten::Handlers::Schema
  schema UploadFileSchema
  template_name "upload_file.html"
  success_url "/"

  def process_valid_schema
    file = schema.validated_data["uploaded_file"]
    // highlight-next-line
    Attachment.create!(uploaded_file: file)

    super
  end
end
```

Ici, le `UploadFileHandler` hérite du handler générique [`Marten::Handlers::Schema`](pathname:///api/dev/Marten/Handlers/Schema.html). Il serait également pertinent d'utiliser le handler générique [`Marten::Handlers::RecordCreate`](pathname:///api/dev/Marten/Handlers/RecordCreate.html) pour traiter le schema et créer l'enregistrement `Attachment` en même temps.
