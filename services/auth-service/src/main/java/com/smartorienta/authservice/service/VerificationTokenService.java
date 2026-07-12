package com.smartorienta.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenService {

    private final StringRedisTemplate redisTemplate;

    private String key(String token) {
        return "verify:" + token;
    }

    public String generate(String email) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                key(token),
                email,
                Duration.ofHours(24)
        );
        return token;
    }

    public String consume(String token) {
        String email = redisTemplate.opsForValue().get(key(token));
        if (email != null) {
            redisTemplate.delete(key(token));
        }
        return email;
    }
}