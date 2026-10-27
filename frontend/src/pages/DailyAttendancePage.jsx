import React, { useState, useEffect } from "react";
import {
  getDailyAttendance,
  saveDailyAttendance,
  getDailyCsvDownloadUrl
} from "../api";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import {
  Calendar,
  Save,
  Download,
  CheckCheck,
  XCircle,
  Check,
  AlertCircle
} from "lucide-react";

export default function DailyAttendancePage({ selectedDept, departments }) {
  const [date, setDate] = useState("2026-10-14");
  const [department, setDepartment] = useState(selectedDept || "CSE (AI & ML)");
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const loadDailyData = async () => {
    setLoading(true);
    setSaveSuccessMsg("");
    try {
      const data = await getDailyAttendance(date, department);
      setStudentsData(data);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to load daily attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, [date, department]);

  const togglePeriod = (studentId, periodNum) => {
    setStudentsData((prev) =>
      prev.map((st) => {
        if (st.studentId !== studentId) return st;
        const current = st.periods[periodNum];
        const nextStatus = current === "PRESENT" ? "ABSENT" : "PRESENT";
        const updatedPeriods = { ...st.periods, [periodNum]: nextStatus };

        let present = 0;
        let absent = 0;
        for (let p = 1; p <= 7; p++) {
          if (updatedPeriods[p] === "PRESENT") present++;
          else if (updatedPeriods[p] === "ABSENT") absent++;
        }

        return {
          ...st,
          periods: updatedPeriods,
          presentCount: present,
          absentCount: absent,
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg("");
  };

  const markStudentAll = (studentId, status) => {
    setStudentsData((prev) =>
      prev.map((st) => {
        if (st.studentId !== studentId) return st;
        const updatedPeriods = {};
        for (let p = 1; p <= 7; p++) {
          updatedPeriods[p] = status;
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: status === "PRESENT" ? 7 : 0,
          absentCount: status === "ABSENT" ? 7 : 0,
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg("");
  };

  const handleMarkAllClassPresent = () => {
    setStudentsData((prev) =>
      prev.map((st) => {
        const updatedPeriods = {};
        for (let p = 1; p <= 7; p++) {
          updatedPeriods[p] = "PRESENT";
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: 7,
          absentCount: 0,
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg("");
  };

  const handleMarkAllClassAbsent = () => {
    setStudentsData((prev) =>
      prev.map((st) => {
        const updatedPeriods = {};
        for (let p = 1; p <= 7; p++) {
          updatedPeriods[p] = "ABSENT";
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: 0,
          absentCount: 7,
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg("");
  };

  const handleToggleColumn = (periodNum) => {
    const presentCount = studentsData.filter((s) => s.periods[periodNum] === "PRESENT").length;
    const targetStatus = presentCount > studentsData.length / 2 ? "ABSENT" : "PRESENT";

    setStudentsData((prev) =>
      prev.map((st) => {
        const updatedPeriods = { ...st.periods, [periodNum]: targetStatus };
        let present = 0;
        let absent = 0;
        for (let p = 1; p <= 7; p++) {
          if (updatedPeriods[p] === "PRESENT") present++;
          else if (updatedPeriods[p] === "ABSENT") absent++;
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: present,
          absentCount: absent,
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        date,
        department,
        records: studentsData.map((st) => ({
          studentId: st.studentId,
          periods: st.periods,
        })),
      };
      const updated = await saveDailyAttendance(payload);
      setStudentsData(updated);
      setHasUnsavedChanges(false);
      setSaveSuccessMsg("Attendance recorded successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-zinc-500">Sample preview ·</span>
            <span className="text-lg font-extrabold text-zinc-950">{department}</span>
          </div>
          <p className="text-xs text-zinc-500">
            Daily 7-period attendance tracking grid with atomic PostgreSQL persistence
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-zinc-950 bg-white text-zinc-950 shadow-sm font-mono">
              <AlertCircle className="h-3.5 w-3.5" /> Unsaved Changes
            </span>
          )}

          {saveSuccessMsg && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-950 text-white font-mono shadow-sm">
              <Check className="h-3.5 w-3.5" /> {saveSuccessMsg}
            </span>
          )}

          <Button onClick={handleSave} disabled={saving} size="sm" className="font-bold">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Saving..." : "Save Attendance"}
          </Button>

          <a
            href={getDailyCsvDownloadUrl(date, department)}
            download
            className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </a>
        </div>
      </div>

      {/* Filter and Date Bar matching prompt screenshot */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-zinc-800">Attendance date</label>
            <div className="flex items-center border border-zinc-300 rounded-md bg-white px-2.5 py-1 shadow-sm">
              <Calendar className="h-4 w-4 mr-2 text-zinc-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-mono font-semibold bg-transparent focus:outline-none"
              />
            </div>

            <Button
              variant={date === "2026-10-14" ? "default" : "outline"}
              size="xs"
              onClick={() => setDate("2026-10-14")}
              className="font-mono"
            >
              14/10/26 (Preview)
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setDate(new Date().toISOString().split("T")[0])}
              className="font-mono"
            >
              Today
            </Button>
          </div>

          {/* Department Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600">Department:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-8 px-2.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white text-zinc-900 shadow-sm focus:outline-none"
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

          {/* Legend Matching User Screenshot */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center px-3 py-1 rounded border-2 border-black bg-black text-white text-xs font-bold font-mono shadow-sm">
              P — Present
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded border-2 border-black bg-white text-black text-xs font-bold font-mono shadow-sm">
              A — Absent
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Strip */}
      <div className="flex items-center justify-between p-3 bg-zinc-100/80 rounded-t-lg border border-zinc-200 border-b-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Bulk Class Operations:
          </span>
          <Button
            size="xs"
            variant="default"
            onClick={handleMarkAllClassPresent}
            className="text-[11px]"
          >
            <CheckCheck className="h-3 w-3 mr-1" /> Mark All Present
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={handleMarkAllClassAbsent}
            className="text-[11px]"
          >
            <XCircle className="h-3 w-3 mr-1" /> Mark All Absent
          </Button>
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Showing <strong>{studentsData.length}</strong> students · Click any cell (P1-P7) to toggle
        </div>
      </div>

      {/* Main Table with Periods */}
      <div className="overflow-x-auto border border-zinc-200 rounded-b-lg bg-white shadow-sm">
        <table className="w-full text-left caption-bottom text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-950 text-white text-xs font-semibold">
              <th className="p-3 w-24">Roll No.</th>
              <th className="p-3 w-64">Student</th>
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <th
                  key={p}
                  onClick={() => handleToggleColumn(p)}
                  title={`Click to bulk toggle Period ${p}`}
                  className="p-3 text-center w-14 cursor-pointer hover:bg-zinc-800 select-none border-l border-zinc-800"
                >
                  <div>P{p}</div>
                  <div className="text-[9px] font-normal text-zinc-400">toggle</div>
                </th>
              ))}
              <th className="p-3 text-center w-28 border-l border-zinc-800">Present / Total</th>
              <th className="p-3 text-right w-36 border-l border-zinc-800">Quick Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-xs font-mono text-zinc-500">
                  Retrieving class attendance records...
                </td>
              </tr>
            ) : studentsData.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-xs text-zinc-500">
                  No students found in {department}.
                </td>
              </tr>
            ) : (
              studentsData.map((st) => (
                <tr key={st.studentId} className="hover:bg-zinc-50/70">
                  <td className="p-3 font-mono font-bold text-zinc-950 text-xs">
                    {st.rollNumber}
                  </td>
                  <td className="p-3 font-medium text-zinc-900 text-xs">
                    {st.name}
                  </td>

                  {/* Period Badges P1 to P7 */}
                  {[1, 2, 3, 4, 5, 6, 7].map((period) => {
                    const status = st.periods ? st.periods[period] : null;
                    const isP = status === "PRESENT";
                    const isA = status === "ABSENT";

                    return (
                      <td key={period} className="p-2 text-center border-l border-zinc-100">
                        <button
                          type="button"
                          onClick={() => togglePeriod(st.studentId, period)}
                          className={`w-8 h-8 rounded inline-flex items-center justify-center font-mono font-bold text-xs cursor-pointer select-none ${
                            isP
                              ? "bg-black text-white border-2 border-black"
                              : isA
                              ? "bg-white text-black border-2 border-black"
                              : "bg-zinc-100 text-zinc-400 border border-dashed border-zinc-300"
                          }`}
                          title={`Toggle Period ${period} (${status || "Unmarked"})`}
                        >
                          {isP ? "P" : isA ? "A" : "-"}
                        </button>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center font-mono text-xs border-l border-zinc-100">
                    <strong className="text-zinc-950">{st.presentCount}</strong> / 7
                    <span className="text-zinc-400 text-[11px] ml-1.5">({st.absentCount} A)</span>
                  </td>

                  <td className="p-3 text-right border-l border-zinc-100">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => markStudentAll(st.studentId, "PRESENT")}
                        className="text-[10px] px-2 h-6"
                      >
                        All P
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => markStudentAll(st.studentId, "ABSENT")}
                        className="text-[10px] px-2 h-6"
                      >
                        All A
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Period Summary Footer */}
          {studentsData.length > 0 && (
            <tfoot className="border-t-2 border-zinc-900 bg-zinc-50 font-semibold text-xs">
              <tr>
                <td colSpan={2} className="p-3 font-mono uppercase text-zinc-900">
                  Class Summary / Period:
                </td>
                {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                  const presentInP = studentsData.filter(
                    (s) => s.periods && s.periods[p] === "PRESENT"
                  ).length;
                  const total = studentsData.length;
                  const pct = total > 0 ? Math.round((presentInP / total) * 100) : 0;
                  return (
                    <td key={p} className="p-2 text-center font-mono text-xs border-l border-zinc-200">
                      <div>
                        <strong>{presentInP}</strong>/{total}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-normal">{pct}%</div>
                    </td>
                  );
                })}
                <td className="p-2 text-center font-mono text-xs border-l border-zinc-200">
                  {(() => {
                    const totalP = studentsData.reduce((acc, s) => acc + (s.presentCount || 0), 0);
                    const totalSlots = studentsData.length * 7;
                    const dayPct = totalSlots > 0 ? ((totalP / totalSlots) * 100).toFixed(1) : 0;
                    return (
                      <div>
                        <strong>{totalP}</strong>/{totalSlots}
                        <div className="text-[10px] text-zinc-500 font-normal">{dayPct}% Day Avg</div>
                      </div>
                    );
                  })()}
                </td>
                <td className="p-2 text-right text-[11px] font-mono text-zinc-400 border-l border-zinc-200">
                  Daily Totals
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
