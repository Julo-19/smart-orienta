package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EtudiantListItem {

    private Long id;
    private Long userId;
    private String matricule;
    private String etablissement;
    private String niveau;
    private String serieCode;
    private int nombreNotes;
}