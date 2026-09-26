# Architecture
React/Vite frontend -> REST API -> Spring service/domain layer -> Spring Data JPA -> PostgreSQL/H2.

The status transition map lives in the backend service so UI behavior cannot bypass business rules.
