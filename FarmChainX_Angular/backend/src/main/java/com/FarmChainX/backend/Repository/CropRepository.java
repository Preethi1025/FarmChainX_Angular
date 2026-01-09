package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {

   // Used for split / merge logic
   List<Crop> findByBatchId(String batchId);

   // Used for farmer crop listing
   List<Crop> findByFarmerId(String farmerId);

   // Only unblocked crops for a farmer
   List<Crop> findByFarmerIdAndBlockedFalse(String farmerId);

   // Only unblocked crops in a batch
   List<Crop> findByBatchIdAndBlockedFalse(String batchId);
}