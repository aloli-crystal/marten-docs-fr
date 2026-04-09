---
title: Tests
description: Apprenez à tester votre projet Marten.
sidebar_label: Tests
---

Cette section couvre les bases concernant la façon de tester un projet Marten et les divers outils que vous pouvez utiliser à cet égard.

## Les bases

Vous devriez tester votre projet Marten pour vous assurer qu'il respecte les spécifications pour lesquelles il a été construit. Comme tout projet Crystal, Marten vous permet d'écrire des "specs" (voir la [documentation officielle relative aux tests dans Crystal](https://crystal-lang.org/reference/guides/testing.html) pour en savoir plus).

Par défaut, lors de la création d'un projet via la commande de gestion [`new`](./reference/management-commands.md#new), Marten créera automatiquement un dossier `spec/` à la racine de la structure de votre projet. Ce dossier contient un fichier unique `spec_helper.cr` vous permettant d'initialiser l'environnement de test pour votre projet Marten.

Ce fichier devrait ressembler à quelque chose comme ceci :

```crystal title=spec/spec_helper.cr
ENV["MARTEN_ENV"] = "test"

require "spec"
require "marten"
require "marten/spec"

require "../src/project"
```

Comme vous pouvez le voir, le fichier `spec_helper.cr` force la variable d'environnement Marten à être définie sur `test` et requiert la bibliothèque spec ainsi que Marten et votre projet réel. Ce fichier devrait être requis par tous vos fichiers de spec.

:::info
Il est très important de requérir `marten/spec` dans votre spec helper de niveau supérieur car cela garantira que les callbacks de spec obligatoires sont configurés pour votre suite de specs (par exemple, pour s'assurer que votre base de données est correctement initialisée avant l'exécution de chaque spec).
:::

Pour exécuter vos tests, vous pouvez simplement utiliser la commande standard [`crystal spec`](https://crystal-lang.org/reference/man/crystal/index.html#crystal-spec).

## Écrire des tests

Pour écrire des tests, vous devez écrire des [specs](https://crystal-lang.org/reference/guides/testing.html) classiques et vous assurer que vos fichiers de spec requièrent toujours le fichier `spec/spec_helper.cr`.

Par exemple :

```crystal
require "./spec_helper"

describe MySuperAbstraction do
  describe "#foo" do
    it "returns bar" do
      obj = MySuperAbstraction.new
      obj.foo.should eq "bar"
    end
  end
end
```

Il est encouragé d'organiser vos fichiers de spec en suivant la structure de vos projets. Par exemple, vous pourriez créer un dossier `models` et y définir les specs liées à vos modèles.

:::tip
Lorsque vous organisez les fichiers de spec dans plusieurs dossiers, une bonne pratique est de définir un fichier `spec_helper.cr` à chaque niveau de votre structure de dossiers. Ces fichiers `spec_helper.cr` supplémentaires devraient requérir le même fichier du dossier parent.

Par exemple :

```crystal title=spec/models/spec_helper.cr
require "../spec_helper"
```

```crystal title=spec/models/article_spec.cr
require "./spec_helper"

describe Article do
  # ...
end
```
:::

## Exécuter les tests

Comme mentionné précédemment, l'exécution des specs implique l'utilisation de la commande standard [`crystal spec`](https://crystal-lang.org/reference/man/crystal/index.html#crystal-spec).

### L'environnement de test

Par défaut, la commande de gestion [`new`](./reference/management-commands.md#new) crée toujours un environnement `test` lors de la génération de nouveaux projets. Ainsi, vous devez vous assurer que la variable d'environnement `MARTEN_ENV` est définie sur `test` lors de l'exécution de vos specs Crystal. Il convient également de rappeler que cet environnement `test` est associé à un fichier de paramètres dédié où les paramètres liés aux tests peuvent être spécifiés et/ou surchargés si nécessaire (voir [Paramètres](./settings.md#environnements) pour plus de détails à ce sujet).

### La base de données de test

Marten **doit** utiliser une base de données différente lors de l'exécution des tests afin de ne pas altérer votre base de données habituelle. En effet, la base de données utilisée dans le contexte des specs sera vidée et générée automatiquement à chaque exécution de la suite de specs. Vous ne devez pas définir ces noms de base de données aux mêmes noms que ceux utilisés pour vos environnements de développement ou de production. Si les noms de base de données de test ne sont pas explicitement définis, votre suite de specs ne sera pas autorisée à s'exécuter du tout.

Une façon de s'assurer que vous utilisez une base de données dédiée spécifiquement aux tests est de surcharger les paramètres de [`database`](./reference/settings.md#database-settings) comme suit :

```crystal title=config/settings/test.cr
Marten.configure :test do |config|
  config.database do |db|
    db.name = "my_project_test"
  end
end
```

## Outils de test

Marten fournit certains outils qui peuvent s'avérer utiles lors de l'écriture de specs.

### Utiliser le client de test

Le client de test est une abstraction fournie lors du require de `marten/spec` et qui agit comme un client web très basique. Cet outil vous permet de tester facilement vos handlers et les différentes routes de votre application en émettant des requêtes et en inspectant les réponses retournées.

En utilisant le client de test, vous pouvez facilement simuler diverses requêtes (par exemple des requêtes GET ou POST) vers des URLs spécifiques et observer les réponses retournées. Ce faisant, vous pouvez inspecter les propriétés de la réponse (comme son code de statut, son contenu et ses en-têtes) afin de vérifier que vos handlers se comportent comme prévu.

#### Un exemple simple

Pour utiliser le client de test, vous pouvez soit initialiser un objet [`Marten::Spec::Client`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html) soit utiliser le client de test par spec fourni par la méthode [`Marten::Spec#client`](https://martenframework.com/docs/api/dev/Marten/Spec.html#client%3AClient-class-method). L'initialisation de nouveaux objets [`Marten::Spec::Client`](https://martenframework.com/docs/api/dev/Marten/Spec.html#client%3AClient-class-method) vous permet de définir des propriétés à l'échelle du client, comme un type de contenu par défaut.

:::info
Notez que le client retourné par la méthode [`Marten::Spec#client`](https://martenframework.com/docs/api/dev/Marten/Spec.html#client%3AClient-class-method) est mémorisé et est réinitialisé après _chaque_ exécution de spec.
:::

Voyons une manière simple d'utiliser le client de test et de vérifier les réponses correspondantes :

```crystal
describe MyRedirectHandler do
  describe "#get" do
    it "returns the expected redirect response" do
      response = Marten::Spec.client.get("/my-redirect-handler", query_params: {"foo" => "bar"})

      response.status.should eq 302
      response.headers["Location"].should eq "/redirected"
    end
  end
end
```

:::tip
Dans l'exemple ci-dessus, nous spécifions simplement un chemin "brut" en codant sa valeur en dur. Dans un scénario réel, vous voudrez probablement [résoudre les URLs de vos handlers](../handlers-and-http/routing.md#reverse-url-resolutions) en utilisant la méthode [`Marten::Routing::Map#reverse`](https://martenframework.com/docs/api/dev/Marten/Routing/Map.html#reverse(name%3AString|Symbol%2Cparams%3AHash(String|Symbol%2CParameter%3A%3ATypes))-instance-method) de la carte de routes principale (de cette façon, vous ne codez pas en dur les chemins de routes dans vos specs). Par exemple

```crystal
url = Marten.routes.reverse("article_detail", pk: 42)
response = Marten::Spec.client.get(url, query_params: {"foo" => "bar"})
```
:::

Ici, nous émettons simplement une requête GET (en utilisant la méthode [`#get`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#get(path%3AString%2Cquery_params%3AHash|NamedTuple|Nil%3Dnil%2Ccontent_type%3AString|Nil%3Dnil%2Cheaders%3AHash|NamedTuple|Nil%3Dnil%2Csecure%3Dfalse)%3AMarten%3A%3AHTTP%3A%3AResponse-instance-method) du client de test) et testons la réponse obtenue. Quelques points peuvent être notés :

* Le client de test ne nécessite pas que le serveur de votre projet soit en cours d'exécution : en interne, il utilise une chaîne légère de handlers de serveur qui garantit que les middlewares de votre projet sont appliqués et que l'URL que vous avez demandée est résolue et mappée au bon handler
* Seul le chemin vers le handler doit être spécifié lors de l'émission de requêtes (ex. `/foo/bar`)

Notez que vous pouvez également émettre d'autres types de requêtes en utilisant des méthodes comme [`#post`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#post(path%3AString%2Cdata%3AHash|NamedTuple|Nil|String%3Dnil%2Cquery_params%3AHash|NamedTuple|Nil%3Dnil%2Ccontent_type%3AString|Nil%3Dnil%2Cheaders%3AHash|NamedTuple|Nil%3Dnil%2Csecure%3Dfalse)%3AMarten%3A%3AHTTP%3A%3AResponse-instance-method), [`#put`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#put(path%3AString%2Cdata%3AHash|NamedTuple|Nil|String%3Dnil%2Cquery_params%3AHash|NamedTuple|Nil%3Dnil%2Ccontent_type%3AString|Nil%3Dnil%2Cheaders%3AHash|NamedTuple|Nil%3Dnil%2Csecure%3Dfalse)%3AMarten%3A%3AHTTP%3A%3AResponse-instance-method) ou [`#delete`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#delete(path%3AString%2Cdata%3AHash|NamedTuple|Nil|String%3Dnil%2Cquery_params%3AHash|NamedTuple|Nil%3Dnil%2Ccontent_type%3AString|Nil%3Dnil%2Cheaders%3AHash|NamedTuple|Nil%3Dnil%2Csecure%3Dfalse)%3AMarten%3A%3AHTTP%3A%3AResponse-instance-method). Par exemple :

```crystal
describe MySchemaHandler do
  describe "#post" do
    it "validates the data and redirects" do
      response = Marten::Spec.client.post("/my-schema-handler", data: {"first_name" => "John", "last_name" => "Doe"})

      response.status.should eq 302
      response.headers["Location"].should eq "/redirected"
    end
  end
end
```

:::info
Par défaut, les vérifications CSRF sont désactivées pour les requêtes émises par le client de test. Si pour une raison quelconque vous devez vous assurer qu'elles sont activées, vous pouvez initialiser un objet [`Marten::Spec::Client`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html) avec `disable_request_forgery_protection: false`.
:::

#### Inspecter les réponses

Les réponses retournées par le client de test sont des instances de la classe standard [`Marten::HTTP::Response`](https://martenframework.com/docs/api/dev/Marten/HTTP/Response.html). En tant que tel, vous pouvez facilement accéder aux attributs de la réponse tels que le code de statut, le contenu et le type de contenu, les cookies et les en-têtes dans vos specs afin de vérifier que la réponse attendue a été retournée par votre handler.

#### Exceptions

Il est important de noter que les exceptions levées dans vos handlers seront visibles depuis votre spec. Cela signifie que vous devriez utiliser le helper d'expectation standard [`#expect_raises`](https://crystal-lang.org/api/Spec/Expectations.html#expect_raises%28klass%3AT.class%2Cmessage%3AString%7CRegex%7CNil%3Dnil%2Cfile%3D__FILE__%2Cline%3D__LINE__%2C%26%29forallT-instance-method) pour vérifier que ces exceptions sont effectivement levées.

#### Session et cookies

Les clients de test sont toujours avec état : si un handler définit un cookie dans la réponse retournée, alors ce cookie sera stocké dans le magasin de cookies du client (disponible via la méthode [`#cookies`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#cookies-instance-method)) et sera automatiquement envoyé pour les requêtes suivantes émises par le client.

Il en va de même pour les valeurs de session : de telles valeurs peuvent être définies en utilisant le magasin de session retourné par la méthode client [`#sessions`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#session-instance-method). Si vous définissez des valeurs de session dans ce magasin avant toute requête, le handler correspondant y aura accès et les nouvelles valeurs définies par le handler seront disponibles pour une inspection ultérieure une fois la réponse retournée. Ces valeurs de session sont également maintenues entre les requêtes émises par un même client.

Par exemple :

```crystal
describe MyHandler do
  describe "#get" do
    it "renders the expected content if the right value is in the session" do
      Marten::Spec.client.session["foo"] = "bar"

      url = Marten.routes.reverse("initiate_request")
      response = Marten::Spec.client.get(url)

      response.status.should eq 200
      response.content.includes?("Initiate request").should be_true
    end
  end
end
```

#### Messages flash {#flash-messages}

De manière similaire à l'accès aux valeurs de session, vous pouvez également accéder aux messages flash en utilisant la méthode [`#flash`](https://martenframework.com/docs/api/dev/Marten/Spec/Client.html#flash-instance-method) du client de test. Cette méthode retourne un objet [`Marten::HTTP::FlashStore`](https://martenframework.com/docs/api/dev/Marten/HTTP/FlashStore.html), initialisé à partir du magasin de session actuellement configuré. Cela peut être utile pour accéder aux messages flash qui auraient pu être définis par les handlers et vérifier qu'ils ont les valeurs attendues.

Par exemple :

```crystal
describe MyHandler do
  describe "#post" do
    it "sets the expected flash message and redirects to the expected URL" do
      url = Marten.routes.reverse("do_something")
      response = Marten::Spec.client.post(url, data: {"foo" => "bar"})

      response.status.should eq 302
      response.headers["Location"].should eq "/success"

      Marten::Spec.client.flash[:notice].should eq "Action successfully completed!"
    end
  end
end
```

#### Client de test et authentification

Lorsque vous utilisez le shard [marten-auth](https://github.com/martenframework/marten-auth) et l'[authentification](../authentication.mdx) intégrée, quelques helpers supplémentaires peuvent être utilisés afin de connecter/déconnecter facilement des utilisateurs avec le client de test :

* La méthode `#sign_in` peut être utilisée pour simuler l'effet d'un utilisateur connecté. Cela signifie que l'ID de l'utilisateur sera persisté dans la session du client de test et que les requêtes émises avec celui-ci seront associées à l'utilisateur considéré
* La méthode `#sign_out` peut être utilisée pour s'assurer que tout utilisateur connecté est déconnecté et que la session est vidée

Par exemple :

```crystal
describe MyHandler do
  describe "#get" do
    it "shows the profile page of the authenticated user" do
      user = Auth::User.create!(email: "test@example.com") do |user
        user.set_password("insecure")
      end

      url = Marten.routes.reverse("auth:profile")

      Marten::Spec.client.sign_in(user)
      response = Marten::Spec.client.get(url)

      response.status.should eq 200
      response.content.includes?("Profile").should be_true
    end
  end
end
```

### Collecter les emails

Si votre code envoie des [emails](../emailing/introduction.md), vous pourriez vouloir tester que ces emails sont envoyés comme prévu. Pour ce faire, vous pouvez utiliser le [backend d'emailing de développement](../emailing/reference/backends.md#development-backend) pour vous assurer que les emails envoyés sont collectés dans le cadre de chaque exécution de spec.

Pour cela, le backend d'emailing doit être initialisé avec `collect_emails: true` lors de la configuration du paramètre [`emailing.backend`](./reference/settings.md#backend-1). Par exemple :

```crystal title=config/settings/test.cr
Marten.configure :test do |config|
  config.backend = Marten::Emailing::Backend::Development.new(collect_emails: true)
end
```

Cela garantira que tous les emails envoyés sont "collectés" pour une inspection ultérieure. Vous pouvez facilement récupérer les emails collectés en appelant la méthode [`Marten::Spec#delivered_emails`](https://martenframework.com/docs/api/dev/Marten/Spec.html#delivered_emails%3AArray(Emailing%3A%3AEmail)-class-method), qui retourne un tableau d'instances de [`Marten::Email`](https://martenframework.com/docs/api/dev/Marten/Emailing/Email.html). Par exemple :

```crystal
describe MyObject do
  describe "#do_something" do
    it "sends an email as expected" do
      obj = MyObject.new
      obj.do_something

      Marten::Spec.delivered_emails.size.should eq 1
      Marten::Spec.delivered_emails[0].subject.should eq "Test subject"
    end
  end
end
```

:::info
Notez que Marten s'assure également automatiquement que les emails collectés sont automatiquement réinitialisés après chaque exécution de spec afin que vous n'ayez pas à vous en occuper directement.
:::
