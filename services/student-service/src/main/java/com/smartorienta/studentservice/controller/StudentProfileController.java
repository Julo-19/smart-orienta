package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.ProfileRequest;
import com.smartorienta.studentservice.dto.ProfileResponse;
import com.smartorienta.studentservice.entity.StudentProfile;
import com.smartorienta.studentservice.service.JwtService;
import com.smartorienta.studentservice.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    private final JwtService jwtService;
    @PostMapping("/profile")
    public ResponseEntity<ProfileResponse> createProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProfileRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentProfileService.createProfile(userId, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getMonProfil(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(studentProfileService.getMonProfil(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProfileRequest request) {

        Long userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(studentProfileService.updateProfile(userId, request));
    }

    @GetMapping("/admin/tous")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> tousLesProfils() {
        return ResponseEntity.ok(studentProfileService.tousLesProfils());
    }
}