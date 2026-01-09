package com.FarmChainX.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.FarmChainX.backend.Model.BatchRecord;

public interface BatchRecordRepository extends JpaRepository<BatchRecord, String> {

    List<BatchRecord> findByFarmerId(String farmerId);

    List<BatchRecord> findByStatus(String status);

    List<BatchRecord> findByDistributorIdAndStatus(String distributorId, String status);

    List<BatchRecord> findByStatusIn(List<String> statuses);
    List<BatchRecord> findByFarmerIdAndBlockedFalse(String farmerId);

}