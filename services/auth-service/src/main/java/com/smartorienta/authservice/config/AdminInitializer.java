package com.smartorienta.authservice.config;

import com.smartorienta.authservice.entity.Role;
import com.smartorienta.authservice.entity.User;
import com.smartorienta.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crée le compte administrateur au premier démarrage.
 *
 * Un compte privilégié est nécessaire pour créer les comptes conseillers,
 * mais le premier ne peut être créé par le système lui-même : c'est le
 * problème classique de l'amorçage. Les identifiants proviennent de la
 * configuration, ce qui permet de les adapter selon l'environnement.
 */
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setNom("Administrateur");
        admin.setPrenom("SmartOrienta");
        admin.setRole(Role.ADMIN);
        admin.setEmailVerified(true);

        userRepository.save(admin);

        System.out.println(">>> Compte administrateur initialisé : " + adminEmail);
    }
}