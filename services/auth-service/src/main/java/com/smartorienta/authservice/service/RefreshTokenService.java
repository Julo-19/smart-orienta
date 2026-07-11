package com.smartorienta.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private String key(String email) {
        return "refresh:" + email;
    }

    public void store(String email, String refreshToken) {
        redisTemplate.opsForValue().set(
                key(email),
                refreshToken,
                Duration.ofMillis(refreshTokenExpiration)
        );
    }

    public boolean isValid(String email, String refreshToken) {
        String stored = redisTemplate.opsForValue().get(key(email));
        return refreshToken.equals(stored);
    }

    public void delete(String email) {
        redisTemplate.delete(key(email));
    }
}