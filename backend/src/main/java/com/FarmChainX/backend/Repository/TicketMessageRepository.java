package com.FarmChainX.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.FarmChainX.backend.Model.TicketMessage;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    List<TicketMessage> findByTicketIdAndIsAdminResponseTrueOrderByCreatedAtDesc(Long ticketId);
    
    @Query("SELECT tm FROM TicketMessage tm WHERE tm.ticket.id = :ticketId AND tm.isAdminResponse = true")
    List<TicketMessage> findByTicketIdAndIsAdminResponseTrue(@Param("ticketId") Long ticketId);

    // 🔥 NEW — used for isolated conversations
    List<TicketMessage> findByTicketIdAndVisibleToInOrderByCreatedAtAsc(
            Long ticketId,
            List<String> visibleTo
    );
}
