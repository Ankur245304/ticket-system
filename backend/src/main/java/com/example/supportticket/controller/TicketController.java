package com.example.supportticket.controller;
import com.example.supportticket.dto.*; import com.example.supportticket.model.TicketStatus; import com.example.supportticket.service.TicketService;
import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/tickets")
public class TicketController {
 private final TicketService service; public TicketController(TicketService service){this.service=service;}
 @PostMapping public ResponseEntity<TicketResponse> create(@Valid @RequestBody CreateTicketRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));}
 @GetMapping public List<TicketResponse> list(@RequestParam(required=false,defaultValue="") String keyword,@RequestParam(required=false) TicketStatus status){return service.list(keyword,status);}
 @GetMapping("/{id}") public TicketResponse get(@PathVariable long id){return service.get(id);}
 @PutMapping("/{id}") public TicketResponse update(@PathVariable long id,@Valid @RequestBody UpdateTicketRequest r){return service.update(id,r);}
 @PatchMapping("/{id}/status") public TicketResponse status(@PathVariable long id,@Valid @RequestBody StatusUpdateRequest r){return service.transition(id,r.status());}
 @PostMapping("/{id}/comments") public ResponseEntity<CommentResponse> comment(@PathVariable long id,@Valid @RequestBody AddCommentRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.addComment(id,r));}
}
