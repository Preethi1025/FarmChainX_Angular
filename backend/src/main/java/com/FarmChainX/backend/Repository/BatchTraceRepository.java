package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.BatchTrace;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchTraceRepository extends JpaRepository<BatchTrace, Long> {
    List<BatchTrace> findByBatchIdOrderByTimestampAsc(String batchId);
    List<BatchTrace> findByBatchId(String batchId);

}
