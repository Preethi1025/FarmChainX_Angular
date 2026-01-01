package com.FarmChainX.backend.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.FarmChainX.backend.Model.Notification;
import com.FarmChainX.backend.Model.SupportTicket;
import com.FarmChainX.backend.Model.TicketMessage;
import com.FarmChainX.backend.Repository.NotificationRepository;
import com.FarmChainX.backend.Repository.SupportTicketRepository;
import com.FarmChainX.backend.Repository.TicketMessageRepository;
import com.FarmChainX.backend.Repository.UserRepository;

@Service
public class SupportService {
    
    @Autowired
    private SupportTicketRepository ticketRepository;
    
    @Autowired
    private TicketMessageRepository messageRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // ========== TICKET METHODS ==========
    
    @Transactional
    public SupportTicket createTicket(SupportTicket ticket) {
        // Save the ticketif (ticket.getTicketId() == null || ticket.getTicketId().isEmpty()) {
        ticket.setTicketId("TKT-" + System.currentTimeMillis() + "-" + 
                          (int)(Math.random() * 1000));
    
        SupportTicket savedTicket = ticketRepository.save(ticket);
        
        // Create initial message from the reporter
        TicketMessage initialMessage = new TicketMessage();
        initialMessage.setTicket(savedTicket);
        initialMessage.setSenderId(ticket.getReportedById());
        initialMessage.setSenderRole(ticket.getReportedByRole());
        initialMessage.setMessage("Issue reported: " + ticket.getDescription());
        initialMessage.setAdminResponse(false);
        messageRepository.save(initialMessage);
        
        // Create notification for admin
        createAdminNotification(savedTicket);
        
        return savedTicket;
    }

private void createAdminNotification(SupportTicket ticket) {

    userRepository.findByRole("ADMIN").forEach(admin -> {
        Notification n = new Notification();
        n.setUserId(admin.getId());
        n.setUserRole("ADMIN");
        n.setTitle("New Support Ticket");
        n.setMessage(
            "Ticket from " + ticket.getReportedByRole() +
            " (ID: " + ticket.getReportedById() + ")"
        );
        n.setNotificationType("TICKET_CREATED");
        n.setRelatedTicketId(ticket.getTicketId());
        n.setTicketId(ticket.getId());
        notificationRepository.save(n);
    });
}

    public List<SupportTicket> getUserTickets(String userId) {
        return ticketRepository.findByReportedById(userId);
    }
    
    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAll();
    }
    
    public List<SupportTicket> getOpenTickets() {
        return ticketRepository.findByStatus("OPEN");
    }
    
    public SupportTicket getTicketById(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }
    
    public SupportTicket getTicketByTicketId(String ticketId) {
        SupportTicket ticket = ticketRepository.findByTicketId(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found with ticketId: " + ticketId);
        }
        return ticket;
    }
    
    public SupportTicket updateTicketStatus(Long ticketId, String status) {
        SupportTicket ticket = getTicketById(ticketId);
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
    
    public SupportTicket updateTicketPriority(Long ticketId, String priority) {
        SupportTicket ticket = getTicketById(ticketId);
        ticket.setPriority(priority);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
    
    // ========== MESSAGE METHODS ==========
    
    @Transactional
    public TicketMessage addMessageToTicket(Long ticketId, TicketMessage message) {
        SupportTicket ticket = getTicketById(ticketId);
        
        message.setTicket(ticket);
        TicketMessage savedMessage = messageRepository.save(message);
        
        // Update ticket timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        // If admin is responding, update status and notify users
        if (message.isAdminResponse()) {
            ticket.setStatus("IN_PROGRESS");
            ticketRepository.save(ticket);
            
            // Notify the user who reported
            createUserNotification(
                ticket.getReportedById(),
                ticket.getReportedByRole(),
                "Admin Response Received",
                String.format("Admin has responded to your ticket: %s", ticket.getSubject()),
                ticket.getTicketId()
            );
            
            // If ticket is against another user, notify them too
            if (ticket.getReportedAgainstId() != null && !ticket.getReportedAgainstId().isEmpty()) {
                createUserNotification(
                    ticket.getReportedAgainstId(),
                    ticket.getReportedAgainstRole(),
                    "Issue Reported Against You",
                    String.format("An issue has been reported against you. Ticket: %s", ticket.getTicketId()),
                    ticket.getTicketId()
                );
            }
        } else {
            // If user is responding, notify admin
            createUserNotification(
                "1", // Admin ID
                "ADMIN",
                "User Response Received",
                String.format("User %s (ID: %s) responded to ticket: %s", 
                    message.getSenderRole(), message.getSenderId(), ticket.getSubject()),
                ticket.getTicketId()
            );
        }
        
        return savedMessage;
    }
    
    public List<TicketMessage> getTicketMessages(Long ticketId) {
        return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }
    
    // ========== NOTIFICATION METHODS ==========
    private void createUserNotification(
        String userId,
        String userRole,
        String title,
        String message,
        String relatedTicketId) {

    Notification n = new Notification();
    n.setUserId(userId);
    n.setUserRole(userRole);
    n.setTitle(title);
    n.setMessage(message);
    n.setNotificationType("TICKET_UPDATE");
    n.setRelatedTicketId(relatedTicketId);

    SupportTicket t = ticketRepository.findByTicketId(relatedTicketId);
    n.setTicketId(t != null ? t.getId() : null);

    notificationRepository.save(n);
}


    public List<Notification> getUserNotifications(String userId, String userRole) {
        return notificationRepository.findByUserIdAndUserRoleOrderByCreatedAtDesc(userId, userRole);
    }
    
    public long getUnreadNotificationCount(String userId, String userRole) {
        return notificationRepository.countByUserIdAndUserRoleAndIsReadFalse(userId, userRole);
    }
    
    @Transactional
    public Notification markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllNotificationsAsRead(String userId, String userRole) {
        List<Notification> unreadNotifications = 
            notificationRepository.findByUserIdAndUserRoleAndIsReadFalse(userId, userRole);
        
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
    
    // ========== STATISTICS METHODS ==========
    
    public Map<String, Object> getSupportStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total tickets
        long totalTickets = ticketRepository.count();
        stats.put("totalTickets", totalTickets);
        
        // Open tickets
        long openTickets = ticketRepository.countOpenTickets();
        stats.put("openTickets", openTickets);
        
        // In progress tickets
        List<SupportTicket> inProgressTickets = ticketRepository.findByStatus("IN_PROGRESS");
        stats.put("inProgressTickets", inProgressTickets.size());
        
        // Resolved tickets
        List<SupportTicket> resolvedTickets = ticketRepository.findByStatus("RESOLVED");
        stats.put("resolvedTickets", resolvedTickets.size());
        
        // Closed tickets
        List<SupportTicket> closedTickets = ticketRepository.findByStatus("CLOSED");
        stats.put("closedTickets", closedTickets.size());
        
        // Tickets by role - FIXED: Using getAllTickets() and filtering
        List<SupportTicket> allTickets = ticketRepository.findAll();
        long farmerTickets = allTickets.stream()
            .filter(ticket -> "FARMER".equals(ticket.getReportedByRole()))
            .count();
        long distributorTickets = allTickets.stream()
            .filter(ticket -> "DISTRIBUTOR".equals(ticket.getReportedByRole()))
            .count();
        long buyerTickets = allTickets.stream()
            .filter(ticket -> "BUYER".equals(ticket.getReportedByRole()))
            .count();
        
        Map<String, Long> ticketsByRole = new HashMap<>();
        ticketsByRole.put("FARMER", farmerTickets);
        ticketsByRole.put("DISTRIBUTOR", distributorTickets);
        ticketsByRole.put("BUYER", buyerTickets);
        stats.put("ticketsByRole", ticketsByRole);
        
        return stats;
    }
    
    // ========== HELPER METHODS ==========
    
    public List<SupportTicket> getTicketsRelatedToUser(String userId) {
        return ticketRepository.findTicketsRelatedToUser(userId);
    }
    
    public List<SupportTicket> getTicketsReportedAgainstUser(String userId) {
        return ticketRepository.findByReportedAgainstId(userId);
    }
    
    public List<TicketMessage> getAdminResponsesForTicket(Long ticketId) {
        return messageRepository.findByTicketIdAndIsAdminResponseTrue(ticketId);
    }
}