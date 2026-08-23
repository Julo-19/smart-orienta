package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "matieres")
@Getter
@Setter
@NoArgsConstructor
public class Matiere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    // Ex : Math Philo.
    private String nom;

    @Column(nullable = false)
    private int coefficient;

    @ManyToOne
    @JoinColumn(name = "serie_id", nullable = false)
    private Serie serie;
}