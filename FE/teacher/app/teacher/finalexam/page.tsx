'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { EyeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';

type Subject = {
  subjectId: number;
  subjectName: string;
  description: string;
  course: string;
  noCredits: number;
};
type Semester = {
  semesterId: number;
  semesterName: string;
};
type Exam = {
  examId: number;
  examName: string;
  teacherCreateName: string | null;
  subjectName: string;
  semesterName: string;
  year: number;
  semesterId: number;
  examType: number;
};

const PAGE_SIZE = 10;

export default function ExamListPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [textSearch, setTextSearch] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const router = useRouter();

  // Năm học dropdown: 10 năm nhỏ hơn năm hiện tại
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Lấy teacherId từ token
  const teacherId = getUserIdFromToken();

  // Fetch subjects (lớp học)
  useEffect(() => {
    if (!teacherId) return;
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/GetAllSubjectsByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => setSubjects(data));
  }, [teacherId]);

  // Fetch semesters
  useEffect(() => {
    fetch('https://localhost:7074/api/Semesters')
      .then(res => res.json())
      .then(data => setSemesters(data));
  }, []);

  // Fetch exams
  const fetchExams = () => {
    const params = new URLSearchParams();
    if (selectedSubject) params.append('subjectId', selectedSubject.subjectId.toString());
    if (selectedSemester) params.append('semesterId', selectedSemester.semesterId.toString());
    if (selectedYear) params.append('year', selectedYear.toString());
    if (textSearch) params.append('textsearch', textSearch);
    params.append('pageNumber', page.toString());
    params.append('pageSize', PAGE_SIZE.toString());

    fetch(`https://localhost:7074/api/FinalExam/GetAllFinalExam?${params.toString()}`)
      .then(res => res.json())
      .then(data => setExams(data));

    fetch(`https://localhost:7074/api/FinalExam/CountPageNumberFinalExam?${params.toString()}`)
      .then(res => res.json())
      .then(data => setTotalPages(data));
  };

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line
  }, [selectedSubject, selectedSemester, selectedYear, textSearch, page]);

  // Subject options for react-select
  const subjectOptions = subjects.map(s => ({
    value: s.subjectId,
    label: s.subjectName,
    ...s,
  }));

  // Semester options
  const semesterOptions = semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
    ...s,
  }));

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-6xl mx-auto py-8 px-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Danh sách các bài thi</h2>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold shadow"
            onClick={() => setShowCreateModal(true)}
          >
            + Tạo bài thi cuối kỳ
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="w-64">
            <Select
              options={subjectOptions}
              value={selectedSubject ? subjectOptions.find(s => s.value === selectedSubject.subjectId) : null}
              onChange={option => { setSelectedSubject(option); setPage(1); }}
              placeholder="Chọn lớp học"
              isSearchable
              styles={{
                menu: provided => ({ ...provided, zIndex: 20 }),
                control: provided => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <div className="w-48">
            <Select
              options={semesterOptions}
              value={selectedSemester ? semesterOptions.find(s => s.value === selectedSemester.semesterId) : null}
              onChange={option => { setSelectedSemester(option); setPage(1); }}
              placeholder="Chọn kỳ"
              styles={{
                menu: provided => ({ ...provided, zIndex: 20 }),
                control: provided => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <div className="w-40">
            <Select
              options={years.map(y => ({ value: y, label: y.toString() }))}
              value={{ value: selectedYear, label: selectedYear.toString() }}
              onChange={option => { setSelectedYear(option?.value ?? years[0]); setPage(1); }}
              placeholder="Chọn năm"
              styles={{
                menu: provided => ({ ...provided, zIndex: 20 }),
                control: provided => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <input
            type="text"
            className="border rounded px-3 py-2 min-w-[200px]"
            placeholder="Tìm kiếm bài thi"
            value={textSearch}
            onChange={e => { setTextSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="overflow-x-auto rounded shadow bg-white mb-4">
          <table className="w-full text-sm md:text-base border border-gray-200 table-fixed" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-16 text-center">STT</th>
                <th className="py-2 px-2 border-b w-64 text-left">Tên bài thi</th>
                <th className="py-2 px-2 border-b w-40 text-left">Môn học</th>
                <th className="py-2 px-2 border-b w-32 text-left">Kỳ</th>
                <th className="py-2 px-2 border-b w-24 text-center">Năm</th>
                <th className="py-2 px-2 border-b w-32 text-left">Loại</th>
                <th className="py-2 px-2 border-b w-32 text-left">Người tạo</th>
                <th className="py-2 px-2 border-b w-16 text-center">Xem</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? exams.map((exam, idx) => (
                <tr key={exam.examId} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{exam.examName}</td>
                  <td className="py-2 px-2 border-b">{exam.subjectName}</td>
                  <td className="py-2 px-2 border-b">{exam.semesterName}</td>
                  <td className="py-2 px-2 border-b text-center">{exam.year}</td>
                  <td className="py-2 px-2 border-b">
                    {exam.examType === 1 ? 'Giữa kỳ' : exam.examType === 2 ? 'Cuối kỳ' : ''}
                  </td>
                  <td className="py-2 px-2 border-b">{exam.teacherCreateName ?? ''}</td>
                  <td className="py-2 px-2 border-b text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => { setSelectedExam(exam); setShowModal(true); }}
                      title="Xem bài thi"
                    >
                      <EyeIcon size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Không có bài thi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-2 flex flex-wrap justify-left items-center gap-2 text-base ">
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

      {/* Modal xem bài thi */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Xem bài thi</h3>
            {/* Nội dung popup để trống */}
            <div className="mb-6 text-gray-500 text-center">Nội dung bài thi sẽ hiển thị ở đây.</div>
            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo bài thi cuối kỳ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[350px]">
            <h3 className="text-lg font-semibold mb-4 text-center">Chọn loại bài thi cuối kỳ</h3>
            <div className="flex flex-col gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/teacher/finalexam/createexam/mulexam');
                }}
              >
                Tạo bài thi trắc nghiệm
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition font-semibold"
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/teacher/finalexam/createexam/pracexam');
                }}
              >
                Tạo bài thi tự luận
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
                onClick={() => setShowCreateModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}