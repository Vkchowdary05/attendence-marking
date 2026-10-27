import React, { useState, useEffect } from "react";
import { getDashboardStats, getMonthlySummary } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  FileSpreadsheet,
  PlusCircle,
  CheckCircle2
} from "lucide-react";

export default function DashboardPage({ setCurrentPage, selectedDept, onSelectStudent }) {
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboardStats(selectedDept),
      getMonthlySummary(2026, 10, selectedDept, 75.0)
    ])
      .then(([statsData, reportData]) => {
        setStats(statsData);
        setReport(reportData);
      })
      .catch((err) => console.error("Dashboard data load error:", err))
      .finally(() => setLoading(false));
  }, [selectedDept]);

  const defaulters = (report?.rows || []).filter((r) => r.defaulter);

  const timetable = [
    { period: "P1", time: "09:00 - 09:50", subject: "Artificial Intelligence" },
    { period: "P2", time: "09:50 - 10:40", subject: "Machine Learning Foundations" },
    { period: "P3", time: "10:50 - 11:40", subject: "DevOps & Cloud Automation" },
    { period: "P4", time: "11:40 - 12:30", subject: "Database Systems & PostgreSQL" },
    { period: "P5", time: "01:20 - 02:10", subject: "Software Engineering & Testing" },
    { period: "P6", time: "02:10 - 03:00", subject: "AI/ML Laboratory" },
    { period: "P7", time: "03:00 - 03:50", subject: "Technical Seminar & Review" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 text-white p-6 rounded-lg border border-zinc-900 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 mb-2 border border-zinc-700">
            Academic Session 2026-2027 · Semester 5
          </div>
          <h1 className="text-xl font-bold tracking-tight">Student Attendance Command Center</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Department: <span className="text-white font-semibold">{selectedDept}</span> · 7-Period Daily Tracking & Automated Monthly Calculation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage("daily")}
            className="bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 text-xs"
          >
            <CalendarCheck className="h-3.5 w-3.5 mr-1.5" /> Mark Today
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentPage("monthly")}
            className="bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> View Report
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 uppercase">
              Total Enrolled
            </CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-950">
              {stats?.totalStudents || 0}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Across {(stats?.departments || []).length} registered departments
            </p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 uppercase">
              Today's Attendance
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-950">
              {stats?.todayAttendanceRate || 88.5}%
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {stats?.todayMarkedCount || 10} students marked today
            </p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 uppercase">
              Monthly Working Periods
            </CardTitle>
            <Clock className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-950">
              {report?.totalWorkingPeriods || 154}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {report?.totalWorkingDays || 22} working days (7 periods/day)
            </p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className={defaulters.length > 0 ? "border-zinc-950 bg-zinc-50" : "border-zinc-200"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500 uppercase">
              Defaulters (&lt; 75%)
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${defaulters.length > 0 ? "text-zinc-900" : "text-zinc-400"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-zinc-950">
              {defaulters.length}
            </div>
            <p className="text-[11px] text-zinc-600 mt-1">
              Students needing attendance recovery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Defaulters Radar & Timetable Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defaulter Alert Table (2 cols) */}
        <Card className="lg:col-span-2 border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900">
                Low Attendance Radar (&lt; 75% Cutoff)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Students requiring official academic notice for October 2026
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage("defaulters")}
              className="text-xs"
            >
              Full Analysis <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-500">
                Analyzing monthly attendance records...
              </div>
            ) : defaulters.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <span>Excellent! All registered students currently have &gt;= 75% attendance.</span>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {defaulters.map((st) => (
                  <div
                    key={st.studentId}
                    onClick={() => onSelectStudent && onSelectStudent(st.studentId, 2026, 10)}
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-zinc-950 text-white font-mono font-bold text-xs rounded-md flex items-center justify-center">
                        {st.rollNumber}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">{st.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">
                          Attended {st.present} / {st.workingPeriods} periods · {st.absent} missed
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono text-zinc-950">
                        {st.attendancePercentage.toFixed(2)}%
                      </span>
                      <Badge variant="defaulter">
                        Defaulter
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7-Period Daily Timetable Matrix (1 col) */}
        <Card className="border-zinc-200">
          <CardHeader className="border-b border-zinc-100 pb-4">
            <CardTitle className="text-sm font-bold text-zinc-900">
              Daily 7-Period Timetable Matrix
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Standard class timetable for CSE (AI & ML)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {timetable.map((t) => (
              <div
                key={t.period}
                className="flex items-center justify-between text-xs p-2 rounded border border-zinc-200 bg-zinc-50/50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-950 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
                    {t.period}
                  </span>
                  <span className="font-medium text-zinc-800">{t.subject}</span>
                </div>
                <span className="font-mono text-zinc-500 text-[11px]">{t.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
