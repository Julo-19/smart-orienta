package com.smartorienta.studentservice.repository;

import com.smartorienta.studentservice.entity.QuestionRiasec;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRiasecRepository extends JpaRepository<QuestionRiasec, Integer> {

    List<QuestionRiasec> findAllByOrderByIdAsc();
}