package com.smartorienta.orientationservice.service;

import com.smartorienta.orientationservice.dto.DecisionEvent;
import com.smartorienta.orientationservice.entity.Recommandation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Publie les décisions des conseillers sur le courtier de messages.
 *
 * La publication est volontairement tolérante aux pannes : une
 * indisponibilité du courtier ne doit jamais empêcher un conseiller
 * de statuer. La notification est un service annexe, non une condition.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EvenementPublisher {

    public static final String SUJET = "decisions-conseiller";

    private final KafkaTemplate<String, DecisionEvent> kafkaTemplate;

    public void publierDecision(Recommandation reco) {
        try {
            DecisionEvent evenement = new DecisionEvent(
                    reco.getId(),
                    reco.getEtudiantUserId(),
                    reco.getConseillerUserId(),
                    reco.getStatut().name(),
                    reco.getBranche(),
                    reco.getBrancheFinale(),
                    reco.getCommentaireConseiller(),
                    reco.getDateDecision() != null
                            ? reco.getDateDecision().format(DateTimeFormatter.ISO_DATE_TIME)
                            : null);

            kafkaTemplate.send(SUJET, String.valueOf(reco.getEtudiantUserId()), evenement);
            log.info("Décision publiée : recommandation {} — {}", reco.getId(), reco.getStatut());

        } catch (Exception e) {
            log.error("La décision {} n'a pu être publiée : {}", reco.getId(), e.getMessage());
        }
    }
}