# Introduction: Why cvhome?

Welcome to cvhome, the open-source, multi-tenant e-commerce platform designed for scalability, control, and flexibility. It provides a robust foundation for organizations needing multiple storefronts or entrepreneurs building an e-commerce SaaS.

Built with a modern architecture (Java/Spring Boot, Next.js, Angular, PostgreSQL, Terraform, AWS), `cvhome` offers true multi-tenancy and the freedom of self-hosting.

## Who is cvhome for?

`cvhome` is ideal if you need to:

### 1. Manage Multiple Private Stores

Run distinct e-commerce operations (e.g., different brands, departments, franchises) efficiently and securely under one umbrella:

*   **Centralize Management:** Operate numerous storefronts from a single deployment.
*   **Self-Host for Control:** Deploy on your own AWS infrastructure for complete control over data and operations.
*   **Ensure Strong Isolation:** Utilize **Dedicated Store Pods** (separate services/DB per store) or **Shared Store Pods** (separate DB per pod) for security and performance boundaries.
*   **Maintain Brand Identity:** Easily map custom domains to individual storefronts.

### 2. Build an E-commerce SaaS Platform

Launch your own Software-as-a-Service business offering e-commerce stores to the public:

*   **Accelerate Development:** Use `cvhome` as the core multi-tenant engine for your SaaS.
*   **Offer Tiered Plans:** Leverage **Shared Pods** for cost-effective plans and **Dedicated Pods** for premium clients.
*   **Scale Horizontally:** Add more **Store Pods** as your customer base grows.
*   **Enable Customization & Billing:** Integrate billing (e.g., Stripe) and allow customers to use their own domains. As it's open-source, fully customize the platform for your unique offering.

## Key Advantages Summarized

*   **True Multi-Tenancy:** Flexible models (Shared/Dedicated Pods).
*   **Open Source:** Full transparency, no vendor lock-in.
*   **Self-Hosted:** Complete control over data, infrastructure, and security (on AWS).
*   **Scalable Architecture:** Designed to grow by adding more Store Pods.
*   **Strong Isolation:** Separate databases per pod enhance security and stability.

## Ready to Dive Deeper?

*   Understand the foundational design: **Core Concepts**
*   Explore the components: **Architecture Overview**
*   Deploy the platform: **AWS Deployment Guide**
*   Run it locally: **Local Setup Guide**