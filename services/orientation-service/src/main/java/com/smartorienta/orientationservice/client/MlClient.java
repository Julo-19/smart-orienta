package com.smartorienta.orientationservice.client;

import com.smartorienta.orientationservice.dto.PredictionRequest;
import com.smartorienta.orientationservice.dto.PredictionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Client du service de prédiction.
 *
 * Ce service étant développé en Python, il ne s'enregistre pas dans
 * l'annuaire : son adresse est fournie par la configuration.
 */
@FeignClient(name = "ml-service", url = "${ml-service.url}")
public interface MlClient {

    @PostMapping("/predict")
    PredictionResponse predire(@RequestBody PredictionRequest features);
}