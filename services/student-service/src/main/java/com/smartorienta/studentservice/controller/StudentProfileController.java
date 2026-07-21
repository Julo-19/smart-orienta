package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.ProfileRequest;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.service.JwtService;
import com.smartorienta.studentservice.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    private final JwtService jwtService;

    @PostMapping("/profile")
    public ResponseEntity<StudentProfile> createProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProfileRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));

        StudentProfile profile = studentProfileService.createProfile(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }
}