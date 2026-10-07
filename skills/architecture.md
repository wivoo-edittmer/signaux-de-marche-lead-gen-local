# Architecture Understanding

## Design Patterns by Scale

### Module/Class Level
- **MVC** (Model-View-Controller): Separation of concerns
  - Model: Data and business logic
  - View: Presentation layer
  - Controller: Mediates between Model and View

- **Repository Pattern**: Abstract data access
- **Service Layer**: Business logic coordination
- **DTO** (Data Transfer Object): Shape data for transport

### Application Level
- **Layered Architecture**: Presentation → Application → Domain → Infrastructure
- **Clean Architecture**: Dependencies point inward
- **Hexagonal Architecture**: Ports and adapters
- **CQRS**: Separate read and write models

### System Level
- **Microservices**: Small, independent services
  - Each service owns its data
  - Communicate via APIs
  - Can be deployed independently
- **Monolith**: Single deployable unit
  - Simpler to develop and test
  - Harder to scale

## Clean Code Principles

### SOLID
- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle (open for extension, closed for modification)
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle

### Other Principles
- **Separation of Concerns**: Different concerns in different modules
- **Law of Demeter**: Minimize coupling between objects
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid

## Design Trade-offs

### Monolith vs Microservices
| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Development | Simpler | More complex |
| Deployment | Single unit | Independent services |
| Scaling | Scale entire app | Scale individual services |
| Technology | Single stack | Polyglot |
| Data | Single DB | Per-service DBs |

### Event-Driven vs Request-Response
- **Event-Driven**: Asynchronous, decoupled, eventual consistency
- **Request-Response**: Synchronous, simpler, immediate feedback

## Applying with Vibe
- When AI suggests architecture, verify it fits your scale
- Question monolithic solutions for large systems
- Verify service boundaries make sense
- Check that dependencies flow correctly
- Ensure error handling is present at all levels