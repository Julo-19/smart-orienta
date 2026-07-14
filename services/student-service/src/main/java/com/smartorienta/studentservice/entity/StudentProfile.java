package com.smartorienta.studentservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    // Référence vers le User de auth_service
    private Long userId;

    @Column(nullable = false)
    private String etablissement;

    private String region;

    @ManyToOne
    @JoinColumn(name = "serie_id")
    private Serie serie;


    private Long conseillerId;

    @OneToMany(mappedBy = "studentProfile")
    private List<Note> notes;
}