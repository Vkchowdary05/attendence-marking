import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import DailyAttendancePage from "./pages/DailyAttendancePage";
import MonthlyReportPage from "./pages/MonthlyReportPage";
import DefaultersPage from "./pages/DefaultersPage";
import StudentsPage from "./pages/StudentsPage";
import DevOpsPage from "./pages/DevOpsPage";
import LoginPage from "./pages/LoginPage";
import StudentDetailModal from "./components/StudentDetailModal";
import { getDepartments, resetSampleData } from "./api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("ams_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [departments, setDepartments] = useState(["CSE (AI & ML)", "Computer Science"]);
  const [selectedDept, setSelectedDept] = useState("CSE (AI & ML)");
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchDepts = async () => {
    try {
      const list = await getDepartments();
      if (list && list.length > 0) {
        setDepartments(list);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDepts();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("ams_user");
    setCurrentUser(null);
    setCurrentPage("dashboard");
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "Reset all attendance and students to default sample preview data (October 2026)?"
      )
    ) {
      setIsResetting(true);
      try {
        await resetSampleData();
        await fetchDepts();
        window.location.reload();
      } catch (err) {
        console.error("Failed to reset demo data:", err);
        alert("Failed to reset demo data.");
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleOpenStudentDetail = (studentId, year, month) => {
    setSelectedStudentForModal({ studentId, year, month });
  };

  // If not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50/40 text-zinc-950 flex flex-col sm:flex-row antialiased selection:bg-black selection:text-white">
      {/* Modern shadcn Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onResetData={handleResetData}
        isResetting={isResetting}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentPage={currentPage}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          departments={departments}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentPage === "dashboard" && (
            <DashboardPage
              setCurrentPage={setCurrentPage}
              selectedDept={selectedDept}
              onSelectStudent={handleOpenStudentDetail}
            />
          )}

          {currentPage === "daily" && (
            <DailyAttendancePage
              selectedDept={selectedDept}
              departments={departments}
            />
          )}

          {currentPage === "monthly" && (
            <MonthlyReportPage
              selectedDept={selectedDept}
              departments={departments}
              onSelectStudent={handleOpenStudentDetail}
            />
          )}

          {currentPage === "defaulters" && (
            <DefaultersPage
              selectedDept={selectedDept}
              onSelectStudent={handleOpenStudentDetail}
            />
          )}

          {currentPage === "students" && (
            <StudentsPage
              selectedDept={selectedDept}
              departments={departments}
              onRefreshDepts={fetchDepts}
            />
          )}

          {currentPage === "devops" && <DevOpsPage />}
        </main>

        {/* Global Student Dossier Modal */}
        {selectedStudentForModal && (
          <StudentDetailModal
            studentId={selectedStudentForModal.studentId}
            year={selectedStudentForModal.year}
            month={selectedStudentForModal.month}
            onClose={() => setSelectedStudentForModal(null)}
          />
        )}

        {/* Modern Minimal Footer */}
        <footer className="border-t border-zinc-200 bg-white px-6 py-4 text-center text-xs font-mono text-zinc-500">
          Student Attendance Management System · DevOps Engineering Project · React 19 + Spring Boot 3 + PostgreSQL
        </footer>
      </div>
    </div>
  );
}
