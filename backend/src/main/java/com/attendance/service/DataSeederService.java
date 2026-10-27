package com.attendance.service;

import com.attendance.model.AttendanceRecord;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.Student;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Service
public class DataSeederService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public DataSeederService(StudentRepository studentRepository,
                             AttendanceRecordRepository attendanceRecordRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (studentRepository.count() == 0) {
            log.info("Database is empty. Seeding initial students and sample attendance matching project requirements...");
            seedData();
        }
    }

    @Transactional
    public void seedData() {
        String dept = "CSE (AI & ML)";

        // Create initial students matching the user's sample
        List<Student> students = new ArrayList<>();
        students.add(Student.builder().rollNumber("101").name("Student 1").department(dept).semester(5).email("student101@college.edu").build());
        students.add(Student.builder().rollNumber("102").name("Student 2").department(dept).semester(5).email("student102@college.edu").build());
        students.add(Student.builder().rollNumber("103").name("Student 3").department(dept).semester(5).email("student103@college.edu").build());
        students.add(Student.builder().rollNumber("104").name("Student 4").department(dept).semester(5).email("student104@college.edu").build());
        students.add(Student.builder().rollNumber("105").name("Student 5").department(dept).semester(5).email("student105@college.edu").build());
        students.add(Student.builder().rollNumber("106").name("Student 6").department(dept).semester(5).email("student106@college.edu").build());
        students.add(Student.builder().rollNumber("107").name("Student 7").department(dept).semester(5).email("student107@college.edu").build());
        students.add(Student.builder().rollNumber("108").name("Student 8").department(dept).semester(5).email("student108@college.edu").build());
        students.add(Student.builder().rollNumber("109").name("Student 9").department(dept).semester(5).email("student109@college.edu").build());
        students.add(Student.builder().rollNumber("110").name("Student 10").department(dept).semester(5).email("student110@college.edu").build());

        // Add a few students from another department (e.g. CSE) to verify department filtering
        students.add(Student.builder().rollNumber("201").name("Rahul Sharma").department("Computer Science").semester(5).email("rahul201@college.edu").build());
        students.add(Student.builder().rollNumber("202").name("Priya Patel").department("Computer Science").semester(5).email("priya202@college.edu").build());

        List<Student> savedStudents = studentRepository.saveAll(students);
        log.info("Seeded {} students successfully.", savedStudents.size());

        // Seed 22 working days in October 2026 (154 periods) to reproduce the exact 154 working periods
        seedOctoberAttendance(savedStudents);
    }

    private void seedOctoberAttendance(List<Student> allStudents) {
        List<Student> cseAiStudents = allStudents.stream()
                .filter(s -> s.getDepartment().equals("CSE (AI & ML)"))
                .toList();

        int year = 2026;
        int month = 10;
        List<LocalDate> workingDays = new ArrayList<>();
        LocalDate cur = LocalDate.of(year, month, 1);
        while (cur.getMonthValue() == month && workingDays.size() < 22) {
            if (cur.getDayOfWeek() != DayOfWeek.SATURDAY && cur.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workingDays.add(cur);
            }
            cur = cur.plusDays(1);
        }

        // Exact absent counts from the project specification screenshot:
        // 101: 14 absent (140 present) -> 90.91%
        // 102: 24 absent (130 present) -> 84.42%
        // 103: 39 absent (115 present) -> 74.68% (Defaulter)
        // 104: 4 absent (150 present) -> 97.40%
        // 105: 10 absent (144 present) -> 93.51%
        Map<String, Integer> targetAbsent = new HashMap<>();
        targetAbsent.put("101", 14);
        targetAbsent.put("102", 24);
        targetAbsent.put("103", 39);
        targetAbsent.put("104", 4);
        targetAbsent.put("105", 10);
        targetAbsent.put("106", 18);
        targetAbsent.put("107", 45); // Defaulter
        targetAbsent.put("108", 8);
        targetAbsent.put("109", 12);
        targetAbsent.put("110", 32); // Defaulter

        List<AttendanceRecord> records = new ArrayList<>();

        for (Student s : cseAiStudents) {
            int neededAbsent = targetAbsent.getOrDefault(s.getRollNumber(), 15);
            // Collect eligible slots (all slots except date 14 which must be PRESENT)
            List<int[]> eligibleSlots = new ArrayList<>();
            for (int d = 0; d < workingDays.size(); d++) {
                LocalDate date = workingDays.get(d);
                if (date.getDayOfMonth() == 14) continue; // Keep preview date 100% Present
                for (int p = 1; p <= 7; p++) {
                    eligibleSlots.add(new int[]{d, p});
                }
            }

            // Deterministically select `neededAbsent` slots to mark absent
            Set<String> absentSlotKeys = new HashSet<>();
            int step = Math.max(1, eligibleSlots.size() / neededAbsent);
            int idx = 0;
            while (absentSlotKeys.size() < neededAbsent && idx < eligibleSlots.size()) {
                int[] slot = eligibleSlots.get(idx);
                absentSlotKeys.add(slot[0] + "_" + slot[1]);
                idx += step;
            }
            // Fill remaining if needed
            for (int i = 0; i < eligibleSlots.size() && absentSlotKeys.size() < neededAbsent; i++) {
                int[] slot = eligibleSlots.get(i);
                absentSlotKeys.add(slot[0] + "_" + slot[1]);
            }

            for (int d = 0; d < workingDays.size(); d++) {
                LocalDate date = workingDays.get(d);
                for (int p = 1; p <= 7; p++) {
                    boolean isAbsent = (date.getDayOfMonth() != 14) && absentSlotKeys.contains(d + "_" + p);
                    records.add(AttendanceRecord.builder()
                            .student(s)
                            .date(date)
                            .periodNumber(p)
                            .status(isAbsent ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT)
                            .build());
                }
            }
        }

        attendanceRecordRepository.saveAll(records);
        log.info("Seeded {} attendance records for October 2026.", records.size());
    }

    @Transactional
    public void resetAndReseed() {
        attendanceRecordRepository.deleteAll();
        studentRepository.deleteAll();
        seedData();
    }
}
