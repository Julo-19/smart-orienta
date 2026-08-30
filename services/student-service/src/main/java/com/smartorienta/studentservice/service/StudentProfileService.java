package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.ProfileRequest;
import com.smartorienta.studentservice.dto.ProfileResponse;
import com.smartorienta.studentservice.entity.Serie;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.ConseillerProfileRepository;
import com.smartorienta.studentservice.repository.NoteRepository;
import com.smartorienta.studentservice.repository.SerieRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final SerieRepository serieRepository;
    private final NoteRepository noteRepository;
    private final AssignationService assignationService;
    private final ConseillerProfileRepository conseillerProfileRepository;

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

    /** Liste de tous les profils scolaires — réservée à l'administration. */
    public List<Map<String, Object>> tousLesProfils() {
        return studentProfileRepository.findAll().stream()
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", p.getId());
                    m.put("userId", p.getUserId());
                    m.put("matricule", p.getMatricule());
                    m.put("etablissement", p.getEtablissement());
                    m.put("niveau", p.getNiveau());
                    m.put("serieCode", p.getSerie() != null ? p.getSerie().getCode() : null);
                    m.put("conseillerId", p.getConseillerId());
                    return m;
                })
                .toList();
    }

    /**
     * Attribue manuellement un conseiller à un lycéen.
     * L'administrateur peut ainsi corriger une attribution automatique
     * qui ne conviendrait pas.
     */
    public Map<String, Object> reassigner(Long profileId, Long conseillerUserId) {

        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new BusinessException("Profil introuvable"));

        // Un conseiller doit exister et disposer d'un profil
        if (conseillerUserId != null
                && !conseillerProfileRepository.existsByUserId(conseillerUserId)) {
            throw new BusinessException("Ce conseiller n'a pas encore renseigné son profil");
        }

        profile.setConseillerId(conseillerUserId);
        StudentProfile saved = studentProfileRepository.save(profile);

        Map<String, Object> reponse = new HashMap<>();
        reponse.put("id", saved.getId());
        reponse.put("userId", saved.getUserId());
        reponse.put("conseillerId", saved.getConseillerId());
        return reponse;
    }

    /** Identifiants des lycéens suivis par un conseiller — appel inter-services. */
    public List<Long> idsEtudiantsDe(Long conseillerUserId) {
        return studentProfileRepository.findByConseillerId(conseillerUserId)
                .stream()
                .map(StudentProfile::getUserId)
                .toList();
    }
}