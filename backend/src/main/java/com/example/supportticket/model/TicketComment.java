package com.example.supportticket.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ticket_comments")
public class TicketComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "ticket_id", nullable = false) private Ticket ticket;
    @Column(nullable = false, length = 100) private String author;
    @Column(nullable = false, length = 5000) private String body;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate(){createdAt=Instant.now();}
    public Long getId(){return id;} public Ticket getTicket(){return ticket;} public void setTicket(Ticket t){ticket=t;}
    public String getAuthor(){return author;} public String getBody(){return body;} public Instant getCreatedAt(){return createdAt;}
    public void setAuthor(String v){author=v;} public void setBody(String v){body=v;}
}
