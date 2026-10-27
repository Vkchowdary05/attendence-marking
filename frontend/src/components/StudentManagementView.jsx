import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, bulkCreateStudents } from '../api';
import { UserPlus, Edit2, Trash2, Search, Check, AlertCircle, X, Upload } from 'lucide-react';

export default function StudentManagementView({ selectedDept, departments, onRefreshDepts }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(selectedDept || 'ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState(
    "111, Arun Kumar, CSE (AI & ML)\n112, Bhavna Rao, CSE (AI & ML)\n113, Chetan Das, CSE (AI & ML)"
  );
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    department: 'CSE (AI & ML)',
    semester: 5,
    email: '',
    phone: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents(department);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [department]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      rollNumber: '',
      name: '',
      department: department !== 'ALL' ? department : 'CSE (AI & ML)',
      semester: 5,
      email: '',
      phone: ''
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (st) => {
    setEditingStudent(st);
    setFormData({
      rollNumber: st.rollNumber,
      name: st.name,
      department: st.department,
      semester: st.semester || 5,
      email: st.email || '',
      phone: st.phone || ''
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        setSuccessMessage('Student updated successfully!');
      } else {
        await createStudent(formData);
        setSuccessMessage('Student created successfully!');
      }
      setIsModalOpen(false);
      loadStudents();
      if (onRefreshDepts) onRefreshDepts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Action failed';
      setErrorMessage(msg);
    }
  };

  const handleDelete = async (id, name, roll) => {
    if (window.confirm(`Are you sure you want to delete ${name} (${roll})? This will also remove all their attendance records.`)) {
      try {
        await deleteStudent(id);
        setSuccessMessage('Student deleted successfully');
        loadStudents();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  const handleBulkImport = async () => {
    try {
      const lines = bulkText.split('\n');
      const list = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 2) {
          list.push({
            rollNumber: parts[0],
            name: parts[1],
            department: parts[2] || (department !== 'ALL' ? department : 'CSE (AI & ML)'),
            semester: 5
          });
        }
      }
      if (list.length === 0) {
        alert('Please enter at least one valid line in format: Roll, Name, Department');
        return;
      }
      await bulkCreateStudents(list);
      setSuccessMessage(`Successfully imported ${list.length} students!`);
      setIsBulkModalOpen(false);
      loadStudents();
      if (onRefreshDepts) onRefreshDepts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Bulk import failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const filtered = students.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.rollNumber.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      {/* Title & Add Student Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Student Management System
          </h1>
          <div style={{ fontSize: '13px', color: '#52525B', marginTop: '4px' }}>
            Register students, manage rolls, and configure department rosters
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              border: '2px solid #000000',
              backgroundColor: '#FFFFFF',
              color: '#000000'
            }}
          >
            <Upload size={15} />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              border: '2px solid #000000',
              backgroundColor: '#000000',
              color: '#FFFFFF'
            }}
          >
            <UserPlus size={16} />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#000000',
          color: '#FFFFFF',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} /> {successMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        border: '2px solid #000000',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700 }}>Department:</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '2px solid #000000',
              fontWeight: 600,
              fontSize: '13px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="ALL">All Departments</option>
            {departments && departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '2px solid #000000',
          padding: '6px 12px',
          backgroundColor: '#FFFFFF'
        }}>
          <Search size={15} style={{ marginRight: '8px', color: '#71717A' }} />
          <input
            type="text"
            placeholder="Search roll number or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              width: '260px'
            }}
          />
        </div>
      </div>

      {/* Students Table */}
      <div style={{ overflowX: 'auto', border: '2px solid #000000' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Roll No.</th>
              <th style={{ width: '240px' }}>Student Name</th>
              <th style={{ width: '200px' }}>Department</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Semester</th>
              <th style={{ width: '220px' }}>Email</th>
              <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)' }}>
                  Loading student directory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {s.rollNumber}
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.department}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    Sem {s.semester || 5}
                  </td>
                  <td style={{ fontSize: '13px', color: '#52525B', fontFamily: 'var(--font-mono)' }}>
                    {s.email || '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(s)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #000000',
                          backgroundColor: '#FFFFFF',
                          color: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name, s.rollNumber)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #000000',
                          backgroundColor: '#000000',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
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
            maxWidth: '520px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #000000',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '4px', border: '1px solid #000000', backgroundColor: '#FFFFFF' }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div style={{
                padding: '10px',
                border: '1px solid #000000',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={14} /> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, 102, 22CS101"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #000000',
                    fontSize: '14px',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student 1, Arun Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #000000',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Department *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE (AI & ML), Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #000000',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #000000',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #000000',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #000000',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #000000',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    border: '2px solid #000000',
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  {editingStudent ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isBulkModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
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
            maxWidth: '560px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #000000',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                Bulk CSV / Text Student Import
              </h2>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                style={{ padding: '4px', border: '1px solid #000000', backgroundColor: '#FFFFFF' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#52525B', marginBottom: '12px' }}>
              Paste comma-separated rows. Format: <code>Roll Number, Student Name, Department</code>
            </div>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #000000',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #000000',
                  backgroundColor: '#FFFFFF',
                  color: '#000000',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                style={{
                  padding: '8px 20px',
                  border: '2px solid #000000',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                Import All Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
