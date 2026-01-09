package com.FarmChainX.backend.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.FarmChainX.backend.Repository.CropRepository;
import com.FarmChainX.backend.Repository.UserRepository;
import com.FarmChainX.backend.Service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final CropRepository cropRepository;

    public AdminController(AdminService adminService,
            UserRepository userRepository,
            CropRepository cropRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
    }

    // ---------------- REGISTER ADMIN ----------------
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.registerAdmin(body));
    }

    // ---------------- LOGIN ADMIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> body) {
        return adminService.loginAdmin(body);
    }

    // ---------------- DASHBOARD STATS ----------------
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/admins")
    public ResponseEntity<?> getAdmins() {
        return ResponseEntity.ok(userRepository.findByRole("ADMIN"));
    }

    // ---------------- FETCH FARMERS ----------------
    @GetMapping("/farmers")
    public ResponseEntity<?> getFarmers() {
        return ResponseEntity.ok(userRepository.findByRole("FARMER"));
    }

    // ---------------- FETCH DISTRIBUTORS ----------------
    @GetMapping("/distributors")
    public ResponseEntity<?> getDistributors() {
        return ResponseEntity.ok(userRepository.findByRole("DISTRIBUTOR"));
    }

    // ---------------- FETCH CONSUMERS ----------------
    @GetMapping("/consumers")
    public ResponseEntity<?> getConsumers() {
        return ResponseEntity.ok(userRepository.findByRole("BUYER"));
    }

    // ---------------- FETCH CROPS ----------------
    @GetMapping("/crops")
    public ResponseEntity<?> getCrops() {
        return ResponseEntity.ok(cropRepository.findAll());
    }

    @PutMapping("/block/{id}")
    public ResponseEntity<?> block(@PathVariable String id) {
        return ResponseEntity.ok(adminService.blockUser(id));
    }

    @PutMapping("/unblock/{id}")
    public ResponseEntity<?> unblock(@PathVariable String id) {
        return ResponseEntity.ok(adminService.unblockUser(id));
    }

    // Add this method to AdminController.java:
    @PutMapping("/role/{id}")
    public ResponseEntity<?> changeRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.changeUserRole(id, body.get("role")));
    }

}