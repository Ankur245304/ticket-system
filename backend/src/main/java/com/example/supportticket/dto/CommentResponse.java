package com.example.supportticket.dto;
import com.example.supportticket.model.TicketComment;
import java.time.Instant;
public record CommentResponse(Long id,String author,String body,Instant createdAt){ public static CommentResponse from(TicketComment c){return new CommentResponse(c.getId(),c.getAuthor(),c.getBody(),c.getCreatedAt());}}
