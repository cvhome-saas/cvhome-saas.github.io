import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: "cvhome",
  description: "Open Source Multi-Tenant E-commerce Platform",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [ // Top navigation bar
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' }, // Point to Introduction as the start
      { text: 'GitHub', link: 'https://github.com/orgs/cvhome-saas' }
    ],

    sidebar: [
      {
        text: 'Guide', // General Introduction and Concepts
        items: [
          { text: 'Introduction', link: '/guide/introduction' }, // Why cvhome?
          { text: 'Core Concepts', link: '/guide/core-concepts' }, // Essential ideas
          { text: 'Architecture Overview', link: '/guide/architecture-overview' } // Moved here
        ]
      },
      {
        text: 'Development', // Renamed - Focus on local dev & contribution
        items: [
          { text: 'Local Setup', link: '/development/local-setup' }, // How to run locally
          { text: 'Contributing', link: '/development/contributing' } // How to contribute code
          // { text: 'Backend Details', link: '/development/backend' }, // Optional deeper dive
          // { text: 'Frontend Details', link: '/development/frontend' }, // Optional deeper dive
        ]
      },
      {
        text: 'Deployment', // Renamed - Focus on deploying to AWS
        items: [
          // { text: 'Deployment Overview', link: '/deployment/overview' }, // Removed - Assumed file deleted/empty
          { text: 'AWS Deployment Guide', link: '/deployment/aws-deployment-guide' }, // Renamed and corrected link
          { text: 'AWS Architecture', link: '/deployment/aws-architecture' },
          { text: 'Cleanup Guide', link: '/deployment/cleanup-guide' }, // Corrected text
          // { text: 'Monitoring & Logging', link: '/deployment/monitoring' }, // Optional
          // { text: 'Upgrading', link: '/deployment/upgrading' } // Optional
        ]
      },
      // { // Commented out until content is ready
      //   text: 'Customization',
      //   items: [
      //     { text: 'Theming', link: '/customization/theming' }, // How to change look and feel
      //     // { text: 'Plugin System', link: '/customization/plugins' }, // If applicable
      //     // { text: 'API Usage', link: '/customization/api-usage' } // How to interact programmatically
      //   ]
      // }
      // Optional: Add API Reference section if needed
      // {
      //   text: 'API Reference',
      //   items: [
      //     { text: 'REST API', link: '/api/rest-api' }
      //   ]
      // }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/orgs/cvhome-saas' }
    ]
  },
  mermaid: {
    // Mermaid options if needed
  },
  mermaidPlugin: {
    // Mermaid plugin options if needed
  },
})