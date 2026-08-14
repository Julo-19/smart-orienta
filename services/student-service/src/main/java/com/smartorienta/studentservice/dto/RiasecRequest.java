package com.smartorienta.studentservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RiasecRequest {

    private double scoreR;
    private double scoreI;
    private double scoreA;
    private double scoreS;
    private double scoreE;
    private double scoreC;

    private double stress;
    private double social;
    private double autonomie;
    private double adaptabilite;
}