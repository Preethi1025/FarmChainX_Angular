package com.FarmChainX.backend.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.FarmChainX.backend.Model.User;
import com.FarmChainX.backend.Repository.CropRepository;
import com.FarmChainX.backend.Repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AdminService(UserRepository userRepository, CropRepository cropRepository) {
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
    }

    // ---------------- REGISTER ADMIN ----------------
    public Map<String, String> registerAdmin(Map<String, String> data) {
        User admin = new User();

        admin.setId(UUID.randomUUID().toString()); // <-- ADD THIS LINE

        admin.setName(data.get("name"));
        admin.setEmail(data.get("email"));
        admin.setPassword(encoder.encode(data.get("password")));
        admin.setRole("ADMIN");

        userRepository.save(admin);

        return Map.of("message", "Admin registered successfully!");
    }

    // ---------------- LOGIN ADMIN ----------------
    public ResponseEntity<?> loginAdmin(Map<String, String> data) {
        User user = userRepository.findByEmail(data.get("email"));

        if (user == null || !encoder.matches(data.get("password"), user.getPassword())
                || !"ADMIN".equals(user.getRole())) {

            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // ---------------- DASHBOARD STATS ----------------
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();

        stats.put("farmers", userRepository.countByRole("FARMER"));
        stats.put("distributors", userRepository.countByRole("DISTRIBUTOR"));
        stats.put("consumers", userRepository.countByRole("BUYER"));
        stats.put("admins", userRepository.countByRole("ADMIN")); 
        stats.put("crops", cropRepository.count());

        return stats;
    }

    public Map<String, String> blockUser(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return Map.of("error", "User not found");

        user.setBlocked(true);
        userRepository.save(user);
        return Map.of("message", "User blocked");
    }

    public Map<String, String> unblockUser(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return Map.of("error", "User not found");

        user.setBlocked(false);
        userRepository.save(user);
        return Map.of("message", "User unblocked");
    }

    public Map<String, String> changeUserRole(String userId, String role) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("error", "User not found");
        }

        user.setRole(role);
        userRepository.save(user);

        return Map.of("message", "Role updated");
    }

}