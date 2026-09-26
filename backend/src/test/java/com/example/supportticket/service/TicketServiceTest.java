package com.example.supportticket.service;
import com.example.supportticket.dto.*; import com.example.supportticket.model.*; import com.example.supportticket.repository.*;
import org.junit.jupiter.api.*; import org.springframework.beans.factory.annotation.Autowired; import org.springframework.boot.test.context.SpringBootTest; import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @Transactional
class TicketServiceTest {
 @Autowired TicketService service; @Autowired TicketRepository repo;
 private long ticket(){return service.create(new CreateTicketRequest("Login issue","Cannot log in",TicketPriority.HIGH,"Alice")).id();}
 @Test void validLifecycleWorks(){long id=ticket();assertEquals(TicketStatus.OPEN,service.get(id).status());service.transition(id,TicketStatus.IN_PROGRESS);service.transition(id,TicketStatus.RESOLVED);service.transition(id,TicketStatus.CLOSED);assertEquals(TicketStatus.CLOSED,service.get(id).status());}
 @Test void cancellationFromOpenWorks(){long id=ticket();service.transition(id,TicketStatus.CANCELLED);assertEquals(TicketStatus.CANCELLED,service.get(id).status());}
 @Test void cancellationFromInProgressWorks(){long id=ticket();service.transition(id,TicketStatus.IN_PROGRESS);service.transition(id,TicketStatus.CANCELLED);assertEquals(TicketStatus.CANCELLED,service.get(id).status());}
 @Test void invalidTransitionsRejected(){long id=ticket();assertThrows(InvalidStatusTransitionException.class,()->service.transition(id,TicketStatus.RESOLVED));service.transition(id,TicketStatus.IN_PROGRESS);service.transition(id,TicketStatus.RESOLVED);assertThrows(InvalidStatusTransitionException.class,()->service.transition(id,TicketStatus.OPEN));service.transition(id,TicketStatus.CLOSED);assertThrows(InvalidStatusTransitionException.class,()->service.transition(id,TicketStatus.OPEN));}
 @Test void commentsArePersisted(){long id=ticket();service.addComment(id,new AddCommentRequest("Bob","Investigating"));assertEquals(1,service.get(id).comments().size());}
}
