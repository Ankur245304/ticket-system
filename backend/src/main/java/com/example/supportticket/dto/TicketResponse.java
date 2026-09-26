package com.example.supportticket.dto;
import com.example.supportticket.model.*;
import java.time.Instant; import java.util.List;
public record TicketResponse(Long id,String title,String description,TicketPriority priority,TicketStatus status,String assignee,Instant createdAt,Instant updatedAt,List<CommentResponse> comments){
 public static TicketResponse from(Ticket t){return new TicketResponse(t.getId(),t.getTitle(),t.getDescription(),t.getPriority(),t.getStatus(),t.getAssignee(),t.getCreatedAt(),t.getUpdatedAt(),t.getComments().stream().map(CommentResponse::from).toList());}
}
