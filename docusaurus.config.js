const {themes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'Marten - Documentation Française',
  url: 'https://aloli-crystal.github.io',
  baseUrl: '/marten-docs-fr/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'aloli-crystal',
  projectName: 'marten-docs-fr',
  trailingSlash: false,

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  plugins: [
    'docusaurus-plugin-sass',
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/scss/custom.scss'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/1000x420_logo.jpg',
      announcementBar: {
        id: 'translation_notice',
        content:
          'Traduction communautaire non officielle. <a href="https://martenframework.com/docs/" target="_blank">Documentation originale en anglais</a>.',
        backgroundColor: '#eb6864',
        textColor: '#fff',
        isCloseable: true,
      },
      navbar: {
        title: 'Marten (FR)',
        logo: {
          alt: 'Marten Logo',
          src: 'img/logo_primary.svg',
        },
        items: [
          {
            href: 'https://martenframework.com/docs/',
            label: 'Docs (EN)',
            position: 'right',
          },
          {
            href: 'https://martenframework.com/docs/api/0.6/index.html',
            label: 'API',
            position: 'right',
          },
          {
            href: 'https://github.com/martenframework/marten',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://martenframework.com',
            label: 'Site officiel',
            position: 'right',
            target: '',
          },
        ],
        hideOnScroll: true,
      },
      prism: {
        theme: themes.okaidia,
        additionalLanguages: ['ruby', 'crystal', 'bash'],
      },
    }),
});
