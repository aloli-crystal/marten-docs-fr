---
title: Paramètres
description: Apprenez les bases des paramètres de Marten.
sidebar_label: Paramètres
---

Les projets Marten peuvent être configurés grâce à l'utilisation de fichiers de paramètres. Cette section explique comment fonctionnent les paramètres, comment ils sont liés aux environnements, et comment ils peuvent être modifiés.

## Vue d'ensemble

Les paramètres sont généralement définis dans un dossier `config/settings` à la racine de la structure de votre projet. Il n'y a pas d'exigences strictes concernant _où_ les paramètres sont définis ni comment ils sont organisés, mais en règle générale, il est recommandé d'organiser les paramètres sur une base par environnement (paramètres partagés, paramètres de développement, paramètres de production, etc).

Dans une telle configuration, vous définirez généralement les paramètres partagés (paramètres communs à tous vos environnements) dans un fichier de paramètres dédié (ex. `config/settings/base.cr`) et les autres paramètres spécifiques à un environnement dans d'autres fichiers (ex. `config/settings/development.cr`).

Pour définir des paramètres, il est nécessaire d'accéder à l'objet de configuration global de Marten via la méthode [`Marten#configure`](https://martenframework.com/docs/api/dev/Marten.html#configure(env%3ANil|String|Symbol%3Dnil%2C%26)-class-method). Cette méthode retourne un objet [`Marten::Conf::GlobalSettings`](https://martenframework.com/docs/api/dev/Marten/Conf/GlobalSettings.html) que vous pouvez utiliser pour définir les valeurs des paramètres. Par exemple :

```crystal
Marten.configure do |config|
  config.installed_apps = [
    FooApp,
    BarApp,
  ]

  config.middleware = [
    Marten::Middleware::Session,
    Marten::Middleware::Flash,
    Marten::Middleware::GZip,
    Marten::Middleware::XFrameOptions,
  ]

  config.database do |db|
    db.backend = :postgresql
    db.name = "dummypress"
    db.host = "localhost"
    db.password = ""
  end
end
```

Il convient de noter que la méthode [`Marten#configure`](https://martenframework.com/docs/api/dev/Marten.html#configure(env%3ANil|String|Symbol%3Dnil%2C%26)-class-method) peut être appelée avec un argument supplémentaire pour s'assurer que les paramètres sous-jacents ne sont définis que pour un environnement spécifique :

```crystal
Marten.configure :development do |config|
  config.secret_key = "INSECURE"
end
```

:::caution
Vous devriez éviter de modifier les valeurs des paramètres en dehors du bloc de configuration fourni par la méthode [`Marten#configure`](https://martenframework.com/docs/api/dev/Marten.html#configure(env%3ANil|String|Symbol%3Dnil%2C%26)-class-method). La plupart des paramètres sont "lus" et appliqués lorsque le projet Marten est initialisé, c'est-à-dire avant que le serveur ne démarre effectivement. Modifier ces valeurs après coup ne produira aucun résultat significatif.
:::

## Environnements

Lors de la création de nouveaux projets avec la commande de gestion [`new`](./reference/management-commands.md#new), les environnements suivants seront créés automatiquement :

* Development (paramètres définis dans `config/settings/development.cr`)
* Test (paramètres définis dans `config/settings/test.cr`)
* Production (paramètres définis dans `config/settings/production.cr`)

Lorsque votre application est en cours d'exécution, Marten s'appuiera sur la variable d'environnement `MARTEN_ENV` pour déterminer l'environnement actuel. Si cette variable d'environnement n'est pas trouvée, l'environnement sera automatiquement défini à `development`. La valeur que vous spécifiez dans la variable d'environnement `MARTEN_ENV` doit correspondre à l'argument que vous passez à la méthode [`Marten#configure`](https://martenframework.com/docs/api/dev/Marten.html#configure(env%3ANil|String|Symbol%3Dnil%2C%26)-class-method).

Il convient de noter que l'environnement actuel peut être récupéré via la méthode [`Marten#env`](https://martenframework.com/docs/api/dev/Marten.html#env-class-method), qui retourne un objet [`Marten::Conf::Env`](https://martenframework.com/docs/api/dev/Marten/Conf/Env.html). Par exemple :

```crystal
Marten.env              # => <Marten::Conf::Env:0x1052b8060 @id="development">
Marten.env.id           # => "development"
Marten.env.development? # => true
```

## Paramètres disponibles

Tous les paramètres disponibles sont listés dans la [référence des paramètres](./reference/settings.md).
