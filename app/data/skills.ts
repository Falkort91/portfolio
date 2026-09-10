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
      { name: 'CSS', icon: 'simple-icons:css' },
    ],
  },
  {
    key: 'backend',
    skills: [
      { name: 'NestJS', icon: 'simple-icons:nestjs' },
      { name: 'Node.js', icon: 'simple-icons:nodedotjs' },
      { name: 'Laravel', icon: 'simple-icons:laravel' },
    ],
  },
  {
    key: 'frontend',
    skills: [
      { name: 'Nuxt', icon: 'simple-icons:nuxt' },
      { name: 'Vue.js', icon: 'simple-icons:vuedotjs' },
      { name: 'React', icon: 'simple-icons:react' },
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
      { name: 'TypeORM', icon: 'simple-icons:typeorm' },
    ],
  },
  {
    key: 'auth',
    skills: [
      { name: 'JWT', icon: 'simple-icons:jsonwebtokens' },
      { name: 'Passport.js', icon: 'simple-icons:passport' },
      { name: 'Keycloak', icon: 'simple-icons:keycloak' },
    ],
  },
  {
    key: 'testing',
    skills: [
      { name: 'Jest', icon: 'simple-icons:jest' },
      { name: 'Vitest', icon: 'simple-icons:vitest' },
    ],
  },
  {
    key: 'ai',
    skills: [
      { name: 'Gemini API', icon: 'simple-icons:googlegemini' },
      { name: 'Claude', icon: 'simple-icons:claude' },
      { name: 'Claude Code', icon: 'simple-icons:claudecode' },
      { name: 'MCP', icon: 'simple-icons:modelcontextprotocol' },
      // simple-icons n'a pas de logo pour "conception d'agents IA" : icône générique en remplacement.
      // Nom en anglais ("AI Agents") : skill.name n'est pas traduit (voir SkillsGrid.vue), contrairement
      // aux autres entrées ce n'est pas un nom de marque propre à une langue.
      { name: 'AI Agents', icon: 'heroicons:cpu-chip' },
    ],
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
      { name: 'Microsoft Office', icon: 'simple-icons:microsoftoffice' },
    ],
  },
  {
    key: 'deployment',
    skills: [
      { name: 'Vercel', icon: 'simple-icons:vercel' },
      { name: 'Railway', icon: 'simple-icons:railway' },
    ],
  },
]
