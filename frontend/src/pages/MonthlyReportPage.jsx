import React, { useState, useEffect } from "react";
import { getMonthlySummary, getMonthlyCsvDownloadUrl } from "../api";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import {
  Download,
  Printer,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers
} from "lucide-react";

export default function MonthlyReportPage({ selectedDept, departments, onSelectStudent }) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10);
  const [department, setDepartment] = useState(selectedDept || "CSE (AI & ML)");
  const [threshold, setThreshold] = useState(75.0);
  const [onlyDefaulters, setOnlyDefaulters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getMonthlySummary(year, month, department, threshold);
      setReport(data);
    } catch (err) {
      console.error("Failed to load monthly report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [year, month, department, threshold]);

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const displayedRows = (report?.rows || []).filter((row) => {
    if (onlyDefaulters && !row.defaulter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoll = row.rollNumber.toLowerCase().includes(q);
      const matchName = row.name.toLowerCase().includes(q);
      return matchRoll || matchName;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Title Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Sample monthly report
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Academic Session 2026-2027 · {report?.monthName || "October 2026"} · {department}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getMonthlyCsvDownloadUrl(year, month, department, threshold)}
            download
            className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md bg-zinc-950 text-white hover:bg-zinc-800 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
              Working periods
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-1">
              {report?.totalWorkingPeriods || 154}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {report?.totalWorkingDays || 22} conducted days
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
              Class Average
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-1">
              {report?.classAveragePercentage || 0}%
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Department attendance mean
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
              Registered Students
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-1">
              {report?.totalStudents || 0}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Active enrolled roster
            </div>
          </CardContent>
        </Card>

        <Card className={report?.defaultersCount > 0 ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200"}>
          <CardContent className="p-4">
            <div className={`text-[11px] font-semibold uppercase tracking-wide ${report?.defaultersCount > 0 ? "text-zinc-300" : "text-zinc-500"}`}>
              Defaulters (&lt; {threshold}%)
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {report?.defaultersCount || 0}
            </div>
            <div className={`text-[11px] mt-0.5 ${report?.defaultersCount > 0 ? "text-zinc-400" : "text-zinc-400"}`}>
              Below configured threshold
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Month */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Month:</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="h-8 px-2.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-8 px-2.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white font-mono"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Dept:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-8 px-2.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white"
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

            {/* Threshold Slider / Input */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Threshold:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="h-8 w-16 px-2 text-xs font-bold font-mono rounded-md border border-zinc-300 text-center"
              />
              <span className="text-xs font-mono text-zinc-500">%</span>
            </div>
          </div>

          {/* Search & Defaulter Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by roll or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs rounded-md border border-zinc-300 w-52 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyDefaulters}
                onChange={(e) => setOnlyDefaulters(e.target.checked)}
                className="h-4 w-4 rounded accent-zinc-950"
              />
              <span>Only Defaulters</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report Table Matching Screenshot Layout Exactly */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-left caption-bottom text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-950 text-white text-xs font-semibold">
              <th className="p-3 w-28">Roll No.</th>
              <th className="p-3">Student</th>
              <th className="p-3 text-right w-36">Working periods</th>
              <th className="p-3 text-right w-28">Present</th>
              <th className="p-3 text-right w-28">Absent</th>
              <th className="p-3 text-right w-32">Attendance</th>
              <th className="p-3 text-center w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs font-mono text-zinc-500">
                  Calculating monthly totals and attendance metrics...
                </td>
              </tr>
            ) : displayedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-zinc-500">
                  No records match current filters.
                </td>
              </tr>
            ) : (
              displayedRows.map((row) => (
                <tr
                  key={row.studentId}
                  onClick={() => onSelectStudent && onSelectStudent(row.studentId, year, month)}
                  className={`hover:bg-zinc-50 cursor-pointer ${
                    row.defaulter ? "bg-zinc-50/60" : "bg-white"
                  }`}
                  title="Click to view detailed period-by-period dossier"
                >
                  <td className="p-3 font-mono font-bold text-xs text-zinc-950">
                    {row.rollNumber}
                  </td>
                  <td className="p-3 font-medium text-xs text-zinc-900">
                    {row.name}
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-zinc-700">
                    {row.workingPeriods}
                  </td>
                  <td className="p-3 text-right font-mono text-xs font-semibold text-zinc-950">
                    {row.present}
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-zinc-500">
                    {row.absent}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-sm text-zinc-950">
                    {row.attendancePercentage.toFixed(2)}%
                  </td>
                  <td className="p-3 text-center">
                    {row.defaulter ? (
                      <Badge variant="defaulter">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Defaulter
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-zinc-300 text-zinc-700 bg-white">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-zinc-700" /> Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>* Click any student row to view full daily attendance dossier</span>
        <span>Cutoff Rule: Attendance &lt; {threshold}% is categorized as Defaulter</span>
      </div>
    </div>
  );
}
