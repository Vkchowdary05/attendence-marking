import React, { useState, useEffect } from 'react';
import { getStudentMonthlyDetail } from '../api';
import { X, Calendar, User, Award, AlertCircle } from 'lucide-react';

export default function StudentDetailModal({ studentId, year, month, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentMonthlyDetail(studentId, year, month)
      .then(data => setDetail(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId, year, month]);

  if (!studentId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '3px solid #000000',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '2px solid #000000',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#52525B', textTransform: 'uppercase' }}>
              Student Individual Attendance Dossier
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0 0' }}>
              {detail ? `${detail.name} (Roll: ${detail.rollNumber})` : 'Loading...'}
            </h2>
            <div style={{ fontSize: '13px', color: '#71717A', marginTop: '2px' }}>
              {detail?.department} · Academic Month {month}/{year}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              border: '2px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)' }}>
            Retrieving period-wise monthly breakdown...
          </div>
        ) : detail ? (
          <div>
            {/* KPI Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ border: '2px solid #000000', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#52525B' }}>Working Periods</div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{detail.workingPeriods}</div>
              </div>
              <div style={{ border: '2px solid #000000', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#52525B' }}>Periods Attended</div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{detail.present}</div>
              </div>
              <div style={{ border: '2px solid #000000', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#52525B' }}>Periods Absent</div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{detail.absent}</div>
              </div>
              <div style={{
                border: '2px solid #000000',
                padding: '12px',
                textAlign: 'center',
                backgroundColor: detail.attendancePercentage < 75 ? '#000000' : '#FFFFFF',
                color: detail.attendancePercentage < 75 ? '#FFFFFF' : '#000000'
              }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>Attendance Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {detail.attendancePercentage.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Daily History Breakdown Table */}
            <div style={{ border: '2px solid #000000', overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>P1</th>
                    <th style={{ textAlign: 'center' }}>P2</th>
                    <th style={{ textAlign: 'center' }}>P3</th>
                    <th style={{ textAlign: 'center' }}>P4</th>
                    <th style={{ textAlign: 'center' }}>P5</th>
                    <th style={{ textAlign: 'center' }}>P6</th>
                    <th style={{ textAlign: 'center' }}>P7</th>
                    <th style={{ textAlign: 'right' }}>Present</th>
                    <th style={{ textAlign: 'right' }}>Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.dailyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>
                        No records recorded for this month.
                      </td>
                    </tr>
                  ) : (
                    detail.dailyRecords.map(d => (
                      <tr key={d.date}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.date}</td>
                        {[1, 2, 3, 4, 5, 6, 7].map(p => {
                          const status = d.periods[p];
                          const isP = status === 'PRESENT';
                          const isA = status === 'ABSENT';
                          return (
                            <td key={p} style={{ textAlign: 'center', padding: '4px' }}>
                              <span className={isP ? 'badge-present' : isA ? 'badge-absent' : 'badge-empty'}>
                                {isP ? 'P' : isA ? 'A' : '-'}
                              </span>
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {d.present}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {d.absent}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px',
                  border: '2px solid #000000',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        ) : (
          <div>Failed to load student details.</div>
        )}
      </div>
    </div>
  );
}
