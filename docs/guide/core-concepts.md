# Core Concepts

Understanding these fundamental concepts is key to working effectively with `cvhome`.

## 1. Dual Cluster Architecture: Core & Store Pods

`cvhome` uses a distinct two-part architecture: a central **Core Cluster** and one or more **Store Pod Clusters**. This separation allows centralized management while enabling scalable and isolated e-commerce operations.

### Core Cluster

The administrative hub of the deployment, handling shared, cross-cutting concerns.

*   **Key Functions:** Manages authentication (e.g., via Keycloak), tenant creation/configuration, subscription management, and provides central admin APIs/UI.
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

## 3. Resource Isolation (Database & Services)

Strong isolation, particularly at the database level, is a core principle.

### Database Isolation

*   **Key Point:** The Core Cluster and **each individual Store Pod Cluster** have their **own, completely separate database instances** (e.g., PostgreSQL).
*   **Benefit:** Provides a strong physical boundary for data, enhancing security, performance, and fault tolerance. Issues in one pod's database don't directly affect others.

### Service Isolation

*   **Dedicated Pods:** Offer high service isolation, as service instances (compute, memory) within the pod serve only one tenant.
*   **Shared Pods:** Service instances are shared. Isolation is primarily **logical**, enforced by application code ensuring tenant data privacy within shared services.

This focus on isolation improves security, stability, and scalability.

---

*This document outlines the core architectural ideas. Specific service implementations and the technology stack are detailed in the Architecture Overview.*