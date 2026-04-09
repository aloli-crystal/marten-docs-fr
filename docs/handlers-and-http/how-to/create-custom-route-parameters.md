---
title: Créer des paramètres de route personnalisés
description: Comment créer des paramètres de route personnalisés.
---

Bien que Marten prenne en charge nativement les [paramètres de route courants](../routing.md#spécifier-les-paramètres-de-route), il est également possible d'implémenter vos propres types de paramètres. Cela peut être nécessaire si vos routes ont des exigences de correspondance plus complexes.

## Définir un paramètre de route

Pour implémenter des paramètres personnalisés, vous devez sous-classer la classe abstraite [`Marten::Routing::Parameter::Base`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html). Chaque classe de paramètre est responsable de :

* définir une Regex permettant de faire correspondre les paramètres dans les chemins bruts (ce qui peut être fait en implémentant une méthode [`#regex`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html#regex%3ARegex-instance-method))
* définir _comment_ la valeur du paramètre de route doit être désérialisée (ce qui peut être fait en implémentant une méthode [`#loads`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html#loads(value%3A%3A%3AString)-instance-method))
* définir _comment_ la valeur du paramètre de route doit être sérialisée (ce qui peut être fait en implémentant une méthode [`#dumps`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html#dumps(value)%3A%3A%3AString%3F-instance-method))

La méthode [`#regex`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html#regex%3ARegex-instance-method) ne prend aucun argument et doit retourner un objet [`Regex`](https://crystal-lang.org/api/Regex.html) valide.

La méthode [`#loads`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html#loads(value%3A%3A%3AString)-instance-method) prend le paramètre brut (chaîne de caractères) comme argument et est censée retourner l'objet Crystal final correspondant au paramètre de route (c'est l'objet qui sera transmis au handler dans le hash des paramètres de route).

La méthode [`#dumps`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter/Base.html#dumps(value)%3A%3A%3AString%3F-instance-method) prend l'objet final du paramètre de route comme argument et doit retourner la représentation en chaîne de caractères correspondante. Notez que cette méthode peut retourner soit une chaîne soit `nil` : `nil` signifie que la valeur passée n'a pas pu être sérialisée correctement, ce qui fera échouer toute résolution inversée d'URL avec une erreur `Marten::Routing::Errors::NoReverseMatch`.

Par exemple, un paramètre de route « année » (1000-2999) pourrait être implémenté comme suit :

```crystal
class YearParameter < Marten::Routing::Parameter::Base
  def regex : Regex
    /[12][0-9]{3}/
  end

  def loads(value : ::String) : UInt64
    value.to_u64
  end

  def dumps(value) : Nil | ::String
    if value.as?(UInt8 | UInt16 | UInt32 | UInt64)
      value.to_s
    elsif value.is_a?(Int8 | Int16 | Int32 | Int64) && [1000..2999].includes?(value)
      value.to_s
    else
      nil
    end
  end
end
```

## Enregistrer des paramètres de route

Pour pouvoir utiliser des paramètres de route personnalisés dans vos [définitions de routes](../routing.md#spécifier-les-paramètres-de-route), vous devez les enregistrer dans le registre global des paramètres de routage de Marten.

Pour ce faire, vous devrez appeler la méthode [`Marten::Routing::Parameter#register`](https://martenframework.com/docs/api/dev/Marten/Routing/Parameter.html#register(id%3A%3A%3AString|Symbol%2Cparameter_klass%3ABase.class)-class-method) avec l'identifiant du paramètre que vous souhaitez utiliser dans les définitions de chemins de route, et la classe de paramètre effective. Par exemple :

```crystal
Marten::Routing::Parameter.register(:year, YearParameter)
```

Avec l'enregistrement ci-dessus, vous pourriez techniquement créer la définition de route suivante :

```crystal
Marten.routes.draw do
  path "/vintage/<vintage:year>", VintageHandler, name: "vintage"
end
```
