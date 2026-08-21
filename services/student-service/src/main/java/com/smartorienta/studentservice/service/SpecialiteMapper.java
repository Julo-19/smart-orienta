package com.smartorienta.studentservice.service;

import java.util.List;
import java.util.Map;

/**
 * Correspondance entre chaque série et ses matières de spécialité,
 * dans l'ordre attendu par le modèle de prédiction (spe1, spe2).
 */
public class SpecialiteMapper {

    private static final Map<String, List<String>> SPECIALITES = Map.of(
            "S1", List.of("Sciences Physiques"),
            "S2", List.of("Sciences Physiques", "SVT"),
            "S3", List.of("Sciences Physiques", "Construction Mécanique"),
            "L1", List.of("LV2"),
            "L2", List.of("LV2", "Sciences de la Nature"),
            "G",  List.of("Étude de cas", "Économie")
    );

    public static String getSpe1(String codeSerie) {
        List<String> spes = SPECIALITES.get(codeSerie);
        return (spes != null && !spes.isEmpty()) ? spes.get(0) : null;
    }

    public static String getSpe2(String codeSerie) {
        List<String> spes = SPECIALITES.get(codeSerie);
        return (spes != null && spes.size() > 1) ? spes.get(1) : null;
    }
}