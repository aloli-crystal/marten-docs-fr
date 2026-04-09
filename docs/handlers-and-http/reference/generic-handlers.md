---
title: Handlers génériques
description: Référence des handlers génériques
---

Cette page fournit une référence pour tous les [handlers génériques](../generic-handlers.md) disponibles.

## Création d'un enregistrement

**Classe :** [`Marten::Handlers::RecordCreate`](pathname:///api/dev/Marten/Handlers/RecordCreate.html)

Handler permettant de créer un nouvel enregistrement de modèle en traitant un schéma.

Ce handler peut être utilisé pour traiter un formulaire, valider ses données via l'utilisation d'un [schéma](../../schemas.mdx), et créer un enregistrement en utilisant les données validées. Il est attendu que le handler sera accédé via une requête GET en premier : lorsque cela se produit, le template configuré est rendu et affiché, et le schéma configuré qui est initialisé peut être accédé depuis le contexte du template pour rendre un formulaire par exemple. Lorsque le formulaire est soumis via une requête POST, le schéma configuré est validé en utilisant les données du formulaire. Si les données sont valides, l'enregistrement de modèle correspondant est créé et le handler retourne une redirection HTTP vers une URL de succès configurée.

```crystal
class ArticleCreateHandler < Marten::Handlers::RecordCreate
  model Article
  schema ArticleCreateSchema
  template_name "articles/create.html"
  success_route_name "my_form_success"
end
```

Il convient de noter que la réponse de redirection émise sera un 302 (found).

La classe de modèle utilisée pour créer le nouvel enregistrement peut être configurée via la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordCreate.html#model(model_klass)-macro). Le schéma utilisé pour effectuer la validation peut être défini via la macro [`#schema`](pathname:///api/dev/Marten/Handlers/Schema.html#schema(schema_klass)-macro). Alternativement, la méthode [`#schema_class`](pathname:///api/dev/Marten/Handlers/Schema.html#schema_class-instance-method) peut également être redéfinie pour définir dynamiquement la classe de schéma dans le cadre du traitement du handler de requête.

La méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method) permet de définir le nom du template à utiliser pour rendre le schéma tandis que la méthode [`#success_route_name`](pathname:///api/dev/Marten/Handlers/Schema.html#success_route_name(success_route_name%3AString%3F)-class-method) peut être utilisée pour spécifier le nom d'une route vers laquelle rediriger une fois le schéma validé. Alternativement, la méthode de classe [`#success_url`](pathname:///api/dev/Marten/Handlers/Schema.html#success_url(success_url%3AString%3F)-class-method) peut être utilisée pour fournir une URL brute vers laquelle rediriger. La [même méthode](pathname:///api/dev/Marten/Handlers/Schema.html#success_url-instance-method) peut également être redéfinie au niveau de l'instance pour s'appuyer sur une logique personnalisée de génération de l'URL de succès vers laquelle rediriger.

Par exemple, si la logique de votre application nécessite une route de succès incluant un identifiant (comme la clé primaire d'un enregistrement), vous pouvez personnaliser l'URL de succès en redéfinissant la méthode `#success_url` comme ceci :

```crystal
def success_url
  reverse("articles:detail", pk: record.pk!) # record is an instance of the model you defined for your handler
end
```

:::tip
Les handlers utilisant le handler générique [`Marten::Handlers::RecordCreate`](pathname:///api/dev/Marten/Handlers/RecordCreate.html) peuvent exploiter des types supplémentaires de callbacks. Veuillez consulter [Callbacks de handler schema](../callbacks.md#callbacks-de-handler-schema) pour en savoir plus.
:::

## Suppression d'un enregistrement

**Classe :** [`Marten::Handlers::RecordDelete`](pathname:///api/dev/Marten/Handlers/RecordDelete.html)

Handler permettant de supprimer un enregistrement de modèle spécifique.

Ce handler peut être utilisé pour supprimer un enregistrement de modèle existant en émettant une requête POST. Optionnellement, le handler peut être accédé via une requête GET et un template peut être affiché dans ce cas ; cela permet d'afficher une page de confirmation aux utilisateurs avant de supprimer l'enregistrement :

```crystal
class ArticleDeleteHandler < Marten::Handlers::RecordDelete
  model Article
  template_name "articles/delete.html"
  success_route_name "article_delete_success"
end
```

Il convient de noter que la réponse de redirection émise sera un 302 (found).

La méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method) permet de définir le nom du template à utiliser pour rendre une page de confirmation de suppression tandis que la méthode [`#success_route_name`](pathname:///api/dev/Marten/Handlers/RecordDelete.html#success_route_name(success_route_name%3AString%3F)-class-method) peut être utilisée pour spécifier le nom d'une route vers laquelle rediriger une fois la suppression terminée. Alternativement, la méthode de classe [`#success_url`](pathname:///api/dev/Marten/Handlers/RecordDelete.html#success_url(success_url%3AString%3F)-class-method) peut être utilisée pour fournir une URL brute vers laquelle rediriger. La [même méthode](pathname:///api/dev/Marten/Handlers/RecordDelete.html#success_url-instance-method) peut également être redéfinie au niveau de l'instance pour s'appuyer sur une logique personnalisée de génération de l'URL de succès vers laquelle rediriger. Il est également possible de pré-filtrer le queryset avant de supprimer l'enregistrement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset(queryset)-macro).

:::tip Comment personnaliser le query set ?
Par défaut, les handlers qui héritent de [`Marten::Handlers::RecordDelete`](pathname:///api/dev/Marten/Handlers/RecordDelete.html) utiliseront un query set ciblant _tous_ les enregistrements pour récupérer l'enregistrement à supprimer. Il convient de noter que vous pouvez facilement personnaliser ce comportement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset(queryset)-macro) au lieu de la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#model(model_klass)-macro). Par exemple :

```crystal
class ArticleDeleteHandler < Marten::Handlers::RecordDelete
  queryset Article.filter(user: request.user)
  template_name "articles/delete.html"
  success_route_name "article_delete_success"
end
```

Alternativement, il est également possible de redéfinir la méthode [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset-instance-method) et d'appliquer des filtres supplémentaires au query set par défaut :

```crystal
class ArticleDeleteHandler < Marten::Handlers::RecordDelete
  model Article
  template_name "articles/delete.html"
  success_route_name "article_delete_success"

  def queryset
    super.filter(user: request.user)
  end
end
```
:::

## Affichage d'un enregistrement

**Classe :** [`Marten::Handlers::RecordDetail`](pathname:///api/dev/Marten/Handlers/RecordDetail.html)

Handler permettant d'afficher un enregistrement de modèle spécifique.

Ce handler peut être utilisé pour récupérer un enregistrement de [modèle](../../models-and-databases/introduction.md), et l'afficher dans le cadre d'un [template rendu](../../templates.mdx).

```crystal
class ArticleDetailHandler < Marten::Handlers::RecordDetail
  model Article
  template_name "articles/detail.html"
end
```

La classe de modèle utilisée pour récupérer l'enregistrement peut être configurée via la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#model(model_klass)-macro). Il est également possible de pré-filtrer le queryset avant de récupérer l'enregistrement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset(queryset)-macro). Par défaut, une sous-classe de [`Marten::Handlers::RecordDetail`](pathname:///api/dev/Marten/Handlers/RecordDetail.html) récupérera toujours les enregistrements de modèle en cherchant un paramètre de route `pk` : ce paramètre est supposé contenir la valeur du champ de clé primaire associé à l'enregistrement qui doit être rendu. Si vous devez utiliser un nom de paramètre de route différent, vous pouvez également en spécifier un autre via la méthode de classe [`#lookup_param`](pathname:///api/dev/Marten/Handlers/RecordRetrieving/ClassMethods.html#lookup_param(lookup_param%3AString|Symbol)-instance-method). Enfin, le champ de modèle utilisé pour obtenir l'enregistrement de modèle (par défaut `pk`) peut également être configuré en utilisant la méthode de classe [`#lookup_param`](pathname:///api/dev/Marten/Handlers/RecordRetrieving/ClassMethods.html#lookup_param(lookup_param%3AString|Symbol)-instance-method).

La méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method) permet de définir le nom du template à utiliser pour rendre l'enregistrement de modèle considéré. Par défaut, l'enregistrement de modèle est associé à une clé `record` dans le contexte du template, mais cela peut également être configuré en utilisant la méthode de classe [`record_context_name`](pathname:///api/dev/Marten/Handlers/RecordDetail.html#record_context_name(name%3AString|Symbol)-class-method).

:::tip Comment personnaliser le query set ?
Par défaut, les handlers qui héritent de [`Marten::Handlers::RecordDetail`](pathname:///api/dev/Marten/Handlers/RecordDetail.html) utiliseront un query set ciblant _tous_ les enregistrements pour récupérer l'enregistrement à afficher. Il convient de noter que vous pouvez facilement personnaliser ce comportement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset(queryset)-macro) au lieu de la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#model(model_klass)-macro). Par exemple :

```crystal
class ArticleDetailHandler < Marten::Handlers::RecordDetail
  queryset Article.filter(user: request.user)
  template_name "articles/detail.html"
end
```

Alternativement, il est également possible de redéfinir la méthode [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset-instance-method) et d'appliquer des filtres supplémentaires au query set par défaut :

```crystal
class ArticleDetailHandler < Marten::Handlers::RecordDetail
  model Article
  template_name "articles/detail.html"

  def queryset
    super.filter(user: request.user)
  end
end
```
:::

## Liste d'enregistrements

**Classe :** [`Marten::Handlers::RecordList`](pathname:///api/dev/Marten/Handlers/RecordList.html)

Handler permettant de lister des enregistrements de modèle.

Ce handler de base peut être utilisé pour exposer facilement une liste d'enregistrements de modèle :

```crystal
class ArticleListHandler < Marten::Handlers::RecordList
  model Article
  template_name "articles/index.html"
end
```

La classe de modèle utilisée pour récupérer les enregistrements peut être configurée via la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordListing.html#model(model_klass)-macro). L'[ordre](../../models-and-databases/reference/query-set.md#order) de ces enregistrements de modèle peut également être spécifié en utilisant la méthode de classe [`#ordering`](pathname:///api/dev/Marten/Handlers/RecordListing/ClassMethods.html#page_number_param(param%3AString|Symbol)-instance-method).

La méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method) permet de définir le nom du template à utiliser pour rendre la liste des enregistrements de modèle. Par défaut, la liste des enregistrements de modèle est associée à une clé `records` dans le contexte du template, mais cela peut également être configuré en utilisant la méthode de classe [`list_context_name`](pathname:///api/dev/Marten/Handlers/RecordList.html#list_context_name(name%3AString|Symbol)-class-method).

Optionnellement, il est possible de configurer la [pagination](../../models-and-databases/reference/query-set.md#paginator) des enregistrements en spécifiant une taille de page via la méthode de classe [`page_size`](pathname:///api/dev/Marten/Handlers/RecordListing/ClassMethods.html#page_size(page_size%3AInt32%3F)-instance-method) :

```crystal
class ArticleListHandler < Marten::Handlers::RecordList
  model Article
  template_name "articles/index.html"
  page_size 12
end
```

Lorsque les enregistrements sont paginés, un objet [`Marten::DB::Query::Page`](pathname:///api/dev/Marten/DB/Query/Page.html) sera exposé dans le contexte du template (au lieu du query set brut). Il convient de noter que le numéro de page à afficher est déterminé en cherchant un paramètre GET `page` par défaut ; ce nom de paramètre peut également être configuré en appelant la méthode de classe [`page_number_param`](pathname:///api/dev/Marten/Handlers/RecordListing/ClassMethods.html#page_number_param(param%3AString|Symbol)-instance-method).

:::tip Comment personnaliser le query set ?
Par défaut, les handlers qui héritent de [`Marten::Handlers::RecordList`](pathname:///api/dev/Marten/Handlers/RecordList.html) utiliseront un query set ciblant _tous_ les enregistrements du modèle spécifié. Il convient de noter que vous pouvez facilement personnaliser ce comportement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordListing.html#queryset(queryset)-macro) au lieu de la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordListing.html#model(model_klass)-macro). Par exemple :

```crystal
class ArticleListHandler < Marten::Handlers::RecordList
  queryset Article.filter(user: request.user)
  template_name "articles/index.html"
end
```

Alternativement, il est également possible de redéfinir la méthode [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordListing.html#queryset-instance-method) et d'appliquer des filtres supplémentaires au query set par défaut :

```crystal
class ArticleListHandler < Marten::Handlers::RecordList
  model Article
  template_name "articles/index.html"

  def queryset
    super.filter(user: request.user)
  end
end
```
:::

## Mise à jour d'un enregistrement {#updating-a-record}

**Classe :** [`Marten::Handlers::RecordUpdate`](pathname:///api/dev/Marten/Handlers/RecordUpdate.html)

Handler permettant de mettre à jour un enregistrement de modèle en traitant un schéma.

Ce handler peut être utilisé pour traiter un formulaire, valider ses données via l'utilisation d'un [schéma](../../schemas.mdx), et mettre à jour un enregistrement existant en utilisant les données validées. Il est attendu que le handler sera accédé via une requête GET en premier : lorsque cela se produit, le template configuré est rendu et affiché, et le schéma configuré qui est initialisé peut être accédé depuis le contexte du template pour rendre un formulaire par exemple. Lorsque le formulaire est soumis via une requête POST, le schéma configuré est validé en utilisant les données du formulaire. Si les données sont valides, l'enregistrement de modèle récupéré est mis à jour et le handler retourne une redirection HTTP vers une URL de succès configurée.

```crystal
class ArticleUpdateHandler < Marten::Handlers::RecordUpdate
  model Article
  schema ArticleUpdateSchema
  template_name "articles/update.html"
  success_route_name "my_form_success"
end
```

Il convient de noter que la réponse de redirection émise sera un 302 (found).

La classe de modèle utilisée pour mettre à jour le nouvel enregistrement peut être configurée via la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#model(model_klass)-macro). Il est également possible de pré-filtrer le queryset avant de mettre à jour l'enregistrement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset(queryset)-macro). Par défaut, l'enregistrement à mettre à jour est récupéré en attendant un paramètre de route `pk` : ce paramètre est supposé contenir la valeur du champ de clé primaire associé à l'enregistrement qui doit être mis à jour. Si vous devez utiliser un nom de paramètre de route différent, vous pouvez également en spécifier un autre via la méthode de classe [`#lookup_param`](pathname:///api/dev/Marten/Handlers/RecordRetrieving/ClassMethods.html#lookup_param(lookup_param%3AString|Symbol)-instance-method). Enfin, le champ de modèle utilisé pour obtenir l'enregistrement de modèle (par défaut `pk`) peut également être configuré en utilisant la méthode de classe [`#lookup_param`](pathname:///api/dev/Marten/Handlers/RecordRetrieving/ClassMethods.html#lookup_param(lookup_param%3AString|Symbol)-instance-method).

Le schéma utilisé pour effectuer la validation peut être défini via la macro [`#schema`](pathname:///api/dev/Marten/Handlers/Schema.html#schema(schema_klass)-macro). Alternativement, la méthode [`#schema_class`](pathname:///api/dev/Marten/Handlers/Schema.html#schema_class-instance-method) peut également être redéfinie pour définir dynamiquement la classe de schéma dans le cadre du traitement du handler de requête.

La méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method) permet de définir le nom du template à utiliser pour rendre le schéma tandis que la méthode [`#success_route_name`](pathname:///api/dev/Marten/Handlers/Schema.html#success_route_name(success_route_name%3AString%3F)-class-method) peut être utilisée pour spécifier le nom d'une route vers laquelle rediriger une fois le schéma validé. Alternativement, la méthode de classe [`#success_url`](pathname:///api/dev/Marten/Handlers/Schema.html#success_url(success_url%3AString%3F)-class-method) peut être utilisée pour fournir une URL brute vers laquelle rediriger. La [même méthode](pathname:///api/dev/Marten/Handlers/Schema.html#success_url-instance-method) peut également être redéfinie au niveau de l'instance pour s'appuyer sur une logique personnalisée de génération de l'URL de succès vers laquelle rediriger.

:::tip
Les handlers utilisant le handler générique [`Marten::Handlers::RecordUpdate`](pathname:///api/dev/Marten/Handlers/RecordUpdate.html) peuvent exploiter des types supplémentaires de callbacks. Veuillez consulter [Callbacks de handler schema](../callbacks.md#callbacks-de-handler-schema) pour en savoir plus.
:::

:::tip Comment personnaliser le query set ?
Par défaut, les handlers qui héritent de [`Marten::Handlers::RecordUpdate`](pathname:///api/dev/Marten/Handlers/RecordUpdate.html) utiliseront un query set ciblant _tous_ les enregistrements pour récupérer l'enregistrement à mettre à jour. Il convient de noter que vous pouvez facilement personnaliser ce comportement en utilisant la macro [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset(queryset)-macro) au lieu de la macro [`#model`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#model(model_klass)-macro). Par exemple :

```crystal
class ArticleUpdateHandler < Marten::Handlers::RecordUpdate
  queryset Article.filter(user: request.user)
  schema ArticleUpdateSchema
  template_name "articles/update.html"
  success_route_name "my_form_success"
end
```

Alternativement, il est également possible de redéfinir la méthode [`#queryset`](pathname:///api/dev/Marten/Handlers/RecordRetrieving.html#queryset-instance-method) et d'appliquer des filtres supplémentaires au query set par défaut :

```crystal
class ArticleUpdateHandler < Marten::Handlers::RecordUpdate
  model Article
  schema ArticleUpdateSchema
  template_name "articles/update.html"
  success_route_name "my_form_success"

  def queryset
    super.filter(user: request.user)
  end
end
```
:::


## Effectuer une redirection

**Classe :** [`Marten::Handlers::Redirect`](pathname:///api/dev/Marten/Handlers/Redirect.html)

Handler permettant de retourner facilement des réponses de redirection.

Ce handler peut être utilisé pour générer une réponse de redirection (temporaire ou permanente) vers un autre emplacement. Pour configurer un tel emplacement, vous pouvez soit utiliser la méthode de classe [`#route_name`](pathname:///api/dev/Marten/Handlers/Redirect.html#route_name(route_name%3AString%3F)-class-method) (qui attend un [nom de route](../routing.md#résolutions-inversées-durl) valide) soit la méthode de classe [`#url`](pathname:///api/dev/Marten/Handlers/Redirect.html#url(url%3AString%3F)-class-method). Si vous devez implémenter une logique d'URL de redirection personnalisée, vous pouvez également redéfinir la méthode [`#redirect_url`](pathname:///api/dev/Marten/Handlers/Redirect.html#redirect_url-instance-method).

```crystal
class TestRedirectHandler < Marten::Handlers::Redirect
  route_name "articles:list"
end
```

Par défaut, la redirection retournée par ce handler est temporaire. Pour générer une réponse de redirection permanente à la place, il est possible d'utiliser la méthode de classe [`#permanent`](pathname:///api/dev/Marten/Handlers/Redirect.html#permanent(permanent%3ABool)-class-method).

Il convient également de noter que par défaut, les paramètres de query string entrants **ne sont pas** transmis à l'URL de redirection. Si vous souhaitez vous assurer que ces paramètres sont transmis, vous pouvez utiliser la méthode de classe [`forward_query_string`](pathname:///api/dev/Marten/Handlers/Redirect.html#forward_query_string(forward_query_string%3ABool)-class-method).

## Traitement d'un schéma

**Classe :** [`Marten::Handlers::Schema`](pathname:///api/dev/Marten/Handlers/Schema.html)

Handler permettant de traiter un formulaire via l'utilisation d'un [schéma](../../schemas.mdx).

Ce handler peut être utilisé pour traiter un formulaire et valider ses données via l'utilisation d'un [schéma](../../schemas.mdx). Il est attendu que le handler sera accédé via une requête GET en premier : lorsque cela se produit, le template configuré est rendu et affiché, et le schéma configuré qui est initialisé peut être accédé depuis le contexte du template pour rendre un formulaire par exemple. Lorsque le formulaire est soumis via une requête POST, le schéma configuré est validé en utilisant les données du formulaire. Si les données sont valides, le handler retourne une redirection HTTP vers une URL de succès configurée.

```crystal
class MyFormHandler < Marten::Handlers::Schema
  schema MyFormSchema
  template_name "my_form.html"
  success_route_name "my_form_success"
end
```

Il convient de noter que la réponse de redirection émise sera un 302 (found).

Le schéma utilisé pour effectuer la validation peut être défini via la macro [`#schema`](pathname:///api/dev/Marten/Handlers/Schema.html#schema(schema_klass)-macro). Alternativement, la méthode [`#schema_class`](pathname:///api/dev/Marten/Handlers/Schema.html#schema_class-instance-method) peut également être redéfinie pour définir dynamiquement la classe de schéma dans le cadre du traitement du handler de requête.

La méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method) permet de définir le nom du template à utiliser pour rendre le schéma tandis que la méthode [`#success_route_name`](pathname:///api/dev/Marten/Handlers/Schema.html#success_route_name(success_route_name%3AString%3F)-class-method) peut être utilisée pour spécifier le nom d'une route vers laquelle rediriger une fois le schéma validé. Alternativement, la méthode de classe [`#success_url`](pathname:///api/dev/Marten/Handlers/Schema.html#success_url(success_url%3AString%3F)-class-method) peut être utilisée pour fournir une URL brute vers laquelle rediriger. La [même méthode](pathname:///api/dev/Marten/Handlers/Schema.html#success_url-instance-method) peut également être redéfinie au niveau de l'instance pour s'appuyer sur une logique personnalisée de génération de l'URL de succès vers laquelle rediriger.

:::tip
Les handlers utilisant le handler générique [`Marten::Handlers::Schema`](pathname:///api/dev/Marten/Handlers/Schema.html) peuvent exploiter des types supplémentaires de callbacks. Veuillez consulter [Callbacks de handler schema](../callbacks.md#callbacks-de-handler-schema) pour en savoir plus.
:::

## Rendu d'un template

**Classe :** [`Marten::Handlers::Template`](pathname:///api/dev/Marten/Handlers/Template.html)

Handler permettant de répondre aux requêtes `GET` avec le contenu d'un [template](../../templates.mdx) HTML rendu.

Ce handler peut être utilisé pour effectuer le rendu d'un template spécifique et retourner le contenu résultant dans la réponse. Le template à rendre peut être spécifié en utilisant la méthode de classe [`#template_name`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#template_name(template_name%3AString%3F)-instance-method).

```crystal
class HomeHandler < Marten::Handlers::Template
  template_name "app/home.html"
end
```

Si nécessaire, il est possible de personnaliser le contexte utilisé pour le rendu du template configuré. Pour ce faire, vous pouvez définir un callback [`before_render`](../callbacks.md#before_render) et ajouter de nouvelles variables au [contexte de template global](../introduction.md#contexte-de-template-global) (qui fonctionne de manière similaire à un objet hash) :

```crystal
class HomeHandler < Marten::Handlers::Template
  template_name "app/home.html"

  before_render :add_recent_articles_to_context

  private def add_recent_articles_to_context : Nil
    context[:recent_articles] = Article.all.order("-published_at")[:5]
  end
end
```

Les variables ajoutées au contexte de template global seront automatiquement disponibles au runtime du template configuré.

:::tip
Le type de contenu par défaut de la réponse générée lors du rendu de templates est `text/html`, mais cela peut être personnalisé en utilisant la méthode de classe [`#content_type`](pathname:///api/dev/Marten/Handlers/Rendering/ClassMethods.html#content_type(content_type%3AString|Nil)-instance-method). Par exemple :

```crystal
class MyHandler < Marten::Handlers::Template
  template_name "app/test.xml"
  content_type "application/xml"
end
```
:::
