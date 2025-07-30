'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import Link from 'next/link';


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

export default function ExamPaperListPage() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState<{ value: string; label: string } | null>(null);

  const [examPapers, setExamPapers] = useState<PracExamPaperDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Chi tiết đề thi
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Lấy danh sách môn học, kỳ, năm
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    fetch(`${API_URL}/api/FinalExamPaper/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => setSubjects(data || []));
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => setSemesters(data || []));
    // Năm: 10 năm về trước kể từ năm hiện tại
    const currentYear = new Date().getFullYear();
    const yearArr = [];
    for (let y = currentYear; y > currentYear - 10; y--) {
      yearArr.push({ value: y.toString(), label: y.toString() });
    }
    setYears(yearArr);
  }, []);

  // Lấy danh sách đề thi khi chọn đủ bộ lọc
  useEffect(() => {
    if (selectedSubject && selectedSemester && selectedYear) {
      setLoading(true);
      fetch(`${API_URL}/api/FinalExamPaper/GetAllFinalExamPaper?subjectId=${selectedSubject.value}&semesterId=${selectedSemester.value}&year=${selectedYear.value}`)
        .then(res => res.json())
        .then(data => setExamPapers(data || []))
        .finally(() => setLoading(false));
    } else {
      setExamPapers([]);
    }
  }, [selectedSubject, selectedSemester, selectedYear]);

  // Xem chi tiết đề thi
  const handleShowDetail = async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/FinalExamPaper/ViewFinalExamPaperDetail/${examPaperId}`);
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

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Danh sách đề thi cuối kỳ</h2>
        
        
        <div className="flex flex-wrap gap-4 items-center mb-6">
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
          <div className="flex flex-col w-32">
            <label className="mb-1 font-semibold text-gray-700">Chọn năm</label>
            <Select
              options={years}
              value={selectedYear}
              onChange={setSelectedYear}
             
              isSearchable={false}
            />
          </div>

            <Link href="/teacher/finalexampaper/createfinalpaper" className="bg-blue-600 text-white px-4 py-2 mt-5 rounded hover:bg-blue-700 transition font-semibold shadow">
                Tạo bài thi cuối kỳ </Link>

        </div>
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-[500px] w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-10 text-center">STT</th>
                <th className="py-2 px-2 border-b w-64 text-left">Tên đề thi</th>
                <th className="py-2 px-2 border-b w-24 text-center">Kỳ</th>
                <th className="py-2 px-2 border-b w-20 text-center">Xem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center">Đang tải...</td>
                </tr>
              ) : examPapers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                examPapers.map((exam, idx) => (
                  <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition">
                    <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                    <td className="py-2 px-2 border-b">{exam.pracExamPaperName}</td>
                    <td className="py-2 px-2 border-b text-center">{exam.semesterName}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800"
                        title="Xem chi tiết"
                        onClick={() => handleShowDetail(exam.pracExamPaperId)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 0a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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