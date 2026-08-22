package com.smartorienta.studentservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReponseQuestion {

    private Integer questionId;
    // de 1 à 5
    private Integer valeur;
}