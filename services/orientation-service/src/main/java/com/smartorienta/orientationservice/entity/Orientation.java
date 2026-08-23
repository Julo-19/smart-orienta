package com.smartorienta.orientationservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orientations")
@Getter
@Setter
@NoArgsConstructor
public class Orientation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)

    // la branche : "Médecine", "Pharmacie"...
    private String libelle;

    @Column(nullable = false)

    // le domaine : "Sciences de la Santé"...
    private String categorie;
}