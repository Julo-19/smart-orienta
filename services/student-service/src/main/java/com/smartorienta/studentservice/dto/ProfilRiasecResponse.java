package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProfilRiasecResponse {

    private double scoreR, scoreI, scoreA, scoreS, scoreE, scoreC;
    private String codeHolland;
    private double stress, social, autonomie, adaptabilite;
}