package com.attendance.service;

import com.attendance.dto.StudentDto;
import com.attendance.model.Student;
import com.attendance.repository.AttendanceRecordRepository;
import com.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public StudentService(StudentRepository studentRepository, AttendanceRecordRepository attendanceRecordRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents(String department) {
        List<Student> students;
        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL")) {
            students = studentRepository.findByDepartmentOrderByRollNumberAsc(department.trim());
        } else {
            students = studentRepository.findAllByOrderByRollNumberAsc();
        }
        return students.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + id));
        return toDto(student);
    }

    public StudentDto createStudent(StudentDto dto) {
        if (dto.getRollNumber() == null || dto.getRollNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Roll number is required");
        }
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student name is required");
        }
        if (dto.getDepartment() == null || dto.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
        }

        String roll = dto.getRollNumber().trim();
        if (studentRepository.existsByRollNumber(roll)) {
            throw new IllegalArgumentException("Student with roll number " + roll + " already exists");
        }

        Student student = Student.builder()
                .rollNumber(roll)
                .name(dto.getName().trim())
                .department(dto.getDepartment().trim())
                .semester(dto.getSemester() != null ? dto.getSemester() : 5)
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .phone(dto.getPhone() != null ? dto.getPhone().trim() : null)
                .build();

        return toDto(studentRepository.save(student));
    }

    public List<StudentDto> bulkCreateStudents(List<StudentDto> dtoList) {
        List<StudentDto> results = new java.util.ArrayList<>();
        for (StudentDto dto : dtoList) {
            if (dto.getRollNumber() == null || dto.getName() == null) continue;
            String roll = dto.getRollNumber().trim();
            if (roll.isEmpty()) continue;

            if (studentRepository.existsByRollNumber(roll)) {
                // Update existing
                Student existing = studentRepository.findByRollNumber(roll).orElseThrow();
                existing.setName(dto.getName().trim());
                if (dto.getDepartment() != null) existing.setDepartment(dto.getDepartment().trim());
                if (dto.getSemester() != null) existing.setSemester(dto.getSemester());
                results.add(toDto(studentRepository.save(existing)));
            } else {
                Student student = Student.builder()
                        .rollNumber(roll)
                        .name(dto.getName().trim())
                        .department(dto.getDepartment() != null ? dto.getDepartment().trim() : "General")
                        .semester(dto.getSemester() != null ? dto.getSemester() : 5)
                        .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                        .phone(dto.getPhone() != null ? dto.getPhone().trim() : null)
                        .build();
                results.add(toDto(studentRepository.save(student)));
            }
        }
        return results;
    }

    public StudentDto updateStudent(Long id, StudentDto dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + id));

        String newRoll = dto.getRollNumber() != null ? dto.getRollNumber().trim() : student.getRollNumber();
        if (!newRoll.equalsIgnoreCase(student.getRollNumber()) && studentRepository.existsByRollNumber(newRoll)) {
            throw new IllegalArgumentException("Roll number " + newRoll + " is already used by another student");
        }

        student.setRollNumber(newRoll);
        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            student.setName(dto.getName().trim());
        }
        if (dto.getDepartment() != null && !dto.getDepartment().trim().isEmpty()) {
            student.setDepartment(dto.getDepartment().trim());
        }
        if (dto.getSemester() != null) {
            student.setSemester(dto.getSemester());
        }
        student.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        student.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);

        return toDto(studentRepository.save(student));
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new IllegalArgumentException("Student not found with ID: " + id);
        }
        // First clean up associated attendance records
        attendanceRecordRepository.deleteByStudentId(id);
        studentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<String> getDepartments() {
        return studentRepository.findDistinctDepartments();
    }

    public StudentDto toDto(Student student) {
        return StudentDto.builder()
                .id(student.getId())
                .rollNumber(student.getRollNumber())
                .name(student.getName())
                .department(student.getDepartment())
                .semester(student.getSemester())
                .email(student.getEmail())
                .phone(student.getPhone())
                .createdAt(student.getCreatedAt())
                .build();
    }
}
