package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.ConseillerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConseillerProfileRepository extends JpaRepository<ConseillerProfile, Long> {

    Optional<ConseillerProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<ConseillerProfile> findByEtablissement(String etablissement);

    List<ConseillerProfile> findByEtablissementAndSpecialite(String etablissement, String specialite);

    List<ConseillerProfile> findBySpecialite(String specialite);
}