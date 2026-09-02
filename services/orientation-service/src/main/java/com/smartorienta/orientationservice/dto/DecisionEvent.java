package com.smartorienta.orientationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


 // Événement publié lorsqu'un conseiller statue sur une recommandation.

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DecisionEvent {

    private Long recommandationId;
    private Long etudiantUserId;
    private Long conseillerUserId;
    private String statut;
    private String branche;
    private String brancheFinale;
    private String commentaire;
    private String dateDecision;
}