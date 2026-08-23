package com.smartorienta.studentservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProfileRequest {

    private String etablissement;
    private String matricule;
    private String niveau;
    private String region;
    private LocalDate dateNaissance;
    private String sexe;
    private Long serieId;
}