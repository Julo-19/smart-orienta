package com.smartorienta.authservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateConseillerRequest {

    private String email;
    private String nom;
    private String prenom;
}