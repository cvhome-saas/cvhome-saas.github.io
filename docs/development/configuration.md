---
title: Configuration reference
---

# Configuration reference

Services and ports, the configuration slices, image names and tags, the AWS catalog and flavours, and the essentials of `lcl.yml`. How the containers fit together is on [Containers](/architecture/containers); how the AWS side consumes these files is on [Deployment: AWS](/architecture/deployment-aws).

## Services and ports

`store-commons/autoconfigure/src/main/resources/common-config.yml` is the registry of every service: name, domain, port, namespace and the edge that fronts it. Fifteen services are registered.

| Service | Layer | Port | Runtime | Image | Fronted by |
|---|---|---|---|---|---|
| `store-core-gateway` | store-core | 8000 | Spring (WebFlux) | `store-core/store-core-gateway` | itself (the platform edge) |
| `uaa` | store-core | 8001 | Spring | `store-core/uaa` | gateway (`/uaa`), and its own host `uaa.gateway.com` |
| `console-ui` | store-core | 8011 | Node (Angular SSR) | `store-core/console-ui` | gateway |
| `tenancy` | store-core | 8020 | Spring | `store-core/tenancy` | gateway (`/tenancy`) |
| `billing` | store-core | 8021 | Spring | `store-core/billing` | gateway (`/billing`) |
| `pod-registry` | store-core | 8022 | Spring | `store-core/pod-registry` | gateway |
| `spg` | store-pod | 80, 443, 2019 | Caddy | `store-pod/spg` | itself (the pod edge) |
| `landing-ui` | store-pod | 8110 | Node (Next.js) | `store-pod/landing-ui` | spg (everything not matched by a service path) |
| `merchant` | store-pod | 8120 | Spring | `store-pod/merchant` | spg (`/merchant`) |
| `content` | store-pod | 8121 | Spring | `store-pod/content` | spg (`/content`) |
| `catalog` | store-pod | 8122 | Spring | `store-pod/catalog` | spg (`/catalog`) |
| `checkout` | store-pod | 8123 | Spring | `store-pod/checkout` | spg (`/checkout`) |
| `cua` | store-pod | 8124 | Spring | `store-pod/cua` | spg (`/cua`, prefix preserved) |
| `payment` | store-pod | 8125 | Spring | `store-pod/payment` | spg (`/payment`) |
| `inventory` | store-pod | 8126 | Spring | `store-pod/inventory` | spg (`/inventory`) |

A port is a service's internal address. From outside its namespace a service is reached only as a path on its edge: `http://spg-507f1f77.gateway.com/merchant/api/v1/...` rather than `merchant.gateway.com:8120`. Two fields in the registry do runtime work: `namespace` (`store-core.cvhome.lcl` or `store-pod-<shortId>.cvhome.lcl`) tells `ServiceUrlBuilder` whether a call can go direct or must go through the edge, and `gateway-service-name` names that edge. `server.port` is not set per service; `common-config.yml` derives it as `${com.asrevo.cvhome.services.${spring.application.name}.port}`.

## The composition rule

Configuration is not duplicated per service. The shared YAML ships inside the `store-commons:autoconfigure` jar and each service imports slices from the classpath:

```
common-config.yml              always: the registry above plus every platform-wide default
lcl-config.yml                 environment slice, local
fargate-config.yml             environment slice, AWS
store-core-lcl-config.yml      layer slice, store-core, local
store-pod-lcl-config.yml       layer slice, store-pod, local
store-pod-fargate-config.yml   layer slice, store-pod, AWS
```

**`common-config` (always) + one environment slice + one layer slice.** There is deliberately no `store-core-fargate-config.yml`: store-core needs nothing on AWS beyond what `fargate-config.yml` sets.

| | Local | AWS |
|---|---|---|
| store-core service | `lcl-config` + `store-core-lcl-config` | `fargate-config` |
| store-pod service | `lcl-config` + `store-pod-lcl-config` | `fargate-config` + `store-pod-fargate-config` |

What each slice carries:

- **`common-config.yml`** — the service registry; the app domain (`gateway.com`) and pod domain; the `uaa` OAuth2 client (`web-app`) and provider endpoints; the `uaa` issuer every service trusts; datasource, Hikari and Hibernate defaults; the actuator exposure (`health,info,prometheus`); OpenTelemetry resource attributes; `crypto.type: LOCAL`.
- **`lcl-config.yml`** — the local datasource (`jdbc:postgresql://localhost:5432/cvhome`) and `spring.cloud.discovery.client.simple.instances`, one `http://localhost:<port>` entry per service, so `lb://catalog` resolves with no discovery infrastructure.
- **`fargate-config.yml`** — the datasource built from per-task `spring.datasource.host/port/database`, eager load-balancer clients, and `spring.cloud.ecs.discovery` (Cloud Map namespace, `service-ports`) that activates the `ecs-service-discoveryclient` module.
- **`store-pod-lcl-config.yml` / `store-pod-fargate-config.yml`** — the multi-issuer JWT list (`uaa` for staff, `cua` for shoppers, with `grants` capping what a shopper token may confer). The local one also configures MinIO as the storage provider and the pod's own identity (`pod-info.pod`).
- **`store-core-lcl-config.yml`** — the pods store-core knows about locally: one entry, `507f1f77bcf86cd799439011`, endpoint `http://spg-507f1f77.gateway.com`, type `EXTERNAL`. In production this list comes from pod-registry, not from a file.

A service's own `application.yml` sets only `spring.application.name`, its `s2s` client, its schema and its own settings. The block key in `common-config.yml` must equal `spring.application.name`; that is what ties the port, the schema (`hikari.schema: ${spring.application.name}`) and the discovery entry together. Profiles are `lcl`, `fargate` and `test-stores` (seeds the demo stores).

Registering a new service means four files in cvhome (`settings.gradle`, `common-config.yml`, `lcl-config.yml`, `fargate-config.yml`) plus a block in `lcl.yml` and a route on its edge, and a mirrored entry in cvhome-platform's `services.yaml`. cvhome-platform's CI runs `scripts/check-catalog-drift.py`, which fails when the two repositories disagree on names, ports, `service-ports` or image paths.

## Images and tags

Every deployable builds its image with `bootBuildImage`, named by the shared build-logic helpers:

```groovy
imageName = createImageName("store-pod/catalog", project.version)
tags      = createImageTags("store-pod/catalog", project.version)
```

`createImageName` prefixes the repository with the `REGISTRY` environment variable when set, so the same build pushes to any ECR. The tag set depends on the version:

| `project.version` | Tags |
|---|---|
| `X.Y.Z` (CI, from the git tag) | `X.Y.Z`, `X.Y`, `latest` |
| `*-SNAPSHOT` (every local build) | `latest` only |

`gradle.properties` says `0.0.0-SNAPSHOT` permanently; a release is a `vX.Y.Z` tag and CodeBuild passes `-Pversion=X.Y.Z`. A developer's build can therefore never claim a release number.

Base images come from the organization's public ECR, `public.ecr.aws/b2i4h4k9`, filled by the `public-dkr` mirror:

| Image | `FROM` |
|---|---|
| `store-pod/spg` | `public.ecr.aws/b2i4h4k9/ashraf1abdelrasool/saas-gateway:sha-<short>` (the `saas-gateway` Caddy build, pinned by commit sha) |
| `store-core/console-ui` | `public.ecr.aws/b2i4h4k9/node:20.15.0-alpine` |
| `store-pod/landing-ui` | `public.ecr.aws/b2i4h4k9/nodejs24:latest` (distroless) |

The Spring services are buildpack images produced by `bootBuildImage` and have no Dockerfile.

## AWS: `services.yaml`, `flavours.yaml`, `envs/*.tfvars`

cvhome-platform's `services.yaml` is what Terraform iterates over: ECR repositories, ECS services, task definitions, environment, security groups, target groups and Route53 records all come from it. Per service:

| Field | Meaning |
|---|---|
| `port` | Container port; must match `common-config.yml`. |
| `image` | ECR repository path; must match the `build.gradle` image name exactly. |
| `database` | `true` receives `SPRING_DATASOURCE_*` and the RDS password secret; `false` gets no datasource wiring. |
| `runtime` | `spring`, `node` or `caddy`; picks the health path and the OTLP protocol and port. |
| `size` | Key into the flavour's size table (`gateway`, `medium`, `small`, `ui`, `ssr`). |
| `edge` | Omitted means internal only. `alb` adds host rules with an explicit `priority`; `nlb` adds listeners (spg: 80 and 443, health on 2019). |
| `secrets` | `ENV_NAME: "<secret>:<key>"` bindings into the environment's Secrets Manager secrets. |
| `autoscaling` | Per-service overrides of the flavour's policy (`cpu_target`, `memory_target`, `max_factor`, `enabled`). |
| `extra_env` | Literal environment with `${namespace}`, `${ports.<svc>}` and `${flavour.*}` interpolation (spg's lookup URLs, landing-ui's `INTERNAL_SPG`). |
| `static_assets` | Node UIs only: push the build's static output to the pod's CDN bucket at start and serve it from CloudFront. |
| `cdn` | The service reads or writes the pod's media bucket. |
| `needs_pod_list` | The service receives the list of pods (gateway, tenancy, pod-registry). |

`flavours.yaml` holds the four shapes an environment can take. `sizes` maps each `size` key to CPU and memory; `rds`, `network`, `capacity` (Fargate Spot share), `health_check_grace_seconds`, `log_retention_days` and `storefront_previews` complete each entry.

| | `dev` | `staging` | `prod` | `ephemeral` |
|---|---|---|---|---|
| Purpose | Cheapest thing that runs the whole product | Production's shape at a fraction of its size | Tenant data lives here | Throwaway, for a branch or a demo |
| `desired_count` | 1 | 1 | 2 | 1 |
| `protected` | false | false | true | false |
| Autoscaling | off | 1 to 3, CPU 75 % | 2 to 12, CPU 55 %, memory 70 %, 800 requests | off |
| `rds.shared` | true (`db.t4g.micro`) | false (`db.t4g.small`) | false (`db.t4g.small`, 7-day backups, deletion protection) | true (`db.t4g.micro`) |
| `monitoring` | false | true | true | false |
| `log_class` | INFREQUENT_ACCESS | INFREQUENT_ACCESS | STANDARD | INFREQUENT_ACCESS |
| `cdn_price_class` | PriceClass_100 | PriceClass_100 | PriceClass_All | PriceClass_100 |

`envs/<env>.tfvars` holds the human choices per environment and nothing else:

```hcl
env         = "prod"
flavour     = "prod"
image_tag   = "latest"
test_stores = false
az_count    = 3
```

The region is never in tfvars; the bootstrap launches in whichever region the console is in. Precedence is `flavours.yaml` < SSM (`/{project}/{env}/config`, what the bootstrap generated) < `envs/<env>.tfvars`. Once a tfvars file pins an `image_tag`, `latest` never reaches that environment again.

## `lcl.yml` essentials

The cvhome repository owns only its `lcl.yml`; the engine is the public `@cvhome-saas/lcl` package.

```yaml
ports:
  step: 1000                  # a second stack shifts every port by this much
hosts: [gateway.com, uaa.gateway.com, spg-507f1f77.gateway.com, ...]   # 19 names lcl doctor checks
compose:
  files: [docker-compose-lcl.yml]
  default: [postgres, minio, spg]
  environment: { LCL_PORT_SPG: "${port.spg.80}", LCL_PORT_MERCHANT: "${port.merchant.http}", ... }
urls:
  - { label: seller console, url: "http://gateway.com:${port.store-core-gateway.http}" }
  - { label: storefront, url: "http://org1-store1.spg-507f1f77.gateway.com:${port.spg.80}" }
```

Every service block declares its `command` (a `./gradlew ... bootRun` with `--spring.profiles.active=lcl,test-stores`, or `npm`/`npx` for the UIs), its `ports`, `depends-on` and a `health` probe: `/actuator/health` expecting `"status":"UP"` for Spring, TCP for the UIs, a log line for the Stripe listeners. A shared `defaults.environment.SPRING_APPLICATION_JSON` template rewrites every service port and discovery entry for the stack's live ports, which is what lets a shifted stack run unchanged code.

---

*Source of truth: cvhome `store-commons/autoconfigure/src/main/resources/common-config.yml`, `lcl.yml`, `.claude/skills/project-structure/references/configuration.md`, `references/build-system.md`, `build-logic/src/main/groovy/com.asrevo.docker-conventions.gradle`, `store-pod/spg/Dockerfile`, `store-core/console-ui/Dockerfile`, `store-pod/landing-ui/Dockerfile`; cvhome-platform `services.yaml`, `flavours.yaml`, `envs/*.tfvars`, `README.md`.*
