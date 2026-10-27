package com.attendance.dto;

import com.attendance.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long id;
    private String username;
    private String name;
    private UserRole role;
    private String department;
    private String rollNumber;
}
