package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.QuestionResponse;
import com.smartorienta.studentservice.repository.QuestionRiasecRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/riasec/questions")
@RequiredArgsConstructor
public class QuestionRiasecController {

    private final QuestionRiasecRepository questionRepository;

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getQuestions() {
        List<QuestionResponse> questions = questionRepository.findAllByOrderByIdAsc().stream()
                .map(q -> new QuestionResponse(q.getId(), q.getTexte(), q.getDimension()))
                .toList();
        return ResponseEntity.ok(questions);
    }
}