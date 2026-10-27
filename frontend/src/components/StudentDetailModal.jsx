import React, { useState, useEffect } from "react";
import { getStudentMonthlyDetail } from "../api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { AlertTriangle, CheckCircle2, Calendar } from "lucide-react";

export default function StudentDetailModal({ studentId, year, month, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentMonthlyDetail(studentId, year, month)
      .then((data) => setDetail(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId, year, month]);

  if (!studentId) return null;

  return (
    <Dialog open={Boolean(studentId)} onOpenChange={() => onClose()}>
      <DialogContent onClose={onClose} className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                Student Attendance Dossier
              </div>
              <DialogTitle className="text-xl mt-1">
                {detail ? `${detail.name} (Roll: ${detail.rollNumber})` : "Loading..."}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                {detail?.department} · Academic Month {month}/{year}
              </DialogDescription>
            </div>
            {detail && (
              <Badge variant={detail.attendancePercentage < 75 ? "defaulter" : "default"}>
                {detail.attendancePercentage.toFixed(2)}% Attendance
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            Retrieving day-by-day attendance history...
          </div>
        ) : detail ? (
          <div className="space-y-4">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="border border-zinc-200 rounded-md p-2.5 text-center bg-zinc-50">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Working</div>
                <div className="text-lg font-bold font-mono text-zinc-950">{detail.workingPeriods}</div>
              </div>
              <div className="border border-zinc-200 rounded-md p-2.5 text-center bg-zinc-50">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Present</div>
                <div className="text-lg font-bold font-mono text-zinc-950">{detail.present}</div>
              </div>
              <div className="border border-zinc-200 rounded-md p-2.5 text-center bg-zinc-50">
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Absent</div>
                <div className="text-lg font-bold font-mono text-zinc-500">{detail.absent}</div>
              </div>
              <div className="border border-zinc-950 bg-zinc-950 text-white rounded-md p-2.5 text-center">
                <div className="text-[10px] uppercase font-semibold text-zinc-300">Rate</div>
                <div className="text-lg font-bold font-mono">{detail.attendancePercentage.toFixed(2)}%</div>
              </div>
            </div>

            {/* Daily History Table */}
            <div className="border border-zinc-200 rounded-lg overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-950 text-white sticky top-0">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-center">P1</th>
                    <th className="p-2.5 text-center">P2</th>
                    <th className="p-2.5 text-center">P3</th>
                    <th className="p-2.5 text-center">P4</th>
                    <th className="p-2.5 text-center">P5</th>
                    <th className="p-2.5 text-center">P6</th>
                    <th className="p-2.5 text-center">P7</th>
                    <th className="p-2.5 text-right">Present</th>
                    <th className="p-2.5 text-right">Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {detail.dailyRecords.map((d) => (
                    <tr key={d.date} className="hover:bg-zinc-50">
                      <td className="p-2.5 font-mono font-semibold text-zinc-900">{d.date}</td>
                      {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                        const status = d.periods[p];
                        const isP = status === "PRESENT";
                        const isA = status === "ABSENT";
                        return (
                          <td key={p} className="p-2 text-center">
                            <span
                              className={`w-6 h-6 inline-flex items-center justify-center rounded font-mono font-bold text-[11px] ${
                                isP
                                  ? "bg-black text-white"
                                  : isA
                                  ? "border-2 border-black text-black bg-white"
                                  : "text-zinc-300 border border-zinc-200"
                              }`}
                            >
                              {isP ? "P" : isA ? "A" : "-"}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-right font-mono font-bold text-zinc-950">{d.present}</td>
                      <td className="p-2.5 text-right font-mono text-zinc-500">{d.absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={onClose} className="font-bold">
                Close Dossier
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
