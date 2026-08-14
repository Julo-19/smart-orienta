package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.RiasecRequest;
import com.smartorienta.studentservice.entity.ProfilRiasec;
import com.smartorienta.studentservice.service.JwtService;
import com.smartorienta.studentservice.service.RiasecService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/riasec")
@RequiredArgsConstructor
public class RiasecController {

    private final RiasecService riasecService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<ProfilRiasec> enregistrer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody RiasecRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));

        ProfilRiasec riasec = riasecService.enregistrer(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(riasec);
    }
}