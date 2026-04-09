---
title: Stockages de fichiers
description: Référence des stockages de fichiers.
---

## Stockages intégrés

### Stockage système de fichiers

Un stockage basique de système de fichiers qui stocke les fichiers localement.

Ce stockage de fichiers est implémenté dans la classe [`Marten::Core::Storage::FileSystem`](https://martenframework.com/docs/api/dev/Marten/Core/Storage/FileSystem.html). Il garantit que les fichiers sont persistés dans le système de fichiers local, là où l'application Marten s'exécute.

Par exemple :

```crystal
Marten.configure do |config|
  config.media_files.storage = Marten::Core::Storage::FileSystem.new(root: "media", base_url: "/media/")
end
```

## Autres stockages

Des shards de stockages de fichiers supplémentaires sont également maintenus sous l'égide du projet Marten ou par la communauté elle-même et peuvent être utilisés dans votre application en fonction de vos besoins spécifiques :

* [`marten-s3`](https://github.com/martenframework/marten-s3) fournit un stockage de fichiers [S3](https://aws.amazon.com/s3/)

:::info
N'hésitez pas à contribuer à cette page et à ajouter des liens vers vos shards si vous avez créé des stockages de fichiers qui ne sont pas listés ici !
:::
