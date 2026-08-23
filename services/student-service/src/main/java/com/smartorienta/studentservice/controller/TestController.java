package com.smartorienta.studentservice.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/me")
    public String me(Authentication authentication) {
        return "Student Service - Connecté en tant que : " + authentication.getName();
    }
}