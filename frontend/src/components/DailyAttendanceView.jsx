import React, { useState, useEffect } from 'react';
import {
  getDailyAttendance,
  saveDailyAttendance,
  markAllAttendance,
  getDailyCsvDownloadUrl
} from '../api';
import {
  Calendar,
  CheckCheck,
  XCircle,
  Save,
  Download,
  AlertCircle,
  Check
} from 'lucide-react';

export default function DailyAttendanceView({ selectedDept, departments }) {
  // Default to the preview date in October 2026 or today
  const [date, setDate] = useState('2026-10-14');
  const [department, setDepartment] = useState(selectedDept || 'CSE (AI & ML)');
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Fetch daily records on date or department change
  const loadDailyData = async () => {
    setLoading(true);
    setSaveSuccessMsg('');
    try {
      const data = await getDailyAttendance(date, department);
      setStudentsData(data);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to load daily attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, [date, department]);

  // Toggle a single student's period between PRESENT and ABSENT
  const togglePeriod = (studentId, periodNum) => {
    setStudentsData(prev =>
      prev.map(st => {
        if (st.studentId !== studentId) return st;
        const current = st.periods[periodNum];
        // Toggle PRESENT -> ABSENT -> PRESENT (defaulting to PRESENT if unmarked)
        const nextStatus = current === 'PRESENT' ? 'ABSENT' : 'PRESENT';
        const updatedPeriods = { ...st.periods, [periodNum]: nextStatus };

        // Recalculate present and absent count for this student
        let present = 0;
        let absent = 0;
        for (let p = 1; p <= 7; p++) {
          if (updatedPeriods[p] === 'PRESENT') present++;
          else if (updatedPeriods[p] === 'ABSENT') absent++;
        }

        return {
          ...st,
          periods: updatedPeriods,
          presentCount: present,
          absentCount: absent
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg('');
  };

  // Mark all periods for a specific student as Present or Absent
  const markStudentAll = (studentId, status) => {
    setStudentsData(prev =>
      prev.map(st => {
        if (st.studentId !== studentId) return st;
        const updatedPeriods = {};
        for (let p = 1; p <= 7; p++) {
          updatedPeriods[p] = status;
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: status === 'PRESENT' ? 7 : 0,
          absentCount: status === 'ABSENT' ? 7 : 0
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg('');
  };

  // Mark entire class as Present
  const handleMarkAllClassPresent = () => {
    setStudentsData(prev =>
      prev.map(st => {
        const updatedPeriods = {};
        for (let p = 1; p <= 7; p++) {
          updatedPeriods[p] = 'PRESENT';
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: 7,
          absentCount: 0
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg('');
  };

  // Mark entire class as Absent
  const handleMarkAllClassAbsent = () => {
    setStudentsData(prev =>
      prev.map(st => {
        const updatedPeriods = {};
        for (let p = 1; p <= 7; p++) {
          updatedPeriods[p] = 'ABSENT';
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: 0,
          absentCount: 7
        };
      })
    );
    setHasUnsavedChanges(true);
    setSaveSuccessMsg('');
  };

  // Mark a specific period column (P1..P7) for everyone
  const handleToggleColumn = (periodNum) => {
    // Check if majority are already PRESENT
    const presentCount = studentsData.filter(s => s.periods[periodNum] === 'PRESENT').length;
    const targetStatus = presentCount > studentsData.length / 2 ? 'ABSENT' : 'PRESENT';

    setStudentsData(prev =>
      prev.map(st => {
        const updatedPeriods = { ...st.periods, [periodNum]: targetStatus };
        let present = 0;
        let absent = 0;
        for (let p = 1; p <= 7; p++) {
          if (updatedPeriods[p] === 'PRESENT') present++;
          else if (updatedPeriods[p] === 'ABSENT') absent++;
        }
        return {
          ...st,
          periods: updatedPeriods,
          presentCount: present,
          absentCount: absent
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        date,
        department,
        records: studentsData.map(st => ({
          studentId: st.studentId,
          periods: st.periods
        }))
      };
      const updated = await saveDailyAttendance(payload);
      setStudentsData(updated);
      setHasUnsavedChanges(false);
      setSaveSuccessMsg('Attendance saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Top Banner / Breadcrumb Matching Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#52525B',
            margin: 0
          }}>
            Sample preview ·
          </h1>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#000000',
            letterSpacing: '-0.01em'
          }}>
            {department}
          </span>
        </div>

        {/* Global Save and Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasUnsavedChanges && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 10px',
              border: '1px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#000000'
            }}>
              <AlertCircle size={14} /> Unsaved Changes
            </span>
          )}

          {saveSuccessMsg && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 10px',
              backgroundColor: '#000000',
              color: '#FFFFFF'
            }}>
              <Check size={14} /> {saveSuccessMsg}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              border: '2px solid #000000',
              backgroundColor: '#000000',
              color: '#FFFFFF',
            }}
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>

          <a
            href={getDailyCsvDownloadUrl(date, department)}
            download
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: '2px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              textDecoration: 'none'
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Control Toolbar: Date picker, Dept filter & Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        border: '2px solid #000000',
        backgroundColor: '#FFFFFF',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#18181B' }}>
            Attendance date
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #000000',
            padding: '6px 12px',
            backgroundColor: '#FFFFFF'
          }}>
            <Calendar size={16} style={{ marginRight: '8px' }} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                backgroundColor: 'transparent'
              }}
            />
          </div>

          {/* Quick Date Presets */}
          <button
            onClick={() => setDate('2026-10-14')}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              border: '1px solid #71717A',
              backgroundColor: date === '2026-10-14' ? '#000000' : '#FFFFFF',
              color: date === '2026-10-14' ? '#FFFFFF' : '#000000'
            }}
          >
            14/10/26 (Preview)
          </button>

          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDate(today);
            }}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              border: '1px solid #71717A',
              backgroundColor: '#FFFFFF',
              color: '#000000'
            }}
          >
            Today
          </button>
        </div>

        {/* Department Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Department:</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '2px solid #000000',
              fontWeight: 600,
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              outline: 'none'
            }}
          >
            {departments && departments.length > 0 ? (
              departments.map(d => <option key={d} value={d}>{d}</option>)
            ) : (
              <option value="CSE (AI & ML)">CSE (AI & ML)</option>
            )}
            <option value="ALL">All Departments</option>
          </select>
        </div>

        {/* Legend Exactly As Displayed In User Screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            border: '2px solid #000000',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <span>P — Present</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            border: '2px solid #000000',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)'
          }}>
            <span>A — Absent</span>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#F4F4F5',
        border: '1px solid #000000',
        borderBottom: 'none',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
            Class Bulk Actions:
          </span>
          <button
            onClick={handleMarkAllClassPresent}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid #000000',
              backgroundColor: '#000000',
              color: '#FFFFFF'
            }}
          >
            <CheckCheck size={14} /> Mark All Present
          </button>
          <button
            onClick={handleMarkAllClassAbsent}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#000000'
            }}
          >
            <XCircle size={14} /> Mark All Absent
          </button>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#52525B' }}>
          Showing <strong>{studentsData.length}</strong> students · Click any period cell (P1-P7) to toggle status
        </div>
      </div>

      {/* Attendance Table */}
      <div style={{ overflowX: 'auto', border: '2px solid #000000' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Roll No.</th>
              <th style={{ width: '220px' }}>Student</th>
              {[1, 2, 3, 4, 5, 6, 7].map(period => (
                <th
                  key={period}
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    width: '64px',
                    userSelect: 'none'
                  }}
                  title={`Click to toggle all students for Period ${period}`}
                  onClick={() => handleToggleColumn(period)}
                >
                  P{period}
                  <span style={{ display: 'block', fontSize: '9px', fontWeight: 400, opacity: 0.8 }}>
                    toggle
                  </span>
                </th>
              ))}
              <th style={{ textAlign: 'center', width: '120px' }}>Present / Total</th>
              <th style={{ textAlign: 'right', width: '160px' }}>Row Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)' }}>
                  Loading attendance matrix...
                </td>
              </tr>
            ) : studentsData.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px' }}>
                  No students found in {department}. Please add students or click 'Reload Demo Data'.
                </td>
              </tr>
            ) : (
              studentsData.map((st) => (
                <tr key={st.studentId}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}>
                    {st.rollNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {st.name}
                  </td>

                  {/* Periods 1 through 7 */}
                  {[1, 2, 3, 4, 5, 6, 7].map(period => {
                    const status = st.periods ? st.periods[period] : null;
                    const isPresent = status === 'PRESENT';
                    const isAbsent = status === 'ABSENT';

                    return (
                      <td
                        key={period}
                        style={{ textAlign: 'center', padding: '6px' }}
                      >
                        <button
                          type="button"
                          onClick={() => togglePeriod(st.studentId, period)}
                          className={isPresent ? 'badge-present' : isAbsent ? 'badge-absent' : 'badge-empty'}
                          title={`Click to toggle Period ${period} (${status || 'Unmarked'})`}
                        >
                          {isPresent ? 'P' : isAbsent ? 'A' : '-'}
                        </button>
                      </td>
                    );
                  })}

                  {/* Present / Absent Count Indicator */}
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    <strong>{st.presentCount}</strong> / 7
                    <span style={{ color: '#71717A', marginLeft: '6px', fontSize: '11px' }}>
                      ({st.absentCount} A)
                    </span>
                  </td>

                  {/* Row Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => markStudentAll(st.studentId, 'PRESENT')}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: '1px solid #000000',
                          backgroundColor: '#000000',
                          color: '#FFFFFF'
                        }}
                      >
                        All P
                      </button>
                      <button
                        type="button"
                        onClick={() => markStudentAll(st.studentId, 'ABSENT')}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          border: '1px solid #000000',
                          backgroundColor: '#FFFFFF',
                          color: '#000000'
                        }}
                      >
                        All A
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {studentsData.length > 0 && (
            <tfoot>
              <tr style={{ backgroundColor: '#F4F4F5', borderTop: '2px solid #000000', fontWeight: 700 }}>
                <td colSpan={2} style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', textTransform: 'uppercase' }}>
                  Class Attendance / Period:
                </td>
                {[1, 2, 3, 4, 5, 6, 7].map(period => {
                  const presentInP = studentsData.filter(s => s.periods && s.periods[period] === 'PRESENT').length;
                  const totalInP = studentsData.length;
                  const pct = totalInP > 0 ? Math.round((presentInP / totalInP) * 100) : 0;
                  return (
                    <td key={period} style={{ textAlign: 'center', padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      <div><strong>{presentInP}</strong>/{totalInP}</div>
                      <div style={{ fontSize: '10px', color: '#52525B' }}>{pct}%</div>
                    </td>
                  );
                })}
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {(() => {
                    const totalP = studentsData.reduce((acc, s) => acc + (s.presentCount || 0), 0);
                    const totalSlots = studentsData.length * 7;
                    const dayPct = totalSlots > 0 ? ((totalP / totalSlots) * 100).toFixed(1) : 0;
                    return (
                      <div>
                        <strong>{totalP}</strong>/{totalSlots}
                        <div style={{ fontSize: '10px', color: '#52525B' }}>{dayPct}% Avg</div>
                      </div>
                    );
                  })()}
                </td>
                <td style={{ textAlign: 'right', fontSize: '11px', color: '#71717A', fontFamily: 'var(--font-mono)' }}>
                  Daily Summary
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
