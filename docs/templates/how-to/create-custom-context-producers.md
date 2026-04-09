---
title: Créer des context producers personnalisés
sidebar_label: Créer des context producers
description: Comment créer des context producers personnalisés.
---

Marten dispose d'un support intégré pour les [context producers](../reference/context-producers.md) courants, mais le framework vous permet également d'écrire vos propres context producers que vous pouvez utiliser dans les templates de votre projet. Cela vous permet de réutiliser facilement des valeurs de contexte communes dans plusieurs templates.

## Définir un context producer

Définir un context producer implique de créer une sous-classe de la classe abstraite [`Marten::Template::ContextProducer`](https://martenframework.com/docs/api/dev/Marten/Template/ContextProducer.html). Cette classe abstraite exige que les sous-classes implémentent une seule méthode [`#produce`](https://martenframework.com/docs/api/dev/Marten/Template/ContextProducer.html#produce(request%3AHTTP%3A%3ARequest%3F%3Dnil)-instance-method) : cette méthode prend un objet requête optionnel comme argument et doit retourner soit :

* un hash ou un named tuple contenant les valeurs à contribuer au contexte du template
* ou `nil` si aucune valeur ne peut être générée pour la requête passée

Par exemple, le context producer suivant exposerait la valeur du paramètre [`debug`](../../development/reference/settings.md#debug) à tous les contextes de template créés :

```crystal
class Debug < Marten::Template::ContextProducer
  def produce(request : Marten::HTTP::Request? = nil)
    {"debug" => Marten.settings.debug}
  end
end
```

## Activer des context producers

Comme mentionné dans [Utilisation des context producers](../introduction.md#utilisation-des-context-producers), les classes de context producers doivent être ajoutées au paramètre [`templates.context_producers`](../../development/reference/settings.md#context_producers) pour être utilisées par le moteur de templates de Marten lors de l'initialisation de nouveaux objets de contexte.
