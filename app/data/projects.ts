export interface ProjectVideo {
  // webm en premier (plus léger) avec repli mp4 pour la compatibilité navigateur.
  webm: string
  mp4: string
}

export type ShowcaseItem =
  | { type: 'image'; src: string }
  // Plusieurs images sous une légende commune : pour regrouper des captures qui
  // illustrent le même sujet (ex. une fiche découpée en plusieurs screenshots)
  // sans qu'elles n'apparaissent comme des sujets distincts. `layout` détermine
  // l'agencement selon le format des images : 'stack' (par défaut) empile des
  // captures larges, 'row' met côte à côte des captures étroites/verticales.
  | { type: 'images'; srcs: string[]; layout?: 'stack' | 'row' }
  | { type: 'video'; video: ProjectVideo }

export interface FeaturedProject {
  slug: string
  demoUrl: string | null
  isTfe: boolean
  repoUrls: { label: string; url: string }[]
  stack: string[]
  // Bannière pleine largeur en tête de card et de page détail — représente l'app.
  heroImage: string | null
  // Images/vidéos de la page détail, dans l'ordre de présentation. Chaque entrée est légendée
  // via i18n (`projects.{slug}.showcase[i]`, même index).
  showcase: ShowcaseItem[]
  // Format dominant des captures du showcase : 'portrait' (mobile, ex. Questy) garde le
  // gabarit à largeur fixe réduite ; 'landscape' (desktop, ex. Toryu) utilise un gabarit à
  // hauteur max pour éviter d'écraser des captures larges.
  mediaFormat: 'portrait' | 'landscape'
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
    heroImage: '/images/projects/toryu/hero.png',
    mediaFormat: 'landscape',
    // Ordre narratif : découverte → fiche œuvre (3 captures groupées) → lecture →
    // profil (2 captures groupées) → studio → messagerie (2 captures groupées).
    // Légendes correspondantes dans i18n `projects.toryu.showcase`.
    showcase: [
      {
        type: 'video',
        video: {
          webm: '/videos/projects/toryu/explorer.webm',
          mp4: '/videos/projects/toryu/explorer.mp4',
        },
      },
      {
        type: 'images',
        srcs: [
          '/images/projects/toryu/detail-oeuvre1.png',
          '/images/projects/toryu/detail-oeuvre2.png',
          '/images/projects/toryu/detail-oeuvre3.png',
        ],
      },
      {
        type: 'video',
        video: {
          webm: '/videos/projects/toryu/reading.webm',
          mp4: '/videos/projects/toryu/reading.mp4',
        },
      },
      {
        type: 'images',
        srcs: ['/images/projects/toryu/profil-1.png', '/images/projects/toryu/profil-2.png'],
      },
      {
        type: 'video',
        video: {
          webm: '/videos/projects/toryu/studio.webm',
          mp4: '/videos/projects/toryu/studio.mp4',
        },
      },
      {
        type: 'images',
        srcs: ['/images/projects/toryu/messagerie1.png', '/images/projects/toryu/messagerie2.png'],
        layout: 'row',
      },
    ],
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
    heroImage: '/images/projects/questy/hero.png',
    mediaFormat: 'portrait',
    // Ordre narratif : hub → progression du perso → activités réelles → défis IA → combat →
    // classements → historique/profil. Légendes correspondantes dans i18n `projects.questy.showcase`.
    showcase: [
      { type: 'image', src: '/images/projects/questy/dashboard.png' },
      { type: 'image', src: '/images/projects/questy/profil-1.png' },
      {
        type: 'video',
        video: {
          webm: '/videos/projects/questy/customization.webm',
          mp4: '/videos/projects/questy/customization.mp4',
        },
      },
      { type: 'image', src: '/images/projects/questy/activities.png' },
      {
        type: 'video',
        video: {
          webm: '/videos/projects/questy/quizz.webm',
          mp4: '/videos/projects/questy/quizz.mp4',
        },
      },
      {
        type: 'video',
        video: {
          webm: '/videos/projects/questy/fight.webm',
          mp4: '/videos/projects/questy/fight.mp4',
        },
      },
      { type: 'image', src: '/images/projects/questy/ranking-1.png' },
      { type: 'image', src: '/images/projects/questy/ranking-2.png' },
      { type: 'image', src: '/images/projects/questy/profil-2.png' },
    ],
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
