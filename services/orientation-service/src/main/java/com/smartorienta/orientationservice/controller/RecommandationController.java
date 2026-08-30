package com.smartorienta.orientationservice.controller;

import com.smartorienta.orientationservice.dto.ModificationRequest;
import com.smartorienta.orientationservice.dto.RejetRequest;
import com.smartorienta.orientationservice.dto.StatistiquesResponse;
import com.smartorienta.orientationservice.dto.ValidationRequest;
import com.smartorienta.orientationservice.entity.Orientation;
import com.smartorienta.orientationservice.entity.Recommandation;
import com.smartorienta.orientationservice.repository.OrientationRepository;
import com.smartorienta.orientationservice.service.JwtService;
import com.smartorienta.orientationservice.service.RecommandationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orientations")
@RequiredArgsConstructor
public class RecommandationController {

    private final RecommandationService recommandationService;
    private final JwtService jwtService;
    private final OrientationRepository orientationRepository;

    // ─────────── Côté lycéen ───────────

    /** Demande une nouvelle recommandation. */
    @PostMapping("/recommandations")
    @PreAuthorize("hasRole('LYCEEN')")
    public ResponseEntity<Recommandation> demander(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recommandationService.genererPour(userId));
    }

    /** Historique de ses recommandations. */
    @GetMapping("/recommandations")
    @PreAuthorize("hasRole('LYCEEN')")
    public ResponseEntity<List<Recommandation>> mesRecommandations(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(recommandationService.historiqueEtudiant(userId));
    }

    // ─────────── Côté conseiller ───────────

    /** Recommandations en attente de décision. */
    @GetMapping("/en-attente")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<List<Recommandation>> enAttente() {
        return ResponseEntity.ok(recommandationService.toutesEnAttente());
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<Recommandation> valider(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ValidationRequest request) {

        Long conseillerId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(
                recommandationService.valider(id, conseillerId, request.getCommentaire()));
    }

    @PostMapping("/{id}/modifier")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<Recommandation> modifier(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ModificationRequest request) {

        Long conseillerId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(recommandationService.modifier(
                id, conseillerId, request.getNouvelleBranche(), request.getCommentaire()));
    }

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('CONSEILLER')")
    public ResponseEntity<Recommandation> rejeter(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody RejetRequest request) {

        Long conseillerId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(
                recommandationService.rejeter(id, conseillerId, request.getMotif()));
    }

    /** Liste des filières disponibles, pour le choix du conseiller. */
    @GetMapping("/filieres")
    @PreAuthorize("hasAnyRole('CONSEILLER','ADMIN')")
    public ResponseEntity<List<Orientation>> filieres() {
        return ResponseEntity.ok(orientationRepository.findAllByOrderByCategorieAscLibelleAsc());
    }

    // ─────────── Côté administration ───────────

    /** Statistiques d'ensemble pour le tableau de bord d'administration. */
    @GetMapping("/admin/statistiques")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatistiquesResponse> statistiques() {
        return ResponseEntity.ok(recommandationService.statistiques());
    }
}