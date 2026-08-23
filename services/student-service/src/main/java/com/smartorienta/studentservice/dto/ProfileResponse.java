package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class ProfileResponse {

    private Long id;
    private Long userId;
    private String etablissement;
    private String matricule;
    private String niveau;
    private String region;
    private LocalDate dateNaissance;
    private String sexe;
    private Long serieId;
    private String serieCode;
    private String serieLibelle;
    private Long conseillerId;
}