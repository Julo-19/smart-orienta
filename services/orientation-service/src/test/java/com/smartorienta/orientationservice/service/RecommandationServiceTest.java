package com.smartorienta.orientationservice.service;

import com.smartorienta.orientationservice.client.StudentClient;
import com.smartorienta.orientationservice.entity.Recommandation;
import com.smartorienta.orientationservice.entity.StatutRecommandation;
import com.smartorienta.orientationservice.exception.BusinessException;
import com.smartorienta.orientationservice.repository.RecommandationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Vérifie le cycle de vie des recommandations.
 *
 * Le caractère terminal des états de décision est au cœur du dispositif
 * de validation humaine : une recommandation traitée ne peut être reprise,
 * faute de quoi un dossier d'orientation pourrait être réécrit après coup.
 */
@ExtendWith(MockitoExtension.class)
class RecommandationServiceTest {

    @Mock private RecommandationRepository recommandationRepository;
    @Mock private PredictionService predictionService;
    @Mock private StudentClient studentClient;
    @Mock private EvenementPublisher evenementPublisher;

    @InjectMocks private RecommandationService service;

    private Recommandation enAttente;

    @BeforeEach
    void preparer() {
        enAttente = new Recommandation();
        enAttente.setId(1L);
        enAttente.setEtudiantUserId(10L);
        enAttente.setCategorie("Sciences & Technologies");
        enAttente.setBranche("Développement Web & Mobile");
        enAttente.setScoreConfiance(0.72);
        enAttente.setStatut(StatutRecommandation.EN_ATTENTE);
        enAttente.setDateGeneration(LocalDateTime.now());
    }

    // ─────────── Validation ───────────

    @Test
    @DisplayName("La validation retient la filière proposée et horodate la décision")
    void validation_retientLaFiliereProposee() {
        when(recommandationRepository.findById(1L)).thenReturn(Optional.of(enAttente));
        when(recommandationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Recommandation resultat = service.valider(1L, 4L, "Profil cohérent");

        assertThat(resultat.getStatut()).isEqualTo(StatutRecommandation.VALIDEE);
        assertThat(resultat.getBrancheFinale()).isEqualTo("Développement Web & Mobile");
        assertThat(resultat.getConseillerUserId()).isEqualTo(4L);
        assertThat(resultat.getCommentaireConseiller()).isEqualTo("Profil cohérent");
        assertThat(resultat.getDateDecision()).isNotNull();
    }

    // ─────────── Modification ───────────

    @Test
    @DisplayName("La modification conserve la proposition initiale du modèle")
    void modification_conserveLaPropositionInitiale() {
        when(recommandationRepository.findById(1L)).thenReturn(Optional.of(enAttente));
        when(recommandationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Recommandation resultat = service.modifier(1L, 4L, "Génie Civil", "Autre profil");

        assertThat(resultat.getStatut()).isEqualTo(StatutRecommandation.MODIFIEE);
        assertThat(resultat.getBrancheFinale()).isEqualTo("Génie Civil");
        // La proposition d'origine n'est pas écrasée : elle permettra de
        // mesurer le taux d'accord entre le modèle et les conseillers.
        assertThat(resultat.getBranche()).isEqualTo("Développement Web & Mobile");
    }

    @Test
    @DisplayName("La modification exige qu'une filière soit indiquée")
    void modification_exigeUneFiliere() {
        assertThatThrownBy(() -> service.modifier(1L, 4L, "  ", "commentaire"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("filière est obligatoire");

        verify(recommandationRepository, never()).save(any());
    }

    // ─────────── Rejet ───────────

    @Test
    @DisplayName("Le rejet exige un motif")
    void rejet_exigeUnMotif() {
        assertThatThrownBy(() -> service.rejeter(1L, 4L, ""))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("motif est obligatoire");

        verify(recommandationRepository, never()).save(any());
    }

    // ─────────── Le cœur du dispositif ───────────

    @Test
    @DisplayName("Une recommandation déjà validée ne peut recevoir une seconde décision")
    void decision_impossibleSurUneRecommandationTraitee() {
        Recommandation dejaValidee = new Recommandation();
        dejaValidee.setId(2L);
        dejaValidee.setStatut(StatutRecommandation.VALIDEE);

        when(recommandationRepository.findById(2L)).thenReturn(Optional.of(dejaValidee));

        assertThatThrownBy(() -> service.valider(2L, 4L, "nouvelle tentative"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("déjà été traitée");

        assertThatThrownBy(() -> service.rejeter(2L, 4L, "motif"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("déjà été traitée");

        assertThatThrownBy(() -> service.modifier(2L, 4L, "Médecine", "commentaire"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("déjà été traitée");

        verify(recommandationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Une recommandation introuvable est signalée")
    void decision_surRecommandationInexistante() {
        when(recommandationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.valider(99L, 4L, "commentaire"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("introuvable");
    }

    // ─────────── Publication de l'événement ───────────

    @Test
    @DisplayName("Chaque décision donne lieu à la publication d'un événement")
    void decision_publieUnEvenement() {
        when(recommandationRepository.findById(1L)).thenReturn(Optional.of(enAttente));
        when(recommandationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.valider(1L, 4L, "commentaire");

        verify(evenementPublisher, times(1)).publierDecision(any(Recommandation.class));
    }
}