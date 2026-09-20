---
title: Deploy to AWS
---

# Deploy to AWS

From an empty account to a signed-in console: the one-click bootstrap and the first pipeline run.

::: info Being written
This page is part of the architecture rewrite and is filled in by a later commit of the same pull request.
:::

## Screenshots from the previous guide

These were captured on the 1.x bootstrap. They are re-checked against the current stack in a later commit;
until then they show the shape of the console screens, not their exact contents.

![The Launch Stack button in the cvhome-platform README](/images/aws/legacy-launch-stack-button.png)

![CloudFormation: the stack parameters form](/images/aws/legacy-cloudformation-parameters.png)

![CodeBuild: the build projects the bootstrap creates](/images/aws/legacy-codebuild.png)

![ECR: one repository per service image](/images/aws/legacy-ecr-repo.png)

![ECS: the core cluster and one cluster per pod](/images/aws/legacy-all-ecs-clusters.png)

![CodeBuild: the apply stage prints the console URL](/images/aws/legacy-infra-output.png)

---

*Source of truth: cvhome-platform `bootstrap/bootstrap.yaml`, `README.md`, `qa/platform-qa.md`.*
