package com.smartorienta.orientationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ServiceStatut {
    private String nom;
    private String statut;      // UP, DOWN, INCONNU
    private int instances;
    private String adresse;
}