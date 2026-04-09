---
title: Loaders de template
description: Référence des loaders de template.
---

Cette page fournit une référence pour tous les loaders de template disponibles qui peuvent être utilisés pour personnaliser la récupération des templates dans Marten.

## Loader FileSystem

**Classe** : [`Marten::Template::Loader::FileSystem`](pathname:///api/dev/Marten/Template/Loader/FileSystem.html)

Charge les templates directement depuis le système de fichiers.

Exemple d'initialisation :

```crystal
loader = Marten::Template::Loader::FileSystem.new("/path/to/templates")
```

## Loader AppDirs

**Classe** : [`Marten::Template::Loader::AppDirs`](pathname:///api/dev/Marten/Template/Loader/AppDirs.html)

Coordonne le chargement des templates depuis les répertoires des applications. S'appuie sur des instances de FileSystem.

Exemple d'initialisation :

```crystal
loader = Marten::Template::Loader::AppDirs.new
```

## Loader Cached

**Classe** : [`Marten::Template::Loader::Cached`](pathname:///api/dev/Marten/Template/Loader/Cached.html)

Fournit une couche de mise en cache pour les templates compilés. Peut encapsuler d'autres loaders pour optimiser la récupération.

Exemple d'initialisation :

```crystal
file_loader = Marten::Template::Loader::FileSystem.new("/path/to/templates")
loader = Marten::Template::Loader::Cached.new([file_loader] of Marten::Template::Loader::Base)
```
