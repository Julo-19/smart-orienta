package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.Contexte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContexteRepository extends JpaRepository<Contexte, Long> {

    Optional<Contexte> findByStudentProfileId(Long studentProfileId);
}