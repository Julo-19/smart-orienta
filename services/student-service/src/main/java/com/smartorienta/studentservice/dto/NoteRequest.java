package com.smartorienta.studentservice.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteRequest {
    private Long matiereId;
    private double valeur;
    private int semestre;
}
