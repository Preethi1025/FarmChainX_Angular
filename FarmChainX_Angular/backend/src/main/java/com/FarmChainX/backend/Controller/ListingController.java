package com.FarmChainX.backend.Controller;

import com.FarmChainX.backend.Model.Crop;
import com.FarmChainX.backend.Model.Listing;
import com.FarmChainX.backend.Service.CropService;
import com.FarmChainX.backend.Service.ListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/listings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // safer CORS
public class ListingController {

    @Autowired
    private ListingService listingService;

    @Autowired
    private CropService cropService;

    // ✅ Marketplace: Only ACTIVE listings approved by distributor
    @GetMapping("/")
    public List<Map<String, Object>> getMarketplaceListings() {
        List<Map<String, Object>> response = new ArrayList<>();

        try {
            List<Listing> listings = listingService.getAllListings();
            if (listings == null) return response;

            for (Listing listing : listings) {
                if (!"ACTIVE".equalsIgnoreCase(listing.getStatus())) continue;

                Crop crop = null;
                try {
                    crop = cropService.getCropById(listing.getCropId());
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to fetch crop for ID: " + listing.getCropId());
                    e.printStackTrace();
                }

                Map<String, Object> item = new HashMap<>();
                item.put("listingId", listing.getListingId());
                item.put("cropId", listing.getCropId());
                item.put("status", listing.getStatus());
                item.put("farmerId", listing.getFarmerId());
                item.put("batchId", listing.getBatchId());

                if (crop != null) {
                    item.put("cropName", crop.getCropName());
                    item.put("location", crop.getLocation());
                    item.put("qualityGrade", crop.getQualityGrade());
                    item.put("cropType", crop.getCropType());
                    item.put("cropImageUrl", crop.getCropImageUrl() != null ? crop.getCropImageUrl() : "/placeholder.png");

                    item.put("price", listing.getPrice() != null ? listing.getPrice() :
                            (crop.getPrice() != null ? crop.getPrice() : 0));
                    item.put("quantity", listing.getQuantity() != null ? listing.getQuantity() :
                            (crop.getQuantity() != null ? crop.getQuantity() : 0));

                    String traceBase = "http://localhost:5173/trace/";
                    item.put("traceUrl", listing.getBatchId() != null ? traceBase + listing.getBatchId() : traceBase);
                }

                response.add(item);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to load marketplace listings");
            e.printStackTrace();
        }

        return response;
    }

    // ✅ Farmer creates listing (PENDING status)
    @PostMapping("/create")
    public Listing createListing(@RequestBody Listing listing) {
        System.out.println("📥 Incoming Listing Request: " + listing);
        return listingService.createOrActivateListing(listing);
    }

    // ✅ Distributor approves listing (ACTIVE status)
    @PutMapping("/approve/{listingId}")
    public Listing approveListing(@PathVariable Long listingId) {
        return listingService.approveListing(listingId);
    }
}
