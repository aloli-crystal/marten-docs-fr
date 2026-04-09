---
title: Créer des filters de template personnalisés
sidebar_label: Créer des filters personnalisés
description: Comment créer des filters de template personnalisés.
---

Marten dispose d'un support intégré pour les [filters de template](../reference/filters.md) courants, mais le framework vous permet également d'écrire vos propres filters de template que vous pouvez utiliser dans les templates de votre projet.

## Définir un filter de template

Les filters sont des sous-classes de la classe abstraite [`Marten::Template::Filter::Base`](https://martenframework.com/docs/api/dev/Marten/Template/Filter/Base.html). Ils doivent implémenter une seule méthode `#apply` : cette méthode prend la valeur sur laquelle le filter doit être appliqué (un objet [`Marten::Template::Value`](https://martenframework.com/docs/api/dev/Marten/Template/Value.html) encapsulant _n'importe lequel_ des types d'objets supportés par les templates) et un argument optionnel spécifié au filter.

Par exemple, dans l'expression `{{ var|test:42 }}`, le filter `test` serait appelé avec la valeur de la variable `var` et l'argument de filter `42`.

Supposons que nous voulions écrire un filter de template `underscore` : ce filter n'aura besoin d'aucun argument et retournera simplement la version « underscore » de la représentation en chaîne de la valeur entrante. Un tel filter pourrait être défini comme suit :

```crystal
class UnderscoreFilter < Marten::Template::Filter::Base
  def apply(value : Marten::Template::Value, arg : Marten::Template::Value? = nil) : Marten::Template::Value
    Marten::Template::Value.from(value.to_s.underscore)
  end
end
```

Comme vous pouvez le voir, la méthode `#apply` doit retourner un objet [`Marten::Template::Value`](https://martenframework.com/docs/api/dev/Marten/Template/Value.html).

Maintenant, essayons d'écrire un filter de template `chomp` qui utilise effectivement l'argument spécifié. Dans ce cas, l'argument sera utilisé pour définir le suffixe qui doit être retiré de la fin de la représentation en chaîne de la valeur entrante :

```crystal
class ChompFilter < Marten::Template::Filter::Base
  def apply(value : Marten::Template::Value, arg : Marten::Template::Value? = nil) : Marten::Template::Value
    raise Marten::Template::Errors::InvalidSyntax.new("The 'chomp' filter requires one argument") if arg.nil?
    Marten::Template::Value.from(value.to_s.chomp(arg.not_nil!.to_s))
  end
end
```

:::info
N'hésitez pas à lever des exceptions [`Marten::Template::Errors::InvalidSyntax`](https://martenframework.com/docs/api/dev/Marten/Template/Errors/InvalidSyntax.html) depuis la méthode `#apply` d'un filter : cela est particulièrement pertinent si l'entrée a un type inattendu ou si un argument manque. Cela dit, il est à noter que toute exception levée depuis un filter de template ne sera pas gérée par le moteur de templates et résultera en une erreur serveur (sauf si elle est explicitement gérée par l'application elle-même).
:::

### Les objets `Marten::Template::Value`

Comme souligné précédemment, les filters de template interagissent principalement avec des objets [`Marten::Template::Value`](https://martenframework.com/docs/api/dev/Marten/Template/Value.html) : ils prennent de tels objets comme paramètres (pour la valeur entrante sur laquelle le filter doit être appliqué et pour le paramètre optionnel du filter), et ils doivent également retourner de tels objets.

Les objets [`Marten::Template::Value`](https://martenframework.com/docs/api/dev/Marten/Template/Value.html) peuvent être créés à partir de n'importe quel objet supporté en utilisant la méthode `#from` comme suit :

```crystal
Marten::Template::Value.from("hello")
Marten::Template::Value.from(42)
Marten::Template::Value.from(true)
```

Ces objets sont essentiellement des « enveloppes » autour d'une valeur réelle manipulée lors du runtime d'un template, et ils fournissent une interface commune permettant d'interagir avec celles-ci pendant le rendu du template. Votre implémentation de filter peut effectuer des vérifications sur les objets [`Marten::Template::Value`](https://martenframework.com/docs/api/dev/Marten/Template/Value.html) entrants si nécessaire : par exemple, pour vérifier que la valeur sous-jacente est du type attendu. Dans cette optique, il est possible d'utiliser la méthode `#raw` pour récupérer la valeur réelle encapsulée par l'objet [`Marten::Template::Value`](https://martenframework.com/docs/api/dev/Marten/Template/Value.html) :

```crystal
value = Marten::Template::Value.from("hello")
value.raw  # => "hello"
```

### Filters et auto-échappement HTML

Lors de l'écriture de filters destinés à opérer sur des chaînes de caractères, il est important de se rappeler que le [HTML est automatiquement échappé](../introduction.md#auto-échappement) dans les templates. En tant que tel, certaines valeurs de chaîne peuvent être marquées comme « sûres » et d'autres comme « non sûres » :

* les valeurs `String` classiques sont toujours considérées comme « non sûres » et seront automatiquement échappées par le moteur de templates de Marten
* les chaînes sûres sont encapsulées dans des objets `Marten::Template::SafeString`

Cela signifie que si votre filter doit avoir un comportement différent selon que la chaîne est sûre ou non, vous devrez vérifier le type de la valeur sous-jacente (en utilisant la méthode `#raw` comme expliqué dans la section précédente). Il est de la responsabilité du filter de s'assurer qu'une « chaîne sûre » entrante est retournée comme « chaîne sûre » également, ou simplement convertie en une chaîne classique qui sera auto-échappée.

Créer des chaînes sûres consiste simplement à initialiser un `Marten::Template::SafeString` à partir d'une chaîne classique :

```crystal
class SafeFilter < Marten::Template::Filter::Base
  def apply(value : Marten::Template::Value, arg : Marten::Template::Value? = nil) : Marten::Template::Value
    Marten::Template::Value.from(Marten::Template::SafeString.new(value.to_s))
  end
end
```

## Enregistrer des filters de template

Pour pouvoir utiliser des filters de template personnalisés, vous devez les enregistrer dans le registre global des filters de template de Marten.

Pour ce faire, vous devrez appeler la méthode [`Marten::Template::Filter#register`](https://martenframework.com/docs/api/dev/Marten/Template/Filter.html#register(filter_name%3AString|Symbol%2Cfilter_klass%3ABase.class)-class-method) avec le nom du filter que vous souhaitez utiliser dans les templates, et la classe du filter.

Par exemple :

```crystal
Marten::Template::Filter.register("underscore", UnderscoreFilter)
```

Avec l'enregistrement ci-dessus, vous pourriez techniquement utiliser ce filter comme suit :

```html
{{ my_var|underscore }}
```
