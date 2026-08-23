package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.ProfileRequest;
import com.smartorienta.studentservice.dto.ProfileResponse;
import com.smartorienta.studentservice.entity.Serie;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.NoteRepository;
import com.smartorienta.studentservice.repository.SerieRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final SerieRepository serieRepository;
    private final NoteRepository noteRepository;
    private final AssignationService assignationService;

    public ProfileResponse createProfile(Long userId, ProfileRequest request) {

        if (studentProfileRepository.existsByUserId(userId)) {
            throw new BusinessException("Un profil existe déjà pour cet utilisateur");
        }

        Serie serie = serieRepository.findById(request.getSerieId())
                .orElseThrow(() -> new BusinessException("Série introuvable"));

        StudentProfile profile = new StudentProfile();
        profile.setUserId(userId);
        profile.setEtablissement(request.getEtablissement());
        profile.setMatricule(request.getMatricule());
        profile.setNiveau(request.getNiveau());
        profile.setRegion(request.getRegion());
        profile.setDateNaissance(request.getDateNaissance());
        profile.setSexe(request.getSexe());
        profile.setSerie(serie);

        // Assignation automatique d'un conseiller
        Long conseillerId = assignationService.trouverConseiller(profile);
        profile.setConseillerId(conseillerId);

        StudentProfile saved = studentProfileRepository.save(profile);
        return toResponse(saved);
    }

    public ProfileResponse getMonProfil(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé"));
        return toResponse(profile);
    }

    private ProfileResponse toResponse(StudentProfile p) {
        return new ProfileResponse(
                p.getId(),
                p.getUserId(),
                p.getEtablissement(),
                p.getMatricule(),
                p.getNiveau(),
                p.getRegion(),
                p.getDateNaissance(),
                p.getSexe(),
                p.getSerie() != null ? p.getSerie().getId() : null,
                p.getSerie() != null ? p.getSerie().getCode() : null,
                p.getSerie() != null ? p.getSerie().getLibelle() : null,
                p.getConseillerId());
    }

    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé"));

        Long ancienneSerieId = profile.getSerie() != null ? profile.getSerie().getId() : null;

        // Changement de série éventuel
        if (request.getSerieId() != null && !request.getSerieId().equals(ancienneSerieId)) {

            Serie nouvelleSerie = serieRepository.findById(request.getSerieId())
                    .orElseThrow(() -> new BusinessException("Série introuvable"));

            profile.setSerie(nouvelleSerie);

            // Les notes des matières qui ne sont plus au programme sont retirées
            noteRepository.findByStudentProfileId(profile.getId()).stream()
                    .filter(n -> !n.getMatiere().getSerie().getId().equals(nouvelleSerie.getId()))
                    .forEach(noteRepository::delete);
        }

        if (request.getEtablissement() != null)  profile.setEtablissement(request.getEtablissement());
        if (request.getMatricule() != null)      profile.setMatricule(request.getMatricule());
        if (request.getNiveau() != null)         profile.setNiveau(request.getNiveau());
        if (request.getRegion() != null)         profile.setRegion(request.getRegion());
        if (request.getDateNaissance() != null)  profile.setDateNaissance(request.getDateNaissance());
        if (request.getSexe() != null)           profile.setSexe(request.getSexe());

        return toResponse(studentProfileRepository.save(profile));
    }
}