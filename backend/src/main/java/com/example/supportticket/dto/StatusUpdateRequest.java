package com.example.supportticket.dto;
import com.example.supportticket.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
public record StatusUpdateRequest(@NotNull TicketStatus status) {}
