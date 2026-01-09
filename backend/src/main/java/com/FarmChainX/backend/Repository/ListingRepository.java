package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    boolean existsByCropId(Long cropId);

    boolean existsByCropIdAndBatchId(Long cropId, String batchId);

    Listing findByCropIdAndBatchId(Long cropId, String batchId);

    List<Listing> findByBatchId(String batchId);

    Optional<Listing> findFirstByBatchIdAndStatus(String batchId, String status);

    Optional<Listing> findFirstByBatchId(String batchId);

    Listing findByBatchIdAndCropId(String batchId, Long cropId);

    List<Listing> findByStatus(String status);
}