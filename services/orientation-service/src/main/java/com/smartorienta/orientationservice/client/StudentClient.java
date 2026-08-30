package com.smartorienta.orientationservice.client;

import com.smartorienta.orientationservice.dto.DossierMLResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "student-service", url = "${student-service.url}")
public interface StudentClient {

    /** Dossier complet d'un lycéen, au format attendu par le modèle. */
    @GetMapping("/api/students/dossier-ml/{userId}")
    DossierMLResponse getDossier(@PathVariable("userId") Long userId);

    /** Identifiants des lycéens suivis par un conseiller. */
    @GetMapping("/api/students/internal/etudiants-de/{conseillerUserId}")
    List<Long> getEtudiantsDe(@PathVariable("conseillerUserId") Long conseillerUserId);
}