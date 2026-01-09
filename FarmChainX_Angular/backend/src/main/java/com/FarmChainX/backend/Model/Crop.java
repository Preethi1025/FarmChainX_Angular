package com.FarmChainX.backend.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "crops")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crop_id")
    private Long cropId;

    @Column(name = "farmer_id")
    private String farmerId;

    @Column(name = "is_blocked")
    private Boolean blocked = false;

    @Column(name = "batch_id")
    private String batchId;

    @Column(name = "crop_name")
    private String cropName;

    @Column(name = "price")
    private Double price;
    private String quantity;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "crop_type")
    private String cropType;

    private String variety;

    private String location;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "quality_grade")
    private String qualityGrade;

    private String status;

    @Column(name = "actual_yield")
    private String actualYield;

    @Column(name = "estimated_yield")
    private String estimatedYield;

    @Column(name = "expected_harvest_date")
    private String expectedHarvestDate;

    @Column(name = "actual_harvest_date")
    private String actualHarvestDate;

    @Column(name = "sow_date")
    private String sowDate;

    @Column(name = "ai_confidence_score")
    private Double aiConfidenceScore;

    @Column(name = "stage")
    private String stage;

    @Column(columnDefinition = "TEXT")
    private String traceLog;

    @Column(name = "crop_image_url")
    private String cropImageUrl;
    @Column(name = "quality_check_status")
    private String qualityCheckStatus = "PENDING";
    public String getCropImageUrl() {
        return cropImageUrl;
    }

    public String getQualityCheckStatus() {
        return qualityCheckStatus;
    }

    public void setQualityCheckStatus(String qualityCheckStatus) {
        this.qualityCheckStatus = qualityCheckStatus;
    }

    public void setCropImageUrl(String cropImageUrl) {
        this.cropImageUrl = cropImageUrl;
    }

    private Double farmerPrice;

    public Double getFarmerPrice() {
        return farmerPrice;
    }

    public void setFarmerPrice(Double farmerPrice) {
        this.farmerPrice = farmerPrice;
    }
    // ---------- getters / setters ----------

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
    }

    public String getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(String farmerId) {
        this.farmerId = farmerId;
    }

    // Updated blocked getter/setter to use Boolean consistently
    public Boolean getBlocked() {
        return blocked;
    }

    public void setBlocked(Boolean blocked) {
        this.blocked = blocked;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }

    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActualYield() { return actualYield; }
    public void setActualYield(String actualYield) { this.actualYield = actualYield; }

    public String getEstimatedYield() { return estimatedYield; }
    public void setEstimatedYield(String estimatedYield) { this.estimatedYield = estimatedYield; }

    public String getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(String expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }

    public String getActualHarvestDate() { return actualHarvestDate; }
    public void setActualHarvestDate(String actualHarvestDate) { this.actualHarvestDate = actualHarvestDate; }

    public String getSowDate() { return sowDate; }
    public void setSowDate(String sowDate) { this.sowDate = sowDate; }

    public Double getAiConfidenceScore() { return aiConfidenceScore; }
    public void setAiConfidenceScore(Double aiConfidenceScore) { this.aiConfidenceScore = aiConfidenceScore; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getTraceLog() { return traceLog; }
    public void setTraceLog(String traceLog) { this.traceLog = traceLog; }


}