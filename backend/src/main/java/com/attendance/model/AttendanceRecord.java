package com.attendance.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "attendance_records",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_student_date_period",
            columnNames = {"student_id", "date", "period_number"}
        )
    },
    indexes = {
        @Index(name = "idx_att_date", columnList = "date"),
        @Index(name = "idx_att_student_date", columnList = "student_id, date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotNull(message = "Attendance date is required")
    @Column(nullable = false)
    private LocalDate date;

    @Min(value = 1, message = "Period must be between 1 and 7")
    @Max(value = 7, message = "Period must be between 1 and 7")
    @Column(name = "period_number", nullable = false)
    private Integer periodNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AttendanceStatus status;

    @Column(name = "marked_at")
    private LocalDateTime markedAt;

    @PrePersist
    @PreUpdate
    public void onSave() {
        this.markedAt = LocalDateTime.now();
    }
}
