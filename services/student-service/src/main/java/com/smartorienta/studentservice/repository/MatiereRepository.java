package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatiereRepository extends JpaRepository<Matiere, Long> {
    List<Matiere> findBySerieId(Long serieId);
}