package com.FarmChainX.backend.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.FarmChainX.backend.Model.BatchRecord;
import com.FarmChainX.backend.Model.Crop;
import com.FarmChainX.backend.Repository.BatchRecordRepository;
import com.FarmChainX.backend.Repository.CropRepository;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CropService {

    private final CropRepository cropRepository;
    private final BatchRecordRepository batchRecordRepository;

    public CropService(CropRepository cropRepository, BatchRecordRepository batchRecordRepository) {
        this.cropRepository = cropRepository;
        this.batchRecordRepository = batchRecordRepository;
    }

    public Crop addCrop(Crop crop) {
        if (crop.getFarmerId() == null || crop.getFarmerId().isEmpty()) {
            throw new IllegalArgumentException("farmerId is required");
        }
        if (crop.getCropName() == null || crop.getCropName().isEmpty()) {
            throw new IllegalArgumentException("cropName is required");
        }
        if (crop.getPrice() == null) {
            throw new IllegalArgumentException("price is required");
        }
        if (crop.getQuantity() == null || crop.getQuantity().isEmpty()) {
            throw new IllegalArgumentException("quantity is required");
        }

        String batchId = crop.getBatchId();
        if (batchId == null || batchId.isEmpty()) {
            batchId = generateBatchId(crop.getCropType());
            crop.setBatchId(batchId);
        }

        LocalDateTime now = LocalDateTime.now();
        crop.setCreatedAt(now);
        crop.setUpdatedAt(now);

        if (crop.getStatus() == null || crop.getStatus().isEmpty()) {
            crop.setStatus("PLANTED");
        }

        String frontendBase = System.getProperty("farmchainx.frontend.url");
        if (frontendBase == null || frontendBase.isEmpty()) {
            frontendBase = "http://localhost:5173"; // default
        }
        if (crop.getQrCodeUrl() == null || crop.getQrCodeUrl().isEmpty()) {
            crop.setQrCodeUrl(frontendBase + "/trace/" + batchId);
        }

        Crop saved = cropRepository.save(crop);

        if (!batchRecordRepository.existsById(batchId)) {
            BatchRecord record = new BatchRecord();
            record.setBatchId(batchId);
            record.setFarmerId(crop.getFarmerId());
            record.setCropType(crop.getCropType());
            try {
                double qty = Double.parseDouble(crop.getQuantity());
                record.setTotalQuantity(qty);
            } catch (Exception e) {
                record.setTotalQuantity(0.0);
            }
            if (crop.getAiConfidenceScore() != null) {
                record.setAvgQualityScore(crop.getAiConfidenceScore());
            }
            record.setCreatedAt(LocalDateTime.now());
            batchRecordRepository.save(record);
        } else {
            Optional<BatchRecord> existing = batchRecordRepository.findById(batchId);
            if (existing.isPresent()) {
                BatchRecord rec = existing.get();
                try {
                    double add = Double.parseDouble(crop.getQuantity());
                    rec.setTotalQuantity((rec.getTotalQuantity() == null ? 0.0 : rec.getTotalQuantity()) + add);
                } catch (Exception ignored) {}
                batchRecordRepository.save(rec);
            }
        }

        return saved;
    }

    private String generateBatchId(String cropType) {
        String cropCode = (cropType != null && cropType.length() >= 3)
                ? cropType.substring(0, 3).toUpperCase()
                : "CRP";
        String dateCode = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyMMdd"));
        int rand = (int) (Math.random() * 10000);
        String randomCode = String.format("%04d", rand);
        return String.format("FCX-%s-%s-%s", cropCode, dateCode, randomCode);
    }

    public List<Crop> getCropsByFarmer(String farmerId) {
        return cropRepository.findByFarmerId(farmerId);
    }

    public List<Crop> getCropsByBatchId(String batchId) {
        return cropRepository.findByBatchId(batchId);
    }

    public List<Crop> bulkUpdateCropStatusByBatch(String batchId, String status) {
        List<Crop> crops = cropRepository.findByBatchId(batchId);
        for (Crop c : crops) {
            c.setStatus(status);
            c.setUpdatedAt(LocalDateTime.now());
        }
        List<Crop> saved = cropRepository.saveAll(crops);

        if (batchRecordRepository.existsById(batchId)) {
            BatchRecord rec = batchRecordRepository.findById(batchId).get();
            rec.setStatus(status);
            if ("HARVESTED".equals(status) && rec.getHarvestDate() == null) {
                rec.setHarvestDate(LocalDate.now());
            }
            batchRecordRepository.save(rec);
        }
        return saved;
    }

    public List<Crop> bulkUpdateQualityByBatch(String batchId, String qualityGrade, Double confidenceScore) {
        List<Crop> crops = cropRepository.findByBatchId(batchId);
        for (Crop c : crops) {
            c.setQualityGrade(qualityGrade);
            if (confidenceScore != null) c.setAiConfidenceScore(confidenceScore);
            c.setUpdatedAt(LocalDateTime.now());
        }
        if (batchRecordRepository.existsById(batchId)) {
            BatchRecord rec = batchRecordRepository.findById(batchId).get();
            rec.setAvgQualityScore(confidenceScore);
            batchRecordRepository.save(rec);
        }
        return cropRepository.saveAll(crops);
    }
    public Crop updateCrop(Long cropId, Crop updatedCrop) {
        Optional<Crop> existing = cropRepository.findById(cropId);

        if (existing.isEmpty()) return null;

        Crop crop = existing.get();
        crop.setCropName(updatedCrop.getCropName());
        crop.setPrice(updatedCrop.getPrice());
        crop.setQuantity(updatedCrop.getQuantity());
        crop.setDescription(updatedCrop.getDescription());

        return cropRepository.save(crop);
    }

    public Crop markHarvested(Long cropId, String actualHarvestDateStr, Double actualYield) {
        Optional<Crop> existing = cropRepository.findById(cropId);
        if (existing.isEmpty()) return null;

        Crop crop = existing.get();
        crop.setStatus("HARVESTED");
        crop.setActualHarvestDate(actualHarvestDateStr);
        if (actualYield != null) {
            crop.setActualYield(String.valueOf(actualYield));
        }
        crop.setUpdatedAt(LocalDateTime.now());

        String batchId = crop.getBatchId();
        if (batchId != null && !batchId.isEmpty() && batchRecordRepository.existsById(batchId)) {
            Optional<BatchRecord> br = batchRecordRepository.findById(batchId);
            if (br.isPresent()) {
                BatchRecord rec = br.get();
                if (rec.getHarvestDate() == null) {
                    try {
                        rec.setHarvestDate(LocalDate.parse(actualHarvestDateStr));
                    } catch (Exception ignored) {}
                }
                rec.setStatus("HARVESTED");
                batchRecordRepository.save(rec);
            }
        }

        return cropRepository.save(crop);
    }

    public boolean deleteCrop(Long cropId) {
        if (!cropRepository.existsById(cropId)) return false;
        cropRepository.deleteById(cropId);
        return true;
    }

    public Crop getCropById(Long id) {
        return cropRepository.findById(id).orElse(null);
    }

    public String saveCropImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) return null;

        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);

        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path filePath = uploadDir.resolve(fileName);
        Files.write(filePath, image.getBytes());

        // Return public URL path
        return "/uploads/" + fileName;
    }
}