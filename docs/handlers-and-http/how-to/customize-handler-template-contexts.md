---
title: Personnaliser les contextes de template des handlers
sidebar_label: Personnaliser les contextes des handlers
description: Comment personnaliser les contextes de template des handlers.
---

Ce guide explique comment personnaliser facilement le [contexte de template](../../templates/introduction.md) des handlers impliquant des rendus de templates et comment y ajouter des variables. Cela vous permettra d'exploiter des variables personnalisées dans vos templates de handler et de manipuler facilement l'apparence et le contenu de vos pages web, en les adaptant à vos besoins et préférences spécifiques.

## Prérequis

Il est possible de personnaliser le contexte de template utilisé par la plupart des handlers impliquant des rendus de templates. C'est le cas pour :

* Les handlers qui utilisent la méthode d'aide [`#render`](../introduction.md#render).
* Les handlers qui héritent des handlers génériques [`Marten::Handlers::Template`](../reference/generic-handlers.md#rendu-dun-template), [`Marten::Handlers::Schema`](../reference/generic-handlers.md#traitement-dun-schéma), [`Marten::Handlers::RecordCreate`](../reference/generic-handlers.md#création-dun-enregistrement), [`Marten::Handlers::RecordDetail`](../reference/generic-handlers.md#affichage-dun-enregistrement), [`Marten::Handlers::RecordUpdate`](../reference/generic-handlers.md#mise-à-jour-dun-enregistrement) ou [`Marten::Handlers::RecordDelete`](../reference/generic-handlers.md#suppression-dun-enregistrement).

## Personnaliser le contexte de template d'un handler

Si votre handler respecte les [prérequis](#prérequis) mentionnés ci-dessus, alors la manière la plus simple de personnaliser les variables rendues disponibles au contexte de template considéré est d'utiliser le callback [`#before_render`](../callbacks.md#before_render).

Ce callback est invoqué avant le rendu d'un template lors de la génération d'une réponse qui incorpore son contenu. Cela signifie qu'il peut être utilisé pour ajouter de nouvelles variables au [contexte de template global du handler](../introduction.md#contexte-de-template-global) afin qu'elles deviennent accessibles au runtime du template.

Par exemple :

```crystal
class MyHandler < Marten::Handlers::Template
  template_name "app/my_template.html"
  before_render :add_foo_to_context

  private def add_foo_to_context : Nil
    context["foo"] = "bar"
  end
end
```

Dans l'extrait ci-dessus, un handler très simple (qui hérite du handler générique [`Marten::Handlers::Template`](../reference/generic-handlers.md#rendu-dun-template)) définit un callback [`#before_render`](../callbacks.md#before_render) dans lequel une variable `foo` est ajoutée au contexte de template.

## Un exemple concret : lien actuellement actif dans les sections de navigation

Pour illustrer cette fonctionnalité, considérons un scénario simple impliquant des sections de navigation. Typiquement, il est essentiel de déterminer l'élément actuellement actif dans la navigation. Cela peut être facilement accompli en utilisant une variable de template dédiée.

Par exemple, supposons que notre template de navigation ressemble à ceci :

```html
<nav class="navbar navbar-light">
  <div class="container">
    <ul class="nav navbar-nav">
      <li class="nav-item">
        <a class="nav-link{% if nav_bar_item == 'home' %} active{% endif %}" href="/">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link{% if nav_bar_item == 'sign_in' %} active{% endif %}" href="{% url 'auth:sign_in' %}">Sign in</a>
      </li>
      <li class="nav-item">
        <a class="nav-link{% if nav_bar_item == 'sign_up' %} active{% endif %}" href="{% url 'auth:sign_up' %}">Sign up</a>
      </li>
    </ul>
  </div>
</nav>
```

Ce template utilise une variable `nav_bar_item` pour déterminer l'élément de barre de navigation actuellement actif et applique une classe CSS dédiée `active` au lien correspondant en fonction de la valeur de cette variable.

Pour que cette navigation fonctionne comme prévu, nous devons nous assurer que les handlers applicables définissent les variables de template `nav_bar_item`. Nous pourrions utiliser la méthode décrite précédemment et simplement définir un callback [`#before_render`](../callbacks.md#before_render) dans les handlers qui ont besoin de définir cette variable de template. Une meilleure solution serait cependant de définir un module concern qui facilite ce processus.

Par exemple, nous pourrions définir un module `NavBarActiveable` qui définit automatiquement la variable de template `nav_bar_item` en fonction de la valeur d'une variable de classe définie par les classes de handler qui l'utilisent :

```crystal
module NavBarActiveable
  macro included
    class_getter nav_bar_item : String?

    extend NavBarActiveable::ClassMethods

    before_render :add_nav_bar_item_to_context
  end

  module ClassMethods
    def nav_bar_item(item : String | Symbol)
      @@nav_bar_item = item.to_s
    end
  end

  private def add_nav_bar_item_to_context
    context[:nav_bar_item] = self.class.nav_bar_item
  end
end
```

En utilisant cette approche, définir la variable `nav_bar_item` dans un handler serait aussi simple qu'inclure le module `NavBarActiveable` dans la classe de handler et appeler la méthode `#nav_bar_item` :

```crystal
class MyHandler < Marten::Handlers::Template
  include NavBarActiveable

  template_name "app/my_template.html"
  nav_bar_item :home
end
```
