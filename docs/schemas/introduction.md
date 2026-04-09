---
title: Introduction aux schemas
description: Apprenez à définir des schemas et à les utiliser dans les handlers.
sidebar_label: Introduction
---

Les schemas sont des classes qui définissent comment les données d'entrée doivent être sérialisées/désérialisées et validées. Les schemas sont généralement utilisés lors du traitement de requêtes web contenant des données de formulaire ou des charges utiles prédéfinies.

## Définition et utilisation de base des schemas

### La classe schema

Une classe schema décrit un ensemble _attendu_ de données. Elle décrit la structure logique de ces données, quelles sont les caractéristiques attendues, et quelles sont les règles à utiliser pour déterminer si elles sont valides ou non. Les classes schema doivent hériter de la classe de base [`Marten::Schema`](https://martenframework.com/docs/api/dev/Marten/Schema.html) et doivent définir des « champs » via l'utilisation d'une macro `field`. Ces champs permettent de définir quelles données sont attendues par le schema, et comment elles sont validées.

Par exemple, le fragment suivant définit un simple schema `ArticleSchema` :

```crystal
class ArticleSchema < Marten::Schema
  field :title, :string, max_size: 128
  field :content, :string
  field :published_at, :date_time, required: false
end
```

Dans l'exemple ci-dessus, `title`, `content` et `published_at` sont des champs du schema `ArticleSchema`. Ce schema est très simple, mais il définit déjà un ensemble de règles de validation qui pourraient être utilisées pour valider tout jeu de données auquel le schema est appliqué :

* le champ `title` est obligatoire, il doit être une chaîne de caractères ne dépassant pas 128 caractères
* le champ `content` est obligatoire et doit également être une chaîne de caractères
* le champ `published_at` est une date/heure qui n'est _pas_ obligatoire

### Utiliser les schemas

Les schemas peuvent théoriquement être utilisés pour traiter tout type de données, y compris les données d'une requête. Cela les rend idéaux pour le traitement des données de formulaires ou des charges utiles JSON par exemple.

Lorsqu'ils sont utilisés dans le cadre de [handlers](../handlers-and-http/introduction.md), et en particulier lors du traitement de formulaires HTML, les schemas seront généralement initialisés et utilisés pour rendre un formulaire lorsque des requêtes `GET` sont soumises au handler considéré. Le traitement des données réelles du formulaire sera généralement effectué dans le même handler lorsque des requêtes `POST` sont soumises.

Par exemple, le handler dans les fragments suivants affiche un schema lorsqu'une requête `GET` est traitée, et valide les données entrantes en utilisant le schema lorsque la requête est un `POST` :

```crystal
class ArticleCreateHandler < Marten::Handler
  @schema : ArticleSchema?

  def get
    render("article_create.html", context: { schema: schema })
  end

  def post
    if schema.valid?
      article = Article.new(schema.validated_data)
      article.save!

      redirect(reverse("home"))
    else
      render("article_create.html", context: { schema: schema })
    end
  end

  private def schema
    @schema ||= ArticleSchema.new(request.data)
  end
end
```

Détaillons un peu plus :

* lorsque la requête entrante est un `GET`, le handler rendra simplement le template `article_create.html`, et initialisera le schema (instance de `ArticleSchema`) avec les données actuellement présentes dans l'objet requête (retourné par la méthode `#request`). Cet objet schema est rendu disponible dans le contexte du template
* lorsque la requête entrante est un `POST`, il initialisera le schema et essaiera de voir s'il est valide compte tenu des données entrantes (en utilisant la méthode [`#valid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#valid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method)). S'il est valide, alors un nouvel enregistrement `Article` sera créé en utilisant les données validées du schema ([`#validated_data`](https://martenframework.com/docs/api/dev/Marten/Schema.html#validated_data%3AHash(String%2CBool|Float64|Int64|JSON%3A%3AAny|JSON%3A%3ASerializable|Marten%3A%3AHTTP%3A%3AUploadedFile|String|Time|Time%3A%3ASpan|UUID|Nil)-instance-method)), et l'utilisateur sera redirigé vers une page d'accueil. Sinon, le template `article_create.html` sera rendu à nouveau avec le schema invalide dans le contexte associé


:::tip
Certains [handlers génériques](../handlers-and-http/generic-handlers.md) permettent de traiter commodément les schemas dans les handlers. C'est le cas des handlers génériques [`Marten::Handlers::Schema`](../handlers-and-http/reference/generic-handlers.md#processing-a-schema), [`Marten::Handlers::RecordCreate`](../handlers-and-http/reference/generic-handlers.md#creating-a-record) et [`Marten::Handlers::RecordUpdate`](../handlers-and-http/reference/generic-handlers.md#updating-a-record) par exemple.
:::

Notez que les schemas peuvent être utilisés pour d'autres choses que le traitement de données de formulaire. Par exemple, ils peuvent aussi être utilisés pour traiter des charges utiles JSON dans le cadre de points d'accès API :

```crystal
class API::ArticleCreateHandler < Marten::Handler
  def post
    schema = ArticleCreateHandler.new(request.data)

    if schema.valid?
      article = Article.new(schema.validated_data)
      article.save!

      created = true
    else
      created = false
    end

    json({created: created})
  end
end
```

:::info
La méthode `#data` d'un objet de requête HTTP retourne un objet de type hash contenant les données de la requête : cet objet est automatiquement initialisé à partir de toute donnée de formulaire ou donnée JSON contenue dans le corps de la requête.
:::

### Rendu des schemas sous forme de formulaires

Il est à noter que les templates peuvent facilement interagir avec les objets schema afin de les introspecter et de rendre un formulaire HTML correspondant.

Dans l'exemple précédent, le schema pourrait être utilisé comme suit pour rendre un formulaire équivalent dans le template `article_create.html` :

```html
<form method="post" action="" novalidate>
  <input type="hidden" name="csrftoken" value="{% csrf_token %}" />

  {% if schema.errors.global %}
    <div class="error-messages">
      {% for error in schema.errors.global %}
        <p>{{ error.message }}</p>
      {% endfor %}
    </div>
  {% endif %}

  <fieldset class="field {% if schema.title.errored? %} field-error{% endif %}">
    <div><label>Title</label></div>
    <input type="text" name="{{ schema.title.id }}" value="{{ schema.title.value }}"/>
    {% for error in schema.title.errors %}<p><small>{{ error.message }}</small></p>{% endfor %}
  </fieldset>

  <fieldset class="field {% if schema.content.errored? %} field-error{% endif %}">
    <div><label>Content</label></div>
    <textarea name="{{ schema.content.id }}" value="{{ schema.content.value }}">{{ schema.content.value }}</textarea>
    {% for error in schema.content.errors %}<p><small>{{ error.message }}</small></p>{% endfor %}
  </fieldset>

  <fieldset class="field {% if schema.published_at.errored? %} field-error{% endif %}">
    <div><label>Published at</label></div>
    <input type="text" name="{{ schema.published_at.id }}" value="{{ schema.published_at.value }}"/>
    {% for error in schema.published_at.errors %}<p><small>{{ error.message }}</small></p>{% endfor %}
  </fieldset>

  <fieldset>
    <button>Submit</button>
  </fieldset>
</form>
```

Le code fourni démontre également comment gérer efficacement les erreurs dans vos templates. Voici un résumé des principales directives à suivre lors de la gestion des erreurs de schema dans les templates :

* Commencez par vérifier les erreurs `schema.errors.global`.
  Ce sont des problèmes à l'échelle du formulaire, et les afficher de manière visible alerte l'utilisateur sur des problèmes plus larges avec sa saisie.
* Si `schema.field_name.errored?` retourne true, cela signale des erreurs dans ce champ de saisie particulier.
* Affichez chaque message `schema.field_name.errors` individuel directement sous le champ de saisie associé.
  Cela fournit à l'utilisateur des indications claires sur la manière de corriger des problèmes de validation spécifiques.

## Champs de schema

Les classes schema doivent définir des _champs_. Les champs permettent de spécifier les attributs attendus d'un schema et indiquent comment valider les données entrantes. Ils sont définis via l'utilisation de la macro `field`.

Par exemple :

```crystal
class ArticleSchema < Marten::Schema
  field :title, :string, max_size: 128
  field :content, :string
  field :published_at, :date_time, required: false
end
```

### Identifiant et type de champ

Tout comme les champs de modèle, chaque champ dans une classe schema doit contenir deux arguments positionnels obligatoires : un identifiant de champ et un type de champ.

L'identifiant de champ est utilisé par Marten pour déterminer le nom de la clé correspondante dans tout objet de jeu de données qui doit être validé par le schema.

Le type de champ détermine plusieurs choses :

* le type de la valeur attendue dans le jeu de données validé
* comment le champ est sérialisé et désérialisé
* comment les valeurs de champ sont réellement validées

Marten fournit de nombreux types de champs de schema intégrés qui couvrent les besoins courants du développement web. La liste complète des champs supportés est couverte dans la [référence des champs de schema](./reference/fields.md).

:::note
Il est possible d'écrire des champs de schema personnalisés et de les utiliser dans vos définitions de schema. Voir [Comment créer des champs de schema personnalisés](./how-to/create-custom-schema-fields.md) pour plus de détails sur cette fonctionnalité.
:::

### Options communes des champs

En plus de leurs identifiants et types, les champs peuvent prendre des arguments nommés qui permettent de configurer davantage leurs comportements et la manière dont ils sont validés. Ces arguments nommés sont optionnels et ils sont partagés par tous les champs disponibles.

#### `required`

L'argument `required` permet de définir si un champ est obligatoire ou non. La valeur par défaut de cet argument est `true`.

La présence des champs obligatoires est automatiquement vérifiée par les schemas : si un champ obligatoire est manquant dans un jeu de données, alors une erreur correspondante sera générée par le schema.

## Validations

L'une des caractéristiques clés des schemas est qu'ils vous permettent de valider toute donnée entrante et tout paramètre de requête. Comme mentionné précédemment, les règles utilisées pour effectuer cette validation peuvent être héritées des champs de votre schema, selon les options que vous avez utilisées (par exemple les champs utilisant `required: true` feront échouer la validation des données associées si la valeur du champ n'est pas présente). Elles peuvent également être explicitement spécifiées dans votre classe schema, ce qui est utile si vous devez implémenter des logiques de validation personnalisées.

Par exemple :

```crystal
class SignUpSchema < Marten::Schema
  field :email, :string, max_size: 254
  field :password1, :string, max_size: 128, strip: false
  field :password2, :string, max_size: 128, strip: false

  validate :validate_password

  def validate_password
    return unless validated_data["password1"]? && validated_data["password2"]?

    if validated_data["password1"] != validated_data["password2"]
      errors.add("The two password fields do not match")
    end
  end
end
```

Les validations de schema sont toujours déclenchées par l'utilisation des méthodes [`#valid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#valid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method) ou [`#invalid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#invalid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method) : ces méthodes retournent `true` ou `false` selon que les données sont valides ou invalides.

Consultez le guide [Validations de schema](./validations.md) pour en savoir plus sur les validations de schema et comment les personnaliser.

## Accéder aux données validées

Après avoir effectué les [validations de schema](#validations) (c'est-à-dire après avoir appelé [`#valid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#valid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method) ou [`#invalid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#invalid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method) sur un objet schema), l'accès aux données validées est souvent nécessaire. Par exemple, vous pourriez avoir besoin de persister les données validées dans un enregistrement de modèle. Pour y parvenir, vous pouvez utiliser la méthode [`#validated_data`](https://martenframework.com/docs/api/dev/Marten/Schema.html#validated_data%3AHash(String%2CBool|Float64|Int64|JSON%3A%3AAny|JSON%3A%3ASerializable|Marten%3A%3AHTTP%3A%3AUploadedFile|String|Time|Time%3A%3ASpan|UUID|Nil)-instance-method), qui est accessible dans toutes les instances de schema.

Cette méthode donne accès à un hash qui contient les valeurs de champs désérialisées et validées du schema. Par exemple, considérons l'exemple du schema `ArticleSchema` [mentionné précédemment](#la-classe-schema) :

```crystal
schema = ArticleSchema.new(Marten::Schema::DataHash{"title" => "Test article", "content" => "Test content"})
schema.valid? # => true

schema.validated_data["title"]   # => "Test article"
schema.validated_data["content"] # => "Test content"
```

Il est important de noter que l'accès aux valeurs en utilisant [`#validated_data`](https://martenframework.com/docs/api/dev/Marten/Schema.html#validated_data%3AHash(String%2CBool|Float64|Int64|JSON%3A%3AAny|JSON%3A%3ASerializable|Marten%3A%3AHTTP%3A%3AUploadedFile|String|Time|Time%3A%3ASpan|UUID|Nil)-instance-method) comme montré dans l'exemple ci-dessus n'est pas type-safe. Le hash [`#validated_data`](https://martenframework.com/docs/api/dev/Marten/Schema.html#validated_data%3AHash(String%2CBool|Float64|Int64|JSON%3A%3AAny|JSON%3A%3ASerializable|Marten%3A%3AHTTP%3A%3AUploadedFile|String|Time|Time%3A%3ASpan|UUID|Nil)-instance-method) peut retourner n'importe quelle valeur de champ de schema supportée, et par conséquent, vous pourriez avoir besoin d'utiliser la pseudo-méthode [`#as`](https://crystal-lang.org/reference/syntax_and_semantics/as.html) pour gérer les données validées récupérées de manière appropriée, selon comment et où vous avez l'intention de les utiliser.

Pour pallier cela, Marten définit automatiquement des méthodes type-safe que vous pouvez utiliser pour accéder aux valeurs validées de vos champs de schema :

* `#<field>` retourne une version nullable de la valeur du champ `<field>`
* `#<field>!` retourne une version non-nullable de la valeur du champ `<field>`
* `#<field>?` retourne un booléen indiquant si le champ `<field>` a une valeur

Par exemple :

```crystal
schema = ArticleSchema.new(Marten::Schema::DataHash{"title" => "Test article"})
schema.valid? # => true

schema.title    # => "Test article"
schema.title!   # => "Test article"
schema.title?   # => true

schema.content  # => nil
schema.content! # => raises NilAssertionError
schema.content? # => false
```

## Callbacks

Il est possible de définir des callbacks dans votre schema afin de lier des méthodes et des logiques à des événements spécifiques du cycle de vie de vos objets schema. Actuellement, les schemas supportent uniquement les callbacks liés à la validation : `before_validation` et `after_validation`.

Les callbacks `before_validation` sont appelés avant l'exécution des règles de validation pour un schema donné, tandis que les callbacks `after_validation` sont exécutés après. Ils peuvent être utilisés par exemple pour modifier les données validées une fois la validation terminée.

```crystal
class ArticleSchema < Marten::Schema
  field :title, :string, max_size: 128
  field :content, :string
  field :published_at, :date_time, required: false

  before_validation :run_pre_validation_logic
  after_validation :run_post_validation_logic

  private def run_pre_validation_logic
    # Do something before the validation
  end

  private def run_post_validation_logic
    # Do something after the validation
  end
end
```

L'utilisation de méthodes comme [`#valid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#valid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method) ou [`#invalid?`](https://martenframework.com/docs/api/dev/Marten/Core/Validation.html#invalid%3F(context%3ANil|String|Symbol%3Dnil)-instance-method) déclenchera les callbacks de validation. Voir [Validations de schema](./validations.md) pour plus de détails.
