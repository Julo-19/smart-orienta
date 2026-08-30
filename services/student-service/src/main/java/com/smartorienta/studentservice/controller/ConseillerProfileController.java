package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.ConseillerProfileRequest;
import com.smartorienta.studentservice.dto.DossierEtudiant;
import com.smartorienta.studentservice.dto.EtudiantListItem;
import com.smartorienta.studentservice.entity.ConseillerProfile;
import com.smartorienta.studentservice.service.ConseillerProfileService;
import com.smartorienta.studentservice.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conseillers")
@RequiredArgsConstructor
public class ConseillerProfileController {

    private final ConseillerProfileService conseillerProfileService;
    private final JwtService jwtService;

    /** Création ou mise à jour du profil du conseiller connecté. */
    @PostMapping("/profile")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<Map<String, Object>> enregistrer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ConseillerProfileRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(versMap(conseillerProfileService.enregistrer(userId, request)));
    }

    /** Consultation de son propre profil. */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<Map<String, Object>> getMonProfil(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(versMap(conseillerProfileService.getMonProfil(userId)));
    }

    /** Liste des lycéens assignés au conseiller. */
    @GetMapping("/etudiants")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<List<EtudiantListItem>> getMesEtudiants(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(conseillerProfileService.getMesEtudiants(userId));
    }

    /** Dossier complet d'un lycéen, sous réserve qu'il soit assigné au conseiller. */
    @GetMapping("/etudiants/{profileId}")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<DossierEtudiant> getDossierEtudiant(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long profileId) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(conseillerProfileService.getDossierEtudiant(userId, profileId));
    }

    /**
     * Convertit le profil en structure plate.
     * Une entité JPA n'est jamais renvoyée telle quelle : ses relations
     * produiraient une sérialisation en cascade, voire circulaire.
     */
    private Map<String, Object> versMap(ConseillerProfile p) {
        Map<String, Object> reponse = new HashMap<>();
        reponse.put("id", p.getId());
        reponse.put("userId", p.getUserId());
        reponse.put("etablissement", p.getEtablissement());
        reponse.put("specialite", p.getSpecialite());
        return reponse;
    }

    /** Tous les conseillers avec leur charge — réservé à l'administration. */
    @GetMapping("/admin/tous")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> tousLesConseillers() {
        return ResponseEntity.ok(conseillerProfileService.tousLesConseillers());
    }
}