import React, { useState, useEffect } from 'react';
import {
  Building2,
  BookOpen,
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { academicApi } from '../api/academic.api';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export const AdminAcademic = () => {
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'subjects' | 'units'

  // Data lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  // Department Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });

  // Subject Modals
  const [subjModalOpen, setSubjModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState(null);
  const [subjForm, setSubjForm] = useState({
    name: '',
    code: '',
    department: '',
    semester: '1',
    description: '',
  });

  // Unit Modals
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    title: '',
    unitNumber: '1',
    subject: '',
    description: '',
  });

  // Deletion Dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: '', // 'dept' | 'subj' | 'unit'
    item: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initial load
  const loadDepartments = async () => {
    try {
      const res = await academicApi.getDepartments(true);
      if (res.success && res.data?.departments) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      toast.error('Failed to load departments');
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await academicApi.getSubjects({ includeInactive: true });
      if (res.success && res.data?.subjects) {
        setSubjects(res.data.subjects);
        if (!selectedSubjectId && res.data.subjects.length > 0) {
          setSelectedSubjectId(res.data.subjects[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load subjects');
    }
  };

  const loadUnits = async (subjId) => {
    if (!subjId) return;
    try {
      const res = await academicApi.getUnitsBySubject(subjId);
      if (res.success && res.data?.units) {
        setUnits(res.data.units);
      }
    } catch (err) {
      toast.error('Failed to load units');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadDepartments();
      await loadSubjects();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      loadUnits(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  // --- Department Handlers ---
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', description: '' });
    setDeptModalOpen(true);
  };

  const openEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '' });
    setDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await academicApi.updateDepartment(editingDept._id, deptForm);
        toast.success('Department updated successfully');
      } else {
        await academicApi.createDepartment(deptForm);
        toast.success('Department created successfully');
      }
      setDeptModalOpen(false);
      loadDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  };

  // --- Subject Handlers ---
  const openAddSubj = () => {
    setEditingSubj(null);
    setSubjForm({
      name: '',
      code: '',
      department: departments[0]?._id || '',
      semester: '1',
      description: '',
    });
    setSubjModalOpen(true);
  };

  const openEditSubj = (subj) => {
    setEditingSubj(subj);
    setSubjForm({
      name: subj.name,
      code: subj.code,
      department: subj.department?._id || subj.department,
      semester: subj.semester.toString(),
      description: subj.description || '',
    });
    setSubjModalOpen(true);
  };

  const handleSaveSubj = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...subjForm,
        semester: parseInt(subjForm.semester, 10),
      };
      if (editingSubj) {
        await academicApi.updateSubject(editingSubj._id, payload);
        toast.success('Subject updated successfully');
      } else {
        await academicApi.createSubject(payload);
        toast.success('Subject created successfully');
      }
      setSubjModalOpen(false);
      loadSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    }
  };

  // --- Unit Handlers ---
  const openAddUnit = () => {
    setEditingUnit(null);
    setUnitForm({
      title: '',
      unitNumber: (units.length + 1).toString(),
      subject: selectedSubjectId || subjects[0]?._id || '',
      description: '',
    });
    setUnitModalOpen(true);
  };

  const openEditUnit = (u) => {
    setEditingUnit(u);
    setUnitForm({
      title: u.title,
      unitNumber: u.unitNumber.toString(),
      subject: u.subject?._id || u.subject,
      description: u.description || '',
    });
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...unitForm,
        unitNumber: parseInt(unitForm.unitNumber, 10),
      };
      if (editingUnit) {
        await academicApi.updateUnit(editingUnit._id, payload);
        toast.success('Unit updated successfully');
      } else {
        await academicApi.createUnit(payload.subject, payload);
        toast.success('Unit created successfully');
      }
      setUnitModalOpen(false);
      loadUnits(selectedSubjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save unit');
    }
  };

  // --- Deletion Flow ---
  const executeDelete = async () => {
    const { type, item } = deleteDialog;
    if (!item) return;

    try {
      setDeleteLoading(true);
      if (type === 'dept') {
        await academicApi.deleteDepartment(item._id);
        toast.success('Department deleted');
        loadDepartments();
      } else if (type === 'subj') {
        await academicApi.deleteSubject(item._id);
        toast.success('Subject deleted');
        loadSubjects();
      } else if (type === 'unit') {
        await academicApi.deleteUnit(item._id);
        toast.success('Unit deleted');
        loadUnits(selectedSubjectId);
      }
      setDeleteDialog({ isOpen: false, type: '', item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete item due to dependent records');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Academic Hierarchy Management
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure Departments, Semester-wise Subjects, and Unit syllabus modules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'units'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Unit Modules</span>
        </button>
      </div>

      {/* DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">All Academic Departments</h3>
            <Button size="sm" variant="primary" icon={Plus} onClick={openAddDept}>
              Add Department
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {departments.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{d.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{d.description || '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.isActive} type="active" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditDept(d)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Edit Department"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteDialog({ isOpen: true, type: 'dept', item: d })
                        }
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">All Curriculum Subjects</h3>
            <Button size="sm" variant="primary" icon={Plus} onClick={openAddSubj}>
              Add Subject
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {subjects.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4">{s.department?.name || '—'}</td>
                    <td className="py-3 px-4 font-semibold">Semester {s.semester}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditSubj(s)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Edit Subject"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteDialog({ isOpen: true, type: 'subj', item: s })
                        }
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNITS TAB */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase">Select Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 shadow-2xs"
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} — {s.name} (Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            <Button size="sm" variant="primary" icon={Plus} onClick={openAddUnit}>
              Add Unit to Subject
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Unit #</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {units.length > 0 ? (
                  units.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-indigo-600">Unit {u.unitNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{u.title}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-md truncate">{u.description || '—'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditUnit(u)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Edit Unit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({ isOpen: true, type: 'unit', item: u })
                          }
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No units defined for this subject yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <Input
            label="Department Code (e.g. CE, IT)"
            value={deptForm.code}
            onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            required
          />
          <Input
            label="Department Full Name"
            value={deptForm.name}
            onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        isOpen={subjModalOpen}
        onClose={() => setSubjModalOpen(false)}
        title={editingSubj ? 'Edit Subject' : 'Create New Subject'}
      >
        <form onSubmit={handleSaveSubj} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={subjForm.department}
              onChange={(e) => setSubjForm((p) => ({ ...p, department: e.target.value }))}
              options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
              required
            />
            <Select
              label="Semester"
              value={subjForm.semester}
              onChange={(e) => setSubjForm((p) => ({ ...p, semester: e.target.value }))}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s.toString(), label: `Semester ${s}` }))}
              required
            />
          </div>
          <Input
            label="Subject Code (e.g. CS501)"
            value={subjForm.code}
            onChange={(e) => setSubjForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            required
          />
          <Input
            label="Subject Name"
            value={subjForm.name}
            onChange={(e) => setSubjForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setSubjModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Unit Modal */}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title={editingUnit ? 'Edit Unit' : 'Create New Unit'}
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <Input
            label="Unit Number (e.g. 1, 2, 3)"
            type="number"
            min="1"
            max="20"
            value={unitForm.unitNumber}
            onChange={(e) => setUnitForm((p) => ({ ...p, unitNumber: e.target.value }))}
            required
          />
          <Input
            label="Unit Title"
            value={unitForm.title}
            onChange={(e) => setUnitForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. CPU Scheduling and Process Synchronization"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={unitForm.description}
              onChange={(e) => setUnitForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setUnitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: '', item: null })}
        onConfirm={executeDelete}
        isLoading={deleteLoading}
        title="Confirm Academic Entity Deletion"
        message={`Are you sure you want to delete ${deleteDialog.item?.name || deleteDialog.item?.title || 'this item'}? The operation will be rejected if existing subjects or resources depend on it.`}
        confirmText="Delete"
      />
    </div>
  );
};
