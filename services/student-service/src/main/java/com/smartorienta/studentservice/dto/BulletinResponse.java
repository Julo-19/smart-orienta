package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class BulletinResponse {

    private int semestre;
    private String serie;
    private List<NoteResponse> notes;
    private double moyenneGenerale;
    private int totalCoefficients;
    private int matieresRenseignees;
    private int matieresAttendues;
}