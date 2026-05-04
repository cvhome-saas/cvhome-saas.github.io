# Core Concepts

Understanding these fundamental concepts is key to working effectively with `cvhome`.

## 1. Dual Cluster Architecture: Core & Store Pods

`cvhome` uses a distinct two-part architecture: a central **Core Cluster** and one or more **Store Pod Clusters**. This separation allows centralized management while enabling scalable and isolated e-commerce operations.

### Core Cluster

The administrative hub of the deployment, handling shared, cross-cutting concerns.

*   **Key Functions:** Manages authentication, tenant creation/configuration, subscription management, and provides central admin APIs/UI.
*   **Database:** Has its **own dedicated database instance**.

### Store Pod Clusters (`store-pod-1` to `store-pod-n`)

Self-contained, deployable units running the actual e-commerce storefronts and related backend services.

*   **Key Functions:** Hosts storefront UIs (e.g., Next.js), handles store-specific APIs (catalog, orders), manages domain routing to tenants, and often includes edge routing/TLS termination (e.g., via Caddy).
*   **Database:** Crucially, **each Store Pod has its own independent database instance**, separate from the Core and other Pods. This is fundamental to the isolation model.

## 2. Flexible Multi-Tenancy Models

`cvhome` supports different ways to host tenants (stores) within the Store Pod architecture:

### Dedicated Store Pod Model

*   **Concept:** An entire `store-pod-x` cluster is allocated to a single tenant.
*   **Best For:** Tenants needing maximum performance, resource guarantees, and isolation.
*   **Benefit:** High isolation (services & database), predictable performance.
*   **Consideration:** Higher cost per tenant.

### Shared Store Pod Model

*   **Concept:** A single `store-pod-x` cluster hosts multiple tenants.
*   **Best For:** Scenarios prioritizing cost-efficiency and resource sharing (e.g., smaller clients, public SaaS).
*   **How it Works:** Services within the pod handle data for multiple tenants, relying on application logic and tenant identifiers for separation within the shared pod database.
*   **Benefit:** Cost-effective, efficient resource use.
*   **Consideration:** Relies on logical data separation; potential for resource contention ("noisy neighbor").

The choice allows tailoring deployments based on tenant needs and cost.
---

*This document outlines the core architectural ideas. Specific service implementations and the technology stack are detailed in the Architecture Overview.*