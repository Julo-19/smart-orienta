package com.smartorienta.notificationservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;



@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recommandationId;

    @Column(nullable = false)
    private Long destinataireUserId;

    private String destinataireEmail;

    @Column(nullable = false, length = 20)
    private String statutDecision;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @Column(nullable = false)
    private boolean envoyee = false;

    private String messageErreur;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    private LocalDateTime dateEnvoi;
}