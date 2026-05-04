# AWS Deployment Guide

This guide details the steps required to deploy the `cvhome` platform to AWS. The process has been simplified using a CloudFormation "Launch Stack" button which sets up the necessary CodeBuild pipelines for building, deploying, and destroying the infrastructure.

## Prerequisites

Before starting the deployment, ensure you have the following:

1. **AWS Account:** Access to an AWS account with sufficient permissions.
2. **Domain Registered in Route 53:** A hosted zone for your domain must exist in Route 53.
3. **GitHub Account:** Your GitHub account where the `cvhome` repositories will be accessed.
4. **Stripe Account (Optional):** If you intend to use subscription/billing features, have your Stripe API key ready.

## Deployment Steps

Follow these steps to deploy the application:

### Step 1: Launch the Bootstrap Stack

The deployment starts with the `cvhome-bootstrap` repository.

1.  **Launch Stack:** Go to the `cvhome-bootstrap` repository's README and click on the **"Launch Stack"** button. This will take you to the AWS CloudFormation console.

    ![](/images/launch-stack-button.png)

2.  **Fill Parameters:** Provide the following information in the CloudFormation "Create stack" wizard:
    *   **DomainZoneId:** Select the Route53 hosted zone for your application.
    *   **PodCount:** Number of pods to create (0-20, default: 0).
    *   **PodSize:** Size of the pod (`small`, `medium`, `large`, or `x-large`).
    *   **PodAutoScale:** Enable or disable pod auto scaling (`true`/`false`).
    *   **isProd:** Set to `true` for Production or `false` for Dev environment.
    *   **isMonitoring:** Enable or disable monitoring (`true`/`false`).
    *   **allowTestStores:** Allow test stores (`true`/`false`).
    *   **GithubAccount:** Your GitHub account name for deployments.
    *   **Branch:** The branch to deploy (default: `main`).
    *   **StripeKey (Optional):** Your Stripe API key.

    ![](/images/cloudformation-parameters.png)

3.  **Create Stack:** Complete the wizard and wait for the CloudFormation stack to be created. This stack sets up three CodeBuild pipelines.

    ![](/images/codebuild.png)

### Step 2: Build and Push Images (`cvhome-build`)

Once the bootstrap stack is ready, you need to build the application images.

1.  **Navigate to CodeBuild:** Go to the AWS CodeBuild console.
2.  **Start Build:** Find the project named `cvhome-build` and click **"Start build"**.

    ![](/images/codebuild.png)

3.  **Monitor:** This pipeline builds the Docker images and pushes them to the Amazon Elastic Container Registry (ECR). Wait for it to complete successfully.

    ![](/images/ecr-repo.png)

### Step 3: Deploy Infrastructure (`cvhome-deploy`)

After the images are pushed, you can deploy the main infrastructure.

1.  **Start Deploy:** In the AWS CodeBuild console, find the project named `cvhome-deploy`.
2.  **Trigger Apply:** Click **"Start build"**. This pipeline triggers a `terraform apply` to provision the VPC, ECS clusters, RDS, and other resources.

    ![](/images/codebuild.png)

3.  **Wait for Completion:** This is the longest step and may take 15-30 minutes.

    ![](/images/all-ecs-clusters.png)

## Accessing the Application

After `cvhome-deploy` finishes successfully:
1.  Check the logs of the `cvhome-deploy` build.
2.  Look for the **Terraform Outputs** section to find the URLs for your deployed application.

![](/images/infra-output.png)