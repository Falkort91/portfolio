export interface FeaturedProject {
  slug: string
  demoUrl: string | null
  isTfe: boolean
  repoUrls: { label: string; url: string }[]
  stack: string[]
  images: string[]
}

export interface CompactProject {
  slug: string
  repoUrl: string
  demoUrl?: string
  stack: string[]
}

export interface ExtensionProject {
  slug: string
  repoUrl: string
  downloadUrl: string
  icon: string
  stack: string[]
}

// Ordre = ordre d'affichage : Toryu (projet le plus récent) avant Questy.
export const featuredProjects: FeaturedProject[] = [
  {
    // Repos privés, encore en développement : pas de lien à donner pour l'instant.
    slug: 'toryu',
    demoUrl: null,
    isTfe: false,
    repoUrls: [],
    stack: [
      'simple-icons:nestjs',
      'simple-icons:typeorm',
      'simple-icons:postgresql',
      'simple-icons:nuxt',
      'simple-icons:tailwindcss',
      'simple-icons:socketdotio',
      'simple-icons:amazons3',
      'simple-icons:docker',
    ],
    images: ['/images/projects/toryu/hero.png'],
  },
  {
    slug: 'questy',
    demoUrl: 'https://questy-web.vercel.app',
    isTfe: true,
    repoUrls: [
      { label: 'API', url: 'https://github.com/Questy-Project/questy-api' },
      { label: 'Web', url: 'https://github.com/Questy-Project/questy-web' },
    ],
    stack: [
      'simple-icons:nestjs',
      'simple-icons:typeorm',
      'simple-icons:postgresql',
      'simple-icons:nuxt',
      'simple-icons:vuedotjs',
      'simple-icons:tailwindcss',
      'simple-icons:googlegemini',
      'simple-icons:docker',
      'simple-icons:jest',
    ],
    images: ['/images/projects/questy/hero.png'],
  },
]

export const compactProjects: CompactProject[] = [
  {
    slug: 'rockpaperscissors',
    repoUrl: 'https://github.com/Falkort91/Rock-Paper-Scissors_VueJS',
    demoUrl: 'https://falkort91.github.io/Rock-Paper-Scissors_VueJS/',
    stack: ['simple-icons:vuedotjs'],
  },
  {
    slug: 'contactlist',
    repoUrl: 'https://github.com/Falkort91/CONTACT_LIST_VUEJS',
    demoUrl: 'https://falkort91.github.io/CONTACT_LIST_VUEJS/',
    stack: ['simple-icons:vuedotjs'],
  },
]

export const extensionProjects: ExtensionProject[] = [
  {
    slug: 'tablauncher',
    repoUrl: 'https://github.com/Falkort91/tab-launcher',
    downloadUrl: 'https://github.com/Falkort91/tab-launcher/releases/latest/download/tab-launcher-extension.zip',
    icon: '/images/extensions/tablauncher/icon.png',
    stack: ['simple-icons:googlechrome', 'simple-icons:typescript', 'simple-icons:vite'],
  },
]
