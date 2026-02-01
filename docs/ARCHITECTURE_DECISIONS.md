# Architecture Decisions

Technical decisions and rationale for the Green Mart microservices backend. Useful for interviews and technical discussions.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Vue)                     │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Spring Cloud)                    │
│              • Routing • Auth • Rate Limiting • CORS              │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
              ┌──────────────────┴───────────────────┐
              ▼                                      ▼
┌──────────────────────┐                ┌──────────────────────────┐
│   EUREKA (Discovery) │ ◄──Register──► │     MICROSERVICES        │
└──────────────────────┘                │  Auth, User, Product,    │
                                        │  Order, Inventory,       │
                                        │  Payment, Checkout       │
                                        └──────────────────────────┘
```

---

## Key Architectural Decisions

### 1. Why Microservices?

**Decision:** Decompose into independent services instead of monolith.

**Rationale:**
- **Independent Deployment:** Update Order service without touching Auth
- **Technology Flexibility:** Node.js for I/O-heavy services, Java for complex logic
- **Scalability:** Scale high-traffic services (Products) independently
- **Team Autonomy:** Different teams can own different services
- **Fault Isolation:** If Payment fails, browsing still works

**Interview Answer:**
> "We chose microservices because e-commerce has distinct bounded contexts - authentication, catalog, orders, payments - each with different scaling needs and change frequencies. The Product catalog is read-heavy and benefits from Node.js's async I/O, while Order and Payment processing requires strong transactional guarantees that Spring Boot provides."

---

### 2. Why Database-per-Service?

**Decision:** Each microservice has its own database.

| Service | Database | Reason |
|---------|----------|--------|
| Auth, Order, Payment | PostgreSQL | ACID transactions, relational data |
| User, Product, Inventory | MongoDB | Flexible schema, fast reads |

**Rationale:**
- **Loose Coupling:** Services don't share schemas
- **Independent Evolution:** Can change schema without affecting others
- **Right Tool for Job:** MongoDB for document-heavy catalog, PostgreSQL for transactions
- **Performance:** Optimized indexes per service

**Trade-offs:**
- ❌ No cross-service JOINs (use API calls instead)
- ❌ Eventual consistency (managed via SAGA)
- ❌ Data duplication (acceptable for read performance)

**Interview Answer:**
> "Database-per-service enforces loose coupling at the data layer. Each service owns its data and exposes it through APIs, not direct database access. This allows us to use PostgreSQL for Order and Payment services where ACID transactions are critical, while Product and Inventory use MongoDB for its flexible schema and horizontal scaling."

---

### 3. Why API Gateway Pattern?

**Decision:** Single entry point via Spring Cloud Gateway.

**Responsibilities:**
- Route requests to appropriate service
- JWT validation and propagation
- Rate limiting
- CORS handling
- Request/response logging

**Rationale:**
- **Security:** Single point for authentication
- **Simplicity:** Frontend talks to one URL
- **Cross-cutting Concerns:** Logging, metrics in one place
- **Abstraction:** Can reorganize services without frontend changes

**Interview Answer:**
> "The API Gateway acts as a reverse proxy that handles cross-cutting concerns. It validates JWT tokens before requests reach services, implements rate limiting to prevent abuse, and provides a stable API contract for the frontend even if we reorganize internal services."

---

### 4. Why Service Discovery (Eureka)?

**Decision:** Dynamic service discovery instead of hardcoded URLs.

**How it works:**
1. Services register with Eureka on startup
2. Gateway queries Eureka for service locations
3. Client-side load balancing distributes requests

**Rationale:**
- **Dynamic Scaling:** New instances auto-register
- **Fault Tolerance:** Failed instances are removed
- **No Hardcoding:** Services discovered at runtime
- **Load Balancing:** Built-in with Spring Cloud

**Alternative Considered:** Kubernetes DNS (better for K8s environments)

**Interview Answer:**
> "Eureka provides dynamic service discovery, which is essential in a microservices environment where instances can scale up/down. When a new Order service instance starts, it registers with Eureka, and the Gateway automatically includes it in load balancing without configuration changes."

---

### 5. Why SAGA Pattern for Checkout?

**Decision:** Orchestration-based SAGA for distributed transactions.

**The Problem:**
Checkout involves multiple services:
1. Reserve inventory
2. Create order
3. Process payment
4. Confirm order

If payment fails after inventory is reserved, we need rollback.

**Our Solution: Orchestration SAGA**

```
┌─────────────────────────────────────────────────────────────┐
│                    CHECKOUT SERVICE                          │
│                   (SAGA Orchestrator)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐          ┌─────────┐          ┌─────────┐
│Inventory│          │  Order  │          │ Payment │
│ Reserve │──────────│ Create  │──────────│ Process │
└─────────┘          └─────────┘          └─────────┘
    │                      │                      │
    ▼                      ▼                      ▼
(Compensate if any step fails)
```

**Why Orchestration over Choreography:**
- **Centralized Logic:** Easy to understand flow
- **Better Debugging:** Single service to trace
- **Easier Rollback:** Orchestrator knows what to compensate

**Interview Answer:**
> "Traditional distributed transactions (2PC) don't scale well in microservices. We use the SAGA pattern where the Checkout service orchestrates the flow - reserving inventory, creating the order, then processing payment. If payment fails, it triggers compensating transactions to release the reserved inventory. This gives us eventual consistency with proper error handling."

---

### 6. Why Hybrid Tech Stack (Node.js + Spring Boot)?

**Decision:** Different technologies for different services.

| Technology | Services | Reason |
|------------|----------|--------|
| Node.js | User, Product, Inventory | Fast I/O, simple CRUD, rapid development |
| Spring Boot | Auth, Order, Payment, Checkout, Gateway | Complex logic, transactions, enterprise patterns |

**Rationale:**
- **Right Tool for Job:** Node.js excels at I/O, Java at complex logic
- **Team Skills:** Leverage both Node and Java expertise
- **Performance:** Async I/O for catalog, strong typing for transactions
- **Ecosystem:** Spring Security, Spring Cloud for enterprise needs

**Interview Answer:**
> "We chose a polyglot approach - Node.js for catalog services that are read-heavy and benefit from its non-blocking I/O, and Spring Boot for services requiring complex business logic, transactions, and enterprise patterns like SAGA orchestration. This lets us optimize each service for its specific requirements."

---

### 7. Why Docker Compose for Deployment?

**Decision:** Single-VM deployment with Docker Compose.

**Rationale:**
- **Simplicity:** One command to start everything
- **Portability:** Same setup on dev, staging, production
- **Resource Efficient:** Suitable for single VM
- **Cost Effective:** No Kubernetes overhead for small scale

**When to Migrate to Kubernetes:**
- Need for auto-scaling
- Multi-node deployment
- Advanced orchestration features
- Team has Kubernetes expertise

**Interview Answer:**
> "Docker Compose is the right choice for our current scale - single VM deployment. It provides containerization benefits without Kubernetes complexity. When we need auto-scaling or multi-node deployment, we can migrate to Kubernetes since our services are already containerized."

---

## Trade-offs Acknowledged

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| Microservices | Independence | Network complexity, eventual consistency |
| Database-per-service | Loose coupling | No JOINs, data duplication |
| SAGA | Distributed transactions | Compensation logic |
| Event-driven | Loose coupling | Message ordering, debugging |
| API Gateway | Security, abstraction | Single point of failure (mitigated by health checks) |

---

## Future Improvements

1. **Message Queue:** Add RabbitMQ/Kafka for async communication
2. **Caching:** Add Redis for session/product caching
3. **Observability:** Add distributed tracing (Jaeger/Zipkin)
4. **CI/CD:** Automated deployment pipeline
5. **Kubernetes:** For production-scale deployment

---

## Interview Preparation Tips

1. **Know the WHY:** Don't just describe what you built, explain why
2. **Discuss Trade-offs:** Show you understand consequences
3. **Alternative Approaches:** Know what you didn't choose and why
4. **Scaling Story:** How would you scale each component?
5. **Failure Scenarios:** What happens when X fails?
