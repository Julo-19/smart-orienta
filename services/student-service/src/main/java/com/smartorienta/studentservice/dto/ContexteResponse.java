package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ContexteResponse {

    private String contraintes;
    private String passions;
    private String filieresRefusees;
    private String messageConseiller;
}