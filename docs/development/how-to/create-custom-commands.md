---
title: Créer des commandes personnalisées
description: Comment créer des commandes de gestion personnalisées.
---

Marten vous permet de créer des commandes de gestion personnalisées dans le cadre de vos [applications](../applications.md). Cela vous permet de contribuer de nouvelles fonctionnalités et comportements au CLI Marten.

## Définition basique d'une commande de gestion

Les commandes de gestion personnalisées sont définies comme des sous-classes de la classe abstraite [`Marten::CLI::Command`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html). Ces sous-classes doivent être définies dans un dossier `cli/` à la racine de l'application, et il faut s'assurer qu'elles sont requises par votre fichier `cli.cr` (voir [Créer des applications](../applications.md#créer-des-applications) pour plus de détails sur la structure d'une application).

Les classes de commandes de gestion doivent au minimum définir une méthode [`#run`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#run-instance-method), qui sera appelée lorsque la sous-commande est exécutée :

```crystal
class MyCommand < Marten::CLI::Command
  help "Command that does something"

  def run
    # Do something
  end
end
```

Comme vous pouvez le voir dans l'exemple précédent, la méthode de classe [`#help`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#help(help%3AString)-class-method) permet de définir un "texte d'aide" qui sera affiché lorsque les informations d'aide de la commande sont demandées.

Si la commande ci-dessus faisait partie d'une application installée, elle pourrait être exécutée en utilisant le CLI Marten comme suit :

```bash
marten my_command
```

## Accepter des options et arguments

Les commandes de gestion Marten peuvent accepter des options et des arguments. Ceux-ci diffèrent et peuvent être utilisés pour différents cas d'usage :

* les options utilisent généralement le style `-h` / `--help` et peuvent recevoir des arguments si nécessaire. Elles peuvent être spécifiées dans n'importe quel ordre
* les arguments sont _positionnels_ et seules leurs valeurs doivent être spécifiées

Par défaut, les options et arguments sont toujours optionnels. Cela dit, ils peuvent être rendus obligatoires dans la logique d'exécution de la commande si nécessaire.

Les options et arguments doivent être spécifiés dans la méthode optionnelle [`#setup`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#setup-instance-method) : cette méthode sera appelée pour préparer la définition de la commande, y compris ses arguments et options.

Par exemple :

```crystal
class MyCommand < Marten::CLI::Command
  help "Command that does something"

  @arg1 : String?
  @example : Bool = false

  def setup
    on_argument(:arg1, "The first argument") { |v| @arg1 = v }
    on_option("example", "An example option") { @example = true }
  end

  def run
    # Do something
  end
end
```

Dans l'exemple ci-dessus, la méthode d'instance [`#on_argument`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#on_argument(name%3AString|Symbol%2Cdescription%3AString%2C%26block%3AString->)-instance-method) est utilisée pour définir un argument `arg1`. Cette méthode nécessite un nom d'argument, un texte d'aide associé, et un proc où la valeur de l'argument sera transmise au moment de l'exécution (ce qui vous permet de l'assigner à une variable d'instance ou de la traiter si vous le souhaitez). De même, la méthode d'instance [`#on_option`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#on_option(flag%3AString|Symbol%2Cdescription%3AString%2C%26block%3AString->)-instance-method) est utilisée pour définir une option `example`. Dans ce cas, le nom de l'option et son texte d'aide associé doivent être spécifiés, et un proc peut être défini pour identifier que l'option a été spécifiée au moment de l'exécution (ce qui peut être utilisé pour définir une variable d'instance booléenne associée par exemple).

La commande ci-dessus produirait les informations d'aide suivantes :

```
Usage: marten my_command [options] [arg1]

Command that does something

Arguments:
    arg1                             The first argument

Options:
    --example                        An example option
    --error-trace                    Show full error trace (if a compilation is involved)
    --no-color                       Disable colored output
    -h, --help                       Show this help
```

### Configurer les options

Comme mentionné précédemment, il est possible d'utiliser la méthode d'instance [`#on_option`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#on_option(flag%3AString|Symbol%2Cdescription%3AString%2C%26block%3AString->)-instance-method) pour configurer une option de commande spécifique (ex. `--option`). Elle attend un nom de flag et une description, et exécute un bloc pour permettre à la commande d'assigner correctement la valeur de l'option à l'objet de commande au moment de l'exécution :

```crystal
on_option("example", "An example option") { @example = true }
```

Notez que le `--` ne doit pas être inclus dans le nom de l'option.

Alternativement, il est possible de spécifier des options qui acceptent à la fois un flag court (ex. `-h`) et un flag long (ex. `--help`) :

```crystal
on_option("e", "example", "An example option") { @example = true }
```

### Configurer des options qui acceptent des arguments

Il est possible d'utiliser la méthode d'instance [`#on_option_with_arg`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#on_option_with_arg(flag%3AString|Symbol%2Carg%3AString|Symbol%2Cdescription%3AString%2C%26block%3AString->)-instance-method) pour configurer une option de commande spécifique avec un argument associé. Cette méthode configure une option de commande (ex. `--option`) et un argument associé. Elle attend un nom de flag, un nom d'argument et une description. Elle exécute un bloc pour permettre à la commande d'assigner correctement l'option à l'objet de commande au moment de l'exécution :

```crystal
on_option_with_arg(:option, :arg, "The name of the option") { @arg = arg }
```

Alternativement, il est possible de spécifier des options qui acceptent à la fois un flag court (ex. `-h`) et un flag long (ex. `--help`) :

```crystal
on_option_with_arg("o", "option", "arg", "The name of the option") { |arg| @arg = arg }
```

### Configurer les arguments

Comme mentionné précédemment, il est possible d'utiliser la méthode d'instance [`#on_argument`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#on_argument(name%3AString|Symbol%2Cdescription%3AString%2C%26block%3AString->)-instance-method) afin de configurer un argument de commande spécifique. Cette méthode attend un nom d'argument et une description, et exécute un bloc pour permettre à la commande d'assigner correctement la valeur de l'argument à l'objet de commande au moment de l'exécution :

```crystal
on_argument(:arg, "The name of the argument") { |value| @arg_var = value }
```

:::caution
Il convient de noter que l'ordre dans lequel les arguments sont définis est important : cet ordre correspond à l'ordre dans lequel les arguments devront être spécifiés lors de l'invocation de la sous-commande.
:::

## Afficher du contenu textuel

Lors de l'écriture de commandes de gestion, vous aurez probablement besoin d'écrire du contenu textuel vers le descripteur de fichier de sortie. Pour ce faire, vous pouvez utiliser la méthode d'instance [`#print`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#print(msg%2Cending%3D"\n")-instance-method) :

```crystal
class HelloWorldCommand < Marten::CLI::Command
  help "Command that prints Hello World!"

  def run
    print("Hello World!")
  end
end
```

Il convient de noter que vous pouvez également choisir de "styliser" le contenu que vous spécifiez à [`#print`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#print(msg%2Cending%3D"\n")-instance-method) en encapsulant votre chaîne avec un appel à la méthode [`#style`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#style(msg%2Cfore%3Dnil%2Cmode%3Dnil)-instance-method). Par exemple :

```crystal
class HelloWorldCommand < Marten::CLI::Command
  help "Command that prints Hello World!"

  def run
    print(style("Hello World!", fore: :light_blue, mode: :bold))
  end
end
```

Comme vous pouvez le voir, la méthode [`#style`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#style(msg%2Cfore%3Dnil%2Cmode%3Dnil)-instance-method) peut être utilisée pour appliquer des styles `fore` et `mode` à une valeur textuelle spécifique. Les valeurs que vous pouvez utiliser pour les arguments `fore` et `mode` sont les mêmes que celles que vous pouvez utiliser avec le module [`Colorize`](https://crystal-lang.org/api/Colorize.html) (qui fait partie de la bibliothèque standard).

## Gérer les cas d'erreur

Vous voudrez probablement gérer les situations d'erreur lors de l'écriture de commandes de gestion. Par exemple, pour retourner des messages d'erreur si un argument spécifié n'est pas fourni ou s'il est invalide. Pour ce faire, vous pouvez utiliser la méthode helper [`#print_error`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#print_error(msg)-instance-method), qui affichera la chaîne passée vers le descripteur de fichier d'erreur :

```crystal
class HelloWorldCommand < Marten::CLI::Command
  help "Command that prints Hello World!"

  @name : String?

  def setup
    on_argument(:name, "A name") { |v| @name = v }
  end

  def run
    if @name.nil?
      print_error("A name must be provided!")
    else
      print("Hello World, #{@name}!")
    end
  end
end
```

Alternativement, vous pouvez utiliser la méthode [`#print_error_and_exit`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#print_error_and_exit(msg%2Cexit_code%3D1)-instance-method) pour afficher un message vers le descripteur de fichier d'erreur et quitter l'exécution de la commande.

## Personnaliser le nom de la sous-commande

Par défaut, les noms des commandes de gestion sont déduits en utilisant les noms de classes associés (ex. une classe de commande `MyCommand` se traduirait par une sous-commande `my_command`). Cela dit, il convient de noter que vous pouvez définir un nom de sous-commande personnalisé en utilisant la méthode de classe [`#command_name`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#command_name(name%3AString|Symbol)-class-method) :

```crystal
class MyCommand < Marten::CLI::Command
  command_name :dummycommand
  help "Command that does something"

  def run
    # Do something
  end
end
```

Il est également intéressant de mentionner que des alias de commande peuvent être configurés facilement en utilisant la méthode helper [`#command_aliases`](pathname:///api/dev/Marten/CLI/Manage/Command/Base.html#command_aliases(*aliases%3AString|Symbol)-class-method). Par exemple :

```crystal
class MyCommand < Marten::CLI::Command
  command_name :test
  command_aliases :t
  help "Command that does something"

  def run
    # Do something
  end
end
```
