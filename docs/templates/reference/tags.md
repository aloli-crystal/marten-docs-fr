---
title: Tags de template
description: Référence des tags de template.
---

Cette page fournit une référence pour tous les tags disponibles qui peuvent être utilisés lors de la définition de [templates](../introduction.md).

## `asset`

Le tag de template `asset` permet de générer l'URL d'un [asset](../../assets/introduction.md) donné. Il doit prendre au moins un argument (le chemin du fichier de l'asset).

Par exemple, la ligne suivante est une utilisation valide du tag `asset` et affichera le chemin ou l'URL de l'asset `app/app.css` :

```html
{% asset "app/app.css" %}
```

Optionnellement, les URL d'assets résolues peuvent être assignées à une variable spécifique en utilisant le mot-clé `as` :

```html
{% asset "app/app.css" as my_var %}
```

## `assign`

Le tag de template `assign` permet de définir une nouvelle variable qui sera stockée dans le contexte du template.

Par exemple :

```html
{% assign my_var = "Hello World!" %}
```

Par défaut, les variables assignées en utilisant ce tag de template écraseront toute variable existante portant le même nom dans le contexte du template. Pour empêcher l'écrasement des variables existantes, vous pouvez ajouter `unless assigned` après l'assignation pour garantir que les nouvelles variables ne soient assignées que s'il n'y en a pas déjà une avec le même nom.

Par exemple :

```html
{% assign my_var = "Hello World!" unless defined %}
```

## `block`

Le tag de template `block` permet de définir que certaines portions spécifiques d'un template peuvent être surchargées par des templates enfants. Ce tag n'est utile que lorsqu'il est utilisé conjointement avec le tag [`extend`](#extend). Voir [Héritage de templates](../introduction.md#héritage-de-templates) pour en savoir plus sur cette fonctionnalité.

## `cache`

Le tag de template `cache` permet de mettre en cache le contenu d'un fragment de template (contenu entre les tags `{% cache %}...{% endcache %}`) pour une durée spécifique. Cette opération de mise en cache est effectuée en utilisant le [store de cache](../../caching/introduction.md#configuration-and-cache-stores) configuré.

Au minimum, une clé de cache et une expiration de cache (exprimée en secondes) doivent être spécifiées lors de l'utilisation de ce tag :

```html
{% cache "mykey" 3600 %}
  Cached content!
{% endcache %}
```

Il est à noter que le tag de template `cache` supporte également la spécification d'arguments supplémentaires « vary on » qui permettent d'invalider le cache en fonction de la valeur d'autres variables de template :

```html
{% cache "mykey" 3600 current_locale user.id %}
  Cached content!
{% endcache %}
```

## `capture`

Le tag de template `capture` permet de définir que la sortie d'un bloc de code doit être stockée dans une nouvelle variable.

Par exemple :

```html
{% capture my_var %}
  Hello World, {{ name }}!
{% endcapture %}
```

En supposant que la variable `name` est assignée à la valeur "John Doe" lors du rendu de ce fragment, la variable `my_var` contiendra la chaîne "Hello World, John Doe!".

Par défaut, les variables assignées en utilisant ce tag de template écraseront toute variable existante portant le même nom dans le contexte du template. Pour empêcher l'écrasement des variables existantes, vous pouvez ajouter `unless assigned` après le nom de la variable pour garantir que les nouvelles variables ne soient assignées que s'il n'y en a pas déjà une avec le même nom.

Par exemple :

```html
{% capture my_var unless defined %}
  Hello World, {{ name }}!
{% endcapture %}
```

## `csrf_input`

Le tag de template `csrf_input` permet de générer un champ de formulaire HTML caché contenant le jeton CSRF (calculé pour la requête en cours). Ce tag ne peut être utilisé que dans des templates rendus dans le cadre d'un handler (par exemple en utilisant [`#render`](../../handlers-and-http/introduction.md#render) ou l'un des [handlers génériques](../../handlers-and-http/generic-handlers.md) impliquant des templates rendus).

Il peut être utilisé pour s'assurer que le jeton CSRF est inséré dans un formulaire afin qu'il soit envoyé au handler traitant les données du formulaire par exemple. En effet, les handlers effectueront automatiquement une vérification CSRF afin de protéger les requêtes non sûres (c'est-à-dire les requêtes dont les méthodes ne sont pas `GET`, `HEAD`, `OPTIONS` ou `TRACE`) :

```html
<form method="post" action="" enctype="multipart/form-data">
  {% csrf_input %}
  <input type="text" name="test" />
  <button>Submit</button>
</form>
```

Le template ci-dessus produira le HTML suivant :

```html
<form method="post" action="" enctype="multipart/form-data">
  // highlight-next-line
  <input type="hidden" name="csrftoken" value="<csrfToken>" />
  <input type="text" name="test" />
  <button>Submit</button>
</form>
```

Où `<csrfToken>` est le véritable jeton CSRF.

Voir [Protection contre le Cross-Site Request Forgery](../../security/csrf.md) pour en savoir plus.

Optionnellement, la sortie du tag de template `csrf_input` peut être assignée à une variable spécifique en utilisant le mot-clé `as` :

```html
{% csrf_input as my_var %}
```

## `csrf_token`

Le tag de template `csrf_token` permet de calculer et d'insérer la valeur du jeton CSRF dans un template. Ce tag ne peut être utilisé que dans des templates rendus dans le cadre d'un handler (par exemple en utilisant [`#render`](../../handlers-and-http/introduction.md#render) ou l'un des [handlers génériques](../../handlers-and-http/generic-handlers.md) impliquant des templates rendus).

Il peut être utilisé pour insérer le jeton CSRF dans un champ de formulaire caché afin qu'il soit envoyé au handler traitant les données du formulaire par exemple. En effet, les handlers effectueront automatiquement une vérification CSRF afin de protéger les requêtes non sûres (c'est-à-dire les requêtes dont les méthodes ne sont pas `GET`, `HEAD`, `OPTIONS` ou `TRACE`) :

```html
<form method="post" action="" enctype="multipart/form-data">
  <input type="hidden" name="csrftoken" value="{% csrf_token %}" />
  <input type="text" name="test" />
  <button>Submit</button>
</form>
```

Voir [Protection contre le Cross-Site Request Forgery](../../security/csrf.md) pour en savoir plus.

Optionnellement, la sortie du tag de template `csrf_token` peut être assignée à une variable spécifique en utilisant le mot-clé `as` :

```html
{% csrf_token as my_var %}
```

## `escape`

Le tag `escape` est utilisé pour activer ou désactiver l'[auto-échappement](../introduction.md#auto-échappement) pour un bloc de code. Il prend un argument, soit `on` soit `off`, pour activer ou désactiver l'auto-échappement respectivement.

Par exemple :

```html
{% escape off %}
  <div>{{ article.html_body }}</div>
{% endescape %}
```

## `extend`

Le tag de template `extend` permet de définir qu'un template hérite d'un template de base spécifique. Ce tag doit être utilisé avec un argument obligatoire, qui peut être soit une chaîne littérale soit une variable qui sera résolue au moment du rendu. Ce mécanisme n'est utile que si le template de base définit des [blocs](#block) qui sont surchargés ou étendus par le template enfant. Voir [Héritage de templates](../introduction.md#héritage-de-templates) pour en savoir plus sur cette fonctionnalité.

## `for`

Le tag de template `for` permet de parcourir les éléments d'objets itérables et gère également les replis grâce à l'utilisation du bloc interne `else`. Il est à noter que le tag de template `for` nécessite un tag de fermeture `endfor`.

Par exemple :

```html
{% for item in items %}
  Display {{ item }}
{% else %}
  No items!
{% endfor %}
```

Il est à noter que les boucles `for` supportent le dépaquetage de plusieurs éléments lorsque c'est applicable (par exemple lors de l'itération sur des hashes ou des énumérables contenant des tableaux ou des tuples) :

```html
{% for label, url in navigation_items %}
  <a href="{{ url }}">{{ label }}</a>
{% endfor %}
```

Enfin, les boucles donnent accès à une variable spéciale `loop` _à l'intérieur_ de la boucle afin d'exposer des informations sur le processus d'itération :

| Variable | Description |
| -------- | ----------- |
| `loop.index` | L'index de l'itération courante (indexé à partir de 1) |
| `loop.index0` | L'index de l'itération courante (indexé à partir de 0) |
| `loop.revindex` | L'index de l'itération courante en comptant depuis la fin de la boucle (indexé à partir de 1) |
| `loop.revindex0` | L'index de l'itération courante en comptant depuis la fin de la boucle (indexé à partir de 0) |
| `loop.first?` | Un booléen indiquant si c'est la première itération de la boucle |
| `loop.last?` | Un booléen indiquant si c'est la dernière itération de la boucle |
| `loop.length` | Le nombre total d'itérations dans la boucle |
| `loop.even?` | Un booléen indiquant si l'index de l'itération courante (indexé à partir de 0) est pair |
| `loop.odd?` | Un booléen indiquant si l'index de l'itération courante (indexé à partir de 0) est impair |
| `loop.parent` | La variable `loop` du parent (uniquement pour les boucles for imbriquées) |

## `if`

Le tag de template `if` permet de définir des conditions contrôlant quels blocs doivent être exécutés. Un tag `if` doit toujours commencer par une condition `if`, suivie d'un nombre quelconque de conditions intermédiaires `elsif` et d'un bloc final `else` optionnel. Il nécessite également un tag de fermeture `endif`.

Par exemple :

```html
{% if my_var == 0 %}
  Zero!
{% elsif my_var == 1 && other_var == "foobar" %}
  One!
{% elsif !additional_var %}
  Something else!
{% else %}
  Other!
{% endif %}
```

Les opérateurs supportés sont listés dans la [référence des opérateurs](./operators.md).

## `include`

Le tag de template `include` permet d'inclure et de rendre un autre template en utilisant le contexte courant. Ce tag doit être utilisé avec un argument obligatoire : le nom du template à inclure, qui peut être soit une chaîne littérale soit une variable qui sera résolue au moment du rendu.

Par exemple :

```html
{% include "path/to/my_snippet.html" %}
```

Les templates inclus sont rendus en utilisant le contexte du template incluant. Cela signifie que toutes les variables attendues ou fournies au template incluant peuvent également être utilisées dans le template inclus.

Par exemple :

```html title="hello.html"
Hello, {{ name }}! {% include "question.html" %}
```

```html title="question.html"
How are you {{ name }}?
```

Si `name` est "John", alors la sortie sera "Hello, John! How are you John?".

Il est à noter que des variables supplémentaires spécifiques uniquement au template inclus peuvent être spécifiées en utilisant le mot-clé `with` :

```html
{% include "path/to/my_snippet.html" with new_var="hello" %}
```

Plusieurs variables peuvent également être spécifiées si nécessaire. Dans ce cas, les assignations de variables doivent être séparées par des virgules. Par exemple :

```html
{% include "path/to/my_snippet.html" with var1="foo", var2="bar" %}
```

De plus, il est important de noter que l'accessibilité des variables de contexte externe pour les templates inclus dépend de la valeur du paramètre [`templates.isolated_inclusions`](../../development/reference/settings.md#isolated_inclusions). Par défaut, ce paramètre est défini à `false`, ce qui signifie que les templates inclus ont accès aux variables de contexte externe. Cependant, il est important de noter que ce comportement peut être modifié pour chaque inclusion, quelle que soit la valeur du paramètre [`templates.isolated_inclusions`](../../development/reference/settings.md#isolated_inclusions). Cela peut être réalisé en ajoutant le modificateur `isolated` pour spécifier que le template inclus ne doit pas accéder au contexte externe, ou en utilisant le modificateur `contextual` pour indiquer qu'il doit y avoir accès. Par exemple :

```html
<!-- The included snippet does not have access to the outer context. -->
{% include "path/to/my_snippet.html" with new_var="hello" isolated %}

<!-- The included snippet has access to the outer context. -->
{% include "path/to/my_snippet.html" with new_var="hello" contextual %}
```

:::caution
Les templates inclus en utilisant le tag de template `include` sont analysés et rendus _lorsque_ le template incluant est également rendu. Les templates inclus ne sont pas analysés lorsque le template incluant est analysé lui-même. Cela signifie que le template incluant et le template inclus sont toujours rendus _séparément_.
:::

## `localize`

Le tag de template `localize` permet d'effectuer la localisation de valeurs telles que les dates, les nombres et les heures en utilisant le [gem I18n](https://crystal-i18n.github.io/localization.html), qui est utilisé par Marten pour ses [fonctionnalités d'internationalisation](../../i18n/introduction.md). Il doit prendre au moins un argument (la valeur à localiser) suivi d'un argument optionnel de mot-clé `format`.

Par exemple, les lignes suivantes sont des utilisations valides du tag `localize` :

```html
{% localize created_at %}
{% localize price format: "currency" %}
```

Les valeurs fournies et l'argument `format` peuvent également être résolus comme variables de template, mais ils peuvent aussi être définis comme valeurs littérales si nécessaire. L'argument `format` doit correspondre à une clé définie dans le fichier de locale.

Optionnellement, le résultat de la localisation peut être assigné à une variable spécifique en utilisant le mot-clé `as` :

```html
{% localize created_at format: "short" as localized_date %}
```

## `l`

Alias pour [`localize`](#localize).

## `local_time`

Le tag de template `local_time` permet d'afficher la représentation en chaîne de l'heure locale. Il doit prendre un argument (le [format](https://crystal-lang.org/api/Time/Format.html) utilisé pour afficher l'heure).

Par exemple, les lignes suivantes sont des utilisations valides du tag `local_time` :

```html
{% local_time "%Y" %}
{% local_time "%Y-%m-%d %H:%M:%S %:z" %}
```

Optionnellement, la sortie de ce tag peut être assignée à une variable spécifique en utilisant le mot-clé `as` :

```html
{% local_time "%Y" as current_year %}
```

## `method_input`

Le tag de template `method_input` crée un champ de formulaire caché. Ce champ a le nom `_method` et reçoit la valeur fournie par le premier argument du tag.

Par exemple :

```html
<form action="/articles/create" method="post">
  {% method_input "DELETE" %}
</form>
<!--
<form action="/articles/create" method="post">
  <input type="hidden" name="_method" value="DELETE">
</form>
-->
```

## `reverse`

Alias pour [`url`](#url).

## `spaceless`

Le tag de template `spaceless` permet de supprimer les espaces, tabulations et retours à la ligne entre les tags HTML. Les espaces à l'intérieur des tags sont laissés intacts. Il est à noter que le tag de template `spaceless` nécessite un tag de fermeture `endspaceless`.

Par exemple :

```html
{% spaceless %}
    <p>
        <a href="/sign-in">Sign In</a>
    </p>
{% endspaceless %}
```

Produirait la sortie suivante :

```html
<p><a href="/sign-in">Sign In</a></p>
```

## `super`

Le tag de template `super` permet de rendre le contenu d'un bloc d'un template parent (dans une situation où les tags `extend` et `block` sont utilisés). Cela peut être utile dans les situations où les blocs d'un template enfant doivent étendre (ajouter du contenu) le contenu d'un bloc parent au lieu de le remplacer. Voir [Héritage de templates](../introduction.md#héritage-de-templates) pour en savoir plus sur cette fonctionnalité.

## `translate`

Le tag de template `translate` permet d'effectuer des recherches de traduction en utilisant la [configuration I18n](../../development/reference/settings.md#i18n-settings) du projet. Il doit prendre au moins un argument (la clé de traduction) suivi d'arguments de mots-clés.

Par exemple, les lignes suivantes sont des utilisations valides du tag `translate` :

```html
{% translate "simple.translation" %}
{% translate "simple.interpolation" value: 'test' %}
```

Les clés de traduction et les valeurs de paramètres peuvent également être résolues comme variables de template, mais elles peuvent aussi être définies comme valeurs littérales si nécessaire.

Optionnellement, les traductions résolues peuvent être assignées à une variable spécifique en utilisant le mot-clé `as` :

```html
{% translate "simple.interpolation" value: 'test' as my_var %}
```

## `trans`

Alias pour [`translate`](#translate).

## `t`

Alias pour [`translate`](#translate).

## `unless`

Le tag de template `unless` permet de définir des conditions contrôlant quels blocs doivent être exécutés. Un tag `unless` doit toujours commencer par une condition `unless`, suivie d'un bloc final `else` optionnel. Il nécessite également un tag de fermeture `endunless`.

Par exemple :

```html
{% unless my_var == 0 %}
  Other value!
{% else %}
  Zero!
{% endunless %}
```

Le tag de template `unless` supporte les mêmes [opérateurs](./operators.md) que ceux supportés par le tag de template [`if`](#if).

## `url`

Le tag de template `url` permet d'effectuer des [résolutions d'URL](../../handlers-and-http/routing.md#reverse-url-resolutions). Il doit prendre au moins un argument (le nom du handler ciblé) suivi d'arguments de mots-clés optionnels (si la route nécessite des paramètres).

Par exemple, les lignes suivantes sont des utilisations valides du tag `url` :

```html
{% url "my_handler" %}
{% url "my_other_handler" arg1: var1, arg2: var2 %}
```

Les noms d'URL et les valeurs de paramètres peuvent également être résolus comme variables de template, mais ils peuvent aussi être définis comme valeurs littérales si nécessaire.

Optionnellement, les URL résolues peuvent être assignées à une variable spécifique en utilisant le mot-clé `as` :

```html
{% url "my_other_handler" arg1: var1, arg2: var2 as my_var %}
```

## `verbatim`

Le tag de template `verbatim` empêche le contenu du tag d'être traité par le moteur de templates. Il est à noter que le tag de template `verbatim` nécessite un tag de fermeture `endverbatim`.

Par exemple :

```
{% verbatim %}
  This should not be {{ processed }}.
{% endverbatim  %}
```

Produirait la sortie `This should not be {{ processed }}.`.

## `with`

Le tag de template `with` assigne une ou plusieurs variables à l'intérieur d'un bloc. Après la fin du bloc, les variables du bloc ne sont plus disponibles.

Par exemple :

```
{% with x = 'Hello World', y = 1 %}
  {{ x }} {{ y }}!
{% endwith %}
```

Produirait la sortie `Hello World 1!`.
