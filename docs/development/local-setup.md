# Local Development Setup

This guide provides instructions for setting up `cvhome` to run on your local machine. There are two primary methods:

1. **Quick Start with Docker Compose:** The fastest way to run locally, ideal for demos.
2. **Full Development Setup:** Setting up the required tools (Java, Gradle, Node.js),
   building and running all services manually. good for core development and debugging.
---

## Quick Start with Docker Compose

### Prerequisites

* Docker & Docker Compose
* curl

### Steps

1. **Setup & Download:**
   Execute this command in your terminal:
   ```bash 
     curl -sSL https://raw.githubusercontent.com/cvhome-saas/assets/refs/heads/main/fast-run/fast-run.sh | sudo bash
   ```

2. **Wait:**
   ~5-10 minutes to download and run docker images.

3. **Access:**

   * [http://store-uihttp://store-ui.gateway.com:8000](http://store-ui.gateway.com:8000) (`org1-admin@mail.com/admin`) or (`org2-admin@mail.com/admin`)
   * [http://org1-store1.store-pod-saas-gateway-1.gateway.com:8100](http://org1-store1.store-pod-saas-gateway-1.gateway.com:8100)
   * [http://org1-store2.store-pod-saas-gateway-1.gateway.com:8100](http://org1-store2.store-pod-saas-gateway-1.gateway.com:8100)
   * [http://org2-store1.store-pod-saas-gateway-1.gateway.com:8100](http://org2-store1.store-pod-saas-gateway-1.gateway.com:8100)
   * [http://org2-store2.store-pod-saas-gateway-1.gateway.com:8100](http://org2-store2.store-pod-saas-gateway-1.gateway.com:8100)

## Full Development Setup

### Prerequisites

* **Git**
* **JDK 23**
* **Gradle 8**
* **Node.js 20.x**
* **Docker & Docker Compose**

### Steps

1. **Clone the Repository:**
    ```bash 
    git clone https://github.com/cvhome-saas/cvhome.git
    ```
2. **Configure hosts:**
    ```bash 
    sudo bash extra/scripts/configure-domain.sh
    ```
3. **Build the Code:** this will download the mvn dependencies
    ```bash 
    ./gradlew clean build -x test
    ```
4. **Launch required Resources:** this will run required resources before run the main project like (
   rabbitmq,postgres,keycloak,caddy,minio,mailcatcher)
    ```bash 
    docker compose -f docker-compose-lcl.yml up -d
    ```
5. **Running all Microservices:** this will run all microservices (6 java , 3 angular , 1 Next.js) in the project
   *(Note: This project's Gradle setup is configured to launch all service types (Java, Angular, Next.js)
   via `bootRun`)*

   ```bash 
    ./gradlew bootRun --args='--spring.profiles.active=lcl'
    ```
6. **Wait:**
   ~2-3 minutes for services to start.

7. **Access:**
    * [http://store-uihttp://store-ui.gateway.com:8000](http://store-ui.gateway.com:8000) (`org1-admin@mail.com/admin`) or (`org2-admin@mail.com/admin`)
    * [http://org1-store1.store-pod-saas-gateway-1.gateway.com:8100](http://org1-store1.store-pod-saas-gateway-1.gateway.com:8100)
    * [http://org1-store2.store-pod-saas-gateway-1.gateway.com:8100](http://org1-store2.store-pod-saas-gateway-1.gateway.com:8100)
    * [http://org2-store1.store-pod-saas-gateway-1.gateway.com:8100](http://org2-store1.store-pod-saas-gateway-1.gateway.com:8100)
    * [http://org2-store2.store-pod-saas-gateway-1.gateway.com:8100](http://org2-store2.store-pod-saas-gateway-1.gateway.com:8100)
8. **Development:**
    Now you can start development using your IDE (IntelliJ, VS Code, Eclipse) 
   * make sure to use dev profile like `spring.profiles.active=dev`
