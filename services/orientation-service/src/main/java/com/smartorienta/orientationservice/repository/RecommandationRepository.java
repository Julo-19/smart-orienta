package com.smartorienta.orientationservice.repository;

import com.smartorienta.orientationservice.entity.Recommandation;
import com.smartorienta.orientationservice.entity.StatutRecommandation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommandationRepository extends JpaRepository<Recommandation, Long> {

    List<Recommandation> findByEtudiantUserIdOrderByDateGenerationDesc(Long etudiantUserId);

    List<Recommandation> findByConseillerUserIdAndStatut(Long conseillerUserId, StatutRecommandation statut);

    List<Recommandation> findByStatut(StatutRecommandation statut);

    List<Recommandation> findByConseillerUserIdOrderByDateDecisionDesc(Long conseillerUserId);
}