---
title: Protection contre le clickjacking
description: Découvrez le clickjacking et comment Marten aide à protéger contre ce type d'attaques.
---

Ce document décrit le mécanisme de protection contre le clickjacking de Marten ainsi que les divers outils que vous pouvez utiliser pour le configurer et l'utiliser.

## Vue d'ensemble

Les attaques de clickjacking impliquent un site web malveillant intégrant un autre site web non protégé dans un cadre. Cela peut conduire les utilisateurs à effectuer des actions non intentionnelles sur le site ciblé.

La meilleure façon d'atténuer ce risque est de s'appuyer sur l'en-tête X-Frame-Options : cet en-tête indique si la ressource protégée est autorisée ou non à être intégrée dans un cadre, et si oui sous quelles conditions. L'en-tête X-Frame-Options peut être défini sur `DENY` ou `SAMEORIGIN` :

* `DENY` signifie que la réponse ne peut pas être affichée dans un cadre du tout
* `SAMEORIGINS` signifie que le navigateur autorisera l'affichage de la réponse dans un cadre si le site définissant le cadre est le même que celui servant la ressource réelle

## Utilisation basique

La protection contre le clickjacking de Marten implique l'utilisation d'un middleware dédié : le [middleware X-Frame-Options](../handlers-and-http/reference/middlewares.md#x-frame-options-middleware). Ce middleware est automatiquement ajouté au paramètre [`middleware`](../development/reference/settings.md#middleware) lors de la génération de projets via la commande de gestion [`new`](../development/reference/management-commands.md#new).

Le [middleware X-Frame-Options](../handlers-and-http/reference/middlewares.md#x-frame-options-middleware) définit simplement l'en-tête X-Frame-Options afin d'empêcher le site Marten considéré d'être inséré dans un cadre. La valeur utilisée pour l'en-tête X-Frame-Options dépend de la valeur du paramètre [`x_frame_options`](../development/reference/settings.md#x_frame_options) (dont la valeur par défaut est `DENY`).

Il convient de noter que vous pouvez décider de désactiver ou d'activer l'utilisation du [middleware X-Frame-Options](../handlers-and-http/reference/middlewares.md#x-frame-options-middleware) par handler. Pour ce faire, vous pouvez simplement utiliser la méthode de classe [`#exempt_from_x_frame_options`](https://martenframework.com/docs/api/dev/Marten/Handlers/XFrameOptions/ClassMethods.html#exempt_from_x_frame_options(exempt%3ABool)%3ANil-instance-method), qui prend un seul booléen comme argument :

```crystal
class ProtectedHandler < Marten::Handler
  exempt_from_x_frame_options false

  # [...]
end

class UnprotectedHandler < Marten::Handler
  exempt_from_x_frame_options true

  # [...]
end
```
