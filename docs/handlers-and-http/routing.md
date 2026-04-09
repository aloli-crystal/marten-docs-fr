---
title: Routage
description: Apprenez à associer les handlers aux routes.
sidebar_label: Routage
---

Marten vous donne la possibilité de concevoir vos URLs comme vous le souhaitez, en vous permettant d'associer facilement des routes à des [handlers](./introduction.md) spécifiques, et en vous laissant générer des chemins et des URLs depuis le code de votre application.

## Les bases

Pour accéder à un handler via un navigateur, il est nécessaire de l'associer à une route URL. Pour ce faire, des « cartes » de routes peuvent être utilisées pour définir les correspondances entre les chemins de route et les classes de handler existantes. Ces cartes de routes peuvent être aussi longues ou aussi courtes que nécessaire, mais il est généralement préférable de créer des sous-cartes de routes qui sont incluses dans la carte de routes principale.

La carte de routes principale se trouve généralement dans le fichier `config/routes.cr`. Par exemple, le contenu d'un tel fichier pourrait ressembler à ceci :

```crystal
Marten.routes.draw do
  path "/", HomeHandler, name: "home"
  path "/articles", ArticlesHandler, name: "articles"
  path "/articles/<pk:int>", ArticleDetailHandler, name: "article_detail"
end
```

Comme vous pouvez le voir, les routes sont définies en appelant une méthode `#path` qui nécessite trois arguments :

* le premier argument est le pattern de route, qui est une chaîne comme `/foo/bar` et qui peut contenir des [paramètres](#spécifier-les-paramètres-de-route) supplémentaires
* le deuxième argument est la classe de handler associée à la route spécifiée
* le dernier argument est le nom de la route, qui est un identifiant pouvant être utilisé ultérieurement dans votre code pour générer l'URL complète d'une route spécifique, et éventuellement y injecter des paramètres (voir [Résolutions inversées d'URL](#résolutions-inversées-durl))

:::tip
Il est possible d'associer plusieurs routes à la même classe de handler si nécessaire. Cela peut être utile si vous avez besoin de fournir des alias de route pour certains handlers par exemple.
:::

Ces routes sont évaluées et construites au moment de l'exécution, ce qui signifie que vous pouvez définir des routes conditionnelles si nécessaire. Par exemple, un handler de « débogage » (uniquement disponible dans un environnement de développement) pourrait être ajouté à la carte de routes ci-dessus avec l'ajout suivant :

```crystal
Marten.routes.draw do
  path "/", HomeHandler, name: "home"
  path "/articles", ArticlesHandler, name: "articles"
  path "/articles/<pk:int>", ArticleDetailHandler, name: "article_detail"

  // highlight-next-line
  if Marten.env.development?
    // highlight-next-line
    path "/debug", DebugHandler, name: "debug"
  // highlight-next-line
  end
end
```

Lorsqu'une URL est demandée, Marten parcourt toutes les routes définies pour identifier une correspondance. Le handler associé à cette route sera initialisé à partir des paramètres de route (s'il y en a) et l'objet handler sera utilisé pour répondre à la requête considérée.

Il convient de noter que si aucune route ne correspond à une URL spécifique, Marten retournera automatiquement une réponse 404 Not Found, en utilisant un [handler d'erreur](./error-handlers.md) configurable.

## Spécifier les paramètres de route

Comme mis en évidence dans les exemples précédents, les paramètres de route peuvent être définis en utilisant des chevrons. Chaque paramètre de route doit définir un nom obligatoire et un type optionnel en utilisant les syntaxes suivantes :

* `<name>`
* `<name:type>`

Lorsqu'aucun type n'est spécifié pour un paramètre, toute chaîne de caractères excluant le caractère barre oblique (**`/`**) sera acceptée.

Les types de paramètres de route suivants sont disponibles :

| Type | Description |
| ----------- | ----------- |
| `str` ou `string` | Correspond à toute chaîne non vide (excluant le caractère barre oblique **`/`**). C'est le type de paramètre par défaut utilisé pour les paramètres non typés (par ex. `<myparam>`). |
| `int` | Correspond à zéro ou tout entier positif. Les valeurs de ces paramètres sont toujours désérialisées en objets `UInt64`. |
| `path` | Correspond à toute chaîne non vide incluant les caractères barre oblique (**`/`**). Par exemple `foo/bar/xyz` pourrait être accepté par ce type de paramètre. |
| `slug` | Correspond à toute chaîne contenant uniquement des lettres ASCII, des chiffres, des tirets et des caractères de soulignement. Par exemple `my-first-project-01` pourrait être accepté par ce type de paramètre. |
| `uuid` | Correspond à une chaîne UUID valide. Les valeurs de ces paramètres sont toujours désérialisées en objets `UUID`. |

Il convient de noter qu'il est possible d'enregistrer des implémentations de paramètres de route personnalisés si nécessaire. Consultez [Créer des paramètres de route personnalisés](./how-to/create-custom-route-parameters.md) pour en savoir plus sur cette fonctionnalité.

## Définir des routes incluses

La carte de routes principale (qui se trouve généralement dans le fichier `config/routes.cr`) n'a pas besoin d'être une définition « plate » de toutes les routes disponibles. En effet, vous pouvez définir des sous-cartes de routes si nécessaire et les « inclure » dans votre carte de routes principale.

Cette fonctionnalité peut être extrêmement utile pour « inclure » un ensemble de routes depuis une application installée (une bibliothèque tierce ou l'une de vos applications intégrées au projet). Cela permet également de mieux organiser les espaces de noms de routes et de regrouper un ensemble de routes connexes sous un préfixe similaire.

Par exemple, une carte de routes principale et une carte de routes d'articles pourraient être définies comme suit :

```crystal
ARTICLE_ROUTES = Marten::Routing::Map.draw do
  path "", ArticlesHandler, name: "list"
  path "/create", ArticleCreateHandler, name: "create"
  path "/<pk:int>", ArticleDetailHandler, name: "detail"
  path "/<pk:int>/update", ArticleUpdateHandler, name: "update"
  path "/<pk:int>/delete", ArticleDeleteHandler, name: "delete"
end

Marten.routes.draw do
  path "/", HomeHandler, name: "home"
  path "/articles", ARTICLE_ROUTES, name: "articles"
end
```

Dans l'exemple ci-dessus, les URLs suivantes seraient générées par Marten en plus de l'URL racine :

| URL | Handler | Nom |
| --- | ---- | ---- |
| `/articles` | `ArticlesHandler` | `articles:list` |
| `/articles/create` | `ArticleCreateHandler` | `articles:create` |
| `/articles/<pk:int>` | `ArticleDetailHandler` | `articles:detail` |
| `/articles/<pk:int>/update` | `ArticleUpdateHandler` | `articles:update` |
| `/articles/<pk:int>/delete` | `ArticleDeleteHandler` | `articles:delete` |

Comme vous pouvez le voir, les URLs et les noms de routes finissent par être préfixés respectivement avec le chemin et le nom spécifiés dans la route d'inclusion.

:::info
Le paramètre `name` pour les routes incluses est optionnel, c'est-à-dire que `path "/articles", ARTICLE_ROUTES` est également valide. Veuillez noter que cela augmentera la possibilité d'une collision de noms et il est donc conseillé de préfixer les chemins individuels de la route incluse, par ex. `article_list`, `article_create`, etc.

```crystal
ARTICLE_ROUTES = Marten::Routing::Map.draw do
  path "/", ArticlesHandler, name: "article_list"
  path "/create", ArticlesCreateHandler, name: "article_create"
end

Marten.routes.draw do
  path "/articles", ARTICLE_ROUTES
end
```

Cet exemple générera les URLs suivantes :

| URL | Handler | Nom |
| --- | ------- | ---- |
| `/articles` | `ArticlesHandler` | `articles_list` |
| `/articles/create` | `ArticlesCreateHandler` | `articles_create` |

Il est également possible d'ajouter un espace de noms à la route incluse au niveau de la carte :

```crystal
ARTICLE_ROUTES = Marten::Routing::Map.draw(:article) do
  path "/", ArticlesHandler, name: "list"
end

Marten.routes.draw do
  path "/articles", ARTICLE_ROUTES # Note: providing the name parameter overrides the namespace
end
```

Cet exemple générera les URLs suivantes :

| URL | Handler | Nom |
| --- | ------- | ---- |
| `/articles` | `ArticlesHandler` | `articles:list` |
:::

Notez que la sous-carte de routes n'a pas besoin de résider dans le fichier `config/routes.cr` : elle peut techniquement se trouver n'importe où dans votre base de code. La manière idéale de définir la carte de routes d'une application spécifique serait de la placer dans un fichier `routes.cr` dans le répertoire de l'application.

Lorsque Marten rencontre un chemin menant à une autre sous-carte de routes, il découpe la partie de l'URL qui a été reconnue jusqu'à ce point puis transmet le reste à la sous-carte de routes pour voir si elle est reconnue par l'une des routes sous-jacentes.

## Résolutions inversées d'URL

Lorsque l'on travaille avec des applications web, un besoin fréquent est de générer les URLs dans leur forme finale. Pour ce faire, vous voudrez éviter de coder en dur les URLs et plutôt exploiter la capacité de les générer à partir de leurs noms associés : c'est ce que nous appelons une résolution inversée d'URL.

« Inverser » une URL est aussi simple que d'appeler la méthode [`Marten::Routing::Map#reverse`](pathname:///api/dev/Marten/Routing/Map.html#reverse(name%3AString|Symbol%2Cparams%3AHash(String|Symbol%2CParameter%3A%3ATypes))-instance-method) depuis la carte de routes principale, accessible via la méthode [`Marten#routes`](pathname:///api/dev/Marten.html#routes-class-method) :

```crystal
Marten.routes.reverse("home") # will return "/"
```

Pour inverser une URL depuis une classe de handler, vous pouvez simplement exploiter la méthode de handler [`Marten::Handlers::Base#reverse`](pathname:///api/dev/Marten/Handlers/Base.html#reverse(*args%2C**options)-instance-method) :

```crystal
class MyHandler < Marten::Handler
  def post
    redirect(reverse("home"))
  end
end
```

Comme souligné précédemment, certaines routes nécessitent un ou plusieurs paramètres et pour inverser ces URLs, vous pouvez simplement spécifier ces paramètres comme arguments lors de l'appel à `#reverse` :

```crystal
Marten.routes.reverse("article_detail", pk: 42) # will return "/articles/42"
```

Enfin, il convient de noter que les espaces de noms créés lors de la définition de [routes incluses](#définir-des-routes-incluses) s'appliquent également lors de l'inversion des URLs correspondantes. Par exemple, le nom permettant d'inverser l'URL associée à `ArticleUpdateHandler` dans l'extrait précédent serait `articles:update` :

```crystal
Marten.routes.reverse("articles:update", pk: 42) # will return "/articles/42/update"
```

## Localisation

Les routes peuvent être localisées pour répondre aux besoins des projets multi-langues. Veuillez vous référer à [Routes localisées](../i18n/localized-routes.md) pour en savoir plus sur cette fonctionnalité.
