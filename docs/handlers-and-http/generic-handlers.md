---
title: Handlers génériques
description: Apprenez à exploiter les handlers génériques pour effectuer des tâches courantes.
sidebar_label: Handlers génériques
---

Marten inclut un ensemble de handlers génériques qui peuvent être exploités pour effectuer des tâches courantes. Ces tâches sont fréquemment rencontrées lors du développement d'applications web. Par exemple : afficher une liste d'enregistrements extraits de la base de données, ou supprimer un enregistrement. Les handlers génériques prennent en charge ces patterns courants afin que les développeurs n'aient pas à réinventer la roue.

## Portée

Marten fournit des handlers génériques permettant d'effectuer les actions suivantes :

* rediriger vers une URL spécifique
* effectuer le rendu d'un [template](../templates.mdx) existant
* traiter un [schéma](../schemas.mdx)
* lister, afficher, créer, mettre à jour ou supprimer des [enregistrements de modèles](../models-and-databases.mdx)

Quelques-uns de ces handlers génériques sont décrits ci-dessous (et tous sont listés dans la [référence dédiée](./reference/generic-handlers.md)). Chacune de ces classes de handler doit être sous-classée sur la base de chaque projet pour définir les « attributs » requis, et éventuellement pour redéfinir des méthodes afin de personnaliser des éléments comme les objets exposés dans les contextes de template. En faisant cela, vous définissez essentiellement des handlers qui héritent de ces patterns courants, sans avoir à les réimplémenter.

Enfin, il convient de noter que l'utilisation des handlers génériques est totalement optionnelle. Ils fournissent un bon point de départ pour implémenter des cas d'utilisation fréquemment rencontrés, mais vous pouvez décider de concevoir votre propre ensemble de handlers génériques pour répondre aux besoins de votre projet si ceux intégrés ne correspondent pas à vos exigences.

## Quelques exemples

### Effectuer une redirection

Avoir un handler qui effectue une redirection peut être facilement réalisé en sous-classant le handler générique [`Marten::Handlers::Redirect`](pathname:///api/dev/Marten/Handlers/Redirect.html). Par exemple, vous pourriez facilement définir un handler qui redirige vers une route `articles:list` avec l'extrait suivant :

```crystal
class ArticlesRedirectHandler < Marten::Handlers::Redirect
  route_name "articles:list"
end
```

Le handler ci-dessus effectuera une résolution inversée de `articles:list` pour obtenir l'URL correspondante et retournera une réponse HTTP 302 (redirection temporaire).

Les sous-classes de ce handler générique peuvent également rediriger vers une URL simple et décider de retourner une redirection permanente (301) au lieu d'une temporaire, par exemple :

```crystal
class TestRedirectHandler < Marten::Handlers::Redirect
  url "https://example.com"
  permanent true
end
```

Enfin, vous pouvez même implémenter votre propre logique pour calculer l'URL de redirection en redéfinissant la méthode `#redirect_url` :

```crystal
class ArticleRedirectHandler < Marten::Handlers::Redirect
  def redirect_url
    article = Article.get(id: params["pk"])
    if article.published?
      reverse("articles:detail", pk: article.id)
    else
      reverse("articles:list")
    end
  end
end
```

### Rendu d'un template

L'une des choses les plus fréquentes que vous voudrez faire lors de l'écriture de handlers est de retourner des réponses HTML contenant des [templates](../templates.mdx) rendus. Pour ce faire, vous pouvez évidemment définir un handler classique et utiliser la méthode d'aide [`#render`](./introduction.md#render). Mais vous pouvez également vouloir exploiter le handler générique [`Marten::Handlers::Template`](pathname:///api/dev/Marten/Handlers/Template.html).

Ce handler générique retournera une réponse HTTP 200 OK contenant un template HTML rendu. Pour l'utiliser, vous pouvez simplement définir une sous-classe et vous assurer d'appeler la méthode de classe `#template_name` pour définir le template qui sera rendu :

```crystal
class HomeHandler < Marten::Handlers::Template
  template_name "app/home.html"
end
```

Si nécessaire, il est possible de personnaliser le contexte utilisé pour le rendu du template configuré. Pour ce faire, vous pouvez définir un callback [`before_render`](./callbacks.md#before_render) et ajouter de nouvelles variables au [contexte de template global](./introduction.md#contexte-de-template-global) (qui fonctionne de manière similaire à un objet hash) :

```crystal
class HomeHandler < Marten::Handlers::Template
  template_name "app/home.html"

  before_render add_recent_articles_to_context

  private def add_recent_articles_to_context : Nil
    context[:recent_articles] = Article.all.order("-published_at")[:5]
  end
end
```

Les variables ajoutées au contexte de template global seront automatiquement disponibles au runtime du template configuré.

### Afficher un enregistrement de modèle

Il est possible d'effectuer le rendu d'un template qui présente un enregistrement de modèle spécifique en exploitant le handler générique [`Marten::Handlers::RecordDetail`](pathname:///api/dev/Marten/Handlers/RecordDetail.html).

Par exemple, il serait possible d'effectuer le rendu d'un template `articles/detail.html` présentant un enregistrement de modèle `Article` spécifique avec le handler suivant :

```crystal
class ArticleDetailHandler < Marten::Handlers::RecordDetail
  model Article
  template_name "articles/detail.html"
end
```

En supposant que le chemin de route associé à ce handler est quelque chose comme `/articles/<pk:int>`, ce handler récupérera automatiquement le bon enregistrement `Article` en utilisant la clé primaire fournie dans le paramètre de route `pk`. Si l'enregistrement n'existe pas, une exception `Marten::HTTP::Errors::NotFound` sera levée (ce qui conduira à l'affichage de la page d'erreur « not found » par défaut à l'utilisateur), sinon le template configuré sera rendu (avec l'enregistrement `Article` exposé dans le contexte sous la clé `record`).

Par exemple, le template associé à ce handler pourrait ressembler à ceci :

```html
<ul>
  <li>Title: {{ record.title }}</li>
  <li>Created at: {{ record.created_at }}</li>
</ul>
```

### Traiter un formulaire

Il est possible d'utiliser le handler générique [`Marten::Handlers::Schema`](pathname:///api/dev/Marten/Handlers/Schema.html) pour traiter les données d'un formulaire avec un [schéma](../schemas.mdx).

Pour ce faire, il est nécessaire :

* de spécifier la classe de schéma à utiliser pour valider les données POST entrantes via la macro `#schema`
* de spécifier le template à rendre en utilisant la méthode de classe `#template_name` : ce template génèrera probablement un formulaire HTML
* de spécifier la route vers laquelle rediriger lorsque le schéma est valide via la méthode de classe `#success_route_name`

Par exemple :

```crystal
class MyFormHandler < Marten::Handlers::Schema
  schema MySchema
  template_name "app/my_form.html"
  success_route_name "home"

  def process_valid_schema
    # This method is called when the schema is valid.
    # You can decide to do something with the validated data...
    super
  end

  def process_invalid_schema
    # This method is called when the schema is invalid.
    super
  end
end
```

Par défaut, un tel handler effectuera le rendu du template configuré lorsque la requête entrante est un GET ou pour les requêtes POST si les données ne peuvent pas être validées en utilisant le schéma spécifié (dans ce cas, le template est censé utiliser le schéma invalide pour afficher un formulaire avec les champs en erreur). Le template spécifié peut accéder au schéma configuré via l'objet `schema` dans le contexte du template.

Si le schéma est valide, une redirection temporaire est émise en utilisant l'URL correspondant à la valeur de `#success_route_name` (bien qu'il convienne de noter que la manière de générer cette URL de succès peut être redéfinie en définissant une méthode `#success_url`). Par défaut, le handler ne fait rien lorsque le schéma traité est valide (hormis rediriger vers l'URL de succès).

:::tip
Les handlers utilisant le handler générique [`Marten::Handlers::Schema`](pathname:///api/dev/Marten/Handlers/Schema.html) peuvent exploiter des types supplémentaires de callbacks. Veuillez consulter [Callbacks de handler schema](./callbacks.md#callbacks-de-handler-schema) pour en savoir plus.
:::
