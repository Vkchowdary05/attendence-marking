package com.attendance.service;

import com.attendance.dto.DashboardStatsDto;
import com.attendance.dto.MonthlyReportResponse;
import com.attendance.model.AttendanceRecord;
import com.attendance.model.AttendanceStatus;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceService attendanceService;

    public DashboardService(StudentRepository studentRepository,
                            AttendanceRecordRepository attendanceRecordRepository,
                            AttendanceService attendanceService) {
        this.studentRepository = studentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceService = attendanceService;
    }

    public DashboardStatsDto getDashboardStats(String department) {
        long totalStudents;
        String deptFilter = (department != null && !department.equalsIgnoreCase("ALL")) ? department.trim() : null;

        if (deptFilter != null) {
            totalStudents = studentRepository.findByDepartmentOrderByRollNumberAsc(deptFilter).size();
        } else {
            totalStudents = studentRepository.count();
        }

        List<String> departments = studentRepository.findDistinctDepartments();

        LocalDate today = LocalDate.now();
        List<AttendanceRecord> todayRecords = attendanceRecordRepository.findByDateAndDepartment(today, deptFilter);

        long todayMarkedCount = todayRecords.stream()
                .map(r -> r.getStudent().getId())
                .distinct()
                .count();

        long todayPresentPeriods = todayRecords.stream()
                .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                .count();

        double todayRate = todayRecords.isEmpty() ? 0.0 :
                BigDecimal.valueOf((todayPresentPeriods * 100.0) / todayRecords.size())
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue();

        MonthlyReportResponse monthlyReport = attendanceService.getMonthlyReport(
                today.getYear(),
                today.getMonthValue(),
                deptFilter,
                75.0
        );

        return DashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .departments(departments)
                .todayMarkedCount(todayMarkedCount)
                .todayAttendanceRate(todayRate)
                .monthlyWorkingDays(monthlyReport.getTotalWorkingDays())
                .monthlyDefaultersCount(monthlyReport.getDefaultersCount())
                .monthlyClassAverage(monthlyReport.getClassAveragePercentage())
                .build();
    }
}
