package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "conseiller_profiles")
@Getter
@Setter
@NoArgsConstructor
public class ConseillerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;              // référence logique vers le User de l'Auth

    @Column(nullable = false)
    private String etablissement;

    private String specialite;
}