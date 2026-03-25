import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/proj-track/',
  title: 'proj-track',
  description: 'Auto-capture CLI command history per-project with zero terminal interference.',
  head: [
    ['meta', { name: 'keywords', content: 'proj-track, CLI history, command tracking, shell history, bash, zsh, project commands, terminal, developer tools, auto-capture' }],
    ['meta', { property: 'og:title', content: 'proj-track — Per-Project CLI Command History' }],
    ['meta', { property: 'og:description', content: 'Silently track every terminal command per project — auto-captured, filtered, and instantly replayable.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'proj-track — Per-Project CLI Command History' }],
    ['meta', { name: 'twitter:description', content: 'Silently track every terminal command per project — auto-captured, filtered, and instantly replayable.' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'proj-track',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Node.js',
      description: 'Auto-capture CLI command history per-project with zero terminal interference.',
      url: 'https://Ali-Raza-Arain.github.io/proj-track/',
      downloadUrl: 'https://www.npmjs.com/package/proj-track',
      license: 'https://opensource.org/licenses/MIT',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      programmingLanguage: 'TypeScript',
    })],
  ],
  sitemap: {
    hostname: 'https://Ali-Raza-Arain.github.io/proj-track/',
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/guide/api-reference' },
      { text: 'npm', link: 'https://www.npmjs.com/package/proj-track' },
      { text: 'GitHub', link: 'https://github.com/Ali-Raza-Arain/proj-track' },
      { text: 'Sponsor', link: 'https://buymeacoffee.com/alirazaarain' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Why proj-track?', link: '/guide/why' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Reference', link: '/guide/api-reference' },
          { text: 'Comparison', link: '/guide/comparison' },
        ],
      },
      {
        text: 'About',
        items: [
          { text: 'Roadmap', link: '/guide/roadmap' },
          { text: 'Credits & Sponsor', link: '/guide/credits' },
        ],
      },
    ],
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ali-Raza-Arain/proj-track' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Made by <a href="https://github.com/Ali-Raza-Arain">Ali Raza</a>',
    },
  },
})
