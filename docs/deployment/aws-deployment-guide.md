# AWS Deployment Guide (Using GitHub Actions)

This guide details the steps required to deploy the `cvhome` platform to AWS using the pre-configured GitHub Actions
workflows within the project repositories. This process automates much of the infrastructure provisioning and
application deployment.

## Prerequisites

1. **AWS Account**
2. **Domain Registered in Route 53**
    * ![](/images/domain.png)
3. **ACM Certificate:**
    * You need a **validated AWS Certificate Manager (ACM) SSL/TLS certificate** for your domain (and potentially its
      subdomains, e.g., using a wildcard like `*.example.com` and the apex `example.com`).
    * This certificate **must be in the same AWS region** where you plan to deploy `cvhome`.
    * ![](/images/certificate.png)
4. **GitHub Organization:** A GitHub organization is strongly recommended.
5. **Forked Repositories:** Fork all three `cvhome` repositories **into your GitHub organization**:
    * `cvhome` (Application Code)
    * `cvhome-bootstrap` (Infrastructure Prerequisites & Configuration)
    * `cvhome-ecs-fargate-infra` (Main Infrastructure Deployment)
    * *Ensure you fork them directly into the organization.*
    * ![](/images/all-repo.png)
6. **GitHub Actions Secrets Configured:** Configure the following secrets at the **Organization level** (*Settings* >
   *Secrets and variables* > *Actions* > *Repository secrets* tab > *New organization secret* button). Make them
   available to **all three forked repositories**:
    * `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
    * `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
    * `AWS_REGION`: The AWS region where you want to deploy.
    * ![](/images/env.png)
7. **Stripe Account (Optional):** If you intend to use the subscription/billing features

## Deployment Steps

Follow these steps sequentially. **Do not proceed to the next step until the current one completes successfully.**

### Step 1: Run Infrastructure Prerequisites (`cvhome-bootstrap`)

This step uses Terraform via GitHub Actions to create foundational resources (ECR, IAM policies) and sets up crucial
configuration parameters in AWS Parameter Store.

1. **Trigger Workflow:**
    * Navigate to your forked `cvhome-bootstrap` repository in GitHub.
    * Go to the **Actions** tab.
    * Find the workflow typically named **"Trigger Apply"**.
    * Click on the workflow name.
    * Click the **"Run workflow"** dropdown button.
    * Ensure the correct branch `main` branch is selected.
        * Click the green **"Run workflow"** button.![](/images/trigger-cvhome-bootstrap.png)
2. **Monitor:** Wait for the workflow to complete successfully. Check the logs for any errors.
3. **Verification (AWS Console):**
   * Log in to your AWS Console in the specified region (`AWS_REGION`).
   * **Check ECR:** Navigate to **Elastic Container Registry (ECR)**. Verify that repositories for the microservices (
     e.g., `store-core/auth`, `store-core/manager`, etc.) have been created. ![](/images/ecr-repo.png)
   * **Check Parameter Store:** Navigate to **Systems Manager > Parameter Store**. Verify that parameters exist, especially
     the `config/cvhome`,`config/domain` parameter, and ensure it has the correct value
     you configured.![](/images/parameter-store.png)
4. **Configure Parameters:** Before running the workflow, you might need to customize deployment
   parameters (like your domain name, Stripe keys, pod settings) **`Please Check Configuration section for more detail`**.
    * **Configure Domain (Required)** ![](/images/config-domain.png)
    * **Configure Stripe (Optional)** ![](/images/config-stripe.png)

### Step 2: Build and Push Application Images (`cvhome`)

This step builds the Docker images for all microservices and pushes them to the ECR repositories created in Step 1.

1. **Identify Image Tag:**
    * In your forked `cvhome` repository, navigate to the root directory.
    * Open the `gradle.properties` file.
    * Find the `version` property (e.g., `version=0.2.12`).
    * **Note down this exact version string.** This will be the Docker image tag used for
      deployment. ![](/images/version.png)
2. **Trigger Workflow:**
    * Navigate to your forked `cvhome` repository in GitHub.
    * Go to the **Actions** tab.
    * Find the workflow typically named **"Trigger Publishing To Private ECR"** or similar.
    * Click on the workflow name.
    * Click the **"Run workflow"** dropdown button.
    * Ensure the correct branch usually `main` is selected.
    * Click the green **"Run workflow"** button. ![](/images/trigger-cvhome.png)
3. **Monitor:** Wait for the workflow to complete successfully. Check the logs for any errors, especially during the
   image push steps.
4. **Verification (AWS Console):**
* Log in to your AWS Console in the specified region.
* **Check ECR Images:** Navigate to **ECR**. Click on one of the repositories created in Step 1 (e.g.,
  `store-core/store-core-gateway`). Verify that an image with the **exact tag** you noted from `gradle.properties` (
  e.g.,
  `0.2.12`) now exists in the repository. Check a few different repositories. ![](/images/core-gateway-image-tag.png)

### Step 3: Deploy Main Infrastructure (`cvhome-ecs-fargate-infra`)

This step deploys the core AWS infrastructure (VPC, ECS, RDS, Load Balancers, etc.) and runs the application containers
using the images pushed in Step 2. **This is the longest step.**

1. **Trigger Workflow:**
    * Navigate to your forked `cvhome-ecs-fargate-infra` repository in GitHub.
    * Go to the **Actions** tab.
    * Find the workflow typically named **"Trigger Apply"**.
    * Click on the workflow name.
    * Click the **"Run workflow"** dropdown button.
    * Ensure the correct branch `main` is selected.
    * **Provide Image Tag:** You will likely see an input field labeled `docker image tag`. **Enter
      the exact image tag/version** you noted from `gradle.properties` in Step 2.
    * Click the green **"Run workflow"** button. ![](/images/trigger-cvhome-ecs-infra.png)
2. **Monitor and Verify:**
    * Wait for the workflow to complete successfully. This step provisions significant infrastructure and can easily
      take **15-30 minutes or longer**.
    * Monitor the logs closely, especially the `terraform apply` steps, for any errors.
3. **Verification (Workflow Output & AWS Console):**
* **Primary Check - Workflow Output:**
  * Go to the completed workflow run for **"Trigger Apply"** in the `cvhome-ecs-fargate-infra` repository's
  Actions tab.
  * Click on the completed job (often named `apply` or `deploy`).
  * Look for a step named **"Run terraform output"**.
  * Expand this step's logs. It will display key URLs. **These URLs are the primary way to access your
  application.**
* **Secondary Check - AWS Console (Optional / Troubleshooting):**
  * Log in to your AWS Console in the specified region.
  *   **Check ECS Services:** Navigate to **Elastic Container Service (ECS)**. You should see at least two clusters![](/images/all-ecs-clusters.png)
  *   **Verify Each Cluster:** For each cluster, Select your cluster you should see all services are in `ACTIVE` state. 
  * **Core**![](/images/core-cluster.png)
  * **Pod**![](/images/pod-cluster.png)
  *   **Check RDS:** Navigate to **RDS > Databases**. Verify your database instance exists and its status is
      `Available`.![](/images/databases.png)

## Accessing the Deployed Application

Once Step 3 completes successfully, the application should be deployed.

1. **Find Output URLs:**
    * Go to the completed workflow run for **"Trigger Apply"** in the `cvhome-ecs-fargate-infra` repository's Actions
      tab.
    * Click on the completed job (often named `apply` or `deploy`).
    * Look for a step named **"Run terraform output"**.
    * Expand this step's logs. It will display key URLs:![](/images/infra-output.png)