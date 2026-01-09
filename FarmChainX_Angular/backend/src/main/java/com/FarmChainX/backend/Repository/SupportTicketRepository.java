package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    
    List<SupportTicket> findByReportedById(String reportedById);
    
    List<SupportTicket> findByStatus(String status);
    
    SupportTicket findByTicketId(String ticketId);
    
    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status = 'OPEN'")
    long countOpenTickets();
    
    @Query("SELECT t FROM SupportTicket t WHERE t.reportedById = :userId OR t.reportedAgainstId = :userId")
    List<SupportTicket> findTicketsRelatedToUser(@Param("userId") String userId);
    
    List<SupportTicket> findByReportedAgainstId(String reportedAgainstId);
}