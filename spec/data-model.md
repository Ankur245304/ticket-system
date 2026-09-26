# Data Model
Ticket: id, title, description, priority, status, assignee, createdAt, updatedAt.
TicketComment: id, ticket_id, author, body, createdAt.

Ticket has one-to-many comments with cascading persistence and orphan removal.
