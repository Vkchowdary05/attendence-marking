import React, { useState, useEffect } from "react";
import { getMonthlySummary, getMonthlyCsvDownloadUrl } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  AlertTriangle,
  Send,
  Download,
  CheckCircle2,
  TrendingUp,
  FileText,
  Mail
} from "lucide-react";

export default function DefaultersPage({ selectedDept, onSelectStudent }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(75.0);
  const [notifiedStudents, setNotifiedStudents] = useState({});

  useEffect(() => {
    setLoading(true);
    getMonthlySummary(2026, 10, selectedDept, threshold)
      .then((data) => setReport(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedDept, threshold]);

  const defaulters = (report?.rows || []).filter((r) => r.defaulter);

  // Calculates required consecutive periods to reach threshold
  const calculateRecoveryPeriods = (present, working, targetPct) => {
    const target = targetPct / 100.0;
    if (working === 0) return 0;
    const currentRate = present / working;
    if (currentRate >= target) return 0;
    // (present + x) / (working + x) = target
    // present + x = target * working + target * x
    // x * (1 - target) = target * working - present
    const needed = Math.ceil((target * working - present) / (1 - target));
    return Math.max(1, needed);
  };

  const handleNotify = (studentId) => {
    setNotifiedStudents((prev) => ({ ...prev, [studentId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <div className="bg-zinc-950 text-white p-6 rounded-lg border border-zinc-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 mb-2 border border-zinc-700">
            <AlertTriangle className="h-3 w-3 text-white" /> Academic Attendance Recovery Radar
          </div>
          <h1 className="text-xl font-bold tracking-tight">Student Defaulter Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time shortfall monitoring, recovery calculation & parent notification dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300">Cutoff:</label>
            <input
              type="number"
              min="50"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-12 bg-zinc-800 text-white font-mono font-bold text-xs px-1.5 py-0.5 rounded text-center border border-zinc-700"
            />
            <span className="text-xs font-mono text-zinc-400">%</span>
          </div>

          <a
            href={getMonthlyCsvDownloadUrl(2026, 10, selectedDept, threshold)}
            download
            className="inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-md bg-white text-zinc-950 hover:bg-zinc-100 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export Defaulters
          </a>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase">Defaulter Students</div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-1">
              {defaulters.length}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Out of {report?.totalStudents || 0} total enrolled in {selectedDept}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase">Benchmark Working Periods</div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-1">
              {report?.totalWorkingPeriods || 154}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Standard class periods conducted
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase">Department Compliance Rate</div>
            <div className="text-2xl font-bold font-mono text-zinc-950 mt-1">
              {report?.totalStudents > 0
                ? Math.round(((report.totalStudents - defaulters.length) / report.totalStudents) * 100)
                : 100}%
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Students meeting minimum attendance threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Defaulters List */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-100 pb-4">
          <CardTitle className="text-sm font-bold text-zinc-900">
            Defaulter Students & Recovery Deficit Analysis
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Consecutive periods required to restore attendance percentage above {threshold}%
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500">
              Analyzing attendance thresholds...
            </div>
          ) : defaulters.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-zinc-950" />
              <div className="text-sm font-bold text-zinc-900">Zero Defaulters Detected!</div>
              <p className="max-w-md text-zinc-500">
                All students in {selectedDept} have attendance percentages at or above the required {threshold}% threshold.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left caption-bottom text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-700 text-xs font-semibold border-b border-zinc-200">
                    <th className="p-3 w-28">Roll No.</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 text-right">Periods Attended</th>
                    <th className="p-3 text-right">Periods Absent</th>
                    <th className="p-3 text-right">Current Rate</th>
                    <th className="p-3 text-center">Shortfall Deficit</th>
                    <th className="p-3 text-center">Recovery Required</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {defaulters.map((st) => {
                    const recovery = calculateRecoveryPeriods(st.present, st.workingPeriods, threshold);
                    const deficit = (threshold - st.attendancePercentage).toFixed(2);
                    const isNotified = notifiedStudents[st.studentId];

                    return (
                      <tr key={st.studentId} className="hover:bg-zinc-50/70">
                        <td className="p-3 font-mono font-bold text-xs text-zinc-950">
                          {st.rollNumber}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => onSelectStudent && onSelectStudent(st.studentId, 2026, 10)}
                            className="font-semibold text-xs text-zinc-900 hover:underline text-left cursor-pointer"
                          >
                            {st.name}
                          </button>
                          <div className="text-[10px] text-zinc-400 font-mono">{st.department}</div>
                        </td>
                        <td className="p-3 text-right font-mono text-xs text-zinc-900">
                          {st.present} / {st.workingPeriods}
                        </td>
                        <td className="p-3 text-right font-mono text-xs text-zinc-500">
                          {st.absent}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-xs text-zinc-950">
                          {st.attendancePercentage.toFixed(2)}%
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-100 text-zinc-900 border border-zinc-300">
                            -{deficit}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-950 text-white">
                            +{recovery} periods
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="xs"
                            variant={isNotified ? "secondary" : "default"}
                            disabled={isNotified}
                            onClick={() => handleNotify(st.studentId)}
                            className="text-[11px]"
                          >
                            {isNotified ? (
                              <span className="flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" /> Sent
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> Send Notice
                              </span>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
