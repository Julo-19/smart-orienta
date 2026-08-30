package com.smartorienta.orientationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class StatistiquesResponse {

    private long total;
    private long enAttente;
    private long validees;
    private long modifiees;
    private long rejetees;

    /** Part des recommandations approuvées ou ajustées parmi celles traitées. */
    private int tauxValidation;

    /** Nombre de recommandations par filière, les plus fréquentes en tête. */
    private Map<String, Long> filieres;

    /** Décisions les plus récentes, pour le fil d'activité. */
    private List<ActiviteItem> activite;
}