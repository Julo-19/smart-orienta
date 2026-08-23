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

import java.util.List;

@RestController
@RequestMapping("/api/conseillers")
@RequiredArgsConstructor
public class ConseillerProfileController {

    private final ConseillerProfileService conseillerProfileService;
    private final JwtService jwtService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<ConseillerProfile> enregistrer(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ConseillerProfileRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conseillerProfileService.enregistrer(userId, request));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<ConseillerProfile> getMonProfil(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(conseillerProfileService.getMonProfil(userId));
    }

    @GetMapping("/etudiants")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<List<EtudiantListItem>> getMesEtudiants(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(conseillerProfileService.getMesEtudiants(userId));
    }

    @GetMapping("/etudiants/{profileId}")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<DossierEtudiant> getDossierEtudiant(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long profileId) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(conseillerProfileService.getDossierEtudiant(userId, profileId));
    }
}