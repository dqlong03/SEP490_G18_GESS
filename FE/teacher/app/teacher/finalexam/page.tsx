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
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Modal xem bài thi
  const [examDetail, setExamDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Thêm filter loại bài thi
  const [examTypeFilter, setExamTypeFilter] = useState<number>(0);

  const router = useRouter();

  // Năm học dropdown: 10 năm nhỏ hơn năm hiện tại
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  // Lấy teacherId từ token
  const teacherId = getUserIdFromToken();

  // Fetch subjects (lớp học)
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/GetAllSubjectsByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data && data.length > 0) setSelectedSubject(data[0]);
        setFetchError(false);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [teacherId]);

  // Fetch semesters
  useEffect(() => {
    fetch('https://localhost:7074/api/Semesters')
      .then(res => res.json())
      .then(data => {
        setSemesters(data);
        if (data && data.length > 0) setSelectedSemester(data[0]);
      });
  }, []);

  // Fetch exams
  const fetchExams = () => {
    const params = new URLSearchParams();
    if (selectedSubject) params.append('subjectId', selectedSubject.subjectId.toString());
    if (selectedSemester) params.append('semesterId', selectedSemester.semesterId.toString());
    if (selectedYear) params.append('year', selectedYear.toString());
    if (textSearch) params.append('textsearch', textSearch);
    if (examTypeFilter !== 0) params.append('type', examTypeFilter.toString());
    params.append('pageNumber', page.toString());
    params.append('pageSize', PAGE_SIZE.toString());

    setLoading(true);
    setFetchError(false);

    fetch(`https://localhost:7074/api/FinalExam/GetAllFinalExam?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Sắp xếp: tự luận (2) trước, trắc nghiệm (1) sau
        const sorted = [...data].sort((a, b) => {
          if (a.examType === b.examType) return 0;
          if (a.examType === 2) return -1;
          if (b.examType === 2) return 1;
          return 0;
        });
        setExams(sorted);
      })
      .catch(() => {
        setExams([]);
        setFetchError(true);
      })
      .finally(() => setLoading(false));

    fetch(`https://localhost:7074/api/FinalExam/CountPageNumberFinalExam?${params.toString()}`)
      .then(res => res.json())
      .then(data => setTotalPages(data))
      .catch(() => setTotalPages(1));
  };

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line
  }, [selectedSubject, selectedSemester, selectedYear, textSearch, page, examTypeFilter]);

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

  // Xem chi tiết bài thi
  const handleViewExam = async (exam: Exam) => {
    setSelectedExam(exam);
    setShowModal(true);
    setExamDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const type = exam.examType; // 1: Trắc nghiệm, 2: Tự luận
      const res = await fetch(`https://localhost:7074/api/FinalExam/ViewFinalExamDetail/${exam.examId}/${type}`);
      if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu');
      const data = await res.json();
      setExamDetail(data);
    } catch (err) {
      setDetailError('Không thể lấy thông tin bài thi.');
    } finally {
      setDetailLoading(false);
    }
  };

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
              noOptionsMessage={() => 'Không có dữ liệu'}
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
              noOptionsMessage={() => 'Không có dữ liệu'}
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
              noOptionsMessage={() => 'Không có dữ liệu'}
            />
          </div>
          <div className="w-44">
            <Select
              options={[
                { value: 2, label: 'Tự luận' },
                { value: 1, label: 'Trắc nghiệm' },
              ]}
              value={
                examTypeFilter === 1
                  ? { value: 1, label: 'Trắc nghiệm' }
                  : { value: 2, label: 'Tự luận' }
              }
              onChange={option => {
                setExamTypeFilter(option?.value ?? 1);
                setPage(1);
              }}
              placeholder="Loại bài thi"
              styles={{
                menu: provided => ({ ...provided, zIndex: 20 }),
                control: provided => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
              noOptionsMessage={() => 'Không có dữ liệu'}
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
                <th className="py-2 px-2 border-b w-16 text-center">Xem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">Đang tải...</td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-red-500">Không có dữ liệu</td>
                </tr>
              ) : exams.length > 0 ? exams.map((exam, idx) => (
                <tr key={exam.examId} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{exam.examName}</td>
                  <td className="py-2 px-2 border-b">{exam.subjectName}</td>
                  <td className="py-2 px-2 border-b">{exam.semesterName}</td>
                  <td className="py-2 px-2 border-b text-center">{exam.year}</td>
                  <td className="py-2 px-2 border-b">
                    {exam.examType === 1 ? 'Trắc nghiệm' : exam.examType === 2 ? 'Tự luận' : ''}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewExam(exam)}
                      title="Xem bài thi"
                    >
                      <EyeIcon size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Không có dữ liệu
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
            <div className="mb-6 text-gray-700">
              {detailLoading ? (
                <div className="text-center text-gray-500">Đang tải...</div>
              ) : detailError ? (
                <div className="text-center text-red-500">{detailError}</div>
              ) : examDetail ? (
                <div>
                  {/* Hiển thị thông tin chi tiết bài thi */}
                  {selectedExam?.examType === 2 ? (
                    // Tự luận
                    <div>
                      <div><b>Tên bài thi:</b> {examDetail.pracExamName}</div>
                      <div><b>Môn học:</b> {examDetail.subjectName}</div>
                      <div><b>Kỳ:</b> {examDetail.semesterName}</div>
                      <div><b>Người tạo:</b> {examDetail.teacherName}</div>
                      <div><b>Danh sách đề thi:</b>
                        <ul className="list-disc ml-6">
                          {examDetail.practiceExamPaperDTO?.map((item: any) => (
                            <li key={item.pracExamPaperId}>
                              {item.pracExamPaperName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // Trắc nghiệm
                    <div>
                      <div><b>Tên bài thi:</b> {examDetail.multiExamName}</div>
                      <div><b>Môn học:</b> {examDetail.subjectName}</div>
                      <div><b>Kỳ:</b> {examDetail.semesterName}</div>
                      <div><b>Người tạo:</b> {examDetail.teacherName}</div>
                      <div><b>Số lượng câu hỏi:</b> {examDetail.numberQuestion}</div>
                      <div><b>Chi tiết số câu hỏi theo chương:</b>
                        <ul className="list-disc ml-6">
                          {examDetail.noQuestionInChapterDTO?.map((item: any, idx: number) => (
                            <li key={idx}>
                              {item.chapterName} - {item.levelName}: {item.numberQuestion} câu
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">Không có dữ liệu</div>
              )}
            </div>
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