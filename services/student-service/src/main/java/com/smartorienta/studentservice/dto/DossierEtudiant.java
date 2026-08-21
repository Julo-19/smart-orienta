package com.smartorienta.studentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class DossierEtudiant {

    private ProfileResponse profil;
    private List<NoteResponse> notes;
    private ProfilRiasecResponse riasec;
    private ContexteResponse contexte;
}