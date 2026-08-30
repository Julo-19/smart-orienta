package com.smartorienta.orientationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ActiviteItem {
    private Long recommandationId;
    private Long etudiantUserId;
    private String branche;
    private String statut;
    private String date;
}