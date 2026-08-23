package com.smartorienta.orientationservice.repository;

import com.smartorienta.orientationservice.entity.Orientation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrientationRepository extends JpaRepository<Orientation, Long> {

    Optional<Orientation> findByLibelle(String libelle);

    boolean existsByLibelle(String libelle);

    List<Orientation> findAllByOrderByCategorieAscLibelleAsc();
}