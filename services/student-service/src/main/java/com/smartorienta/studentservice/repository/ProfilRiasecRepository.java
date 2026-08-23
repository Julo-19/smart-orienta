package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.ProfilRiasec;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfilRiasecRepository extends JpaRepository<ProfilRiasec, Long> {

    Optional<ProfilRiasec> findByStudentProfileId(Long studentProfileId);
}