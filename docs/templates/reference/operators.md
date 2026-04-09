---
title: Opérateurs
description: Référence des opérateurs.
---

Cette page fournit une référence pour tous les opérateurs disponibles qui peuvent être utilisés lors de la définition de conditions dans les templates avec les tags [`if`](./tags.md#if) et [`unless`](./tags.md#unless).

## Opérateurs d'égalité et de comparaison

Les opérateurs d'égalité et de comparaison suivants peuvent être utilisés :

| Opérateur | Description |
| -------- | ----------- |
| `==` | Égal |
| `!=` | Différent |
| `>` | Supérieur à |
| `>=` | Supérieur ou égal à |
| `<` | Inférieur à |
| `<=` | Inférieur ou égal à |

Par exemple :

```html
{% if my_var == 0 %}
  Zero!
{% elsif my_var >= 1 %}
  One or greater!
{% else %}
  Other!
{% endif %}
```

## Opérateurs logiques

Les opérateurs logiques suivants peuvent être utilisés :

| Opérateur | Description |
| -------- | ----------- |
| `&&` | ET logique |
| `\|\|` | OU logique |
| `!` ou `not` | Négation logique |

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

## Opérateur d'inclusion

L'opérateur `in` est l'opérateur d'inclusion qui peut être utilisé dans les conditions [`if`](./tags.md#if) ou [`unless`](./tags.md#unless). Cet opérateur permet de vérifier la présence d'une sous-chaîne dans une autre chaîne ou la présence d'une valeur dans un tableau ou un tuple.

Par exemple :

```html
{% if "Top 10" in blog.title %}
Top 10 blog article
{% endif %}

{% if "red" in colors %}
Red color available
{% endif %}
```
