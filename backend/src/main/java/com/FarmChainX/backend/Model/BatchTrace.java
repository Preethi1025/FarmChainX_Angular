package com.FarmChainX.backend.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "batch_trace")
public class BatchTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }
    @Column(name="farmer_id")
    private String farmerId;


    @Column(name = "batch_id", nullable = false)
    private String batchId;

    @Column(name = "crop_id")
    private String cropId; // optional if you want crop-level trace

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "changed_by")
    private String changedBy; // Farmer, Distributor, etc.

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "location")
    private String location;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;


    // -----------------------------
    // Constructors, Getters & Setters
    // -----------------------------
    public BatchTrace() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getCropId() { return cropId; }
    public void setCropId(String cropId) { this.cropId = cropId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
