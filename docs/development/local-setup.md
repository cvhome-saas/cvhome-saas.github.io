# Local Development Setup

This guide provides instructions for setting up `cvhome` to run on your local machine:

1. **Full Development Setup:** Setting up the required tools (Java, Gradle, Node.js),
   building and running all services manually. good for core development and debugging.
---

## Full Development Setup

### Prerequisites

* **Git**
* **JDK 25**
* **Gradle 9**
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
4. **Launch required Resources:** this will run required resources before run the main project
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
    * [http://gateway.com:8000](http://gateway.com:8000) (`org1-admin@mail.com/admin`) or (`org2-admin@mail.com/admin`)
    * [http://org1-store1.spg-507f1f77.gateway.com](http://org1-store1.spg-507f1f77.gateway.com)
    * [http://org1-store2.spg-507f1f77.gateway.com](http://org1-store2.spg-507f1f77.gateway.com)
    * [http://org2-store1.spg-507f1f77.gateway.com](http://org2-store1.spg-507f1f77.gateway.com)
    * [http://org2-store2.spg-507f1f77.gateway.com](http://org2-store2.spg-507f1f77.gateway.com)
8. **Development:**
    Now you can start development using your IDE (IntelliJ, VS Code, Eclipse) 
   * make sure to use dev profile like `spring.profiles.active=dev`
