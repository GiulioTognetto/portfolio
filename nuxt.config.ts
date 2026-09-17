// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Giulio Tognetto - Full-Stack Developer',
    description: 'Portfolio e progetti di Giulio Tognetto, sviluppatore Full-Stack specializzato in Rust, TypeScript e web app ad alte prestazioni.',
    url: 'https://giuliotognetto.dev',
    defaultLocale: 'it',
  },

  schemaOrg: {
    identity: {
      type: 'Person',
      name: 'Giulio Tognetto',
      url: 'https://giuliotognetto.dev',
    }
  },

  i18n: {
    defaultLocale: 'it',
    locales: [
      { code: 'it', iso: 'it-IT', name: 'Italiano' },
      // Aggiungi altre lingue se le usate, es:
      // { code: 'en', iso: 'en-US', name: 'English' }
    ],
    strategy: 'prefix_except_default',
  },

  app: {
    head: {
      htmlAttrs: {},
      titleTemplate: '%s %separator %siteName',
      templateParams: {
        siteName: 'Giulio Tognetto - Full-Stack Developer',
        separator: '-',
      },
      link: [
        { rel: 'icon', type: 'image/svg', href: '/cat-tongue.svg' }
      ]
    }
  },

  modules: [
    "nitro-cloudflare-dev",
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@tresjs/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxtjs/seo'
  ],

  fonts: {
    families: [
      { name: 'Pretendard Std Variable', src: '/fonts/pretendard-variable.ttf', global: true }
    ]
  },

  sitemap: {
    enabled: true,
    urls: [
      '/',
      '/credits'
    ]
  },

  robots: {
    // Permetti l'indicizzazione di tutto il sito di default
    allow: '/',
    // Blocca la scansione della pagina credits e di eventuali rotte private/API
    disallow: ['/credits'],
    // Link alla tua sitemap index
    sitemap: 'https://giuliotognetto.dev/sitemap_index.xml',
  },

  colorMode: {
    preference: "system",
    fallback: "white",
    classSuffix: ''
  },

  nitro: {
    preset: "cloudflare-durable",
    tracingChannel: true,

    experimental: {
      tasks: true,
      websocket: true,
    },
  },
})