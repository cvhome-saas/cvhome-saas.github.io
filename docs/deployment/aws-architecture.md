# AWS Deployment Architecture

This document provides a simplified overview of the AWS architecture used for deploying the `cvhome` multi-tenant platform.

## Overview

The architecture uses managed AWS services to create a scalable, highly available, and secure environment for running the application's containerized microservices and frontends via AWS Fargate.

![](/images/aws-arch.png)

## Main Components & Purpose

*   **Compute (AWS Fargate + Amazon ECS):**
    *   Runs the application containers (API Gateway, backend services, frontends) without needing to manage servers.
    *   Orchestrates the deployment and scaling of these containers.

*   **Networking (Amazon VPC, Application Load Balancer, AWS Route 53, AWS CloudMap):**
    *   Provides an isolated network environment (VPC).
    *   Distributes incoming web traffic to the correct containers, handles SSL/TLS (ALB).
    *   Manages DNS records, routing traffic for the main platform domain and tenant-specific domains/subdomains to the ALB (Route 53).
    *   Internal service to service communication using CloudMap

*   **Data Storage (Amazon RDS + Amazon S3):**
    *   Provides a managed PostgresSQL database for application data (tenants, products, orders, etc.) (RDS).
    *   Stores static files like images, assets, and tenant customizations (S3).


## Key Benefits of this Architecture

*   **Scalability:** Services can scale automatically based on demand.
*   **High Availability:** Uses multiple Availability Zones to minimize downtime.
*   **Security:** Leverages AWS security features for network isolation, access control, and secrets management.
*   **Reduced Operational Overhead:** Relies on managed services, reducing the need for server patching and maintenance.
*   **Multi-Tenancy Ready:** Designed to handle custom domains/subdomains for different tenants via Route 53 and NLB.

---

*This is a high-level view. For specific configuration details, refer to the deployment guide and the infrastructure code.*