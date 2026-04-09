---
title: Middlewares
description: Référence des middlewares
---

Cette page fournit une référence pour tous les [middlewares](../middlewares.md) disponibles.

## Middleware de service des assets

**Classe :** [`Marten::Middleware::AssetServing`](pathname:///api/dev/Marten/Middleware/AssetServing.html)

Le but de ce middleware est de gérer la distribution des assets collectés, qui sont stockés sous la racine des assets configurée (paramètre [`assets.root`](../../development/reference/settings.md#root)). L'hypothèse est que ces assets ont été « collectés » en utilisant la commande de gestion [`collectassets`](../../development/reference/management-commands.md#collectassets) et que le stockage sur système de fichiers ([`Marten::Core::Storage::FileSystem`](pathname:///api/dev/Marten/Core/Storage/FileSystem.html)) est utilisé.

De plus, le paramètre [`assets.url`](../../development/reference/settings.md#url) doit soit correspondre au domaine de votre application Marten, soit correspondre à un chemin d'URL relatif, tel que `/assets/`. Cela garantit un mappage correct et l'accessibilité des assets au sein de votre application (afin qu'ils puissent être servis par ce middleware).

Il est important de mentionner que ce middleware applique automatiquement la compression aux assets servis, en utilisant GZip ou deflate en fonction de l'en-tête Accept-Encoding de la requête entrante. De plus, le middleware définit l'en-tête Cache-Control et définit un max-age de 3600 secondes, assurant une mise en cache efficace des assets.

:::info
Ce middleware doit être placé en première position dans le paramètre [`middleware`](../../development/reference/settings.md#middleware) (c'est-à-dire avant tous les autres middlewares configurés).
:::

:::tip
Ce middleware est fourni pour faciliter le service des assets dans les situations où vous ne pouvez pas facilement configurer un serveur web tel que [Nginx](https://nginx.org) ou un service tiers (comme Amazon S3 ou GCS) pour servir vos assets directement.
:::

## Middleware Content-Security-Policy

**Classe :** [`Marten::Middleware::ContentSecurityPolicy`](pathname:///api/dev/Marten/Middleware/ContentSecurityPolicy.html)

Ce middleware garantit la présence de l'en-tête Content-Security-Policy dans les en-têtes de la réponse. Cet en-tête offre aux clients la possibilité de limiter les sources autorisées de différents types de contenu.

Par défaut, le middleware inclura un en-tête Content-Security-Policy qui correspond à la politique définie dans les paramètres [`content_security_policy`](../../development/reference/settings.md#content-security-policy-settings). Cependant, si un objet [`Marten::HTTP::ContentSecurityPolicy`](pathname:///api/dev/Marten/HTTP/ContentSecurityPolicy.html) est explicitement assigné à l'objet de requête, il prendra le pas sur la politique par défaut et sera utilisé à la place.

Veuillez vous référer à [Content Security Policy](../../security/content-security-policy.md) pour en savoir plus sur l'en-tête Content-Security-Policy et comment le configurer.

## Middleware Flash

**Classe :** [`Marten::Middleware::Flash`](pathname:///api/dev/Marten/Middleware/Flash.html)

Active l'utilisation des [messages flash](../introduction.md#utiliser-le-magasin-flash).

Lorsque ce middleware est utilisé, chaque requête aura un magasin flash initialisé et peuplé depuis le magasin de sessions de la requête. Ce magasin flash est un objet de type hash qui permet de récupérer ou de définir des valeurs associées à des clés spécifiques, et qui ne seront disponibles que pour la prochaine requête (après quoi elles seront effacées).

Le magasin flash dépend de la présence d'un magasin de sessions fonctionnel. À ce titre, le [middleware Session](#middleware-session) DOIT être utilisé conjointement avec ce middleware. De plus, ce middleware doit être placé _après_ le [`Marten::Middleware::Session`](pathname:///api/dev/Marten/Middleware/Session.html) dans le paramètre [`middleware`](../../development/reference/settings.md#middleware).

## Middleware GZip

**Classe :** [`Marten::Middleware::GZip`](pathname:///api/dev/Marten/Middleware/GZip.html)

Compresse le contenu de la réponse si le navigateur prend en charge la compression GZip.

Ce middleware compressera les réponses suffisamment volumineuses (200 octets ou plus) si elles ne contiennent pas déjà un en-tête Accept-Encoding. Il définira également correctement l'en-tête Vary en incluant Accept-Encoding afin que les caches tiennent compte du fait que le contenu peut être compressé ou non.

Le middleware GZip doit être positionné avant tout autre middleware ayant besoin d'interagir avec le contenu de la réponse dans le paramètre [`middleware`](../../development/reference/settings.md#middleware). Cela permet de s'assurer que la compression n'intervient que lorsque le contenu de la réponse n'est plus accédé.

:::note
Le middleware GZip intègre une stratégie d'atténuation contre l'[attaque BREACH](https://www.breachattack.com/). Cette stratégie (décrite dans le [document Heal The Breach](https://ieeexplore.ieee.org/document/9754554)) consiste à introduire jusqu'à 100 octets aléatoires dans les réponses GZip pour renforcer la sécurité contre ce type d'attaques.
:::

## Middleware I18n

**Classe :** [`Marten::Middleware::I18n`](pathname:///api/dev/Marten/Middleware/I18n.html)

Active la bonne locale I18n en fonction des requêtes entrantes.

Ce middleware activera la bonne locale en fonction de l'en-tête Accept-Language ou de la valeur fournie par le [cookie de locale](../../development/reference/settings.md#locale_cookie_name). Seules les locales explicitement configurées peuvent être activées par ce middleware (c'est-à-dire les locales spécifiées dans les paramètres [`i18n.available_locales`](../../development/reference/settings.md#available_locales) et [`i18n.default_locale`](../../development/reference/settings.md#default_locale)). Si la locale entrante ne peut pas être trouvée dans la configuration du projet, la locale par défaut sera utilisée à la place.

De plus, si (et seulement si) des [routes localisées](../../i18n/localized-routes.md) sont utilisées, le middleware utilisera le préfixe de locale spécifié dans les chemins entrants avec priorité sur les règles mentionnées précédemment pour identifier la locale à activer. Par exemple, si le chemin de la requête est `/fr/bonjour`, alors la locale activée sera `fr`.

## Middleware Method Override {#method-override-middleware}

**Classe :** [`Marten::Middleware::MethodOverride`](pathname:///api/dev/Marten/Middleware/MethodOverride.html)

Ce middleware active la prise en charge du remplacement des méthodes HTTP dans les formulaires HTML qui ne supportent nativement que GET et POST. Il le fait en inspectant les requêtes et en cherchant un paramètre `_method`, permettant de simuler des méthodes comme PUT, DELETE, et d'autres. Il est également possible de changer le nom du paramètre et les méthodes de remplacement autorisées dans la [configuration de remplacement de méthode](../../development/reference/settings.md#method-overriding-settings).

Par exemple :

```html
<form action="{% url 'articles:delete' %}" method="post">
  <input type="hidden" name="_method" value="DELETE">
  <button type="submit" value="submit">
    Delete Article
  </button>
</form>
```

Avec le middleware `MethodOverride`, la soumission du formulaire serait effectivement traitée comme une requête `DELETE` au lieu de `POST`.

:::info
Le middleware devrait être placé aussi loin que possible au début du tableau du paramètre [`middlewares`](../../development/reference/settings.md#middleware) afin que les autres middlewares reconnaissent déjà la méthode remplacée.
:::

## Middleware Referrer-Policy

**Classe :** [`Marten::Middleware::ReferrerPolicy`](pathname:///api/dev/Marten/Middleware/ReferrerPolicy.html)

Définit l'en-tête [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) dans la réponse s'il n'était pas déjà défini.

Lorsque ce middleware est utilisé, un en-tête Referrer-Policy sera inséré dans la réponse HTTP. La valeur de cet en-tête est configurable via le paramètre [`referrer_policy`](../../development/reference/settings.md#referrer_policy). Cet en-tête contrôle la quantité d'informations de référent envoyées avec les requêtes depuis votre site vers d'autres origines, améliorant la confidentialité et la sécurité des utilisateurs.

## Middleware Session

**Classe :** [`Marten::Middleware::Session`](pathname:///api/dev/Marten/Middleware/Session.html)

Active l'utilisation des [sessions](../sessions.md).

Lorsque ce middleware est utilisé, chaque requête aura un magasin de sessions initialisé selon la [configuration des sessions](../../development/reference/settings.md#sessions-settings). Ce magasin de sessions est un objet de type hash qui permet de récupérer ou de définir des valeurs associées à des clés spécifiques.

Le magasin de sessions est initialisé à partir d'une clé de session stockée comme un cookie classique. Si le magasin de sessions finit par être vide après le traitement d'une requête, le cookie associé est supprimé. Sinon, le cookie est rafraîchi si le magasin de sessions est modifié dans le cadre de la requête considérée. Chaque cookie de session est configuré pour expirer selon un âge maximum de cookie configuré (l'âge maximum par défaut du cookie est de 2 semaines).

## Middleware de redirection SSL

**Classe :** [`Marten::Middleware::SSLRedirect`](pathname:///api/dev/Marten/Middleware/SSLRedirect.html)

Redirige toutes les requêtes non-HTTPS vers HTTPS.

Ce middleware redirigera de manière permanente toutes les requêtes non-HTTPS vers HTTPS. Par défaut, le middleware redirigera vers l'hôte de la requête entrante, mais un hôte différent vers lequel rediriger peut être configuré avec le paramètre [`ssl_redirect.host`](../../development/reference/settings.md#host-2). De plus, des chemins de requête spécifiques peuvent également être exemptés de cette redirection SSL si les chaînes ou expressions régulières correspondantes sont spécifiées dans le paramètre [`ssl_redirect.exempted_paths`](../../development/reference/settings.md#exempted_paths).

## Middleware Strict-Transport-Security

**Classe :** [`Marten::Middleware::StrictTransportSecurity`](pathname:///api/dev/Marten/Middleware/StrictTransportSecurity.html)

Définit l'en-tête Strict-Transport-Security dans la réponse s'il n'était pas déjà défini.

Ce middleware définit automatiquement l'en-tête de réponse HTTP Strict-Transport-Security (HSTS) pour toutes les réponses sauf s'il était déjà spécifié dans les en-têtes de réponse. Cela permet d'informer les navigateurs que le site web considéré ne doit être accédé qu'en HTTPS, ce qui entraîne la conversion automatique des futures requêtes HTTP en HTTPS (jusqu'à ce que l'âge maximum de la politique de transport strict configuré soit atteint).

Les navigateurs s'assurent que cette politique est appliquée pendant une durée spécifique car une directive `max-age` est intégrée dans la valeur de l'en-tête. Cette durée d'âge maximum est exprimée en secondes et peut être configurée en utilisant le paramètre [`strict_security_policy.max_age`](../../development/reference/settings.md#max_age).

:::caution
Lorsque vous activez ce middleware, vous devriez probablement commencer avec de petites valeurs pour le paramètre [`strict_security_policy.max_age`](../../development/reference/settings.md#max_age) (par exemple `3600` - une heure). En effet, lorsque les navigateurs ont connaissance de l'en-tête Strict-Transport-Security, ils refuseront de se connecter à votre site web en HTTP jusqu'à ce que le délai d'expiration correspondant à l'âge maximum configuré soit atteint.

C'est pourquoi la valeur du paramètre [`strict_security_policy.max_age`](../../development/reference/settings.md#max_age) est `nil` par défaut : cela empêche le middleware d'insérer l'en-tête de réponse Strict-Transport-Security tant que vous n'avez pas effectivement spécifié un âge maximum.
:::

## Middleware X-Frame-Options

**Classe :** [`Marten::Middleware::XFrameOptions`](pathname:///api/dev/Marten/Middleware/XFrameOptions.html)

Définit l'en-tête X-Frame-Options dans la réponse s'il n'était pas déjà défini.

Lorsque ce middleware est utilisé, un en-tête X-Frame-Options sera inséré dans la réponse HTTP. La valeur par défaut de cet en-tête (qui est configurable via le paramètre [`x_frame_options`](../../development/reference/settings.md#x_frame_options)) est "DENY", ce qui signifie que la réponse ne peut pas être affichée dans un cadre. Cela permet de prévenir les attaques par clickjacking, en s'assurant que l'application web ne peut pas être intégrée dans d'autres sites.

D'autre part, si `x_frame_options` est défini à "SAMEORIGIN", la page peut être affichée dans un cadre si le site l'incluant est le même que celui servant la page.
