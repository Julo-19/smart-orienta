package com.smartorienta.orientationservice.client;

import com.smartorienta.orientationservice.dto.DossierMLResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "student-service")
public interface StudentClient {

    @GetMapping("/api/students/dossier-ml/{userId}")
    DossierMLResponse getDossier(@PathVariable("userId") Long userId);
}