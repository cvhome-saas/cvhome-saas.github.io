# AWS Cleanup Guide (Destroying Deployment)

Use these steps to remove AWS resources created by the `cvhome` deployment pipelines.

**🔴 WARNING: IRREVERSIBLE ACTION 🔴**
*   Running the "Destroy" pipeline **permanently deletes** infrastructure (databases, servers, etc.).
*   **All application data will be lost.**
*   Proceed only if you are sure you want to remove the entire deployment.


## Cleanup Steps

1.  **Navigate to CodeBuild:** Go to the AWS CodeBuild console.
2.  **Start Destroy Build:** Find the project named `cvhome-destory` and click **"Start build"**.

3.  **Wait for Completion:** This pipeline triggers a `terraform destroy` which will remove all provisioned resources. Wait for the build to complete successfully.

## Verification (Optional)

*   After the build succeeds, check the AWS Console (VPC, ECS, RDS, etc.) in your deployment region to confirm resources are gone.

---