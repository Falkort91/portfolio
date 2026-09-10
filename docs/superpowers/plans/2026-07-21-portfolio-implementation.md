# Portfolio Nuxt 4 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the portfolio website described in `docs/superpowers/specs/2026-07-21-portfolio-design.md` — a bilingual (FR/EN), dark/light "Glitch Terminal" cyberpunk-themed Nuxt 4 vitrine site with a one-page home (Hero, About/timeline, Skills, Projects, Contact) and a project detail page for the flagship TFE project (Questy).

**Architecture:** Nuxt 4 (TypeScript, SSR), Tailwind CSS (class-based dark mode via CSS variables), `@nuxtjs/i18n` for FR/EN, `@nuxt/icon` (simple-icons + heroicons, bundled offline) for skill/tool logos, GSAP + ScrollTrigger for scroll-reveal animations, pure CSS for glitch/scanline/cursor effects. No backend — the contact form posts to Formspree. Composables are written with explicit Vue imports (not relying on Nuxt auto-import) so business logic (theme, typewriter, form validation) stays unit-testable with plain Vitest.

**Tech Stack:** Nuxt `^4.5.0`, `@nuxtjs/tailwindcss ^6.14.0`, `@nuxtjs/i18n ^10.4.1`, `@nuxt/icon ^2.3.1`, `@nuxt/image ^2.0.0`, `@nuxtjs/sitemap ^8.3.0`, `@nuxt/eslint ^1.16.0`, `gsap ^3.15.0`, `vitest ^4.1.10`, `@vue/test-utils ^2.4.11`, `happy-dom ^20.11.0`, TypeScript `^7.0.2`.

## Global Constraints

- Nuxt 4 with the default `app/` source directory structure; TypeScript strict mode; every component uses `<script setup lang="ts">`.
- `nuxt.config.ts` sets `components: [{ path: '~/components', pathPrefix: false }]` (Task 1) so every component auto-imports under its bare filename (`<AppHeader>`, `<ThemeToggle>`, `<HeroSection>`, ...) regardless of which subfolder it lives in — every Vue file this plan creates must have a globally unique filename.
- Composables import what they need explicitly from `'vue'` (`ref`, `computed`, `reactive`, `onMounted`, `onUnmounted`, `getCurrentInstance`) instead of relying on Nuxt auto-import, so each one can be unit-tested with plain Vitest outside a Nuxt runtime.
- Tailwind CSS is mobile-first: base utility classes target mobile, breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) layer on top. No layout may break between phone and large desktop.
- Dark mode is the flagship theme (cyberpunk terminal identity in full); light mode is a sober equivalent of the same structure, never a different design. Toggled via a `.dark` class on `<html>`, persisted in `localStorage`, defaulting to `prefers-color-scheme`.
- Bilingual FR/EN via `@nuxtjs/i18n`, `no_prefix` strategy (a toggle switch, not localized URLs).
- No backend for this site. The contact form posts to a Formspree endpoint read from `runtimeConfig.public.formspreeEndpoint` (env var `NUXT_PUBLIC_FORMSPREE_ENDPOINT`).
- GSAP + ScrollTrigger drive scroll/entrance animations; glitch-hover, scanline and terminal-cursor effects are pure CSS keyframes; all decorative animation respects `prefers-reduced-motion`.
- This project has no git repository and will not get one — the user does not want version control for this portfolio. Do not run any git command (init, add, commit, push), and treat every task's "Commit" step below as void/skipped — it is a leftover of the plan template, not an actual step to perform. There is no `.git` directory and none should be created.
- Do not invent or fabricate personal content (real name, real photo, exact study dates, real LinkedIn URL). Use clearly-named placeholders and list them in `CONTENT.md` (Task 16) for the user to fill in.

---

### Task 1: Project scaffolding and dependency installation

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `app/assets/css/main.css`
- Create: `app/app.vue`
- Create: `app/layouts/default.vue`
- Create: `app/pages/index.vue` (placeholder)
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: a running Nuxt 4 dev server, Tailwind CSS wired in via `app/assets/css/main.css`, dark/light CSS variables (`--color-bg`, `--color-bg-alt`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent-green`, `--color-accent-cyan`, `--color-accent-magenta`) that every later task's Tailwind classes (`bg-bg`, `text-text`, `border-border`, `text-accent-green`, etc.) depend on. `npm run typecheck`, `npm run build`, and `npm run test` all succeed (no test files yet is acceptable at this step only).

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "portfolio",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "typecheck": "nuxt typecheck",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@nuxt/icon": "^2.3.1",
    "@nuxt/image": "^2.0.0",
    "@nuxtjs/i18n": "^10.4.1",
    "@nuxtjs/sitemap": "^8.3.0",
    "@nuxtjs/tailwindcss": "^6.14.0",
    "gsap": "^3.15.0",
    "nuxt": "^4.5.0",
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.0",
    "@iconify-json/simple-icons": "^1.2.0",
    "@nuxt/eslint": "^1.16.0",
    "@vue/test-utils": "^2.4.11",
    "eslint": "^10.7.0",
    "happy-dom": "^20.11.0",
    "typescript": "^7.0.2",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: install completes without errors, `node_modules/` and `package-lock.json` created.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

- [ ] **Step 4: Write `nuxt.config.ts`**

```typescript
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
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      // Applique le thème avant l'hydratation Vue pour éviter le flash de mauvais thème (FOUC).
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
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

  i18n: {
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
        'simple-icons:vuedotjs', 'simple-icons:pinia', 'simple-icons:tailwindcss',
        'simple-icons:vite', 'simple-icons:postgresql', 'simple-icons:mysql',
        'simple-icons:jsonwebtokens', 'simple-icons:passport', 'simple-icons:jest',
        'simple-icons:googlegemini', 'simple-icons:git', 'simple-icons:github',
        'simple-icons:docker', 'simple-icons:postman', 'simple-icons:figma',
        'simple-icons:vercel', 'simple-icons:linkedin',
        'heroicons:sun', 'heroicons:moon', 'heroicons:bars-3', 'heroicons:x-mark',
        'heroicons:academic-cap', 'heroicons:briefcase', 'heroicons:rocket-launch',
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
```

- [ ] **Step 5: Write `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        'bg-alt': 'rgb(var(--color-bg-alt) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: {
          green: 'rgb(var(--color-accent-green) / <alpha-value>)',
          cyan: 'rgb(var(--color-accent-cyan) / <alpha-value>)',
          magenta: 'rgb(var(--color-accent-magenta) / <alpha-value>)',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
}
```

- [ ] **Step 6: Write `app/assets/css/main.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: 250 250 252;
  --color-bg-alt: 255 255 255;
  --color-text: 15 21 18;
  --color-text-muted: 71 85 79;
  --color-border: 226 232 229;
  --color-accent-green: 22 163 74;
  --color-accent-cyan: 2 132 199;
  --color-accent-magenta: 190 24 93;
}

.dark {
  --color-bg: 5 6 8;
  --color-bg-alt: 13 15 13;
  --color-text: 226 232 229;
  --color-text-muted: 148 163 155;
  --color-border: 31 42 36;
  --color-accent-green: 0 255 140;
  --color-accent-cyan: 0 240 255;
  --color-accent-magenta: 255 0 200;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-bg text-text font-mono transition-colors duration-300;
}

.glitch-hover {
  position: relative;
  display: inline-block;
}
.glitch-hover:hover {
  animation: glitch-shift 0.28s steps(2, end) 2;
}
@keyframes glitch-shift {
  0% {
    text-shadow: 2px 0 rgb(var(--color-accent-magenta)), -2px 0 rgb(var(--color-accent-cyan));
    transform: translate(0, 0);
  }
  50% {
    text-shadow: -2px 0 rgb(var(--color-accent-magenta)), 2px 0 rgb(var(--color-accent-cyan));
    transform: translate(-1px, 1px);
  }
  100% {
    text-shadow: 2px 0 rgb(var(--color-accent-magenta)), -2px 0 rgb(var(--color-accent-cyan));
    transform: translate(0, 0);
  }
}

.dark .scanline-bg {
  position: relative;
  overflow: hidden;
}
.dark .scanline-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    rgb(var(--color-accent-cyan) / 0.03) 0px,
    rgb(var(--color-accent-cyan) / 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
}

.terminal-cursor::after {
  content: '_';
  animation: blink 1s step-start infinite;
  color: rgb(var(--color-accent-green));
}
@keyframes blink {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .glitch-hover:hover,
  .terminal-cursor::after {
    animation: none;
  }
}
```

- [ ] **Step 7: Write `app/app.vue`**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 8: Write `app/layouts/default.vue`**

```vue
<template>
  <div class="min-h-screen bg-bg text-text">
    <main>
      <slot />
    </main>
  </div>
</template>
```

- [ ] **Step 9: Write a placeholder `app/pages/index.vue`**

```vue
<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <p class="text-accent-green">$ portfolio --status ready</p>
  </div>
</template>
```

- [ ] **Step 10: Write `.gitignore`**

```
node_modules
.nuxt
.output
dist
.env
*.log
.DS_Store
```

- [ ] **Step 11: Write `.env.example`**

```
NUXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

- [ ] **Step 12: Write `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
})
```

- [ ] **Step 13: Verify the dev server runs**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000`, no errors in terminal. Stop the server (Ctrl+C) once confirmed.

- [ ] **Step 14: Verify typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed with no TypeScript errors.

- [ ] **Step 15: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts tsconfig.json tailwind.config.ts vitest.config.ts .gitignore .env.example app/
git commit -m "chore: scaffold Nuxt 4 project with Tailwind, i18n, icon, image and test tooling"
```

---

### Task 2: Theme composable (dark/light) and toggle button

**Files:**
- Create: `app/composables/useTheme.ts`
- Create: `tests/composables/useTheme.spec.ts`
- Create: `app/components/ui/ThemeToggle.vue`

**Interfaces:**
- Consumes: CSS variables/`.dark` class defined in Task 1's `app/assets/css/main.css`.
- Produces: `useTheme()` returning `{ theme: Readonly<Ref<'dark' | 'light'>>, init: () => void, toggle: () => void }`, importable as `useTheme` (Nuxt auto-imports `app/composables/*.ts`). Later tasks (`AppHeader.vue`) consume `<ThemeToggle />` with no props.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/composables/useTheme.spec.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '../../app/composables/useTheme'

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to dark when no preference is stored and the system prefers dark', () => {
    mockMatchMedia(true)
    const { theme, init } = useTheme()

    init()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('defaults to light when no preference is stored and the system prefers light', () => {
    mockMatchMedia(false)
    const { theme, init } = useTheme()

    init()

    expect(theme.value).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('respects a previously stored preference over the system preference', () => {
    mockMatchMedia(true)
    localStorage.setItem('portfolio-theme', 'light')
    const { theme, init } = useTheme()

    init()

    expect(theme.value).toBe('light')
  })

  it('toggle() flips the theme, persists it and updates the DOM class', () => {
    mockMatchMedia(false)
    const { theme, init, toggle } = useTheme()
    init()

    toggle()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('portfolio-theme')).toBe('dark')

    toggle()

    expect(theme.value).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('portfolio-theme')).toBe('light')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useTheme.spec.ts`
Expected: FAIL — `Cannot find module '../../app/composables/useTheme'`

- [ ] **Step 3: Write `app/composables/useTheme.ts`**

```typescript
import { readonly, ref } from 'vue'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'portfolio-theme'

const theme = ref<Theme>('dark')

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
}

function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  function init() {
    theme.value = resolveInitialTheme()
    applyTheme(theme.value)
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_STORAGE_KEY, theme.value)
    applyTheme(theme.value)
  }

  return { theme: readonly(theme), init, toggle }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useTheme.spec.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write `app/components/ui/ThemeToggle.vue`**

```vue
<script setup lang="ts">
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="glitch-hover flex h-9 w-9 items-center justify-center rounded border border-border text-text-muted transition-colors hover:border-accent-green hover:text-accent-green"
    :aria-label="theme === 'dark' ? $t('theme.switchToLight') : $t('theme.switchToDark')"
    @click="toggle"
  >
    <Icon :name="theme === 'dark' ? 'heroicons:sun' : 'heroicons:moon'" class="h-5 w-5" />
  </button>
</template>
```

- [ ] **Step 6: Call `init()` once the app mounts**

Modify `app/app.vue`:

```vue
<script setup lang="ts">
const { init } = useTheme()

onMounted(() => {
  init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 7: Run the full test suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/composables/useTheme.ts tests/composables/useTheme.spec.ts app/components/ui/ThemeToggle.vue app/app.vue
git commit -m "feat: add dark/light theme composable and toggle button"
```

---

### Task 3: i18n content and locale toggle

**Files:**
- Create: `i18n/locales/fr.json`
- Create: `i18n/locales/en.json`
- Create: `app/components/ui/LocaleToggle.vue`

**Interfaces:**
- Consumes: `@nuxtjs/i18n` module configured in Task 1's `nuxt.config.ts` (`langDir: 'locales'` resolves to `i18n/locales/*.json` at the project root).
- Produces: every translation key consumed by later components (`nav.*`, `header.*`, `theme.*`, `hero.*`, `about.*`, `skills.*`, `projects.*`, `contact.*`, `footer.*`, `seo.*`). `<LocaleToggle />` component with no props, using `useI18n()`.

- [ ] **Step 1: Write `i18n/locales/fr.json`**

```json
{
  "nav": { "about": "À propos", "skills": "Compétences", "projects": "Projets", "contact": "Contact" },
  "header": { "brand": "[Ton Prénom] [Ton Nom]", "downloadCv": "Télécharger mon CV", "toggleMenu": "Ouvrir le menu" },
  "theme": { "switchToLight": "Passer en mode clair", "switchToDark": "Passer en mode sombre" },
  "hero": {
    "greeting": "[Ton Prénom] [Ton Nom]",
    "role": "Développeur Full-Stack junior — NestJS, Nuxt & TypeScript",
    "ctaProjects": "Voir mes projets",
    "ctaCv": "Télécharger mon CV"
  },
  "about": {
    "title": "À propos",
    "photoAlt": "Photo de [Ton Prénom] [Ton Nom]",
    "intro": "Récemment diplômé en développement informatique, je conçois des applications web complètes, du backend NestJS au frontend Nuxt. Curieux et rigoureux, j'aime comprendre un problème en profondeur avant d'écrire la moindre ligne de code.",
    "timeline": {
      "studies": {
        "title": "Formation en développement informatique",
        "description": "Apprentissage du développement web full-stack : PHP orienté objet, Laravel, Vue.js, bases de données relationnelles."
      },
      "internship": {
        "title": "Stage en développement full-stack",
        "description": "Mise en pratique sur un projet complet avec NestJS, TypeORM, Nuxt 3 et intégration d'une API d'intelligence artificielle."
      },
      "tfe": {
        "title": "Travail de fin d'études — Questy",
        "description": "Conception et développement d'une plateforme de gamification/apprentissage : quiz, défis, tournois, classements."
      }
    }
  },
  "skills": {
    "title": "Compétences",
    "categories": {
      "languages": "Langages",
      "backend": "Backend",
      "frontend": "Frontend",
      "databases": "Bases de données",
      "auth": "Authentification",
      "testing": "Tests",
      "ai": "Intelligence artificielle",
      "tools": "Outils",
      "deployment": "Déploiement"
    }
  },
  "projects": {
    "title": "Projets",
    "demoSoon": "Démo bientôt disponible",
    "viewDemo": "Voir la démo",
    "viewDetails": "Voir le détail",
    "back": "Retour aux projets",
    "challengesTitle": "Défis techniques",
    "questy": {
      "title": "Questy",
      "description": "Plateforme de gamification et d'apprentissage : quiz, défis, tournois et classements, avec intégration d'une IA (API Gemini).",
      "context": "Questy est mon travail de fin d'études : une plateforme web permettant de créer et suivre des quiz et défis ludiques, avec système de tournois, de classement et un panel d'administration. Le backend est développé en NestJS/TypeORM/PostgreSQL, le frontend en Nuxt 3/Vue 3/Pinia.",
      "challenges": [
        "Authentification sécurisée par JWT et gestion des rôles (utilisateur / admin) avec Passport.",
        "Génération de contenu de quiz assistée par l'API Gemini, avec validation des réponses générées.",
        "Modélisation d'un système de classement et de tournois avec TypeORM sur PostgreSQL."
      ]
    },
    "todolist": {
      "title": "Todolist",
      "description": "Application de gestion de tâches en Vue.js, connectée à une API mock (MockAPI) pour la persistance des données."
    },
    "contactlist": {
      "title": "Contactlist",
      "description": "Carnet de contacts développé en Vue.js : ajout, édition et suppression de contacts."
    }
  },
  "contact": {
    "title": "Contact",
    "subtitle": "Une question, une opportunité ? Écris-moi.",
    "name": "Nom",
    "email": "Email",
    "message": "Message",
    "send": "Envoyer",
    "sending": "Envoi en cours...",
    "success": "Message envoyé",
    "error": "Une erreur est survenue, réessaie ou écris-moi directement :",
    "fallbackEmail": "[ton.email{'@'}example.com]",
    "fallbackLink": "[ton.email{'@'}example.com]",
    "errors": {
      "required": "Ce champ est requis",
      "invalid": "Format invalide"
    }
  },
  "footer": {
    "rights": "© {year} [Ton Prénom] [Ton Nom]. Tous droits réservés."
  },
  "seo": {
    "homeTitle": "[Ton Prénom] [Ton Nom] — Développeur Full-Stack",
    "homeDescription": "Portfolio de [Ton Prénom] [Ton Nom], développeur full-stack junior spécialisé en NestJS et Nuxt."
  }
}
```

- [ ] **Step 2: Write `i18n/locales/en.json`**

```json
{
  "nav": { "about": "About", "skills": "Skills", "projects": "Projects", "contact": "Contact" },
  "header": { "brand": "[Your First Name] [Your Last Name]", "downloadCv": "Download my CV", "toggleMenu": "Open menu" },
  "theme": { "switchToLight": "Switch to light mode", "switchToDark": "Switch to dark mode" },
  "hero": {
    "greeting": "[Your First Name] [Your Last Name]",
    "role": "Junior Full-Stack Developer — NestJS, Nuxt & TypeScript",
    "ctaProjects": "See my projects",
    "ctaCv": "Download my CV"
  },
  "about": {
    "title": "About",
    "photoAlt": "Photo of [Your First Name] [Your Last Name]",
    "intro": "Recently graduated in software development, I build complete web applications, from NestJS backends to Nuxt frontends. Curious and thorough, I like to fully understand a problem before writing a single line of code.",
    "timeline": {
      "studies": {
        "title": "Software development studies",
        "description": "Learned full-stack web development: object-oriented PHP, Laravel, Vue.js, relational databases."
      },
      "internship": {
        "title": "Full-stack development internship",
        "description": "Hands-on experience on a full project with NestJS, TypeORM, Nuxt 3 and an AI API integration."
      },
      "tfe": {
        "title": "Final year project — Questy",
        "description": "Design and development of a gamified learning platform: quizzes, challenges, tournaments, rankings."
      }
    }
  },
  "skills": {
    "title": "Skills",
    "categories": {
      "languages": "Languages",
      "backend": "Backend",
      "frontend": "Frontend",
      "databases": "Databases",
      "auth": "Authentication",
      "testing": "Testing",
      "ai": "Artificial intelligence",
      "tools": "Tools",
      "deployment": "Deployment"
    }
  },
  "projects": {
    "title": "Projects",
    "demoSoon": "Demo coming soon",
    "viewDemo": "View demo",
    "viewDetails": "View details",
    "back": "Back to projects",
    "challengesTitle": "Technical challenges",
    "questy": {
      "title": "Questy",
      "description": "Gamified learning platform: quizzes, challenges, tournaments and rankings, with AI integration (Gemini API).",
      "context": "Questy is my final year project: a web platform for creating and tracking gamified quizzes and challenges, with a tournament system, rankings and an admin panel. The backend is built with NestJS/TypeORM/PostgreSQL, the frontend with Nuxt 3/Vue 3/Pinia.",
      "challenges": [
        "Secure JWT authentication and role management (user / admin) with Passport.",
        "AI-assisted quiz content generation via the Gemini API, with validation of generated answers.",
        "Modeling a ranking and tournament system with TypeORM on PostgreSQL."
      ]
    },
    "todolist": {
      "title": "Todolist",
      "description": "Task management app built with Vue.js, connected to a mock API (MockAPI) for data persistence."
    },
    "contactlist": {
      "title": "Contactlist",
      "description": "Contact book built with Vue.js: add, edit and delete contacts."
    }
  },
  "contact": {
    "title": "Contact",
    "subtitle": "A question, an opportunity? Get in touch.",
    "name": "Name",
    "email": "Email",
    "message": "Message",
    "send": "Send",
    "sending": "Sending...",
    "success": "Message sent",
    "error": "Something went wrong, try again or email me directly:",
    "fallbackEmail": "[your.email{'@'}example.com]",
    "fallbackLink": "[your.email{'@'}example.com]",
    "errors": {
      "required": "This field is required",
      "invalid": "Invalid format"
    }
  },
  "footer": {
    "rights": "© {year} [Your First Name] [Your Last Name]. All rights reserved."
  },
  "seo": {
    "homeTitle": "[Your First Name] [Your Last Name] — Full-Stack Developer",
    "homeDescription": "Portfolio of [Your First Name] [Your Last Name], junior full-stack developer specialized in NestJS and Nuxt."
  }
}
```

- [ ] **Step 3: Write `app/components/ui/LocaleToggle.vue`**

```vue
<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const otherLocale = computed(() => {
  const available = (locales.value as { code: string }[]).map((l) => l.code)
  return available.find((code) => code !== locale.value) ?? available[0]
})

function switchLocale() {
  setLocale(otherLocale.value as 'fr' | 'en')
}
</script>

<template>
  <button
    type="button"
    class="glitch-hover h-9 rounded border border-border px-2 text-sm font-semibold uppercase text-text-muted transition-colors hover:border-accent-cyan hover:text-accent-cyan"
    @click="switchLocale"
  >
    {{ otherLocale }}
  </button>
</template>
```

- [ ] **Step 4: Verify locale files are valid JSON and the app boots**

Run: `npm run dev`
Expected: server starts without i18n configuration errors. Stop the server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add i18n/ app/components/ui/LocaleToggle.vue
git commit -m "feat: add FR/EN locale content and locale toggle"
```

---

### Task 4: Content data layer (skills, timeline, projects)

**Files:**
- Create: `app/data/skills.ts`
- Create: `app/data/timeline.ts`
- Create: `app/data/projects.ts`

**Interfaces:**
- Produces:
  - `Skill { name: string; icon: string }`, `SkillCategory { key: string; skills: Skill[] }`, `skillCategories: SkillCategory[]` — consumed by `SkillsGrid.vue` (Task 11).
  - `TimelineEntry { key: string; period: string; type: 'studies' | 'internship' | 'project' }`, `timelineEntries: TimelineEntry[]` — consumed by `AboutSection.vue`/`TimelineItem.vue` (Task 10). Each `entry.key` must match a `about.timeline.<key>` block in Task 3's locale files (`studies`, `internship`, `tfe`).
  - `FeaturedProject { slug: string; demoUrl: string | null; repoUrls: { label: string; url: string }[]; stack: string[]; images: string[] }`, `featuredProject: FeaturedProject` — consumed by `ProjectCardFeatured.vue` (Task 12) and `pages/projects/[slug].vue` (Task 15).
  - `CompactProject { slug: string; repoUrl: string; stack: string[] }`, `compactProjects: CompactProject[]` — consumed by `ProjectCardCompact.vue` (Task 12). Each `slug` must match a `projects.<slug>` block in Task 3's locale files.

- [ ] **Step 1: Write `app/data/skills.ts`**

```typescript
export interface Skill {
  name: string
  icon: string
}

export interface SkillCategory {
  key: string
  skills: Skill[]
}

export const skillCategories: SkillCategory[] = [
  {
    key: 'languages',
    skills: [
      { name: 'TypeScript', icon: 'simple-icons:typescript' },
      { name: 'JavaScript', icon: 'simple-icons:javascript' },
      { name: 'PHP', icon: 'simple-icons:php' },
      { name: 'HTML5', icon: 'simple-icons:html5' },
      { name: 'CSS3', icon: 'simple-icons:css' },
    ],
  },
  {
    key: 'backend',
    skills: [
      { name: 'NestJS', icon: 'simple-icons:nestjs' },
      { name: 'TypeORM', icon: 'simple-icons:typeorm' },
      { name: 'Laravel', icon: 'simple-icons:laravel' },
    ],
  },
  {
    key: 'frontend',
    skills: [
      { name: 'Nuxt', icon: 'simple-icons:nuxt' },
      { name: 'Vue.js', icon: 'simple-icons:vuedotjs' },
      { name: 'Pinia', icon: 'simple-icons:pinia' },
      { name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss' },
      { name: 'Vite', icon: 'simple-icons:vite' },
    ],
  },
  {
    key: 'databases',
    skills: [
      { name: 'PostgreSQL', icon: 'simple-icons:postgresql' },
      { name: 'MySQL', icon: 'simple-icons:mysql' },
    ],
  },
  {
    key: 'auth',
    skills: [
      { name: 'JWT', icon: 'simple-icons:jsonwebtokens' },
      { name: 'Passport.js', icon: 'simple-icons:passport' },
    ],
  },
  {
    key: 'testing',
    skills: [{ name: 'Jest', icon: 'simple-icons:jest' }],
  },
  {
    key: 'ai',
    skills: [{ name: 'Gemini API', icon: 'simple-icons:googlegemini' }],
  },
  {
    key: 'tools',
    skills: [
      { name: 'Git', icon: 'simple-icons:git' },
      { name: 'GitHub', icon: 'simple-icons:github' },
      { name: 'Docker', icon: 'simple-icons:docker' },
      // simple-icons n'a pas de logo officiel VS Code / Thunder Client : icônes génériques en remplacement.
      { name: 'VS Code', icon: 'heroicons:code-bracket' },
      { name: 'Postman', icon: 'simple-icons:postman' },
      { name: 'Thunder Client', icon: 'heroicons:bolt' },
      { name: 'Figma', icon: 'simple-icons:figma' },
    ],
  },
  {
    key: 'deployment',
    skills: [{ name: 'Vercel', icon: 'simple-icons:vercel' }],
  },
]
```

- [ ] **Step 2: Write `app/data/timeline.ts`**

```typescript
export type TimelineType = 'studies' | 'internship' | 'project'

export interface TimelineEntry {
  key: string
  period: string
  type: TimelineType
}

// "period" est un texte libre à ajuster (voir CONTENT.md) : dates réelles de formation/stage/TFE.
export const timelineEntries: TimelineEntry[] = [
  { key: 'studies', period: '[Année] — [Année]', type: 'studies' },
  { key: 'internship', period: '[Année]', type: 'internship' },
  { key: 'tfe', period: '[Année]', type: 'project' },
]
```

- [ ] **Step 3: Write `app/data/projects.ts`**

```typescript
export interface FeaturedProject {
  slug: string
  demoUrl: string | null
  repoUrls: { label: string; url: string }[]
  stack: string[]
  images: string[]
}

export interface CompactProject {
  slug: string
  repoUrl: string
  stack: string[]
}

// demoUrl reste `null` tant que le backend `questy-api` n'est pas réhébergé (sous-projet séparé, voir spec).
export const featuredProject: FeaturedProject = {
  slug: 'questy',
  demoUrl: null,
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
    'simple-icons:docker',
    'simple-icons:jest',
  ],
  // Ajoute ici les chemins des captures d'écran une fois déposées dans public/images/projects/questy/.
  images: [],
}

export const compactProjects: CompactProject[] = [
  {
    slug: 'todolist',
    repoUrl: 'https://github.com/Falkort91/TODOLIST-VUECLI-MOCKAPI',
    stack: ['simple-icons:vuedotjs', 'simple-icons:javascript'],
  },
  {
    slug: 'contactlist',
    repoUrl: 'https://github.com/Falkort91/CONTACT_LIST_VUEJS',
    stack: ['simple-icons:vuedotjs'],
  },
]
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add app/data/
git commit -m "feat: add skills, timeline and projects content data"
```

---

### Task 5: Typewriter composable

**Files:**
- Create: `app/composables/useTypewriter.ts`
- Create: `tests/composables/useTypewriter.spec.ts`

**Interfaces:**
- Produces: `useTypewriter(options?: { speed?: number })` returning `{ displayedText: Ref<string>, isDone: Ref<boolean>, start: (text: string) => void }`. Consumed by `HeroSection.vue` (Task 9), which calls `start(t('hero.greeting'))` on mount and again whenever the locale changes.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/composables/useTypewriter.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypewriter } from '../../app/composables/useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals the text one character at a time at the given speed', () => {
    const { displayedText, isDone, start } = useTypewriter({ speed: 50 })

    start('Hi')

    expect(displayedText.value).toBe('')
    expect(isDone.value).toBe(false)

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('H')

    vi.advanceTimersByTime(50)
    expect(displayedText.value).toBe('Hi')
    expect(isDone.value).toBe(true)
  })

  it('restarts cleanly when called again with new text', () => {
    const { displayedText, start } = useTypewriter({ speed: 50 })

    start('Old')
    vi.advanceTimersByTime(150)
    expect(displayedText.value).toBe('Old')

    start('New')
    expect(displayedText.value).toBe('')
    vi.advanceTimersByTime(150)
    expect(displayedText.value).toBe('New')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useTypewriter.spec.ts`
Expected: FAIL — `Cannot find module '../../app/composables/useTypewriter'`

- [ ] **Step 3: Write `app/composables/useTypewriter.ts`**

```typescript
import { getCurrentInstance, onUnmounted, ref } from 'vue'

interface UseTypewriterOptions {
  speed?: number
}

export function useTypewriter(options: UseTypewriterOptions = {}) {
  const speed = options.speed ?? 60
  const displayedText = ref('')
  const isDone = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function start(text: string) {
    if (timer) clearInterval(timer)
    displayedText.value = ''
    isDone.value = false
    let index = 0
    timer = setInterval(() => {
      index += 1
      displayedText.value = text.slice(0, index)
      if (index >= text.length) {
        isDone.value = true
        if (timer) clearInterval(timer)
      }
    }, speed)
  }

  // getCurrentInstance() est absent quand le composable est appelé directement dans un test.
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
  }

  return { displayedText, isDone, start }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useTypewriter.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTypewriter.ts tests/composables/useTypewriter.spec.ts
git commit -m "feat: add typewriter composable for the hero section"
```

---

### Task 6: Scroll-reveal composable (GSAP)

**Files:**
- Create: `app/composables/useScrollReveal.ts`

**Interfaces:**
- Consumes: `gsap` and `gsap/ScrollTrigger` (installed in Task 1).
- Produces: `useScrollReveal(container: Ref<HTMLElement | null>)` — call it in a section component's `<script setup>` with a template ref; any descendant element carrying a `data-reveal` attribute animates in (fade + slide up, staggered) the first time the section scrolls into view. No return value. This composable wraps GSAP/DOM timing and is verified visually (Task 16's manual QA pass), not unit tested.

- [ ] **Step 1: Write `app/composables/useScrollReveal.ts`**

```typescript
import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(container: Ref<HTMLElement | null>) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    if (!container.value) return

    ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container.value,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
    }, container.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/composables/useScrollReveal.ts
git commit -m "feat: add GSAP scroll-reveal composable"
```

---

### Task 7: Contact form composable

**Files:**
- Create: `app/composables/useContactForm.ts`
- Create: `tests/composables/useContactForm.spec.ts`

**Interfaces:**
- Produces:
  - `ContactFormState { name: string; email: string; message: string }`
  - `ContactFormErrors = Partial<Record<keyof ContactFormState, 'required' | 'invalid'>>`
  - `validateContactForm(form: ContactFormState): ContactFormErrors` (pure function, exported)
  - `useContactForm(endpoint: string)` returning `{ form: ContactFormState, errors: Ref<ContactFormErrors>, status: Ref<'idle' | 'submitting' | 'success' | 'error'>, isValid: ComputedRef<boolean>, submit: () => Promise<void> }`
  - Consumed by `ContactSection.vue` (Task 13), which passes `useRuntimeConfig().public.formspreeEndpoint` as `endpoint`. `errors.<field>` values (`'required'` / `'invalid'`) map directly to the `contact.errors.required` / `contact.errors.invalid` i18n keys from Task 3.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/composables/useContactForm.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useContactForm, validateContactForm } from '../../app/composables/useContactForm'

describe('validateContactForm', () => {
  it('flags empty required fields', () => {
    const errors = validateContactForm({ name: '', email: '', message: '' })
    expect(errors).toEqual({ name: 'required', email: 'required', message: 'required' })
  })

  it('flags an invalid email format', () => {
    const errors = validateContactForm({ name: 'Ada', email: 'not-an-email', message: 'Hello' })
    expect(errors).toEqual({ email: 'invalid' })
  })

  it('returns no errors for a valid form', () => {
    const errors = validateContactForm({ name: 'Ada', email: 'ada@example.com', message: 'Hello' })
    expect(errors).toEqual({})
  })
})

describe('useContactForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not call fetch and records errors when the form is invalid', async () => {
    const { form, errors, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = ''

    await submit()

    expect(fetch).not.toHaveBeenCalled()
    expect(errors.value.name).toBe('required')
    expect(status.value).toBe('idle')
  })

  it('sets status to success when the request succeeds', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }))
    const { form, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(fetch).toHaveBeenCalledWith(
      'https://formspree.io/f/test',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(status.value).toBe('success')
  })

  it('sets status to error when the request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }))
    const { form, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(status.value).toBe('error')
  })

  it('sets status to error when fetch throws (network failure)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network down'))
    const { form, status, submit } = useContactForm('https://formspree.io/f/test')
    form.name = 'Ada'
    form.email = 'ada@example.com'
    form.message = 'Hello'

    await submit()

    expect(status.value).toBe('error')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/composables/useContactForm.spec.ts`
Expected: FAIL — `Cannot find module '../../app/composables/useContactForm'`

- [ ] **Step 3: Write `app/composables/useContactForm.ts`**

```typescript
import { computed, reactive, ref } from 'vue'

export interface ContactFormState {
  name: string
  email: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormState, 'required' | 'invalid'>>
export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContactForm(form: ContactFormState): ContactFormErrors {
  const errors: ContactFormErrors = {}
  if (!form.name.trim()) errors.name = 'required'
  if (!form.email.trim()) errors.email = 'required'
  else if (!EMAIL_REGEX.test(form.email)) errors.email = 'invalid'
  if (!form.message.trim()) errors.message = 'required'
  return errors
}

export function useContactForm(endpoint: string) {
  const form = reactive<ContactFormState>({ name: '', email: '', message: '' })
  const errors = ref<ContactFormErrors>({})
  const status = ref<SubmitStatus>('idle')

  const isValid = computed(() => Object.keys(validateContactForm(form)).length === 0)

  async function submit() {
    const validationErrors = validateContactForm(form)
    errors.value = validationErrors
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    status.value = 'submitting'
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      status.value = response.ok ? 'success' : 'error'
    } catch {
      status.value = 'error'
    }
  }

  return { form, errors, status, isValid, submit }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/composables/useContactForm.spec.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: PASS (all suites so far)

- [ ] **Step 6: Commit**

```bash
git add app/composables/useContactForm.ts tests/composables/useContactForm.spec.ts
git commit -m "feat: add contact form composable with validation and Formspree submission"
```

---

### Task 8: App shell — header, footer, layout

**Files:**
- Create: `app/components/layout/AppHeader.vue`
- Create: `app/components/layout/AppFooter.vue`
- Modify: `app/layouts/default.vue`

**Interfaces:**
- Consumes: `<ThemeToggle />` (Task 2), `<LocaleToggle />` (Task 3), i18n keys `nav.*`, `header.*`, `footer.rights` (Task 3).
- Produces: fixed header with anchor navigation (`#about`, `#skills`, `#projects`, `#contact`) and a mobile hamburger menu; footer with social links. Later section components (Tasks 9–13) rely on the header's `h-16` height for their own top padding/scroll-offset.

- [ ] **Step 1: Write `app/components/layout/AppHeader.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const isMobileMenuOpen = ref(false)

const navLinks = [
  { key: 'about', href: '#about' },
  { key: 'skills', href: '#skills' },
  { key: 'projects', href: '#projects' },
  { key: 'contact', href: '#contact' },
]

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="#top" class="glitch-hover font-bold tracking-tight text-text">
        &gt; {{ t('header.brand') }}
      </a>

      <nav class="hidden gap-6 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.href"
          class="glitch-hover text-sm text-text-muted transition-colors hover:text-accent-green"
        >
          {{ t(`nav.${link.key}`) }}
        </a>
      </nav>

      <div class="flex items-center gap-2">
        <a
          href="/cv.pdf"
          download
          class="hidden rounded border border-accent-green px-3 py-1.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg sm:inline-block"
        >
          {{ t('header.downloadCv') }}
        </a>
        <ThemeToggle />
        <LocaleToggle />
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded border border-border text-text md:hidden"
          :aria-label="t('header.toggleMenu')"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <Icon :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <nav
      v-if="isMobileMenuOpen"
      class="flex flex-col gap-1 border-t border-border bg-bg px-4 py-3 md:hidden"
    >
      <a
        v-for="link in navLinks"
        :key="link.key"
        :href="link.href"
        class="rounded px-2 py-2 text-sm text-text-muted transition-colors hover:bg-bg-alt hover:text-accent-green"
        @click="closeMobileMenu"
      >
        {{ t(`nav.${link.key}`) }}
      </a>
      <a
        href="/cv.pdf"
        download
        class="rounded px-2 py-2 text-sm font-semibold text-accent-green"
        @click="closeMobileMenu"
      >
        {{ t('header.downloadCv') }}
      </a>
    </nav>
  </header>
</template>
```

- [ ] **Step 2: Write `app/components/layout/AppFooter.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()

// Remplace par ta vraie URL LinkedIn (voir CONTENT.md).
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Falkort91', icon: 'simple-icons:github' },
  { label: 'LinkedIn', href: '[https://www.linkedin.com/in/ton-profil]', icon: 'simple-icons:linkedin' },
]
</script>

<template>
  <footer class="border-t border-border py-8">
    <div class="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
      <p class="text-sm text-text-muted">{{ t('footer.rights', { year: new Date().getFullYear() }) }}</p>
      <div class="flex gap-4">
        <a
          v-for="link in socialLinks"
          :key="link.label"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted transition-colors hover:text-accent-cyan"
          :aria-label="link.label"
        >
          <Icon :name="link.icon" class="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: Wire header/footer into the default layout**

Modify `app/layouts/default.vue`:

```vue
<template>
  <div class="min-h-screen bg-bg text-text">
    <AppHeader />
    <main class="pt-16">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: header fixed at top with brand, nav links, theme toggle, locale toggle, CV button; resize the viewport below `768px` and confirm the hamburger menu opens/closes the mobile nav; footer visible at the bottom. Stop the server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add app/components/layout/ app/layouts/default.vue
git commit -m "feat: add app header (with mobile menu) and footer"
```

---

### Task 9: Hero section

**Files:**
- Create: `app/components/home/HeroSection.vue`

**Interfaces:**
- Consumes: `useTypewriter` (Task 5), i18n keys `hero.*` (Task 3).
- Produces: `<HeroSection />` with no props, rendered by `pages/index.vue` (Task 14). Section id `top`.

- [ ] **Step 1: Write `app/components/home/HeroSection.vue`**

```vue
<script setup lang="ts">
const { t, locale } = useI18n()
const { displayedText, start } = useTypewriter({ speed: 55 })

onMounted(() => {
  start(t('hero.greeting'))
})

watch(locale, () => {
  start(t('hero.greeting'))
})
</script>

<template>
  <section id="top" class="scanline-bg flex min-h-screen flex-col justify-center px-4 pt-16 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-3xl">
      <p class="text-sm text-accent-green">$ whoami</p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl md:text-5xl">
        <span class="terminal-cursor">{{ displayedText }}</span>
      </h1>
      <p class="mt-3 text-lg text-text-muted sm:text-xl">{{ t('hero.role') }}</p>
      <div class="mt-8 flex flex-wrap gap-4">
        <a
          href="#projects"
          class="rounded border border-accent-green px-5 py-2.5 font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
        >
          {{ t('hero.ctaProjects') }}
        </a>
        <a
          href="/cv.pdf"
          download
          class="rounded border border-border px-5 py-2.5 font-semibold text-text-muted transition-colors hover:border-accent-cyan hover:text-accent-cyan"
        >
          {{ t('hero.ctaCv') }}
        </a>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`. Expected: the hero name types itself out on load; switching locale (toggle) retypes it in the new language. Stop the server once confirmed.

- [ ] **Step 3: Commit**

```bash
git add app/components/home/HeroSection.vue
git commit -m "feat: add hero section with typewriter effect"
```

---

### Task 10: About section and timeline

**Files:**
- Create: `app/components/home/AboutSection.vue`
- Create: `app/components/home/TimelineItem.vue`

**Interfaces:**
- Consumes: `timelineEntries` from `app/data/timeline.ts` (Task 4), `useScrollReveal` (Task 6), i18n keys `about.*` (Task 3).
- Produces: `<AboutSection />` with no props, section id `about`. `<TimelineItem :entry="entry" />` expects an `entry: TimelineEntry` prop.

- [ ] **Step 1: Write `app/components/home/TimelineItem.vue`**

```vue
<script setup lang="ts">
import type { TimelineEntry } from '~/data/timeline'

defineProps<{ entry: TimelineEntry }>()

const { t } = useI18n()

const typeIcon: Record<TimelineEntry['type'], string> = {
  studies: 'heroicons:academic-cap',
  internship: 'heroicons:briefcase',
  project: 'heroicons:rocket-launch',
}
</script>

<template>
  <li class="relative">
    <span class="absolute -left-[1.95rem] flex h-5 w-5 items-center justify-center rounded-full border border-accent-green bg-bg text-accent-green">
      <Icon :name="typeIcon[entry.type]" class="h-3 w-3" />
    </span>
    <p class="text-xs uppercase tracking-wide text-accent-cyan">{{ entry.period }}</p>
    <h3 class="font-semibold text-text">{{ t(`about.timeline.${entry.key}.title`) }}</h3>
    <p class="text-sm text-text-muted">{{ t(`about.timeline.${entry.key}.description`) }}</p>
  </li>
</template>
```

- [ ] **Step 2: Write `app/components/home/AboutSection.vue`**

```vue
<script setup lang="ts">
import { timelineEntries } from '~/data/timeline'

const { t } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
useScrollReveal(sectionRef)
</script>

<template>
  <section id="about" ref="sectionRef" class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-2xl font-bold sm:text-3xl">{{ t('about.title') }}</h2>

    <div class="mt-8 grid gap-10 md:grid-cols-[auto,1fr] md:items-start">
      <img
        data-reveal
        src="/images/profile.jpg"
        :alt="t('about.photoAlt')"
        class="h-40 w-40 rounded border border-border object-cover sm:h-48 sm:w-48"
      >

      <div data-reveal class="space-y-6">
        <p class="text-text-muted">{{ t('about.intro') }}</p>

        <ol class="space-y-6 border-l border-border pl-6">
          <TimelineItem
            v-for="entry in timelineEntries"
            :key="entry.key"
            :entry="entry"
          />
        </ol>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Manual check**

Run: `npm run dev`. Expected: About section shows a broken-image icon for `/images/profile.jpg` (expected — placeholder image not added yet, tracked in `CONTENT.md`, Task 16) and the three timeline entries with correct titles/descriptions in both locales. Scrolling the section into view triggers the fade/slide-up animation once. Stop the server once confirmed.

- [ ] **Step 4: Commit**

```bash
git add app/components/home/AboutSection.vue app/components/home/TimelineItem.vue
git commit -m "feat: add about section with career timeline"
```

---

### Task 11: Skills grid

**Files:**
- Create: `app/components/home/SkillsGrid.vue`

**Interfaces:**
- Consumes: `skillCategories` from `app/data/skills.ts` (Task 4), `useScrollReveal` (Task 6), i18n keys `skills.*` (Task 3).
- Produces: `<SkillsGrid />` with no props, section id `skills`.

- [ ] **Step 1: Write `app/components/home/SkillsGrid.vue`**

```vue
<script setup lang="ts">
import { skillCategories } from '~/data/skills'

const { t } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
useScrollReveal(sectionRef)
</script>

<template>
  <section id="skills" ref="sectionRef" class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-2xl font-bold sm:text-3xl">{{ t('skills.title') }}</h2>

    <div class="mt-8 space-y-8">
      <div v-for="category in skillCategories" :key="category.key" data-reveal>
        <h3 class="text-sm font-semibold uppercase tracking-wide text-text-muted">
          {{ t(`skills.categories.${category.key}`) }}
        </h3>
        <div class="mt-3 flex flex-wrap gap-3">
          <span
            v-for="skill in category.skills"
            :key="skill.name"
            class="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm text-text transition-colors hover:border-accent-green hover:text-accent-green"
          >
            <Icon :name="skill.icon" class="h-4 w-4" />
            {{ skill.name }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`. Expected: every skill badge shows its logo + name, grid wraps cleanly at every breakpoint (resize from 360px to 1920px wide), no missing-icon placeholders. Stop the server once confirmed.

- [ ] **Step 3: Commit**

```bash
git add app/components/home/SkillsGrid.vue
git commit -m "feat: add unified skills grid"
```

---

### Task 12: Projects section and cards

**Files:**
- Create: `app/components/home/ProjectCardFeatured.vue`
- Create: `app/components/home/ProjectCardCompact.vue`
- Create: `app/components/home/ProjectsSection.vue`

**Interfaces:**
- Consumes: `featuredProject`, `compactProjects` and their types from `app/data/projects.ts` (Task 4), `useScrollReveal` (Task 6), i18n keys `projects.*` (Task 3).
- Produces: `<ProjectCardFeatured :project="featuredProject" />`, `<ProjectCardCompact :project="project" />`, `<ProjectsSection />` (no props, section id `projects`), consumed by `pages/index.vue` (Task 14). Featured card links to `/projects/${project.slug}`, matching the route created in Task 15.

- [ ] **Step 1: Write `app/components/home/ProjectCardFeatured.vue`**

```vue
<script setup lang="ts">
import type { FeaturedProject } from '~/data/projects'

const props = defineProps<{ project: FeaturedProject }>()
const { t } = useI18n()
</script>

<template>
  <article class="scanline-bg rounded border border-border bg-bg-alt p-6 sm:p-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-xl font-bold">{{ t(`projects.${props.project.slug}.title`) }}</h3>
      <span
        v-if="!props.project.demoUrl"
        class="rounded border border-accent-magenta px-2 py-1 text-xs font-semibold uppercase text-accent-magenta"
      >
        {{ t('projects.demoSoon') }}
      </span>
      <a
        v-else
        :href="props.project.demoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded border border-accent-green px-3 py-1.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
      >
        {{ t('projects.viewDemo') }}
      </a>
    </div>

    <p class="mt-3 text-text-muted">{{ t(`projects.${props.project.slug}.description`) }}</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <Icon v-for="icon in props.project.stack" :key="icon" :name="icon" class="h-5 w-5 text-text-muted" />
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-4">
      <NuxtLink
        :to="`/projects/${props.project.slug}`"
        class="glitch-hover text-sm font-semibold text-accent-cyan"
      >
        {{ t('projects.viewDetails') }} →
      </NuxtLink>
      <a
        v-for="repo in props.project.repoUrls"
        :key="repo.url"
        :href="repo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm text-text-muted underline-offset-2 hover:text-accent-cyan hover:underline"
      >
        {{ repo.label }} ↗
      </a>
    </div>
  </article>
</template>
```

- [ ] **Step 2: Write `app/components/home/ProjectCardCompact.vue`**

```vue
<script setup lang="ts">
import type { CompactProject } from '~/data/projects'

const props = defineProps<{ project: CompactProject }>()
const { t } = useI18n()
</script>

<template>
  <article class="rounded border border-border p-5 transition-colors hover:border-accent-cyan">
    <h3 class="font-semibold">{{ t(`projects.${props.project.slug}.title`) }}</h3>
    <p class="mt-2 text-sm text-text-muted">{{ t(`projects.${props.project.slug}.description`) }}</p>
    <div class="mt-3 flex flex-wrap gap-2">
      <Icon v-for="icon in props.project.stack" :key="icon" :name="icon" class="h-4 w-4 text-text-muted" />
    </div>
    <a
      :href="props.project.repoUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-4 inline-block text-sm font-semibold text-accent-cyan hover:underline"
    >
      GitHub ↗
    </a>
  </article>
</template>
```

- [ ] **Step 3: Write `app/components/home/ProjectsSection.vue`**

```vue
<script setup lang="ts">
import { compactProjects, featuredProject } from '~/data/projects'

const { t } = useI18n()
const sectionRef = ref<HTMLElement | null>(null)
useScrollReveal(sectionRef)
</script>

<template>
  <section id="projects" ref="sectionRef" class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-2xl font-bold sm:text-3xl">{{ t('projects.title') }}</h2>

    <div data-reveal class="mt-8">
      <ProjectCardFeatured :project="featuredProject" />
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <ProjectCardCompact
        v-for="project in compactProjects"
        :key="project.slug"
        data-reveal
        :project="project"
      />
    </div>
  </section>
</template>
```

- [ ] **Step 4: Manual check**

Run: `npm run dev`. Expected: featured Questy card shows the "demo soon" badge (since `demoUrl` is `null`), stack icons, a working "view details" link, and links to both GitHub repos; the two compact cards show their own GitHub links. Stop the server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add app/components/home/ProjectCardFeatured.vue app/components/home/ProjectCardCompact.vue app/components/home/ProjectsSection.vue
git commit -m "feat: add projects section with featured and compact project cards"
```

---

### Task 13: Contact section

**Files:**
- Create: `app/components/home/ContactSection.vue`

**Interfaces:**
- Consumes: `useContactForm` (Task 7), `useScrollReveal` (Task 6), `useRuntimeConfig().public.formspreeEndpoint` (Task 1), i18n keys `contact.*` (Task 3).
- Produces: `<ContactSection />` with no props, section id `contact`.

- [ ] **Step 1: Write `app/components/home/ContactSection.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const sectionRef = ref<HTMLElement | null>(null)
useScrollReveal(sectionRef)

const { form, errors, status, submit } = useContactForm(config.public.formspreeEndpoint)
</script>

<template>
  <section id="contact" ref="sectionRef" class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
    <h2 data-reveal class="glitch-hover text-2xl font-bold sm:text-3xl">{{ t('contact.title') }}</h2>
    <p data-reveal class="mt-3 text-text-muted">{{ t('contact.subtitle') }}</p>

    <form data-reveal class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label for="name" class="block text-sm font-semibold text-text-muted">{{ t('contact.name') }}</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text focus:border-accent-green focus:outline-none"
        >
        <p v-if="errors.name" class="mt-1 text-xs text-accent-magenta">{{ t(`contact.errors.${errors.name}`) }}</p>
      </div>

      <div>
        <label for="email" class="block text-sm font-semibold text-text-muted">{{ t('contact.email') }}</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text focus:border-accent-green focus:outline-none"
        >
        <p v-if="errors.email" class="mt-1 text-xs text-accent-magenta">{{ t(`contact.errors.${errors.email}`) }}</p>
      </div>

      <div>
        <label for="message" class="block text-sm font-semibold text-text-muted">{{ t('contact.message') }}</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="5"
          class="mt-1 w-full rounded border border-border bg-bg px-3 py-2 text-text focus:border-accent-green focus:outline-none"
        />
        <p v-if="errors.message" class="mt-1 text-xs text-accent-magenta">{{ t(`contact.errors.${errors.message}`) }}</p>
      </div>

      <button
        type="submit"
        :disabled="status === 'submitting'"
        class="rounded border border-accent-green px-5 py-2.5 font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ status === 'submitting' ? t('contact.sending') : t('contact.send') }}
      </button>

      <p v-if="status === 'success'" class="text-sm text-accent-green">&gt; {{ t('contact.success') }} ✓</p>
      <p v-else-if="status === 'error'" class="text-sm text-accent-magenta">
        &gt; {{ t('contact.error') }}
        <a :href="`mailto:${t('contact.fallbackEmail')}`" class="underline">{{ t('contact.fallbackLink') }}</a>
      </p>
    </form>
  </section>
</template>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`. Expected: submitting the empty form shows the three "required" errors without calling Formspree; filling valid values and submitting (with `NUXT_PUBLIC_FORMSPREE_ENDPOINT` unset) shows the error state with the `mailto:` fallback link. Stop the server once confirmed.

- [ ] **Step 3: Commit**

```bash
git add app/components/home/ContactSection.vue
git commit -m "feat: add contact section wired to the contact form composable"
```

---

### Task 14: Home page assembly and SEO

**Files:**
- Modify: `app/pages/index.vue`

**Interfaces:**
- Consumes: `HeroSection`, `AboutSection`, `SkillsGrid`, `ProjectsSection`, `ContactSection` (Tasks 9–13), i18n keys `seo.homeTitle` / `seo.homeDescription` (Task 3).

- [ ] **Step 1: Replace the placeholder `app/pages/index.vue`**

```vue
<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDescription'),
})
</script>

<template>
  <div>
    <HeroSection />
    <AboutSection />
    <SkillsGrid />
    <ProjectsSection />
    <ContactSection />
  </div>
</template>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`. Expected: the full one-page home renders top to bottom (Hero → About → Skills → Projects → Contact), all anchor nav links from `AppHeader` scroll to the right section, `document.title` reflects `seo.homeTitle`. Stop the server once confirmed.

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: assemble home page from all sections with SEO meta"
```

---

### Task 15: Project detail page

**Files:**
- Create: `app/pages/projects/[slug].vue`

**Interfaces:**
- Consumes: `featuredProject` from `app/data/projects.ts` (Task 4), i18n keys `projects.<slug>.*` and `projects.challengesTitle` / `projects.back` (Task 3).
- Produces: route `/projects/questy` (case study). Any other slug renders a 404 via `createError`.

- [ ] **Step 1: Write `app/pages/projects/[slug].vue`**

```vue
<script setup lang="ts">
import { featuredProject } from '~/data/projects'

const route = useRoute()
const { t, tm, rt } = useI18n()

const slug = route.params.slug as string

if (slug !== featuredProject.slug) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const challenges = computed(() =>
  (tm(`projects.${slug}.challenges`) as unknown[]).map((item) => rt(item as string)),
)

useSeoMeta({
  title: () => t(`projects.${slug}.title`),
  description: () => t(`projects.${slug}.description`),
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
    <NuxtLink to="/#projects" class="text-sm text-accent-cyan hover:underline">
      ← {{ t('projects.back') }}
    </NuxtLink>

    <h1 class="mt-4 text-3xl font-bold">{{ t(`projects.${slug}.title`) }}</h1>

    <div class="mt-3">
      <span
        v-if="!featuredProject.demoUrl"
        class="rounded border border-accent-magenta px-2 py-1 text-xs font-semibold uppercase text-accent-magenta"
      >
        {{ t('projects.demoSoon') }}
      </span>
      <a
        v-else
        :href="featuredProject.demoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded border border-accent-green px-3 py-1.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green hover:text-bg"
      >
        {{ t('projects.viewDemo') }}
      </a>
    </div>

    <p class="mt-6 text-text-muted">{{ t(`projects.${slug}.context`) }}</p>

    <div class="mt-6 flex flex-wrap gap-3">
      <Icon v-for="icon in featuredProject.stack" :key="icon" :name="icon" class="h-6 w-6 text-text-muted" />
    </div>

    <div v-if="featuredProject.images.length" class="mt-10 grid gap-4 sm:grid-cols-2">
      <NuxtImg
        v-for="(image, index) in featuredProject.images"
        :key="image"
        :src="image"
        :alt="`${t(\`projects.${slug}.title\`)} — screenshot ${index + 1}`"
        class="rounded border border-border"
        loading="lazy"
      />
    </div>

    <section class="mt-10">
      <h2 class="text-xl font-semibold">{{ t('projects.challengesTitle') }}</h2>
      <ul class="mt-4 space-y-3 text-text-muted">
        <li v-for="(challenge, index) in challenges" :key="index">{{ challenge }}</li>
      </ul>
    </section>

    <div class="mt-10 flex flex-wrap gap-4">
      <a
        v-for="repo in featuredProject.repoUrls"
        :key="repo.url"
        :href="repo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-accent-cyan hover:text-accent-cyan"
      >
        {{ repo.label }} ↗
      </a>
    </div>
  </article>
</template>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev`, visit `http://localhost:3000/projects/questy`.
Expected: case study renders with context, stack icons, the three challenge bullets (in both locales), repo links; no screenshots shown yet (empty `images` array — expected). Visit `http://localhost:3000/projects/nonexistent` and confirm a 404 page renders. Stop the server once confirmed.

- [ ] **Step 3: Commit**

```bash
git add app/pages/projects/
git commit -m "feat: add Questy project detail page"
```

---

### Task 16: Content checklist, sitemap/robots, and production build

**Files:**
- Create: `CONTENT.md`
- Create: `public/robots.txt`
- Modify: `nuxt.config.ts` (site URL for SEO)

**Interfaces:**
- Consumes: `@nuxtjs/sitemap` (installed in Task 1), which auto-generates `/sitemap.xml` from the app's routes once `site.url` is set — no separate sitemap file to hand-write.
- Produces: a checklist file listing every placeholder introduced in Tasks 3, 4 and 8 that the user must personalize before publishing. Final verification that the whole site builds and passes tests/typecheck together.

- [ ] **Step 1: Write `CONTENT.md`**

```markdown
# Contenu à personnaliser avant mise en ligne

Ce fichier liste tout ce que le plan d'implémentation a volontairement laissé en placeholder — le code est fonctionnel, mais ce contenu est personnel et ne pouvait pas être inventé.

## Textes (i18n)

- `i18n/locales/fr.json` et `i18n/locales/en.json` :
  - `header.brand`, `hero.greeting`, `about.photoAlt`, `footer.rights`, `seo.homeTitle`, `seo.homeDescription` → remplacer `[Ton Prénom] [Ton Nom]` par ton vrai nom.
  - `contact.fallbackEmail` / `contact.fallbackLink` → ta vraie adresse email. **Attention** : ces valeurs passent par vue-i18n, qui interprète `@` comme un caractère spécial. Écris ton adresse avec `@` remplacé par `{'@'}` (ex: `mon.nom{'@'}gmail.com`), sinon `npm run build` échouera avec une erreur de compilation des messages.
  - `about.intro` → relire/ajuster le texte de présentation à ta situation exacte.
  - `about.timeline.*.description` → vérifier que la description de chaque étape correspond bien à ton parcours réel.
  - `projects.questy.challenges` → ajuster les défis techniques si tu veux en mettre d'autres en avant.

## Données (`app/data/`)

- `app/data/timeline.ts` : remplacer les `period` (`'[Année] — [Année]'`, `'[Année]'`) par tes vraies dates de formation, stage et TFE.
- `app/data/projects.ts` : `featuredProject.images` est vide — une fois des captures d'écran de Questy déposées dans `public/images/projects/questy/`, ajouter leurs chemins ici (ex: `/images/projects/questy/dashboard.png`).
- `app/data/projects.ts` : `featuredProject.demoUrl` reste `null` tant que le backend `questy-api` n'est pas réhébergé (sous-projet séparé, voir `docs/superpowers/specs/2026-07-21-portfolio-design.md`).

## Fichiers statiques (`public/`)

- `public/cv.pdf` : ajouter ton CV réel (référencé par les boutons "Télécharger mon CV").
- `public/images/profile.jpg` : ajouter ta photo (section À propos).
- `public/favicon.svg` : ajouter un favicon (actuellement référencé mais absent).
- `public/images/projects/questy/*.png` : captures d'écran de Questy (optionnel, voir ci-dessus).

## Liens

- `app/components/layout/AppFooter.vue` : remplacer l'URL LinkedIn placeholder par la tienne.

## Déploiement

Ce projet n'a pas (et n'aura pas) de dépôt git — le déploiement se fait donc via la **CLI Vercel** en local, pas via un import GitHub :

1. `npm install -g vercel` (une fois).
2. `vercel login` (une fois).
3. Depuis la racine du projet : `vercel` pour un déploiement de preview, puis `vercel --prod` pour la mise en production. La CLI détecte Nuxt automatiquement.
4. Variable d'environnement `NUXT_PUBLIC_FORMSPREE_ENDPOINT` : créer un formulaire sur [formspree.io](https://formspree.io), puis l'ajouter au projet Vercel avec `vercel env add NUXT_PUBLIC_FORMSPREE_ENDPOINT production` (et `preview`/`development` si besoin) — ou via le dashboard Vercel. Ajouter aussi la valeur dans `.env` en local.
5. `nuxt.config.ts` → `site.url` : mettre à jour avec le nom de domaine réel une fois le premier déploiement Vercel effectué (ex: `https://ton-nom.vercel.app`), puis redéployer (`vercel --prod`).
```

- [ ] **Step 2: Write `public/robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 3: Add a `site` block to `nuxt.config.ts` for SEO defaults and sitemap generation**

Modify `nuxt.config.ts`, add alongside the existing `runtimeConfig` block:

```typescript
  site: {
    url: 'https://your-portfolio.vercel.app',
    name: 'Portfolio',
  },
```

- [ ] **Step 4: Run the full verification suite**

Run: `npm run typecheck && npm run test && npm run build`
Expected: all three succeed with no errors.

- [ ] **Step 4b: Verify the sitemap is generated**

Run: `npm run preview` (after the build from Step 4), then open `http://localhost:3000/sitemap.xml`.
Expected: valid XML listing `/` and `/projects/questy`. Stop the preview server once confirmed.

- [ ] **Step 5: Manual cross-browser/responsive QA pass**

Run: `npm run dev`, open `http://localhost:3000`.
Expected, checked at 375px, 768px, 1024px, 1440px, and 1920px widths, in both dark and light mode:
- No horizontal scroll, no overlapping text, mobile menu works.
- Contrast is readable in both themes (no accent-colored text on a same-hue background).
- `prefers-reduced-motion` (enable via browser/OS setting) disables the glitch-hover and cursor-blink animations.
Stop the server once confirmed.

- [ ] ~~Step 6: Commit~~ — skipped, this project has no git repository (see Global Constraints).

---

## After this plan

- Fill in `CONTENT.md` (real name, photo, CV, dates, LinkedIn, Formspree endpoint).
- Deploy to Vercel via the CLI, not a GitHub import (no repo exists): `npm install -g vercel`, `vercel login`, then `vercel --prod` from the project root. Set `NUXT_PUBLIC_FORMSPREE_ENDPOINT` as an environment variable via `vercel env add` or the dashboard.
- Separate follow-up project (not covered here): re-host the `questy-api` NestJS backend so `featuredProject.demoUrl` can be set to a real URL.
