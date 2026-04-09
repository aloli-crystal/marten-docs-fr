---
title: Introduction à l'authentification
description: Apprenez à configurer l'authentification pour votre projet Marten.
sidebar_label: Introduction
---

Marten permet la génération de nouveaux projets avec une application d'authentification intégrée qui gère les besoins basiques de gestion des utilisateurs. Vous pouvez ensuite étendre et adapter cette application pour qu'elle réponde aux besoins de votre projet.

## Vue d'ensemble

La commande de gestion [`new`](../development/reference/management-commands.md#new) de Marten permet la génération de projets avec une application `auth` intégrée. La même application peut également être ajoutée à des projets existants en utilisant le générateur [`auth`](../development/reference/generators.md#auth).

L'application d'authentification générée fait partie de votre projet : elle fournit les [modèles](../models-and-databases.mdx), [handlers](../handlers-and-http.mdx), [schemas](../schemas.mdx), [emails](../emailing.mdx) et [templates](../templates.mdx) nécessaires permettant d'authentifier les utilisateurs avec des adresses email et des mots de passe, tout en prenant en charge les flux standard de réinitialisation de mot de passe. De plus, un modèle `Auth::User` est automatiquement généré pour vos projets nouvellement créés. Puisque ce modèle fait également partie de votre projet, cela signifie qu'il est possible d'y ajouter facilement de nouveaux champs et de générer des migrations pour celui-ci également.

Voici la liste des responsabilités de l'application d'authentification générée :

* Inscription des utilisateurs
* Connexion des utilisateurs
* Déconnexion des utilisateurs
* Permettre aux utilisateurs de réinitialiser leur mot de passe
* Permettre aux utilisateurs d'accéder à une page de profil basique

En interne, cette application d'authentification repose sur le shard officiel [`marten-auth`](https://github.com/martenframework/marten-auth). Ce shard implémente les opérations d'authentification de bas niveau (comme l'authentification des identifiants utilisateur, la génération de mots de passe chiffrés de manière sécurisée, la génération de tokens de réinitialisation de mot de passe, etc).

## Générer des projets avec authentification

Générer de nouveaux projets avec authentification peut être facilement réalisé en utilisant l'option `--with-auth` de la commande de gestion [`new`](../development/reference/management-commands.md#new).

Par exemple :

```bash
marten new project myblog --with-auth
```

Lors de l'utilisation de cette option, Marten générera une [application](../development/applications.md) `auth` sous le dossier `src/apps/auth` de votre projet. Comme mentionné précédemment, cette application fournit un ensemble de [modèles](../models-and-databases.mdx), [handlers](../handlers-and-http.mdx), [schemas](../schemas.mdx), [emails](../emailing.mdx) et [templates](../templates.mdx) qui implémentent les opérations d'authentification basiques.

Vous pouvez tester l'application d'authentification générée en allant sur votre application à [http://localhost:8000/auth/signup](http://localhost:8000/auth/signup) après avoir démarré le serveur de développement Marten (en utilisant `marten serve`).

:::info
Vous pouvez voir la liste complète des fichiers générés pour l'application `auth` dans [Fichiers générés](./reference/generated-files.md).
:::

## Ajouter l'authentification à des projets existants

Le générateur [`auth`](../development/reference/generators.md#auth) peut être utilisé pour ajouter une application d'authentification à un projet existant.

Par exemple, la commande suivante ajoutera une nouvelle application d'authentification avec le label `auth` au projet actuel :

```bash
marten gen auth
```

:::tip
Notez que vous pouvez également personnaliser le label donné à l'application d'authentification générée en fournissant un argument supplémentaire contenant le label d'application souhaité :

```bash
marten gen auth my_auth
```
:::

Ce générateur ajoutera une application d'authentification sous le dossier `src` de votre projet (ou le dossier `src/apps` s'il est défini). Comme mentionné précédemment, cette application fournit un ensemble de [modèles](../models-and-databases.mdx), [handlers](../handlers-and-http.mdx), [schemas](../schemas.mdx), [emails](../emailing.mdx) et [templates](../templates.mdx) qui implémentent les opérations d'authentification basiques.

Notez que le générateur ajoutera également l'application générée au paramètre [`installed_apps`](../development/reference/settings.md#installed_apps) et configurera également les requires Crystal pour celle-ci (dans les fichiers `src/project.cr` et `src/cli.cr`). Il ajoutera également les paramètres liés à l'authentification à votre fichier de paramètres de base et ajoutera le shard [`marten-auth`](https://github.com/martenframework/marten-auth) au `shard.yml` de votre projet automatiquement.

:::info
Vous pouvez voir la liste complète des fichiers générés pour l'application d'authentification générée dans [Fichiers générés](./reference/generated-files.md).
:::

:::tip
N'oubliez pas d'exécuter [`marten migrate`](../development/reference/management-commands.md#migrate) après la génération de l'application d'authentification afin que votre modèle utilisateur soit créé au niveau de la base de données. Vous devriez également vérifier le fichier `config/routes.cr` ou exécuter la commande de gestion [`marten routes`](../development/reference/management-commands.md#routes) pour voir les routes associées à votre application d'authentification générée.
:::

## Utilisation

Cette section couvre les bases de l'utilisation de l'application `auth` - alimentée par [`marten-auth`](https://github.com/martenframework/marten-auth) - qui est générée lors de la création de projets avec l'option `--with-auth`.

### Le modèle `User`

L'application `auth` définit un seul modèle `Auth::User` qui hérite ses champs du modèle abstrait `MartenAuth::User`. Ainsi, ce modèle fournit automatiquement les champs suivants :

* `id` - un champ [`big_int`](../models-and-databases/reference/fields.md#big_int) contenant la clé primaire de l'utilisateur
* `email` - un champ [`email`](../models-and-databases/reference/fields.md#email) contenant l'adresse email de l'utilisateur
* `password` - un champ [`string`](../models-and-databases/reference/fields.md#string) contenant le mot de passe chiffré de l'utilisateur
* `created_at` - un champ [`date_time`](../models-and-databases/reference/fields.md#date_time) contenant la date de création de l'utilisateur
* `updated_at` - un champ [`date_time`](../models-and-databases/reference/fields.md#date_time) contenant la date de dernière modification de l'utilisateur

### Récupérer l'utilisateur actuel

Les projets générés avec l'application `auth` utilisent automatiquement un middleware (`MartenAuth::Middleware`) qui garantit que l'ID de l'utilisateur actuellement authentifié est associé à la requête actuelle. Cela signifie qu'étant donné une requête HTTP spécifique (instance de [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html)), il est possible d'identifier quel utilisateur est connecté ou non. Concrètement, les méthodes suivantes sont rendues disponibles sur l'objet standard [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html) afin d'interagir avec l'utilisateur actuellement connecté :

| Méthode | Description |
| --- | --- |
| `#user_id` | Retourne l'ID de l'utilisateur actuel associé à la requête considérée, ou `nil` s'il n'y a pas d'utilisateur authentifié. |
| `#user` | Retourne l'utilisateur associé à la requête, ou `nil` s'il n'y a pas d'utilisateur authentifié. |
| `#user!` | Retourne l'utilisateur associé à la requête, ou lève `NilAssertionError` s'il n'y a pas d'utilisateur authentifié. |
| `#user?` | Retourne `true` si un utilisateur est authentifié pour la requête. |

Cela permet de vérifier facilement si un utilisateur est authentifié dans les handlers afin d'implémenter différentes logiques. Par exemple :

```crystal
class MyHandler < Marten::Handler
  def get
    if request.user?
      respond "User ##{request.user!.id} is signed-in"
    else
      respond "No signed-in user"
    end
  end
end
```

### Créer des utilisateurs

Créer un utilisateur est aussi simple qu'initialiser une instance du modèle `Auth::User` et définir ses propriétés. Cela dit, il est important de noter que le mot de passe de l'utilisateur (champ `password`) doit être défini en utilisant la méthode `#set_password` : cela garantira que le mot de passe _brut_ que vous fournissez à cette méthode est correctement chiffré et que le hash résultant est assigné au champ `password`. Pour cette raison, vous ne devriez pas tenter de manipuler directement l'attribut du champ `password` des enregistrements utilisateur.

Par exemple :

```crystal
user = Auth::User.new(email: "test@example.com") do |user|
  user.set_password("insecure")
end

user.save!
```

:::tip
Dans certains scénarios où les mots de passe ne sont pas requis, comme avec l'authentification par lien magique par email ou l'authentification OAuth multi-fournisseur, il peut être souhaitable de créer des comptes utilisateur sans mot de passe. Pour y parvenir, vous pouvez utiliser la méthode `#set_unusable_password` sur vos instances de modèle utilisateur. Cette méthode garantit qu'aucun mot de passe ne peut être utilisé pour ces comptes.

Par exemple :

```crystal
user = Auth::User.new(email: "test@example.com") do |user|
  user.set_unusable_password
end

user.save!
```
:::

### Authentifier des utilisateurs

L'authentification est l'acte de vérifier les identifiants d'un utilisateur. Cette capacité est fournie par le shard [`marten-auth`](https://github.com/martenframework/marten-auth) via l'utilisation de la méthode `MartenAuth#authenticate` : cette méthode essaie d'authentifier l'utilisateur identifié par une clé naturelle (typiquement, une adresse email) et vérifie que le mot de passe brut donné est valide. La méthode retourne l'enregistrement utilisateur correspondant si l'authentification est réussie. Sinon, elle retourne `nil` si les identifiants ne peuvent pas être vérifiés parce que l'utilisateur n'existe pas ou parce que le mot de passe est invalide.

Par exemple :

```crystal
user = MartenAuth.authenticate("test@example.com", "insecure")
if user
  puts "User credentials are valid!"
else
  puts "User credentials are not valid!"
end
```

:::caution
Il est important de réaliser que cette méthode _vérifie uniquement_ les identifiants utilisateur. **Elle ne connecte pas les utilisateurs** pour une requête spécifique. La connexion des utilisateurs (et leur attachement à la session actuelle) est gérée par la méthode `#sign_in`, qui est discutée dans [Connecter des utilisateurs](#connecter-des-utilisateurs).
:::

:::info
La méthode `MartenAuth#authenticate` est automatiquement utilisée par les handlers qui sont générés pour votre application `auth` avant de connecter les utilisateurs.
:::

### Connecter des utilisateurs

Connecter un utilisateur est l'acte de l'attacher à la session actuelle - après avoir vérifié que les identifiants associés sont valides (voir [Authentifier des utilisateurs](#authentifier-des-utilisateurs)). Cette capacité est fournie par le shard [`marten-auth`](https://github.com/martenframework/marten-auth) via l'utilisation de la méthode `MartenAuth#sign_in` : cette méthode prend un objet requête (instance de [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html)) et un enregistrement utilisateur comme arguments et garantit que l'ID utilisateur est attaché à la session actuelle afin qu'ils n'aient pas à se ré-authentifier pour chaque requête.

Par exemple :

```crystal
class MyHandler < Marten::Handler
  def post
    user = MartenAuth.authenticate(request.data["email"].to_s, request.data["password"].to_s)

    if user
      MartenAuth.sign_in(request, user)
      redirect reverse("auth:profile")
    else
      redirect reverse("auth:sign_in")
    end
  end
end
```

:::caution
Il est important de comprendre que cette méthode est destinée à être utilisée pour un enregistrement utilisateur dont les identifiants ont été validés en utilisant la méthode `#authenticate` au préalable. Voir [Authentifier des utilisateurs](#authentifier-des-utilisateurs) pour plus de détails.
:::

### Déconnecter des utilisateurs

La capacité de déconnecter des utilisateurs est fournie par le shard [`marten-auth`](https://github.com/martenframework/marten-auth) via l'utilisation de la méthode `MartenAuth#sign_out` : cette méthode prend un objet requête (instance de [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html)) comme argument, supprime l'ID utilisateur authentifié de la requête actuelle et vide les données de session associées.

Par exemple :

```crystal
class MyHandler < Marten::Handler
  def get
    MartenAuth.sign_out(request)
    redirect reverse("auth:sign_in")
  end
end
```

### Changer le mot de passe d'un utilisateur

La capacité de changer le mot de passe d'un utilisateur est fournie par la méthode `#set_password` du modèle `Auth::User` (qui est héritée de la classe abstraite `MartenAuth::User` fournie par le shard [`marten-auth`](https://github.com/martenframework/marten-auth)).

Par exemple :

```crystal
use = User.get!(email: "test@example.com")
user.set_password("insecure")
user.save!
```

:::info
Les mots de passe sont chiffrés en utilisant [`Crypto::Bcrypt`](https://crystal-lang.org/api/Crypto/Bcrypt.html).
:::

Comme mentionné précédemment, vous ne devriez pas tenter de manipuler directement le champ `password` : ce champ contient la valeur de hash qui résulte du chiffrement du mot de passe brut.

### Limiter l'accès aux utilisateurs connectés

Limiter l'accès aux utilisateurs connectés peut facilement être réalisé en utilisant la méthode `#user?` disponible depuis les objets [`Marten::HTTP::Request`](pathname:///api/dev/Marten/HTTP/Request.html). En utilisant cette méthode, vous pouvez facilement implémenter des callbacks de handler [`#before_dispatch`](../handlers-and-http/callbacks.md#before_dispatch) afin de rediriger les utilisateurs anonymes vers une page de connexion ou une page d'erreur.

Par exemple :

```crystal
class UserProfileHandler < Marten::Handler
  before_dispatch :require_signed_in_user

  def get
    render "auth/profile.html" { user: request.user }
  end

  private def require_signed_in_user
    redirect reverse("auth:sign_in") unless request.user?
  end
end
```

Il convient de noter que l'application `auth` générée pour votre projet contient déjà un module concern `Auth::RequireSignedInUser` que vous pouvez inclure dans vos handlers afin de vous assurer qu'ils ne sont accessibles que par les utilisateurs connectés (et que les utilisateurs anonymes sont redirigés vers la page de connexion).

Par exemple :

```crystal
class UserProfileHandler < Marten::Handler
  include Auth::RequireSignedInUser

  def get
    render "auth/profile.html" { user: request.user }
  end
end
```
