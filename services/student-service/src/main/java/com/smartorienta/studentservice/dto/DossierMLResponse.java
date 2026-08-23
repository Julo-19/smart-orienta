package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DossierMLResponse {

    private Long userId;
    // le dossier est-il exploitable ?
    private boolean complet;
    // ce qui manque, le cas échéant
    private String messageIncompletude;

    // Identité académique
    private String serie;
    private String nomSpe1;
    private String nomSpe2;

    // Les sept notes attendues par le modèle
    private Double noteMaths;
    private Double noteFrancais;
    private Double noteAnglais;
    private Double noteHg;
    private Double notePhilo;
    private Double noteSpe1;
    private Double noteSpe2;

    // Profil psychométrique
    private Double scoreR, scoreI, scoreA, scoreS, scoreE, scoreC;
    private String codeHolland;
    private Double stress, social, autonomie, adaptabilite;
}