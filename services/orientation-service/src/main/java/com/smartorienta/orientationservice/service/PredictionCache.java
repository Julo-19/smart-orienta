package com.smartorienta.orientationservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartorienta.orientationservice.dto.DossierMLResponse;
import com.smartorienta.orientationservice.dto.PredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Optional;

/**
 * Conserve les prédictions déjà produites.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionCache {

    private static final String PREFIXE = "prediction:";
    private static final Duration DUREE = Duration.ofHours(24);
    

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper = new ObjectMapper();

    public Optional<PredictionResponse> lire(DossierMLResponse dossier) {
        try {
            String valeur = redis.opsForValue().get(PREFIXE + empreinte(dossier));
            if (valeur == null) {
                return Optional.empty();
            }
            log.info("Prédiction servie depuis le cache");
            return Optional.of(mapper.readValue(valeur, PredictionResponse.class));

        } catch (Exception e) {
            // Une défaillance du cache ne doit jamais empêcher la prédiction
            log.warn("Lecture du cache impossible : {}", e.getMessage());
            return Optional.empty();
        }
    }

    public void ecrire(DossierMLResponse dossier, PredictionResponse prediction) {
        try {
            redis.opsForValue().set(
                    PREFIXE + empreinte(dossier),
                    mapper.writeValueAsString(prediction),
                    DUREE);
        } catch (Exception e) {
            log.warn("Écriture dans le cache impossible : {}", e.getMessage());
        }
    }

    /**
     * Empreinte du dossier : deux dossiers identiques produisent la même
     * chaîne, deux dossiers différents en produisent de distinctes.
     */
    private String empreinte(DossierMLResponse d) throws Exception {

        String contenu = String.join("|",
                String.valueOf(d.getSerie()),
                String.valueOf(d.getNomSpe1()),  String.valueOf(d.getNomSpe2()),
                String.valueOf(d.getNoteMaths()), String.valueOf(d.getNoteFrancais()),
                String.valueOf(d.getNoteAnglais()), String.valueOf(d.getNoteHg()),
                String.valueOf(d.getNotePhilo()), String.valueOf(d.getNoteSpe1()),
                String.valueOf(d.getNoteSpe2()),
                String.valueOf(d.getScoreR()), String.valueOf(d.getScoreI()),
                String.valueOf(d.getScoreA()), String.valueOf(d.getScoreS()),
                String.valueOf(d.getScoreE()), String.valueOf(d.getScoreC()),
                String.valueOf(d.getStress()), String.valueOf(d.getSocial()),
                String.valueOf(d.getAutonomie()), String.valueOf(d.getAdaptabilite()));

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] empreinte = digest.digest(contenu.getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder();
        for (byte b : empreinte) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}