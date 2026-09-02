package com.smartorienta.notificationservice.service;

import com.smartorienta.notificationservice.dto.DecisionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class DecisionConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "decisions-conseiller", groupId = "notification-service")
    public void consommer(DecisionEvent evenement) {
        log.info("Décision reçue : recommandation {} — {}",
                evenement.getRecommandationId(), evenement.getStatut());
        notificationService.traiterDecision(evenement);
    }
}