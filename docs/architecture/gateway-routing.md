---
title: Gateway routing
---

# Gateway routing

How store-core-gateway maps a request to a service, and how it learns the pods at runtime (C4 level 3).

::: info Being written
This page is part of the architecture rewrite and is filled in by a later commit of the same pull request.
:::

---

*Source of truth: cvhome `store-core/gateway/gateway-service/src/main/java/com/asrevo/cvhome/gateway/config/GatewayRouteLocatorImpl.java`, `client/PodClient.java`.*
