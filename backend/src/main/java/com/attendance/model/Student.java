package com.attendance.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_student_roll", columnList = "rollNumber", unique = true),
    @Index(name = "idx_student_dept", columnList = "department")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Roll number is required")
    @Column(nullable = false, unique = true, length = 30)
    private String rollNumber;

    @NotBlank(message = "Student name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Department is required")
    @Column(nullable = false, length = 100)
    private String department;

    private Integer semester;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
