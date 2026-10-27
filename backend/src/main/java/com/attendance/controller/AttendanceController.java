package com.attendance.controller;

import com.attendance.dto.*;
import com.attendance.model.AttendanceStatus;
import com.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/daily")
    public ResponseEntity<List<DailyStudentAttendanceDto>> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(attendanceService.getDailyAttendance(date, department));
    }

    @PostMapping("/daily")
    public ResponseEntity<?> saveDailyAttendance(@Valid @RequestBody DailyAttendanceRequest request) {
        try {
            List<DailyStudentAttendanceDto> updated = attendanceService.saveDailyAttendance(request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mark-all")
    public ResponseEntity<?> markAll(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String department,
            @RequestParam AttendanceStatus status) {
        attendanceService.markAllStudentsForDate(date, department, status);
        return ResponseEntity.ok(Map.of(
                "message", "Successfully marked all as " + status + " for " + date
        ));
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<MonthlyReportResponse> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "75.0") double threshold) {
        return ResponseEntity.ok(attendanceService.getMonthlyReport(year, month, department, threshold));
    }

    @GetMapping("/student-monthly")
    public ResponseEntity<?> getStudentMonthlyDetail(
            @RequestParam Long studentId,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            StudentMonthlyDetailDto detail = attendanceService.getStudentMonthlyDetail(studentId, year, month);
            return ResponseEntity.ok(detail);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/export-monthly-csv")
    public ResponseEntity<byte[]> exportMonthlyCsv(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "75.0") double threshold) {
        String csvData = attendanceService.generateMonthlyCsv(year, month, department, threshold);
        String filename = String.format("Attendance_Summary_%04d_%02d.csv", year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData.getBytes());
    }

    @GetMapping("/export-daily-csv")
    public ResponseEntity<byte[]> exportDailyCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String department) {
        String csvData = attendanceService.generateDailyCsv(date, department);
        String filename = String.format("Attendance_Daily_%s.csv", date);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData.getBytes());
    }
}
