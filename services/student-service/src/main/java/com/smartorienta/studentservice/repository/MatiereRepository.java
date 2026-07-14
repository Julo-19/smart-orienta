package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatiereRepository extends JpaRepository<Matiere, Long> {
}