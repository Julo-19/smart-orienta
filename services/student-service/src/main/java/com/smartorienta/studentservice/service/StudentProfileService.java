package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.ProfileRequest;
import com.smartorienta.studentservice.entity.Serie;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.repository.SerieRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final SerieRepository serieRepository;

    public StudentProfile createProfile(Long userId, ProfileRequest request) {

        if (studentProfileRepository.existsByUserId(userId)) {
            throw new RuntimeException("Un profil existe déjà pour cet utilisateur");
        }

        Serie serie = serieRepository.findById(request.getSerieId())
                .orElseThrow(() -> new RuntimeException("Série introuvable"));

        StudentProfile profile = new StudentProfile();
        profile.setUserId(userId);
        profile.setEtablissement(request.getEtablissement());
        profile.setRegion(request.getRegion());
        profile.setDateNaissance(request.getDateNaissance());
        profile.setSexe(request.getSexe());
        profile.setSerie(serie);

        return studentProfileRepository.save(profile);
    }
}