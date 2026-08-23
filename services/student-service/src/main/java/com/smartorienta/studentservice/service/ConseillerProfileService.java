package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.*;
import com.smartorienta.studentservice.entity.ConseillerProfile;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConseillerProfileService {

    private final ConseillerProfileRepository conseillerProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NoteRepository noteRepository;
    private final ProfilRiasecRepository profilRiasecRepository;
    private final ContexteRepository contexteRepository;
    private final AssignationService assignationService;

    /**
     * Création ou mise à jour du profil d'un conseiller.
     * L'enregistrement déclenche l'attribution des lycéens qui n'avaient
     * pas encore de conseiller, faute de candidat disponible.
     */
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

        ConseillerProfile saved = conseillerProfileRepository.save(profile);

        assignationService.assignerLesProfilsSansConseiller();

        return saved;
    }

    public ConseillerProfile getMonProfil(Long userId) {
        return conseillerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil conseiller trouvé"));
    }

    /** Liste allégée des lycéens suivis par le conseiller. */
    public List<EtudiantListItem> getMesEtudiants(Long conseillerUserId) {

        return studentProfileRepository.findByConseillerId(conseillerUserId).stream()
                .map(p -> new EtudiantListItem(
                        p.getId(),
                        p.getUserId(),
                        p.getMatricule(),
                        p.getEtablissement(),
                        p.getNiveau(),
                        p.getSerie() != null ? p.getSerie().getCode() : null,
                        noteRepository.findByStudentProfileId(p.getId()).size()))
                .toList();
    }

    /** Dossier complet d'un lycéen, réservé au conseiller auquel il est assigné. */
    public DossierEtudiant getDossierEtudiant(Long conseillerUserId, Long profileId) {

        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new BusinessException("Étudiant introuvable"));

        if (!conseillerUserId.equals(profile.getConseillerId())) {
            throw new BusinessException("Cet étudiant ne vous est pas assigné");
        }

        List<NoteResponse> notes = noteRepository.findByStudentProfileId(profile.getId()).stream()
                .map(n -> new NoteResponse(
                        n.getId(),
                        n.getMatiere().getNom(),
                        n.getMatiere().getCoefficient(),
                        n.getValeur()))
                .toList();

        ProfilRiasecResponse riasec = profilRiasecRepository
                .findByStudentProfileId(profile.getId())
                .map(r -> new ProfilRiasecResponse(
                        r.getScoreR(), r.getScoreI(), r.getScoreA(),
                        r.getScoreS(), r.getScoreE(), r.getScoreC(),
                        r.getCodeHolland(),
                        r.getStress(), r.getSocial(), r.getAutonomie(), r.getAdaptabilite()))
                .orElse(null);

        ContexteResponse contexte = contexteRepository
                .findByStudentProfileId(profile.getId())
                .map(ctx -> new ContexteResponse(
                        ctx.getContraintes(), ctx.getPassions(),
                        ctx.getFilieresRefusees(), ctx.getMessageConseiller()))
                .orElse(null);

        ProfileResponse profilDto = new ProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getEtablissement(),
                profile.getMatricule(),
                profile.getNiveau(),
                profile.getRegion(),
                profile.getDateNaissance(),
                profile.getSexe(),
                profile.getSerie() != null ? profile.getSerie().getId() : null,
                profile.getSerie() != null ? profile.getSerie().getCode() : null,
                profile.getSerie() != null ? profile.getSerie().getLibelle() : null,
                profile.getConseillerId());

        return new DossierEtudiant(profilDto, notes, riasec, contexte);
    }
}