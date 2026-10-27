package com.attendance.service;

import com.attendance.dto.*;
import com.attendance.model.AttendanceRecord;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.Student;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRepository,
                             StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<DailyStudentAttendanceDto> getDailyAttendance(LocalDate date, String department) {
        List<Student> students;
        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL")) {
            students = studentRepository.findByDepartmentOrderByRollNumberAsc(department.trim());
        } else {
            students = studentRepository.findAllByOrderByRollNumberAsc();
        }

        List<AttendanceRecord> existingRecords = attendanceRepository.findByDateAndDepartment(
                date,
                (department != null && !department.equalsIgnoreCase("ALL")) ? department.trim() : null
        );

        // Group records by student ID -> (period -> status)
        Map<Long, Map<Integer, AttendanceStatus>> studentPeriodMap = new HashMap<>();
        for (AttendanceRecord record : existingRecords) {
            studentPeriodMap
                    .computeIfAbsent(record.getStudent().getId(), k -> new HashMap<>())
                    .put(record.getPeriodNumber(), record.getStatus());
        }

        List<DailyStudentAttendanceDto> result = new ArrayList<>();
        for (Student s : students) {
            Map<Integer, AttendanceStatus> periods = studentPeriodMap.getOrDefault(s.getId(), new HashMap<>());
            int present = 0;
            int absent = 0;
            for (int p = 1; p <= 7; p++) {
                AttendanceStatus st = periods.get(p);
                if (st == AttendanceStatus.PRESENT) present++;
                else if (st == AttendanceStatus.ABSENT) absent++;
            }

            result.add(DailyStudentAttendanceDto.builder()
                    .studentId(s.getId())
                    .rollNumber(s.getRollNumber())
                    .name(s.getName())
                    .department(s.getDepartment())
                    .periods(periods)
                    .presentCount(present)
                    .absentCount(absent)
                    .build());
        }

        return result;
    }

    public List<DailyStudentAttendanceDto> saveDailyAttendance(DailyAttendanceRequest request) {
        LocalDate date = request.getDate();
        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }

        if (request.getRecords() == null) {
            return getDailyAttendance(date, request.getDepartment());
        }

        for (DailyAttendanceRequest.StudentPeriodEntry entry : request.getRecords()) {
            Long studentId = entry.getStudentId();
            if (studentId == null || entry.getPeriods() == null) continue;

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

            for (Map.Entry<Integer, AttendanceStatus> pEntry : entry.getPeriods().entrySet()) {
                Integer periodNum = pEntry.getKey();
                AttendanceStatus status = pEntry.getValue();

                if (periodNum == null || periodNum < 1 || periodNum > 7 || status == null) {
                    continue;
                }

                // Check for existing record to prevent duplicates and enable clean updates
                Optional<AttendanceRecord> existingOpt = attendanceRepository
                        .findByStudentIdAndDateAndPeriodNumber(studentId, date, periodNum);

                if (existingOpt.isPresent()) {
                    AttendanceRecord existing = existingOpt.get();
                    existing.setStatus(status);
                    attendanceRepository.save(existing);
                } else {
                    AttendanceRecord newRec = AttendanceRecord.builder()
                            .student(student)
                            .date(date)
                            .periodNumber(periodNum)
                            .status(status)
                            .build();
                    attendanceRepository.save(newRec);
                }
            }
        }

        return getDailyAttendance(date, request.getDepartment());
    }

    public void markAllStudentsForDate(LocalDate date, String department, AttendanceStatus status) {
        List<Student> students;
        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL")) {
            students = studentRepository.findByDepartmentOrderByRollNumberAsc(department.trim());
        } else {
            students = studentRepository.findAllByOrderByRollNumberAsc();
        }

        for (Student s : students) {
            for (int p = 1; p <= 7; p++) {
                Optional<AttendanceRecord> existingOpt = attendanceRepository
                        .findByStudentIdAndDateAndPeriodNumber(s.getId(), date, p);
                if (existingOpt.isPresent()) {
                    AttendanceRecord existing = existingOpt.get();
                    existing.setStatus(status);
                    attendanceRepository.save(existing);
                } else {
                    AttendanceRecord rec = AttendanceRecord.builder()
                            .student(s)
                            .date(date)
                            .periodNumber(p)
                            .status(status)
                            .build();
                    attendanceRepository.save(rec);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public MonthlyReportResponse getMonthlyReport(int year, int month, String department, double threshold) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        String deptFilter = (department != null && !department.equalsIgnoreCase("ALL")) ? department.trim() : null;

        List<Student> students;
        if (deptFilter != null) {
            students = studentRepository.findByDepartmentOrderByRollNumberAsc(deptFilter);
        } else {
            students = studentRepository.findAllByOrderByRollNumberAsc();
        }

        List<AttendanceRecord> records = attendanceRepository.findByDateBetweenAndDepartment(start, end, deptFilter);

        // Map: studentId -> List of records
        Map<Long, List<AttendanceRecord>> studentRecordsMap = records.stream()
                .collect(Collectors.groupingBy(r -> r.getStudent().getId()));

        // Calculate total working days in that month (dates on which attendance was recorded)
        Set<LocalDate> workingDates = records.stream()
                .map(AttendanceRecord::getDate)
                .collect(Collectors.toSet());
        int totalWorkingDays = workingDates.size();

        // Calculate max periods conducted in the month across all students
        int maxWorkingPeriodsFound = 0;
        for (List<AttendanceRecord> list : studentRecordsMap.values()) {
            if (list.size() > maxWorkingPeriodsFound) {
                maxWorkingPeriodsFound = list.size();
            }
        }

        int standardWorkingPeriods = totalWorkingDays * 7;
        int benchmarkWorkingPeriods = Math.max(standardWorkingPeriods, maxWorkingPeriodsFound);

        List<MonthlySummaryRowDto> rows = new ArrayList<>();
        double totalPercentageSum = 0;
        int defaultersCount = 0;

        for (Student s : students) {
            List<AttendanceRecord> sRecords = studentRecordsMap.getOrDefault(s.getId(), Collections.emptyList());

            int presentCount = 0;
            int absentCount = 0;

            for (AttendanceRecord r : sRecords) {
                if (r.getStatus() == AttendanceStatus.PRESENT) presentCount++;
                else if (r.getStatus() == AttendanceStatus.ABSENT) absentCount++;
            }

            // Total periods for this student (either total recorded or class benchmark)
            int studentTotalPeriods = presentCount + absentCount;
            int displayWorkingPeriods = studentTotalPeriods > 0 ? studentTotalPeriods : benchmarkWorkingPeriods;

            double pct = 0.0;
            if (displayWorkingPeriods > 0) {
                pct = BigDecimal.valueOf((presentCount * 100.0) / displayWorkingPeriods)
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            boolean isDefaulter = pct < threshold;
            if (isDefaulter) {
                defaultersCount++;
            }
            totalPercentageSum += pct;

            rows.add(MonthlySummaryRowDto.builder()
                    .studentId(s.getId())
                    .rollNumber(s.getRollNumber())
                    .name(s.getName())
                    .department(s.getDepartment())
                    .workingPeriods(displayWorkingPeriods)
                    .present(presentCount)
                    .absent(absentCount)
                    .attendancePercentage(pct)
                    .defaulter(isDefaulter)
                    .build());
        }

        double classAvg = rows.isEmpty() ? 0.0 :
                BigDecimal.valueOf(totalPercentageSum / rows.size())
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue();

        return MonthlyReportResponse.builder()
                .year(year)
                .month(month)
                .monthName(ym.getMonth().name() + " " + year)
                .department(department != null ? department : "All Departments")
                .totalWorkingDays(totalWorkingDays)
                .totalWorkingPeriods(benchmarkWorkingPeriods)
                .thresholdPercentage(threshold)
                .totalStudents(students.size())
                .defaultersCount(defaultersCount)
                .classAveragePercentage(classAvg)
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public StudentMonthlyDetailDto getStudentMonthlyDetail(Long studentId, int year, int month) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<AttendanceRecord> records = attendanceRepository.findByStudentIdAndDateBetween(studentId, start, end);

        Map<LocalDate, Map<Integer, AttendanceStatus>> datePeriodMap = new TreeMap<>();
        int totalPresent = 0;
        int totalAbsent = 0;

        for (AttendanceRecord r : records) {
            datePeriodMap
                    .computeIfAbsent(r.getDate(), k -> new HashMap<>())
                    .put(r.getPeriodNumber(), r.getStatus());

            if (r.getStatus() == AttendanceStatus.PRESENT) totalPresent++;
            else if (r.getStatus() == AttendanceStatus.ABSENT) totalAbsent++;
        }

        List<StudentMonthlyDetailDto.DailyRecord> dailyRecords = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<Integer, AttendanceStatus>> entry : datePeriodMap.entrySet()) {
            int dp = 0;
            int da = 0;
            for (AttendanceStatus st : entry.getValue().values()) {
                if (st == AttendanceStatus.PRESENT) dp++;
                else if (st == AttendanceStatus.ABSENT) da++;
            }

            dailyRecords.add(StudentMonthlyDetailDto.DailyRecord.builder()
                    .date(entry.getKey())
                    .periods(entry.getValue())
                    .present(dp)
                    .absent(da)
                    .build());
        }

        int totalPeriods = totalPresent + totalAbsent;
        double pct = totalPeriods > 0
                ? BigDecimal.valueOf((totalPresent * 100.0) / totalPeriods).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        return StudentMonthlyDetailDto.builder()
                .studentId(student.getId())
                .rollNumber(student.getRollNumber())
                .name(student.getName())
                .department(student.getDepartment())
                .year(year)
                .month(month)
                .workingPeriods(totalPeriods)
                .present(totalPresent)
                .absent(totalAbsent)
                .attendancePercentage(pct)
                .dailyRecords(dailyRecords)
                .build();
    }

    @Transactional(readOnly = true)
    public String generateMonthlyCsv(int year, int month, String department, double threshold) {
        MonthlyReportResponse report = getMonthlyReport(year, month, department, threshold);

        StringBuilder sb = new StringBuilder();
        sb.append("Roll No.,Student,Department,Working periods,Present,Absent,Attendance %,Status\n");

        for (MonthlySummaryRowDto row : report.getRows()) {
            sb.append(escapeCsv(row.getRollNumber())).append(",")
                    .append(escapeCsv(row.getName())).append(",")
                    .append(escapeCsv(row.getDepartment())).append(",")
                    .append(row.getWorkingPeriods()).append(",")
                    .append(row.getPresent()).append(",")
                    .append(row.getAbsent()).append(",")
                    .append(String.format(Locale.US, "%.2f%%", row.getAttendancePercentage())).append(",")
                    .append(row.isDefaulter() ? "Below Threshold (< " + threshold + "%)" : "Normal")
                    .append("\n");
        }

        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String generateDailyCsv(LocalDate date, String department) {
        List<DailyStudentAttendanceDto> list = getDailyAttendance(date, department);

        StringBuilder sb = new StringBuilder();
        sb.append("Roll No.,Student,Department,P1,P2,P3,P4,P5,P6,P7,Present Count,Absent Count\n");

        for (DailyStudentAttendanceDto s : list) {
            sb.append(escapeCsv(s.getRollNumber())).append(",")
                    .append(escapeCsv(s.getName())).append(",")
                    .append(escapeCsv(s.getDepartment())).append(",");

            for (int p = 1; p <= 7; p++) {
                AttendanceStatus st = s.getPeriods().get(p);
                sb.append(st != null ? (st == AttendanceStatus.PRESENT ? "P" : "A") : "-").append(",");
            }

            sb.append(s.getPresentCount()).append(",")
                    .append(s.getAbsentCount()).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
