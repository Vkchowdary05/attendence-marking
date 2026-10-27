package com.attendance.repository;

import com.attendance.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    @Query("SELECT a FROM AttendanceRecord a JOIN FETCH a.student s " +
           "WHERE a.date = :date AND (:department IS NULL OR s.department = :department) " +
           "ORDER BY s.rollNumber ASC, a.periodNumber ASC")
    List<AttendanceRecord> findByDateAndDepartment(
        @Param("date") LocalDate date,
        @Param("department") String department
    );

    @Query("SELECT a FROM AttendanceRecord a JOIN FETCH a.student s " +
           "WHERE a.date BETWEEN :start AND :end " +
           "AND (:department IS NULL OR s.department = :department) " +
           "ORDER BY a.date ASC, s.rollNumber ASC, a.periodNumber ASC")
    List<AttendanceRecord> findByDateBetweenAndDepartment(
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("department") String department
    );

    @Query("SELECT a FROM AttendanceRecord a " +
           "WHERE a.student.id = :studentId AND a.date BETWEEN :start AND :end " +
           "ORDER BY a.date ASC, a.periodNumber ASC")
    List<AttendanceRecord> findByStudentIdAndDateBetween(
        @Param("studentId") Long studentId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    Optional<AttendanceRecord> findByStudentIdAndDateAndPeriodNumber(
        Long studentId,
        LocalDate date,
        Integer periodNumber
    );

    @Query("SELECT DISTINCT a.date FROM AttendanceRecord a " +
           "WHERE a.student.department = :department AND a.date BETWEEN :start AND :end " +
           "ORDER BY a.date ASC")
    List<LocalDate> findDistinctDatesInMonth(
        @Param("department") String department,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    void deleteByStudentId(Long studentId);
}
