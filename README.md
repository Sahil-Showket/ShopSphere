# ShopSphere

ShopSphere is a production-style distributed e-commerce platform built using
Node.js, Express, React, PostgreSQL, Prisma, Redis, RabbitMQ and Docker.

## Architecture

```text
React Frontend
      |
      v
 API Gateway
      |
      +---- Auth Service
      |
      +---- Product Service
      |
      +---- Cart Service
      |
      +---- Order Service
      |
      +---- Payment Service
      |
      +---- Notification Service

Infrastructure:

PostgreSQL
Redis
RabbitMQ
Docker