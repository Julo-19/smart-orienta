package com.smartorienta.orientationservice.service;

import com.smartorienta.orientationservice.client.MlClient;
import com.smartorienta.orientationservice.dto.DossierMLResponse;
import com.smartorienta.orientationservice.dto.PredictionRequest;
import com.smartorienta.orientationservice.dto.PredictionResponse;
import com.smartorienta.orientationservice.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Interroge le module de prédiction.
 *
 * Le dossier du lycéen est traduit en vecteur de caractéristiques,
 * puis transmis au service d'apprentissage automatique qui retourne
 * une filière assortie d'un indice de confiance.
 */
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final MlClient mlClient;
    private final PredictionCache cache;

    public PredictionResponse predire(DossierMLResponse dossier) {

        // Un dossier inchangé produit la même prédiction : inutile de
        // solliciter le modèle une seconde fois.
        Optional<PredictionResponse> enCache = cache.lire(dossier);
        if (enCache.isPresent()) {
            return enCache.get();
        }

        PredictionRequest features = construireFeatures(dossier);

        PredictionResponse prediction;
        try {
            prediction = mlClient.predire(features);
        } catch (Exception e) {
            throw new BusinessException(
                    "Le module de prédiction est momentanément indisponible. "
                            + "Veuillez réessayer dans quelques instants.");
        }

        cache.ecrire(dossier, prediction);
        return prediction;
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

    /**
     * Le jeu de données représente une matière absente par la valeur zéro,
     * là où l'interface applicative emploie une valeur nulle.
     */
    private Double valeurOuZero(Double valeur) {
        return valeur != null ? valeur : 0.0;
    }
}