package com.smartorienta.orientationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FacteurInfluent {
    private String variable;
    private String libelle;
    private double poids;
}