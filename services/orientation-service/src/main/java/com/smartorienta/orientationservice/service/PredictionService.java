package com.smartorienta.orientationservice.service;

import com.smartorienta.orientationservice.dto.DossierMLResponse;
import com.smartorienta.orientationservice.dto.PredictionRequest;
import com.smartorienta.orientationservice.dto.PredictionResponse;
import org.springframework.stereotype.Service;

/**
 * Interroge le module de prédiction.
 *
 * IMPLÉMENTATION PROVISOIRE : en l'absence du service de Machine Learning,
 * la prédiction est simulée à partir de règles simples. Seule la méthode
 * predire() sera à remplacer lorsque le service réel sera disponible.
 */
@Service
public class PredictionService {

    public PredictionResponse predire(DossierMLResponse dossier) {

        PredictionRequest features = construireFeatures(dossier);
        return simuler(features);
    }

    /** Traduit le dossier en vecteur de caractéristiques attendu par le modèle. */
    private PredictionRequest construireFeatures(DossierMLResponse d) {
        return new PredictionRequest(
                d.getSerie(),
                d.getNomSpe1() != null ? d.getNomSpe1() : "—",
                d.getNomSpe2() != null ? d.getNomSpe2() : "—",
                valeurOuZero(d.getNoteMaths()),
                valeurOuZero(d.getNoteFrancais()),
                valeurOuZero(d.getNoteAnglais()),
                valeurOuZero(d.getNoteHg()),
                valeurOuZero(d.getNotePhilo()),
                valeurOuZero(d.getNoteSpe1()),
                valeurOuZero(d.getNoteSpe2()),
                d.getScoreR(), d.getScoreI(), d.getScoreA(),
                d.getScoreS(), d.getScoreE(), d.getScoreC(),
                d.getCodeHolland(),
                d.getStress(), d.getSocial(), d.getAutonomie(), d.getAdaptabilite());
    }

    /** Le jeu de données représente une note absente par la valeur 0. */
    private Double valeurOuZero(Double valeur) {
        return valeur != null ? valeur : 0.0;
    }

    /** Simulation temporaire, fondée sur la série et la dimension dominante. */
    private PredictionResponse simuler(PredictionRequest f) {

        String serie = f.getSerie() != null ? f.getSerie() : "";
        String code = f.getCodeHolland() != null ? f.getCodeHolland() : "";
        char dominante = code.isEmpty() ? 'I' : code.charAt(0);

        String categorie;
        String branche;

        if (serie.startsWith("S")) {
            switch (dominante) {
                case 'I' -> { categorie = "Sciences de la Santé"; branche = "Médecine"; }
                case 'R' -> { categorie = "Sciences de l'Ingénieur"; branche = "Génie Civil"; }
                case 'C' -> { categorie = "Sciences et Technologies"; branche = "Informatique"; }
                default  -> { categorie = "Sciences et Technologies"; branche = "Mathématiques Appliquées"; }
            }
        } else if (serie.startsWith("L")) {
            switch (dominante) {
                case 'S' -> { categorie = "Sciences Humaines et Sociales"; branche = "Psychologie"; }
                case 'A' -> { categorie = "Arts et Lettres"; branche = "Lettres Modernes"; }
                default  -> { categorie = "Droit & Sciences Politiques"; branche = "Sciences Politiques"; }
            }
        } else {
            switch (dominante) {
                case 'E' -> { categorie = "Économie et Gestion"; branche = "Management"; }
                default  -> { categorie = "Économie et Gestion"; branche = "Comptabilité et Finance"; }
            }
        }

        double confiance = 0.70 + (moyenneNotes(f) - 10) * 0.02;
        confiance = Math.max(0.50, Math.min(0.95, confiance));
        confiance = Math.round(confiance * 100.0) / 100.0;

        String explication = String.format(
                "Prédiction simulée. Série %s, profil dominant %c. "
                        + "Moyenne des matières renseignées : %.2f/20. "
                        + "Cette explication sera remplacée par l'analyse du module d'explicabilité.",
                serie, dominante, moyenneNotes(f));

        return new PredictionResponse(categorie, branche, confiance, explication);
    }

    private double moyenneNotes(PredictionRequest f) {
        double[] notes = { f.getNoteMaths(), f.getNoteFrancais(), f.getNoteAnglais(),
                f.getNoteHg(), f.getNotePhilo(), f.getNoteSpe1(), f.getNoteSpe2() };
        double somme = 0; int n = 0;
        for (double note : notes) {
            if (note > 0) { somme += note; n++; }
        }
        return n == 0 ? 0 : somme / n;
    }
}