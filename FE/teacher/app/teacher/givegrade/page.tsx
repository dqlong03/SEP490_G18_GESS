'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

const teacherId = "2A96A929-C6A1-4501-FC19-08DDB5DCA989";

const statusOptions = [
  { value: 0, label: 'Chưa chấm' },
  { value: 1, label: 'Đang chấm' }
];

// 10 năm gần nhất
const getYearOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  return Array.from({ length: 10 }, (_, i) => {
    const y1 = currentYear - i;
    const y2 = y1 + 1;
    return {
      value: y1,
      label: `${y1}-${y2}`,
    };
  });
};

export default function GiveGradePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<any>(null);

  const [exams, setExams] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  // Fetch subjects
  useEffect(() => {
    fetch(`https://localhost:7074/api/MultipleExam/subjects-by-teacher/${teacherId}`)
      .then(res => res.json())
      .then(data => setSubjects(data.map((s: any) => ({
        value: s.subjectId,
        label: s.subjectName,
      }))))
      .catch(() => setSubjects([]));
  }, []);

  // Fetch semesters
  useEffect(() => {
    fetch(`https://localhost:7074/api/Semesters`)
      .then(res => res.json())
      .then(data => setSemesters(data.map((s: any) => ({
        value: s.semesterId,
        label: s.semesterName,
      }))))
      .catch(() => setSemesters([]));
  }, []);

  // Fetch exams
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("teacherId", teacherId);
    if (selectedSubject) params.append("subjectId", selectedSubject.value);
    if (selectedStatus) params.append("statusExam", selectedStatus.value);
    if (selectedSemester) params.append("semesterId", selectedSemester.value);
    if (selectedYear) params.append("year", selectedYear.value);
    params.append("pagesze", pageSize.toString());
    params.append("pageindex", page.toString());

    fetch(`https://localhost:7074/api/GradeSchedule/teacher?${params.toString()}`)
      .then(res => res.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]));
  }, [selectedSubject, selectedStatus, selectedSemester, selectedYear, page]);

  // Fetch total pages
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("teacherId", teacherId);
    if (selectedSubject) params.append("subjectId", selectedSubject.value);
    if (selectedStatus) params.append("statusExam", selectedStatus.value);
    if (selectedSemester) params.append("semesterId", selectedSemester.value);
    if (selectedYear) params.append("year", selectedYear.value);
    params.append("pagesze", pageSize.toString());
    params.append("pageindex", page.toString());

    fetch(`https://localhost:7074/api/GradeSchedule/teacher/count?${params.toString()}`)
      .then(res => res.json())
      .then(data => setTotalPages(Number(data) || 1))
      .catch(() => setTotalPages(1));
  }, [selectedSubject, selectedStatus, selectedSemester, selectedYear, page]);

  // Handle grading action
  const handleGrade = (examSlotRoomId: number, action: "edit" | "grade" = "grade") => {
    router.push(`/teacher/givegrade/examroom/${examSlotRoomId}?action=${action}`);
  };

  // Reset filter
  const handleReset = () => {
    setSelectedSubject(null);
    setSelectedSemester(null);
    setSelectedStatus(null);
    setSelectedYear(null);
    setPage(1);
  };

  // Format trạng thái
const getStatusLabel = (isGrade: number | null) => {
  if (isGrade === null || isGrade === 0) return "Chưa chấm";
  if (isGrade === 1) return "Đã chấm";
  return "";
};

// Format trạng thái màu
const getStatusClass = (isGrade: number | null) => {
  if (isGrade === null || isGrade === 0) return "text-blue-600 font-semibold";
  if (isGrade === 1) return "text-yellow-600 font-semibold";
  if (isGrade === 2) return "text-green-600 font-semibold";
  return "";
};

  // Format ngày
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
  };

  

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Chấm thi</h2>
        <form
          onSubmit={e => { e.preventDefault(); setPage(1); }}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-10"
        >
          <div className="relative w-44 z-20">
            <Select
              options={subjects}
              value={selectedSubject}
              onChange={option => { setSelectedSubject(option); setPage(1); }}
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
              options={semesters}
              value={selectedSemester}
              onChange={option => { setSelectedSemester(option); setPage(1); }}
              placeholder="Chọn kỳ học"
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
              options={statusOptions}
              value={selectedStatus}
              onChange={option => { setSelectedStatus(option); setPage(1); }}
              placeholder="Trạng thái"
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
              options={getYearOptions()}
              value={selectedYear}
              onChange={option => { setSelectedYear(option); setPage(1); }}
              placeholder="Năm học"
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
            onClick={handleReset}
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
                <th className="py-2 px-2 border-b w-56 text-left">Tên bài thi</th>
                <th className="py-2 px-2 border-b w-32 text-left">Môn</th>
                <th className="py-2 px-2 border-b w-32 text-center">Trạng thái</th>
                <th className="py-2 px-2 border-b w-24 text-center">Kỳ</th>
                <th className="py-2 px-2 border-b w-32 text-center">Ngày thi</th>
                <th className="py-2 px-2 border-b w-32 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, idx) => (
                <tr key={exam.examSlotRoomId} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{exam.examName}</td>
                  <td className="py-2 px-2 border-b">{exam.subjectName}</td>
                  <td className={`py-2 px-2 border-b text-center ${getStatusClass(exam.isGrade)}`}>
                    {getStatusLabel(exam.isGrade)}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {semesters.find(s => s.value === exam.semesterId)?.label || ""}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {formatDate(exam.examDate)}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {exam.isGrade === 1 ? (
                      <button
                        onClick={() => handleGrade(exam.examSlotRoomId, "edit")}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition font-semibold"
                      >
                        Sửa điểm
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGrade(exam.examSlotRoomId, "grade")}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition font-semibold"
                      >
                        Chấm thi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
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
            Trang {page} / {totalPages}
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