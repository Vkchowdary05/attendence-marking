package com.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalStudents;
    private List<String> departments;
    private long todayMarkedCount;
    private double todayAttendanceRate;
    private int monthlyWorkingDays;
    private int monthlyDefaultersCount;
    private double monthlyClassAverage;
}
