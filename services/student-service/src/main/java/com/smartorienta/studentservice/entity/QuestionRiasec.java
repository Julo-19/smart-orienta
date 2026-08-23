package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions_riasec")
@Getter
@Setter
@NoArgsConstructor
public class QuestionRiasec {

    @Id
    private Integer id;

    @Column(nullable = false, length = 500)
    private String texte;

    /** Dimension mesurée : R, I, A, S, E, C pour le RIASEC,
     *  ou STRESS, SOCIAL, AUTONOMIE, ADAPTABILITE pour les traits. */
    @Column(nullable = false, length = 20)
    private String dimension;

    /** true si la réponse doit être inversée (6 - valeur). */
    @Column(nullable = false)
    private boolean inversee = false;
}