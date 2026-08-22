package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.QuestionnaireRequest;
import com.smartorienta.studentservice.dto.ReponseQuestion;
import com.smartorienta.studentservice.dto.RiasecRequest;
import com.smartorienta.studentservice.entity.ProfilRiasec;
import com.smartorienta.studentservice.entity.QuestionRiasec;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.ProfilRiasecRepository;
import com.smartorienta.studentservice.repository.QuestionRiasecRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiasecService {

    private final ProfilRiasecRepository profilRiasecRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final QuestionRiasecRepository questionRepository;

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

    public ProfilRiasec enregistrerDepuisQuestionnaire(Long userId, QuestionnaireRequest request) {

        if (request.getReponses() == null || request.getReponses().isEmpty()) {
            throw new BusinessException("Aucune réponse fournie");
        }

        // Les questions du référentiel, indexées par identifiant
        Map<Integer, QuestionRiasec> questions = questionRepository.findAll().stream()
                .collect(Collectors.toMap(QuestionRiasec::getId, q -> q));

        // Somme et nombre de réponses par dimension
        Map<String, Double> sommes = new HashMap<>();
        Map<String, Integer> compteurs = new HashMap<>();

        for (ReponseQuestion reponse : request.getReponses()) {

            QuestionRiasec question = questions.get(reponse.getQuestionId());
            if (question == null) {
                throw new BusinessException("Question inconnue : " + reponse.getQuestionId());
            }
            if (reponse.getValeur() == null || reponse.getValeur() < 1 || reponse.getValeur() > 5) {
                throw new BusinessException("La réponse à la question " + reponse.getQuestionId()
                        + " doit être comprise entre 1 et 5");
            }

            // Inversion éventuelle de l'échelle
            double valeur = question.isInversee() ? (6 - reponse.getValeur()) : reponse.getValeur();

            sommes.merge(question.getDimension(), valeur, Double::sum);
            compteurs.merge(question.getDimension(), 1, Integer::sum);
        }

        // Vérification : les six dimensions RIASEC doivent être renseignées
        for (String dim : List.of("R", "I", "A", "S", "E", "C")) {
            if (!compteurs.containsKey(dim)) {
                throw new BusinessException("Questionnaire incomplet : aucune réponse pour la dimension " + dim);
            }
        }

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé, veuillez le créer d'abord"));

        ProfilRiasec riasec = profilRiasecRepository
                .findByStudentProfileId(profile.getId())
                .orElse(new ProfilRiasec());

        riasec.setStudentProfile(profile);
        riasec.setScoreR(moyenne(sommes, compteurs, "R"));
        riasec.setScoreI(moyenne(sommes, compteurs, "I"));
        riasec.setScoreA(moyenne(sommes, compteurs, "A"));
        riasec.setScoreS(moyenne(sommes, compteurs, "S"));
        riasec.setScoreE(moyenne(sommes, compteurs, "E"));
        riasec.setScoreC(moyenne(sommes, compteurs, "C"));
        riasec.setStress(moyenne(sommes, compteurs, "STRESS"));
        riasec.setSocial(moyenne(sommes, compteurs, "SOCIAL"));
        riasec.setAutonomie(moyenne(sommes, compteurs, "AUTONOMIE"));
        riasec.setAdaptabilite(moyenne(sommes, compteurs, "ADAPTABILITE"));

        riasec.setCodeHolland(calculerCodeHolland(
                riasec.getScoreR(), riasec.getScoreI(), riasec.getScoreA(),
                riasec.getScoreS(), riasec.getScoreE(), riasec.getScoreC()));

        return profilRiasecRepository.save(riasec);
    }

    private double moyenne(Map<String, Double> sommes, Map<String, Integer> compteurs, String dimension) {
        Integer n = compteurs.get(dimension);
        if (n == null || n == 0) {
            return 0;
        }
        double m = sommes.get(dimension) / n;
        return Math.round(m * 100.0) / 100.0;
    }

    private String calculerCodeHolland(double r, double i, double a, double s, double e, double c) {
        Map<String, Double> scores = new LinkedHashMap<>();
        scores.put("R", r);
        scores.put("I", i);
        scores.put("A", a);
        scores.put("S", s);
        scores.put("E", e);
        scores.put("C", c);

        return scores.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(Map.Entry::getKey)
                .reduce("", String::concat);
    }
}