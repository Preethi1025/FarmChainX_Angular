package com.FarmChainX.backend.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.FarmChainX.backend.Model.SupportTicket;
import com.FarmChainX.backend.Model.TicketMessage;
import com.FarmChainX.backend.Service.SupportService;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    
    @Autowired
    private SupportService supportService;
    
    // ========== TICKET ENDPOINTS ==========
    
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody SupportTicket ticket) {
        try {
            SupportTicket createdTicket = supportService.createTicket(ticket);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ticket created successfully");
            response.put("ticket", createdTicket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create ticket: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    
    @GetMapping("/tickets/user/{userId}")
    public ResponseEntity<?> getUserTickets(@PathVariable String userId) {
        try {
            List<SupportTicket> tickets = supportService.getUserTickets(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tickets", tickets);
            response.put("count", tickets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/tickets/all")
    public ResponseEntity<?> getAllTickets() {
        try {
            List<SupportTicket> tickets = supportService.getAllTickets();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tickets", tickets);
            response.put("count", tickets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/tickets/open")
    public ResponseEntity<?> getOpenTickets() {
        try {
            List<SupportTicket> tickets = supportService.getOpenTickets();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tickets", tickets);
            response.put("count", tickets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch open tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/tickets/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        try {
            SupportTicket ticket = supportService.getTicketById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("ticket", ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Ticket not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/tickets/ticketId/{ticketId}")
    public ResponseEntity<?> getTicketByTicketId(@PathVariable String ticketId) {
        try {
            SupportTicket ticket = supportService.getTicketByTicketId(ticketId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("ticket", ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Ticket not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            SupportTicket ticket = supportService.updateTicketStatus(id, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ticket status updated to " + status);
            response.put("ticket", ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/tickets/{id}/priority")
    public ResponseEntity<?> updateTicketPriority(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String priority = request.get("priority");
            SupportTicket ticket = supportService.updateTicketPriority(id, priority);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Ticket priority updated to " + priority);
            response.put("ticket", ticket);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update priority: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== MESSAGE ENDPOINTS ==========
    
    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> addMessageToTicket(
            @PathVariable Long ticketId,
            @RequestBody TicketMessage message) {
        try {
            TicketMessage savedMessage = supportService.addMessageToTicket(ticketId, message);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Message added successfully");
            response.put("ticketMessage", savedMessage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> getTicketMessages(@PathVariable Long ticketId) {
        try {
            List<TicketMessage> messages = supportService.getTicketMessages(ticketId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messages", messages);
            response.put("count", messages.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch messages: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ========== NOTIFICATION ENDPOINTS ==========
    
    @GetMapping("/notifications/{userId}/{userRole}")
    public ResponseEntity<?> getUserNotifications(
            @PathVariable String userId,
            @PathVariable String userRole) {
        try {
            var notifications = supportService.getUserNotifications(userId, userRole);
            long unreadCount = supportService.getUnreadNotificationCount(userId, userRole);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            var notification = supportService.markNotificationAsRead(notificationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marked as read");
            response.put("notification", notification);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/notifications/read-all/{userId}/{userRole}")
    public ResponseEntity<?> markAllNotificationsAsRead(
            @PathVariable String userId,
            @PathVariable String userRole) {
        try {
            supportService.markAllNotificationsAsRead(userId, userRole);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All notifications marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== STATISTICS ENDPOINTS ==========
    
    @GetMapping("/stats")
    public ResponseEntity<?> getSupportStats() {
        try {
            Map<String, Object> stats = supportService.getSupportStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ========== ADMIN-ONLY ENDPOINTS ==========
    
    @GetMapping("/admin/tickets/related/{userId}")
    public ResponseEntity<?> getTicketsRelatedToUser(@PathVariable String userId) {
        try {
            List<SupportTicket> tickets = supportService.getTicketsRelatedToUser(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tickets", tickets);
            response.put("count", tickets.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch related tickets: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/admin/responses/{ticketId}")
    public ResponseEntity<?> getAdminResponsesForTicket(@PathVariable Long ticketId) {
        try {
            List<TicketMessage> messages = supportService.getAdminResponsesForTicket(ticketId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messages", messages);
            response.put("count", messages.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch admin responses: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}