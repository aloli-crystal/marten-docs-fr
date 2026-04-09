---
title: Créer des backends d'emailing
description: Comment créer des backends d'emailing personnalisés.
---

Marten vous permet de créer facilement des [backends d'emailing](../introduction.md#backends-demailing) personnalisés que vous pouvez ensuite utiliser dans votre application pour l'envoi d'emails.

## Définition basique d'un backend

Définir un backend d'emailing est aussi simple que de créer une classe qui hérite de la classe abstraite [`Marten::Emailing::Backend::Base`](https://martenframework.com/docs/api/dev/Marten/Emailing/Backend/Base.html) et qui implémente une méthode `#deliver` unique. Cette méthode prend un seul argument `email` (instance de [`Marten::Emailing::Email`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html)), correspondant à l'email à envoyer.

Par exemple :

```crystal
class CustomEmailingBackend < Marten::Emailing::Backend::Base
  def deliver(email : Email)
    # Envoyer l'email !
  end
end
```

## Activer l'utilisation de backends d'emailing personnalisés

Les backends d'emailing personnalisés peuvent être utilisés en assignant une instance de la classe correspondante au paramètre [`emailing.backend`](../../development/reference/settings.md#backend-1).

Par exemple :

```crystal
config.emailing.backend = CustomEmailingBackend.new
```
