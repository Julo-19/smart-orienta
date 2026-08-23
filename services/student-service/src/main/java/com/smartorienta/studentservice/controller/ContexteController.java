package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.ContexteRequest;
import com.smartorienta.studentservice.entity.Contexte;
import com.smartorienta.studentservice.service.ContexteService;
import com.smartorienta.studentservice.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/students/contexte")
@RequiredArgsConstructor
public class ContexteController {

    private final ContexteService contexteService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> enregistrer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ContexteRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        Contexte contexte = contexteService.enregistrer(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(versMap(contexte));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMonContexte(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(versMap(contexteService.getMonContexte(userId)));
    }

    private Map<String, Object> versMap(Contexte c) {
        Map<String, Object> reponse = new HashMap<>();
        reponse.put("contraintes", c.getContraintes());
        reponse.put("passions", c.getPassions());
        reponse.put("filieresRefusees", c.getFilieresRefusees());
        reponse.put("messageConseiller", c.getMessageConseiller());
        return reponse;
    }
}