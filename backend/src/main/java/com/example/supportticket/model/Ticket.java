package com.example.supportticket.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200) private String title;
    @Column(nullable = false, length = 5000) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private TicketPriority priority;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private TicketStatus status;
    @Column(length = 200) private String assignee;
    @Column(nullable = false, updatable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC") private List<TicketComment> comments = new ArrayList<>();

    @PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
    public void addComment(TicketComment comment) { comments.add(comment); comment.setTicket(this); }

    public Long getId(){return id;} public String getTitle(){return title;} public String getDescription(){return description;}
    public TicketPriority getPriority(){return priority;} public TicketStatus getStatus(){return status;} public String getAssignee(){return assignee;}
    public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;} public List<TicketComment> getComments(){return comments;}
    public void setTitle(String v){title=v;} public void setDescription(String v){description=v;} public void setPriority(TicketPriority v){priority=v;}
    public void setStatus(TicketStatus v){status=v;} public void setAssignee(String v){assignee=v;}
}
