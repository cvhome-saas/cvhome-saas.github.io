---
title: Monitoring and logs
---

# Monitoring and logs

The CloudWatch dashboard, the collector, and where the logs are below prod.

Three things are independent of each other and switched by the flavour: the dashboard (`dashboard`), the
telemetry collector with Container Insights (`monitoring`), and the log class (`log_class`). Alarms are
deliberately absent; they need SLO decisions that live with the load-testing thresholds.

## The dashboard

Every environment whose flavour says `dashboard: true` (all but `ephemeral`) gets one CloudWatch dashboard
named `<project>-<env>`; `terraform output dashboard_url` opens it. It is built only from the metrics AWS
publishes for free the moment a resource exists, so it needs no agent, no Container Insights and no collector,
and reads the same under `monitoring: false`.

| Section | Widgets | Namespaces |
|---|---|---|
| store-core | CPU and memory per service; ALB requests and errors, target response time (p50, p90, p99), healthy and unhealthy targets, requests per target, connections; RDS CPU, connections, free memory and storage, latency, burst credits; recent errors from the log groups | `AWS/ECS`, `AWS/ApplicationELB`, `AWS/RDS`, Logs Insights |
| each pod | CPU and memory per service; NLB flows, bytes, resets, healthy and unhealthy spg targets; CDN requests, error rates, bytes; the same RDS widgets; recent errors | `AWS/ECS`, `AWS/NetworkELB`, `AWS/CloudFront`, `AWS/RDS`, Logs Insights |
| network | NAT gateway bytes, connections, port-allocation errors and dropped packets (prod); or NAT instance bytes, CPU and credit balance, failed status checks (below prod) | `AWS/NATGateway`, `AWS/EC2` |

Widget positions are explicit, so an apply never reshuffles the page. The NLB section has no request count
and no status codes: its listeners are TCP passthrough, and request-level numbers for a pod are Caddy's job.
The dashboard names load balancers and services by ARN suffix, which do not exist while hibernated, so it is
destroyed with the hourly things and recreated under the same name on wake.

<!-- img: /images/aws/cloudwatch-dashboard.png — the project-env dashboard with the store-core, pod and network sections -->

## The collector

Where the flavour says `monitoring: true` (staging, prod), the core cluster runs one extra service from the
`infra` section of `services.yaml`:

| Field | Value |
|---|---|
| Name | `otel-collector`, deployed to the core cluster, Cloud Map name `otel-collector.store-core.<project>-<env>.lcl` |
| Image | `ashraf1abdelrasool/aws-otel-collector:latest`, an external image (not built by the pipeline); its config is in the org's `aws-otel-collector` repo |
| Ports | 4317 (OTLP gRPC, the Node UIs) and 4318 (OTLP HTTP, the Spring services) |
| Size | `small` |
| Count | one per environment, not one per pod: pod tasks resolve the core namespace across the boundary because both Cloud Map namespaces are private hosted zones on the same VPC |

What each service is told:

| Runtime | With `monitoring: true` | With `monitoring: false` |
|---|---|---|
| Spring | `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.<core-ns>:4318`, `MANAGEMENT_OTLP_METRICS_EXPORT_URL=...:4318/v1/metrics`, `OTEL_SDK_DISABLED=false`, `MANAGEMENT_OTLP_METRICS_EXPORT_ENABLED=true` | `OTEL_SDK_DISABLED=true`, `MANAGEMENT_OTLP_METRICS_EXPORT_ENABLED=false`, no endpoint |
| Node (console-ui, landing-ui) | `OTEL_EXPORTER_OTLP_PROTOCOL=grpc`, `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.<core-ns>:4317`, `OTEL_SERVICE_NAME=<name>` | `OTEL_SDK_DISABLED=true` |
| spg (Caddy) | `OTEL_EXPORTER_OTLP_PROTOCOL=grpc`, `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.<core-ns>:4317`, `OTEL_SERVICE_NAME=spg` | `OTEL_SERVICE_NAME=spg` only, no endpoint |

Both switches matter. `OTEL_SDK_DISABLED` silences the OpenTelemetry SDK (traces, logs), but Spring Boot's
OpenTelemetry starter also ships Micrometer's OTLP meter registry, which has its own switch and defaults its
URL to `localhost:4318`; without `MANAGEMENT_OTLP_METRICS_EXPORT_ENABLED=false` every task under dev logged a
"Failed to publish metrics" warning every minute. The same flag turns ECS Container Insights on or off for
both clusters.

## Tracing a request

spg adds an `X-Trace-Id` response header to every proxied request (the Caddyfile sets it from Caddy's
`trace_id` variable on each route). Take it from the browser's network panel and search the pod's log groups
for it with Logs Insights.

## Logs

Every ECS service writes to its own log group through the `awslogs` driver:

```
/aws/ecs/<project>/<env>/<layer>/<service>      e.g. /aws/ecs/cvhome/dev/store-core/uaa
```

with stream prefix `ecs`. Retention and class follow the flavour:

| Flavour | `log_retention_days` | `log_class` |
|---|---|---|
| dev | 7 | INFREQUENT_ACCESS |
| staging | 14 | INFREQUENT_ACCESS |
| prod | 30 | STANDARD |
| ephemeral | 1 | INFREQUENT_ACCESS |

**Below prod, read logs with CloudWatch Logs Insights.** The Infrequent Access class ingests at half the price
of Standard, and in exchange it is readable through Logs Insights only: Live Tail, `aws logs tail`,
`filter-log-events` and the ECS console's Logs tab do not work on it, and it takes no metric or subscription
filters. The dashboard's "recent errors" tables are Logs Insights queries for this reason. The class is fixed
when a group is created, so switching it recreates the groups and drops their history. Prod keeps Standard
because Live Tail and metric filters are worth the full price where tenants are.

A starting query for one service:

```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
```

ALB access logs go to the environment's `<project>-<env>-logs-*` S3 bucket and expire after
`log_retention_days`. The pod NLBs write no access logs: they only do so for TLS listeners, and these are TCP
passthrough.

---

*Source of truth: cvhome-platform `modules/dashboard`, `modules/ecs-service/main.tf`, `modules/store-core/main.tf`,
`modules/store-pod/main.tf`, `services.yaml` (`infra`), `flavours.yaml`, `main.tf`, `README.md`; cvhome
`store-pod/spg/Caddyfile`.*
