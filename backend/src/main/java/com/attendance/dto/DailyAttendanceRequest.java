package com.attendance.dto;

import com.attendance.model.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
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
public class DailyAttendanceRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String department;

    @NotNull(message = "Records are required")
    private List<StudentPeriodEntry> records;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentPeriodEntry {
        private Long studentId;
        // Period 1 to 7 -> PRESENT or ABSENT
        private Map<Integer, AttendanceStatus> periods;
    }
}
