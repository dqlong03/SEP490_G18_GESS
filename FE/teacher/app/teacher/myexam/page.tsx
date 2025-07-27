'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { getUserIdFromToken } from '@/utils/tokenUtils';

export default function MyExamsPage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedHead, setSelectedHead] = useState<any>(null);

  // Dropdown data
  const [majors, setMajors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [examHeads, setExamHeads] = useState<any[]>([]);

  // Exam data
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Lấy teacherId ở client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTeacherId(getUserIdFromToken());
    }
  }, []);

  // Lấy ngành từ MultipleExamController
  useEffect(() => {
    fetch('https://localhost:7074/api/MultipleExam/major')
      .then(res => res.json())
      .then(data => setMajors(Array.isArray(data) ? data : []));
  }, []);

  // Lấy môn học theo ngành từ MultipleExamController
  useEffect(() => {
    if (selectedMajor?.value) {
      fetch(`https://localhost:7074/api/MultipleExam/subject/${selectedMajor.value}`)
        .then(res => res.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []));
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedMajor]);

  // Lấy kỳ học (giữ nguyên)
  useEffect(() => {
    fetch('https://localhost:7074/api/Semesters/CurrentSemester')
      .then(res => res.json())
      .then(data => setSemesters(Array.isArray(data) ? data : [data]));
  }, []);

  // Lấy danh sách bài thi từ ExamController (giữ nguyên)
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.append('pageNumber', page.toString());
    params.append('pageSize', pageSize.toString());
    if (selectedMajor) params.append('majorId', selectedMajor.value);
    if (selectedSemester) params.append('semesterId', selectedSemester.value);
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedType) params.append('examType', selectedType.value);
    if (searchName) params.append('searchName', searchName);

    fetch(`https://localhost:7074/api/Exam/teacher-exams/${teacherId}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setExams(Array.isArray(data.data) ? data.data : []);
        setTotalPages(Math.ceil((data.totalCount || 1) / pageSize));
        // Lấy loại bài thi và đầu điểm duy nhất từ dữ liệu trả về
        setExamTypes(
          Array.from(
            new Set((data.data || []).map((e: any) => e.examType))
          )
            .filter(Boolean)
            .map((type) => ({
              value: String(type),
              label: String(type),
            }))
        );
        setExamHeads(
          Array.from(
            new Set((data.data || []).map((e: any) => e.statusExam))
          )
            .filter(Boolean)
            .map((head) => ({
              value: String(head),
              label: String(head),
            }))
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [teacherId, page, selectedMajor, selectedSemester, selectedSubject, selectedType, searchName]);

  // Lọc đầu điểm phía client nếu cần
  const filteredExams = useMemo(() => {
    return exams.filter((exam: any) => {
      const matchHead = selectedHead ? exam.statusExam === selectedHead.value : true;
      return matchHead;
    });
  }, [exams, selectedHead]);

  // Phân trang client (nếu API đã phân trang thì không cần)
  const pagedExams = filteredExams;

  // Xử lý sửa (để sau)
  const handleEdit = (id: number) => {
    alert(`Sửa bài thi có ID: ${id}`);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Bài thi của tôi</h2>
        <form
          onSubmit={e => { e.preventDefault(); setPage(1); }}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-10"
        >
          <input
            type="text"
            placeholder="Tìm theo tên bài thi"
            value={searchName}
            onChange={e => { setSearchName(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-44 h-10"
            style={{
              minHeight: '40px',
              borderColor: '#d1d5db',
              boxShadow: 'none',
            }}
          />
          <div className="relative w-44 z-20">
            <Select
              options={Array.isArray(majors) ? majors.map((m) => ({
                value: m.majorId || m.id,
                label: m.majorName || m.name
              })) : []}
              value={selectedMajor}
              onChange={(option) => { setSelectedMajor(option); setPage(1); }}
              placeholder="Chọn ngành"
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
          <div className="relative w-44 z-20">
            <Select
              options={Array.isArray(subjects) ? subjects.map((s) => ({
                value: s.subjectId || s.id,
                label: s.subjectName || s.name
              })) : []}
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
          <div className="relative w-44 z-20">
            <Select
              options={Array.isArray(semesters) ? semesters.map((s) => ({
                value: s.semesterId || s.id,
                label: s.semesterName || s.name
              })) : []}
              value={selectedSemester}
              onChange={(option) => { setSelectedSemester(option); setPage(1); }}
              placeholder="Chọn kỳ"
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
          <div className="relative w-44 z-20">
            <Select
              options={Array.isArray(examTypes) ? examTypes : []}
              value={selectedType}
              onChange={(option) => { setSelectedType(option); setPage(1); }}
              placeholder="Loại bài thi"
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
          <div className="relative w-44 z-20">
            <Select
              options={Array.isArray(examHeads) ? examHeads : []}
              value={selectedHead}
              onChange={(option) => { setSelectedHead(option); setPage(1); }}
              placeholder="Trạng thái"
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
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setSelectedMajor(null);
              setSelectedSubject(null);
              setSelectedSemester(null);
              setSelectedType(null);
              setSelectedHead(null);
              setPage(1);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white" style={{ maxWidth: '100%' }}>
          <table className="min-w-[900px] w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-14 text-center">STT</th>
                <th className="py-2 px-2 border-b w-32 text-left">Kỳ</th>
                <th className="py-2 px-2 border-b w-56 text-left">Tên bài</th>
                <th className="py-2 px-2 border-b w-32 text-center">Ngày tạo</th>
                <th className="py-2 px-2 border-b w-32 text-center">Trạng thái</th>
                <th className="py-2 px-2 border-b w-32 text-center">Loại bài</th>
                <th className="py-2 px-2 border-b w-32 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pagedExams.map((exam: any, idx: number) => (
                <tr key={exam.examId || exam.id} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{exam.semesterName}</td>
                  <td className="py-2 px-2 border-b">{exam.examName}</td>
                  <td className="py-2 px-2 border-b text-center">{exam.createDate ? new Date(exam.createDate).toLocaleString() : ''}</td>
                  <td className="py-2 px-2 border-b text-center">
                    {exam.statusExam
                      ? <span className="text-blue-600 font-semibold">{exam.statusExam}</span>
                      : <span className="text-gray-500">-</span>
                    }
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {exam.examType || ''}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    <button
                      onClick={() => handleEdit(exam.examId || exam.id)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {pagedExams.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Không có bài thi nào.
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
    </div>
  );
}
