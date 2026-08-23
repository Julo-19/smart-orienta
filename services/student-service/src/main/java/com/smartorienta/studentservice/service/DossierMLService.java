package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.DossierMLResponse;
import com.smartorienta.studentservice.entity.Note;
import com.smartorienta.studentservice.entity.ProfilRiasec;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.NoteRepository;
import com.smartorienta.studentservice.repository.ProfilRiasecRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DossierMLService {

    private final StudentProfileRepository studentProfileRepository;
    private final NoteRepository noteRepository;
    private final ProfilRiasecRepository profilRiasecRepository;

    public DossierMLResponse construireDossier(Long userId) {

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé"));

        String serie = profile.getSerie() != null ? profile.getSerie().getCode() : null;
        String spe1 = SpecialiteMapper.getSpe1(serie);
        String spe2 = SpecialiteMapper.getSpe2(serie);

        // Moyenne des notes par matière, tous semestres confondus
        Map<String, Double> moyennes = noteRepository.findByStudentProfileId(profile.getId())
                .stream()
                .collect(Collectors.groupingBy(
                        n -> n.getMatiere().getNom(),
                        Collectors.averagingDouble(Note::getValeur)));

        Double noteMaths     = arrondir(moyennes.get("Mathématiques"));
        Double noteFrancais  = arrondir(moyennes.get("Français"));
        Double noteAnglais   = arrondir(moyennes.get("Anglais"));
        Double noteHg        = arrondir(moyennes.get("Histoire-Géographie"));
        Double notePhilo     = arrondir(moyennes.get("Philosophie"));
        Double noteSpe1      = spe1 != null ? arrondir(moyennes.get(spe1)) : null;
        Double noteSpe2      = spe2 != null ? arrondir(moyennes.get(spe2)) : null;

        ProfilRiasec riasec = profilRiasecRepository
                .findByStudentProfileId(profile.getId())
                .orElse(null);

        // Contrôle de complétude
        List<String> manquants = new ArrayList<>();
        if (serie == null)        manquants.add("la série");
        if (noteMaths == null)    manquants.add("la note de mathématiques");
        if (noteFrancais == null) manquants.add("la note de français");
        if (noteAnglais == null)  manquants.add("la note d'anglais");
        if (notePhilo == null)    manquants.add("la note de philosophie");
        if (spe1 != null && noteSpe1 == null) manquants.add("la note de " + spe1);
        if (riasec == null)       manquants.add("le profil RIASEC");

        boolean complet = manquants.isEmpty();
        String message = complet ? null : "Éléments manquants : " + String.join(", ", manquants);

        return new DossierMLResponse(
                profile.getUserId(), complet, message,
                serie, spe1, spe2,
                noteMaths, noteFrancais, noteAnglais, noteHg, notePhilo, noteSpe1, noteSpe2,
                riasec != null ? riasec.getScoreR() : null,
                riasec != null ? riasec.getScoreI() : null,
                riasec != null ? riasec.getScoreA() : null,
                riasec != null ? riasec.getScoreS() : null,
                riasec != null ? riasec.getScoreE() : null,
                riasec != null ? riasec.getScoreC() : null,
                riasec != null ? riasec.getCodeHolland() : null,
                riasec != null ? riasec.getStress() : null,
                riasec != null ? riasec.getSocial() : null,
                riasec != null ? riasec.getAutonomie() : null,
                riasec != null ? riasec.getAdaptabilite() : null);
    }

    private Double arrondir(Double valeur) {
        return valeur == null ? null : Math.round(valeur * 100.0) / 100.0;
    }
}