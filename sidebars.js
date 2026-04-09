module.exports = {
  sidebar: [
    'prologue',
    {
      type: 'category',
      label: 'Prise en main',
      link: {type: 'doc', id: 'getting-started'},
      items: [
        'getting-started/installation',
        'getting-started/tutorial',
      ],
    },
    {
      type: 'category',
      label: 'Modèles et bases de données',
      link: {type: 'doc', id: 'models-and-databases'},
      items: [
        'models-and-databases/introduction',
        'models-and-databases/queries',
        'models-and-databases/relationships',
        'models-and-databases/validations',
        'models-and-databases/callbacks',
        'models-and-databases/migrations',
        'models-and-databases/transactions',
        'models-and-databases/raw-sql',
        'models-and-databases/multiple-databases',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'models-and-databases/how-to/create-custom-model-fields',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'models-and-databases/reference/fields',
            'models-and-databases/reference/table-options',
            'models-and-databases/reference/query-set',
            'models-and-databases/reference/migration-operations',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Handlers et HTTP',
      link: {type: 'doc', id: 'handlers-and-http'},
      items: [
        'handlers-and-http/introduction',
        'handlers-and-http/routing',
        'handlers-and-http/generic-handlers',
        'handlers-and-http/error-handlers',
        'handlers-and-http/sessions',
        'handlers-and-http/cookies',
        'handlers-and-http/callbacks',
        'handlers-and-http/middlewares',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'handlers-and-http/how-to/customize-handler-template-contexts',
            'handlers-and-http/how-to/create-custom-route-parameters',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'handlers-and-http/reference/generic-handlers',
            'handlers-and-http/reference/middlewares',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Templates',
      link: {type: 'doc', id: 'templates'},
      items: [
        'templates/introduction',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'templates/how-to/create-custom-filters',
            'templates/how-to/create-custom-tags',
            'templates/how-to/create-custom-context-producers',
            'templates/how-to/create-custom-loaders',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'templates/reference/filters',
            'templates/reference/tags',
            'templates/reference/operators',
            'templates/reference/context-producers',
            'templates/reference/loaders',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Schémas',
      link: {type: 'doc', id: 'schemas'},
      items: [
        'schemas/introduction',
        'schemas/validations',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'schemas/how-to/create-custom-schema-fields',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'schemas/reference/fields',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Assets',
      link: {type: 'doc', id: 'assets'},
      items: [
        'assets/introduction',
      ],
    },
    {
      type: 'category',
      label: 'Fichiers',
      link: {type: 'doc', id: 'files'},
      items: [
        'files/uploading-files',
        'files/managing-files',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'files/how-to/create-custom-file-storages',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'files/reference/stores',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Développement',
      link: {type: 'doc', id: 'development'},
      items: [
        'development/settings',
        'development/applications',
        'development/management-commands',
        'development/generators',
        'development/testing',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'development/how-to/configure-database-backends',
            'development/how-to/create-custom-commands',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'development/reference/settings',
            'development/reference/management-commands',
            'development/reference/generators',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Sécurité',
      link: {type: 'doc', id: 'security'},
      items: [
        'security/introduction',
        'security/csrf',
        'security/clickjacking',
        'security/content-security-policy',
      ],
    },
    {
      type: 'category',
      label: 'Internationalisation',
      link: {type: 'doc', id: 'i18n'},
      items: [
        'i18n/introduction',
        'i18n/localized-routes',
      ],
    },
    {
      type: 'category',
      label: 'Emailing',
      link: {type: 'doc', id: 'emailing'},
      items: [
        'emailing/introduction',
        'emailing/callbacks',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'emailing/how-to/create-custom-emailing-backends',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'emailing/reference/backends',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Authentification',
      link: {type: 'doc', id: 'authentication'},
      items: [
        'authentication/introduction',
        {
          type: 'category',
          label: 'Référence',
          items: [
            'authentication/reference/generated-files',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Cache',
      link: {type: 'doc', id: 'caching'},
      items: [
        'caching/introduction',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'caching/how-to/create-custom-cache-stores',
          ],
        },
        {
          type: 'category',
          label: 'Référence',
          items: [
            'caching/reference/stores',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Déploiement',
      link: {type: 'doc', id: 'deployment'},
      items: [
        'deployment/introduction',
        {
          type: 'category',
          label: 'Guides pratiques',
          items: [
            'deployment/how-to/deploy-to-an-ubuntu-server',
            'deployment/how-to/deploy-to-heroku',
            'deployment/how-to/deploy-to-fly-io',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Le projet Marten',
      link: {type: 'doc', id: 'the-marten-project'},
      items: [
        'the-marten-project/contributing',
        'the-marten-project/design-philosophies',
        'the-marten-project/acknowledgments',
        {
          type: 'category',
          label: 'Notes de version',
          link: {type: 'doc', id: 'the-marten-project/release-notes'},
          collapsible: false,
          className: 'release-notes',
          items: [
            'the-marten-project/release-notes/0.1',
            'the-marten-project/release-notes/0.1.1',
            'the-marten-project/release-notes/0.1.2',
            'the-marten-project/release-notes/0.1.3',
            'the-marten-project/release-notes/0.1.4',
            'the-marten-project/release-notes/0.1.5',
            'the-marten-project/release-notes/0.2',
            'the-marten-project/release-notes/0.2.1',
            'the-marten-project/release-notes/0.2.2',
            'the-marten-project/release-notes/0.2.3',
            'the-marten-project/release-notes/0.2.4',
            'the-marten-project/release-notes/0.3',
            'the-marten-project/release-notes/0.3.1',
            'the-marten-project/release-notes/0.3.2',
            'the-marten-project/release-notes/0.3.3',
            'the-marten-project/release-notes/0.3.4',
            'the-marten-project/release-notes/0.4',
            'the-marten-project/release-notes/0.4.1',
            'the-marten-project/release-notes/0.4.2',
            'the-marten-project/release-notes/0.4.3',
            'the-marten-project/release-notes/0.4.4',
            'the-marten-project/release-notes/0.4.5',
            'the-marten-project/release-notes/0.5',
            'the-marten-project/release-notes/0.5.1',
            'the-marten-project/release-notes/0.5.2',
            'the-marten-project/release-notes/0.5.3',
            'the-marten-project/release-notes/0.5.4',
            'the-marten-project/release-notes/0.5.5',
            'the-marten-project/release-notes/0.5.6',
            'the-marten-project/release-notes/0.5.7',
            'the-marten-project/release-notes/0.6',
            'the-marten-project/release-notes/0.6.1',
            'the-marten-project/release-notes/0.6.2',
            'the-marten-project/release-notes/0.6.3',
            'the-marten-project/release-notes/0.7',
          ],
        },
      ],
    },
  ],
};
