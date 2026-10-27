package com.attendance.service;

import com.attendance.dto.LoginRequest;
import com.attendance.dto.LoginResponse;
import com.attendance.model.User;
import com.attendance.model.UserRole;
import com.attendance.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void seedDefaultUsers() {
        if (userRepository.count() == 0) {
            // Seed Admin / HOD
            userRepository.save(User.builder()
                    .username("admin")
                    .password("password123")
                    .name("Dr. S. K. Raman (HOD)")
                    .role(UserRole.ADMIN)
                    .department("CSE (AI & ML)")
                    .build());

            // Seed Faculty
            userRepository.save(User.builder()
                    .username("faculty")
                    .password("password123")
                    .name("Prof. Anita Varma")
                    .role(UserRole.FACULTY)
                    .department("CSE (AI & ML)")
                    .build());

            // Seed Student (Roll 101)
            userRepository.save(User.builder()
                    .username("student101")
                    .password("password123")
                    .name("Student 1")
                    .role(UserRole.STUDENT)
                    .department("CSE (AI & ML)")
                    .rollNumber("101")
                    .build());
        }
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Generate session token
        String token = "ams_jwt_" + UUID.randomUUID().toString().replace("-", "");

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole())
                .department(user.getDepartment())
                .rollNumber(user.getRollNumber())
                .build();
    }
}
