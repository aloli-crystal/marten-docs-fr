---
title: Content Security Policy
description: Apprenez à configurer l'en-tête Content-Security-Policy (CSP).
---

Marten offre un mécanisme pratique pour définir l'en-tête Content-Security-Policy, qui sert de protection contre les vulnérabilités telles que le cross-site scripting (XSS) et les attaques par injection. Ce mécanisme permet la spécification d'une liste d'autorisation de ressources de confiance, renforçant les mesures de sécurité.

## Vue d'ensemble

L'en-tête [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) est un ensemble de directives que le navigateur suit pour autoriser des sources spécifiques pour les scripts, les styles, le contenu embarqué et plus encore. Il garantit que seules ces sources approuvées sont autorisées tout en bloquant toutes les autres sources.

L'utilisation de l'en-tête Content-Security-Policy dans une application web est un excellent moyen d'atténuer ou d'éliminer les vulnérabilités de cross-site scripting (XSS). En implémentant une Content-Security-Policy efficace, l'inclusion de scripts en ligne est empêchée, et seuls les scripts provenant de sources de confiance dans des fichiers séparés sont autorisés.

## Utilisation basique

Le mécanisme Content-Security-Policy de Marten implique l'utilisation d'un middleware dédié : le [middleware Content-Security-Policy](../handlers-and-http/reference/middlewares.md#content-security-policy-middleware). Pour vous assurer que votre projet utilise ce middleware, vous pouvez ajouter la classe [`Marten::Middleware::ContentSecurityPolicy`](pathname:///api/dev/Marten/Middleware/ContentSecurityPolicy.html) au paramètre [`middleware`](../development/reference/settings.md#middleware) comme suit :

```crystal title="config/settings/base.cr"
Marten.configure do |config|
  config.middleware = [
    // highlight-next-line
    Marten::Middleware::ContentSecurityPolicy,
    # Autres middlewares...
    Marten::Middleware::Session,
    Marten::Middleware::Flash,
    Marten::Middleware::I18n,
  ]
end
```

Le [middleware Content-Security-Policy](../handlers-and-http/reference/middlewares.md#content-security-policy-middleware) garantit la présence de l'en-tête Content-Security-Policy dans les en-têtes de la réponse. Par défaut, le middleware inclura un en-tête Content-Security-Policy qui correspond à la politique définie dans les paramètres [`content_security_policy`](../development/reference/settings.md#content-security-policy-settings). Cependant, si un objet [`Marten::HTTP::ContentSecurityPolicy`](pathname:///api/dev/Marten/HTTP/ContentSecurityPolicy.html) est explicitement assigné à l'objet requête, il prendra le pas sur la politique par défaut et sera utilisé à la place.

Lors de l'activation du [middleware Content-Security-Policy](../handlers-and-http/reference/middlewares.md#content-security-policy-middleware), il est recommandé de définir une Content-Security-Policy par défaut en utilisant les paramètres [`content_security_policy`](../development/reference/settings.md#content-security-policy-settings). Par exemple :

```crystal title="config/settings/base.cr"
Marten.configure do |config|
  config.content_security_policy.default_policy.default_src = [:self, "example.com"]
  config.content_security_policy.default_policy.script_src = [:self, :https]
end
```

## Désactiver l'en-tête CSP dans des handlers spécifiques

Vous pouvez décider de désactiver ou d'activer l'utilisation de l'en-tête Content-Security-Policy par [handler](../handlers-and-http.mdx). Pour ce faire, vous pouvez simplement utiliser la méthode de classe [`#exempt_from_content_security_policy`](pathname:///api/dev/Marten/Handlers/ContentSecurityPolicy/ClassMethods.html#exempt_from_content_security_policy(exempt:Bool):Nil-instance-method), qui prend un seul booléen comme argument :

```crystal
class ProtectedHandler < Marten::Handler
  exempt_from_content_security_policy false

  # [...]
end

class UnprotectedHandler < Marten::Handler
  exempt_from_content_security_policy true

  # [...]
end
```

## Surcharger l'en-tête CSP dans des handlers spécifiques

Parfois, vous pourriez également avoir besoin de surcharger le contenu de l'en-tête Content-Security-Policy par [handler](../handlers-and-http.mdx). Pour ce faire, vous pouvez utiliser la méthode de classe [`#content_security_policy`](pathname:///api/dev/Marten/Handlers/ContentSecurityPolicy/ClassMethods.html#content_security_policy(%26content_security_policy_block%3AHTTP%3A%3AContentSecurityPolicy->)-instance-method), qui fournit un objet [`Marten::HTTP::ContentSecurityPolicy`](pathname:///api/dev/Marten/HTTP/ContentSecurityPolicy.html) que vous pouvez configurer (en ajoutant/modifiant/supprimant des directives CSP) pour le handler en question. Par exemple :

```crystal
class ProtectedHandler < Marten::Handler
  content_security_policy do |csp|
    csp.default_src = {:self, "example.com"}
  end

  # [...]
end
```

## Utiliser un nonce CSP

Les nonces CSP servent d'outil précieux pour permettre l'exécution ou le rendu d'éléments spécifiques, comme les tags de script ou de style en ligne, par le navigateur. Lorsqu'un tag contient la bonne valeur de nonce dans un attribut `nonce`, le navigateur accorde la permission pour son exécution ou son rendu, tout en bloquant les autres qui n'ont pas la valeur de nonce attendue.

Vous pouvez configurer Marten pour qu'il ajoute automatiquement un nonce à un ensemble explicite de directives Content-Security-Policy. Cela peut être réalisé en spécifiant la liste des directives CSP prévues dans le paramètre [`content_security_policy.nonce_directives`](../development/reference/settings.md#nonce_directives). Par exemple :

```crystal title="config/settings/base.cr"
Marten.configure do |config|
  config.content_security_policy.nonce_directives = ["script-src", "style-src"]
end
```

Par exemple, si ce paramètre est défini sur `["script-src", "style-src"]`, une valeur `nonce-<b64-value>` sera ajoutée aux directives `script-src` et `style-src` dans la valeur de l'en-tête Content-Security-Policy. Le nonce est une valeur Base64 générée aléatoirement (générée via l'utilisation de [`Random::Secure#urlsafe_base64`](https://crystal-lang.org/api/Random.html#urlsafe_base64(n:Int=16,padding=false):String-instance-method)).

Pour que le navigateur fasse quoi que ce soit avec la valeur du nonce, vous devrez l'inclure dans les attributs des tags que vous souhaitez marquer comme sûrs. Dans cette optique, vous pouvez utiliser la méthode [`Marten::HTTP::Request#content_security_policy_nonce`](pathname:///api/dev/Marten/HTTP/Request.html#content_security_policy_nonce-instance-method), qui retourne la valeur du nonce CSP pour la requête actuelle. Cette méthode peut également être appelée depuis les [templates](../templates.mdx), ce qui facilite la génération de tags `script` ou `style` contenant le bon attribut `nonce` :

```html
<script nonce="{{ request.content_security_policy_nonce }}">
  var hello = "world";
</script>
```
