package com.FarmChainX.backend.Model;

import com.FarmChainX.backend.enums.OrderStatus;
import java.time.LocalDateTime;

public class OrderDetailsDTO {

    private Long orderId;
    private String orderCode;
    private Double quantity;
    private Double pricePerKg;
    private Double totalAmount;
    private Double farmerProfit;       // ✅ new
    private Double distributorProfit;   // ✅ new
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expectedDelivery; // ✅ new

    private String cropName;
    private String cropType;

    private String farmerName;
    private String farmerContact;

    private String distributorName;
    private String distributorContact;

    private String deliveryAddress;
    private String contactNumber;

    private String cancelReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime warehouseAt;
    private LocalDateTime inTransitAt;
    private LocalDateTime deliveredAt;

    public String getCropImageUrl() {
        return cropImageUrl;
    }

    public void setCropImageUrl(String cropImageUrl) {
        this.cropImageUrl = cropImageUrl;
    }

    private String cropImageUrl;
    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
    public LocalDateTime getWarehouseAt() {
        return warehouseAt;
    }

    public void setWarehouseAt(LocalDateTime warehouseAt) {
        this.warehouseAt = warehouseAt;
    }

    public LocalDateTime getInTransitAt() {
        return inTransitAt;
    }

    public void setInTransitAt(LocalDateTime inTransitAt) {
        this.inTransitAt = inTransitAt;
    }


    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getPricePerKg() { return pricePerKg; }
    public void setPricePerKg(Double pricePerKg) { this.pricePerKg = pricePerKg; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getFarmerProfit() { return farmerProfit; }
    public void setFarmerProfit(Double farmerProfit) { this.farmerProfit = farmerProfit; }

    public Double getDistributorProfit() { return distributorProfit; }
    public void setDistributorProfit(Double distributorProfit) { this.distributorProfit = distributorProfit; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDateTime expectedDelivery) { this.expectedDelivery = expectedDelivery; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getFarmerContact() { return farmerContact; }
    public void setFarmerContact(String farmerContact) { this.farmerContact = farmerContact; }

    public String getDistributorName() { return distributorName; }
    public void setDistributorName(String distributorName) { this.distributorName = distributorName; }

    public String getDistributorContact() { return distributorContact; }
    public void setDistributorContact(String distributorContact) { this.distributorContact = distributorContact; }
}