package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profils_riasec")
@Getter
@Setter
@NoArgsConstructor
public class ProfilRiasec {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_profile_id", nullable = false, unique = true)
    private StudentProfile studentProfile;

    // Les 6 dimensions de Holland (échelle 1 à 5)
    @Column(nullable = false)
    private double scoreR;      // Réaliste

    @Column(nullable = false)
    private double scoreI;      // Investigateur

    @Column(nullable = false)
    private double scoreA;      // Artistique

    @Column(nullable = false)
    private double scoreS;      // Social

    @Column(nullable = false)
    private double scoreE;      // Entreprenant

    @Column(nullable = false)
    private double scoreC;      // Conventionnel

    // Code Holland : les 3 dimensions dominantes (ex. "ISR")
    @Column(length = 3)
    private String codeHolland;

    // Traits comportementaux (échelle 1 à 5)
    @Column(nullable = false)
    private double stress;

    @Column(nullable = false)
    private double social;

    @Column(nullable = false)
    private double autonomie;

    @Column(nullable = false)
    private double adaptabilite;
}