package com.smartorienta.studentservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContexteRequest {

    private String contraintes;
    private String passions;
    private String filieresRefusees;
    private String messageConseiller;
}