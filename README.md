# ShopSphere — Distributed E-Commerce Platform

ShopSphere is a production-style distributed e-commerce platform built using a microservices architecture. The project demonstrates backend engineering concepts including API Gateway design, JWT authentication and RBAC, database-per-service architecture, Redis caching, RabbitMQ event-driven communication, Docker containerization, automated testing, and a React frontend.

---

## 🚀 Features

- Microservices-based e-commerce architecture
- API Gateway for centralized routing
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Product management
- Shopping cart management
- Order creation and management
- Mock payment processing
- Notification service
- PostgreSQL database per service
- Redis caching for product data
- RabbitMQ asynchronous event communication
- Docker and Docker Compose
- Request validation and centralized error handling
- API rate limiting
- CORS and security headers
- Health-check endpoints
- Automated API testing with Jest and Supertest
- React + Vite frontend
- Protected frontend routes
- Axios API integration
- Responsive frontend UI

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │      Vite :5173      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     API Gateway      │
                         │        :4000         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │    Auth     │       │   Product   │       │    Cart     │
       │   :3001     │       │    :3000    │       │    :3002    │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              ▼                     ▼                     ▼
       PostgreSQL             PostgreSQL             PostgreSQL


              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │    Order    │       │   Payment   │       │Notification │
       │    :3003    │       │    :3004    │       │    :3005    │
       └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
              │                     │                     │
              ▼                     ▼                     ▼
       PostgreSQL             PostgreSQL             PostgreSQL


                         ┌──────────────────────┐
                         │        Redis         │
                         │    Product Cache     │
                         └──────────────────────┘

                         ┌──────────────────────┐
                         │      RabbitMQ        │
                         │   Event Messaging    │
                         └──────────────────────┘



🧩 Microservices
Service	Port	Responsibility
API Gateway	4000	Central entry point and request routing
Auth Service	3001	Registration, login, JWT and RBAC
Product Service	3000	Product CRUD and Redis caching
Cart Service	3002	Shopping cart management
Order Service	3003	Order creation and lifecycle
Payment Service	3004	Mock payment processing
Notification Service	3005	Event-driven notifications

Each business service owns its own PostgreSQL database.

This follows the database-per-service approach and reduces direct database coupling between services.

🛠️ Tech Stack
Backend
Node.js
Express.js
JavaScript
Prisma ORM
PostgreSQL
JWT
Axios
Infrastructure
Docker
Docker Compose
Redis
RabbitMQ
Frontend
React
Vite
React Router
Axios
Testing
Jest
Supertest
Development Tools
Git
GitHub
VS Code
Nodemon
🔐 Authentication & Authorization

ShopSphere uses JWT-based authentication.

Authentication flow:

User
 │
 ▼
Login
 │
 ▼
Auth Service
 │
 ▼
JWT Token
 │
 ▼
Frontend
 │
 ▼
Authorization Header
 │
 ▼
API Gateway
 │
 ▼
Protected Service

JWT tokens contain information such as:

userId
email
role

Protected endpoints require:

Authorization: Bearer <token>

Role-based authorization is used for protected administrative operations.

🚪 API Gateway

The API Gateway acts as the central entry point for the frontend.

Instead of the frontend communicating directly with every service:

Frontend
   │
   ├── Auth
   ├── Product
   ├── Cart
   ├── Order
   ├── Payment
   └── Notification

the frontend communicates with:

Frontend
    │
    ▼
API Gateway
    │
    ├── Auth Service
    ├── Product Service
    ├── Cart Service
    ├── Order Service
    ├── Payment Service
    └── Notification Service

The gateway also provides:

Centralized routing
CORS configuration
Security headers using Helmet
Rate limiting
JSON request limits
JWT-protected gateway routes
Proxy error handling
⚡ Redis Caching

Redis is used as a cache layer for product data.

The Product Service follows a cache-aside strategy.

GET Product
     │
     ▼
 Check Redis
     │
 ┌───┴────┐
 │        │
Hit      Miss
 │        │
 ▼        ▼
Return   PostgreSQL
         │
         ▼
       Redis
         │
         ▼
       Return

Cached product data has a TTL of 60 seconds.

The Product Service also includes graceful Redis failure handling. If Redis becomes unavailable, product requests can fall back to PostgreSQL instead of making the service completely unavailable.

📨 RabbitMQ Event Communication

RabbitMQ is used for asynchronous communication between services.

For example, payment processing can publish a payment-success event:

Payment Service
      │
      ▼
 payment.success
      │
      ▼
   RabbitMQ
      │
      ├──────────────► Order Service
      │
      └──────────────► Notification Service

This reduces direct coupling between services and demonstrates an event-driven architecture.

🗄️ Database Architecture

Each major service has its own PostgreSQL database.

Auth Service
     │
     ▼
PostgreSQL Auth DB

Product Service
     │
     ▼
PostgreSQL Product DB

Cart Service
     │
     ▼
PostgreSQL Cart DB

Order Service
     │
     ▼
PostgreSQL Order DB

Payment Service
     │
     ▼
PostgreSQL Payment DB

Notification Service
     │
     ▼
PostgreSQL Notification DB

Prisma is used as the ORM for database access and migrations.

🛒 E-Commerce Flow

A typical user flow is:

Register
   ↓
Login
   ↓
Browse Products
   ↓
View Product
   ↓
Add Product to Cart
   ↓
Update Cart
   ↓
Create Order
   ↓
Payment
   ↓
Order Confirmation
   ↓
Notification Event
📡 Main API Endpoints
Authentication
POST /auth/register
POST /auth/login
GET  /auth/me
GET  /auth/admin
Products
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
Cart
GET    /cart
POST   /cart/items
PATCH  /cart/items/:productId
DELETE /cart/items/:productId
Orders
POST /orders
GET  /orders
GET  /orders/:id

Additional internal/admin order operations are also implemented.

Payments
POST /payments
Health Checks

Services expose health endpoints for basic service availability monitoring.

Example:

GET /health
🧪 Testing

The project uses:

Jest
Supertest

Automated tests cover important API behavior including:

Authentication
Authorization
Product APIs
Cart APIs
Order APIs
Payment APIs
Notification functionality
Validation
Error handling
Protected routes

The project also includes end-to-end verification using Docker Compose.

🐳 Docker

ShopSphere is containerized using Docker and Docker Compose.

The Docker environment includes:

React / Frontend
API Gateway
Auth Service
Product Service
Cart Service
Order Service
Payment Service
Notification Service

PostgreSQL databases
Redis
RabbitMQ

Start the backend infrastructure with:

docker compose up -d

Check running containers:

docker compose ps

Stop the stack:

docker compose down
⚙️ Environment Variables

Real environment files are intentionally excluded from Git.

Each service provides an .env.example file showing the required configuration.

Example:

DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=3001

Before running a service locally, create the appropriate .env file from its .env.example.

Never commit real database passwords, JWT secrets, API keys, or other credentials.

💻 Local Development
1. Clone the repository
git clone https://github.com/Sahil-Showket/ShopSphere.git
cd ShopSphere
2. Start backend services
docker compose up -d
3. Verify containers
docker compose ps
4. Start the frontend

Development mode:

cd frontend
npm install
npm run dev

The frontend will normally be available at:

http://localhost:5173

The API Gateway runs on:

http://localhost:4000
🔄 Development vs Production

During development, the React frontend runs through Vite:

React + Vite
    ↓
localhost:5173

while backend services run through Docker Compose.

For a production deployment, the frontend can be built into static assets and served through a web server/container.

📁 Project Structure
ShopSphere/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── gateway/
│   ├── src/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── services/
│   ├── auth-service/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
│
├── docs/
│   ├── architecture.md
│   └── ...
│
├── docker-compose.yml
├── .dockerignore
├── .gitignore
└── README.md
🩺 Health Checks

The system provides service health endpoints to make it easier to verify that services are running.

Example:

GET /health

The Docker environment also uses health checks for infrastructure services such as PostgreSQL, Redis and RabbitMQ.

🔒 Reliability & Error Handling

The project includes several reliability and security-oriented mechanisms:

Request validation
Centralized error middleware
JWT authentication
Role-based authorization
API rate limiting
CORS configuration
Security headers
Proxy error handling
Service-to-service authentication for internal operations
Redis fallback to PostgreSQL
Request timeouts for service communication
Docker health checks
📊 Project Highlights

ShopSphere demonstrates practical experience with:

Microservices Architecture
        ↓
API Gateway
        ↓
JWT + RBAC
        ↓
Database per Service
        ↓
Redis Caching
        ↓
RabbitMQ Events
        ↓
Docker
        ↓
Automated Testing
        ↓
React Frontend

The project was designed to provide hands-on experience with distributed backend systems rather than implementing a simple monolithic CRUD application.

🚧 Future Improvements

Potential future improvements include:

OpenAPI / Swagger documentation
GitHub Actions CI/CD
Production deployment
Dockerized frontend
Improved observability and centralized logging
Distributed tracing
More comprehensive integration tests
Production payment provider integration


👨‍💻 Author

Sahil Showket

Computer Science & Engineering
NIT Srinagar

GitHub:
https://github.com/Sahil-Showket

📄 License

This project is intended primarily as a learning and portfolio project.