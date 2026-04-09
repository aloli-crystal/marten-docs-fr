---
title: Routes localisées
description: Apprenez à définir des routes localisées.
---

Marten permet l'internationalisation des routes à travers deux mécanismes : l'ajout automatique de préfixes de locale à vos routes et l'activation de la locale appropriée en fonction du préfixe, et la traduction des routes elles-mêmes pour offrir une expérience multilingue transparente. Ces mécanismes peuvent être utilisés indépendamment ou en combinaison.

## Prérequis

Les fonctionnalités décrites ci-dessous nécessitent que la locale correcte soit automatiquement activée pour chaque utilisateur lors du traitement des requêtes entrantes. Pour y parvenir, vous devez soit utiliser le [middleware I18n](../handlers-and-http/reference/middlewares.md#i18n-middleware) soit implémenter votre [propre middleware](../handlers-and-http/middlewares.md#how-middlewares-work) qui active la locale appropriée en fonction d'une logique personnalisée (ex. basée sur des domaines spécifiques).

## Préfixer les routes avec des locales

Le préfixage des routes avec des locales permet d'activer des locales spécifiques en fonction des chemins de routes accédés lorsque le [middleware I18n](../handlers-and-http/reference/middlewares.md#i18n-middleware) est utilisé.

La définition de routes localisées implique d'encapsuler les définitions de chemins de route par un appel à la méthode [`#localized`](https://martenframework.com/docs/api/dev/Marten/Routing/Map.html#localized(prefix_default_locale%3Dtrue%2C%26)%3ANil-instance-method). Lorsque de telles routes sont définies, la locale actuelle sera automatiquement préfixée au chemin des routes localisées et la carte de routes sera capable de résoudre les chemins de manière consciente de la locale.

Par exemple :

```crystal
ARTICLE_ROUTES = Marten::Routing::Map.draw do
  path "", ArticlesHandler, name: "list"
  path "/create", ArticleCreateHandler, name: "create"
  path "/<pk:int>", ArticleDetailHandler, name: "detail"
  path "/<pk:int>/update", ArticleUpdateHandler, name: "update"
  path "/<pk:int>/delete", ArticleDeleteHandler, name: "delete"
end

Marten.routes.draw do
  localized do
    path "/landing", LandingPageHandler, name: "landing"
    path "/articles", ARTICLE_ROUTES, name: "articles"
  end
end
```

Après avoir défini ces routes, Marten préfixe automatiquement le préfixe de locale aux chemins de toutes les routes incluses dans le bloc de la méthode [`#localized`](https://martenframework.com/docs/api/dev/Marten/Routing/Map.html#localized(prefix_default_locale%3Dtrue%2C%26)%3ANil-instance-method).

```crystal
I18n.activate("en")
Marten.routes.reverse("landing")         # => "/en/landing"
Marten.routes.reverse("articles:create") # => "/en/articles/create"
```

:::tip
Vous pouvez choisir de ne pas préfixer les routes pour la [locale par défaut](../development/reference/settings.md#default_locale). Pour y parvenir, définissez l'argument `prefix_default_locale` sur `false` lors de la définition du bloc `#localized` :

```crystal
Marten.routes.draw do
  localized(prefix_default_locale: false) do
    path "/landing", LandingPageHandler, name: "landing"
    path "/articles", ARTICLE_ROUTES, name: "articles"
  end
end
```
:::

:::warning
La méthode `#localized` ne peut être utilisée que dans votre carte de routes racine, définie dans le fichier `config/routes.cr` de votre projet. De plus, un seul bloc `#localized` est autorisé par projet. Le non-respect de ces exigences entraînera une exception `Marten::Routing::Errors::InvalidRouteMap`.
:::

## Traduire les chemins de routes

Vous pouvez traduire les chemins de routes qu'ils utilisent ou non des [préfixes de locale](#préfixer-les-routes-avec-des-locales). En effet, il est possible de définir des routes dont les chemins référencent des clés de traduction spécifiques qui correspondent à des traductions prédéfinies (traductions qui stockent les chemins de routes réels pour chaque locale).

Pour ce faire, au lieu de spécifier les chemins de vos routes comme des chaînes régulières, vous devez utiliser la méthode [`#t`](https://martenframework.com/docs/api/dev/Marten/Routing/Map.html#t(path%3AString)%3ATranslatedPath-instance-method) pour spécifier une clé de traduction qui sera dynamiquement utilisée pour générer le chemin d'une route pour une locale donnée. Cette méthode prend un seul argument : la clé de traduction qui devrait être utilisée pour déterminer dynamiquement le chemin de la route considérée.

Par exemple, considérons le [fichier de traduction](./introduction.md#définir-des-traductions) suivant :

```yaml
en:
  routes:
    landing: "/landing"
    articles:
      list: ""
      create: "/create"
      detail: "/<pk:int>"
      update: "/<pk:int>/update"
      delete: "/<pk:int>/delete"
fr:
  routes:
    landing: "/accueil"
    articles:
      prefix: "/articles"
      list: ""
      create: "/creer"
      detail: "/<pk:int>"
      update: "/<pk:int>/mettre-a-jour"
      delete: "/<pk:int>/supprimer"
```

Comme vous pouvez le voir, les traductions de chemins de routes peuvent contenir des [paramètres de route](../handlers-and-http/routing.md#specifying-route-parameters). En considérant ces traductions, nous pourrions définir la carte de routes suivante :

```crystal
ARTICLE_ROUTES = Marten::Routing::Map.draw do
  path t("routes.articles.list"), ArticlesHandler, name: "list"
  path t("routes.articles.create"), ArticleCreateHandler, name: "create"
  path t("routes.articles.detail"), ArticleDetailHandler, name: "detail"
  path t("routes.articles.update"), ArticleUpdateHandler, name: "update"
  path t("routes.articles.delete"), ArticleDeleteHandler, name: "delete"
end

Marten.routes.draw do
  path t("routes.landing"), LandingPageHandler, name: "landing"
  path t("routes.articles.prefix"), ARTICLE_ROUTES, name: "articles"
end
```

:::warning
Lorsque vous utilisez des chemins traduits, l'intégralité du chemin **doit** être définie dans les fichiers de locale (y compris les [paramètres de route](../handlers-and-http/routing.md#specifying-route-parameters)). Ainsi, interpoler les valeurs de retour de la méthode [`#t`](https://martenframework.com/docs/api/dev/Marten/Routing/Map.html#t(path%3AString)%3ATranslatedPath-instance-method) n'est pas autorisé et entraînera des exceptions `Marten::Routing::Errors::InvalidRouteMap`. Par exemple, la route suivante n'est pas permise :

```crystal
  path "#{t("routes.articles.detail")}/<pk:int>", ArticleDetailHandler, name: "detail"
```
:::

Comme souligné ci-dessus, tous les chemins de ces routes seront dynamiquement déterminés en résolvant la clé de traduction correspondante pour la locale actuelle. Par exemple :

```crystal
I18n.activate("en")
Marten.routes.reverse("landing")         # => "/landing"
Marten.routes.reverse("articles:create") # => "/articles/create"

I18n.activate("fr")
Marten.routes.reverse("landing")         # => "/accueil"
Marten.routes.reverse("articles:create") # => "/articles/creer"
```

:::tip
Il est possible de combiner des chemins de routes traduits et des [préfixes de locale](#préfixer-les-routes-avec-des-locales). Cela permet de bénéficier de routes entièrement traduites qui sont préfixées par une locale qui est automatiquement activée par le [middleware I18n](../handlers-and-http/reference/middlewares.md#i18n-middleware) s'il est utilisé. Par exemple :

```crystal
ARTICLE_ROUTES = Marten::Routing::Map.draw do
  path t("routes.articles.list"), ArticlesHandler, name: "list"
  path t("routes.articles.create"), ArticleCreateHandler, name: "create"
  path t("routes.articles.detail"), ArticleDetailHandler, name: "detail"
  path t("routes.articles.update"), ArticleUpdateHandler, name: "update"
  path t("routes.articles.delete"), ArticleDeleteHandler, name: "delete"
end

Marten.routes.draw do
  localized do
    path t("routes.landing"), LandingPageHandler, name: "landing"
    path t("routes.articles.prefix"), ARTICLE_ROUTES, name: "articles"
  end
end

I18n.activate("en")
Marten.routes.reverse("landing")         # => "/en/landing"
Marten.routes.reverse("articles:create") # => "/en/articles/create"

I18n.activate("fr")
Marten.routes.reverse("landing")         # => "/fr/accueil"
Marten.routes.reverse("articles:create") # => "/fr/articles/creer"
```
:::

:::warning
Pour éviter les collisions potentielles entre les chemins de routes traduits et non traduits, il est généralement préférable de traduire les chemins de routes tout en [incorporant des préfixes de locale](#préfixer-les-routes-avec-des-locales). Cela garantit une distinction claire entre les différentes locales et minimise le risque de conflits.
:::
