---
title: Backends d'emailing
description: Référence des backends d'emailing.
sidebar_label: Backends
---

## Backends intégrés

### Backend de développement

C'est le backend par défaut utilisé dans le cadre du paramètre [`emailing.backend`](../../development/reference/settings.md#backend-1).

Ce backend "collecte" tous les emails qui sont "envoyés", ce qui peut être utilisé dans les specs pour tester les emails envoyés. Ce comportement de "collecte" peut être désactivé si nécessaire, et le backend peut également être configuré pour afficher les détails des emails sur la sortie standard.

Par exemple :

```crystal
config.emailing.backend = Marten::Emailing::Backend::Development.new(print_emails: true, collect_emails: false)
```

## Autres backends

Des shards de backend d'emailing supplémentaires sont également maintenus sous l'égide du projet Marten ou par la communauté elle-même et peuvent être utilisés dans votre application selon vos besoins spécifiques d'envoi d'emails :

* [`marten-smtp-emailing`](https://github.com/martenframework/marten-smtp-emailing) fournit un backend d'emailing SMTP
* [`marten-sendgrid-emailing`](https://github.com/martenframework/marten-sendgrid-emailing) fournit un backend d'emailing [Sendgrid](https://sendgrid.com/)
* [`marten-mailgun-emailing`](https://github.com/martenframework/marten-mailgun-emailing) fournit un backend d'emailing [Mailgun](https://www.mailgun.com/)

:::info
N'hésitez pas à contribuer à cette page et à ajouter des liens vers vos shards si vous avez créé des backends d'emailing qui ne sont pas listés ici !
:::
