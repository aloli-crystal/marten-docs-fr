---
title: Introduction aux templates
description: Apprenez à écrire des templates et à générer du HTML dynamiquement.
sidebar_label: Introduction
---

Les templates offrent un moyen pratique de définir la logique de présentation d'une application web. Ils permettent d'écrire du contenu textuel rendu dynamiquement grâce à une syntaxe dédiée. Cette syntaxe permet l'utilisation de variables dynamiques ainsi que de certaines structures de programmation.

## Syntaxe

Un template est un document textuel ou une chaîne de caractères qui utilise le langage de templates de Marten, et qui peut être utilisé pour générer _n'importe quel_ format basé sur du texte (HTML, XML, etc). Pour insérer du contenu dynamique, les templates utilisent généralement quelques constructions telles que les **variables**, qui sont remplacées par les valeurs correspondantes lors de l'évaluation du template, et les **tags**, qui peuvent être utilisés pour implémenter la logique du template.

Par exemple, le template suivant affiche les propriétés d'une variable `article` et parcourt les commentaires associés afin de les afficher sous forme de liste :

```html
<h1>{{ article.title }}</h1>
<p>{{ article.content }}</p>
<ul>
{% for comment in article.comments %}
  <li>{{ comment.message }}</li>
{% else %}
  <li>No comments!</li>
{% endfor %}
</ul>
```

Les templates doivent être évalués avec un **contexte**. Ce contexte est généralement un objet de type hash contenant toutes les variables ou valeurs que le template peut utiliser lors de son rendu.

Dans l'exemple précédent, le contexte du template contiendrait au minimum une clé `article` donnant accès aux propriétés de l'article considéré.

### Variables

Les variables peuvent être utilisées pour injecter une valeur du contexte dans le template rendu. Elles doivent être entourées par **`{{`** et **`}}`**.

Par exemple :

```html
Hello, {{ name }}!
```

Si le contexte utilisé pour rendre le template ci-dessus est `{"name" => "John Doe"}`, alors la sortie serait "Hello, John Doe!".

Chaque variable peut impliquer des recherches supplémentaires afin d'accéder à des attributs spécifiques d'un objet (si ces objets en possèdent). Ces recherches sont exprimées en utilisant une notation par points (`foo.bar`). Par exemple, le fragment suivant afficherait l'attribut `title` de la variable `article` :

```html
<h1>{{ article.title }}</h1>
```

Cette notation peut être utilisée pour appeler des méthodes d'objets mais aussi pour effectuer des recherches par clé dans les hashes ou les named tuples. Elle peut également être utilisée pour effectuer des recherches par index dans les objets indexables (comme les tableaux ou les tuples) :

```
{{ my_array.0 }}
```

### Filters

Les filters peuvent être appliqués aux [variables](#variables) ou aux arguments de [tags](#tags) afin de transformer leurs valeurs. Ils sont appliqués à ces variables ou arguments via l'utilisation d'un pipe (**`|`**) suivi du nom du filter.

Par exemple, le fragment suivant appliquera le filter [`capitalize`](./reference/filters.md#capitalize) à la sortie de la variable `name`, ce qui mettra en majuscule la valeur de cette variable :

```html
Hello, {{ name|capitalize }}!
```

Il est à noter que certains filters peuvent prendre un argument. Lorsque c'est le cas, l'argument est spécifié après un caractère deux-points (**`:`**).

Par exemple, le fragment suivant appliquera le filter [`default`](./reference/filters.md#default) à la sortie de la variable `name` afin de revenir à un nom par défaut si la variable a une valeur nulle :

```html
Hello, {{ name|default:"Stranger" }}!
```

Il est à noter que le fait qu'un argument soit supporté ou non, et obligatoire ou non, varie selon le filter considéré. Dans tous les cas, les filters ne peuvent accepter qu'**un seul** argument au maximum. De plus, un argument de filter peut correspondre soit à une [variable](#variables) classique, soit à une [valeur littérale](#valeurs-littérales).

Consultez la [référence des filters](./reference/filters.md) pour voir la liste de tous les filters disponibles. L'implémentation de filters personnalisés est également possible et documentée dans [Créer des filters personnalisés](./how-to/create-custom-filters.md).

### Tags

Les tags permettent d'effectuer des appels de méthodes et d'exécuter tout type de logique au sein d'un template. Certains tags permettent d'effectuer des contrôles de flux (comme les conditions if ou les boucles for) tandis que d'autres produisent simplement des valeurs. Ils sont délimités par **`{%`** et **`%}`**.

Par exemple, le fragment suivant utilise le tag [`assign`](./reference/tags.md#assign) pour créer une nouvelle variable au sein d'un template :

```html
{% assign my_var = "Hello World!" %}
```

Comme mentionné ci-dessus, certains tags permettent d'effectuer des contrôles de flux et nécessitent un tag de « fermeture », comme les tags [`for`](./reference/tags.md#for) ou [`if`](./reference/tags.md#if) :

```html
{% for article in articles %}
  {{ article.title }} is {% if !article.published? %}not {% endif %}published
{% endfor %}
```

Certains tags nécessitent également des arguments. De manière similaire aux filters, ces arguments peuvent correspondre soit à des [variables](#variables) classiques, soit à des [littéraux](#valeurs-littérales). Par exemple, le tag de template [`url`](./reference/tags.md#url) nécessite au minimum le nom de la route pour laquelle la résolution d'URL doit être effectuée :

```html
{% url "my_route" %}
```

Consultez la [référence des tags](./reference/tags.md) pour voir la liste de tous les tags de template disponibles. L'implémentation de tags personnalisés est également possible et documentée dans [Créer des tags personnalisés](./how-to/create-custom-tags.md).

### Commentaires

Des commentaires peuvent être insérés dans n'importe quel template et doivent être entourés par **`{#`** et **`#}`** :

```html
{# This will not be evaluated #}
```

### Valeurs littérales

Le langage de templates Marten supporte l'utilisation de valeurs littérales dans les [variables](#variables), les arguments de [filters](#filters) ou les arguments de [tags](#tags). Ces littéraux sont essentiellement une représentation des objets correspondants en Crystal. Chaque type de littéral supporté est listé ci-dessous :

| Type | Exemple |
| ----------- | ----------- |
| Nil | `{{ nil }}` |
| True | `{{ true }}` |
| False | `{{ false }}` |
| Entier | `{{ 42 }}` |
| Flottant | `{{ 42.45 }}` |
| Chaîne entre guillemets simples | `{{ 'Hello World' }}` |
| Chaîne entre guillemets doubles | `{{ "Hello World" }}` |

## Héritage de templates

Les templates peuvent hériter les uns des autres : cela vous permet de définir facilement un template « de base » contenant la mise en page de votre application afin de le réutiliser pour construire d'autres templates, ce qui aide à garder votre code DRY.

Cela fonctionne comme suit :

* un template « de base » définit la mise en page partagée ainsi que des « blocs » où les templates enfants injecteront leur propre contenu
* les templates « enfants » « étendent » le template de base et définissent explicitement le contenu des « blocs » attendus par le template de base

Par exemple, un template « de base » pourrait ressembler à ceci :

```html
<html>
  <head>
    <title>{% block title %}My super website{% endblock %}</title>
  </head>
  <body>
    {% block content %}{% endblock %}
  </body>
</html>
```

Ici, le template de base définit deux blocs en utilisant le tag de template [`block`](./reference/tags.md#block). L'utilisation de ce tag permet essentiellement à tout template enfant de « surcharger » le contenu de ces blocs.

:::tip
Notez qu'il est possible de spécifier le nom du bloc fermé dans le tag `endblock` pour améliorer la lisibilité. Par exemple :

```html
{% block title %}
My super website
{% endblock title %}
````
:::

Étant donné le template de base ci-dessus (que nous supposons nommé `base.html`), un template « enfant » l'utilisant pourrait ressembler à ceci :

```html
{% extend "base.html" %}

{% block title %}Custom page title{% endblock %}

{% block content %}Custom page content{% endblock %}
```

Ici, nous utilisons le tag de template [`extend`](./reference/tags.md#extend) pour indiquer que nous souhaitons hériter du template `base.html` créé précédemment. Lorsque Marten rencontre ce tag, il s'assure que le template ciblé est correctement chargé avant de reprendre l'évaluation du template courant.

:::warning
Le tag `{% extend %}` doit toujours être appelé en haut du fichier, avant le contenu réel du template. L'héritage ne fonctionnera pas correctement si ce n'est pas le cas.
:::

Nous utilisons également des tags [`block`](./reference/tags.md#block) pour redéfinir le contenu des blocs définis dans le template `base.html`. Il est à noter que si un template enfant ne définit pas le contenu d'un des blocs de son parent, le contenu par défaut de ce bloc sera utilisé à la place (s'il y en a un !).

:::info
Vous pouvez utiliser plusieurs niveaux d'héritage de templates si nécessaire. En effet, un template `child.html` peut très bien étendre un template `base_dashboard.html`, qui lui-même étend un template `base.html` par exemple.
:::

Il est à noter qu'il est également possible d'obtenir le contenu d'un bloc d'un template parent en utilisant le tag de template `super`. Cela peut être utile dans les situations où les blocs d'un template enfant doivent étendre (ajouter du contenu) le contenu d'un bloc parent au lieu de le remplacer.

Par exemple, avec le fragment suivant, la sortie du bloc `title` serait "My super website - Example page" :

```html
{% extend "base.html" %}

{% block title %}{% super %} - Example page{% endblock %}

{% block content %}Custom page content{% endblock %}
```

Il est important de se rappeler que le tag de template `super` ne peut être utilisé qu'à l'intérieur de tags `block`.

## Inclusion de templates

Les templates peuvent « inclure » d'autres templates facilement grâce à l'utilisation du tag de template [`include`](./reference/tags.md#include). De tels templates sont généralement appelés « partiels » : ce sont des fragments de template qui peuvent être facilement « inclus » dans d'autres templates pour éviter la duplication de code.

Les templates inclus sont rendus en utilisant le contexte du template incluant. Cela signifie que toutes les variables fournies au template incluant peuvent également être utilisées dans le template inclus. De plus, d'autres variables spécifiques peuvent également être définies lors de l'inclusion d'un template spécifique.

Par exemple, supposons qu'un projet définisse le template partiel suivant :

```html name="src/templates/partials/button.html
<button class="{{ type }}">
  {{ text | default: "Default text" }}
</button>
```

Ce partiel pourrait être inclus comme suit dans le template suivant :

```html
{% include "partials/button.html" with type="primary" %}
{% include "partials/button.html" with type="primary", text="Custom text" %}
```

Notez l'utilisation du mot-clé `with` pour spécifier les variables séparées par des virgules qui doivent être utilisées pour remplir le contexte du template inclus.

Évidemment, il est aussi possible d'inclure des partiels qui ne nécessitent aucune variable. Dans ce cas, l'utilisation du mot-clé `with` n'est pas nécessaire :

```html
{% include "partials/other_snippet.html" %}
```

## Chargement de templates

Les templates peuvent être chargés depuis des emplacements spécifiques dans votre code source et depuis les dossiers des applications. Cela est contrôlé par deux paramètres principaux :

* [`templates.app_dirs`](../development/reference/settings.md#app_dirs-1) est un booléen qui indique s'il doit être possible de charger des templates fournis par les [applications installées](../development/reference/settings.md#installed_apps). En effet, les applications peuvent définir un dossier `templates` à leur racine, et ces templates seront découverts par Marten si ce paramètre est défini à `true`
* [`templates.dirs`](../development/reference/settings.md#dirs-1) est un tableau de répertoires supplémentaires où les templates doivent être recherchés

Les templates d'application sont toujours activés par défaut (`templates.app_dirs = true`) pour les nouveaux projets Marten.

Il est possible de charger un template par nom de manière programmatique. Pour ce faire, vous pouvez utiliser la méthode [`#get_template`](pathname:///api/dev/Marten/Template/Engine.html#get_template(template_name%3AString)%3ATemplate-instance-method) fournie par le moteur de templates de Marten :

```crystal
Marten.templates.get_template("foo/bar.html")
```

Cela retournera un objet [`Template`](pathname:///api/dev/Marten/Template/Template.html) compilé que vous pourrez ensuite rendre en utilisant un contexte spécifique.

:::tip Personnaliser les loaders de templates
Le paramètre [`templates.loaders`](../development/reference/settings.md#loaders) offre un contrôle précis sur la façon dont Marten découvre et charge les templates. Ce paramètre attend un tableau de classes de loaders de templates, qui doivent hériter de `Marten::Template::Loader::Base`. Ce paramètre remplacera les loaders de templates par défaut configurés par Marten. Cela vous donne la possibilité de configurer des [loaders personnalisés](./how-to/create-custom-loaders.md) pour charger des templates depuis différentes sources, telles que des bases de données ou des structures de données en mémoire.

Exemple : Configuration d'un loader de système de fichiers

```crystal
config.templates.loaders = [Marten::Template::Loader::FileSystem.new("/path/to/templates")] of Marten::Template::Loader::Base
```
:::

## Rendu d'un template

Vous n'aurez généralement pas besoin d'interagir avec l'API « bas niveau » du moteur de templates de Marten pour rendre des templates : la plupart du temps, vous rendrez des templates dans le cadre de [handlers](../handlers-and-http.mdx), ce qui signifie que vous utiliserez probablement le raccourci [`#render`](../handlers-and-http/introduction.md#render) ou des [handlers génériques](../handlers-and-http/generic-handlers.md) qui rendent automatiquement les templates pour vous.

Cela dit, il est également possible de rendre n'importe quel objet [`Template`](pathname:///api/dev/Marten/Template/Template.html) que vous avez chargé en utilisant la méthode [`#render`](pathname:///api/dev/Marten/Template/Template.html#render(context%3AHash|NamedTuple)%3AString-instance-method). Cette méthode peut être utilisée soit avec un objet contexte Marten, un hash, ou un named tuple :

```crystal
template = Marten.templates.get_template("foo/bar.html")
template.render(Marten::Template::Context{"foo" => "bar"})
template.render({"foo" => "bar"})
template.render({ foo: "bar" })
```

## Utilisation des enums dans les contextes

Les classes [Enum](https://crystal-lang.org/api/Enum.html) ne peuvent pas faire partie de types union en Crystal. En raison de cette limitation, les valeurs d'enum sont remplacées par des objets spéciaux dans les templates Marten. Ces objets se résolvent toujours vers la valeur entière de la valeur d'enum correspondante.

Par exemple, considérons l'enum suivant :

```crystal
enum Color
  Red
  Green
  Blue
end
```

Si une variable `color` est définie à `Color::Red`, alors le template suivant affichera `0` :

```html
{{ color }}
```

Il est important de noter que les valeurs d'enum dans les templates Marten peuvent être comparées entre elles, produisant les mêmes résultats que la comparaison de valeurs d'enum en Crystal.

De plus, les propriétés d'aide `<name>?` peuvent être invoquées sur les valeurs d'enum dans les templates, simplifiant le processus de détermination du type de la valeur d'enum considérée. Par exemple :

```html
{% if color.red? %}
  This is the red color.
{% endif %}
```

## Utilisation d'objets personnalisés dans les contextes

La plupart des objets fournis par Marten (tels que les enregistrements Model, les query sets, les schemas, etc.) peuvent automatiquement être utilisés dans les templates. Si votre projet implique d'autres classes personnalisées, et si vous souhaitez interagir avec de tels objets dans vos templates, vous devrez explicitement vous assurer qu'ils incluent le module [`Marten::Template::Object`](pathname:///api/dev/Marten/Template/Object.html).

:::note Pourquoi ?
Crystal étant un langage typé statiquement, le moteur Marten a besoin de savoir quels types d'objets il manipule à l'avance afin de savoir (i) ce qui peut être placé dans les contextes de template et (ii) comment « résoudre » les attributs des objets lorsque les templates sont rendus. Il n'est pas possible d'attendre simplement n'importe quel objet `Object`, c'est pourquoi nous devons utiliser un module partagé [`Marten::Template::Object`](pathname:///api/dev/Marten/Template/Object.html) pour prendre en compte toutes les classes dont les objets doivent être utilisables dans les contextes de template.
:::

Prenons l'exemple d'une classe `Point` qui fournit un accès à une coordonnée x et une coordonnée y :

```crystal
class Point
  getter x
  getter y

  def initialize(@x : Int32, @y : Int32)
  end
end
```

Par défaut, les objets `Point` ne peuvent pas être utilisés dans les templates. Supposons que nous voulions rendre le template suivant impliquant une variable `point` :

```html
My point is: {{ point.x }}, {{ point.y }}
```

Si vous essayez de rendre un tel template en passant un objet `Point` dans le contexte du template, vous rencontrerez une exception `Marten::Template::Errors::UnsupportedValue` indiquant :

```
Unable to initialize template values from Point objects
```

Pour remédier à cela, vous devrez inclure le module [`Marten::Template::Object`](pathname:///api/dev/Marten/Template/Object.html) dans la classe `Point` et définir une méthode `#resolve_template_attribute` comme suit :

```crystal
class Point
  include Marten::Template::Object

  getter x
  getter y

  def initialize(@x : Int32, @y : Int32)
  end

  def resolve_template_attribute(key : String)
    case key
    when "x"
      x
    when "y"
      y
    end
  end
end
```

Chaque classe incluant le module [`Marten::Template::Object`](pathname:///api/dev/Marten/Template/Object.html) doit également implémenter une méthode `#resolve_template_attribute` afin de permettre la résolution des attributs des objets lorsque les templates sont rendus (par exemple `{{ point.x }}`). Cela dit, il existe quelques raccourcis pour éviter d'écrire de telles méthodes.

Le premier est d'utiliser la macro [`#template_attributes`](pathname:///api/dev/Marten/Template/Object.html#template_attributes(*names)-macro) afin de définir facilement les noms des méthodes qui doivent être rendues disponibles au runtime du template. Par exemple, cette macro pourrait être utilisée ainsi avec notre classe `Point` :

```crystal
class Point
  include Marten::Template::Object

  getter x
  getter y

  def initialize(@x : Int32, @y : Int32)
  end

  template_attributes :x, :y
end
```

Une autre possibilité est d'inclure le module [`Marten::Template::Object::Auto`](pathname:///api/dev/Marten/Template/Object/Auto.html) au lieu du module [`Marten::Template::Object`](pathname:///api/dev/Marten/Template/Object.html) dans votre classe. Ce module s'assurera automatiquement que chaque méthode publique de type « attribut » définie dans la classe incluante peut également être accédée dans les templates lors des recherches de variables.

```crystal
class Point
  include Marten::Template::Object::Auto

  getter x
  getter y

  def initialize(@x : Int32, @y : Int32)
  end
end
```

Notez que **toutes** les méthodes publiques de type « attribut » seront rendues disponibles au runtime du template lors de l'utilisation du module [`Marten::Template::Object::Auto`](pathname:///api/dev/Marten/Template/Object/Auto.html). Cela peut être un comportement suffisant, mais si vous souhaitez avoir plus de contrôle sur ce qui peut être accédé dans les templates ou non, vous finirez probablement par utiliser [`Marten::Template::Object`](pathname:///api/dev/Marten/Template/Object.html) et la macro [`#template_attributes`](pathname:///api/dev/Marten/Template/Object.html#template_attributes(*names)-macro) à la place.

## Utilisation des context producers

Les context producers sont des aides qui garantissent que des variables communes sont automatiquement insérées dans le contexte du template chaque fois qu'un template est rendu. Ils sont appliqués à chaque fois qu'un nouveau contexte de template est généré.

Par exemple, ils peuvent être utilisés pour insérer l'objet de requête HTTP courante dans chaque contexte de template rendu dans le cadre d'un handler et d'une requête HTTP. Cela a du sens étant donné que l'objet de requête HTTP est un objet couramment utilisé par plusieurs templates dans votre projet : de cette façon, il n'est pas nécessaire de l'insérer explicitement dans le contexte à chaque fois que vous rendez un template. Cette capacité spécifique est fournie par le context producer [`Marten::Template::ContextProducer::Request`](pathname:///api/dev/Marten/Template/ContextProducer/Request.html), qui insère un objet `request` dans chaque contexte de template.

Les context producers de templates peuvent être configurés via le paramètre [`templates.context_producers`](../development/reference/settings.md#context_producers). Lors de la génération d'un nouveau projet en utilisant la commande `marten new`, les context producers suivants seront automatiquement configurés :

```crystal
config.templates.context_producers = [
  Marten::Template::ContextProducer::Request,
  Marten::Template::ContextProducer::Flash,
  Marten::Template::ContextProducer::Debug,
  Marten::Template::ContextProducer::I18n,
]
```

Chaque context producer dans ce tableau sera appliqué dans l'ordre lorsqu'un nouveau contexte de template est créé et contribuera des valeurs de contexte « communes ». Cela signifie que l'ordre de ces éléments est important puisque les context producers peuvent techniquement écraser les valeurs ajoutées par les context producers précédents.

Consultez la [référence des context producers](./reference/context-producers.md) pour voir la liste de tous les context producers disponibles. L'implémentation de context producers personnalisés est également possible et documentée dans [Créer des context producers personnalisés](./how-to/create-custom-context-producers.md).

## Auto-échappement {#auto-escaping}

La sortie des variables de template est automatiquement échappée par Marten afin de prévenir les vulnérabilités de type Cross-Site Scripting (XSS).

Par exemple, considérons le fragment suivant :

```html
Hello, {{ name }}!
```

Si ce template est rendu avec `<script>alert('popup')</script>` comme contenu de la variable `name`, alors la sortie sera :

```html
Hello, &lt;script&gt;alert(&#39;popup&#39;)&lt;/script&gt;!
```

Il est à noter que ce comportement peut être désactivé _explicitement_. En effet, parfois il est attendu que certaines variables de template contiennent du contenu HTML de confiance que vous souhaitez intégrer dans le HTML du template.

Pour ce faire, il est possible d'utiliser le filter de template [`safe`](./reference/filters.md#safe). Ce filter « marque » la sortie d'une variable comme sûre, ce qui garantit que son contenu n'est pas échappé avant d'être inséré dans la sortie finale d'un template rendu.

Par exemple :

```html
Hello, {{ name }}!
Hello, {{ name|safe }}!
```

Lorsqu'il est rendu avec `<b>John</b>` comme contenu de la variable `name`, le template ci-dessus produira :

```html
Hello, &lt;b&gt;John&lt;/b&gt;!
Hello, <b>John</b>!
```

## Variables strictes

Par défaut, lorsqu'une variable de template est inconnue ou non définie, Marten la traite comme une valeur `nil`. Par conséquent, rien ne sera affiché pour de telles variables, et elles seront évaluées comme fausses dans les conditions if.

Cependant, il est possible de modifier ce comportement en activant le paramètre [`templates.strict_variables`](../development/reference/settings.md#strict_variables). Lorsque ce paramètre est défini à `true`, les variables inconnues rencontrées dans les templates lèveront des exceptions [`Marten::Template::Errors::UnknownVariable`](pathname:///api/dev/Marten/Template/Errors/UnknownVariable.html).
