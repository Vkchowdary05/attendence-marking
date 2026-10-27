package com.attendance.dto;

import com.attendance.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentMonthlyDetailDto {
    private Long studentId;
    private String rollNumber;
    private String name;
    private String department;
    private int year;
    private int month;
    private int workingPeriods;
    private int present;
    private int absent;
    private double attendancePercentage;
    private List<DailyRecord> dailyRecords;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRecord {
        private LocalDate date;
        private Map<Integer, AttendanceStatus> periods;
        private int present;
        private int absent;
    }
}
