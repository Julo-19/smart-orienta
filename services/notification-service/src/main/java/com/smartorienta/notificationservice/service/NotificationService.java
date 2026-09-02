package com.smartorienta.notificationservice.service;

import com.smartorienta.notificationservice.client.AuthClient;
import com.smartorienta.notificationservice.dto.DecisionEvent;
import com.smartorienta.notificationservice.dto.UserInfo;
import com.smartorienta.notificationservice.entity.Notification;
import com.smartorienta.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final AuthClient authClient;

    /**
     * Traite une décision de conseiller : compose le message et l'adresse
     * au lycéen concerné. L'envoi est tracé en base, qu'il réussisse ou non.
     */
    public void traiterDecision(DecisionEvent evenement) {

        // Un événement relu ne doit pas produire un second courriel
        if (notificationRepository.existsByRecommandationId(evenement.getRecommandationId())) {
            log.info("Recommandation {} déjà notifiée, message ignoré",
                    evenement.getRecommandationId());
            return;
        }

        Notification notification = new Notification();
        notification.setRecommandationId(evenement.getRecommandationId());
        notification.setDestinataireUserId(evenement.getEtudiantUserId());
        notification.setStatutDecision(evenement.getStatut());
        notification.setDateCreation(LocalDateTime.now());

        try {
            UserInfo destinataire = authClient.getUtilisateur(evenement.getEtudiantUserId());
            notification.setDestinataireEmail(destinataire.getEmail());

            String objet = composerObjet(evenement.getStatut());
            String corps = composerCorps(destinataire, evenement);
            notification.setContenu(corps);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(destinataire.getEmail());
            message.setSubject(objet);
            message.setText(corps);
            mailSender.send(message);

            notification.setEnvoyee(true);
            notification.setDateEnvoi(LocalDateTime.now());
            log.info("Notification transmise à {} pour la recommandation {}",
                    destinataire.getEmail(), evenement.getRecommandationId());

        } catch (Exception e) {
            notification.setEnvoyee(false);
            notification.setMessageErreur(e.getMessage());
            log.error("Échec de la notification pour la recommandation {} : {}",
                    evenement.getRecommandationId(), e.getMessage());
        }

        notificationRepository.save(notification);
    }

    private String composerObjet(String statut) {
        return switch (statut) {
            case "VALIDEE"  -> "Votre orientation a été validée";
            case "MODIFIEE" -> "Votre conseiller a ajusté votre orientation";
            case "REJETEE"  -> "Votre dossier d'orientation nécessite une révision";
            default         -> "Mise à jour de votre dossier d'orientation";
        };
    }

    private String composerCorps(UserInfo destinataire, DecisionEvent e) {

        StringBuilder corps = new StringBuilder();
        corps.append("Bonjour ").append(destinataire.getPrenom()).append(",\n\n");

        switch (e.getStatut()) {
            case "VALIDEE" -> corps
                    .append("Votre conseiller d'orientation a examiné votre dossier ")
                    .append("et confirme la filière proposée :\n\n")
                    .append("    ").append(e.getBranche()).append("\n\n");

            case "MODIFIEE" -> corps
                    .append("Votre conseiller d'orientation a examiné votre dossier. ")
                    .append("Après étude, il retient une autre filière que celle proposée :\n\n")
                    .append("    Filière retenue : ").append(e.getBrancheFinale()).append("\n")
                    .append("    Proposition initiale : ").append(e.getBranche()).append("\n\n");

            case "REJETEE" -> corps
                    .append("Votre conseiller d'orientation a examiné votre dossier ")
                    .append("et n'a pas retenu la filière proposée.\n\n");

            default -> corps.append("Votre dossier a été mis à jour.\n\n");
        }

        if (e.getCommentaire() != null && !e.getCommentaire().isBlank()) {
            corps.append("Commentaire de votre conseiller :\n")
                    .append(e.getCommentaire()).append("\n\n");
        }

        corps.append("Vous pouvez consulter le détail sur la plateforme :\n")
                .append("http://localhost:3000/lyceen/resultats\n\n")
                .append("L'équipe SmartOrienta");

        return corps.toString();
    }
}