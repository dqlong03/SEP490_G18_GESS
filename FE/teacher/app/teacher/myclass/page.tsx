'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';

export default function MyClassPage() {
  const router = useRouter();
  const [searchClassName, setSearchClassName] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Lấy teacherId từ token
  const teacherId = getUserIdFromToken();

  // Lấy danh sách kỳ học hiện tại
  useEffect(() => {
    fetch('https://localhost:7074/api/Semesters/CurrentSemester')
      .then(res => res.json())
      .then(data => setSemesters(data || []));
  }, []);

  // Lấy danh sách môn học từ API mới
  useEffect(() => {
    fetch('https://localhost:7074/api/Subject/ListSubject')
      .then(res => res.json())
      .then(data => setSubjects(data || []));
  }, []);

  // Lấy danh sách lớp của giáo viên (API 6)
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.append('teacherId', teacherId);
    if (searchClassName) params.append('name', searchClassName);
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedSemester) params.append('semesterId', selectedSemester.value);
    params.append('pageNumber', page.toString());
    params.append('pageSize', pageSize.toString());

    fetch(`https://localhost:7074/api/Class/teacherId?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        // Lấy tổng số trang (API 7)
        fetch(`https://localhost:7074/api/Class/CountPagesByTeacher/${teacherId}?${selectedSubject ? `subjectId=${selectedSubject.value}&` : ''}${selectedSemester ? `semesterId=${selectedSemester.value}&` : ''}pageSize=${pageSize}`)
          .then(res2 => res2.json())
          .then(total => setTotalPages(total || 1));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [teacherId, searchClassName, selectedSubject, selectedSemester, page]);

  // Tạo options cho react-select
  const subjectOptions = subjects.map((s: any) => ({
    value: s.subjectId || s.id,
    label: s.subjectName || s.name,
  }));

  const semesterOptions = semesters.map((s: any) => ({
    value: s.semesterId || s.id,
    label: s.semesterName || s.name,
  }));

  // Chuyển sang trang tạo lớp học
  const handleAddClass = () => {
    router.push('/teacher/myclass/createclass');
  };

  // Xử lý sửa (để sau)
  const handleEdit = (id: number) => {
    alert(`Sửa lớp có ID: ${id}`);
  };

  // Xử lý chuyển sang trang chi tiết lớp
  const handleDetail = (id: number) => {
    router.push(`/teacher/myclass/classdetail/${id}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-4xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý lớp của tôi</h2>

        {/* Search bar */}
        <form
          onSubmit={e => { e.preventDefault(); setPage(1); }}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-10"
        >
          <input
            type="text"
            placeholder="Tìm theo tên lớp"
            value={searchClassName}
            onChange={e => { setSearchClassName(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-44 h-10"
            style={{
              minHeight: '40px',
              borderColor: '#d1d5db',
              boxShadow: 'none',
            }}
          />

          {/* Combobox kỳ học dùng react-select, không search */}
          <div className="relative w-44 z-20">
            <Select
              options={semesterOptions}
              value={selectedSemester}
              onChange={(option) => { setSelectedSemester(option); setPage(1); }}
              placeholder="Chọn kỳ học"
              isClearable
              isSearchable={false}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>

          {/* Combobox môn học dùng react-select */}
          <div className="relative w-56 z-20">
            <Select
              options={subjectOptions}
              value={selectedSubject}
              onChange={(option) => { setSelectedSubject(option); setPage(1); }}
              placeholder="Chọn môn học"
              isClearable
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchClassName('');
              setSelectedSemester(null);
              setSelectedSubject(null);
              setPage(1);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={handleAddClass}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold shadow"
          >
            + Thêm lớp học
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white" style={{ maxWidth: '100%' }}>
          <table className="min-w-[700px] w-full text-sm md:text-base border border-gray-200 table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-14 text-center">STT</th>
                <th className="py-2 px-2 border-b w-40 text-left">Tên lớp</th>
                <th className="py-2 px-2 border-b w-56 text-left">Môn học</th>
                <th className="py-2 px-2 border-b w-40 text-left">Kỳ học</th>
                <th className="py-2 px-2 border-b w-20 text-center">Số SV</th>
                <th className="py-2 px-2 border-b w-40 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? classes.map((cls: any, idx: number) => (
                <tr key={cls.classId} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{cls.className}</td>
                  <td className="py-2 px-2 border-b">{cls.subjectName}</td>
                  <td className="py-2 px-2 border-b">{cls.semesterName}</td>
                  <td className="py-2 px-2 border-b text-center">{cls.studentCount}</td>
                  <td className="py-2 px-2 border-b text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(cls.classId)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDetail(cls.classId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition font-semibold"
                    >
                      Chi tiết
                    </button>
                    {/* Xóa sẽ làm sau */}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có lớp học nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap justify-left items-center gap-2 text-base ">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="mx-2 font-semibold">
            Trang {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
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
        .table-fixed {
          table-layout: fixed;
        }
      `}</style>
    </div>
  );
}