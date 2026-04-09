---
title: Créer des tags de template personnalisés
sidebar_label: Créer des tags personnalisés
description: Comment créer des tags de template personnalisés.
---

Marten dispose d'un support intégré pour les [tags de template](../reference/tags.md) courants, mais le framework vous permet également d'écrire vos propres tags de template que vous pouvez utiliser dans les templates de votre projet.

## Définir un tag de template

Les tags de template sont des sous-classes de la classe abstraite [`Marten::Template::Tag::Base`](https://martenframework.com/docs/api/dev/Marten/Template/Tag/Base.html). Lors de l'écriture de tags de template personnalisés, vous voudrez généralement définir deux méthodes dans vos classes de tags : les méthodes `#initialize` et `#render`. Ces deux méthodes sont appelées à différents moments du cycle de vie d'un template :

* la méthode `#initialize` est utilisée pour initialiser un objet tag de template et elle est appelée au moment de l'**analyse** : cela signifie qu'il est de la responsabilité de cette méthode de s'assurer que le contenu du tag de template est valide du point de vue de l'analyse
* la méthode `#render` est appelée au moment du **rendu** pour appliquer la logique du tag : cela signifie que la méthode n'est appelée que pour les instructions de tag de template valides qui ont été analysées sans erreur

Puisque les tags sont créés et traités lors de l'analyse du template, ils peuvent théoriquement être utilisés pour implémenter tout type de comportement. Cela dit, il existe quelques patterns fréquemment utilisés lors de l'écriture de tags que vous pourriez vouloir considérer pour vous aider à démarrer :

* **tags simples :** tags produisant une valeur qui peut (optionnellement) être assignée à une nouvelle variable
* **tags d'inclusion :** tags incluant et rendant d'autres templates
* **tags fermants :** tags impliquant des instructions de fermeture et faisant quelque chose avec la sortie d'un bloc

### Tags simples

Les tags simples produisent généralement une valeur tout en permettant à cette valeur d'être assignée à une nouvelle variable (qui sera ajoutée au contexte du template). Ils peuvent éventuellement prendre des arguments afin de retourner le résultat correct au moment du rendu.

Prenons l'exemple d'un tag de template `local_time` qui affiche la représentation en chaîne de l'heure locale et qui prend un argument obligatoire (le [format](https://crystal-lang.org/api/Time/Format.html) utilisé pour afficher l'heure). Un tel tag de template pourrait être implémenté comme suit :

```crystal
class LocalTimeTag < Marten::Template::Tag::Base
  include Marten::Template::Tag::CanSplitSmartly

  @assigned_to : String? = nil

  def initialize(parser : Marten::Template::Parser, source : String)
    parts = split_smartly(source)

    if parts.size < 2
      raise Marten::Template::Errors::InvalidSyntax.new(
        "Malformed local_time tag: one argument must be provided"
      )
    end

    @pattern_expression = Marten::Template::FilterExpression.new(parts[1])

    # Identify possible assigned variable name.
    if parts.size > 2 && parts[-2] == "as"
      @assigned_to = parts[-1]
    elsif parts.size > 2
      raise Marten::Template::Errors::InvalidSyntax.new(
        "Malformed local_time tag: only one argument must be provided"
      )
    end
  end

  def render(context : Marten::Template::Context) : String
    time_pattern = @pattern_expression.resolve(context).to_s

    local_time = Time.local(Marten.settings.time_zone).to_s(time_pattern)

    if @assigned_to.nil?
      local_time
    else
      context[@assigned_to.not_nil!] = local_time
      ""
    end
  end
end
```

Comme vous pouvez le voir, les tags de template sont initialisés à partir d'un parser (instance de [Marten::Template::Parser](https://martenframework.com/docs/api/dev/Marten/Template/Parser.html)) et de la « source » brute du tag de template (c'est-à-dire le contenu entre les délimiteurs de tag `{%` et `%}`). La méthode `#initialize` est responsable de l'extraction de toute information nécessaire à l'implémentation de la logique du tag de template. Dans le cas du tag de template `local_time`, nous devons prendre soin de quelques éléments :

* s'assurer que nous avons un format spécifié comme argument (et lever une erreur de syntaxe invalide sinon)
* initialiser une expression de filter (instance de [Marten::Template::FilterExpression](https://martenframework.com/docs/api/dev/Marten/Template/FilterExpression.html)) à partir de l'argument de format : cela est nécessaire car l'argument peut être une chaîne littérale ou une variable avec des filters appliqués
* vérifier si la sortie du tag de template est assignée à une variable en cherchant une instruction `as` : si c'est le cas, le nom de la variable est conservé dans une variable d'instance dédiée

La méthode `#render` est appelée au moment du rendu : elle prend l'objet contexte courant comme argument et doit retourner une chaîne de caractères. Dans l'exemple ci-dessus, cette méthode « résout » l'expression de format horaire identifiée au moment de l'initialisation à partir du contexte (ce qui est nécessaire s'il s'agissait d'une variable) et génère la bonne représentation temporelle. Si le tag n'a pas été spécifié avec une variable `as`, alors cette valeur est simplement retournée, sinon, elle est conservée dans le contexte et une chaîne vide est retournée.

### Tags d'inclusion

Les tags d'inclusion sont similaires aux tags simples : ils peuvent prendre des arguments (obligatoires ou non), et assigner leurs sorties à des variables, mais la différence est qu'ils rendent un template pour produire la sortie finale.

Prenons l'exemple d'un tag de template `list` qui affiche les éléments d'un tableau dans un tag HTML `ul` classique. Le template rendu par un tel tag de template pourrait ressembler à ceci :

```html title=path/to/list_tag.html
<ul>
  {% for item in list %}
    <li>{{ item }}</li>
  {% endfor %}
</ul>
```

Et le tag de template lui-même pourrait être implémenté comme suit :

```crystal
class ListTag < Marten::Template::Tag::Base
  include Marten::Template::Tag::CanSplitSmartly

  @assigned_to : String? = nil

  def initialize(parser : Marten::Template::Parser, source : String)
    parts = split_smartly(source)

    if parts.size < 2
      raise Marten::Template::Errors::InvalidSyntax.new(
        "Malformed list tag: one argument must be provided"
      )
    end

    @list_expression = Marten::Template::FilterExpression.new(parts[1])

    # Identify possible assigned variable name.
    if parts.size > 2 && parts[-2] == "as"
      @assigned_to = parts[-1]
    elsif parts.size > 2
      raise Marten::Template::Errors::InvalidSyntax.new(
        "Malformed list tag: only one argument must be provided"
      )
    end
  end

  def render(context : Marten::Template::Context) : String
    template = Marten.templates.get_template("path/to/list_tag.html")

    rendered = ""

    context.stack do |include_context|
      include_context["list"] = @list_expression.resolve(context)
      rendered = template.render(include_context)
    end

    if @assigned_to.nil?
      Marten::Template::SafeString.new(rendered)
    else
      context[@assigned_to.not_nil!] = rendered
      ""
    end
  end
end
```

Comme vous pouvez le voir, l'implémentation de ce tag ressemble beaucoup à celle mise en évidence dans [Tags simples](#tags-simples). Les seules différences dignes de mention ici sont :

1. l'argument du tag de template correspond à la liste des éléments qui doivent être rendus
2. la méthode `#render` rend explicitement le template mentionné précédemment en utilisant un contexte avec l'objet « list » dedans (la méthode [`#stack`](https://martenframework.com/docs/api/dev/Marten/Template/Context.html#stack(%26)%3ANil-instance-method) permet de créer un nouveau contexte où de nouvelles valeurs sont empilées sur les existantes). La sortie de cette opération de rendu est soit assignée à une variable, soit retournée directement selon que l'instruction `as` a été utilisée ou non

### Tags fermants

Les tags fermants impliquent une instruction de fermeture, comme c'est le cas pour le tag de template `{% block %}...{% endblock %}` par exemple. Généralement, de tels tags « capturent » tous les nœuds entre le tag d'ouverture et le tag de fermeture, les rendent au moment du rendu, et font quelque chose avec la sortie de ce rendu.

Pour illustrer cela, prenons l'exemple d'un tag `spaceless` qui supprimera les espaces, tabulations et retours à la ligne entre les tags HTML. Un tel tag de template pourrait être implémenté comme suit :

```crystal
class SpacelessTag < Marten::Template::Base
  @inner_nodes : Marten::Template::NodeSet

  def initialize(parser : Marten::Template::Parser, source : String)
    @inner_nodes = parser.parse(up_to: %w(endspaceless))
    parser.shift_token
  end

  def render(context : Marten::Template::Context) : String
    @inner_nodes.render(context).strip.gsub(/>\s+</, "><")
  end
end
```

Dans cet exemple, la méthode `#initialize` appelle explicitement la méthode [`#parse`](https://martenframework.com/docs/api/dev/Marten/Template/Parser.html#parse(up_to%3AArray(String)%3F%3Dnil)%3ANodeSet-instance-method) du parser afin d'analyser les « nœuds » suivants jusqu'au tag de fermeture attendu (`endspaceless` dans ce cas). Si le tag de fermeture spécifié n'est pas rencontré, le parser lèvera automatiquement une erreur de syntaxe. Les nœuds obtenus sont retournés sous forme de « jeu de nœuds » (instance de [`Marten::Template::NodeSet`](https://martenframework.com/docs/api/dev/Marten/Template/NodeSet.html)) : c'est un objet spécial retourné par le parser de template qui correspond à plusieurs nœuds analysés (ceux-ci peuvent être des tags, des variables ou des valeurs de texte brut) qui peuvent être rendus via une méthode [`#render`](https://martenframework.com/docs/api/dev/Marten/Template/NodeSet.html#render(context%3AContext)-instance-method) au moment du rendu.

La méthode `#render` du tag ci-dessus est relativement simple : elle « rend » simplement le jeu de nœuds correspondant aux nœuds de template extraits entre les tags `{% spaceless %}...{% endspaceless %}` puis supprime tous les espaces entre les tags HTML dans la sortie.

## Enregistrer des tags de template

Afin de pouvoir utiliser des tags de template personnalisés, vous devez les enregistrer dans le registre global des tags de template de Marten.

Pour ce faire, vous devrez appeler la méthode [`Marten::Template::Tag#register`](https://martenframework.com/docs/api/dev/Marten/Template/Tag.html#register(tag_name%3AString|Symbol%2Ctag_klass%3ABase.class)-class-method) avec le nom du tag que vous souhaitez utiliser dans les templates, et la classe du tag de template.

Par exemple :

```crystal
Marten::Template::Tag.register("local_time", LocalTimeTag)
```

Avec l'enregistrement ci-dessus, vous pourriez techniquement utiliser ce tag (celui de la section [Tags simples](#tags-simples) ci-dessus) comme suit :

```html
{% local_time "%Y-%m-%d %H:%M:%S %:z" %}
```
