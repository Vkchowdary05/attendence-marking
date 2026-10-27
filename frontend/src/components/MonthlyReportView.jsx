import React, { useState, useEffect } from 'react';
import { getMonthlySummary, getMonthlyCsvDownloadUrl } from '../api';
import { Download, Printer, Filter, AlertTriangle, CheckCircle, Search } from 'lucide-react';

export default function MonthlyReportView({ selectedDept, departments, onSelectStudent }) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10);
  const [department, setDepartment] = useState(selectedDept || 'CSE (AI & ML)');
  const [threshold, setThreshold] = useState(75.0);
  const [onlyDefaulters, setOnlyDefaulters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getMonthlySummary(year, month, department, threshold);
      setReport(data);
    } catch (err) {
      console.error('Failed to load monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [year, month, department, threshold]);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  // Filter rows by defaulter toggle and search query
  const displayedRows = (report?.rows || []).filter(row => {
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
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Title Bar matching screenshot */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#000000',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Sample monthly report
          </h1>
          <div style={{ fontSize: '13px', color: '#52525B', marginTop: '4px' }}>
            Academic Session 2026-2027 · {report?.monthName || 'October 2026'} · {department}
          </div>
        </div>

        {/* Export and Print Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a
            href={getMonthlyCsvDownloadUrl(year, month, department, threshold)}
            download
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              border: '2px solid #000000',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              textDecoration: 'none'
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: '2px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#000000'
            }}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          border: '2px solid #000000',
          padding: '16px',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#52525B' }}>
            Total Working Periods
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {report?.totalWorkingPeriods || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>
            {report?.totalWorkingDays || 0} working days conducted
          </div>
        </div>

        <div style={{
          border: '2px solid #000000',
          padding: '16px',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#52525B' }}>
            Class Average
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {report?.classAveragePercentage || 0}%
          </div>
          <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>
            Overall attendance rating
          </div>
        </div>

        <div style={{
          border: '2px solid #000000',
          padding: '16px',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: '#52525B' }}>
            Total Registered Students
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {report?.totalStudents || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#71717A', marginTop: '4px' }}>
            In selected department
          </div>
        </div>

        <div style={{
          border: '2px solid #000000',
          padding: '16px',
          backgroundColor: report?.defaultersCount > 0 ? '#000000' : '#FFFFFF',
          color: report?.defaultersCount > 0 ? '#FFFFFF' : '#000000'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: report?.defaultersCount > 0 ? '#D4D4D8' : '#52525B'
          }}>
            Low Attendance Defaulters
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {report?.defaultersCount || 0}
          </div>
          <div style={{
            fontSize: '11px',
            color: report?.defaultersCount > 0 ? '#A1A1AA' : '#71717A',
            marginTop: '4px'
          }}>
            Below configured threshold (&lt; {threshold}%)
          </div>
        </div>
      </div>

      {/* Filter and Configuration Bar */}
      <div style={{
        border: '2px solid #000000',
        padding: '16px',
        backgroundColor: '#F8F9FA',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Month & Year Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Month:
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Year:
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Department:
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                fontSize: '13px'
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

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Threshold Cutoff (%):
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{
                width: '80px',
                padding: '6px 10px',
                border: '1px solid #000000',
                backgroundColor: '#FFFFFF',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Search & Defaulter Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #000000',
            backgroundColor: '#FFFFFF',
            padding: '6px 10px'
          }}>
            <Search size={14} style={{ marginRight: '6px', color: '#71717A' }} />
            <input
              type="text"
              placeholder="Search roll or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                width: '180px'
              }}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={onlyDefaulters}
              onChange={(e) => setOnlyDefaulters(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#000000' }}
            />
            <span>Show Only Defaulters (&lt; {threshold}%)</span>
          </label>
        </div>
      </div>

      {/* Monthly Summary Table Matching Screenshot Exactly */}
      <div style={{ overflowX: 'auto', border: '2px solid #000000' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Roll No.</th>
              <th style={{ width: '280px' }}>Student</th>
              <th style={{ textAlign: 'right', width: '160px' }}>Working periods</th>
              <th style={{ textAlign: 'right', width: '140px' }}>Present</th>
              <th style={{ textAlign: 'right', width: '140px' }}>Absent</th>
              <th style={{ textAlign: 'right', width: '160px' }}>Attendance</th>
              <th style={{ textAlign: 'center', width: '140px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)' }}>
                  Calculating monthly totals and attendance metrics...
                </td>
              </tr>
            ) : displayedRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  No records match the current filter.
                </td>
              </tr>
            ) : (
              displayedRows.map((row) => (
                <tr
                  key={row.studentId}
                  onClick={() => onSelectStudent && onSelectStudent(row.studentId, year, month)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: row.defaulter ? '#FAFAFA' : '#FFFFFF'
                  }}
                  title="Click to view detailed day-by-day attendance history"
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {row.rollNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {row.name}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {row.workingPeriods}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {row.present}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {row.absent}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '15px'
                  }}>
                    {row.attendancePercentage.toFixed(2)}%
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.defaulter ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: '1px solid #000000',
                        backgroundColor: '#000000',
                        color: '#FFFFFF'
                      }}>
                        <AlertTriangle size={12} /> Defaulter
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: '1px solid #71717A',
                        backgroundColor: '#FFFFFF',
                        color: '#000000'
                      }}>
                        <CheckCircle size={12} /> Good
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footnote instruction */}
      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#71717A',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>* Click any student row to view individual day-by-day period attendance breakdown</span>
        <span>Cutoff Rule: Attendance &lt; {threshold}% is marked as Defaulter</span>
      </div>
    </div>
  );
}
