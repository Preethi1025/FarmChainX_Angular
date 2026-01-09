package com.FarmChainX.backend.Service;

import com.FarmChainX.backend.Model.Crop;
import com.FarmChainX.backend.Model.Listing;
import com.FarmChainX.backend.Repository.CropRepository;
import com.FarmChainX.backend.Repository.ListingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final CropRepository cropRepository;

    public ListingService(ListingRepository listingRepository,
                          CropRepository cropRepository) {
        this.listingRepository = listingRepository;
        this.cropRepository = cropRepository;
    }

    // =================================================
    // ✅ Create or Activate a Listing
    @Transactional
    public Listing createOrActivateListing(Listing incoming) {

        Listing existing = listingRepository
                .findByBatchIdAndCropId(incoming.getBatchId(), incoming.getCropId());

        if (existing != null) {
            // Update existing listing
            existing.setQuantity(incoming.getQuantity());
            existing.setPrice(incoming.getPrice());
            existing.setStatus("ACTIVE");
            existing.setUpdatedAt(LocalDateTime.now());

            // Sync crop image if missing
            if (existing.getCropImageUrl() == null && incoming.getCropId() != null) {
                cropRepository.findById(incoming.getCropId())
                        .ifPresent(crop -> existing.setCropImageUrl(crop.getCropImageUrl()));
            }

            return listingRepository.save(existing);
        }

        // New listing: sync crop image
        if (incoming.getCropId() != null) {
            cropRepository.findById(incoming.getCropId())
                    .ifPresent(crop -> incoming.setCropImageUrl(crop.getCropImageUrl()));
        }

        incoming.setStatus("ACTIVE");
        incoming.setCreatedAt(LocalDateTime.now());
        incoming.setUpdatedAt(LocalDateTime.now());

        return listingRepository.save(incoming);
    }

    // =================================================
    // ✅ Marketplace / Active Listings
    public List<Listing> getActiveListings() {
        return listingRepository.findByStatus("ACTIVE");
    }

    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }

    public Listing getListingById(Long id) {
        return listingRepository.findById(id).orElse(null);
    }

    public Listing getListingByBatchId(String batchId) {
        List<Listing> listings = listingRepository.findByBatchId(batchId);
        return listings.isEmpty() ? null : listings.get(0);
    }

    public Listing updateListing(Listing listing) {
        listing.setUpdatedAt(LocalDateTime.now());
        return listingRepository.save(listing);
    }

    public Listing approveListing(Long listingId) {
        Listing listing = getListingById(listingId);
        if (listing == null) {
            throw new RuntimeException("Listing not found");
        }
        listing.setStatus("ACTIVE");
        listing.setUpdatedAt(LocalDateTime.now());
        return listingRepository.save(listing);
    }

    public boolean existsByCropId(Long cropId) {
        return listingRepository.existsByCropId(cropId);
    }

    // =================================================
    // ✅ Activate or Sync Listing from Crop
    public Listing activateListingFromCrop(Listing incoming, Crop crop) {

        Listing listing = listingRepository
                .findFirstByBatchId(incoming.getBatchId())
                .orElse(null);

        if (listing == null) {
            listing = new Listing();
            listing.setBatchId(incoming.getBatchId());
            listing.setCropId(incoming.getCropId());
            listing.setFarmerId(incoming.getFarmerId());
            listing.setCreatedAt(LocalDateTime.now());
        }

        // Always sync crop image & price
        listing.setCropImageUrl(crop.getCropImageUrl());
        listing.setPrice(crop.getPrice());
        listing.setQuantity(incoming.getQuantity());
        listing.setStatus("ACTIVE");
        listing.setUpdatedAt(LocalDateTime.now());

        return listingRepository.save(listing);
    }
}