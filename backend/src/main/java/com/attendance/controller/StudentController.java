package com.attendance.controller;

import com.attendance.dto.StudentDto;
import com.attendance.service.DataSeederService;
import com.attendance.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;
    private final DataSeederService dataSeederService;

    public StudentController(StudentService studentService, DataSeederService dataSeederService) {
        this.studentService = studentService;
        this.dataSeederService = dataSeederService;
    }

    @GetMapping
    public ResponseEntity<List<StudentDto>> getAllStudents(
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(studentService.getAllStudents(department));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<?> createStudent(@Valid @RequestBody StudentDto dto) {
        try {
            StudentDto created = studentService.createStudent(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkCreateStudents(@RequestBody List<StudentDto> dtoList) {
        try {
            List<StudentDto> created = studentService.bulkCreateStudents(dtoList);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDto dto) {
        try {
            StudentDto updated = studentService.updateStudent(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Student and attendance records deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(studentService.getDepartments());
    }

    @PostMapping("/reset-sample-data")
    public ResponseEntity<?> resetSampleData() {
        dataSeederService.resetAndReseed();
        return ResponseEntity.ok(Map.of("message", "Sample data reset successfully matching project specifications"));
    }
}
