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
public class MonthlyReportResponse {
    private int year;
    private int month;
    private String monthName;
    private String department;
    private int totalWorkingDays;
    private int totalWorkingPeriods;
    private double thresholdPercentage;
    private int totalStudents;
    private int defaultersCount;
    private double classAveragePercentage;
    private List<MonthlySummaryRowDto> rows;
}
