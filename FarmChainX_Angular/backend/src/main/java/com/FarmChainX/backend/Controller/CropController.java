package com.FarmChainX.backend.Controller;

import com.FarmChainX.backend.Model.Crop;
import com.FarmChainX.backend.Service.CropService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCrop(@RequestBody Crop crop) {
        try {
            return ResponseEntity.ok(cropService.addCrop(crop));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add crop: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getCrops(@PathVariable String farmerId) {
        try {
            return ResponseEntity.ok(cropService.getCropsByFarmer(farmerId));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch crops: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/by-batch")
    public ResponseEntity<?> getCropsByBatch(@RequestParam String batchId) {
        try {
            return ResponseEntity.ok(cropService.getCropsByBatchId(batchId));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch crops by batch: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCrop(@PathVariable Long id, @RequestBody Crop crop) {
        try {
            Crop updated = cropService.updateCrop(id, crop);
            if (updated == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Crop not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update crop: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCrop(@PathVariable Long id) {
        try {
            boolean deleted = cropService.deleteCrop(id);
            if (deleted) {
                return ResponseEntity.ok("Crop deleted successfully");
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Crop not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete crop: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/harvest/{id}")
    public ResponseEntity<?> markHarvested(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String actualHarvestDate = (String) body.get("actualHarvestDate");
            Double actualYield = null;
            if (body.get("actualYield") != null) {
                Object v = body.get("actualYield");
                if (v instanceof Number) actualYield = ((Number) v).doubleValue();
                else {
                    try { actualYield = Double.parseDouble(v.toString()); } catch (Exception ignored) {}
                }
            }
            Crop updated = cropService.markHarvested(id, actualHarvestDate, actualYield);
            if (updated == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Crop not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to mark harvested: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

    }
 @PostMapping(value = "/add-with-image", consumes = "multipart/form-data")
public ResponseEntity<?> addCropWithImage(
        @RequestPart("crop") String cropJson,
        @RequestPart(value = "image", required = false) MultipartFile image
) {
    try {
        ObjectMapper mapper = new ObjectMapper();
        Crop crop = mapper.readValue(cropJson, Crop.class);

        if (crop.getFarmerId() == null || crop.getFarmerId().isBlank()) {
            throw new IllegalArgumentException("farmerId is required");
        }

        if (image != null && !image.isEmpty()) {
            String imageUrl = cropService.saveCropImage(image);
            crop.setCropImageUrl(imageUrl);
        }

        crop.setQualityCheckStatus("PENDING");

        return ResponseEntity.ok(cropService.addCrop(crop));

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
    }
}
}
