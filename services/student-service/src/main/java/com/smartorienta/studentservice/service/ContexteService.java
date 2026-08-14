package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.ContexteRequest;
import com.smartorienta.studentservice.entity.Contexte;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.ContexteRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContexteService {

    private final ContexteRepository contexteRepository;
    private final StudentProfileRepository studentProfileRepository;

    public Contexte enregistrer(Long userId, ContexteRequest request) {

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé, veuillez le créer d'abord"));

        Contexte contexte = contexteRepository
                .findByStudentProfileId(profile.getId())
                .orElse(new Contexte());

        contexte.setStudentProfile(profile);
        contexte.setContraintes(request.getContraintes());
        contexte.setPassions(request.getPassions());
        contexte.setFilieresRefusees(request.getFilieresRefusees());
        contexte.setMessageConseiller(request.getMessageConseiller());

        return contexteRepository.save(contexte);
    }
}