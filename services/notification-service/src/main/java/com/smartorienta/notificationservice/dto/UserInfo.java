package com.smartorienta.notificationservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserInfo {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String role;
}