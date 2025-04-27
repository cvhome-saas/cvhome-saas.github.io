# AWS Cleanup Guide (Destroying Deployment)

Use these steps to remove AWS resources created by the `cvhome` deployment pipelines.

**🔴 WARNING: IRREVERSIBLE ACTION 🔴**
*   Running these "Destroy" workflows **permanently deletes** infrastructure (databases, servers, etc.).
*   **All application data will be lost.**
*   Proceed only if you are sure you want to remove the entire deployment.


## Cleanup Steps (Order is Critical!)

1.  **Destroy Main Infrastructure (`cvhome-ecs-fargate-infra`):**
    *   Go to your forked `cvhome-ecs-fargate-infra` repo > **Actions**.
    *   Find and run the **"Trigger Destroy"** workflow (usually on the `main` branch).
    *   Wait for it to complete successfully.

![](/images/distroy-cvhome-ecs-infra.png)

## Verification (Optional)

*   After the workflow succeed, check the AWS Console (VPC, ECS, RDS, etc) in the deployment region to confirm resources are gone.

---