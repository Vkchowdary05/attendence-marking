import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DailyAttendanceView from './components/DailyAttendanceView';
import MonthlyReportView from './components/MonthlyReportView';
import StudentManagementView from './components/StudentManagementView';
import StudentDetailModal from './components/StudentDetailModal';
import DevOpsView from './components/DevOpsView';
import { getDepartments, resetSampleData } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [departments, setDepartments] = useState(['CSE (AI & ML)', 'Computer Science']);
  const [selectedDept, setSelectedDept] = useState('CSE (AI & ML)');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchDepts = async () => {
    try {
      const list = await getDepartments();
      if (list && list.length > 0) {
        setDepartments(list);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleResetData = async () => {
    if (window.confirm('Reset all attendance and students to default sample preview data (October 2026)?')) {
      setIsResetting(true);
      try {
        await resetSampleData();
        await fetchDepts();
        // Force refresh current view by toggling tab briefly or window reload
        window.location.reload();
      } catch (err) {
        console.error('Failed to reset demo data:', err);
        alert('Failed to reset demo data.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleOpenStudentDetail = (studentId, year, month) => {
    setSelectedStudentForModal({ studentId, year, month });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Black and White Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'daily' && (
          <DailyAttendanceView
            selectedDept={selectedDept}
            departments={departments}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReportView
            selectedDept={selectedDept}
            departments={departments}
            onSelectStudent={handleOpenStudentDetail}
          />
        )}

        {activeTab === 'students' && (
          <StudentManagementView
            selectedDept={selectedDept}
            departments={departments}
            onRefreshDepts={fetchDepts}
          />
        )}

        {activeTab === 'devops' && (
          <DevOpsView />
        )}
      </main>

      {/* Individual Student Detail Modal */}
      {selectedStudentForModal && (
        <StudentDetailModal
          studentId={selectedStudentForModal.studentId}
          year={selectedStudentForModal.year}
          month={selectedStudentForModal.month}
          onClose={() => setSelectedStudentForModal(null)}
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '2px solid #000000',
        backgroundColor: '#FFFFFF',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        color: '#52525B'
      }}>
        Student Attendance Management System · DevOps Engineering Project · Built with React, Spring Boot, Hibernate & PostgreSQL
      </footer>
    </div>
  );
}
