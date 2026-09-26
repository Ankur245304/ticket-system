package com.example.supportticket.repository;
import com.example.supportticket.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {}
