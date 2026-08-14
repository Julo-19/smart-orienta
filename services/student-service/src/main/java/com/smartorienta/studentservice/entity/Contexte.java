package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contextes")
@Getter
@Setter
@NoArgsConstructor
public class Contexte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_profile_id", nullable = false, unique = true)
    private StudentProfile studentProfile;

    @Column(columnDefinition = "TEXT")
    //Ex: financières, géographiques, familiales...
    private String contraintes;

    @Column(columnDefinition = "TEXT")
    //Ex: centres d'intérêt..
    private String passions;

    @Column(columnDefinition = "TEXT")
    //Ex: filières que le lycéen écarte
    private String filieresRefusees;

    @Column(columnDefinition = "TEXT")
    //Ex: message libre à destination du conseiller
    private String messageConseiller;
}