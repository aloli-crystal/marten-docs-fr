---
title: Introduction à l'internationalisation
description: Apprenez à utiliser les traductions et les contenus localisés dans vos projets Marten.
sidebar_label: Introduction
---

Marten fournit une intégration avec [crystal-i18n](https://crystal-i18n.github.io/) pour rendre possible l'utilisation de traductions et de contenu localisé dans vos projets Marten.

## Vue d'ensemble

L'internationalisation et la localisation sont des techniques permettant à un site web de fournir du contenu en utilisant des langues et des formats adaptés à des audiences spécifiques.

L'intégration d'internationalisation et de localisation de Marten repose sur l'utilisation du shard [crystal-i18n](https://crystal-i18n.github.io/), qui fournit une interface unifiée permettant d'utiliser des traductions et du contenu localisé dans un projet Crystal. Vous n'avez pas besoin d'installer manuellement ce shard dans vos projets : c'est une dépendance du framework lui-même, et en tant que tel, il est automatiquement installé avec Marten.

Crystal-I18n facilite la configuration de traductions et de formats pour un ensemble spécifique de locales. Ceux-ci peuvent être utilisés pour effectuer des recherches de traduction et de la localisation. Avec cette bibliothèque, les traductions peuvent être définies via l'utilisation de "loaders" dédiés (des abstractions qui chargent les traductions depuis une source spécifique et les rendent disponibles à l'API I18n). Par exemple, les traductions peuvent être chargées depuis un fichier YAML, un fichier JSON, ou quelque chose d'entièrement différent si nécessaire.

Marten lui-même définit un ensemble de contenus traduits pour les choses qui doivent être internationalisées (ex. les erreurs de champs de modèle ou les erreurs de champs de schema) qui sont chargés via l'utilisation du loader YAML standard. Les autres [traductions spécifiques aux applications](#locales-et-applications) doivent également être définies comme des fichiers YAML puisqu'elles sont chargées en utilisant un loader YAML également.

## Configuration

Marten fournit une intégration permettant de configurer les paramètres liés à l'internationalisation. Ces paramètres sont disponibles sous le namespace [`i18n`](../development/reference/settings.md#i18n-settings) et permettent de définir des choses comme la locale par défaut et les locales disponibles :

```crystal
config.i18n.default_locale = :fr
config.i18n.available_locales = [:en, :fr]
```

Vous pouvez également utiliser les [diverses options de configuration](https://crystal-i18n.github.io/configuration.html) fournies par ce shard pour configurer davantage la façon dont les traductions doivent être effectuées. Ce faisant, vous pouvez ajouter plus de loaders de backend I18n personnalisés par exemple.

:::tip
Si vous avez besoin de [configurer Crystal I18n](https://crystal-i18n.github.io/configuration.html) davantage, vous devriez probablement définir un fichier d'initialisation dédié sous le dossier `config/initializers`.
:::

## Utilisation basique

Comme indiqué précédemment, Marten s'appuie sur le shard [crystal-i18n](https://crystal-i18n.github.io/), ce qui signifie que vous pouvez également consulter la documentation dédiée pour en savoir plus sur ce shard et ses options de configuration. La section suivante met principalement en évidence certaines des principales fonctionnalités de cette bibliothèque.

### Définir des traductions {#defining-translations}

Les traductions sont définies comme des fichiers YML qui doivent être placés dans des dossiers `locales`, qui peuvent être situés à différents endroits d'un projet :

* Dans le répertoire `config` (dossier `config/locales`).
* À la racine du répertoire de l'[application principale](../development/applications.md#lapplication-principale) (dossier `src/locales`).
* À la racine du répertoire d'une [application](../development/applications.md#créer-des-applications).

Par exemple, si vous utilisez le répertoire `config` standard et l'[application principale](../development/applications.md#lapplication-principale) (qui correspond au dossier standard `src`) vous pourriez définir des dossiers `config/locales` et `src/locales` contenant des fichiers `en.yml` comme suit :

```
myproject/
├── config
│   ├── locales
│   │   ├── en.yml
├── src
│   ├── locales
│   │   ├── en.yml
```

Les traductions à l'intérieur d'un fichier YAML doivent être namespacées avec la locale à laquelle elles sont associées (`en` dans ce cas). Un exemple de contenu pour notre fichier `en.yml` pourrait ressembler à ceci :

```yaml title=src/en.yml
en:
  message: "This is a message"
  simple:
    translation: "This is a simple translation"
    interpolation: "Hello, %{name}!"
```

Le "chemin" menant à une traduction dans de tels fichiers est important car il correspond à la clé qui doit être utilisée lors des [recherches de traduction](#recherches-de-traduction). Par exemple, `simple.translation` serait la clé à utiliser pour traduire le message correspondant.

Il convient de noter que la syntaxe `%{var}` dans l'exemple ci-dessus est utilisée pour définir des _interpolations_ : ces variables doivent être spécifiées lors des recherches de traduction afin que leurs valeurs soient insérées dans les chaînes traduites.

### Recherches de traduction

Les recherches de traduction peuvent être effectuées en utilisant les méthodes `I18n#translate` ou `I18n#translate!`. Ces méthodes essaient de trouver une traduction correspondante pour une clé spécifique, qui peut être composée de plusieurs namespaces ou portées séparés par un point (.) : cette clé correspond au "chemin" menant à la traduction réelle (comme mentionné précédemment).

Les méthodes `I18n#translate` et `I18n#translate!` diffèrent dans leur façon de gérer les traductions manquantes :

* `I18n#translate` retourne un message indiquant que la traduction est manquante
* `I18n#translate!` lève une exception spécifique

Par exemple, étant donné les traductions définies dans [Définir des traductions](#définir-des-traductions), nous pourrions effectuer les recherches de traduction suivantes :

```crystal
I18n.translate(:message)                                 # => "This is a message"
I18n.translate("simple.translation")                     # => "This is a simple translation"
I18n.translate("simple.interpolation", name: "John Doe") # => "Hello, John Doe!"
```

Cela ne fait qu'effleurer la surface de ce qui est possible en termes de recherches de traduction. Vous pouvez consulter la [documentation dédiée](https://crystal-i18n.github.io/translation_lookups.html), et plus spécifiquement les sections [interpolations](https://crystal-i18n.github.io/translation_lookups.html#interpolations) et [pluralisations](https://crystal-i18n.github.io/translation_lookups.html#pluralization), pour en savoir plus sur ces capacités.

### Localisation

La localisation des dates/heures et des nombres peut être réalisée via l'utilisation de la méthode `I18n#localize`. Dans les deux cas, des _formats_ de localisation doivent être définis dans vos fichiers de locale. Il existe de nombreux formats disponibles à votre disposition (et tous sont documentés dans la [documentation associée](https://crystal-i18n.github.io/localization.html)). Par exemple, les traductions suivantes pourraient être utilisées pour formater les dates en anglais :

```yaml
en:
  i18n:
    date:
      month_names: [January, February, March, April, May, June,
                    July, August, September, October, November, December]
      formats:
        default: "%Y-%m-%d"
        long: "%B %d, %Y"
```

La structure ci-dessus est attendue par Crystal I18n et définit des traductions basiques pour les directives pertinentes qui peuvent être produites lors de la localisation de dates. Elle définit également quelques formats sous la portée `i18n.date.formats` : parmi ces formats, seul celui par défaut est vraiment obligatoire puisque c'est celui qui est utilisé par défaut si aucun autre format n'est explicitement fourni à la méthode `I18n#localize`. Tous ces formats utilisent les directives définies par le struct [`Time::Format`](https://crystal-lang.org/api/Time/Format.html).

Étant donné les traductions ci-dessus, vous pourriez localiser les objets date comme suit :

```crystal
I18n.localize(Time.local.date)        # outputs "2020-12-13"
I18n.localize(Time.local.date, :long) # outputs "December 13, 2020"
```

### Changer de locale

Une fois que vous avez défini des traductions, il est généralement nécessaire d'"activer" explicitement l'utilisation d'une locale spécifique afin de s'assurer que les bonnes traductions sont générées pour vos utilisateurs. Dans cette optique, la locale actuelle peut être spécifiée en utilisant la méthode `I18n#activate` :

```crystal
I18n.activate(:fr)
```

Lors de l'activation d'une locale avec `I18n#activate`, toutes les traductions ou localisations ultérieures seront effectuées en utilisant la locale spécifiée.

Notez qu'il est également possible d'exécuter un bloc avec une locale spécifique activée. Cela peut être fait en utilisant la méthode `I18n#with_locale` :

```crystal
I18n.with_locale(:fr) do
  I18n.t("simple.translation") # Affichera un texte en français
end
```

Enfin, il convient de noter que Marten fournit un [middleware I18n](../handlers-and-http/reference/middlewares.md#i18n-middleware) qui active la bonne locale en se basant sur l'en-tête Accept-Language. Seules les locales explicitement configurées peuvent être activées par ce middleware (c'est-à-dire les locales spécifiées dans les paramètres [`i18n.available_locales`](../development/reference/settings.md#available_locales) et [`i18n.default_locale`](../development/reference/settings.md#default_locale)). Si la locale entrante ne peut pas être trouvée dans la configuration du projet, la locale par défaut sera utilisée à la place. En utilisant ce middleware, vous pouvez être sûr que la bonne locale est automatiquement activée pour vos utilisateurs, vous n'avez donc pas besoin de vous en occuper.

## Locales et applications

Comme mentionné précédemment, chaque [application](../development/applications.md) peut définir des traductions dans un dossier `locales` qui doit être situé à la racine du répertoire de l'application. Ce dossier `locales` doit contenir des fichiers YAML définissant les traductions requises par l'application.

La façon d'organiser les traductions à l'intérieur de ce dossier est laissée aux développeurs d'applications. Cela dit, il est nécessaire de s'assurer que tous les fichiers YAML contenant des traductions sont namespacés avec la locale ciblée (ex. `en`, `fr`, etc).

De plus, il est également recommandé de namespacer explicitement les traductions d'une application en utilisant un identifiant unique pour l'application considérée. Par exemple, une application `foo` pourrait définir une traduction `message` et une autre application `bar` pourrait définir une traduction `message` également. Si ces clés de traduction ne sont pas correctement namespacées, l'une des traductions sera écrasée par celle de l'autre application. La meilleure façon d'éviter cela est de namespacer toutes les traductions d'une application avec l'identifiant de l'application elle-même. Par exemple :

```yaml
en:
  foo:
    message: This is a message
```

Dans ce cas, le codebase de l'application `foo` demanderait des traductions en utilisant la clé `foo.message`, ce qui rend impossible les problèmes de conflit avec les traductions d'autres applications.

## Comment Marten résout la locale actuelle

Marten tentera de déterminer la locale "actuelle" pour l'activation uniquement lorsque le [middleware I18n](../handlers-and-http/reference/middlewares.md#i18n-middleware) est utilisé.

Ce middleware peut activer la locale appropriée en considérant les éléments suivants :

* La valeur de l'en-tête Accept-Language.
* La valeur d'un cookie, dont le nom est défini par le paramètre [`i18n.locale_cookie_name`](../development/reference/settings.md#locale_cookie_name).


Le [middleware I18n](../handlers-and-http/reference/middlewares.md#i18n-middleware) n'autorise l'activation que des locales explicitement configurées, qui sont spécifiées dans les paramètres [`i18n.available_locales`](../development/reference/settings.md#available_locales) et [`i18n.default_locale`](../development/reference/settings.md#default_locale). Si la locale entrante n'est pas trouvée dans la configuration du projet, la locale par défaut sera utilisée à la place. En utilisant ce middleware, vous pouvez être sûr que la bonne locale est automatiquement activée pour vos utilisateurs, de sorte que vous n'avez pas besoin de vous en occuper.

## Limitations

Il est important d'être conscient de quelques limitations lorsque vous travaillez avec des traductions alimentées par [Crystal I18n](https://crystal-i18n.github.io/) au sein d'un projet Marten :

1. Marten configure automatiquement les loaders de traduction YAML pour les applications, et il n'est actuellement pas possible d'utiliser d'autres types de loaders (comme JSON) pour le moment
2. Marten ne permet pas l'utilisation de traductions "embarquées" pour les applications puisque celles-ci sont découvertes et configurées à l'exécution : ainsi les traductions d'application sont traitées comme des "assets" qui doivent être déployés avec le binaire compilé

Notez que ces restrictions n'empêchent pas l'utilisation de backends de traduction personnalisés si nécessaire. Veuillez consulter la [documentation associée](https://crystal-i18n.github.io/configuration.html#loaders) si vous avez besoin d'utiliser des loaders de traduction personnalisés dans vos projets.
