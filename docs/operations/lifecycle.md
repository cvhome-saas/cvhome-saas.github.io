---
title: Hibernate, wake, destroy
---

# Hibernate, wake, destroy

Pausing an environment without losing it, bringing it back, and tearing it down.

A dev environment nobody is using still bills for Fargate tasks, load balancer hours, the NAT and a database.
Hibernating destroys everything charged by the hour and keeps everything holding state; waking reverses it;
destroying removes the environment. All three are CodeBuild projects the bootstrap stack created, and the first
two are also scripts you can run from a laptop.

## Hibernate

```bash
# CodeBuild: start the <project>-<env>-hibernate project, or from a cvhome-platform checkout:
PROJECT_ID=<project> AWS_REGION=<region> TF_STATE_BUCKET=<bucket> scripts/hibernate.sh <env>
```

| Destroyed | Kept |
|---|---|
| ECS services and tasks | RDS instances, **stopped**, not deleted |
| The ALB and every pod's NLB, with their target groups | S3 buckets: media (`cdn`), Caddy certificates (`certs`), logs |
| The NAT gateway (prod) or NAT instance (below prod) | CloudFront distributions |
| The Route53 records that alias the load balancers | Secrets Manager secrets, ECR images |
| The CloudWatch dashboard | VPC, subnets, Cloud Map namespaces, ECS clusters |

Nothing the application can observe changes across the cycle. The RDS endpoint survives because the instance
is stopped, not replaced; the CloudFront domain survives, so media URLs already stored in the database still
resolve; the hostnames survive because the records are aliases and come back with the load balancers. While
asleep the hostnames do not resolve at all. The dashboard names load balancers and services by ARN suffix,
which do not exist while hibernated, so it goes with them and is recreated under the same name on wake.

What the script does, in order:

1. Writes `true` to SSM `/<project>/<env>/hibernated` before anything is destroyed, so the keeper knows the
   intent even if the run dies halfway.
2. `terraform apply -var="hibernated=true"` against the environment state. Every compute resource is gated on
   `compute_enabled = !var.hibernated`, so the apply removes them and leaves the rest.
3. `aws rds stop-db-instance` for every instance tagged with the project and environment. Terraform cannot
   express run state, so this is an API call Terraform is never told about.

**The order is asymmetric on purpose.** Hibernate destroys compute first, then stops the databases, because
RDS rejects a stop while connections are open. Wake starts the databases and waits for them before creating
services, because a service that starts against a database still booting fails its health check and is rolled
back by the deployment circuit breaker.

**The seven-day limit.** AWS restarts a stopped RDS instance after seven days and offers no opt-out. The
bootstrap stack creates a keeper Lambda on a `rate(1 day)` EventBridge schedule that reads
`/<project>/<env>/hibernated` and re-stops any instance of the environment that AWS has woken. Without it a
hibernated environment would quietly pay for database compute again on day eight.

**Protected flavours refuse.** `main.tf` fails the plan when `hibernated` is true on a flavour with
`protected: true` (prod): its load balancers have deletion protection on, which Terraform cannot disable and
delete in one apply, and an environment worth protecting is not one to put to sleep.

**Storage cost continues.** RDS storage and backups, S3, ECR, Secrets Manager, the hosted zone and one Route53
private hosted zone per Cloud Map namespace keep billing. What stops is Fargate tasks, load balancer hours,
NAT hours and the NAT's public address, which is the bulk of an idle environment's bill.

## Wake

```bash
# CodeBuild: start the <project>-<env>-wake project (90 minute timeout), or:
PROJECT_ID=<project> AWS_REGION=<region> TF_STATE_BUCKET=<bucket> scripts/wake.sh <env>
```

1. Writes `false` to `/<project>/<env>/hibernated` first, so the keeper does not stop the instance the script
   is about to start.
2. `aws rds start-db-instance` for every stopped instance of the environment, then
   `aws rds wait db-instance-available` on each. A cold start is usually under ten minutes; a version upgrade
   applied at start time can take considerably longer. If no instance is found the script exits 1 and tells you
   to run the pipeline instead.
3. `terraform apply -var="hibernated=false"`, which recreates the load balancers, the NAT, the records, the
   dashboard and the services. Below prod the apply also waits for the NAT instance to report ready before any
   task lands in a private subnet, which needs the AWS CLI wherever Terraform runs.
4. Prints `console_url`.

Terraform finishing is not the environment being ready: it returns when ECS accepts the deployments, and
Spring services take a minute or two beyond that. Watch with
`aws ecs describe-services --cluster <cluster> --services <service> --query 'services[].deployments'`.

A lighter alternative for a known daily shape is an autoscaling schedule (`schedules` in the flavour or a
`flavour_overrides` block) that scales services to zero overnight: the URL, the load balancer and the database
stay up while no tasks are paid for.

## Destroy

Start the `<project>-<env>-destroy` CodeBuild project. It runs `terraform destroy` against the environment
state with the same variables `3-apply` used (`envs/<env>.tfvars`, falling back to `envs/dev.tfvars`).

What that removes is everything the environment root created: the VPC, both clusters, every service, the
load balancers, the RDS instances (prod's have `deletion_protection: true` and `skip_final_snapshot: false`, so
a destroy there stops on the database until protection is lifted and takes a final snapshot), the S3 buckets
(force-destroyed only where the flavour is not `protected`), the CloudFront distributions and the records.

What survives a destroy:

- The **prereq state** and what it created: the ECR repositories with their images and the two ACM
  certificates. The destroy project only targets `env/<env>/terraform.tfstate`.
- The **bootstrap stack** and everything in it: the state bucket (`DeletionPolicy: Retain`, so it survives even
  deleting the stack), the three secrets, the SSM parameters, the roles, the CodeBuild projects and the keeper.
  Delete the stack separately when the environment is gone for good; the state bucket then has to be emptied
  and removed by hand.

The QA cases for all three operations are in cvhome-platform `qa/platform-qa.md` (sections 04 and 05).

---

*Source of truth: cvhome-platform `README.md`, `scripts/hibernate.sh`, `scripts/wake.sh`,
`bootstrap/bootstrap.yaml` (HibernateProject, WakeProject, DestroyProject, HibernationKeeper*), `main.tf`,
`flavours.yaml`, `qa/platform-qa.md`.*
