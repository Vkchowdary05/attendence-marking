import React from "react";
import { Layers, Calendar, ChevronRight } from "lucide-react";

export default function Header({ currentPage, selectedDept, setSelectedDept, departments }) {
  const pageTitles = {
    dashboard: "Executive Dashboard",
    daily: "Daily 7-Period Attendance Grid",
    monthly: "Monthly Attendance Summary",
    defaulters: "Low Attendance Defaulters Radar",
    students: "Student Roster Directory",
    devops: "DevOps CI/CD & Selenium QA Pipeline",
  };

  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-zinc-500">AMS</span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="font-bold text-zinc-950 uppercase tracking-wide">
          {pageTitles[currentPage] || "Overview"}
        </span>
      </div>

      {/* Right Controls: Department & Academic Year */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-md">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-700 font-mono">Academic Year 2026-27</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-600 hidden sm:inline">Dept:</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 px-2.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white text-zinc-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
          >
            {departments && departments.length > 0 ? (
              departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))
            ) : (
              <option value="CSE (AI & ML)">CSE (AI & ML)</option>
            )}
            <option value="ALL">All Departments</option>
          </select>
        </div>
      </div>
    </header>
  );
}
