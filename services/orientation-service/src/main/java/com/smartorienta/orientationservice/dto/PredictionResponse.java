package com.smartorienta.orientationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponse {

    private String categorie;
    private String branche;
    private double scoreConfiance;
    private String explication;

    /** Variables ayant le plus pesé sur cette recommandation. */
    private List<FacteurInfluent> facteurs;
}