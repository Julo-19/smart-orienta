package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.ConseillerProfileRequest;
import com.smartorienta.studentservice.entity.ConseillerProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.ConseillerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConseillerProfileService {

    private final ConseillerProfileRepository conseillerProfileRepository;

    public ConseillerProfile enregistrer(Long userId, ConseillerProfileRequest request) {

        if (request.getEtablissement() == null || request.getEtablissement().isBlank()) {
            throw new BusinessException("L'établissement est obligatoire");
        }

        ConseillerProfile profile = conseillerProfileRepository
                .findByUserId(userId)
                .orElse(new ConseillerProfile());

        profile.setUserId(userId);
        profile.setEtablissement(request.getEtablissement());
        profile.setSpecialite(request.getSpecialite());

        return conseillerProfileRepository.save(profile);
    }

    public ConseillerProfile getMonProfil(Long userId) {
        return conseillerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil conseiller trouvé"));
    }
}