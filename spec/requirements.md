# Requirements Specification

## Functional requirements
1. Create a ticket.
2. List tickets.
3. View ticket details.
4. Update title, description, priority and assignee.
5. Add comments.
6. Search tickets by keyword across title, description, and assignee.
7. Filter by status.
8. Persist data in a database.
9. Validate input at backend.
10. Display meaningful UI errors.

## State machine
- OPEN -> IN_PROGRESS
- OPEN -> CANCELLED
- IN_PROGRESS -> RESOLVED
- IN_PROGRESS -> CANCELLED
- RESOLVED -> CLOSED
- CLOSED -> no transitions
- CANCELLED -> no transitions

Invalid transitions are rejected by the backend.
