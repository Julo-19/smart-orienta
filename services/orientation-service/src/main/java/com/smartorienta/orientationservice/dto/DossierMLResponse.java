package com.smartorienta.orientationservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DossierMLResponse {

    private Long userId;
    private boolean complet;
    private String messageIncompletude;

    private String serie;
    private String nomSpe1;
    private String nomSpe2;

    private Double noteMaths;
    private Double noteFrancais;
    private Double noteAnglais;
    private Double noteHg;
    private Double notePhilo;
    private Double noteSpe1;
    private Double noteSpe2;

    private Double scoreR, scoreI, scoreA, scoreS, scoreE, scoreC;
    private String codeHolland;
    private Double stress, social, autonomie, adaptabilite;
}