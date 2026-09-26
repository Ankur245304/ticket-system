# API Contract

## Primary Endpoints (Version 1)
- `POST /api/v1/support-tickets` — Create a new support ticket (default status: OPEN)
- `GET /api/v1/support-tickets?search=&keyword=&status=` — List and filter tickets (supports case-insensitive partial matches across title, description, and assignee, plus a status filter)
- `GET /api/v1/support-tickets/{id}` — Get ticket details including discussion comments
- `PUT /api/v1/support-tickets/{id}` — Update ticket title, description, priority, and assignee
- `PATCH /api/v1/support-tickets/{id}/status` — Transition ticket status according to state machine rules
- `POST /api/v1/support-tickets/{id}/comments` — Append a comment to a ticket

## Backward Compatibility Endpoints
The backend controller also maps legacy endpoints for compatibility:
- `POST /api/tickets`
- `GET /api/tickets?keyword=&status=`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}`
- `PATCH /api/tickets/{id}/status`
- `POST /api/tickets/{id}/comments`

## Error Response Format
All errors return a consistent error envelope:
```json
{
  "code": "VALIDATION_FAILED | INVALID_TRANSITION | NOT_FOUND | ERROR",
  "message": "Human-readable description of error",
  "fields": {
    "fieldName": "Validation message"
  }
}
```

- Validation errors: HTTP 400
- Invalid status transitions: HTTP 400
- Non-existent resources: HTTP 404
