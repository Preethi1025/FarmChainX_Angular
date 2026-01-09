package com.FarmChainX.backend.Repository;

import com.FarmChainX.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {

    User findByEmail(String email);

    long countByRole(String role);

    List<User> findByRole(String role);
}