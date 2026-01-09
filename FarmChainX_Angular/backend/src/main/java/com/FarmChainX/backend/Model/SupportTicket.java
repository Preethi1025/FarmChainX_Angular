package com.FarmChainX.backend.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String ticketId;
    
    @Column(nullable = false)
    private String reportedById;
    
    @Column(nullable = false)
    private String reportedByRole;
    
    private String reportedAgainstId;
    private String reportedAgainstRole;
    
    @Column(nullable = false)
    private String issueType;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    @Column(nullable = false)
    private String status = "OPEN";
    
    @Column(nullable = false)
    private String priority = "MEDIUM";
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public SupportTicket() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.ticketId = "TKT-" + System.currentTimeMillis() + "-" + 
                       (int)(Math.random() * 1000);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTicketId() {
        return ticketId;
    }
    
    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }
    
    public String getReportedById() {
        return reportedById;
    }
    
    public void setReportedById(String reportedById) {
        this.reportedById = reportedById;
    }
    
    public String getReportedByRole() {
        return reportedByRole;
    }
    
    public void setReportedByRole(String reportedByRole) {
        this.reportedByRole = reportedByRole;
    }
    
    public String getReportedAgainstId() {
        return reportedAgainstId;
    }
    
    public void setReportedAgainstId(String reportedAgainstId) {
        this.reportedAgainstId = reportedAgainstId;
    }
    
    public String getReportedAgainstRole() {
        return reportedAgainstRole;
    }
    
    public void setReportedAgainstRole(String reportedAgainstRole) {
        this.reportedAgainstRole = reportedAgainstRole;
    }
    
    public String getIssueType() {
        return issueType;
    }
    
    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}