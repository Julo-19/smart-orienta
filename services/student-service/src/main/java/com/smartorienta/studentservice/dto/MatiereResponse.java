package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.boot.internal.Abstract;

@Getter
@Setter
@AllArgsConstructor
public class MatiereResponse {

    private Long matiereId;
    private String nom;
    private int coefficient;
}
