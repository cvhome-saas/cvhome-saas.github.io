---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "cvhome"
  text: "Open-source multi-tenant e-commerce platform"
  tagline: Run many stores for many merchants, in your own AWS account.
  image:
    src: /logo.png
    alt: cvhome logo
  actions:
    - theme: brand
      text: Get started
      link: /guide/introduction
    - theme: alt
      text: Architecture
      link: /architecture/system-context
    - theme: alt
      text: Deploy to AWS
      link: /operations/deployment-guide
    - theme: alt
      text: GitHub
      link: https://github.com/cvhome-saas

features:
  - title: Multi-tenant by design
    icon: 🏪
    details: An organization owns stores; each store is a tenant placed in a pod. Stores in a shared pool, or a pod of their own.
  - title: Two layers
    icon: 🧱
    details: A platform layer runs once and holds identity, tenants, plans and routing. A business layer runs once per pod and holds the stores' own data.
  - title: Your AWS account
    icon: ☁️
    details: One CloudFormation stack bootstraps the pipeline; Terraform builds the environment on ECS Fargate. Nothing is hosted for you.
  - title: Local in one command
    icon: 💻
    details: lcl start brings the whole platform up on a laptop, with seeded demo stores to sign into.
---
