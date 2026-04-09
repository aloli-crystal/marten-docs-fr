---
title: Introduction aux emails
description: Apprenez à définir des emails dans un projet Marten et comment les envoyer.
sidebar_label: Introduction
---

Marten vous permet de définir des emails de manière très déclarative et vous donne la possibilité de personnaliser entièrement le contenu de ces emails, leurs propriétés et les valeurs d'en-têtes associées, et évidemment comment ils doivent être envoyés.

## Définition d'un email

Les emails doivent être définis comme des sous-classes de la classe abstraite [`Emailing::Email`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html) et ils résident généralement dans un dossier `emails` à la racine d'une application. Ces classes peuvent définir à quelles adresses email l'email est envoyé (y compris les adresses CC ou BCC) et avec quels [templates](../templates.mdx) le corps de l'email (HTML ou texte brut) est rendu.

Par exemple, l'extrait suivant définit un email simple qui est envoyé à l'adresse email d'un utilisateur spécifique :

```crystal
class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html"

  def initialize(@user : User)
  end
end
```

:::info
Il n'est pas nécessaire de spécifier systématiquement l'adresse email `from` avec la macro [`#from`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#from(value)-macro). En effet, sauf indication contraire, l'adresse email "from" par défaut définie dans le paramètre [`emailing.from_address`](../development/reference/settings.md#from_address) est automatiquement utilisée.
:::

Dans l'extrait ci-dessus, une classe d'email `WelcomeEmail` est définie en héritant de la classe abstraite [`Emailing::Email`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html). Cet email est initialisé avec un enregistrement hypothétique `User`, et l'adresse email de cet utilisateur est utilisée comme destinataire (via la macro [`#to`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#to(value)-macro)). D'autres propriétés de l'email sont également définies dans l'extrait ci-dessus, comme l'adresse email "from" (macro [`#from`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#from(value)-macro)) et le sujet de l'email (macro [`#subject`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#subject(value)-macro)).

### Spécifier les propriétés de l'email

La plupart des propriétés de l'email (ex. adresse from, adresses destinataires, etc.) peuvent être spécifiées de deux manières :

* via l'utilisation d'une macro dédiée
* en surchargeant une méthode correspondante dans la classe de l'email

En effet, il est pratique de définir les propriétés de l'email via l'utilisation des macros dédiées : [`#from`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#from(value)-macro) pour l'email expéditeur, [`#to`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#to(value)-macro) pour les adresses destinataires, [`#cc`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#cc(value)-macro) pour les adresses CC, [`#bcc`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#bcc(value)-macro) pour les adresses BCC, [`#reply_to`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#reply_to(value)-macro) pour l'adresse Reply-To, et [`#subject`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#subject(value)-macro) pour le sujet de l'email.

Cela dit, si des logiques plus complexes doivent être implémentées pour générer ces propriétés d'email, il est parfaitement possible de simplement surcharger la méthode correspondante dans la classe d'email considérée. Par exemple :

```crystal
class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  template_name "emails/welcome_email.html"

  def initialize(@user : User)
  end

  def subject
    if @user.referred?
      "Glad to see you here!"
    else
      "Welcome to the app!"
    end
  end
end
```

### Définir les corps HTML et texte

Le corps HTML (et optionnellement le corps texte) de l'email est rendu en utilisant un [template](../templates.mdx) dont le nom peut être spécifié en utilisant la méthode de classe [`#template_name`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#template_name(template_name%3AString%3F%2Ccontent_type%3AContentType|String|Symbol%3DContentType%3A%3AHTML)%3ANil-class-method). Par défaut, sauf indication explicite, il est supposé que le template spécifié à cette méthode est utilisé pour le rendu du corps HTML de l'email. Cela dit, il est possible de spécifier explicitement pour quel type de contenu le template devrait être utilisé en spécifiant un argument optionnel `content_type` comme suit :

```crystal
class WelcomeEmail < Marten::Email
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html", content_type: :html
  template_name "emails/welcome_email.txt", content_type: :text

  def initialize(@user : User)
  end
end
```

Notez qu'il est parfaitement valide de spécifier un template pour le rendu du corps HTML ET un autre pour le rendu du corps texte (comme dans l'exemple ci-dessus).

:::info
Notez que vous pouvez définir des méthodes [`#html_body`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#html_body%3AString%3F-instance-method) et [`#text_body`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#html_body%3AString%3F-instance-method) si vous avez besoin de surcharger la logique qui permet de générer le corps HTML ou texte de votre email.
:::

### Modifier le contexte du template

Tous les emails ont accès à une méthode [`#context`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#context-instance-method) qui retourne un objet contexte de [template](../templates/introduction.md). Cet objet contexte "global" est disponible pendant toute la durée de vie de l'email considéré et peut être muté afin de définir quelles variables sont rendues disponibles au runtime du template lors du rendu des templates pour générer les corps HTML/texte de votre email (ce qui se produit lors de l'[envoi de l'email](#envoyer-des-emails)).

Pour modifier cet objet contexte efficacement, il est recommandé d'utiliser des callbacks [`before_render`](./callbacks.md#before_render), qui sont invoqués juste avant le rendu d'un template dans votre email. Par exemple, cela peut être réalisé comme suit :

```crystal
class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html"

  before_render :prepare_context

  def initialize(@user : User)
  end

  private def prepare_context
    context[:user] = @user
  end
end
```

Dans l'exemple ci-dessus, le callback [`before_render`](./callbacks.md#before_render) assigne simplement une nouvelle variable `user` au contexte de template de l'email. Par conséquent, une variable `{{ user }}` correspondante sera disponible dans le template configuré pour cet email (`emails/welcome_email.html` dans ce cas).

### Définir des en-têtes personnalisés

Si vous devez insérer des en-têtes personnalisés dans vos emails, vous pouvez facilement le faire en définissant une méthode `#headers` dans votre classe d'email. Cette méthode doit retourner un hash de clés et valeurs de type string.

Par exemple :

```crystal
class WelcomeEmail < Marten::Email
  to @user.email
  template_name "emails/welcome_email.html"

  def initialize(@user : User)
  end
  
  def headers
    {"X-Foo" => "bar"}
  end
end
```

## Envoyer des emails

Les emails sont envoyés _de manière synchrone_ via l'utilisation de [`#deliver`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#deliver-instance-method). Par exemple, l'email `WelcomeEmail` défini dans les sections précédentes pourrait être initialisé et envoyé en faisant :

```crystal
email = WelcomeEmail.new(user)
email.deliver
```

Lors de l'appel à [`#deliver`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#deliver-instance-method), l'email considéré sera envoyé en utilisant le [backend d'emailing](#backends-demailing) actuellement configuré.

## Backends d'emailing

Les backends d'emailing définissent _comment_ les emails sont réellement envoyés lorsque [`#deliver`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#deliver-instance-method) est appelé. Par exemple, un [backend de développement](./reference/backends.md#development-backend) pourrait simplement "collecter" les emails envoyés et afficher leurs informations sur la sortie standard. D'autres backends pourraient également s'intégrer avec des services d'email existants ou interagir avec un serveur SMTP pour assurer la livraison des emails.

Quel backend est utilisé lors de l'envoi d'emails est contrôlé par le paramètre [`emailing.backend`](../development/reference/settings.md#backend-1). Tous les backends d'emailing disponibles sont listés dans la [référence des backends d'emailing](./reference/backends.md).

:::tip
Si nécessaire, il est également possible de surcharger quel backend d'emailing est utilisé par email en utilisant la méthode de classe [`#backend`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html#backend(backend%3ABackend%3A%3ABase)%3ANil-class-method). Par exemple :

```crystal
class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html"

  backend Marten::Emailing::Backend::Development.new(print_emails: true)

  def initialize(@user : User)
  end
end
```
:::

## Callbacks

Il est possible de définir des callbacks afin de lier des méthodes et des logiques à des événements spécifiques du cycle de vie de vos emails. Par exemple, il est possible de définir des callbacks qui s'exécutent avant ou après l'envoi d'un email.

Veuillez consulter le guide [Callbacks d'email](./callbacks.md) pour en savoir plus sur les callbacks d'email.
