import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.dev/reference/site-config
// The sidebar is the site's table of contents. Every page ends with a "Source of truth" line naming the
// file in the owning repo it was written from; rewrite the page when that file moves.
export default withMermaid({
  title: 'cvhome',
  description: 'Open-source multi-tenant e-commerce platform on AWS',
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/png', href: '/images/logo/logo.png' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/images/logo/logo.png',
    search: { provider: 'local' },
    outline: [2, 3],

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture/system-context' },
      { text: 'Guides', link: '/guides/merchant' },
      { text: 'Development', link: '/development/local-development' },
      { text: 'Operations', link: '/operations/deployment-guide' },
      { text: 'GitHub', link: 'https://github.com/cvhome-saas' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Core concepts', link: '/guide/core-concepts' },
          { text: 'Repositories', link: '/guide/repositories' },
        ],
      },
      {
        text: 'Architecture',
        items: [
          { text: 'System context', link: '/architecture/system-context' },
          { text: 'Containers', link: '/architecture/containers' },
          { text: 'store-core', link: '/architecture/store-core' },
          { text: 'store-pod', link: '/architecture/store-pod' },
          { text: 'Gateway routing', link: '/architecture/gateway-routing' },
          { text: 'Edge and custom domains', link: '/architecture/edge-spg' },
          { text: 'Authentication', link: '/architecture/authentication' },
          { text: 'Tenancy and provisioning', link: '/architecture/tenancy-provisioning' },
          { text: 'Deployment: AWS', link: '/architecture/deployment-aws' },
          { text: 'Deployment: local', link: '/architecture/deployment-local' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Merchant journey', link: '/guides/merchant' },
          { text: 'Shopper journey', link: '/guides/shopper' },
          { text: 'Platform admin', link: '/guides/platform-admin' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Local development', link: '/development/local-development' },
          { text: 'Configuration reference', link: '/development/configuration' },
          { text: 'Contributing', link: '/development/contributing' },
        ],
      },
      {
        text: 'Operations',
        items: [
          { text: 'Deploy to AWS', link: '/operations/deployment-guide' },
          { text: 'Pipeline and promotion', link: '/operations/pipeline' },
          { text: 'Hibernate, wake, destroy', link: '/operations/lifecycle' },
          { text: 'Monitoring and logs', link: '/operations/monitoring' },
          { text: 'Releases', link: '/operations/releases' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/cvhome-saas' }],
    editLink: {
      pattern: 'https://github.com/cvhome-saas/cvhome-saas.github.io/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
  mermaid: {
    // Diagrams use stroke-only classDefs so the theme's own foreground and background carry both modes.
  },
  mermaidPlugin: {
    class: 'mermaid',
  },
})
