---
title: Créer des loaders de template personnalisés
sidebar_label: Créer des loaders personnalisés
description: Comment créer des loaders de template personnalisés.
---

Marten dispose d'un support intégré pour les [loaders de template courants](../reference/loaders.md), mais le framework vous permet également d'écrire votre propre loader de template que vous pouvez utiliser dans les templates de votre projet.

## Définir un loader de template

Les loaders de template sont des sous-classes de la classe abstraite [`Marten::Template::Loader::Base`](https://martenframework.com/docs/api/dev/Marten/Template/Loader/Base.html). Ils doivent implémenter une seule méthode `#get_template_source` : cette méthode retourne le contenu brut d'un template à partir d'un nom de template fourni.

Par exemple, rendre le template `content.html` avec un loader de système de fichiers initialisé avec `Marten::Template::Loader::FileSystem.new("/app/custom_dir/templates")` retournerait le contenu défini dans `/app/custom_dir/templates/content.html`.

Supposons que nous voulions écrire un loader de template `DatabaseTemplate` : nous devons d'abord définir une nouvelle classe qui hérite de `Marten::Template::Loader::Base`. Cette nouvelle classe doit définir une méthode `#get_template_source` qui prend un argument de type chaîne `template_name` et retourne également une chaîne.

Pour simplifier, nous supposons qu'il existe déjà un modèle `HtmlTemplate`, comportant un champ `name` et un champ `content` :

```crystal
class DatabaseTemplate < Marten::Template::Loader::Base
  def get_template_source(template_name) : String
    begin
      return HtmlTemplate.get!(name: template_name).content!
    rescue e : Marten::DB::Errors::RecordNotFound
      raise Marten::Template::Errors::TemplateNotFound.new("Template #{template_name} could not be found ; #{e.message}", e)
    end
  end
end
```
