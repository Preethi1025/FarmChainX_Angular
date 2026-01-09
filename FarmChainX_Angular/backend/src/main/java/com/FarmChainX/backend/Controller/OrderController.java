package com.FarmChainX.backend.Controller;

import com.FarmChainX.backend.Model.Order;
import com.FarmChainX.backend.Model.OrderDetailsDTO;
import com.FarmChainX.backend.Service.OrderService;
import com.FarmChainX.backend.enums.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // -------------------- PLACE ORDER --------------------
    @PostMapping("/place")
    public Order placeOrder(
            @RequestParam Long listingId,
            @RequestParam String consumerId,
            @RequestParam Double quantity,
            @RequestParam String deliveryAddress,
            @RequestParam String contactNumber
    ) {
        return orderService.placeOrder(
                listingId,
                consumerId,
                quantity,
                deliveryAddress,
                contactNumber
        );
    }


    // -------------------- UPDATE ORDER STATUS --------------------
    @PutMapping("/{orderId}/status")
    public Order updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            @RequestParam String distributorId
    ) {
        return orderService.updateOrderStatus(orderId, status, distributorId);
    }

    // -------------------- SET EXPECTED DELIVERY --------------------
    @PutMapping("/{orderId}/expected-delivery")
    public Order setExpectedDelivery(
            @PathVariable Long orderId,
            @RequestParam String distributorId,
            @RequestParam String expectedDelivery
    ) {
        return orderService.setExpectedDelivery(
                orderId,
                distributorId,
                LocalDateTime.parse(expectedDelivery)
        );
    }

    // -------------------- CONSUMER ORDERS --------------------
    @GetMapping("/consumer/{consumerId}")
    public List<Order> getOrdersByConsumer(@PathVariable String consumerId) {
        return orderService.getOrdersByConsumer(consumerId);
    }

    // -------------------- CONSUMER ORDERS (FULL DETAILS) --------------------
    @GetMapping("/consumer/{consumerId}/full")
    public List<OrderDetailsDTO> getOrdersByConsumerFull(@PathVariable String consumerId) {
        return orderService.getOrdersByConsumerFull(consumerId);
    }

    // -------------------- DISTRIBUTOR ORDERS (FULL DETAILS) --------------------
    @GetMapping("/distributor/{distributorId}")
    public List<OrderDetailsDTO> getOrdersByDistributorFull(@PathVariable String distributorId) {
        return orderService.getOrdersByDistributorFull(distributorId);
    }
//    @PutMapping("/{orderId}/cancel")
//    public ResponseEntity<Order> cancelOrder(
//            @PathVariable Long orderId,
//            @RequestParam String distributorId,
//            @RequestParam String reason
//    ) {
//        return ResponseEntity.ok(
//                orderService.cancelOrder(orderId, distributorId, reason)
//        );
//    }
    // -------------------- FARMER ORDERS --------------------
    @GetMapping("/farmer/{farmerId}")
    public List<Order> getOrdersByFarmer(@PathVariable String farmerId) {
        return orderService.getOrdersByFarmer(farmerId);
    }
    @PutMapping("/{orderId}/cancel")
public ResponseEntity<String> cancelOrder(
        @PathVariable Long orderId,
        @RequestBody Map<String, String> payload) {

    String reason = payload.get("cancelReason");
    if (reason == null || reason.isBlank())
        return ResponseEntity.badRequest().body("Cancel reason required");

    orderService.cancelOrder(orderId, reason);
    return ResponseEntity.ok("Order cancelled");
}
}