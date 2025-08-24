'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Suspense } from "react";
import { showError, showSuccess, showToast } from '@/utils/toastUtils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/api" || 'https://localhost:7074/api';

interface Teacher {
  teacherId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  fullname: string;
  gender: boolean;
  code: string;
  isActive: boolean;
  majorId: number | null;
  majorName: string;
  hireDate: string;
  isGraded: boolean;
  isCreateExam: boolean;
  totalPage?: number;
}

interface TeacherForm {
  phoneNumber: string;
  dateOfBirth: string;
  fullname: string;
  gender: boolean;
  isActive: boolean;
  hireDate: string;
}

interface ImportTeacherRow {
  userName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  fullname: string;
  gender: boolean;
  isActive: boolean;
  password: string;
  code: string;
  majorId: number;
  hireDate: string;
}

interface Major {
  majorId: number;
  majorName: string;
}

const excelHeaders = [
  'Tên đăng nhập', 'Email', 'Số điện thoại', 'Ngày sinh (dd/mm/yyyy)', 'Họ và tên', 'Giới tính', 'Hoạt động', 'Mã GV', 'Ngành', 'Ngày vào làm (dd/mm/yyyy)'
];

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [majors, setMajors] = useState<Major[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherForm>({
    phoneNumber: '',
    dateOfBirth: '',
    fullname: '',
    gender: true,
    isActive: true,
    hireDate: '',
  });
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importedTeachers, setImportedTeachers] = useState<ImportTeacherRow[]>([]);
  const [showImportDiv, setShowImportDiv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch majors for dropdown
  useEffect(() => {
    fetch(`${API_BASE}/Major/GetAllMajors`)
      .then(res => res.json())
      .then(setMajors)
      .catch(() => setMajors([]));
  }, []);

  // Fetch teachers with pagination and search
  const fetchTeachers = async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      let url = `${API_BASE}/Teacher?pageNumber=${page}&pageSize=10`;
      if (keyword.trim()) url += `&name=${encodeURIComponent(keyword)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      setTeachers(data);
      setTotalPage(data.length > 0 && data[0].totalPage ? data[0].totalPage : 1);
    } catch (err: any) {
      showError(err.message || 'Lỗi tải danh sách giáo viên');
      setTeachers([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(currentPage, search);
    // eslint-disable-next-line
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => {
      setCurrentPage(1);
      fetchTeachers(1, search);
    }, 800));
    // eslint-disable-next-line
  }, [search]);

  // Edit teacher: fetch detail
  const handleEdit = async (teacher: Teacher) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Teacher/${teacher.teacherId}`);
      if (!res.ok) throw new Error('Failed to fetch teacher detail');
      const data = await res.json();
      setEditingId(teacher.teacherId);
      setForm({
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
        fullname: data.fullname || '',
        gender: data.gender,
        isActive: data.isActive,
        hireDate: data.hireDate ? data.hireDate.slice(0, 10) : '',
      });
      setViewTeacher(data);
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Lỗi lấy thông tin giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Update teacher
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Teacher/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
          hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update teacher');
      showSuccess('Cập nhật giáo viên thành công');
      setShowPopup(false);
      setEditingId(null);
      fetchTeachers(currentPage, search);
    } catch (err: any) {
      showError(err.message || 'Lỗi cập nhật giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Restore teacher
  const handleRestore = async (teacherId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Teacher/Restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherId),
      });
      if (!res.ok) throw new Error('Failed to restore teacher');
      showSuccess('Khôi phục tài khoản thành công');
      fetchTeachers(currentPage, search);
    } catch (err: any) {
      showError(err.message || 'Lỗi khôi phục tài khoản');
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const handleDelete = async (teacherId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Teacher/${teacherId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete teacher');
      showSuccess('Xóa giáo viên thành công');
      fetchTeachers(currentPage, search);
    } catch (err: any) {
      showError(err.message || 'Lỗi xóa giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Download Excel template with dropdowns
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Danh sách giáo viên');
    ws.addRow(excelHeaders);

    // Add sample data
    const majorNames = majors.map(m => m.majorName);
    ws.addRow([
      'longdq', 'longdqhe173507@fpt.edu.vn', '0374752063', '29/06/2003', 'Dương Quang Long', 'Nam', 'true', 'GV001', majorNames[0] || 'CNTT', '23/08/2025'
    ]);

    // Add dropdown validations
    for (let row = 2; row <= 100; row++) {
      // Gender dropdown
      ws.getCell(`F${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`"Nam,Nữ"`]
      };
      // Active status dropdown
      ws.getCell(`G${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`"true,false"`]
      };
      // Major dropdown
      ws.getCell(`I${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`"${majorNames.join(',')}"`]
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau_giao_vien_quan_ly.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Validate dd/mm/yyyy
  function isValidDateVN(str: string) {
    const [d, m, y] = str.split('/');
    if (!d || !m || !y) return false;
    const date = new Date(`${y}-${m}-${d}`);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Import Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');
    setImportedTeachers([]);
    setShowImportDiv(false);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (json.length < 2) throw new Error('File phải có ít nhất 1 dòng dữ liệu.');
        const header = json[0];
        const isHeaderValid = excelHeaders.every((h, idx) => header[idx] === h);
        if (!isHeaderValid) throw new Error('File mẫu không đúng định dạng!');
        const dataArr: ImportTeacherRow[] = [];
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (row.length < 10) throw new Error(`Dòng ${i + 1} thiếu thông tin.`);
          if (!row[0]) throw new Error(`Dòng ${i + 1}: Thiếu tên đăng nhập`);
          if (!row[1] || !/^[\w-.]+@[\w-]+\.[\w-.]+$/.test(row[1])) throw new Error(`Dòng ${i + 1}: Email không hợp lệ`);
          if (!row[2]) throw new Error(`Dòng ${i + 1}: Thiếu số điện thoại`);
          if (!row[3] || !isValidDateVN(row[3])) throw new Error(`Dòng ${i + 1}: Ngày sinh không hợp lệ (dd/mm/yyyy)`);
          if (!row[4]) throw new Error(`Dòng ${i + 1}: Thiếu họ và tên`);
          if (row[5] !== 'Nam' && row[5] !== 'Nữ') throw new Error(`Dòng ${i + 1}: Giới tính phải là 'Nam' hoặc 'Nữ'`);
          if (row[6] !== 'true' && row[6] !== 'false') throw new Error(`Dòng ${i + 1}: Hoạt động phải là true/false`);
          if (!row[7]) throw new Error(`Dòng ${i + 1}: Thiếu mã GV`);
          const majorObj = majors.find(m => m.majorName === row[8]);
          if (!majorObj) throw new Error(`Dòng ${i + 1}: Ngành không hợp lệ`);
          if (!row[9] || !isValidDateVN(row[9])) throw new Error(`Dòng ${i + 1}: Ngày vào làm không hợp lệ (dd/mm/yyyy)`);
          // Convert dd/mm/yyyy to yyyy-mm-dd
          const [d1, m1, y1] = row[3].split('/');
          const [d2, m2, y2] = row[9].split('/');
          dataArr.push({
            userName: row[0],
            email: row[1],
            phoneNumber: row[2],
            dateOfBirth: `${y1}-${m1.padStart(2, '0')}-${d1.padStart(2, '0')}T00:00:00`,
            fullname: row[4],
            gender: row[5] === 'Nam',
            isActive: row[6] === 'true',
            password: "Password123!",
            code: row[7],
            majorId: majorObj.majorId,
            hireDate: `${y2}-${m2.padStart(2, '0')}-${d2.padStart(2, '0')}T00:00:00`,
          });
        }
        setImportedTeachers(dataArr);
        setShowImportDiv(true);
        setImportSuccess('Import file thành công! Vui lòng kiểm tra dữ liệu và bấm "Thêm mới"');
      } catch (err: any) {
        setImportError(err.message || 'Lỗi import file');
        showError(err.message || 'Lỗi import file');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle edit imported teacher
  const handleEditImported = (idx: number, field: keyof ImportTeacherRow, value: any) => {
    setImportedTeachers(prev => {
      const arr = [...prev];
      if (field === 'dateOfBirth' || field === 'hireDate') {
        // Convert dd/mm/yyyy to ISO string
        if (value && isValidDateVN(value)) {
          const [d, m, y] = value.split('/');
          arr[idx] = { ...arr[idx], [field]: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00` };
        }
      } else if (field === 'majorId') {
        const majorObj = majors.find(m => m.majorName === value);
        if (majorObj) {
          arr[idx] = { ...arr[idx], [field]: majorObj.majorId };
        }
      } else {
        arr[idx] = { ...arr[idx], [field]: value };
      }
      return arr;
    });
  };

  // Save imported teachers
  const handleSaveImportedTeachers = async () => {
    setImportError('');
    setImportSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Teacher/AddList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedTeachers),
      });
      // if (!res.ok) throw new Error('Failed to add teachers');
      const result = await res.json();
      if (result !== true) showToast("error",'Một số giáo viên đã tồn tại hoặc lỗi dữ liệu!');
      setImportSuccess('Thêm danh sách giáo viên thành công!');
      showSuccess('Thêm danh sách giáo viên thành công!');
      setShowImportDiv(false);
      setImportedTeachers([]);
      fetchTeachers(1, search);
      setCurrentPage(1);
    } catch (err: any) {
      setImportError(err.message || 'Lỗi thêm danh sách giáo viên');
      showError(err.message || 'Lỗi thêm danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setViewTeacher(null);
    setForm({
      phoneNumber: '',
      dateOfBirth: '',
      fullname: '',
      gender: true,
      isActive: true,
      hireDate: '',
    });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý giáo viên</h1>
                <p className="text-gray-600 mt-1">Quản lý thông tin và tài khoản giáo viên trong hệ thống</p>
              </div>
            </div>
          </div>

          {/* Search & Import */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, mã giáo viên..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center gap-2"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                    fetchTeachers(1, '');
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa lọc
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tải file mẫu
                </button>
                <label className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5" />
                  </svg>
                  Import file Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleImportExcel}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
            {importError && <div className="text-red-600 mt-2">{importError}</div>}
            {importSuccess && <div className="text-green-600 mt-2">{importSuccess}</div>}
          </div>

          {/* Import Preview & Edit */}
          {showImportDiv && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Dữ liệu import (có thể chỉnh sửa)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 border text-xs font-semibold text-gray-700">Tên đăng nhập</th>
                      <th className="px-3 py-2 border text-xs font-semibold text-gray-700">Email</th>
                      <th className="px-3 py-2 border text-xs font-semibold text-gray-700">Họ và tên</th>
                      <th className="px-3 py-2 border text-xs font-semibold text-gray-700">Ngày sinh</th>
                      <th className="px-3 py-2 border text-xs font-semibold text-gray-700">Giới tính</th>
                      <th className="px-3 py-2 border text-xs font-semibold text-gray-700">Ngành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedTeachers.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">
                          <input 
                            value={row.userName} 
                            onChange={e => handleEditImported(idx, 'userName', e.target.value)} 
                            className="w-28 border rounded px-1 text-xs" 
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input 
                            value={row.email} 
                            onChange={e => handleEditImported(idx, 'email', e.target.value)} 
                            className="w-36 border rounded px-1 text-xs" 
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input 
                            value={row.fullname} 
                            onChange={e => handleEditImported(idx, 'fullname', e.target.value)} 
                            className="w-32 border rounded px-1 text-xs" 
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <input 
                            value={row.dateOfBirth.split('T')[0].split('-').reverse().join('/')} 
                            onChange={e => handleEditImported(idx, 'dateOfBirth', e.target.value)} 
                            className="w-24 border rounded px-1 text-xs" 
                            placeholder="dd/mm/yyyy"
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <select 
                            value={row.gender ? 'Nam' : 'Nữ'} 
                            onChange={e => handleEditImported(idx, 'gender', e.target.value === 'Nam')}
                            className="w-16 border rounded px-1 text-xs"
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                          </select>
                        </td>
                        <td className="border px-2 py-1">
                          <select 
                            value={majors.find(m => m.majorId === row.majorId)?.majorName || ''} 
                            onChange={e => handleEditImported(idx, 'majorId', e.target.value)}
                            className="w-20 border rounded px-1 text-xs"
                          >
                            {majors.map(m => <option key={m.majorId} value={m.majorName}>{m.majorName}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveImportedTeachers}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Thêm mới
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportDiv(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Đóng
                </button>
              </div>
              {importError && <div className="text-red-600 mt-2">{importError}</div>}
              {importSuccess && <div className="text-green-600 mt-2">{importSuccess}</div>}
            </div>
          )}

          {/* Edit Teacher Popup */}
          {showPopup && viewTeacher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-popup overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Sửa thông tin giáo viên
                    </h3>
                    <button
                      className="text-white hover:text-gray-200 transition-colors"
                      onClick={closePopup}
                      aria-label="Đóng"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          value={viewTeacher.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mã giáo viên</label>
                        <input
                          value={viewTeacher.code}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                        <input
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                        <input
                          name="fullname"
                          value={form.fullname}
                          onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                        <input
                          name="dateOfBirth"
                          type="date"
                          value={form.dateOfBirth}
                          onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                        <select
                          name="gender"
                          value={form.gender ? 'true' : 'false'}
                          onChange={e => setForm(f => ({ ...f, gender: e.target.value === 'true' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        >
                          <option value="true">Nam</option>
                          <option value="false">Nữ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái hoạt động</label>
                        <select
                          name="isActive"
                          value={form.isActive ? 'true' : 'false'}
                          onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        >
                          <option value="true">Đang hoạt động</option>
                          <option value="false">Tạm ngừng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày vào làm</label>
                        <input
                          name="hireDate"
                          type="date"
                          value={form.hireDate}
                          onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cập nhật
                      </button>
                      <button
                        type="button"
                        onClick={closePopup}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Hủy bỏ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Danh sách giáo viên
                <span className="ml-2 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  {teachers.length} người
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Họ và tên</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Ngày vào làm</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teachers.map(t => (
                    <tr key={t.teacherId} className="hover:bg-green-50 cursor-pointer transition-colors duration-200">
                      <td className="py-4 px-6">{t.email}</td>
                      <td className="py-4 px-6">{t.fullname || 'Chưa cập nhật'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          t.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            t.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {t.isActive ? 'Đang hoạt động' : 'Tạm ngừng'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {t.hireDate ? new Date(t.hireDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); handleEdit(t); }}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          {t.isActive ? (
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(t.teacherId); }}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Xóa
                            </button>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); handleRestore(t.teacherId); }}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A9 9 0 116.582 9" />
                              </svg>
                              Khôi phục
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">Không tìm thấy giáo viên nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {teachers.length > 0 && totalPage > 1 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Trang {currentPage} / {totalPage}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border bg-gray-50 disabled:opacity-50 hover:bg-gray-100"
                    >{"<"}</button>
                    {Array.from({ length: Math.min(5, totalPage) }, (_, i) => {
                      let page;
                      if (totalPage <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPage - 2) {
                        page = totalPage - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-green-600 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >{page}</button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPage, p + 1))}
                      disabled={currentPage === totalPage}
                      className="px-3 py-1 rounded border bg-gray-50 disabled:opacity-50 hover:bg-gray-100"
                    >{">"}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Custom Styles */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { 
              opacity: 0;
              transform: translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn { 
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes popup {
            from { 
              transform: scale(0.95) translateY(-20px); 
              opacity: 0;
            }
            to { 
              transform: scale(1) translateY(0); 
              opacity: 1;
            }
          }
          .animate-popup { 
            animation: popup 0.3s ease-out;
          }
        `}</style>
      </div>
    </Suspense>
  );
}