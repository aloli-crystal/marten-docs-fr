---
title: Protection contre les Cross-Site Request Forgery
description: Découvrez les attaques Cross-Site Request Forgery (CSRF) et comment protéger votre application contre celles-ci.
sidebar_label: Protection CSRF
---

Ce document décrit le mécanisme de protection contre les Cross-Site Request Forgery (CSRF) de Marten ainsi que les divers outils que vous pouvez utiliser pour le configurer et l'utiliser.

## Vue d'ensemble

Les attaques Cross-Site Request Forgery (CSRF) impliquent généralement un site web malveillant essayant d'effectuer des actions sur une application web au nom d'un utilisateur déjà authentifié. Marten fournit un mécanisme intégré pour protéger vos applications contre ce type d'attaque. Ce mécanisme est utile pour protéger les points de terminaison qui traitent des requêtes HTTP "non sûres" (c'est-à-dire les requêtes dont les méthodes ne sont pas `GET`, `HEAD`, `OPTIONS` ou `TRACE`).

:::caution
La protection CSRF ignore les requêtes HTTP sûres. Ainsi, vous devez vous assurer que celles-ci sont exemptes d'effets secondaires.
:::

La protection CSRF fournie par Marten est basée sur la vérification d'un token qui doit être fourni pour chaque requête HTTP non sûre. Ce token est stocké chez le client : Marten envoie un cookie de token avec chaque réponse HTTP lorsque la valeur du token est demandée dans les handlers (méthode [`#get_csrf_token`](https://martenframework.com/docs/api/dev/Marten/Handlers/RequestForgeryProtection.html#get_csrf_token-instance-method)) ou les templates (par exemple via l'utilisation des tags de template [`csrf_input`](../templates/reference/tags.md#csrf_input) ou [`csrf_token`](../templates/reference/tags.md#csrf_token)). Il convient de noter que la valeur réelle du cookie de token change chaque fois qu'une réponse HTTP est retournée au client : c'est parce que le token secret réel est brouillé en utilisant un masque qui change pour chaque requête où le token CSRF est demandé et utilisé.

La valeur du token doit être spécifiée lors de la soumission de requêtes HTTP non sûres : cela peut être fait soit dans les données elles-mêmes (en spécifiant un input `csrftoken`) soit en utilisant un en-tête spécifique (X-CSRF-Token). Lors de la réception de cette valeur, Marten la compare à la valeur du cookie de token : si les tokens ne sont pas valides, ou s'il y a une non-correspondance, alors cela signifie que la requête est malveillante et qu'elle doit être rejetée (ce qui résultera en une erreur 403).

Enfin, il convient de noter que quelques vérifications supplémentaires peuvent être effectuées en plus de la vérification du token :

* afin de protéger contre les attaques cross-subdomain, l'hôte de la requête HTTP sera vérifié pour s'assurer qu'il fait partie des hôtes autorisés (paramètre [`allowed_hosts`](../development/reference/settings.md#allowed_hosts)) ou que la valeur de l'en-tête Origin correspond aux origines de confiance configurées (paramètre [`csrf.trusted_origins`](../development/reference/settings.md#trusted_origins))
* l'en-tête Referer sera également vérifié pour les requêtes HTTPS (si l'en-tête Origin n'est pas défini) afin d'empêcher les sous-domaines d'effectuer des requêtes HTTP non sûres sur les applications web protégées (sauf si ces sous-domaines sont explicitement autorisés dans le paramètre [`csrf.trusted_origins`](../development/reference/settings.md#trusted_origins))

La protection Cross-Site Request Forgery fournie par Marten se produit automatiquement au niveau du handler. Cette protection est implémentée dans le module [`Marten::Handlers::RequestForgeryProtection`](https://martenframework.com/docs/api/dev/Marten/Handlers/RequestForgeryProtection.html).

## Utilisation basique

Vous devez d'abord vous assurer que la protection CSRF est activée, ce qui est le cas par défaut lorsque les projets sont générés via la commande de gestion [`new`](../development/reference/management-commands.md#new). Cela dit, si la protection CSRF est globalement désactivée (lorsque le paramètre [`csrf.protection_enabled`](../development/reference/settings.md#protection_enabled) est défini sur `false`) vous devez vous assurer que votre handler l'active _localement_. Par exemple :

```crystal
class MyHandler < Marten::Handler
  protect_from_forgery true

  # [...]
end
```

Ensuite, tout ce que vous devez faire est de vous assurer que vous incluez le token CSRF lors de la soumission de requêtes HTTP non sûres à votre application web. La façon de procéder dépend de _comment_ vous avez l'intention de soumettre ces requêtes.

### Utiliser la protection CSRF avec les formulaires

Si vous devez intégrer le token CSRF dans un formulaire généré par un [template](../templates.mdx), alors vous pouvez utiliser le tag de template [`csrf_input`](../templates/reference/tags.md#csrf_input) afin de vous assurer qu'un input caché `csrftoken` contenant le token CSRF est présent dans le formulaire.

Par exemple :

```html
<form method="post" action="" novalidate>
  {% csrf_input %}

  <!-- [...] -->

  <fieldset>
    <button>Submit</button>
  </fieldset>
</form>
```

Alternativement, vous pouvez utiliser le tag de template [`csrf_token`](../templates/reference/tags.md#csrf_token) pour insérer la valeur brute du token CSRF directement dans vos templates. Cette approche est particulièrement utile si vous devez créer manuellement un input de formulaire CSRF caché. Par exemple :

```html
<form method="post" action="" novalidate>
  <input type="hidden" name="csrftoken" value="{% csrf_token %}" />

  <!-- [...] -->

  <fieldset>
    <button>Submit</button>
  </fieldset>
</form>
```

:::caution
Vous ne devriez jamais définir un input caché `csrftoken` dans un formulaire qui ne cible pas directement votre application. C'est pour empêcher la fuite de votre token CSRF.
:::

### Utiliser la protection CSRF avec AJAX

Si vous devez soumettre des requêtes HTTP non sûres côté client en utilisant AJAX, alors vous devez également vous assurer que le token CSRF est spécifié dans la requête. Dans cette optique, vous pouvez générer des requêtes qui incluent un en-tête X-CSRF-Token avec la valeur du token. Mais vous devez d'abord récupérer le token CSRF. Pour l'obtenir, vous pouvez soit :

* récupérer le token CSRF depuis les cookies (ce qui ne peut être fait que si le paramètre [`csrf.cookie_http_only`](../development/reference/settings.md#cookie_http_only) est défini sur `false`)
* ou insérer le token CSRF quelque part dans votre balisage HTML (ce qui est la méthode à privilégier si le paramètre [`csrf.cookie_http_only`](../development/reference/settings.md#cookie_http_only) est défini sur `true`)

Récupérer le token CSRF depuis les cookies côté client peut être facilement fait en utilisant une bibliothèque dédiée comme [JavaScript Cookie](https://www.npmjs.com/package/cookie) :

```javascript
const csrfToken = Cookies.get("csrftoken");
```

Si vous ne pouvez pas utiliser cette technique parce que le paramètre [`csrf.cookie_http_only`](../development/reference/settings.md#cookie_http_only) est défini sur `true`, alors vous pouvez également définir le token CSRF comme une variable JavaScript côté template (en utilisant le tag de template [`csrf_token`](../templates/reference/tags.md#csrf_token)) :

```html
<script>
const csrfToken = "{% csrf_token %}";
</script>
```

Une approche alternative pourrait également impliquer la définition d'un tag invisible avec un attribut data, et la récupération de cette valeur afin de définir une variable JavaScript contenant la valeur du token :

```html
<div id="csrf_token" data-csrf-token="{% csrf_token %}"></div>
<script>
const csrfToken = document.getElementById("csrf_token").dataset.csrfToken;
</script>
```

Une fois que vous avez la valeur du token CSRF, tout ce que vous devez faire est de vous assurer qu'un en-tête X-CSRF-Token est défini avec cette valeur dans toutes les requêtes HTTP non sûres que vous émettez.

## Configurer la protection CSRF

La protection CSRF est activée par défaut et peut être configurée via l'utilisation d'un [ensemble dédié de paramètres](../development/reference/settings.md#csrf-settings). Ces paramètres peuvent être utilisés pour activer ou désactiver la protection globalement, ajuster certains des paramètres du cookie de token CSRF, changer les origines de confiance, etc.

## Activer ou désactiver la protection par handler

Indépendamment de la valeur du paramètre [`csrf.protection_enabled`](../development/reference/settings.md#protection_enabled), il est possible d'activer ou de désactiver la protection CSRF par handler. Cela peut être réalisé via l'utilisation de la méthode de classe [`#protect_from_forgery`](https://martenframework.com/docs/api/dev/Marten/Handlers/RequestForgeryProtection/ClassMethods.html#protect_from_forgery(protect%3ABool)%3ANil-instance-method), qui prend un seul booléen comme argument :

```crystal
class ProtectedHandler < Marten::Handler
  protect_from_forgery true

  # [...]
end

class UnprotectedHandler < Marten::Handler
  protect_from_forgery false

  # [...]
end
```
