# State Machine
OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
OPEN -> CANCELLED
IN_PROGRESS -> CANCELLED

Terminal states: CLOSED, CANCELLED.
Backend is authoritative and rejects all other transitions.
