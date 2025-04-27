---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "cvhome"
  text: "Open Source Multi-Tenant E-commerce Platform"
  tagline: Build Your Multi-Store E-commerce or SaaS on AWS. # Simpler tagline

  image: # Optional: Add a relevant logo or architecture diagram image
  # src: /logo.png
  # alt: cvhome Logo

  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction # Link to introduction first
    - theme: alt
      text: View Architecture
      link: /guide/architecture-overview # Direct link to architecture
    - theme: alt
      text: View on GitHub
      link: https://github.com/orgs/cvhome-saas # Link to your GitHub org

features:
  - title: Multi-Tenant Ready
    icon: 🏪 # Store icon
    details: Host multiple independent stores securely with shared or dedicated resources per tenant. # Simplified
  - title: Open Source & Flexible
    icon: 🛠️ # Wrench/Tool icon
    details: Fully open-source (Java, React, Angular). Customize, extend, and integrate freely. # Simplified
  - title: Self-Hosted on AWS
    icon: ☁️ # Cloud icon
    details: Deploy on your AWS account for complete control over data, security, and infrastructure. # Simplified
  - title: Scalable Architecture
    icon: 🚀 # Rocket icon
    details: Scales horizontally by adding isolated 'Store Pods' as your needs grow. # Simplified

---

<!-- You can add more markdown content here if needed -->