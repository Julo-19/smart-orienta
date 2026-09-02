package com.smartorienta.notificationservice.repository;

import com.smartorienta.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    boolean existsByRecommandationId(Long recommandationId);

    List<Notification> findByDestinataireUserIdOrderByDateCreationDesc(Long destinataireUserId);
}