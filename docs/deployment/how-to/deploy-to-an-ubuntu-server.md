---
title: Déployer sur un serveur Ubuntu
description: Apprenez à déployer un projet Marten sur un serveur Ubuntu.
---

Ce guide couvre comment déployer un projet Marten sur un serveur Ubuntu.

## Prérequis

Pour compléter les étapes de ce guide, vous aurez besoin de :

* un serveur [Ubuntu](https://ubuntu.com) avec un accès SSH et les permissions `sudo`
* un projet Marten fonctionnel
* un nom de domaine pointant vers votre serveur

## Installer les dépendances requises

La première dépendance que nous voulons installer sur le serveur est Crystal lui-même. Pour ce faire, vous pouvez exécuter la commande suivante :

```bash
curl -fsSL https://crystal-lang.org/install.sh | sudo bash
```

:::tip
Alternativement, vous pouvez également vous référer aux [instructions officielles d'installation de Crystal](https://crystal-lang.org/install/on_ubuntu/) pour Ubuntu si la commande ci-dessus ne fonctionne pas.
:::

Ensuite, nous devrions installer quelques paquets supplémentaires qui seront nécessaires plus tard :

* `git` pour cloner le dépôt du projet
* `nginx` pour servir le serveur du projet derrière un reverse proxy et également servir les [assets](../../assets/introduction.md) et les [fichiers médias](../../files/managing-files.md)
* `postgresql` pour gérer nos besoins en base de données

Cela peut être réalisé en exécutant la commande suivante :

```bash
sudo apt-get install git nginx postgresql
```

:::info
Ce guide suppose l'utilisation de [PostgreSQL](https://www.postgresql.org) mais peut facilement être adapté si votre projet nécessite un autre backend de base de données.
:::

## Créer un utilisateur de déploiement

Créons maintenant un utilisateur de déploiement. Cet utilisateur aura accès au serveur de votre projet et sera utilisé pour exécuter l'application :

```bash
sudo adduser --disabled-login deploy
```

## Créer les dossiers du projet

Nous pouvons maintenant créer un dossier de déploiement où nous pourrons cloner le dépôt du projet plus tard, et stocker les assets collectés ou les fichiers médias si nécessaire. Lors de la création de ce dossier, il est également nécessaire de s'assurer que l'utilisateur `deploy` créé précédemment y a accès :

```bash
sudo mkdir /srv/<yourapp>
sudo chown deploy:deploy /srv/<yourapp>
```

## Créer une base de données

Comme mentionné précédemment, ce guide suppose l'utilisation de [PostgreSQL](https://www.postgresql.org) pour la base de données du projet. Ainsi, nous devons créer un utilisateur de base de données et la base de données elle-même. Pour ce faire, nous devrons exécuter les commandes suivantes :

```bash
su - postgres -c 'createuser deploy'
su - postgres -c 'createdb -O deploy <yourapp>'
```

:::info
Les commandes de gestion PostgreSQL sont généralement effectuées en tant qu'utilisateur `postgres`, d'où l'utilisation de `su` dans les commandes ci-dessus.
:::

Évidemment, vous devriez également vous assurer que votre projet Marten est correctement configuré pour cibler cette base de données en production. Vous pouvez consulter les [paramètres de base de données](../../development/reference/settings.md#database-settings) pour voir quelles sont les options disponibles en matière de configuration des bases de données.

## Cloner le projet

Tout d'abord, passez à l'utilisateur `deploy` que vous avez créé précédemment :

```bash
su - deploy
```

Ensuite, vous pouvez cloner votre dépôt et accéder au dossier correspondant en utilisant les commandes suivantes :

```bash
git clone <yourgiturl> /srv/<yourapp>/project
cd /srv/<yourapp>/project
```

## Installer les dépendances et compiler le projet

L'étape suivante est d'installer les dépendances de votre projet. Pour ce faire, vous pouvez utiliser la commande [`shards`](https://crystal-lang.org/reference/man/shards/index.html) comme suit :

```bash
shards install
```

Nous devons ensuite compiler le binaire du projet et le [CLI de gestion](../../development/management-commands.md) :

```bash
crystal build src/server.cr -o bin/server --release
crystal build manage.cr -o bin/manage --release
```

Le binaire du CLI de gestion sera utile pour [appliquer les migrations](../../models-and-databases/migrations.md) et pour [collecter les assets](../../development/reference/management-commands.md#collectassets).

:::info
Selon la façon dont vous gérez les assets dans vos projets, vous pourriez avoir à effectuer des étapes supplémentaires. Par exemple, vous pourriez avoir à installer Node.js, installer des dépendances supplémentaires, et éventuellement bundler les assets avec Webpack si cela s'applique à votre projet !
:::

## Collecter les assets

Vous voudrez ensuite collecter vos [assets](../../assets/introduction.md) afin qu'ils soient téléchargés vers leur destination finale. Pour ce faire, vous pouvez utiliser le binaire du CLI de gestion que vous avez compilé précédemment et exécuter la commande [`collectassets`](../../development/reference/management-commands.md#collectassets) :

```bash
bin/manage collectassets --no-input
```

Cette commande de gestion "collectera" tous les assets disponibles depuis les répertoires d'assets des applications et depuis les répertoires configurés dans le paramètre [`dirs`](../../development/reference/settings.md#dirs), et s'assurera qu'ils sont "téléchargés" vers leur destination finale en fonction du [stockage d'assets](../../assets/introduction.md#assets-storage) actuellement configuré.

## Appliquer les migrations du projet

Ensuite, vous voudrez exécuter les [migrations](../../models-and-databases/migrations.md) de votre projet pour vous assurer que vos modèles sont créés au niveau de la base de données. Pour y parvenir, vous pouvez utiliser le binaire du CLI de gestion que vous avez compilé dans une étape précédente et exécuter la commande [`migrate`](../../development/reference/management-commands.md#migrate) :

```bash
bin/manage migrate
```

## Configurer un service SystemD pour votre application

[SystemD](https://systemd.io) est un gestionnaire de services pour Linux que nous pouvons utiliser pour démarrer ou redémarrer facilement notre application déployée. Ainsi, nous allons créer un service pour notre application.

Mais d'abord, créez un fichier `settings.env` vide dans la session shell actuelle en tant qu'utilisateur `deploy` :

```bash
touch /srv/<yourapp>/settings.env
chmod 600 /srv/<yourapp>/settings.env
```

Quittez le shell avec `Ctrl-D` ou en entrant la commande `exit` puis créez un fichier de service pour votre application en tapant la commande suivante :

```bash
nano /etc/systemd/system/<yourapp>.service
```

Cela devrait ouvrir un éditeur de texte dans votre terminal. Copiez le contenu suivant dedans :

```
[Unit]
Description=<yourapp> server
After=syslog.target

[Service]
User=deploy
ExecStart=/srv/<yourapp>/project/bin/server
Restart=always
RestartSec=5s
KillSignal=SIGQUIT
WorkingDirectory=/srv/<yourapp>/project
Environment="MARTEN_ENV=production"
EnvironmentFiles=/srv/<yourapp>/settings.env

[Install]
WantedBy=multi-user.target
```

N'oubliez pas de remplacer les espaces réservés `<yourapp>` par les bonnes valeurs et, lorsque vous êtes prêt, sauvegardez le fichier en utilisant `Ctrl-X` et `y`.

Comme vous pouvez le voir dans l'extrait ci-dessus, nous supposons que l'[environnement Marten](../../development/settings.md#environnements) actuel est celui de production en définissant la variable d'environnement `MARTEN_ENV` sur `production`. Vous devriez adapter cela à votre cas d'utilisation de déploiement évidemment.

:::caution
Bien que le fichier de service soit un bon endroit pour définir des variables d'environnement pour les paramètres de votre projet, il ne devrait pas être utilisé pour les secrets et informations sensibles, comme le paramètre [`secret_key`](../../development/reference/settings.md#secret_key).

Éditez le fichier `settings.env` en tant qu'utilisateur `deploy` :

```bash
sudo -u deploy nano /srv/<yourapp>/settings.env
```

Sauvegardez le [`secret_key`](../../development/reference/settings.md#secret_key) et d'autres paramètres sensibles dedans :

```
MARTEN_SECRET_KEY=<secretkey>
```

Et ensuite chargez-le depuis le codebase de votre application, comme décrit dans [Sécuriser les valeurs de paramètres critiques](../introduction.md#clé-secrète).

:::

Pour s'assurer que SystemD prend en compte le nouveau service que vous venez de créer, vous pouvez ensuite exécuter la commande suivante :

```bash
systemctl daemon-reload
```

Et enfin, vous pouvez démarrer votre serveur avec :

```bash
service <yourapp> start
```

Notez que dans les déploiements suivants, vous voudrez simplement redémarrer le service SystemD que vous avez défini précédemment. Pour ce faire, vous pouvez simplement utiliser la commande suivante :

```bash
service <yourapp> restart
```

## Configurer un reverse proxy Nginx

Les serveurs de projets Marten sont destinés à être utilisés derrière un reverse proxy tel que [Nginx](https://www.nginx.com/) ou [Apache](https://httpd.apache.org/). L'utilisation d'un reverse proxy vous permet de configurer facilement un certificat SSL pour votre serveur (par exemple en utilisant [Let's Encrypt](https://letsencrypt.org/)), de servir les assets collectés et les fichiers médias si applicable, et d'améliorer la sécurité et la fiabilité.

Dans notre cas, nous utiliserons [Nginx](https://www.nginx.com/) et créerons une configuration de site pour notre application. Utilisons la commande suivante pour ce faire :

```bash
nano /etc/nginx/sites-available/<yourapp>.conf
```

Cela devrait ouvrir un éditeur de texte dans votre terminal. Copiez le contenu suivant dedans :

```
server {
  listen 80;
  server_name <yourdomain>;

  include snippets/snakeoil.conf;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_min_length 256;
  gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;

  error_log /var/log/nginx/<yourapp>_error.log;
  access_log /var/log/nginx/<yourapp>_access.log;

  location /assets/ {
    expires 365d;
    alias <yourassetspath>/;
  }

  location /media/ {
    alias <yourmediapath>/;
  }

  location / {
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_buffering off;

    proxy_pass http://localhost:<yourport>;
    # Alternativement, si vous avez configuré un socket Unix dans vos paramètres Marten :
    # proxy_pass http://unix:/run/<yourapp>/server.sock;
  }
}
```

N'oubliez pas de remplacer les espaces réservés `<yourapp>`, `<yourdomain>`, `<yourassetspath>`, `<yourmediapath>` et `<yourport>` par les bonnes valeurs et, lorsque vous êtes prêt, sauvegardez le fichier en utilisant `Ctrl-X` et `y`.

Comme vous pouvez le voir, le reverse proxy servira notre application sur le port HTTP 80 et est configuré pour cibler l'hôte (`localhost`) et le port de notre serveur Marten. Pour cette raison, vous devriez vous assurer que votre serveur Marten n'utilise pas le port HTTP 80 (il pourrait plutôt utiliser quelque chose comme 8080 ou 8000 par exemple). Alternativement, vous pouvez configurer votre serveur Marten pour écouter sur un socket Unix en définissant le paramètre [`socket`](../../development/reference/settings.md#socket) et mettre à jour la directive `proxy_pass` en conséquence.

Vous devriez également noter que la configuration ci-dessus définit deux emplacements supplémentaires pour servir les assets (`/assets/`) et les fichiers médias (`/media/`). Cela suppose que ces fichiers sont disponibles _localement_ sur le serveur considéré. Ainsi, vous devriez supprimer ces lignes si cela ne s'applique pas à votre cas d'utilisation ou si ces fichiers sont téléchargés ailleurs (ex. dans un bucket cloud).

Vous pouvez ensuite activer cette configuration de site en créant un lien symbolique comme suit :

```bash
ln -s /etc/nginx/sites-available/<yourapp>.conf /etc/nginx/sites-enabled/<yourapp>.conf
```

Et enfin, vous pouvez redémarrer le service Nginx avec :

```bash
sudo service nginx restart
```
