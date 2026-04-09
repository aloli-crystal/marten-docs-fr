---
title: Remerciements
description: Remerciements et attributions relatifs aux projets et concepts qui ont inspiré le framework web Marten.
---

Cette section répertorie et reconnaît les différents projets qui ont inspiré le framework web Marten, ainsi que les contributions notables.

## Inspirations

Le framework web Marten implémente un ensemble d'idées et d'API qui sont inspirées par l'excellent travail réalisé dans deux frameworks en particulier : [Django](https://www.djangoproject.com/) et [Ruby on Rails](https://rubyonrails.org/). Il peut être facile de tenir pour acquis ce que ces frameworks fournissent, et nous ne devons pas oublier de rendre à César ce qui appartient à César.

### Django

Le framework web Marten emprunte beaucoup à [Django](https://www.djangoproject.com/) - sa plus grande source d'inspiration :

* Le triptyque [Model](../models-and-databases.mdx)-[Handler](../handlers-and-http.mdx)-[Template](../templates.mdx) est la vision de Marten du pattern Model-View-Template (MVT) fourni par Django
* Le mécanisme de [migrations auto-générées](../models-and-databases/migrations.md) est inspiré d'un mécanisme similaire dans Django
* Les [handlers génériques](../handlers-and-http/generic-handlers.md) sont inspirés des vues génériques basées sur des classes de Django
* La syntaxe des templates est inspirée du langage de templates de Django
* Le concept d'[applications](../development/applications.md) et de projets est également hérité de Django

Inutile de dire que ceci est une liste non exhaustive.

### Ruby on Rails

Le framework web Marten est également inspiré par [Ruby on Rails](https://rubyonrails.org/) sur certains aspects. Parmi ceux-ci, nous pouvons mentionner :

* Le [DSL générique de validation](../models-and-databases/validations.md)
* La plupart des [callbacks de modèle](../models-and-databases/callbacks.md)
* L'idée des [encrypteurs de messages](pathname:///api/dev/Marten/Core/Encryptor.html) et des [signeurs de messages](pathname:///api/dev/Marten/Core/Signer.html)

### Mais aussi...

* La page d'exception affichée en mode [debug](../development/reference/settings.md#debug) est inspirée du shard [Exception Page](https://github.com/crystal-loot/exception_page)
* La manière de [gérer les objets personnalisés](../templates/introduction.md#using-custom-objects-in-contexts) dans les templates Marten est inspirée d'un mécanisme similaire dans [Crinja](https://github.com/straight-shoota/crinja)
* L'idée de [définitions d'emails](../emailing/introduction.md) basées sur des classes est empruntée à [Carbon](https://github.com/luckyframework/carbon)

## Contributeurs

Merci à tous les [contributeurs](https://github.com/martenframework/marten/contributors) du projet !
