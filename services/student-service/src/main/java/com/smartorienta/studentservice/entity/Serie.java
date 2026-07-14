package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "series")
@Getter
@Setter
@NoArgsConstructor
public class Serie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;          // "S1", "L2", "G"...

    @Column(nullable = false)
    private String libelle;       // "Sciences expérimentales"...

    @OneToMany(mappedBy = "serie")
    private List<Matiere> matieres;
}