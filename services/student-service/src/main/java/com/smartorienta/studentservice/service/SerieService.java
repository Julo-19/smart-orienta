package com.smartorienta.studentservice.service;

import com.smartorienta.studentservice.dto.MatiereResponse;
import com.smartorienta.studentservice.dto.SerieResponse;
import com.smartorienta.studentservice.repository.MatiereRepository;
import com.smartorienta.studentservice.repository.SerieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SerieService {

    private final SerieRepository serieRepository;
    private final MatiereRepository matiereRepository;

    public List<SerieResponse> getAllSeries() {
        return serieRepository.findAll().stream()
                .map(s -> new SerieResponse(s.getId(), s.getCode(), s.getLibelle()))
                .toList();
    }

    public List<MatiereResponse> getMatieresBySerie(Long serieId) {
        return matiereRepository.findBySerieId(serieId).stream()
                .map(m -> new MatiereResponse(m.getId(), m.getNom(), m.getCoefficient()))
                .toList();
    }
}