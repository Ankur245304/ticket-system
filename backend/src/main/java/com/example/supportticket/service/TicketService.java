package com.example.supportticket.service;

import com.example.supportticket.dto.*; import com.example.supportticket.model.*; import com.example.supportticket.repository.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class TicketService {
 private final TicketRepository tickets; private final TicketCommentRepository comments;
 private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED = Map.of(
   TicketStatus.OPEN, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED),
   TicketStatus.IN_PROGRESS, Set.of(TicketStatus.RESOLVED, TicketStatus.CANCELLED),
   TicketStatus.RESOLVED, Set.of(TicketStatus.CLOSED),
   TicketStatus.CLOSED, Set.of(), TicketStatus.CANCELLED, Set.of());
 public TicketService(TicketRepository tickets, TicketCommentRepository comments){this.tickets=tickets;this.comments=comments;}
 @Transactional public TicketResponse create(CreateTicketRequest r){ Ticket t=new Ticket(); t.setTitle(r.title().trim());t.setDescription(r.description().trim());t.setPriority(r.priority());t.setAssignee(blankToNull(r.assignee()));t.setStatus(TicketStatus.OPEN); return TicketResponse.from(tickets.save(t)); }
 @Transactional(readOnly=true) public List<TicketResponse> list(String keyword,TicketStatus status){return tickets.search(keyword==null?"":keyword.trim(),status).stream().map(TicketResponse::from).toList();}
 @Transactional(readOnly=true) public TicketResponse get(long id){return TicketResponse.from(find(id));}
 @Transactional public TicketResponse update(long id,UpdateTicketRequest r){Ticket t=find(id);t.setTitle(r.title().trim());t.setDescription(r.description().trim());t.setPriority(r.priority());t.setAssignee(blankToNull(r.assignee()));return TicketResponse.from(t);}
 @Transactional public TicketResponse transition(long id,TicketStatus next){Ticket t=find(id);if(t.getStatus()==next)return TicketResponse.from(t);if(!ALLOWED.getOrDefault(t.getStatus(),Set.of()).contains(next))throw new InvalidStatusTransitionException("Invalid transition: "+t.getStatus()+" -> "+next);t.setStatus(next);return TicketResponse.from(t);}
 @Transactional public CommentResponse addComment(long id,AddCommentRequest r){Ticket t=find(id);TicketComment c=new TicketComment();c.setAuthor(r.author().trim());c.setBody(r.body().trim());t.addComment(c);comments.save(c);return CommentResponse.from(c);}
 private Ticket find(long id){return tickets.findById(id).orElseThrow(()->new NoSuchElementException("Ticket not found"));}
 private String blankToNull(String s){return s==null||s.isBlank()?null:s.trim();}
}
