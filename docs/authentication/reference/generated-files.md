---
title: Fichiers générés
description: Référence des fichiers générés.
---

Cette page fournit une référence des fichiers qui sont générés pour l'application `auth` lors de l'exécution de la commande de gestion [`new`](../../development/reference/management-commands.md#new) avec l'option `--with-auth` ou lors de l'utilisation du générateur [`auth`](../../development/reference/generators.md#auth).

## Application

L'application `auth` est générée sous le dossier `src` ou `src/apps`. En plus des abstractions mentionnées ci-dessous, ce dossier définit les fichiers de niveau supérieur suivants :

* `app.cr` - Le point d'entrée de l'application `auth`, où toutes les autres abstractions sont requises
* `cli.cr` - Le point d'entrée CLI de l'application `auth`, où les abstractions liées au CLI (comme les migrations) sont requises
* `routes.cr` - La carte de routes de l'application `auth`

### Emails

* `password_reset_email.cr` - Définit l'[email](../../emailing.mdx) qui est envoyé dans le cadre du flux de réinitialisation de mot de passe de l'utilisateur

### Handlers

* `handlers/concerns/require_anonymous_user.cr` - Un concern qui garantit qu'un handler ne peut être accédé que par des utilisateurs anonymes
* `handlers/concerns/require_signed_in_user.cr` - Un concern qui garantit qu'un handler ne peut être accédé que par des utilisateurs connectés
* `handlers/password_reset_confirm_handler.cr` - Un handler qui gère la réinitialisation du mot de passe d'un utilisateur dans le cadre du flux de réinitialisation de mot de passe
* `handlers/password_reset_initiate_handler.cr` - Un handler qui initie le flux de réinitialisation de mot de passe pour un utilisateur donné
* `handlers/password_update_handler.cr` - Un handler qui permet de mettre à jour le mot de passe de l'utilisateur
* `handlers/profile_handler.cr` - Un handler qui affiche le profil de l'utilisateur actuellement connecté
* `handlers/sign_in_handler.cr` - Un handler qui permet aux utilisateurs de se connecter
* `handlers/sign_out_handler.cr` - Un handler qui permet aux utilisateurs de se déconnecter
* `handlers/sign_up_handler.cr` - Un handler qui permet aux utilisateurs de s'inscrire

### Migrations

* `migrations/0001_create_auth_user_table.cr` - Permet de créer la table du modèle `Auth::User`

### Modèles

* `models/user.cr` - Définit le modèle principal `Auth::User`

### Schemas

* `schemas/password_reset_confirm_schema.cr` - Un schema qui permet à un utilisateur de réinitialiser son mot de passe
* `schemas/password_reset_initiate_schema.cr` - Un schema qui permet à un utilisateur d'initier le flux de réinitialisation de mot de passe
* `schemas/password_update_schema.cr` - Un schema qui permet à un utilisateur de mettre à jour son mot de passe
* `schemas/sign_in_schema.cr` - Un schema utilisé pour connecter les utilisateurs
* `schemas/sign_up_schema.cr` - Un schema utilisé pour inscrire les utilisateurs

### Templates

* `templates/auth/emails/password_reset.html` - Le template de l'email de réinitialisation de mot de passe
* `templates/auth/password_reset_confirm.html` - Le template utilisé pour permettre aux utilisateurs de réinitialiser leur mot de passe
* `templates/auth/password_reset_initiate.html` - Le template utilisé pour permettre aux utilisateurs d'initier le flux de réinitialisation de mot de passe
* `templates/auth/password_update.html` - Le template utilisé pour permettre aux utilisateurs de mettre à jour leur mot de passe
* `templates/auth/profile.html` - Le template du profil utilisateur
* `templates/auth/sign_in.html` - Le template de la page de connexion
* `templates/auth/sign_up.html` - Le template de la page d'inscription

## Specs

Toutes les abstractions mentionnées précédemment ont des specs associées qui sont définies sous le dossier `spec/apps/auth`.
