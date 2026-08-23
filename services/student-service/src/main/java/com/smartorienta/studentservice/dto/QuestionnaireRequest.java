package com.smartorienta.studentservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class QuestionnaireRequest {

    private List<ReponseQuestion> reponses;
}