package com.example.supportticket.controller;

import com.example.supportticket.dto.AddCommentRequest;
import com.example.supportticket.dto.CommentResponse;
import com.example.supportticket.dto.CreateTicketRequest;
import com.example.supportticket.dto.StatusUpdateRequest;
import com.example.supportticket.dto.TicketResponse;
import com.example.supportticket.dto.UpdateTicketRequest;
import com.example.supportticket.model.TicketStatus;
import com.example.supportticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller exposing endpoints for support ticket management.
 * Mapped to both the versioned resource URI (/api/v1/support-tickets)
 * and backward-compatible URI (/api/tickets).
 */
@RestController
@RequestMapping({"/api/v1/support-tickets", "/api/tickets"})
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    /**
     * Creates a new support ticket.
     * Initial status is set to OPEN by default.
     *
     * @param request ticket creation payload containing title, description, priority, and optional assignee
     * @return 201 CREATED with the created ticket response
     */
    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    /**
     * Lists and filters support tickets.
     * Supports keyword search across title, description, and assignee, plus filtering by status.
     *
     * @param keyword search keyword parameter
     * @param search alternative alias for search parameter
     * @param status optional status filter (OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED)
     * @return list of matching ticket responses
     */
    @GetMapping
    public List<TicketResponse> list(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status) {
        // Use search query if provided, otherwise fallback to keyword
        String effectiveQuery = (search != null && !search.isBlank()) ? search : keyword;
        return service.list(effectiveQuery, status);
    }

    /**
     * Retrieves details for a specific support ticket by its ID.
     *
     * @param id ticket identifier
     * @return ticket response including comment history
     */
    @GetMapping("/{id}")
    public TicketResponse get(@PathVariable long id) {
        return service.get(id);
    }

    /**
     * Updates an existing ticket's details (title, description, priority, assignee).
     *
     * @param id ticket identifier
     * @param request update payload
     * @return updated ticket response
     */
    @PutMapping("/{id}")
    public TicketResponse update(@PathVariable long id, @Valid @RequestBody UpdateTicketRequest request) {
        return service.update(id, request);
    }

    /**
     * Transitions a ticket to a new status according to state machine rules.
     * Valid transitions:
     * - OPEN -> IN_PROGRESS, CANCELLED
     * - IN_PROGRESS -> RESOLVED, CANCELLED
     * - RESOLVED -> CLOSED
     *
     * @param id ticket identifier
     * @param request status update request
     * @return updated ticket response
     */
    @PatchMapping("/{id}/status")
    public TicketResponse updateStatus(@PathVariable long id, @Valid @RequestBody StatusUpdateRequest request) {
        return service.transition(id, request.status());
    }

    /**
     * Appends an internal or user comment to the ticket.
     *
     * @param id ticket identifier
     * @param request comment payload containing author and body
     * @return 201 CREATED with the created comment response
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable long id, @Valid @RequestBody AddCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addComment(id, request));
    }
}
