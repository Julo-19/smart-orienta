package com.smartorienta.studentservice.controller;

import com.smartorienta.studentservice.dto.MatiereResponse;
import com.smartorienta.studentservice.dto.SerieResponse;
import com.smartorienta.studentservice.service.SerieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class SerieController {

    private final SerieService serieService;

    @GetMapping
    public ResponseEntity<List<SerieResponse>> getAllSeries() {
        return ResponseEntity.ok(serieService.getAllSeries());
    }

    @GetMapping("/{id}/matieres")
    public ResponseEntity<List<MatiereResponse>> getMatieres(@PathVariable Long id) {
        return ResponseEntity.ok(serieService.getMatieresBySerie(id));
    }
}