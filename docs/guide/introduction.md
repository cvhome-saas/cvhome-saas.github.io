---
title: Introduction
---

# Introduction

cvhome is an open-source, multi-tenant e-commerce platform that you run in your own AWS account. One deployment hosts many stores for many merchants, each on its own domain, with the isolation, billing and administration a hosted product needs. It evolved from the single-instance Shopizer code base into a multi-tenant SaaS and is licensed under Apache 2.0.

## Who it is for

**An operator running stores for merchants.** You offer e-commerce stores as a service. Merchants sign up, create stores, choose a plan, connect payments and point their domains at you. Shared pods keep entry plans cheap; a dedicated pod gives a premium customer its own isolated infrastructure. Billing through Stripe, plan quotas and the platform administration screens come with the platform.

**A company running its own stores.** Several brands, markets or franchises under one roof. You keep the multi-store machinery (one console, one identity for staff, a database per pod, custom domains per store) and simply do not sell plans to anyone else.

Both run the same software; the difference is who the organizations are.

## Three kinds of user

| User | Signs in through | Where |
|---|---|---|
| Platform administrator | `uaa`, the staff identity server | The platform section of the console and uaa's own admin console: organizations, pods, plans, platform billing, users |
| Merchant (organization admin, store admin, store moderator) | `uaa` | The seller console: catalog, content, storefront builder, orders, payments, domains, subscription, team |
| Shopper | `cua`, the shopper identity server, one realm per store | The storefront on the store's domain: browse, search, cart, checkout, account |

The [merchant](/guides/merchant), [shopper](/guides/shopper) and [platform admin](/guides/platform-admin) journeys walk through each.

## The shape

cvhome has two layers. The **platform layer** (`store-core`) runs once: staff identity (`uaa`), the platform gateway that owns the console's session, tenancy (organizations and stores), billing, the pod registry and the Angular seller console. The **business layer** (`store-pod`) runs once per **pod**: a Caddy edge that terminates TLS for custom domains, the merchant, content, catalog, inventory, checkout and payment services, the shopper identity server (`cua`) and the Next.js storefront, all sharing one database. Every **store** is a tenant inside a pod; the platform layer records which pod hosts which store, and that one fact decides where a store's data lives, which region serves its shoppers and which gateway route reaches it. Pods can be shared by many organizations or dedicated to one, and an external pod can live in another region or another account. The concepts are defined on [Core concepts](/guide/core-concepts) and the mechanics on [Tenancy and provisioning](/architecture/tenancy-provisioning).

## The stack

| Layer | Technology |
|---|---|
| Services | Java 25, Spring Boot 4.0, Spring Cloud, Spring Data JPA / Hibernate 7.2 and Spring Data JDBC, Spring Authorization Server (two instances: staff and shoppers) |
| Seller console | Angular 20 with server-side rendering |
| Storefront | Next.js 16 / React 19, one application with pluggable theme packages |
| Edge | Caddy with on-demand TLS, a domain-lookup middleware and S3 certificate storage (the pod edge); Spring Cloud Gateway (the platform edge) |
| Data | PostgreSQL, one schema per service, one database per layer and per pod; S3 or MinIO for media |
| Payments | Stripe, for platform subscriptions and as a store payment provider |
| Build | One Gradle build for the Java services and the npm frontends; buildpack images |
| Runtime | AWS ECS Fargate, Cloud Map, ALB and NLB, RDS, CloudFront, provisioned by Terraform from a one-click CloudFormation bootstrap; locally, `lcl` runs the same services on one machine |

## How to read this site

- **Architecture** — the system in context, the containers, the two layers, gateway routing, the edge and custom domains, authentication, tenancy and provisioning, and how the whole thing is deployed on AWS and locally. Start with [System context](/architecture/system-context).
- **Guides** — what each kind of user does: merchant, shopper, platform administrator.
- **Development** — running the stack on your machine with [lcl](/development/local-development), the [configuration reference](/development/configuration), and how to [contribute](/development/contributing).
- **Operations** — deploying to AWS, the pipeline and promotion, hibernating and destroying an environment, monitoring, and releases.

---

*Source of truth: cvhome `README.md`, `AGENTS.md`, `gradle/libs.versions.toml`, `.claude/skills/project-structure/SKILL.md`, `references/multi-tenancy.md`, `references/authentication.md`; cvhome-platform `README.md`; orchestrator `repos.yaml`.*
