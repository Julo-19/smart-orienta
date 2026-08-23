package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.QuestionnaireRequest;
import com.smartorienta.studentservice.dto.RiasecRequest;
import com.smartorienta.studentservice.entity.ProfilRiasec;
import com.smartorienta.studentservice.service.JwtService;
import com.smartorienta.studentservice.service.RiasecService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/students/riasec")
@RequiredArgsConstructor
public class RiasecController {

    private final RiasecService riasecService;
    private final JwtService jwtService;

    /** Enregistrement direct des scores (import, tests). */
    @PostMapping
    public ResponseEntity<Map<String, Object>> enregistrer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody RiasecRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        ProfilRiasec riasec = riasecService.enregistrer(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(versMap(riasec));
    }

    /** Consultation du profil psychométrique du lycéen connecté. */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMonRiasec(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(versMap(riasecService.getMonProfil(userId)));
    }

    /** Soumission des réponses au questionnaire : les scores sont calculés par le service. */
    @PostMapping("/reponses")
    public ResponseEntity<Map<String, Object>> soumettreQuestionnaire(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody QuestionnaireRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        ProfilRiasec riasec = riasecService.enregistrerDepuisQuestionnaire(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(versMap(riasec));
    }

    private Map<String, Object> versMap(ProfilRiasec r) {
        Map<String, Object> reponse = new HashMap<>();
        reponse.put("scoreR", r.getScoreR());
        reponse.put("scoreI", r.getScoreI());
        reponse.put("scoreA", r.getScoreA());
        reponse.put("scoreS", r.getScoreS());
        reponse.put("scoreE", r.getScoreE());
        reponse.put("scoreC", r.getScoreC());
        reponse.put("codeHolland", r.getCodeHolland());
        reponse.put("stress", r.getStress());
        reponse.put("social", r.getSocial());
        reponse.put("autonomie", r.getAutonomie());
        reponse.put("adaptabilite", r.getAdaptabilite());
        return reponse;
    }
}