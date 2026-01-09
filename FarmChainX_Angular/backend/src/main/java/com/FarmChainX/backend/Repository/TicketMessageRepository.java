package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    
    @Query("SELECT tm FROM TicketMessage tm WHERE tm.ticket.id = :ticketId AND tm.isAdminResponse = true")
    List<TicketMessage> findByTicketIdAndIsAdminResponseTrue(@Param("ticketId") Long ticketId);
}