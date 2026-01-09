package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByDistributorId(String distributorId);

    List<Order> findByConsumerId(String consumerId);

    @Query("SELECT o FROM Order o JOIN Listing l ON o.listingId = l.id WHERE l.farmerId = :farmerId")
    List<Order> findByFarmerId(@Param("farmerId") String farmerId);
}

