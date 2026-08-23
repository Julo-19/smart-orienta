package com.smartorienta.orientationservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommandations")
@Getter
@Setter
@NoArgsConstructor
public class Recommandation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    // référence logique vers le lycéen
    private Long etudiantUserId;

    // conseiller ayant statué (nullable)
    private Long conseillerUserId;

    // Proposition du modèle
    @Column(nullable = false)

    // ex. "Sciences, Sante"
    private String categorie;

    @Column(nullable = false)

    // ex. "Médecine"
    private String branche;

    @Column(nullable = false)
    private double scoreConfiance;

    @Column(columnDefinition = "TEXT")

    // sortie du module d'explicabilité
    private String explication;

    // Décision
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutRecommandation statut = StatutRecommandation.EN_ATTENTE;

    // si le conseiller modifie
    private String brancheFinale;

    @Column(columnDefinition = "TEXT")
    private String commentaireConseiller;

    @Column(nullable = false)
    private LocalDateTime dateGeneration = LocalDateTime.now();

    private LocalDateTime dateDecision;
}