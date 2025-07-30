'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { getUserIdFromToken } from '@/utils/tokenUtils';

const API_URL = "https://localhost:7074";

interface SubjectDTO {
  subjectId: number;
  subjectName: string;
}

interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

interface PracExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  semesterName: string;
}

interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string | null;
  status: string | null;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export default function CreateFinalPracExamPage() {
  const router = useRouter();
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);

  // Đề thi
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [examChecks, setExamChecks] = useState<Record<number, boolean>>({});
  const [examPapers, setExamPapers] = useState<PracExamPaperDTO[]>([]);
  const [selectedExams, setSelectedExams] = useState<PracExamPaperDTO[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Chi tiết đề thi
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Preview đề thi khi hover (chỉ trong popup)
  const [hoveredExam, setHoveredExam] = useState<PracExamPaperDTO | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  // Lấy danh sách môn học và kỳ
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    fetch(`${API_URL}/api/FinalExam/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => setSubjects(data || []));
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => setSemesters(data || []));
  }, []);

  // Lấy danh sách đề thi khi mở popup
  const fetchExamPapers = async () => {
    setLoadingExams(true);
    try {
      if (!selectedSubject || !selectedSemester) throw new Error('Vui lòng chọn môn học và kỳ');
      const res = await fetch(
        `${API_URL}/api/FinalExam/GetAllFinalExamPaper?subjectId=${selectedSubject.value}&semesterId=${selectedSemester.value}`
      );
      if (!res.ok) throw new Error('Không lấy được danh sách đề thi');
      const exams = await res.json();
      setExamPapers(
        (exams || []).filter(
          (e: PracExamPaperDTO) =>
            !selectedExams.some(se => se.pracExamPaperId === e.pracExamPaperId)
        )
      );
    } catch (err: any) {
      setExamPapers([]);
      alert(err.message || 'Lỗi lấy danh sách đề thi');
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    if (showExamPopup && selectedSubject && selectedSemester) {
      fetchExamPapers();
    }
    // eslint-disable-next-line
  }, [showExamPopup, selectedSubject, selectedSemester]);

  // Popup chọn đề thi
  const handleOpenExamPopup = () => {
    setExamChecks({});
    setShowExamPopup(true);
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
      const res = await fetch(`${API_URL}/api/FinalExam/ViewFinalExamPaperDetail/${examPaperId}`);
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
  const handleMouseEnterExam = async (exam: PracExamPaperDTO, e: React.MouseEvent) => {
    setPreviewPosition({ x: e.clientX, y: e.clientY });
    setHoveredExam(exam);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/FinalExam/ViewFinalExamPaperDetail/${exam.pracExamPaperId}`);
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
      if (!selectedSubject) throw new Error('Vui lòng chọn môn học');
      if (!selectedSemester) throw new Error('Vui lòng chọn kỳ');
      if (!examName || !selectedExams.length) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }
      const payload = {
        pracExamName: examName,
        teacherId: teacherId,
        subjectId: selectedSubject.value,
        semesterId: selectedSemester.value,
        practiceExamPaperDTO: selectedExams.map(e => ({
          pracExamPaperId: e.pracExamPaperId
        }))
      };
      const res = await fetch(`${API_URL}/api/FinalExam/CreateFinalPracExam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Tạo bài kiểm tra thất bại');
      alert('Tạo bài kiểm tra thành công!');
      router.push(`/teacher/finalexam`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo bài kiểm tra');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo bài kiểm tra thực hành cuối kỳ</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Tên bài kiểm tra</label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                className="border rounded px-3 py-2 w-64"
                placeholder="Tên bài kiểm tra"
                required
              />
            </div>
            <div className="flex flex-col w-64">
              <label className="mb-1 font-semibold text-gray-700">Chọn môn học</label>
              <Select
                options={subjects.map(s => ({ value: s.subjectId, label: s.subjectName }))}
                value={selectedSubject}
                onChange={setSelectedSubject}
                placeholder="Chọn môn học"
                isSearchable
              />
            </div>
            <div className="flex flex-col w-44">
              <label className="mb-1 font-semibold text-gray-700">Chọn kỳ</label>
              <Select
                options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                value={selectedSemester}
                onChange={setSelectedSemester}
                placeholder="Chọn kỳ"
                isSearchable
              />
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold self-end"
              onClick={handleOpenExamPopup}
              disabled={!selectedSubject || !selectedSemester}
            >
              Chọn đề thi
            </button>
          </div>

          {/* Popup chọn đề thi */}
          {showExamPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative animate-popup">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setShowExamPopup(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Danh sách đề thi thực hành cuối kỳ
                </h3>
                <div className="flex gap-4 mb-4">
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
                            <td className="py-2 px-2 border-b text-center">{exam.semesterName}</td>
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
                      <td className="py-2 px-2 border-b text-center">{exam.semesterName}</td>
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

