---
title: Core concepts
---

# Core concepts

The dozen terms the rest of the site relies on. Each has a longer treatment on its architecture page.

## Organization

An organization is the customer account that signs up and pays. It owns stores, has organization admins (who belong to no store's team but see every store of the org), and is what billing invoices and what a dedicated pod can be assigned to. The identifier is `ManagerOrgId`, kept by the tenancy service. A platform administrator can suspend, resume or close an organization, and suspending it suspends its stores. See [Tenancy and provisioning](/architecture/tenancy-provisioning).

## Store

A store is the tenant: one storefront, one catalog, one set of orders and customers, on its own domain. Its identifier is `StoreMerchantId`, a single 24-character id used identically by tenancy, billing, the gateway and every pod service, and almost every API takes it as the mandatory `store` query parameter so that every query is tenant-scoped by construction. The tenancy service records that a store exists and which pod hosts it; the pod owns the store's actual data. A store has languages, a currency, a theme, a subscription and a team of store admins and moderators. See [Tenancy and provisioning](/architecture/tenancy-provisioning).

## Pod

A pod is a physical deployment of the whole business layer: the Caddy edge, the merchant, content, catalog, inventory, checkout, payment and cua services and the storefront, with its own PostgreSQL database and its own service-discovery namespace. A pod hosts many stores; nothing in a pod is shared with another pod. Pods are either part of the shared pool or dedicated to one organization, and a pod's endpoint is `INTERNAL` (same cluster, reached through discovery) or `EXTERNAL` (a URL, possibly in another region or account). The first eight characters of a pod's id appear in every name derived from it: the namespace `store-pod-507f1f77.cvhome.lcl`, the domain `spg-507f1f77.gateway.com`, the gateway route `pod-507f1f77`. The pod registry owns pods, their health, capacity and placement decisions. See [store-pod](/architecture/store-pod) and [Tenancy and provisioning](/architecture/tenancy-provisioning).

## store-core and store-pod

The code base has two deployable trees. `store-core` is the platform layer and runs once: `uaa`, the platform gateway, tenancy, billing, pod-registry and the seller console. `store-pod` is the business layer and runs once per pod. A third tree, `store-commons`, holds the shared libraries (configuration slices, security, value objects, test support) and deploys nothing. A seller's request crosses both layers: the platform gateway authenticates it, then relays it under `/spg/**` into the pod that hosts the selected store, where the pod's edge routes it to the service. See [Containers](/architecture/containers), [store-core](/architecture/store-core) and [store-pod](/architecture/store-pod).

## Two identity servers: uaa and cua

Staff and shoppers never share an identity realm. `uaa`, in the platform layer, authenticates platform administrators, organization admins and merchants; it issues the tokens every service validates and the `client_credentials` tokens services use to call each other, and it serves its own admin console. `cua`, one per pod, authenticates storefront shoppers with one realm per store, so the same email address is a different shopper in each store; it renders no pages of its own and hands the storefront the login and registration forms to render. Pod services accept tokens from both issuers, with a ceiling on what a shopper token may confer. See [Authentication](/architecture/authentication).

## Edge, custom domains and on-demand TLS

Each pod has an edge, `spg`, a Caddy build with two organization-maintained plugins. When a request arrives, the `domain_lookup` middleware asks the pod's merchant service which store owns the host name and injects the store's id, theme, colors and languages as headers before routing the path to a service or to the storefront. When a browser connects over TLS to a domain the edge has no certificate for, Caddy asks the merchant service whether that domain belongs to a store in this pod and, if so, obtains a certificate on demand and stores it in the pod's S3 bucket so every edge task shares it. A merchant adds a custom domain in the console, points a CNAME at the pod, and the storefront answers on it. See [Edge and custom domains](/architecture/edge-spg).

## Gateway routing

The platform gateway is the console's only origin. It runs the OAuth2 login against `uaa`, holds the session, serves the console and the tenancy and billing APIs under their prefixes, and rebuilds one route per pod every minute from the pod registry: `/spg/**` with `store` and `pod` query parameters is stripped of its prefix and relayed, token and all, to that pod's edge. A newly created pod becomes reachable without redeploying anything. See [Gateway routing](/architecture/gateway-routing).

## Plans and quotas

Billing sells plans to stores. A plan has a price per month or year and quotas: stores, products, seats and storage. A new organization's first store gets a trial, unpaid stores are capped, upgrades apply immediately and downgrades at the end of the paid period, and Stripe webhooks are applied exactly once. The services a merchant uses enforce the quotas; a store whose subscription lapses keeps its storefront selling while its console is blocked. Platform administrators define the plans and see the book across every organization. See [store-core](/architecture/store-core).

## Environments and flavours

On AWS an environment is one deployment of the platform layer plus its pods, named by `env` and shaped by a `flavour`. `flavours.yaml` defines `dev`, `staging`, `prod` and `ephemeral`: task sizes, desired counts, autoscaling, whether RDS is shared between layers, backups, log retention, monitoring and CDN price class. `envs/<env>.tfvars` holds the human choices (flavour, image tag, test stores, availability zones); SSM holds what the bootstrap generated; precedence is flavour, then SSM, then tfvars. The service catalog Terraform deploys from, `services.yaml`, mirrors the application's own registry and is drift-checked in CI. See [Deployment: AWS](/architecture/deployment-aws) and the [configuration reference](/development/configuration).

## The local stack: lcl

`lcl` is the organization's public command-line runner for local stacks. From cvhome's `lcl.yml` it starts the compose infrastructure (PostgreSQL, MinIO and the pod edge in Docker), then every Java service and both frontends on the host, in dependency order, with health checks, per-service logs and an audit trail. Several named stacks run side by side by shifting every port by 1000, one stack per git worktree. The `test-stores` profile seeds two organizations with two stores each so a fresh stack has something to sign in to. See [Deployment: local](/architecture/deployment-local) and [Local development](/development/local-development).

---

*Source of truth: cvhome `.claude/skills/project-structure/SKILL.md`, `references/multi-tenancy.md`, `references/authentication.md`, `references/configuration.md`, `store-core/billing/billing-service/qa/billing-qa.md`, `lcl.yml`; cvhome-platform `flavours.yaml`, `services.yaml`, `README.md`; orchestrator `repos.yaml`.*
