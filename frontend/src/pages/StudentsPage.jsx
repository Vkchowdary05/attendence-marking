import React, { useState, useEffect } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent, bulkCreateStudents } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";
import {
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Check,
  AlertCircle,
  Users
} from "lucide-react";

export default function StudentsPage({ selectedDept, departments, onRefreshDepts }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState(selectedDept || "ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    rollNumber: "",
    name: "",
    department: "CSE (AI & ML)",
    semester: 5,
    email: "",
    phone: "",
  });
  const [bulkText, setBulkText] = useState(
    "111, Arun Kumar, CSE (AI & ML)\n112, Bhavna Rao, CSE (AI & ML)\n113, Chetan Das, CSE (AI & ML)"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents(department);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
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
      rollNumber: "",
      name: "",
      department: department !== "ALL" ? department : "CSE (AI & ML)",
      semester: 5,
      email: "",
      phone: "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (st) => {
    setEditingStudent(st);
    setFormData({
      rollNumber: st.rollNumber,
      name: st.name,
      department: st.department,
      semester: st.semester || 5,
      email: st.email || "",
      phone: st.phone || "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
        setSuccessMessage("Student updated successfully!");
      } else {
        await createStudent(formData);
        setSuccessMessage("Student registered successfully!");
      }
      setIsModalOpen(false);
      loadStudents();
      if (onRefreshDepts) onRefreshDepts();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message || "Operation failed.");
    }
  };

  const handleDelete = async (id, name, roll) => {
    if (window.confirm(`Delete ${name} (${roll}) and associated attendance records?`)) {
      try {
        await deleteStudent(id);
        setSuccessMessage("Student deleted successfully.");
        loadStudents();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        alert("Failed to delete student.");
      }
    }
  };

  const handleBulkImport = async () => {
    try {
      const lines = bulkText.split("\n");
      const list = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          list.push({
            rollNumber: parts[0],
            name: parts[1],
            department: parts[2] || (department !== "ALL" ? department : "CSE (AI & ML)"),
            semester: 5,
          });
        }
      }
      if (list.length === 0) {
        alert("Please enter at least one valid line in format: Roll, Name, Department");
        return;
      }
      await bulkCreateStudents(list);
      setSuccessMessage(`Successfully imported ${list.length} students!`);
      setIsBulkModalOpen(false);
      loadStudents();
      if (onRefreshDepts) onRefreshDepts();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert("Bulk import failed: " + (err.response?.data?.error || err.message));
    }
  };

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.rollNumber.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Student Roster Management
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Register students, manage rolls, and configure department rosters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkModalOpen(true)}
            className="text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Bulk CSV Import
          </Button>

          <Button size="sm" onClick={openAddModal} className="text-xs font-bold">
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Register Student
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-zinc-950 text-white rounded-md text-xs font-semibold shadow-sm">
          <Check className="h-4 w-4 text-emerald-400" /> {successMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-600">Department:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-8 px-2.5 text-xs font-semibold rounded-md border border-zinc-300 bg-white"
            >
              <option value="ALL">All Departments</option>
              {departments &&
                departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search roll number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-md border border-zinc-300 w-64 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Data Table */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-left caption-bottom text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-950 text-white text-xs font-semibold">
              <th className="p-3 w-28">Roll No.</th>
              <th className="p-3">Student Full Name</th>
              <th className="p-3">Department</th>
              <th className="p-3 text-center w-28">Semester</th>
              <th className="p-3">Email Address</th>
              <th className="p-3 text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs font-mono text-zinc-500">
                  Retrieving student database records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-zinc-500">
                  No registered students found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/70">
                  <td className="p-3 font-mono font-bold text-xs text-zinc-950">
                    {s.rollNumber}
                  </td>
                  <td className="p-3 font-semibold text-xs text-zinc-900">
                    {s.name}
                  </td>
                  <td className="p-3 text-xs text-zinc-600">
                    {s.department}
                  </td>
                  <td className="p-3 text-center font-mono text-xs text-zinc-700">
                    Sem {s.semester || 5}
                  </td>
                  <td className="p-3 font-mono text-xs text-zinc-500">
                    {s.email || "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => openEditModal(s)}
                        className="text-[11px] h-7"
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => handleDelete(s.id, s.name, s.rollNumber)}
                        className="text-[11px] h-7"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student Details" : "Register New Student"}
            </DialogTitle>
            <DialogDescription>
              Enter accurate student credentials for attendance recording and transcripts.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 bg-zinc-950 text-white rounded text-xs mb-3 font-mono">
              <AlertCircle className="h-4 w-4" /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Roll Number *
              </label>
              <Input
                required
                placeholder="e.g. 101, 102, 22CS101"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Student Full Name *
              </label>
              <Input
                required
                placeholder="e.g. Arun Kumar, Student 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Department *
              </label>
              <Input
                required
                placeholder="e.g. CSE (AI & ML)"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Semester
                </label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Phone Number
                </label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                {editingStudent ? "Save Changes" : "Register Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk CSV Import Dialog */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent onClose={() => setIsBulkModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Bulk CSV / Text Roster Import</DialogTitle>
            <DialogDescription>
              Paste comma-separated rows: <code>Roll Number, Student Name, Department</code>
            </DialogDescription>
          </DialogHeader>

          <textarea
            rows={7}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full p-2.5 rounded-md border border-zinc-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBulkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleBulkImport} className="font-bold">
              Import All Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
