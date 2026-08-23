package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.BulletinResponse;
import com.smartorienta.studentservice.dto.NoteRequest;
import com.smartorienta.studentservice.entity.Note;
import com.smartorienta.studentservice.service.JwtService;
import com.smartorienta.studentservice.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/students/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> saisirNote(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody NoteRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        Note note = noteService.saisirNote(userId, request);

        Map<String, Object> reponse = new HashMap<>();
        reponse.put("id", note.getId());
        reponse.put("matiere", note.getMatiere().getNom());
        reponse.put("coefficient", note.getMatiere().getCoefficient());
        reponse.put("valeur", note.getValeur());
        reponse.put("semestre", note.getSemestre());

        return ResponseEntity.status(HttpStatus.CREATED).body(reponse);
    }

    @GetMapping("/{semestre}")
    public ResponseEntity<BulletinResponse> getBulletin(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int semestre) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));

        return ResponseEntity.ok(noteService.getBulletin(userId, semestre));
    }
}