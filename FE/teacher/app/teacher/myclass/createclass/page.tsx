'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import * as XLSX from 'xlsx';
// Import your token utility
import { getUserIdFromToken } from '@/utils/tokenUtils';

export default function AddClassPage() {
  const [className, setClassName] = useState('');
  const [majors, setMajors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [currentSemester, setCurrentSemester] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch majors and current semester on mount
  useEffect(() => {
    fetch('https://localhost:7074/api/MultipleExam/major')
      .then(res => res.json())
      .then(data => setMajors(data || []));
    fetch('https://localhost:7074/api/Semesters/CurrentSemester')
      .then(res => res.json())
      .then(data => setCurrentSemester(data && data[0] ? data[0] : null));
  }, []);

  // Fetch subjects when major changes
  useEffect(() => {
    if (selectedMajor?.value) {
      fetch(`https://localhost:7074/api/MultipleExam/subject/${selectedMajor.value}`)
        .then(res => res.json())
        .then(data => setSubjects(data || []));
      setSelectedSubject(null);
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedMajor]);

  // Dropdown options
  const majorOptions = majors.map((m: any) => ({ value: m.majorId || m.id, label: m.majorName || m.name }));
  const subjectOptions = subjects.map((s: any) => ({ value: s.subjectId || s.id, label: s.subjectName || s.name }));

  // Download template
  const handleDownloadTemplate = () => {
    const header = ['STT', 'Mã sinh viên', 'Code', 'Email', 'Giới tính', 'Ngày sinh', 'Họ và tên'];
    const rows = [
      [1, 'SV001', 'C001', 'sv001@example.com', 'Nam', '2002-01-01', 'Nguyễn Văn A'],
      [2, 'SV002', 'C002', 'sv002@example.com', 'Nữ', '2002-02-02', 'Trần Thị B'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
    XLSX.writeFile(wb, 'mau_sinh_vien.xlsx');
  };

  // Upload and validate file
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetInput = () => {
      if (e.target) e.target.value = '';
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      setErrorMsg('');
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (json.length < 2) {
        setErrorMsg('File phải có ít nhất 1 dòng dữ liệu sinh viên.');
        setFileName('');
        resetInput();
        return;
      }
      const header = json[0];
      const requiredHeader = ['STT', 'Mã sinh viên', 'Code', 'Email', 'Giới tính', 'Ngày sinh', 'Họ và tên'];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);
      if (!isHeaderValid) {
        setErrorMsg('File mẫu không đúng định dạng hoặc thiếu trường thông tin!');
        setFileName('');
        resetInput();
        return;
      }
      const dataArr = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 7 || row.some((cell: string, idx: number) => idx > 0 && cell === '')) {
          setErrorMsg(`Dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ tất cả trường!`);
          setFileName('');
          resetInput();
          return;
        }
        const [, studentId, code, email, gender, dob, fullName] = row;
        if (!isValidEmail(email)) {
          setErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${email}`);
          setFileName('');
          resetInput();
          return;
        }
        if (!isValidDate(dob)) {
          setErrorMsg(`Ngày sinh không hợp lệ ở dòng ${i + 1}: ${dob} (Định dạng: YYYY-MM-DD)`);
          setFileName('');
          resetInput();
          return;
        }
        dataArr.push({
          studentId, // Mã sinh viên
          code,      // Code
          email,
          gender,
          dob,
          fullName,
        });
      }
      setFileName(file.name);
      setStudents(dataArr);
      setErrorMsg('');
      resetInput();
    };
    reader.readAsArrayBuffer(file);
  };

  // Add student row
  const handleAddStudent = () => {
    setStudents([
      ...students,
      {
        studentId: '',
        code: '',
        email: '',
        gender: '',
        dob: '',
        fullName: '',
      },
    ]);
  };

  // Edit student
  const handleEditStudent = (idx: number, key: string, value: string) => {
    setStudents((prev) =>
      prev.map((sv, i) => (i === idx ? { ...sv, [key]: value } : sv))
    );
  };

  // Delete student
  const handleDeleteStudent = (idx: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== idx));
  };

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidDate(date: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  // Save class (call API)
  const handleSave = async () => {
    if (!className.trim() || !selectedMajor || !selectedSubject || !currentSemester) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin lớp học!');
      return;
    }
    for (let i = 0; i < students.length; i++) {
      const sv = students[i];
      if (
        !sv.studentId?.trim() ||
        !sv.code?.trim() ||
        !sv.email.trim() ||
        !sv.gender.trim() ||
        !sv.dob.trim() ||
        !sv.fullName.trim()
      ) {
        setErrorMsg(`Sinh viên dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ!`);
        return;
      }
      if (!isValidEmail(sv.email)) {
        setErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${sv.email}`);
        return;
      }
      if (!isValidDate(sv.dob)) {
        setErrorMsg(`Ngày sinh không hợp lệ ở dòng ${i + 1}: ${sv.dob} (Định dạng: YYYY-MM-DD)`);
        return;
      }
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const teacherId = getUserIdFromToken();
      const payload = {
        teacherId,
        subjectId: selectedSubject.value,
        semesterId: currentSemester.semesterId,
        className: className.trim(),
        students: students.map(sv => ({
          studentId: sv.studentId, // Mã sinh viên
          code: sv.code,           // Code
          fullName: sv.fullName,
          email: sv.email,
          gender: sv.gender === 'Nam' ? true : false,
          dateOfBirth: sv.dob,
          cohortId: sv.cohortId || 0
        })),
      };

      const res = await fetch('https://localhost:7074/api/Class/CreateClass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err?.message || 'Lỗi khi tạo lớp học');
        setLoading(false);
        return;
      }

      setErrorMsg('');
      alert('Tạo lớp học thành công!');
      // Optionally reset form here
    } catch (err: any) {
      setErrorMsg('Lỗi khi tạo lớp học');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Thêm lớp học mới</h2>
        <form
          onSubmit={e => { e.preventDefault(); handleSave(); }}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="block font-semibold mb-1">Tên lớp</label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                required
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Nhập tên lớp"
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block font-semibold mb-1">Ngành</label>
              <Select
                options={majorOptions}
                value={selectedMajor}
                onChange={setSelectedMajor}
                placeholder="Chọn ngành"
                isClearable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '40px',
                    borderColor: '#d1d5db',
                    boxShadow: 'none',
                  }),
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="block font-semibold mb-1">Kỳ học</label>
              <input
                type="text"
                value={currentSemester?.semesterName || ''}
                disabled
                className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-700"
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block font-semibold mb-1">Môn học</label>
              <Select
                options={subjectOptions}
                value={selectedSubject}
                onChange={setSelectedSubject}
                placeholder="Chọn môn học"
                isClearable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '40px',
                    borderColor: '#d1d5db',
                    boxShadow: 'none',
                  }),
                }}
                isDisabled={!selectedMajor}
              />
            </div>
          </div>

          {/* Nút mẫu và upload */}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
            >
              Tải file mẫu
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold cursor-pointer">
              Tải lên danh sách sinh viên
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <span className="text-gray-600 text-sm ml-2">{fileName}</span>
            )}
          </div>

          {/* Hiển thị lỗi */}
          {errorMsg && (
            <div className="text-red-600 font-semibold mt-2">{errorMsg}</div>
          )}

          {/* Bảng sinh viên */}
          {students.length > 0 && (
            <div className="overflow-x-auto rounded shadow bg-white mt-6 w-full">
              <table className="min-w-[1100px] w-full text-sm md:text-base border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold">
                    <th className="py-2 px-2 border-b min-w-[60px] text-center">STT</th>
                    <th className="py-2 px-2 border-b min-w-[140px] text-left">Mã sinh viên</th>
                    <th className="py-2 px-2 border-b min-w-[100px] text-left">Code</th>
                    <th className="py-2 px-2 border-b min-w-[220px] text-left">Email</th>
                    <th className="py-2 px-2 border-b min-w-[100px] text-center">Giới tính</th>
                    <th className="py-2 px-2 border-b min-w-[140px] text-center">Ngày sinh</th>
                    <th className="py-2 px-2 border-b min-w-[200px] text-left">Họ và tên</th>
                    <th className="py-2 px-2 border-b min-w-[80px] text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((sv, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition">
                      <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                      <td className="py-2 px-2 border-b">
                        <input
                          type="text"
                          value={sv.studentId}
                          onChange={e => handleEditStudent(idx, 'studentId', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-2 border-b">
                        <input
                          type="text"
                          value={sv.code}
                          onChange={e => handleEditStudent(idx, 'code', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-2 border-b">
                        <input
                          type="email"
                          value={sv.email}
                          onChange={e => handleEditStudent(idx, 'email', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-2 border-b text-center">
                        <select
                          value={sv.gender}
                          onChange={e => handleEditStudent(idx, 'gender', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="">--</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 border-b text-center">
                        <input
                          type="date"
                          value={sv.dob}
                          onChange={e => handleEditStudent(idx, 'dob', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-2 border-b">
                        <input
                          type="text"
                          value={sv.fullName}
                          onChange={e => handleEditStudent(idx, 'fullName', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-2 border-b text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(idx)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
                >
                  Thêm sinh viên
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu lớp học'}
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.2s }
        @keyframes popup {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        .animate-popup { animation: popup 0.2s }
      `}</style>
    </div>
  );
}