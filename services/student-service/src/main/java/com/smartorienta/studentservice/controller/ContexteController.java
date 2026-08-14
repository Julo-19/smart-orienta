package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.ContexteRequest;
import com.smartorienta.studentservice.entity.Contexte;
import com.smartorienta.studentservice.service.ContexteService;
import com.smartorienta.studentservice.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/contexte")
@RequiredArgsConstructor
public class ContexteController {

    private final ContexteService contexteService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Contexte> enregistrer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ContexteRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));

        Contexte contexte = contexteService.enregistrer(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contexte);
    }
}