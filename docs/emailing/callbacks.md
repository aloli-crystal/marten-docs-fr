---
title: Callbacks d'email
description: Apprenez à définir des callbacks d'email.
sidebar_label: Callbacks
---

Les callbacks vous permettent de définir une logique qui est déclenchée à différentes étapes du cycle de vie d'un email. Ce document couvre les callbacks disponibles et vous présente l'API associée, que vous pouvez utiliser pour définir des hooks dans vos emails.

## Vue d'ensemble

Comme indiqué ci-dessus, les callbacks sont des méthodes qui seront appelées lorsque des événements spécifiques se produisent pour une instance d'email donnée. Ils doivent être enregistrés explicitement dans vos classes d'email.

L'enregistrement d'un callback est aussi simple qu'appeler la bonne macro de callback (ex. `#before_deliver`) avec un symbole du nom de la méthode à appeler lorsque le callback est exécuté.

Par exemple, l'email suivant utilise le callback [`#after_deliver`](#after_deliver) afin d'émettre une métrique StatsD spécifique :

```crystal
require "statsd"

statsd = Statsd::Client.new

class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html"

  after_deliver :emit_delivered_welcome_email_metric

  def initialize(@user : User)
  end

  private def emit_delivered_welcome_email_metric
    statsd.increment "email.welcome.delivered", tags: ["app:myapp"]
  end
end
```

## Callbacks disponibles

### `before_deliver`

Les callbacks `before_deliver` sont exécutés _avant_ qu'un email ne soit envoyé (dans le cadre de la méthode [`#deliver`](pathname:///api/dev/Marten/Emailing/Email.html#deliver-instance-method) de l'email). Par exemple, cette capacité peut être utilisée pour muter l'instance d'email considérée avant que l'email réel ne soit envoyé :

```crystal
class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html"

  before_deliver :set_header

  def initialize(@user : User)
  end

  private def set_header
    headers["X-Debug"] = "True" if Marten.env.staging?
  end
end
```

### `after_deliver`

Les callbacks `after_deliver` sont exécutés _après_ qu'un email est envoyé (dans le cadre de la méthode [`#deliver`](pathname:///api/dev/Marten/Emailing/Email.html#deliver-instance-method) de l'email). Par exemple, de tels callbacks peuvent être utilisés pour incrémenter des métriques spécifiques aux emails :

```crystal
require "statsd"

statsd = Statsd::Client.new

class WelcomeEmail < Marten::Email
  from "no-reply@martenframework.com"
  to @user.email
  subject "Hello!"
  template_name "emails/welcome_email.html"

  after_deliver :emit_delivered_welcome_email_metric

  def initialize(@user : User)
  end

  private def emit_delivered_welcome_email_metric
    statsd.increment "email.welcome.delivered", tags: ["app:myapp"]
  end
end
```

### `before_render`

Les callbacks `before_render` sont invoqués avant le rendu d'un template lors de la génération du corps HTML ou texte de l'email. Cela signifie que ces callbacks sont exécutés lors de l'appel des méthodes [`#deliver`](pathname:///api/dev/Marten/Emailing/Email.html#deliver-instance-method), [`#html_body`](pathname:///api/dev/Marten/Emailing/Email.html#html_body%3AString|Nil-instance-method) ou [`#text_body`](pathname:///api/dev/Marten/Emailing/Email.html#text_body%3AString|Nil-instance-method).

Typiquement, ces callbacks peuvent être utilisés pour ajouter de nouvelles variables au contexte global de template de l'email, afin de les rendre disponibles au runtime du template. Cela peut être utile si votre email a des variables d'instance que vous souhaitez exposer à votre template d'email. Par exemple :

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
