# API Contract
POST /api/tickets
GET /api/tickets?keyword=&status=
GET /api/tickets/{id}
PUT /api/tickets/{id}
PATCH /api/tickets/{id}/status
POST /api/tickets/{id}/comments

Errors use `{code,message,fields}`. Validation is HTTP 400; missing tickets are 404; invalid transitions are 400.
