package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notes",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "student_profile_id",
                        "matiere_id",
                        "semestre"
                })
)
@Getter
@Setter
@NoArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double valeur;

    @Column(nullable = false)
    // semestre 1 ou 2
    private int semestre;

    @ManyToOne
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne
    @JoinColumn(name = "matiere_id", nullable = false)
    private Matiere matiere;
}