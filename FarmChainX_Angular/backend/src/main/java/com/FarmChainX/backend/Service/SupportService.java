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
        Notification notification = new Notification();
        notification.setUserId("1"); // Admin ID
        notification.setUserRole("ADMIN");
        notification.setTitle("New Support Ticket Created");
        notification.setMessage(String.format(
                "User %s (ID: %s) has created a new ticket: %s",
                ticket.getReportedByRole(),
                ticket.getReportedById(),
                ticket.getSubject()
        ));
        notification.setNotificationType("TICKET_CREATED");
        notification.setRelatedTicketId(ticket.getTicketId());
        notification.setTicketId(ticket.getId());  // Set the actual ticket ID

        notificationRepository.save(notification);
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
        // 1️⃣ Fetch the ticket
        SupportTicket ticket = getTicketById(ticketId);

        // 2️⃣ Set ticket and timestamp for the message
        message.setTicket(ticket);
        message.setCreatedAt(LocalDateTime.now());

        // 3️⃣ Save the message
        TicketMessage savedMessage = messageRepository.save(message);

        // 4️⃣ Update ticket timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        // 5️⃣ Determine notification recipients based on role
        if (message.isAdminResponse()) {
            // Admin reply → update ticket status
            ticket.setStatus("IN_PROGRESS");
            ticketRepository.save(ticket);

            // ✅ Send notification to the **reporter** of this ticket
            createUserNotification(
                    ticket.getReportedById(),           // receiver = ticket reporter
                    ticket.getReportedByRole(),
                    "Admin Response Received",
                    savedMessage.getMessage(),          // actual admin reply
                    ticket.getTicketId()
            );

            // If ticket is reported against another user, notify them too
            if (ticket.getReportedAgainstId() != null && !ticket.getReportedAgainstId().isEmpty()) {
                createUserNotification(
                        ticket.getReportedAgainstId(),
                        ticket.getReportedAgainstRole(),
                        "Issue Reported Against You",
                        savedMessage.getMessage(),
                        ticket.getTicketId()
                );
            }

        } else {
            // User reply → notify all admins
            userRepository.findByRole("ADMIN").forEach(admin -> {
                createUserNotification(
                        admin.getId(),
                        "ADMIN",
                        "User Response Received",
                        String.format("User %s (ID: %s) replied: %s",
                                ticket.getReportedByRole(),          // reporter info
                                ticket.getReportedById(),           // reporter ID
                                savedMessage.getMessage()),
                        ticket.getTicketId()
                );
            });
        }

        return savedMessage;
    }



    public List<TicketMessage> getTicketMessages(Long ticketId) {
        return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    // ========== NOTIFICATION METHODS ==========

    private void createUserNotification(String receiverId, String receiverRole,
                                        String title, String messageContent, String relatedTicketId) {

        if (receiverId == null || receiverId.isEmpty()) {
            // Skip if no valid receiver
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(receiverId);           // ✅ recipient
        notification.setUserRole(receiverRole);      // ✅ recipient role
        notification.setTitle(title);
        notification.setMessage(messageContent);
        notification.setNotificationType("TICKET_UPDATE");
        notification.setRelatedTicketId(relatedTicketId);

        try {
            SupportTicket ticket = ticketRepository.findByTicketId(relatedTicketId);
            if (ticket != null) {
                notification.setTicketId(ticket.getId());
            } else {
                notification.setTicketId(0L);
            }
        } catch (Exception e) {
            notification.setTicketId(0L);
        }

        // Always mark as unread initially
        notification.setRead(false);

        notificationRepository.save(notification);
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