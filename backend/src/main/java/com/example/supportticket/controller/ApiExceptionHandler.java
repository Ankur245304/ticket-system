package com.example.supportticket.controller;
import com.example.supportticket.service.InvalidStatusTransitionException; import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestControllerAdvice
public class ApiExceptionHandler {
 record ErrorResponse(String code,String message,Map<String,String> fields){}
 @ExceptionHandler(NoSuchElementException.class) ResponseEntity<ErrorResponse> notFound(NoSuchElementException e){return ResponseEntity.status(404).body(new ErrorResponse("NOT_FOUND",e.getMessage(),Map.of()));}
 @ExceptionHandler(InvalidStatusTransitionException.class) ResponseEntity<ErrorResponse> transition(InvalidStatusTransitionException e){return ResponseEntity.badRequest().body(new ErrorResponse("INVALID_STATUS_TRANSITION",e.getMessage(),Map.of()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e){Map<String,String> f=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(x->f.putIfAbsent(x.getField(),x.getDefaultMessage()));return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR","Request validation failed",f));}
}
