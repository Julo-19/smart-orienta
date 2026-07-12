package com.smartorienta.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String token) {

        String link = frontendUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("SmartOrientation - Confirmez votre adresse email");
        message.setText(
                "Bienvenue sur SmartOrientation !\n\n"
                        + "Pour confirmer votre adresse email, cliquez sur ce lien :\n"
                        + link + "\n\n"
                        + "Ce lien expire dans 24 heures.\n\n"
                        + "Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email."
        );

        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String token) {

        String link = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("SmartOrienta - Réinitialisation de votre mot de passe");
        message.setText(
                "Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
                        + "Cliquez sur ce lien pour choisir un nouveau mot de passe :\n"
                        + link + "\n\n"
                        + "Ce lien expire dans 1 heure.\n\n"
                        + "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
        );

        mailSender.send(message);
    }
}