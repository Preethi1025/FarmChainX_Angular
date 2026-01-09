package com.FarmChainX.backend.Service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.FarmChainX.backend.Model.User;
import com.FarmChainX.backend.Repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public User register(User user) {

        // 🔹 Generate role-based short ID (e.g., FAR-3A9F2C)
        String prefix = (user.getRole() != null && user.getRole().length() >= 3)
                ? user.getRole().substring(0, 3).toUpperCase()
                : "USR";

        String shortId = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 6);

        user.setId(prefix + "-" + shortId);

        // 🔹 Hash password
        user.setPassword(encoder.encode(user.getPassword()));

        // 🔹 Default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("BUYER");
        }

        // 🔹 Default blocked status
        if (user.getBlocked() == null) {
            user.setBlocked(false);
        }

        return userRepository.save(user);
    }

    public boolean login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) return false;

        if (Boolean.TRUE.equals(user.getBlocked())) {
            return false;
        }

        return encoder.matches(password, user.getPassword());
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email);
    }

    // 🔹 ADD THIS METHOD - It's called by the controller
    public boolean emailExists(String email) {
        User user = userRepository.findByEmail(email);
        return user != null;
    }
}