package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.RiasecRequest;
import com.smartorienta.studentservice.entity.ProfilRiasec;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.ProfilRiasecRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RiasecService {

    private final ProfilRiasecRepository profilRiasecRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ProfilRiasec enregistrer(Long userId, RiasecRequest request) {

        // 1. Validation : toutes les valeurs sur l'échelle 1 à 5
        verifierEchelle(request.getScoreR(), "score R");
        verifierEchelle(request.getScoreI(), "score I");
        verifierEchelle(request.getScoreA(), "score A");
        verifierEchelle(request.getScoreS(), "score S");
        verifierEchelle(request.getScoreE(), "score E");
        verifierEchelle(request.getScoreC(), "score C");
        verifierEchelle(request.getStress(), "stress");
        verifierEchelle(request.getSocial(), "social");
        verifierEchelle(request.getAutonomie(), "autonomie");
        verifierEchelle(request.getAdaptabilite(), "adaptabilité");

        // 2. Le profil du lycéen
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé, veuillez le créer d'abord"));

        // 3. Création ou mise à jour (upsert)
        ProfilRiasec riasec = profilRiasecRepository
                .findByStudentProfileId(profile.getId())
                .orElse(new ProfilRiasec());

        riasec.setStudentProfile(profile);
        riasec.setScoreR(request.getScoreR());
        riasec.setScoreI(request.getScoreI());
        riasec.setScoreA(request.getScoreA());
        riasec.setScoreS(request.getScoreS());
        riasec.setScoreE(request.getScoreE());
        riasec.setScoreC(request.getScoreC());
        riasec.setStress(request.getStress());
        riasec.setSocial(request.getSocial());
        riasec.setAutonomie(request.getAutonomie());
        riasec.setAdaptabilite(request.getAdaptabilite());

        // 4. Le code Holland est calculé, jamais saisi
        riasec.setCodeHolland(calculerCodeHolland(request));

        return profilRiasecRepository.save(riasec);
    }

    private void verifierEchelle(double valeur, String libelle) {
        if (valeur < 1 || valeur > 5) {
            throw new BusinessException("Le " + libelle + " doit être compris entre 1 et 5");
        }
    }

   //calcul code Holland
    private String calculerCodeHolland(RiasecRequest r) {

        Map<String, Double> scores = new LinkedHashMap<>();
        scores.put("R", r.getScoreR());
        scores.put("I", r.getScoreI());
        scores.put("A", r.getScoreA());
        scores.put("S", r.getScoreS());
        scores.put("E", r.getScoreE());
        scores.put("C", r.getScoreC());

        return scores.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(Map.Entry::getKey)
                .reduce("", String::concat);
    }

    public ProfilRiasec getMonProfil(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé"));

        return profilRiasecRepository.findByStudentProfileId(profile.getId())
                .orElseThrow(() -> new BusinessException("Aucun profil RIASEC enregistré"));
    }
}