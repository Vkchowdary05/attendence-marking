import React from 'react';
import { Calendar, FileText, Users, Terminal, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onResetData, isResetting }) {
  return (
    <header style={{
      borderBottom: '2px solid #000000',
      backgroundColor: '#FFFFFF',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        flexWrap: 'wrap'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '18px',
            padding: '6px 12px',
            letterSpacing: '0.08em',
            border: '2px solid #000000'
          }}>
            AMS
          </div>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              STUDENT ATTENDANCE SYSTEM
            </div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#52525B',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              7-Period Matrix • DevOps Integrated
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('daily')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              border: '2px solid #000000',
              backgroundColor: activeTab === 'daily' ? '#000000' : '#FFFFFF',
              color: activeTab === 'daily' ? '#FFFFFF' : '#000000',
            }}
          >
            <Calendar size={16} />
            <span>Daily Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              border: '2px solid #000000',
              backgroundColor: activeTab === 'monthly' ? '#000000' : '#FFFFFF',
              color: activeTab === 'monthly' ? '#FFFFFF' : '#000000',
            }}
          >
            <FileText size={16} />
            <span>Monthly Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              border: '2px solid #000000',
              backgroundColor: activeTab === 'students' ? '#000000' : '#FFFFFF',
              color: activeTab === 'students' ? '#FFFFFF' : '#000000',
            }}
          >
            <Users size={16} />
            <span>Students</span>
          </button>

          <button
            onClick={() => setActiveTab('devops')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              border: '2px solid #000000',
              backgroundColor: activeTab === 'devops' ? '#000000' : '#FFFFFF',
              color: activeTab === 'devops' ? '#FFFFFF' : '#000000',
            }}
          >
            <Terminal size={16} />
            <span>DevOps Pipeline</span>
          </button>
        </nav>

        {/* Quick Sample Reset & Live Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onResetData}
            disabled={isResetting}
            title="Reset to sample preview data (CSE AI&ML Oct 2026)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              border: '1px solid #71717A',
              backgroundColor: '#FFFFFF',
              color: '#000000',
            }}
          >
            <RefreshCw size={13} />
            <span>{isResetting ? 'Resetting...' : 'Reload Demo Data'}</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            padding: '6px 10px',
            border: '1px solid #000000',
            backgroundColor: '#000000',
            color: '#FFFFFF'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#22C55E'
            }}></span>
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
