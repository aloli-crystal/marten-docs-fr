---
title: Callbacks de modèles
description: Apprenez à définir des callbacks de modèles.
sidebar_label: Callbacks
---

Les callbacks de modèles vous permettent de définir une logique déclenchée avant ou après l'altération de l'état d'un enregistrement. Ce sont des méthodes qui sont appelées à des étapes spécifiques du cycle de vie d'un enregistrement. Par exemple, les callbacks peuvent être appelés lorsque des instances de modèles sont créées, mises à jour ou supprimées. Ce document couvre les callbacks disponibles et vous présente l'API associée, que vous pouvez utiliser pour définir des hooks dans vos modèles.

## Vue d'ensemble

Comme indiqué ci-dessus, les callbacks sont des méthodes qui seront appelées lorsque des événements spécifiques se produisent pour une instance de modèle donnée. Ils doivent être enregistrés explicitement dans vos définitions de modèles. Il existe [de nombreux types de callbacks](#callbacks-disponibles), et il est possible d'enregistrer des callbacks "before" ou "after" pour la plupart de ces types.

Enregistrer un callback est aussi simple qu'appeler la bonne macro de callback (par ex. `#before_validation`) avec un symbole du nom de la méthode à appeler lorsque le callback est exécuté. Par exemple :

```crystal
class User < Marten::Model
  field :id, :big_int, primary_key: true, auto: true
  field :username, :string, max_size: 64, unique: true

  before_validation :ensure_username_is_downcased

  private def ensure_username_is_downcased
    self.username = username.try(&.downcase)
  end
end
```

Dans l'extrait ci-dessus, un callback `before_validation` est enregistré pour s'assurer que le `username` d'une instance `User` est en minuscules avant toute validation.

Cette technique d'enregistrement de callback est partagée par tous les types de callbacks.

Il est à noter que l'ordre dans lequel les méthodes de callback sont enregistrées pour un type de callback donné (par ex. `before_update`) est important : les callbacks seront appelés dans l'ordre dans lequel ils ont été enregistrés.

## Callbacks disponibles

### `after_initialize`

Les callbacks `after_initialize` sont appelés juste après l'initialisation d'une instance de modèle. Ils seront appelés automatiquement lorsque de nouvelles instances de modèles sont initialisées via l'utilisation de `new` ou lorsque des enregistrements sont récupérés de la base de données.

### `before_validation` et `after_validation`

Les callbacks `before_validation` sont appelés avant l'exécution des règles de validation pour une instance de modèle donnée, tandis que les callbacks `after_validation` sont exécutés après. Ils peuvent être utilisés pour assainir les attributs d'une instance de modèle, par exemple.

L'utilisation de méthodes comme `#valid?` ou `#invalid?`, ou toute autre méthode impliquant des validations (`#save`, `#save!`, `#create` ou `#create!`), déclenchera les callbacks de validation. Voir [Validations de modèles](./validations.md) pour plus de détails.

### `before_create` et `after_create`

Les callbacks `before_create` sont appelés avant qu'un nouvel enregistrement ne soit inséré dans la base de données. Les callbacks `after_create` sont appelés après qu'un nouvel enregistrement a été créé au niveau de la base de données.

L'utilisation de la méthode `#save` (ou `#save!`) sur une nouvelle instance de modèle déclenchera l'exécution des callbacks de création. L'utilisation des méthodes `#create` / `#create!` déclenchera également ces callbacks.

### `before_update` et `after_update`

Les callbacks `before_update` sont appelés avant qu'un enregistrement existant ne soit mis à jour, tandis que les callbacks `after_update` sont appelés après.

L'utilisation de la méthode `#save` (ou `#save!`) sur un enregistrement de modèle existant déclenchera l'exécution des callbacks de mise à jour.

### `before_save` et `after_save`

Les callbacks `before_save` sont appelés avant qu'un enregistrement (existant ou nouveau) ne soit sauvegardé dans la base de données, tandis que les callbacks `after_save` sont appelés après.

L'utilisation des méthodes `#save` / `#save!` et `#create` / `#create!` déclenchera l'exécution des callbacks de sauvegarde.

:::info
`before_save` et `after_save` sont appelés à la fois pour les enregistrements nouveaux et existants. Les callbacks `before_save` sont toujours exécutés _avant_ les callbacks `before_create` ou `before_update`. Les callbacks `after_save`, en revanche, sont toujours exécutés _après_ les callbacks `after_create` ou `after_update`.
:::

### `before_delete` et `after_delete`

Les callbacks `before_delete` sont appelés avant qu'un enregistrement ne soit supprimé, tandis que les callbacks `after_delete` sont appelés après.

L'utilisation de la méthode `#delete` déclenchera ces callbacks.

### `after_commit`

Les callbacks `after_commit` sont appelés après qu'un enregistrement est créé, mis à jour ou supprimé, mais uniquement après que la transaction SQL correspondante a été validée dans la base de données (ce qui n'est pas le cas pour les autres callbacks `after_*` - Voir [Transactions](./transactions.md) pour plus de détails). Par exemple :

```crystal
after_commit :do_something
```

Comme mentionné précédemment, par défaut ces callbacks s'exécuteront dans le contexte des créations, mises à jour et suppressions d'enregistrements. Cela dit, il est également possible d'associer ces callbacks à une ou plusieurs actions spécifiques uniquement en utilisant l'argument `on`. Par exemple :

```crystal
after_commit :do_something, on: :create # S'exécutera après les créations uniquement
after_commit :do_something, on: :update # S'exécutera après les mises à jour uniquement
after_commit :do_something, on: :update # S'exécutera après les sauvegardes (créations ou mises à jour) uniquement
after_commit :do_something, on: :delete # S'exécutera après les suppressions uniquement
after_commit :do_something_else, on: [:create, :delete] # S'exécutera après les créations et suppressions uniquement
```

Les actions supportées par l'argument `on` sont `create`, `update`, `save` et `delete`.

### `after_rollback`

Les callbacks `after_rollback` sont appelés après qu'une transaction est annulée lorsqu'un enregistrement est créé, mis à jour ou supprimé. Par exemple :

```crystal
after_rollback :do_something
```

Comme mentionné précédemment, par défaut ces callbacks s'exécuteront dans le contexte des créations, mises à jour et suppressions d'enregistrements. Cela dit, il est également possible d'associer ces callbacks à une ou plusieurs actions spécifiques uniquement en utilisant l'argument `on`. Par exemple :

```crystal
after_rollback :do_something, on: :create # S'exécutera après les créations annulées uniquement
after_rollback :do_something, on: :update # S'exécutera après les mises à jour annulées uniquement
after_rollback :do_something, on: :update # S'exécutera après les sauvegardes annulées (créations ou mises à jour) uniquement
after_rollback :do_something, on: :delete # S'exécutera après les suppressions annulées uniquement
after_rollback :do_something_else, on: [:create, :delete] # S'exécutera après les créations et suppressions annulées uniquement
```

Les actions supportées par l'argument `on` sont `create`, `update`, `save` et `delete`.

## Méthodes qui contournent les callbacks

Certaines méthodes de modèle contournent intentionnellement les callbacks pour des raisons de performance ou des cas d'utilisation spécifiques. Les méthodes suivantes ne déclenchent **pas** de callbacks :

* `#update_columns` et `#update_columns!` - Ces méthodes mettent à jour des colonnes spécifiques directement dans la base de données sans exécuter les validations ni aucun callback du cycle de vie. Elles sont utiles pour les mises à jour critiques en termes de performance où vous souhaitez éviter la surcharge du cycle de vie complet de sauvegarde.

Si vous devez mettre à jour des enregistrements tout en vous assurant que les callbacks sont exécutés, utilisez plutôt les méthodes standard `#save`, `#save!`, `#update` ou `#update!`.
