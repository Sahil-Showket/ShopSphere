                         ┌─────────────────┐
                         │    Frontend     │
                         │ React / Next.js │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         └────────┬────────┘
                                  │
          ┌───────────────┬───────┼────────┬───────────────┐
          ▼               ▼       ▼        ▼               ▼
       Auth           Product    Cart     Order         Payment
      Service         Service   Service   Service       Service
          │               │       │        │               │
          ▼               ▼       ▼        ▼               ▼
       MongoDB         MongoDB  Redis   PostgreSQL    Payment API
                                           │
                                           ▼
                                      RabbitMQ
                                      /      \
                                     ▼        ▼
                              Notification   Payment
                                Service      Service




| Service      | What does it do?                | Database         | Communication   |
---------------------------------------------------------------------------------------
| Auth         | Login, registration, JWT, roles | MongoDB          | HTTP            |

| Product      | Products, search, inventory     | MongoDB          | HTTP            |

| Cart         | User carts                      | Redis            | HTTP            |

| Order        | Orders, status, history         | PostgreSQL       | HTTP + RabbitMQ |

| Payment      | Payments, webhooks              | PostgreSQL       | HTTP + RabbitMQ |

| Notification | Emails/notifications            | MongoDB/optional | RabbitMQ        |

| API Gateway  | Routing, auth, rate limiting    | None             | HTTP            |

