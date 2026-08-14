package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByStudentProfileId(Long studentProfileId);

    Optional<Note> findByStudentProfileIdAndMatiereIdAndSemestre(
            Long studentProfileId, Long matiereId, int semestre);
}