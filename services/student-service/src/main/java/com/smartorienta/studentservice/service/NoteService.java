package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.BulletinResponse;
import com.smartorienta.studentservice.dto.NoteRequest;
import com.smartorienta.studentservice.dto.NoteResponse;
import com.smartorienta.studentservice.entity.Matiere;
import com.smartorienta.studentservice.entity.Note;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.exception.BusinessException;
import com.smartorienta.studentservice.repository.MatiereRepository;
import com.smartorienta.studentservice.repository.NoteRepository;
import com.smartorienta.studentservice.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final MatiereRepository matiereRepository;
    private final StudentProfileRepository studentProfileRepository;

    public Note saisirNote(Long userId, NoteRequest request) {

        // Validation des valeurs
        if (request.getValeur() < 0 || request.getValeur() > 20) {
            throw new BusinessException("La note doit être comprise entre 0 et 20");
        }
        if (request.getSemestre() != 1 && request.getSemestre() != 2) {
            throw new BusinessException("Le semestre doit être 1 ou 2");
        }

        // Récupération du profil du lycéen
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé, veuillez le créer d'abord"));

        // Récupération de la matière
        Matiere matiere = matiereRepository.findById(request.getMatiereId())
                .orElseThrow(() -> new BusinessException("Matière introuvable"));

        // Verifier si la matière appartient-elle à la série du lycéen ?
        if (!matiere.getSerie().getId().equals(profile.getSerie().getId())) {
            throw new BusinessException("Cette matière n'appartient pas à votre série");
        }

        // Création ou mise à jour
        Note note = noteRepository
                .findByStudentProfileIdAndMatiereIdAndSemestre(
                        profile.getId(), matiere.getId(), request.getSemestre())
                .orElse(new Note());

        note.setStudentProfile(profile);
        note.setMatiere(matiere);
        note.setSemestre(request.getSemestre());
        note.setValeur(request.getValeur());

        return noteRepository.save(note);
    }

    public BulletinResponse getBulletin(Long userId, int semestre) {

        if (semestre != 1 && semestre != 2) {
            throw new BusinessException("Le semestre doit être 1 ou 2");
        }

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Aucun profil trouvé"));

        // Les notes du semestre demandé
        List<Note> notes = noteRepository.findByStudentProfileId(profile.getId())
                .stream()
                .filter(n -> n.getSemestre() == semestre)
                .toList();

        // Calcul de la moyenne pondérée
        double sommePonderee = 0;
        int sommeCoefficients = 0;

        for (Note note : notes) {
            int coef = note.getMatiere().getCoefficient();
            sommePonderee += note.getValeur() * coef;
            sommeCoefficients += coef;
        }

        double moyenne = (sommeCoefficients == 0) ? 0 : sommePonderee / sommeCoefficients;
        moyenne = Math.round(moyenne * 100.0) / 100.0;   // arrondi à 2 décimales

        // Transformation en DTOs
        List<NoteResponse> notesResponse = notes.stream()
                .map(n -> new NoteResponse(
                        n.getId(),
                        n.getMatiere().getNom(),
                        n.getMatiere().getCoefficient(),
                        n.getValeur()))
                .toList();

        int matieresAttendues = matiereRepository.findBySerieId(profile.getSerie().getId()).size();

        return new BulletinResponse(
                semestre,
                profile.getSerie().getCode(),
                notesResponse,
                moyenne,
                sommeCoefficients,
                notes.size(),
                matieresAttendues);
    }
}
