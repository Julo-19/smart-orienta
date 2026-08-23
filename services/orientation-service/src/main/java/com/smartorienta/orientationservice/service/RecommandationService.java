package com.smartorienta.orientationservice.service;

import com.smartorienta.orientationservice.client.StudentClient;
import com.smartorienta.orientationservice.dto.DossierMLResponse;
import com.smartorienta.orientationservice.dto.PredictionResponse;
import com.smartorienta.orientationservice.entity.Recommandation;
import com.smartorienta.orientationservice.entity.StatutRecommandation;
import com.smartorienta.orientationservice.exception.BusinessException;
import com.smartorienta.orientationservice.repository.RecommandationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommandationService {

    private final RecommandationRepository recommandationRepository;
    private final PredictionService predictionService;
    private final StudentClient studentClient;

    /**
     * Génère une recommandation pour un lycéen : récupère son dossier auprès
     * du module académique, sollicite le modèle de prédiction, puis enregistre
     * la proposition en attente de validation par un conseiller.
     */
    public Recommandation genererPour(Long etudiantUserId) {

        // Récupération du dossier auprès du Student Service
        DossierMLResponse dossier;
        try {
            dossier = studentClient.getDossier(etudiantUserId);
        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException("Impossible de récupérer le dossier de l'étudiant");
        }

        // Le dossier doit être exploitable
        if (dossier == null || !dossier.isComplet()) {
            String detail = (dossier != null && dossier.getMessageIncompletude() != null)
                    ? dossier.getMessageIncompletude()
                    : "dossier introuvable";
            throw new BusinessException("Votre dossier est incomplet. " + detail);
        }

        // Prédiction
        PredictionResponse prediction = predictionService.predire(dossier);

        // Enregistrement, en attente de validation
        Recommandation reco = new Recommandation();
        reco.setEtudiantUserId(etudiantUserId);
        reco.setCategorie(prediction.getCategorie());
        reco.setBranche(prediction.getBranche());
        reco.setScoreConfiance(prediction.getScoreConfiance());
        reco.setExplication(prediction.getExplication());
        reco.setStatut(StatutRecommandation.EN_ATTENTE);
        reco.setDateGeneration(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /** Historique des recommandations d'un lycéen, de la plus récente à la plus ancienne. */
    public List<Recommandation> historiqueEtudiant(Long etudiantUserId) {
        return recommandationRepository.findByEtudiantUserIdOrderByDateGenerationDesc(etudiantUserId);
    }

    /**
     * Le conseiller valide la proposition du modèle.
     */
    public Recommandation valider(Long recoId, Long conseillerUserId, String commentaire) {
        Recommandation reco = chargerEnAttente(recoId);

        reco.setStatut(StatutRecommandation.VALIDEE);
        reco.setBrancheFinale(reco.getBranche());     // la branche proposée est retenue
        reco.setConseillerUserId(conseillerUserId);
        reco.setCommentaireConseiller(commentaire);
        reco.setDateDecision(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /**
     * Le conseiller retient une autre filière que celle proposée.
     */
    public Recommandation modifier(Long recoId, Long conseillerUserId,
                                   String nouvelleBranche, String commentaire) {
        if (nouvelleBranche == null || nouvelleBranche.isBlank()) {
            throw new BusinessException("La nouvelle filière est obligatoire");
        }

        Recommandation reco = chargerEnAttente(recoId);

        reco.setStatut(StatutRecommandation.MODIFIEE);
        reco.setBrancheFinale(nouvelleBranche);       // la proposition initiale est conservée
        reco.setConseillerUserId(conseillerUserId);
        reco.setCommentaireConseiller(commentaire);
        reco.setDateDecision(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /**
     * Le conseiller écarte la proposition ; un motif est exigé.
     */
    public Recommandation rejeter(Long recoId, Long conseillerUserId, String motif) {
        if (motif == null || motif.isBlank()) {
            throw new BusinessException("Un motif est obligatoire pour rejeter une recommandation");
        }

        Recommandation reco = chargerEnAttente(recoId);

        reco.setStatut(StatutRecommandation.REJETEE);
        reco.setConseillerUserId(conseillerUserId);
        reco.setCommentaireConseiller(motif);
        reco.setDateDecision(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /**
     * Charge une recommandation et vérifie qu'elle peut encore recevoir une décision.
     * Une recommandation déjà traitée ne peut être reprise : la transition n'est
     * autorisée que depuis l'état EN_ATTENTE.
     */
    private Recommandation chargerEnAttente(Long recoId) {
        Recommandation reco = recommandationRepository.findById(recoId)
                .orElseThrow(() -> new BusinessException("Recommandation introuvable"));

        if (reco.getStatut() != StatutRecommandation.EN_ATTENTE) {
            throw new BusinessException(
                    "Cette recommandation a déjà été traitée (statut : " + reco.getStatut() + ")");
        }
        return reco;
    }

    /** File d'attente d'un conseiller. */
    public List<Recommandation> fileAttente(Long conseillerUserId) {
        return recommandationRepository.findByConseillerUserIdAndStatut(
                conseillerUserId, StatutRecommandation.EN_ATTENTE);
    }

    /** Ensemble des recommandations en attente de décision. */
    public List<Recommandation> toutesEnAttente() {
        return recommandationRepository.findByStatut(StatutRecommandation.EN_ATTENTE);
    }
}