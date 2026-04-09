---
title: Installation
description: Démarrez en installant Marten et ses dépendances.
---

Ce guide vous aidera à démarrer pour installer Marten et ses dépendances. C'est parti !

## Installer Crystal

Marten est un framework web Crystal ; Crystal doit donc être installé sur votre système. Il existe de nombreuses façons d'installer Crystal, mais nous ne mettrons en avant ici que les plus courantes par souci de simplicité : via Homebrew (macOS ou Linux) ou le gestionnaire de paquets APT (Ubuntu, Debian). Veuillez consulter le [guide d'installation officiel de Crystal](https://crystal-lang.org/install/) si ces méthodes ne fonctionnent pas pour vous.

### Via Homebrew

Sur macOS ou Linux, Crystal peut être installé via [Homebrew](https://brew.sh/) (également connu sous le nom de Linuxbrew) en exécutant la commande suivante :

```bash
brew install crystal
```

### Via APT

Sur Ubuntu, Debian ou toute autre distribution Linux utilisant le gestionnaire de paquets APT, Crystal peut être installé en exécutant la commande suivante :

```bash
curl -fsSL https://crystal-lang.org/install.sh | sudo bash
```

### Via pacman

Sur ArchLinux et ses dérivés, vous pouvez installer Crystal et l'outil en ligne de commande `shards` via Pacman :

```bash
sudo pacman -S crystal shards
```

## Installer une base de données

Marten prend officiellement en charge les bases de données **MariaDB**, **MySQL**, **PostgreSQL** et **SQLite3**. Les nouveaux projets Marten utilisent une base de données SQLite par défaut : cette base de données légère sans serveur est généralement déjà pré-installée sur la plupart des systèmes d'exploitation existants, ce qui en fait un candidat idéal pour une base de données de développement ou de test. Ainsi, si vous choisissez d'utiliser SQLite pour votre nouveau projet Marten, vous pouvez très probablement ignorer cette section.

Marten dispose également d'un support natif pour PostgreSQL, MariaDB et MySQL. Veuillez consulter la documentation officielle applicable pour installer la base de données de votre choix :

* [Guide d'installation de PostgreSQL](https://wiki.postgresql.org/wiki/Detailed_installation_guides)
* [Guide d'installation de MariaDB](https://mariadb.com/kb/en/getting-installing-and-upgrading-mariadb)
* [Guide d'installation de MySQL](https://dev.mysql.com/doc/refman/8.0/en/installing.html)
* [Guide d'installation de SQLite](https://www.tutorialspoint.com/sqlite/sqlite_installation.htm)

Chaque base de données nécessite l'utilisation d'un shard dédié (un paquet de code Crystal). Si vous débutez avec le framework ou prévoyez de suivre le [tutoriel](./tutorial.md), il n'est pas nécessaire d'installer ces shards immédiatement. Cependant, si vous souhaitez utiliser d'autres bases de données comme MariaDB, MySQL ou PostgreSQL, vous devrez peut-être installer des shards spécifiques à la base de données. Vous trouverez les instructions pour ce faire dans la section [Configurer les backends de base de données](../development/how-to/configure-database-backends.md).

## Installer Marten

L'étape suivante consiste à installer le CLI Marten. Cet outil vous permettra de générer facilement de nouveaux projets ou applications Marten.

### Via Homebrew

Sur macOS ou Linux, Marten peut être installé via [Homebrew](https://brew.sh/) (également connu sous le nom de Linuxbrew) en exécutant les commandes suivantes :

```bash
brew tap martenframework/marten
brew install marten
```

### Via AUR sur ArchLinux et ses dérivés

En supposant que vous utilisez un assistant AUR (`yay` dans cet exemple), ce sera aussi simple que :

```bash
yay -S marten
```

Une fois l'installation terminée, vous devriez pouvoir utiliser la commande `marten` :

```bash
marten -v
```

### Depuis les sources

Marten peut être installé depuis les sources en exécutant les commandes suivantes :

```bash
git clone https://github.com/martenframework/marten
cd marten
shards install
crystal build src/marten_cli.cr -o bin/marten
mv bin/marten /usr/local/bin
```

Une fois les étapes ci-dessus terminées, vous devriez pouvoir vérifier que la commande `marten` fonctionne correctement en exécutant :

```bash
marten -v
```

## Prochaines étapes

_Félicitations ! Vous êtes prêt._

Vous pouvez maintenant passer au [tutoriel d'introduction](./tutorial.md).
