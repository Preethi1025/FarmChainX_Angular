package com.FarmChainX.backend.Controller;

import com.FarmChainX.backend.Model.BatchRecord;
import com.FarmChainX.backend.Model.BatchTrace;
import com.FarmChainX.backend.Model.Crop;
import com.FarmChainX.backend.Repository.BatchTraceRepository;
import com.FarmChainX.backend.Repository.CropRepository;
import com.FarmChainX.backend.Service.BatchService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchService batchService;
    private final BatchTraceRepository batchTraceRepository;
    private final CropRepository cropRepository;

    public BatchController(
            BatchService batchService,
            BatchTraceRepository batchTraceRepository,
            CropRepository cropRepository) {
        this.batchService = batchService;
        this.batchTraceRepository = batchTraceRepository;
        this.cropRepository = cropRepository;
    }

    // ------------------- CREATE BATCH -------------------
    @PostMapping
    public ResponseEntity<BatchRecord> createBatch(@RequestBody BatchRecord batch) {
        return ResponseEntity.ok(batchService.createBatch(batch));
    }

    // ------------------- GET BATCH -------------------
    @GetMapping("/{batchId}")
    public ResponseEntity<?> getBatch(@PathVariable String batchId) {
        return batchService.getBatch(batchId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ------------------- LIST BY FARMER -------------------
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<BatchRecord>> getBatchesByFarmer(@PathVariable String farmerId) {
        return ResponseEntity.ok(batchService.getBatchesByFarmer(farmerId));
    }

    // ------------------- CROPS FOR BATCH -------------------
    @GetMapping("/{batchId}/crops")
    public ResponseEntity<List<Crop>> getCropsForBatch(@PathVariable String batchId) {
        return ResponseEntity.ok(cropRepository.findByBatchId(batchId));
    }

    // ------------------- PENDING FOR DISTRIBUTOR -------------------
    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingBatches() {
        List<BatchRecord> batches = batchService.getPendingBatchesForDistributor();
        List<Map<String, Object>> response = new ArrayList<>();
        for (BatchRecord batch : batches) {
            response.add(enrichBatch(batch));
        }
        return ResponseEntity.ok(response);
    }

    // ------------------- APPROVED FOR DISTRIBUTOR -------------------
    @GetMapping("/approved/{distributorId}")
    public ResponseEntity<List<Map<String, Object>>> getApprovedBatches(@PathVariable String distributorId) {
        try {
            List<BatchRecord> batches = batchService.getApprovedBatches(distributorId);
            List<Map<String, Object>> response = new ArrayList<>();
            for (BatchRecord batch : batches) {
                response.add(enrichBatch(batch));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonList(
                    Map.of("error", e.getMessage())));
        }
    }

    // ------------------- APPROVE BATCH -------------------
    @PutMapping("/distributor/approve/{batchId}/{distributorId}")
    public ResponseEntity<?> approveBatch(
            @PathVariable String batchId,
            @PathVariable String distributorId) {
        return ResponseEntity.ok(batchService.approveBatch(batchId, distributorId));
    }

    // ------------------- REJECT BATCH -------------------
    @PutMapping("/distributor/reject/{batchId}/{distributorId}")
    public ResponseEntity<?> rejectBatch(
            @PathVariable String batchId,
            @PathVariable String distributorId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(batchService.rejectBatch(batchId, distributorId, reason));
    }

    // ------------------- UPDATE STATUS -------------------
    @PutMapping("/{batchId}/status")
    public ResponseEntity<BatchRecord> updateBatchStatus(
            @PathVariable String batchId,
            @RequestBody Map<String, Object> body) {

        String status = (String) body.get("status");
        String userId = body.get("userId") != null ? body.get("userId").toString() : null;

        if ("QUALITY_UPDATED".equalsIgnoreCase(status)) {
            String grade = body.get("qualityGrade") != null ? body.get("qualityGrade").toString() : null;
            Integer confidence = null;
            if (body.get("confidence") != null) {
                try {
                    confidence = Integer.valueOf(body.get("confidence").toString());
                } catch (NumberFormatException ignored) {}
            }
            return ResponseEntity.ok(batchService.updateQualityGrade(batchId, grade, confidence, userId));
        }

        return ResponseEntity.ok(batchService.updateStatus(batchId, status, userId));
    }

    // ------------------- SPLIT BATCH -------------------
    @PostMapping("/{batchId}/split")
    public ResponseEntity<BatchRecord> splitBatch(
            @PathVariable String batchId,
            @RequestBody Map<String, Object> body) {

        double quantity = Double.parseDouble(body.get("quantity").toString());
        String userId = body.get("userId").toString();

        return ResponseEntity.ok(batchService.splitBatch(batchId, quantity, userId));
    }

    // ------------------- MERGE BATCHES -------------------
    @PostMapping("/merge/{targetBatchId}")
    public ResponseEntity<List<BatchRecord>> mergeBatch(
            @PathVariable String targetBatchId,
            @RequestBody Map<String, Object> body) {

        @SuppressWarnings("unchecked")
        List<String> sourceBatchIds = (List<String>) body.get("sourceBatchIds");
        String userId = body.get("userId").toString();

        return ResponseEntity.ok(batchService.mergeBatches(targetBatchId, sourceBatchIds, userId));
    }

    // ------------------- TRACE -------------------
    @GetMapping("/{batchId}/trace")
    public ResponseEntity<Map<String, Object>> getBatchTrace(@PathVariable String batchId) {

        List<BatchTrace> traces = batchTraceRepository.findByBatchIdOrderByTimestampAsc(batchId);
        BatchRecord batch = batchService.getBatch(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("farmerId", batch.getFarmerId());
        response.put("cropType", batch.getCropType());
        response.put("distributorId", batch.getDistributorId());
        response.put("traces", traces);

        return ResponseEntity.ok(response);
    }

    // ------------------- HELPER: ENRICH BATCH -------------------
    private Map<String, Object> enrichBatch(BatchRecord batch) {
        Map<String, Object> item = new HashMap<>();
        if (batch == null) return item;

        item.put("batchId", batch.getBatchId());
        item.put("cropType", batch.getCropType());
        item.put("totalQuantity", batch.getTotalQuantity());
        item.put("status", batch.getStatus());
        item.put("farmerId", batch.getFarmerId());
        item.put("avgQualityScore", batch.getAvgQualityScore());

        if (batch.getBatchId() != null) {
            List<Crop> activeCrops = cropRepository.findByBatchId(batch.getBatchId())
                    .stream()
                    .filter(c -> !Boolean.TRUE.equals(c.getBlocked()))
                    .toList();

            if (!activeCrops.isEmpty()) {
                Crop crop = activeCrops.get(0);
                item.put("cropImageUrl", crop.getCropImageUrl());
                item.put("location", crop.getLocation());
                item.put("price", crop.getPrice());
            }
        }

        return item;
    }
}