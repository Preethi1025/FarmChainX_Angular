package com.FarmChainX.backend.Service;

import com.FarmChainX.backend.Model.BatchTrace;
import com.FarmChainX.backend.Repository.BatchTraceRepository;
import com.FarmChainX.backend.Repository.CropRepository;

import java.util.List;

public class BatchTraceService {
    BatchTraceRepository batchTraceRepository;
    public List<BatchTrace> getBatchTraceByBatchId(String batchId) {

        return batchTraceRepository.findByBatchId(batchId);
    }
}
