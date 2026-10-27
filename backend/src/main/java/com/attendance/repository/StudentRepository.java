package com.attendance.repository;

import com.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findAllByOrderByRollNumberAsc();

    List<Student> findByDepartmentOrderByRollNumberAsc(String department);

    Optional<Student> findByRollNumber(String rollNumber);

    boolean existsByRollNumber(String rollNumber);

    @Query("SELECT DISTINCT s.department FROM Student s ORDER BY s.department ASC")
    List<String> findDistinctDepartments();
}
