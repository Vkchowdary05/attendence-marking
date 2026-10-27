package com.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryRowDto {
    private Long studentId;
    private String rollNumber;
    private String name;
    private String department;
    private int workingPeriods;
    private int present;
    private int absent;
    private double attendancePercentage; // e.g. 90.91
    private boolean defaulter; // true if below threshold
}
