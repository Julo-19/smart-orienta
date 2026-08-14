package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.NoteRequest;
import com.smartorienta.studentservice.entity.Note;
import com.smartorienta.studentservice.service.JwtService;
import com.smartorienta.studentservice.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Note> saisirNote(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody NoteRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));

        Note note = noteService.saisirNote(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }
}