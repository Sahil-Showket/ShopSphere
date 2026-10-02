# ShopSphere Architecture

## 1. Overview

ShopSphere is a distributed e-commerce platform built using a microservices architecture.

The system separates major business responsibilities into independent services. Each business service owns its own PostgreSQL database. Redis is used as a caching layer, while RabbitMQ is used for asynchronous event-driven communication.

The React frontend communicates with the backend through a centralized API Gateway.

---

## 2. High-Level Architecture

```text
React + Vite Frontend :5173
            |
            v
     API Gateway :4000
            |
    +-------+-------+-------+-------+-------+
    |       |       |       |       |       |
    v       v       v       v       v       v
   Auth  Product   Cart   Order  Payment Notification
  :3001   :3000   :3002  :3003   :3004     :3005
    |       |       |       |       |         |
    v       v       v       v       v         v
   DB      DB      DB      DB      DB         DB
    |       |
    |       +------ Redis Cache
    |
    +------------- RabbitMQ -------------+




##3. Services
Service	Port	Responsibility
API Gateway	4000	Central entry point and request routing
Auth Service	3001	Registration, login, JWT and RBAC
Product Service	3000	Product CRUD and Redis caching
Cart Service	3002	Shopping cart management
Order Service	3003	Order creation and lifecycle
Payment Service	3004	Mock payment processing
Notification Service	3005	Event-driven notifications




##4. API Gateway

The API Gateway is the single backend entry point for the frontend.

Responsibilities:

Request routing
CORS
Helmet security headers
Rate limiting
JSON request-size limits
JWT-protected gateway routes
Proxy error handling
404 handling
Health endpoint

The frontend communicates with the Gateway rather than directly communicating with every backend service.



##5. Authentication

The Auth Service provides:

User registration
User login
JWT generation
JWT verification
Current-user information
Role-based access control
Admin authorization

JWT payload contains:

userId
email
role

Protected requests use:

Authorization: Bearer <JWT>



##6. Database-per-Service

Each business service owns its own PostgreSQL database.

Auth Service
     |
     v
PostgreSQL Auth DB

Product Service
     |
     v
PostgreSQL Product DB

Cart Service
     |
     v
PostgreSQL Cart DB

Order Service
     |
     v
PostgreSQL Order DB

Payment Service
     |
     v
PostgreSQL Payment DB

Notification Service
     |
     v
PostgreSQL Notification DB

Services do not directly access another service's database.

They communicate through HTTP APIs or RabbitMQ events.



##7. Product Service and Redis

The Product Service uses Redis as a cache in front of PostgreSQL.

The system follows a cache-aside strategy.

GET Product
     |
     v
 Check Redis
   /     \
 HIT     MISS
  |        |
  v        v
Return  PostgreSQL
           |
           v
         Redis
           |
           v
         Return

Example cache keys:

products:all
product:<id>

Cached data uses a TTL of approximately 60 seconds.



##8. Redis Failure Handling

Redis is an optional caching layer and is not the primary source of product data.

If Redis becomes unavailable:

Product Request
      |
      v
    Redis
      |
    FAIL
      |
      v
 PostgreSQL
      |
      v
  Response

The Product Service can continue serving product requests using PostgreSQL.

Its health endpoint reports Redis availability.




##9. Cart Service

The Cart Service manages:

User carts
Adding products
Updating quantities
Removing products
Retrieving carts

Cart data is stored in PostgreSQL.

The Cart Service communicates with the Product Service through HTTP to verify product information.



##10. Order Service

The Order Service manages:

Order creation
User order history
Individual order retrieval
Order status
Order cancellation
Payment confirmation

Order data is stored in PostgreSQL.

The service communicates with other services using HTTP and RabbitMQ.



##11. Payment Service

The Payment Service provides a mock payment workflow.

It:

Validates the JWT
Validates order ownership
Retrieves the order
Validates order status
Prevents duplicate payments
Creates a transaction ID
Confirms the order
Publishes a payment-success event

Payment data is stored in PostgreSQL.



##12. RabbitMQ Event Communication

RabbitMQ is used for asynchronous service communication.

A successful payment can produce an event:

Payment Service
      |
      | payment.success
      v
   RabbitMQ
      |
      +--------------------+
      |                    |
      v                    v
Order-related        Notification
processing           Service
                         |
                         v
                  Notification DB

This reduces direct coupling between services.



##13. Notification Service

The Notification Service consumes notification-related events from RabbitMQ.

Responsibilities:

Consume events
Process notification messages
Store notification records
Log mock notifications

Notification data is stored in PostgreSQL.



##14. Internal Service Authentication

Sensitive internal operations use an internal service secret.

For example, payment-related order confirmation uses:

x-service-secret: <internal secret>

The Order Service verifies this secret before allowing the internal operation.

This prevents arbitrary clients from directly invoking sensitive internal endpoints.



##15. Service Communication

ShopSphere uses two communication patterns.

Synchronous HTTP

Used when an immediate response is required.

Example:

Cart Service
     |
     | HTTP
     v
Product Service

Another example:

Payment Service
     |
     | HTTP
     v
Order Service
Asynchronous RabbitMQ

Used for event-driven operations.

Example:

Payment Service
      |
      | Event
      v
   RabbitMQ
      |
      v
Notification Service



##16. Complete Payment Flow
User
 |
 v
React Frontend
 |
 v
API Gateway
 |
 v
Payment Service
 |
 +--> Validate JWT
 |
 +--> Validate Order
 |
 +--> Verify Ownership
 |
 +--> Prevent Duplicate Payment
 |
 +--> Create Transaction
 |
 v
Confirm Order
 |
 v
Publish payment.success
 |
 v
RabbitMQ
 |
 +--> Notification Service
 |
 +--> Order-related processing

The payment implementation is currently a mock payment system.




##17. Frontend Architecture

The frontend uses:

React
Vite
React Router
Axios
React Context

Main frontend features:

Registration
Login
Authentication state
Product browsing
Product details
Cart
Orders
Payment
Protected routes
Navigation

The frontend communicates with:

React
  |
  v
Axios
  |
  v
API Gateway :4000

The Axios client automatically attaches the JWT to protected requests.



##18. Docker Architecture

Docker Compose manages the backend and infrastructure.

The stack contains:

API Gateway
Auth Service
Product Service
Cart Service
Order Service
Payment Service
Notification Service

PostgreSQL Auth
PostgreSQL Product
PostgreSQL Cart
PostgreSQL Order
PostgreSQL Payment
PostgreSQL Notification

Redis
RabbitMQ

Inside the Docker network, services communicate using Compose service names such as:

http://auth-service:3001
http://product-service:3000
http://cart-service:3002
http://order-service:3003
http://payment-service:3004
http://notification-service:3005




##19. Docker Commands

Start the complete stack:

docker compose up -d

Check containers:

docker compose ps

Stop the stack:

docker compose down



##20. Health Checks

Services expose health endpoints.

Example:

GET /health

Example Gateway response:

{
  "service": "api-gateway",
  "status": "UP"
}

Docker health checks are also configured for infrastructure such as:

PostgreSQL
Redis
RabbitMQ




##21. Error Handling and Resilience

ShopSphere includes:

Request validation
Centralized error middleware
JWT authentication
RBAC
Rate limiting
CORS
Security headers
Proxy error handling
Service-to-service timeouts
Redis fallback
Duplicate payment protection
Order state validation
Docker health checks




##22. Testing

Automated tests use:

Jest
Supertest

Testing covers:

Authentication
JWT protection
RBAC
Product APIs
Cart APIs
Order APIs
Payment APIs
Notification functionality
Validation
Error handling
Protected endpoints

Docker Compose has also been used for end-to-end system verification.



##23. Security

Security-related features include:

JWT authentication
Role-based authorization
Helmet
CORS
Rate limiting
JSON body-size limits
Internal service authentication
Environment-based secrets

Real secrets are stored in .env files and should never be committed to Git.

.env.example files are provided as templates.




##24. Main User Flow
Register
   |
   v
Login
   |
   v
Receive JWT
   |
   v
Browse Products
   |
   v
View Product
   |
   v
Add Product to Cart
   |
   v
Update Cart
   |
   v
Create Order
   |
   v
Payment
   |
   v
Confirm Order
   |
   v
RabbitMQ Event
   |
   v
Notification




##25. Architectural Principles
Separation of Responsibilities

Each service owns a specific business domain.

Database Ownership

Each service owns its own database.

Loose Coupling

Services communicate through APIs and events rather than directly accessing another service's database.

Caching

Redis reduces repeated database reads for frequently accessed product data.

Event-Driven Communication

RabbitMQ allows services to react to events asynchronously.

Failure Isolation

Redis failure does not prevent the Product Service from using PostgreSQL.

Centralized Entry Point

The API Gateway provides one backend entry point for the frontend.



##26. Current Technology Architecture
                    React + Vite
                         |
                         v
                  API Gateway
                      :4000
                         |
       +-----------------+-----------------+
       |        |        |        |        |
       v        v        v        v        v
     Auth    Product    Cart     Order   Payment
    :3001     :3000    :3002    :3003    :3004
       |        |        |        |        |
       v        v        v        v        v
      DB       DB       DB       DB       DB

                         |
                         v
                    RabbitMQ
                         |
                         v
                  Notification
                     :3005
                         |
                         v
                        DB

                  Product Service
                         |
                         v
                       Redis





##27. Future Improvements

Potential future improvements include:

OpenAPI / Swagger documentation
GitHub Actions CI/CD
Production deployment
Dockerized React frontend
Centralized logging
Distributed tracing
Improved observability
Production payment provider integration
More extensive integration testing
