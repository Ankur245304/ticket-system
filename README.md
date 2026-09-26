## Stack
- Java 21
- Spring Boot 3.5.x
- Spring Data JPA
- PostgreSQL (Docker) / H2 (tests)
- REST API
- React + Vite
- TypeScript

## Workflow
Requirement -> Specification -> Plan / Tasks -> Implementation -> Testing -> Review -> Fix

## Run backend
```bash
cd backend
./mvnw spring-boot:run
```
Or use Maven 3.9+:
```bash
mvn spring-boot:run
```

Default API: `http://localhost:8080/api/v1/support-tickets` (with `/api/tickets` backward-compatibility mapping)

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## PostgreSQL
```bash
docker compose up -d postgres
```

Default local credentials are development-only and must not be used in production.

## Tests
```bash
cd backend
./mvnw test
```
The test suite includes state-machine integration tests and validation tests.

## AI engineering artefacts
- `rules/` reusable engineering instructions
- `spec/` specifications before implementation
- `.specstory/history/` prompt records
- `docs/prompt-history.md` prompt index
- `docs/ai-review.md` examples of AI suggestions intentionally corrected/validated
- `commands/` review/test-generation commands
