package com.attendance;

import com.attendance.dto.DailyAttendanceRequest;
import com.attendance.dto.DailyStudentAttendanceDto;
import com.attendance.dto.MonthlyReportResponse;
import com.attendance.dto.StudentDto;
import com.attendance.model.AttendanceStatus;
import com.attendance.service.AttendanceService;
import com.attendance.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AttendanceSystemIntegrationTest {

    @Autowired
    private StudentService studentService;

    @Autowired
    private AttendanceService attendanceService;

    @Test
    @DisplayName("Verify that registered students can be fetched")
    void testGetStudents() {
        List<StudentDto> students = studentService.getAllStudents(null);
        assertNotNull(students);
        assertFalse(students.isEmpty(), "Sample students should be seeded");
    }

    @Test
    @DisplayName("Verify that attendance can be marked for all 7 periods and saved")
    void testSaveDailyAttendance() {
        List<StudentDto> students = studentService.getAllStudents("CSE (AI & ML)");
        assertFalse(students.isEmpty());
        StudentDto student = students.get(0);

        LocalDate testDate = LocalDate.of(2026, 11, 10);

        Map<Integer, AttendanceStatus> periods = new HashMap<>();
        for (int p = 1; p <= 7; p++) {
            periods.put(p, (p % 2 == 1) ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT);
        }

        DailyAttendanceRequest.StudentPeriodEntry entry = new DailyAttendanceRequest.StudentPeriodEntry(
                student.getId(), periods
        );

        DailyAttendanceRequest request = DailyAttendanceRequest.builder()
                .date(testDate)
                .department("CSE (AI & ML)")
                .records(List.of(entry))
                .build();

        List<DailyStudentAttendanceDto> response = attendanceService.saveDailyAttendance(request);
        assertNotNull(response);

        DailyStudentAttendanceDto studentRecord = response.stream()
                .filter(s -> s.getStudentId().equals(student.getId()))
                .findFirst()
                .orElse(null);

        assertNotNull(studentRecord);
        assertEquals(4, studentRecord.getPresentCount()); // periods 1, 3, 5, 7
        assertEquals(3, studentRecord.getAbsentCount());  // periods 2, 4, 6
    }

    @Test
    @DisplayName("Verify duplicate entries are prevented and updated cleanly")
    void testPreventDuplicateAttendance() {
        List<StudentDto> students = studentService.getAllStudents("CSE (AI & ML)");
        StudentDto student = students.get(0);
        LocalDate testDate = LocalDate.of(2026, 11, 15);

        // First mark P1 as ABSENT
        DailyAttendanceRequest request1 = DailyAttendanceRequest.builder()
                .date(testDate)
                .department("CSE (AI & ML)")
                .records(List.of(new DailyAttendanceRequest.StudentPeriodEntry(
                        student.getId(), Map.of(1, AttendanceStatus.ABSENT)
                )))
                .build();
        attendanceService.saveDailyAttendance(request1);

        // Correct/Update P1 to PRESENT
        DailyAttendanceRequest request2 = DailyAttendanceRequest.builder()
                .date(testDate)
                .department("CSE (AI & ML)")
                .records(List.of(new DailyAttendanceRequest.StudentPeriodEntry(
                        student.getId(), Map.of(1, AttendanceStatus.PRESENT)
                )))
                .build();
        List<DailyStudentAttendanceDto> result = attendanceService.saveDailyAttendance(request2);

        DailyStudentAttendanceDto studentRecord = result.stream()
                .filter(s -> s.getStudentId().equals(student.getId()))
                .findFirst()
                .orElseThrow();

        assertEquals(AttendanceStatus.PRESENT, studentRecord.getPeriods().get(1));
        assertEquals(1, studentRecord.getPresentCount());
        assertEquals(0, studentRecord.getAbsentCount());
    }

    @Test
    @DisplayName("Verify monthly attendance calculation and defaulter threshold identification")
    void testMonthlyCalculationAndDefaulters() {
        MonthlyReportResponse report = attendanceService.getMonthlyReport(
                2026, 10, "CSE (AI & ML)", 75.0
        );

        assertNotNull(report);
        assertEquals(154, report.getTotalWorkingPeriods());
        assertTrue(report.getRows().size() >= 5);

        // Student 101: 140 present, 14 absent -> 90.91%
        report.getRows().stream()
                .filter(r -> "101".equals(r.getRollNumber()))
                .findFirst()
                .ifPresent(r -> {
                    assertEquals(140, r.getPresent());
                    assertEquals(14, r.getAbsent());
                    assertEquals(90.91, r.getAttendancePercentage());
                    assertFalse(r.isDefaulter());
                });

        // Student 103: 115 present, 39 absent -> 74.68% (Defaulter < 75%)
        report.getRows().stream()
                .filter(r -> "103".equals(r.getRollNumber()))
                .findFirst()
                .ifPresent(r -> {
                    assertEquals(115, r.getPresent());
                    assertEquals(39, r.getAbsent());
                    assertEquals(74.68, r.getAttendancePercentage());
                    assertTrue(r.isDefaulter());
                });
    }

    @Test
    @DisplayName("Verify CSV generation exports properly")
    void testCsvExport() {
        String csv = attendanceService.generateMonthlyCsv(2026, 10, "CSE (AI & ML)", 75.0);
        assertNotNull(csv);
        assertTrue(csv.contains("Roll No.,Student,Department,Working periods,Present,Absent,Attendance %,Status"));
        assertTrue(csv.contains("101"));
        assertTrue(csv.contains("Student 1"));
        assertTrue(csv.contains("90.91%"));
    }
}
