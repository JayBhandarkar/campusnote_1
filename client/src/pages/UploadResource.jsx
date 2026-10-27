import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { resourcesApi } from '../api/resources.api';
import { academicApi } from '../api/academic.api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const UploadResource = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form Fields
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('1');
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [resourceType, setResourceType] = useState('Notes');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [tags, setTags] = useState('');

  // Dependent dropdown lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  // Upload progress & duplicate handling
  const [uploading, setUploading] = useState(false);
  const [duplicateConflict, setDuplicateConflict] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // 1. Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await academicApi.getDepartments();
        if (res.success && res.data?.departments) {
          setDepartments(res.data.departments);
          if (res.data.departments.length > 0) {
            setDepartment(res.data.departments[0]._id);
          }
        }
      } catch (err) {
        toast.error('Failed to load academic departments');
      }
    };
    fetchDepartments();
  }, []);

  // 2. Dependent Dropdown: When department or semester changes, load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!department) {
        setSubjects([]);
        setSubject('');
        return;
      }
      try {
        const res = await academicApi.getSubjects({ department, semester });
        if (res.success && res.data?.subjects) {
          setSubjects(res.data.subjects);
          if (res.data.subjects.length > 0) {
            setSubject(res.data.subjects[0]._id);
          } else {
            setSubject('');
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, [department, semester]);

  // 3. Dependent Dropdown: When subject changes, load units
  useEffect(() => {
    const fetchUnits = async () => {
      if (!subject) {
        setUnits([]);
        setUnit('');
        return;
      }
      try {
        const res = await academicApi.getUnitsBySubject(subject);
        if (res.success && res.data?.units) {
          setUnits(res.data.units);
          if (res.data.units.length > 0) {
            setUnit(res.data.units[0]._id);
          } else {
            setUnit('');
          }
        }
      } catch (err) {
        console.error('Failed to load units:', err);
      }
    };
    fetchUnits();
  }, [subject]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      toast.error('Only PDF, PPT, PPTX, DOC, and DOCX files are allowed');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds maximum limit of 20 MB');
      return;
    }

    setFile(selectedFile);
    setDuplicateConflict(null);
    if (!title) {
      // Auto-suggest clean title from file name
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!department || !subject || !unit) {
      toast.error('Please complete the academic hierarchy (Department, Semester, Subject, Unit)');
      return;
    }

    try {
      setUploading(true);
      setDuplicateConflict(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('department', department);
      formData.append('semester', semester);
      formData.append('subject', subject);
      formData.append('unit', unit);
      formData.append('resourceType', resourceType);
      formData.append('academicYear', academicYear);
      formData.append('tags', tags);

      const res = await resourcesApi.uploadResource(formData);

      toast.success('Resource uploaded successfully!');
      navigate(`/resources/${res.data.resource._id}`);
    } catch (err) {
      // Handle 409 Conflict Duplicate detection
      if (err.response?.status === 409 && err.response?.data?.data?.existingResourceId) {
        setDuplicateConflict({
          message: err.response.data.message || 'This file has already been uploaded.',
          existingResourceId: err.response.data.data.existingResourceId,
        });
        toast.error('Duplicate file detected! This document already exists on CampusNotes.');
      } else {
        toast.error(err.response?.data?.message || 'Upload failed. Please check form inputs.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Upload Academic Material
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Share high quality lecture notes, question papers, and lab manuals organized by unit module.
        </p>
      </div>

      {/* Duplicate Conflict Alert Banner */}
      {duplicateConflict && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">SHA-256 Duplicate Check Triggered</h4>
              <p className="text-xs text-amber-800">{duplicateConflict.message}</p>
            </div>
          </div>
          <Link
            to={`/resources/${duplicateConflict.existingResourceId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs whitespace-nowrap"
          >
            <span>View Existing Resource</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Dropzone */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            File Document *
          </label>

          {file ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drag and drop your document
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: PDF, PPT, PPTX, DOC, DOCX (Max 20 MB)
              </p>
            </div>
          )}
        </div>

        {/* Academic Hierarchy Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <span>Academic Hierarchy</span>
            <span className="text-[10px] text-indigo-600 lowercase font-medium">
              (Dept → Sem → Subject → Unit)
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="1. Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={departments.map((d) => ({
                value: d._id,
                label: `${d.name} (${d.code})`,
              }))}
              required
            />

            <Select
              label="2. Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                value: s,
                label: `Semester ${s}`,
              }))}
              required
            />

            <Select
              label="3. Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={subjects.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.code})`,
              }))}
              placeholder={subjects.length === 0 ? 'No subjects in this semester' : 'Select subject'}
              disabled={subjects.length === 0}
              required
            />

            <Select
              label="4. Unit Module"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={units.map((u) => ({
                value: u._id,
                label: `Unit ${u.unitNumber}: ${u.title}`,
              }))}
              placeholder={units.length === 0 ? 'No units for this subject' : 'Select unit'}
              disabled={units.length === 0}
              required
            />
          </div>
        </div>

        {/* Material Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
            Material Details & Classification
          </h3>

          <Input
            label="Resource Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Operating Systems Unit 3 Process Synchronization Notes"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Resource Type *"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              options={[
                'Notes',
                'PPT',
                'Assignment',
                'Lab Manual',
                'Question Bank',
                'Previous Year Paper',
                'Important Questions',
              ]}
              required
            />

            <Select
              label="Academic Year *"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              options={['2025-2026', '2024-2025', '2023-2024', '2022-2023']}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Summary (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline syllabus topics covered, reference textbooks, or faculty name..."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <Input
            label="Tags & Keywords (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. CPU Scheduling, Mutex, Semaphores, Unit 3"
            helperText="Tags allow students to discover this material in global search."
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={uploading}
            icon={Upload}
          >
            Upload & Publish Material
          </Button>
        </div>
      </form>
    </div>
  );
};
