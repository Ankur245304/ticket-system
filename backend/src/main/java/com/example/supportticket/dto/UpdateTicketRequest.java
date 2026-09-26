package com.example.supportticket.dto;
import com.example.supportticket.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record UpdateTicketRequest(@NotBlank @Size(max=200) String title, @NotBlank @Size(max=5000) String description, @NotNull TicketPriority priority, @Size(max=200) String assignee) {}
