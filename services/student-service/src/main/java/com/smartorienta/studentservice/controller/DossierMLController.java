package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.DossierMLResponse;
import com.smartorienta.studentservice.service.DossierMLService;
import com.smartorienta.studentservice.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/dossier-ml")
@RequiredArgsConstructor
public class DossierMLController {

    private final DossierMLService dossierMLService;
    private final JwtService jwtService;

    /** Dossier du lycéen connecté, au format attendu par le module de prédiction. */
    @GetMapping
    public ResponseEntity<DossierMLResponse> getMonDossier(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(dossierMLService.construireDossier(userId));
    }

    /** Dossier d'un lycéen donné — destiné à l'appel inter-services. */
    @GetMapping("/{userId}")
    public ResponseEntity<DossierMLResponse> getDossier(@PathVariable Long userId) {
        return ResponseEntity.ok(dossierMLService.construireDossier(userId));
    }
}