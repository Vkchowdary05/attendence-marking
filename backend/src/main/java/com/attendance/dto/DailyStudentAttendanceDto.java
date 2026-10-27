package com.attendance.dto;

import com.attendance.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStudentAttendanceDto {
    private Long studentId;
    private String rollNumber;
    private String name;
    private String department;
    // Map of period number (1 to 7) to status (PRESENT / ABSENT)
    private Map<Integer, AttendanceStatus> periods;
    private int presentCount;
    private int absentCount;
}
