# Architecture Overview

This document provides a high-level overview of the `cvhome` system architecture, focusing on its main components and
how they interact. Understanding this structure is essential for effective development and contribution.

For the foundational principles behind this design, please refer to the [**Core Concepts**](core-concepts.md).

## High-Level Structure: Core & Store Pods

As outlined in the Core Concepts, `cvhome` is fundamentally divided into two logical cluster types:

1. **The Core Cluster:** A single, central cluster managing shared functionalities like authentication, tenant (
   Organization) provisioning, Subscription management, and system administration.
   ```mermaid
        graph TD
        subgraph Core
        CoreGateway[Core Gateway]
        Auth[Auth Service]
        Manager[Manager Service]
        Subscription[Subscription Service]
        StoreUI[Store-ui Service]
        WelcomeUI[Welcome-ui Service]
        
                subgraph CoreResources[Core Resources]
                    CoreDB[(PostgresSQL)]
                end
            end
        
        %% Core cluster connections
        CoreGateway --> Auth
        CoreGateway --> Manager
        CoreGateway --> Subscription
        CoreGateway --> StoreUI
        CoreGateway --> WelcomeUI
        Core --> CoreResources
        ```

2. **Store Pod Clusters:** One or more independent clusters, each capable of hosting multiple e-commerce storefronts and
   their associated backend microservices. Each Store Pod operates with its own database.

```mermaid
graph TD
    subgraph Pod-N
        TLSGateway[TLS Gateway]
        PodGateway[Pod Gateway]
        Merchant[Merchant Service]
        Catalog[Catalog Service]
        Order[Order Service]
        Content[Content Service]
        LandingUI[Landing-ui Service]
        MerchantUI[Merchant-ui Service]

        subgraph PodResources[Pod Resources]
            PodDB[(PostgresSQL)]
        end
    end

%% Pod-N cluster connections
    TLSGateway --> PodGateway
    PodGateway --> Merchant
    PodGateway --> Catalog
    PodGateway --> Order
    PodGateway --> Content
    PodGateway --> LandingUI
    PodGateway --> MerchantUI
    Pod-N --> PodResources
```

## Inside the Core Cluster

The Core Cluster houses the central administrative and management services:

* **`auth` (Keycloak-based):** Handles admins authentication and authorization.
* **`manager`:** The core orchestration service. Responsible for:
    * Managing users and permissions within an Organization.
    * Allocating Stores to specific Store Pod Clusters (`store-pod-n`).
    * Configuring custom domains for stores (which `caddy` in the Store Pod will use).
* **`subscription`:** Manages subscription plans and billing (using Stripe) for Organizations.
* **`store-ui`:** The Angular-based user interface for cluster services.
* **`welcome-ui`:** A simple landing page service, primarily intended for public SaaS deployments to provide
  information, pricing, sign-up links, etc., to potential customers.
* **`gateway`:** The API Gateway provide main entry point for accessing the Cluster services.

## Inside a Store Pod Cluster

Each Store Pod is a microcosm of an e-commerce platform, containing the services needed:

* **`catalog`:** Manages product information, including categories, brands.
* **`order`:** Handles the e-commerce order lifecycle, including shopping carts, checkout processes, and order history.
* **`merchant`:** Manages store-specific configurations and settings, such as address, supported
  currencies/languages.
* **`content`:** Manages custom informational pages for a store (e.g., "About Us", "Terms & Conditions"). Stores page
  content, often as HTML strings, retrieved from the database.
* **`landing-ui`:** The customer-facing storefront application. Renders product
  listings, product details, handles user interactions like adding to cart and checkout.
* **`gateway`:** The API Gateway provide main entry point for accessing the Cluster services .
  identifies the target Store based on the request's domain (resolving it to a `storeId`).
* **`caddy`:**  The reverse proxy and entry point for every store
    * It automatically generates and renews TLS certificates for custom domains configured for stores and forwards
      traffic internally, typically to the `gateway`.
    * identifies the target Store based on the request's domain (resolving it to a `storeId`) before forward the traffic
      to the `gateway`.

## Communication Flow (Typical Storefront Request)

1. A user browser requests `https://store1.example.com`.
2. DNS resolves to the IP address of the Load Balancer fronting the Store Pod hosting this store.
3. The request hits **`caddy`**, which terminates TLS (having previously obtained a certificate based on configuration
   from the `manager`).
4. `caddy` inspects the `Host: store1.customdomain.com` header, determines the corresponding `storeId` forwards the
   request to the Store Pod **`gateway`**.
5. The `gateway` routes the request to the **`landing-ui` (Next.js)** service and other Store Pod services.
6. The Next.js application renders the page, making further API calls back through the **`gateway`** (which adds
   `storeId` context) to services like `catalog` or `content` to fetch necessary data. These backend services interact
   with the **Store Pod Database**, scoping queries by `storeId`.

## Code Structure: Monorepo

The source code for all microservices (Core and Store Pod) resides in a single **monorepo**.

![](/images/mono-repo.png)

* For details on setting up your local environment, see the **Local Development Setup Guide**.

## Technology Stack Overview

The `cvhome` platform leverages a modern technology stack:

* **Backend Microservices:**
    * **Language:** Java 23+
    * **Framework:** Spring Boot , Spring Cloud
    * **Build Tool:** Gradle
    * **Containerization:** Docker
* **Frontend UIs:**
    * **Storefront (`landing-ui`):** Next.js
    * **Admin/Management (`store-ui`, `welcome-ui`, `merchant-ui`):** Angular
* **Databases:** Postgres SQL
* **API Gateway:** Spring Cloud Gateway
* **Edge Routing / TLS:** Caddy Server
* **Authentication/Authorization:** Keycloak
* **Infrastructure Provisioning:** Terraform
* **Deployment Target:** AWS

## Project Structure

The `cvhome` platform utilizes multiple repositories for code and infrastructure:

1. **Application Code (`cvhome`):** Contains the application source code (microservices, UIs).
2. **Infrastructure Pre-configuration (`cvhome-repo`):** Manages Production configuration (Terraform).
3. **AWS Infrastructure Deployment (`cvhome-ecs-fargate-infra`):** Deploys the main AWS infrastructure (
   Terraform).![](/images/all-repo.png)
   *Note: The infrastructure repositories (`cvhome-repo`, `cvhome-ecs-fargate-infra`) are separate, not needed for local
   development, but are essential for the AWS deployment sections.*

---