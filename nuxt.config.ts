export default defineNuxtConfig({
  compatibilityDate: '2026-07-21',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxt/eslint',
  ],

  // Sans ceci, un composant dans un sous-dossier (ex: components/layout/AppHeader.vue)
  // s'enregistre par défaut sous un nom préfixé par le dossier (<LayoutAppHeader>), pas <AppHeader>.
  // Tous les composants de ce plan sont référencés par leur nom de fichier nu — noms uniques
  // garantis dans app/components/{layout,ui,home}/, donc pas de collision possible.
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      // ?v=2 force une nouvelle URL : le cache "Favicons" interne de Chrome (séparé du cache HTTP,
      // lié à l'historique) ne se met pas à jour de façon fiable sinon, même en navigation privée.
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=2' }],
      // Applique le thème avant l'hydratation Vue pour éviter le flash de mauvais thème (FOUC).
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('portfolio-theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`,
          tagPosition: 'head',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      formspreeEndpoint: '',
    },
  },

  site: {
    url: 'https://portfolio-loic-leclercq.vercel.app',
    name: 'Portfolio',
  },

  sitemap: {
    urls: ['/projects/toryu', '/projects/questy'],
  },

  i18n: {
    baseUrl: 'https://portfolio-loic-leclercq.vercel.app',
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
  },

  icon: {
    provider: 'none',
    clientBundle: {
      // Liste explicite : les icônes référencées via un binding dynamique (`:name="skill.icon"`)
      // ne sont pas détectées par le scan statique des templates.
      icons: [
        'simple-icons:typescript', 'simple-icons:javascript', 'simple-icons:php',
        'simple-icons:html5', 'simple-icons:css', 'simple-icons:nestjs',
        'simple-icons:typeorm', 'simple-icons:laravel', 'simple-icons:nuxt',
        'simple-icons:vuedotjs', 'simple-icons:react', 'simple-icons:nodedotjs',
        'simple-icons:pinia', 'simple-icons:tailwindcss',
        'simple-icons:vite', 'simple-icons:postgresql', 'simple-icons:mysql',
        'simple-icons:jsonwebtokens', 'simple-icons:passport', 'simple-icons:keycloak',
        'simple-icons:jest', 'simple-icons:vitest',
        'simple-icons:googlegemini', 'simple-icons:claude', 'simple-icons:claudecode',
        'simple-icons:modelcontextprotocol', 'heroicons:cpu-chip',
        'simple-icons:git', 'simple-icons:github',
        'simple-icons:docker', 'simple-icons:postman', 'simple-icons:figma',
        'simple-icons:microsoftoffice',
        'simple-icons:vercel', 'simple-icons:railway', 'simple-icons:linkedin',
        'simple-icons:socketdotio', 'simple-icons:amazons3',
        'heroicons:sun', 'heroicons:moon', 'heroicons:bars-3', 'heroicons:x-mark',
        'heroicons:academic-cap', 'heroicons:briefcase', 'heroicons:rocket-launch',
        'heroicons:chevron-right',
        'heroicons:code-bracket', 'heroicons:bolt',
      ],
      scan: true,
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
})
