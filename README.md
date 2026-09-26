<div align="center">

# 🎫 Support Ticket Management System

### A full-stack support ticket platform built with Java, Spring Boot, MySQL, React, and TypeScript.

Create, track, search, and manage support tickets through a clean dashboard and a RESTful API.

<br/>

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.x-6DB33F?logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=20232A)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-informational)

</div>

---

## ✨ Overview

Support Ticket Management System is a full-stack application for logging and managing support issues. It provides a dashboard for viewing ticket totals, tracking ticket states, filtering records, and creating new tickets.

The project is developed with a **specification-first, test-driven workflow**: requirements are clarified before implementation, and changes are validated through automated tests and review.

## 🖥️ Dashboard Preview

<div align="center">
  <img src="docs/images/ticket-dashboard.png" alt="Support Ticket Management System dashboard showing ticket metrics, search and filters, and the create-ticket form" width="100%" />
  <br/>
  <sub>Dashboard preview — create tickets, search and filter the list, and view ticket status at a glance.</sub>
</div>

## 🚀 Features

- **Ticket creation** — create a ticket with a title, description, priority, and optional assignee.
- **Status overview** — view ticket counts across all tickets, open, in-progress, and resolved/closed states.
- **Search and filtering** — search tickets and filter by status or priority.
- **Ticket lifecycle** — represent ticket state and track progress through the workflow.
- **Input validation** — validate required fields and constrain title and description lengths.
- **REST API** — expose ticket operations through versioned API endpoints.
- **Automated tests** — validate request rules and ticket state transitions.

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Backend | Spring Boot 3.5.x |
| Persistence | Spring Data JPA / Hibernate |
| Database | MySQL |
| Database for local development | MySQL in Docker Compose |
| Testing database | H2 |
| API | REST |
| Frontend | React + Vite |
| Frontend language | TypeScript |
| Build | Maven |
| Validation | Jakarta Bean Validation |

## 🏗️ High-Level Architecture

```text
┌──────────────────────┐       HTTP / JSON       ┌─────────────────────────┐
│                      │  ─────────────────────▶ │                         │
│   React + TypeScript │                         │  Spring Boot REST API   │
│   Vite UI             │  ◀───────────────────── │  Controllers            │
│                      │                         │  Services                │
└──────────────────────┘                         │  Spring Data JPA         │
                                                 └────────────┬────────────┘
                                                              │
                                                              │ JDBC
                                                              ▼
                                                 ┌─────────────────────────┐
                                                 │          MySQL          │
                                                 │       (Docker)          │
                                                 └─────────────────────────┘
```

## ⚙️ Getting Started

### Prerequisites

- Java 21
- Docker and Docker Compose
- Node.js and npm
- Git

The repository includes a Maven Wrapper, so a separate Maven installation is optional.

### 1. Clone the repository

```bash
git clone https://github.com/Ankur245304/ticket-system.git
cd ticket-system
```

### 2. Start MySQL

Start the MySQL service defined in the project's Docker Compose configuration:

```bash
docker compose up -d mysql
```

Check that the container is running:

```bash
docker compose ps
```

> If your Compose service has a different name, replace `mysql` with the service name from `docker-compose.yml` or `compose.yaml`.

### 3. Configure the backend

Configure the datasource in `backend/src/main/resources/application.properties` (or your active profile):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/support_ticket
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}

spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

Set `DB_PASSWORD` in your environment to the password configured for your local MySQL container. Keep credentials out of source control.

The backend must include the MySQL Connector/J dependency. With Spring Boot dependency management, the version can be omitted:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 4. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

Or, if Maven 3.9+ is installed:

```bash
mvn spring-boot:run
```

Backend base URL:

```text
http://localhost:8080
```

### 5. Run the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (by default, `http://localhost:5173`).

## 🔌 API

Versioned support-ticket endpoint:

```text
/api/v1/support-tickets
```

The application also supports the backward-compatible mapping:

```text
/api/tickets
```

The API is served from `http://localhost:8080`.

> For exact request and response schemas, refer to the controller, DTOs, and validation annotations in the backend source.

## 🧪 Testing

Run the backend test suite:

```bash
cd backend
./mvnw test
```

The test suite includes ticket state-machine integration tests and validation tests. Tests use H2 so they can run without starting the local MySQL container, provided the test profile is configured accordingly.

## 🔄 Engineering Workflow

```text
Requirement
    ↓
Specification
    ↓
Plan / Tasks
    ↓
Implementation
    ↓
Testing
    ↓
Review
    ↓
Fix & Iterate
```

The repository keeps AI-assisted engineering work reviewable and repeatable:

| Directory / File | Purpose |
|---|---|
| `rules/` | Reusable engineering instructions |
| `spec/` | Requirements and specifications written before implementation |
| `.specstory/history/` | Prompt and interaction records |
| `docs/prompt-history.md` | Index of prompt history |
| `docs/ai-review.md` | Examples of AI suggestions that were reviewed and corrected where needed |
| `commands/` | Reusable review and test-generation commands |

## 📁 Project Structure

```text
ticket-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   └── package.json
├── commands/
├── docs/
│   ├── images/
│   │   └── ticket-dashboard.png
│   ├── ai-review.md
│   └── prompt-history.md
├── rules/
├── spec/
└── README.md
```

## 👨‍💻 Author

**Ankur Sharma**

Built as a full-stack engineering project using Java and modern web technologies.

---

<div align="center">
  <sub>Made to practice clean API design, persistence, validation, testing, and spec-driven development.</sub>
</div>
