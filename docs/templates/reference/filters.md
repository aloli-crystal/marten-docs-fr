---
title: Filters de template
description: Référence des filters de template.
---

Cette page fournit une référence pour tous les filters disponibles qui peuvent être utilisés lors de la définition de [templates](../introduction.md).

## `capitalize`

Le filter `capitalize` permet de modifier une chaîne de caractères de sorte que la première lettre soit convertie en majuscule et que toutes les lettres suivantes soient converties en minuscules.

Par exemple :

```html
{{ value|capitalize }}
```

Si `value` est "marten", la sortie sera "Marten".

## `default`

Le filter `default` permet de revenir à une valeur spécifique si le côté gauche de l'expression de filter est vide ou non véridique. Un argument de filter est obligatoire. Il est à noter que les chaînes vides sont considérées comme véridiques et seront retournées par ce filter.

Par exemple :

```html
{{ value|default:"foobar" }}
```

Si `value` est `nil` (ou `0` ou `false`), la sortie sera "foobar".

## `downcase`

Le filter `downcase` permet de convertir une chaîne de caractères de sorte que chacun de ses caractères soit en minuscule.

Par exemple :

```html
{{ value|downcase }}
```

Si `value` est "Hello", alors la sortie sera "hello".

## `escape`

Le filter `escape` remplace les caractères spéciaux (à savoir `&`, `<`, `>`, `"` et `'`) dans la variable de template par leurs entités HTML correspondantes.

Par exemple :

```html
{{ value|escape }}
```

Si `value` est `<b>Let's do it</b>`, alors la sortie sera `&lt;b&gt;Let&#39;s do it&lt;/b&gt;`.

## `join`

Le filter `join` convertit un tableau d'éléments en une chaîne séparée par `arg`.

Par exemple :

```html
{{ value|join: arg }}
```

Si `value` est `["Bananas","Apples","Oranges"]` et `arg` est `, `, alors la sortie sera "Bananas, Apples, Oranges".

## `linebreaks`

Le filter `linebreaks` permet de convertir une chaîne en remplaçant tous les retours à la ligne par des sauts de ligne HTML (`<br />`).

Par exemple :

```html
{{ value|linebreaks }}
```

Si `value` est `Hello\nWorld`, alors la sortie sera `Hello<br />World`.

## `safe`

Le filter `safe` permet de marquer qu'une chaîne est sûre et qu'elle ne doit pas être échappée avant d'être insérée dans la sortie finale d'un template rendu. En effet, les valeurs de chaînes sont toujours automatiquement échappées en HTML par défaut dans les templates.

Par exemple :

```html
{{ value|safe }}
```

Si `value` est `<p>Hello</p>`, alors la sortie sera également `<p>Hello</p>`.

## `size`

Le filter `size` permet de retourner la taille d'une chaîne ou d'un objet énumérable.

Par exemple :

```html
{{ value|size }}
```

## `split`

Le filter `split` convertit une chaîne en un tableau d'éléments séparés par `arg`.

Par exemple :

```html
{{ value|split: arg }}
```

Si `value` est `Bananas,Apples,Oranges` et `arg` est `,`, alors la sortie sera ["Bananas","Apples","Oranges"].

## `time`

Le filter `time` permet d'afficher la représentation en chaîne d'une variable temporelle. Il nécessite la spécification d'un argument de filter, qui est la chaîne de format utilisée pour formater l'heure (dont les directives disponibles font partie de [`Time::Format`](https://crystal-lang.org/api/Time/Format.html)).

```html
{{ value | time: "%Y-%m-%d" }}
```

Dans l'exemple ci-dessus, la sortie sera une chaîne de date telle que `2023-09-25`.

## `underscore`

Le filter `underscore` permet de convertir une chaîne en sa version avec des tirets bas.

Par exemple :

```html
{{ value|underscore }}
```

Si `value` est "FooBar", alors la sortie sera "foo_bar".

## `upcase`

Le filter `upcase` permet de convertir une chaîne de caractères de sorte que chacun de ses caractères soit en majuscule.

Par exemple :

```html
{{ value|upcase }}
```

Si `value` est "Hello", alors la sortie sera "HELLO".
