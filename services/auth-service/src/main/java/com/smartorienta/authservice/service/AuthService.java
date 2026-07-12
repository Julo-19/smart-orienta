package com.smartorienta.authservice.service;

import com.smartorienta.authservice.dto.AuthResponse;
import com.smartorienta.authservice.dto.LoginRequest;
import com.smartorienta.authservice.dto.RefreshRequest;
import com.smartorienta.authservice.dto.RegisterRequest;
import com.smartorienta.authservice.entity.Role;
import com.smartorienta.authservice.entity.User;
import com.smartorienta.authservice.exception.EmailAlreadyUsedException;
import com.smartorienta.authservice.exception.InvalidCredentialsException;
import com.smartorienta.authservice.exception.InvalidTokenException;
import com.smartorienta.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final VerificationTokenService verificationTokenService;

    public User register(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setRole(Role.LYCEEN);

        User savedUser = userRepository.save(user);
        String token = verificationTokenService.generate(savedUser.getEmail());
        emailService.sendVerificationEmail(savedUser.getEmail(), token);

        return savedUser;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou mot de passe incorrect"));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Email ou mot de passe incorrect");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        refreshTokenService.store(user.getEmail(), refreshToken);

        return new AuthResponse(accessToken, refreshToken, user.getEmail(),user.getRole().name());
    }

    public AuthResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new InvalidTokenException("Refresh token invalid ou expired");
        }

        String email = jwtService.extractEmail(refreshToken);

        if (!refreshTokenService.isValid(email,refreshToken)) {
            throw new InvalidTokenException("Refresh token invalid ou expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        String newAccessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(newAccessToken, refreshToken, user.getEmail(),user.getRole().name());
    }

    public void logout(String refreshToken) {

        if (jwtService.isTokenValid(refreshToken)) {
            String email = jwtService.extractEmail(refreshToken);
            refreshTokenService.delete(email);
        }
    }

    public void verifyEmail(String token) {

        String email = verificationTokenService.consume(token);

        if (email == null) {
            throw new InvalidTokenException("Lien de confirmation invalide ou expiré");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setEmailVerified(true);
        userRepository.save(user);
    }

    public void forgotPassword(String email) {

        if (userRepository.existsByEmail(email)) {
            String token = verificationTokenService.generateResetToken(email);
            emailService.sendPasswordResetEmail(email, token);
        }
    }

    public void resetPassword(String token, String newPassword) {
        String email = verificationTokenService.consumeResetToken(token);

        if (email == null) {
            throw new InvalidTokenException("Lien de réinitialisation invalide ou expiré");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenService.delete(email);
    }

}
