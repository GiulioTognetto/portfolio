// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Giulio Tognetto - Full Stack Developer',
    url: 'https://giuliotognetto.dev',
  },

  schemaOrg: {
    identity: {
      type: 'Person',
      name: 'Giulio Tognetto',
      url: 'https://giuliotognetto.dev',
    }
  },

  i18n: {
    langDir: './locales',
    defaultLocale: 'en',
    locales: [
      { code: 'it', iso: 'it-IT', name: 'Italiano', file: 'it.json', icon: 'i-circle-flags-it' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json', icon: 'i-circle-flags-en' }
    ],
    strategy: 'prefix_except_default',
  },

  app: {
    head: {
      titleTemplate: '%s %separator',
      templateParams: {
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