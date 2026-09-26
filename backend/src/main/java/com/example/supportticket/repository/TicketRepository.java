package com.example.supportticket.repository;

import com.example.supportticket.model.Ticket;
import com.example.supportticket.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Search the user-facing text fields, including the optional assignee.
    @Query("select distinct t from Ticket t left join fetch t.comments where (:status is null or t.status = :status) and (:keyword = '' or lower(t.title) like lower(concat('%', :keyword, '%')) or lower(t.description) like lower(concat('%', :keyword, '%')) or lower(coalesce(t.assignee, '')) like lower(concat('%', :keyword, '%'))) order by t.updatedAt desc")
    List<Ticket> search(@Param("keyword") String keyword, @Param("status") TicketStatus status);
}
