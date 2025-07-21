'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Select from 'react-select';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import Link from 'next/link';

const API_URL = "https://localhost:7074";

interface PracticeExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  year: string;
  semester: string;
}

interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string;
  status: string;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export default function CreateEssayExamPage() {
  const router = useRouter();
  const params = useParams();
  const classId = Number(params?.classId);

  // State
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [students, setStudents] = useState<any[]>([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [gradeComponents, setGradeComponents] = useState<any[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] = useState<any>(null);

  // Đề thi
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [examChecks, setExamChecks] = useState<Record<number, boolean>>({});
  const [examPapers, setExamPapers] = useState<PracticeExamPaperDTO[]>([]);
  const [selectedExams, setSelectedExams] = useState<PracticeExamPaperDTO[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // subjectId, semesterId
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // Kỳ và năm
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState<{ value: string; label: string } | null>(null);

  // Chi tiết đề thi
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Preview đề thi khi hover (chỉ trong popup)
  const [hoveredExam, setHoveredExam] = useState<PracticeExamPaperDTO | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  // Lấy danh sách sinh viên, đầu điểm, subjectId, semesterId, semesters, years
  useEffect(() => {
    if (!classId) return;
    fetch(`${API_URL}/api/Class/${classId}/students`)
      .then(res => res.json())
      .then(data => setStudents(data || []));
    fetch(`${API_URL}/api/Class/${classId}/grade-components`)
      .then(res => res.json())
      .then(data => setGradeComponents(
        (data || []).map((g: any) => ({
          value: g.categoryExamId,
          label: g.categoryExamName
        }))
      ));
    fetch(`${API_URL}/api/Class/${classId}/subject-id`)
      .then(res => res.json())
      .then(data => setSubjectId(data));
    fetch(`${API_URL}/api/Semesters/CurrentSemester`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSemesterId(data[0].semesterId);
      });
    // Lấy danh sách kỳ
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => {
        setSemesters(data || []);
      });
    // Lấy danh sách năm từ năm hiện tại về trước
    const currentYear = new Date().getFullYear();
    const yearArr = [];
    for (let y = currentYear; y >= 2020; y--) {
      yearArr.push({ value: y.toString(), label: y.toString() });
    }
    setYears(yearArr);
  }, [classId]);

  // Lấy danh sách đề thi khi mở popup hoặc khi đổi kỳ/năm
  const fetchExamPapers = async (semesterName: string | null, year: string | null) => {
    setLoadingExams(true);
    try {
      const teacherId = getUserIdFromToken();
      if (!subjectId) throw new Error('Không lấy được subjectId');
      const categoryId = selectedGradeComponent?.value;
      if (!categoryId) throw new Error('Vui lòng chọn đầu điểm');
      const examRes = await fetch(
        `${API_URL}/api/PracticeExam/exams_paper?subjectId=${subjectId}&categoryId=${categoryId}&teacherId=${teacherId}`
      );
      if (!examRes.ok) throw new Error('Không lấy được danh sách đề thi');
      const exams = await examRes.json();
      let filtered = exams || [];
      // Nếu đã chọn kỳ và năm thì lọc, còn không thì lấy hết
      if (semesterName && year) {
        filtered = filtered.filter(
          (e: PracticeExamPaperDTO) =>
            e.semester === semesterName &&
            e.year === year &&
            !selectedExams.some(se => se.pracExamPaperId === e.pracExamPaperId)
        );
      } else {
        filtered = filtered.filter(
          (e: PracticeExamPaperDTO) =>
            !selectedExams.some(se => se.pracExamPaperId === e.pracExamPaperId)
        );
      }
      setExamPapers(filtered);
    } catch (err: any) {
      setExamPapers([]);
      alert(err.message || 'Lỗi lấy danh sách đề thi');
    } finally {
      setLoadingExams(false);
    }
  };

  // Khi mở popup chọn đề hoặc đổi kỳ/năm thì load lại đề
  useEffect(() => {
    if (showExamPopup) {
      fetchExamPapers(selectedSemester?.label ?? null, selectedYear?.value ?? null);
    }
    // eslint-disable-next-line
  }, [showExamPopup, selectedSemester, selectedYear, selectedGradeComponent, subjectId]);

  // Popup chọn sinh viên
  const handleOpenStudentPopup = () => setShowStudentPopup(true);

  const handleCheckStudent = (id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllStudents = () => {
    const allChecked: Record<string, boolean> = {};
    students.forEach((sv: any) => {
      allChecked[sv.studentId] = true;
    });
    setStudentChecks(allChecked);
  };

  const handleUncheckAllStudents = () => {
    setStudentChecks({});
  };

  const handleConfirmStudents = () => {
    setSelectedStudents(students.filter((sv) => studentChecks[sv.studentId]));
    setShowStudentPopup(false);
  };

  // Popup chọn đề thi
  const handleOpenExamPopup = () => {
    setExamChecks({});
    setShowExamPopup(true);
    setSelectedSemester(null);
    setSelectedYear(null);
    setExamPapers([]);
  };

  const handleCheckExam = (id: number, checked: boolean) => {
    setExamChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllExams = () => {
    const allChecked: Record<number, boolean> = {};
    examPapers.forEach((exam) => {
      allChecked[exam.pracExamPaperId] = true;
    });
    setExamChecks(allChecked);
  };

  const handleUncheckAllExams = () => {
    setExamChecks({});
  };

  const handleSaveExams = () => {
    const selected = examPapers.filter((exam) => examChecks[exam.pracExamPaperId]);
    setSelectedExams(prev => [...prev, ...selected]);
    setShowExamPopup(false);
  };

  const handleRemoveExam = (id: number) => {
    setSelectedExams((prev) => prev.filter((c) => c.pracExamPaperId !== id));
  };

  // Xem chi tiết đề thi
  const handleShowDetail = async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/PracticeExamPaper/DetailExamPaper/${examPaperId}`);
      if (!res.ok) throw new Error('Không lấy được chi tiết đề thi');
      const data = await res.json();
      setDetailData(data);
    } catch (err: any) {
      setDetailData(null);
      alert(err.message || 'Lỗi lấy chi tiết đề thi');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  // Preview khi hover trong popup chọn đề thi
  const handleMouseEnterExam = async (exam: PracticeExamPaperDTO, e: React.MouseEvent) => {
    setPreviewPosition({ x: e.clientX, y: e.clientY });
    setHoveredExam(exam);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/PracticeExamPaper/DetailExamPaper/${exam.pracExamPaperId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetailData(data);
    } catch {
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };
  const handleMouseLeaveExam = () => {
    setHoveredExam(null);
    setPreviewPosition(null);
    setDetailData(null);
  };

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teacherId = getUserIdFromToken();
      if (!subjectId) throw new Error('Không lấy được subjectId');
      if (!semesterId) throw new Error('Không lấy được semesterId');
      if (!selectedGradeComponent) throw new Error('Vui lòng chọn đầu điểm');
      if (!examName || !examDate || !duration || !selectedExams.length || !selectedStudents.length) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }
      const payload = {
        pracExamName: examName,
        duration: duration,
        examDate: examDate,
        createAt: new Date().toISOString(),
        teacherId: teacherId,
        categoryExamId: selectedGradeComponent.value,
        subjectId: subjectId,
        classId: classId,
        semesterId: semesterId,
        practiceExamPaperDTO: selectedExams.map(e => ({
          pracExamPaperId: e.pracExamPaperId,
          pracExamPaperName: e.pracExamPaperName
        })),
        studentIds: selectedStudents.map((s: any) => s.studentId)
      };
      const res = await fetch(`${API_URL}/api/PracticeExam/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Tạo bài kiểm tra thất bại');
      alert('Tạo bài kiểm tra thành công!');
      router.push(`/teacher/myclass/classdetail/${classId.toString()}`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo bài kiểm tra');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo bài kiểm tra tự luận</h2>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Filter & Info */}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <input
              type="text"
              value={examName}
              onChange={e => setExamName(e.target.value)}
              className="border rounded px-3 py-2 w-64"
              placeholder="Tên bài kiểm tra"
              required
            />
            <div className="w-44">
              <Select
                options={gradeComponents}
                value={selectedGradeComponent}
                onChange={setSelectedGradeComponent}
                placeholder="Chọn đầu điểm"
                isClearable={false}
                isSearchable={false}
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
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="border rounded px-3 py-2 w-44"
              required
              placeholder="Chọn ngày thi"
            />
            <div className="relative w-32 z-20">
              <input
                type="number"
                min={1}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="border rounded px-3 py-2 w-full"
                placeholder="Thời lượng (phút)"
              />
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
              onClick={handleOpenStudentPopup}
            >
              Chọn sinh viên
            </button>
            {selectedStudents.length > 0 && (
              <span className="text-base text-blue-700">
                Đã chọn {selectedStudents.length} sinh viên
              </span>
            )}
          </div>

          {/* Popup chọn sinh viên */}
          {showStudentPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative animate-popup">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setShowStudentPopup(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Danh sách sinh viên trong lớp
                </h3>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition font-semibold"
                    onClick={handleCheckAllStudents}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 transition font-semibold"
                    onClick={handleUncheckAllStudents}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
                <div className="overflow-x-auto rounded shadow bg-white mb-4">
                  <table className="min-w-[500px] w-full text-sm md:text-base border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-semibold">
                        <th className="py-2 px-2 border-b w-10 text-center">STT</th>
                        <th className="py-2 px-2 border-b w-32 text-left">Mã sinh viên</th>
                        <th className="py-2 px-2 border-b w-40 text-left">Họ và tên</th>
                        <th className="py-2 px-2 border-b w-20 text-center">Chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((sv, idx) => (
                        <tr key={sv.studentId} className="hover:bg-blue-50 transition">
                          <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                          <td className="py-2 px-2 border-b">{sv.studentId}</td>
                          <td className="py-2 px-2 border-b">{sv.fullName}</td>
                          <td className="py-2 px-2 border-b text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) =>
                                handleCheckStudent(sv.studentId, e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chọn đề thi */}
          <div className="mt-6">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
              onClick={handleOpenExamPopup}
            >
              Chọn đề thi
            </button>
          </div>

          {/* Popup chọn đề thi */}
          {showExamPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl relative animate-popup">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setShowExamPopup(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Danh sách đề thi tự luận
                </h3>
                <div className="flex gap-4 mb-4">
                  <div className="w-44">
                    <Select
                      options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                      value={selectedSemester}
                      onChange={option => {
                        setSelectedSemester(option);
                        setExamPapers([]);
                      }}
                      placeholder="Chọn kỳ"
                      isClearable
                      isSearchable={false}
                    />
                  </div>
                  <div className="w-32">
                    <Select
                      options={years}
                      value={selectedYear}
                      onChange={option => {
                        setSelectedYear(option);
                        setExamPapers([]);
                      }}
                      placeholder="Năm"
                      isClearable
                      isSearchable={false}
                    />
                  </div>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-semibold"
                    onClick={handleCheckAllExams}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition font-semibold"
                    onClick={handleUncheckAllExams}
                  >
                    Bỏ chọn tất cả
                  </button>

                  {/* Nút tạo đề thi */}
                 <Link
                  href={`/teacher/myexampaper/createexampaper/${classId}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
               
                >
                  Tạo đề thi
                </Link>
                </div>
                {loadingExams ? (
                  <div>Đang tải đề thi...</div>
                ) : (
                  <div className="overflow-x-auto rounded shadow bg-white mb-4">
                    <table className="min-w-[500px] w-full text-sm md:text-base border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-semibold">
                          <th className="py-2 px-2 border-b w-10 text-center">STT</th>
                          <th className="py-2 px-2 border-b w-64 text-left">Tên đề thi</th>
                          <th className="py-2 px-2 border-b w-24 text-center">Kỳ</th>
                          <th className="py-2 px-2 border-b w-24 text-center">Năm</th>
                          <th className="py-2 px-2 border-b w-20 text-center">Chọn</th>
                          <th className="py-2 px-2 border-b w-24 text-center">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examPapers.map((exam, idx) => (
                          <tr
                            key={exam.pracExamPaperId}
                            className="hover:bg-blue-50 transition relative"
                            onMouseEnter={e => handleMouseEnterExam(exam, e)}
                            onMouseLeave={handleMouseLeaveExam}
                          >
                            <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                            <td className="py-2 px-2 border-b">{exam.pracExamPaperName}</td>
                            <td className="py-2 px-2 border-b text-center">{exam.semester}</td>
                            <td className="py-2 px-2 border-b text-center">{exam.year}</td>
                            <td className="py-2 px-2 border-b text-center">
                              <input
                                type="checkbox"
                                checked={!!examChecks[exam.pracExamPaperId]}
                                onChange={(e) =>
                                  handleCheckExam(exam.pracExamPaperId, e.target.checked)
                                }
                              />
                            </td>
                            <td className="py-2 px-2 border-b text-center">
                              <button
                                type="button"
                                className="text-blue-600 underline"
                                onClick={() => handleShowDetail(exam.pracExamPaperId)}
                              >
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Popup preview chi tiết đề thi - render ngoài bảng */}
                    {hoveredExam && previewPosition && (
                      <div
                        style={{
                          position: 'fixed',
                          left: previewPosition.x + 20,
                          top: previewPosition.y - 20,
                          zIndex: 1000,
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          padding: '12px',
                          minWidth: '320px',
                          maxWidth: '420px',
                          pointerEvents: 'none'
                        }}
                      >
                        {loadingDetail ? (
                          <div>Đang tải chi tiết...</div>
                        ) : detailData ? (
                          <div>
                            <div className="mb-2"><b>Tên đề thi:</b> {detailData.pracExamPaperName}</div>
                            <div className="mb-2"><b>Môn học:</b> {detailData.subjectName}</div>
                            <div className="mb-2"><b>Học kỳ:</b> {detailData.semesterName}</div>
                            <div className="mb-2"><b>Danh mục kỳ thi:</b> {detailData.categoryExamName}</div>
                            <div className="mb-2"><b>Trạng thái:</b> {detailData.status}</div>
                            <div className="mb-2"><b>Ngày tạo:</b> {new Date(detailData.createAt).toLocaleString()}</div>
                            <div className="mb-2"><b>Câu hỏi:</b></div>
                            <ul className="list-decimal pl-6">
                              {detailData.questions.map(q => (
                                <li key={q.questionOrder} className="mb-2">
                                  <div><b>Câu {q.questionOrder}:</b> {q.content}</div>
                                  <div><b>Đáp án:</b> {q.answerContent}</div>
                                  <div><b>Điểm:</b> {q.score}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div>Không có dữ liệu chi tiết.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSaveExams}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Lưu
                  </button>
                </div>
              </div>
              {/* Popup chi tiết đề thi */}
              {showDetail && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative animate-popup">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                      onClick={handleCloseDetail}
                      aria-label="Đóng"
                    >
                      ×
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-gray-700">
                      Chi tiết đề thi
                    </h3>
                    {loadingDetail ? (
                      <div>Đang tải chi tiết...</div>
                    ) : detailData ? (
                      <div>
                        <div className="mb-2"><b>Tên đề thi:</b> {detailData.pracExamPaperName}</div>
                        <div className="mb-2"><b>Môn học:</b> {detailData.subjectName}</div>
                        <div className="mb-2"><b>Học kỳ:</b> {detailData.semesterName}</div>
                        <div className="mb-2"><b>Danh mục kỳ thi:</b> {detailData.categoryExamName}</div>
                        <div className="mb-2"><b>Trạng thái:</b> {detailData.status}</div>
                        <div className="mb-2"><b>Ngày tạo:</b> {new Date(detailData.createAt).toLocaleString()}</div>
                        <div className="mb-2"><b>Câu hỏi:</b></div>
                        <ul className="list-decimal pl-6">
                          {detailData.questions.map(q => (
                            <li key={q.questionOrder} className="mb-2">
                              <div><b>Câu {q.questionOrder}:</b> {q.content}</div>
                              <div><b>Đáp án:</b> {q.answerContent}</div>
                              <div><b>Điểm:</b> {q.score}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>Không có dữ liệu chi tiết.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bảng đề thi đã chọn */}
          {selectedExams.length > 0 && (
            <div className="overflow-x-auto rounded shadow bg-white mt-6 w-full">
              <table className="min-w-[500px] w-full text-sm md:text-base border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold">
                    <th className="py-2 px-2 border-b w-10 text-center">STT</th>
                    <th className="py-2 px-2 border-b w-64 text-left">Tên đề thi</th>
                    <th className="py-2 px-2 border-b w-24 text-center">Kỳ</th>
                    <th className="py-2 px-2 border-b w-24 text-center">Năm</th>
                    <th className="py-2 px-2 border-b w-20 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExams.map((exam, idx) => (
                    <tr
                      key={exam.pracExamPaperId}
                      className="hover:bg-blue-50 transition relative"
                    >
                      <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                      <td className="py-2 px-2 border-b">{exam.pracExamPaperName}</td>
                      <td className="py-2 px-2 border-b text-center">{exam.semester}</td>
                      <td className="py-2 px-2 border-b text-center">{exam.year}</td>
                      <td className="py-2 px-2 border-b text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveExam(exam.pracExamPaperId)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4">
                <div className="font-semibold text-base">
                  Tổng số đề thi đã chọn: <span className="text-blue-700">{selectedExams.length}</span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}
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