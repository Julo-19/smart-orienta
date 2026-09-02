package com.smartorienta.orientationservice.service;

import com.netflix.discovery.EurekaClient;
import com.netflix.discovery.shared.Application;
import com.smartorienta.orientationservice.dto.ServiceStatut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * Renseigne l'état des services composant la plateforme.
 *
 * L'annuaire fournit l'état des services Spring, qui s'y enregistrent.
 * Le module de prédiction, développé en Python, n'y figure pas : il est
 * interrogé directement sur son point de santé.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupervisionService {

    private final EurekaClient eurekaClient;

    @Value("${ml-service.url}")
    private String mlServiceUrl;

    /** Services attendus, avec leur port. */
    private static final String[][] ATTENDUS = {
            {"API-GATEWAY", "8080"},
            {"AUTH-SERVICE", "8081"},
            {"STUDENT-SERVICE", "8082"},
            {"ORIENTATION-SERVICE", "8083"},
            {"NOTIFICATION-SERVICE", "8085"},
    };

    public List<ServiceStatut> etatDesServices() {

        List<ServiceStatut> resultat = new ArrayList<>();

        for (String[] attendu : ATTENDUS) {
            String nom = attendu[0];
            Application application = eurekaClient.getApplication(nom);

            if (application == null || application.getInstances().isEmpty()) {
                resultat.add(new ServiceStatut(nom, "DOWN", 0, ":" + attendu[1]));
            } else {
                long actives = application.getInstances().stream()
                        .filter(i -> "UP".equals(i.getStatus().name()))
                        .count();
                resultat.add(new ServiceStatut(
                        nom,
                        actives > 0 ? "UP" : "DOWN",
                        (int) actives,
                        ":" + attendu[1]));
            }
        }

        // Le module de prédiction est interrogé directement
        resultat.add(etatDuModulePrediction());

        return resultat;
    }

    private ServiceStatut etatDuModulePrediction() {
        try {
            RestTemplate rest = new RestTemplate();
            rest.getForObject(mlServiceUrl + "/health", String.class);
            return new ServiceStatut("ML-SERVICE", "UP", 1, ":8084");
        } catch (Exception e) {
            return new ServiceStatut("ML-SERVICE", "DOWN", 0, ":8084");
        }
    }
}