package com.smartorienta.notificationservice.client;

import com.smartorienta.notificationservice.dto.UserInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", url = "${auth-service.url}")
public interface AuthClient {

    @GetMapping("/api/auth/internal/users/{id}")
    UserInfo getUtilisateur(@PathVariable("id") Long id);
}