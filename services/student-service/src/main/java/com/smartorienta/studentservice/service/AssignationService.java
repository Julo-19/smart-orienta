package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.entity.ConseillerProfile;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.repository.ConseillerProfileRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignationService {

    private final ConseillerProfileRepository conseillerProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    /**
     * Détermine le conseiller à assigner à un lycéen, selon une cascade de critères :
     * même établissement et spécialité correspondante, puis même établissement,
     * puis spécialité correspondante, puis le conseiller le moins chargé.
     * Retourne null si aucun conseiller n'est disponible.
     */
    public Long trouverConseiller(StudentProfile profile) {

        String etablissement = profile.getEtablissement();
        String specialite = deduireSpecialite(profile.getSerie().getCode());

        // 1. Même établissement ET spécialité correspondante
        List<ConseillerProfile> candidats =
                conseillerProfileRepository.findByEtablissementAndSpecialite(etablissement, specialite);

        // 2. Même établissement, quelle que soit la spécialité
        if (candidats.isEmpty()) {
            candidats = conseillerProfileRepository.findByEtablissement(etablissement);
        }

        // 3. Spécialité correspondante, quel que soit l'établissement
        if (candidats.isEmpty()) {
            candidats = conseillerProfileRepository.findBySpecialite(specialite);
        }

        // 4. Tous les conseillers
        if (candidats.isEmpty()) {
            candidats = conseillerProfileRepository.findAll();
        }

        // Aucun conseiller enregistré dans le système
        if (candidats.isEmpty()) {
            return null;
        }

        // Parmi les candidats retenus, celui qui suit le moins de lycéens
        return candidats.stream()
                .min(Comparator.comparingLong(
                        c -> studentProfileRepository.countByConseillerId(c.getUserId())))
                .map(ConseillerProfile::getUserId)
                .orElse(null);
    }

    /**
     * Déduit la famille de spécialité à partir du code de la série.
     */
    private String deduireSpecialite(String codeSerie) {
        if (codeSerie == null || codeSerie.isBlank()) {
            return null;
        }
        char famille = codeSerie.charAt(0);
        return switch (famille) {
            case 'S' -> "Sciences";
            case 'L' -> "Lettres";
            case 'G' -> "Gestion";
            default -> null;
        };
    }
}