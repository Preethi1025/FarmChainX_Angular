package com.FarmChainX.backend.Model;

import com.FarmChainX.backend.enums.OrderStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    private Long listingId;
    private String batchId;

    private String consumerId;
    private String distributorId;

    private Double quantity;
    private Double pricePerKg;
    private Double totalAmount;

//    private Double farmerProfit;       // ✅ new
//    private Double distributorProfit;   // ✅ new
    @JsonProperty("expected_delivery")
    private LocalDateTime expectedDelivery;

    //private LocalDateTime expectedDelivery; // ✅ new

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String deliveryAddress;
    private String contactNumber;

    private String cancelReason;
    private LocalDateTime cancelledAt;

    private LocalDateTime warehouseAt;
    private LocalDateTime inTransitAt;
    private LocalDateTime deliveredAt;

    private String warehouseLocation;
    private String transitLocation;

    public String getWarehouseLocation() {
        return warehouseLocation;
    }

    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }

    public String getTransitLocation() {
        return transitLocation;
    }

    public void setTransitLocation(String transitLocation) {
        this.transitLocation = transitLocation;
    }

    // @Column(nullable = false)
    private Double farmerProfit = 0.0;

    //@Column(nullable = false)
    private Double distributorProfit = 0.0;


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

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
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

    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getConsumerId() { return consumerId; }
    public void setConsumerId(String consumerId) { this.consumerId = consumerId; }

    public String getDistributorId() { return distributorId; }
    public void setDistributorId(String distributorId) { this.distributorId = distributorId; }

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

    public LocalDateTime getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDateTime expectedDelivery) { this.expectedDelivery = expectedDelivery; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}