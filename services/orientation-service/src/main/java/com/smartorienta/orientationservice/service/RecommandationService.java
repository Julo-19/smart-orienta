package com.smartorienta.orientationservice.service;

import com.smartorienta.orientationservice.client.StudentClient;
import com.smartorienta.orientationservice.dto.ActiviteItem;
import com.smartorienta.orientationservice.dto.DossierMLResponse;
import com.smartorienta.orientationservice.dto.PredictionResponse;
import com.smartorienta.orientationservice.dto.StatistiquesResponse;
import com.smartorienta.orientationservice.entity.Recommandation;
import com.smartorienta.orientationservice.entity.StatutRecommandation;
import com.smartorienta.orientationservice.exception.BusinessException;
import com.smartorienta.orientationservice.repository.RecommandationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        // Une seule demande peut être en cours d'examen à la fois
        boolean dejaEnAttente = recommandationRepository
                .findByEtudiantUserIdOrderByDateGenerationDesc(etudiantUserId)
                .stream()
                .anyMatch(r -> r.getStatut() == StatutRecommandation.EN_ATTENTE);

        if (dejaEnAttente) {
            throw new BusinessException("Une recommandation est déjà en attente de validation");
        }

        // Récupération du dossier auprès du module académique
        DossierMLResponse dossier;
        try {
            dossier = studentClient.getDossier(etudiantUserId);
        } catch (Exception e) {
            throw new BusinessException("Impossible de récupérer le dossier de l'étudiant");
        }

        // Le dossier doit être exploitable
        if (dossier == null || !dossier.isComplet()) {
            String detail = (dossier != null && dossier.getMessageIncompletude() != null)
                    ? dossier.getMessageIncompletude()
                    : "dossier introuvable";
            throw new BusinessException("Votre dossier est incomplet. " + detail);
        }

        PredictionResponse prediction = predictionService.predire(dossier);

        Recommandation reco = new Recommandation();
        reco.setEtudiantUserId(etudiantUserId);
        reco.setCategorie(prediction.getCategorie());
        reco.setBranche(prediction.getBranche());
        reco.setScoreConfiance(prediction.getScoreConfiance());
        reco.setExplication(prediction.getExplication());
                // Les facteurs sont sérialisés pour être restitués tels quels
        try {
            reco.setFacteurs(new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(prediction.getFacteurs()));
        } catch (Exception e) {
            reco.setFacteurs("[]");
        }
        reco.setStatut(StatutRecommandation.EN_ATTENTE);
        reco.setDateGeneration(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /** Historique des recommandations d'un lycéen, de la plus récente à la plus ancienne. */
    public List<Recommandation> historiqueEtudiant(Long etudiantUserId) {
        return recommandationRepository.findByEtudiantUserIdOrderByDateGenerationDesc(etudiantUserId);
    }

    // ─────────── Décisions du conseiller ───────────

    /** Le conseiller valide la proposition du modèle. */
    public Recommandation valider(Long recoId, Long conseillerUserId, String commentaire) {
        Recommandation reco = chargerEnAttente(recoId);

        reco.setStatut(StatutRecommandation.VALIDEE);
        reco.setBrancheFinale(reco.getBranche());
        reco.setConseillerUserId(conseillerUserId);
        reco.setCommentaireConseiller(commentaire);
        reco.setDateDecision(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /** Le conseiller retient une autre filière que celle proposée. */
    public Recommandation modifier(Long recoId, Long conseillerUserId,
                                   String nouvelleBranche, String commentaire) {
        if (nouvelleBranche == null || nouvelleBranche.isBlank()) {
            throw new BusinessException("La nouvelle filière est obligatoire");
        }

        Recommandation reco = chargerEnAttente(recoId);

        reco.setStatut(StatutRecommandation.MODIFIEE);
        reco.setBrancheFinale(nouvelleBranche);
        reco.setConseillerUserId(conseillerUserId);
        reco.setCommentaireConseiller(commentaire);
        reco.setDateDecision(LocalDateTime.now());

        return recommandationRepository.save(reco);
    }

    /** Le conseiller écarte la proposition ; un motif est exigé. */
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
     * La transition n'est autorisée que depuis l'état EN_ATTENTE : une recommandation
     * déjà traitée ne peut être reprise.
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

    /**
     * Recommandations en attente concernant les seuls lycéens du conseiller.
     * Le service d'orientation ignore les affectations : il interroge le
     * module académique pour connaître les élèves qui lui sont confiés.
     */
    public List<Recommandation> enAttentePourConseiller(Long conseillerUserId) {

        List<Long> mesEleves;
        try {
            mesEleves = studentClient.getEtudiantsDe(conseillerUserId);
        } catch (Exception e) {
            throw new BusinessException("Impossible de récupérer la liste de vos lycéens");
        }

        return recommandationRepository.findByStatut(StatutRecommandation.EN_ATTENTE)
                .stream()
                .filter(r -> mesEleves.contains(r.getEtudiantUserId()))
                .toList();
    }

    /** Ensemble des recommandations en attente, sans filtrage. */
    public List<Recommandation> toutesEnAttente() {
        return recommandationRepository.findByStatut(StatutRecommandation.EN_ATTENTE);
    }

    // ─────────── Administration ───────────

    /** Statistiques d'ensemble, destinées au tableau de bord d'administration. */
    public StatistiquesResponse statistiques() {

        List<Recommandation> toutes = recommandationRepository.findAll();

        long total     = toutes.size();
        long attente   = compter(toutes, StatutRecommandation.EN_ATTENTE);
        long validees  = compter(toutes, StatutRecommandation.VALIDEE);
        long modifiees = compter(toutes, StatutRecommandation.MODIFIEE);
        long rejetees  = compter(toutes, StatutRecommandation.REJETEE);

        // Le taux ne porte que sur les dossiers effectivement traités
        long traitees = validees + modifiees + rejetees;
        int taux = traitees == 0 ? 0 : (int) Math.round((validees + modifiees) * 100.0 / traitees);

        // Répartition par filière, des plus fréquentes aux plus rares
        Map<String, Long> filieres = toutes.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getBrancheFinale() != null ? r.getBrancheFinale() : r.getBranche(),
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(7)
                .collect(Collectors.toMap(
                        Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));

        // Dernières recommandations, pour le fil d'activité
        DateTimeFormatter format = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        List<ActiviteItem> activite = toutes.stream()
                .sorted(Comparator.comparing(Recommandation::getDateGeneration).reversed())
                .limit(6)
                .map(r -> new ActiviteItem(
                        r.getId(),
                        r.getEtudiantUserId(),
                        r.getBrancheFinale() != null ? r.getBrancheFinale() : r.getBranche(),
                        r.getStatut().name(),
                        r.getDateGeneration().format(format)))
                .toList();

        return new StatistiquesResponse(total, attente, validees, modifiees, rejetees,
                taux, filieres, activite);
    }

    private long compter(List<Recommandation> liste, StatutRecommandation statut) {
        return liste.stream().filter(r -> r.getStatut() == statut).count();
    }

        /**
     * Décisions déjà prises par un conseiller, de la plus récente à la plus ancienne.
     * Permet de consulter les dossiers traités, que la file d'attente ne montre plus.
     */
    public List<Recommandation> mesDecisions(Long conseillerUserId) {
        return recommandationRepository
                .findByConseillerUserIdOrderByDateDecisionDesc(conseillerUserId);
    }
}