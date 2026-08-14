package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NoteResponse {

    private Long id;
    private String matiere;
    private int coefficient;
    private double valeur;
}