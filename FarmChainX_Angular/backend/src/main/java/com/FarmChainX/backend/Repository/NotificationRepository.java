package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdAndUserRoleOrderByCreatedAtDesc(String userId, String userRole);
    
    List<Notification> findByUserIdAndUserRoleAndIsReadFalse(String userId, String userRole);
    
    long countByUserIdAndUserRoleAndIsReadFalse(String userId, String userRole);
    
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.notificationType = 'TICKET_UPDATE'")
    List<Notification> findTicketNotificationsForUser(@Param("userId") String userId);
    
    @Query("SELECT n FROM Notification n WHERE n.relatedTicketId = :ticketId")
    List<Notification> findByRelatedTicketId(@Param("ticketId") String ticketId);
    
    @Query("DELETE FROM Notification n WHERE n.createdAt < :date")
    void deleteNotificationsOlderThan(@Param("date") LocalDateTime date);
}