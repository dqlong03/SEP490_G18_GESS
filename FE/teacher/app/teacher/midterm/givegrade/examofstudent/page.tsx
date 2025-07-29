'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@utils/tokenUtils';
import { ToastContainer } from "react-toastify";
import { showToast } from "@/utils/toastUtils";

type QuestionDTO = {
  questionId: number;
  content: string;
  gradingCriteria: string;
  studentAnswer: string;
  score: number;
  pracExamHistoryId: string;
  practiceQuestionId: number;
};

type StudentExamDetail = {
  studentId: string;
  studentCode: string;
  fullName: string;
  pracExamId: number;
  questions: QuestionDTO[];
};

type SuggestResult = {
  Score?: number;
  score?: number;
  Explanation?: string;
  explanation?: string;
};

const API_BASE = 'https://localhost:7074/api/GradeScheduleMidTerm';
const SUGGEST_API = `https://localhost:7074/api/AIGradePracExam/GradeEssayAnswer`;
const MATERIAL_LINK = "https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0#heading=h.bllyran0q013";

export default function GradeMidtermStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = getUserIdFromToken();
  const examId = searchParams.get('examId');
  const studentId = searchParams.get('studentId');
  const examType = searchParams.get('examType') || '2';

  const [examDetail, setExamDetail] = useState<StudentExamDetail | null>(null);
  const [scores, setScores] = useState<{ [qid: number]: number | '' }>({});
  const [showCriteria, setShowCriteria] = useState<{ [qid: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Gợi ý chấm điểm AI
  const [suggesting, setSuggesting] = useState<{ [qid: number]: boolean }>({});
  const [suggestResult, setSuggestResult] = useState<{ [qid: number]: SuggestResult | null }>({});

  useEffect(() => {
  async function fetchExamDetail() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/teacher/${teacherId}/exam/${examId}/student/${studentId}/submission?examType=${examType}`
      );
      if (!res.ok) throw new Error('Không lấy được dữ liệu bài thi');
      const raw = await res.json();
      const data: StudentExamDetail = {
        studentId: raw.studentId,
        studentCode: raw.studentCode,
        fullName: raw.fullName,
        pracExamId: raw.pracExamHistoryId,
        questions: (raw.questionPracExamDTO || []).map((q: any) => ({
          questionId: q.practiceQuestionId,
          content: q.questionContent,
          gradingCriteria: q.gradingCriteria,
          studentAnswer: q.answer,
          score: q.gradedScore ?? q.score ?? 0,
          pracExamHistoryId: q.pracExamHistoryId,
          practiceQuestionId: q.practiceQuestionId,
        })),
      };
      setExamDetail(data);
      const initialScores: { [qid: number]: number | '' } = {};
      data.questions.forEach(q => {
        initialScores[q.questionId] = q.score ?? '';
      });
      setScores(initialScores);
    } catch (err) {
      alert('Lỗi khi lấy dữ liệu bài thi');
    }
    setLoading(false);
  }
  fetchExamDetail();
}, [teacherId, examId, studentId, examType]);

  // Chấm điểm từng câu
  const handleScoreChange = async (qid: number, value: number | '') => {
    setScores(prev => ({ ...prev, [qid]: value }));
    if (
      teacherId &&
      examDetail &&
      examDetail.pracExamId &&
      value !== '' &&
      examDetail.questions
    ) {
      const question = examDetail.questions.find(q => q.questionId === qid);
      if (!question) return;
      try {
        await fetch(
          `${API_BASE}/teacher/${teacherId}/exam/${examId}/student/${studentId}/grade`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pracExamHistoryId: question.pracExamHistoryId,
              practiceQuestionId: question.practiceQuestionId,
              gradedScore: value,
            }),
          }
        );
        showToast("success", "Cập nhật điểm thành công!");
      } catch (err) {
        showToast("error", "Lỗi khi gửi điểm!");
      }
    }
  };

  // Gợi ý chấm điểm AI
  const handleSuggestScore = async (q: QuestionDTO) => {
    setSuggesting(prev => ({ ...prev, [q.questionId]: true }));
    setSuggestResult(prev => ({ ...prev, [q.questionId]: null }));
    try {
      const body = {
        questionContent: q.content,
        answerContent: q.studentAnswer,
        bandScoreGuide: q.gradingCriteria,
        materialLink: MATERIAL_LINK,
        maxScore: 10 // hoặc lấy từ dữ liệu, ví dụ 10 điểm
      };
      const res = await fetch(SUGGEST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Không lấy được gợi ý chấm điểm');
      const result = await res.json();
      setSuggestResult(prev => ({ ...prev, [q.questionId]: result }));
    } catch (err) {
      setSuggestResult(prev => ({ ...prev, [q.questionId]: null }));
      alert('Lỗi khi lấy gợi ý chấm điểm!');
    }
    setSuggesting(prev => ({ ...prev, [q.questionId]: false }));
  };

  // Áp dụng điểm gợi ý
  const handleApplySuggestScore = async (q: QuestionDTO, score: number) => {
    await handleScoreChange(q.questionId, score);
    setScores(prev => ({ ...prev, [q.questionId]: score }));
    setSuggestResult(prev => ({ ...prev, [q.questionId]: null })); // Ẩn div gợi ý sau khi áp dụng
  };

  // Xác nhận chấm xong bài
  const handleConfirm = async () => {
    try {
      let totalScore = 0;
      if (examDetail && examDetail.questions) {
        examDetail.questions.forEach(q => {
          const score = scores[q.questionId];
          if (typeof score === 'number') totalScore += score;
        });
      }
      const res = await fetch(
        `https://localhost:7074/api/GradeScheduleMidTerm/examId/${examId}/student/${studentId}/mark-graded`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalScore }),
        }
      );
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái chấm bài!');
      showToast("success", "Đã chuyển trạng thái chấm bài thành công!");
      router.back();
    } catch (err) {
      showToast("error", "Lỗi khi cập nhật trạng thái chấm bài!");
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!examDetail || !Array.isArray(examDetail.questions)) return <div>Không có dữ liệu bài thi.</div>;

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <ToastContainer />
      <div className="w-full py-8 px-4 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
          type="button"
        >
          ← Quay lại danh sách sinh viên
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chấm bài cho sinh viên</h2>
        <div className="mb-2">
          <span className="font-semibold">Tên sinh viên:</span> {examDetail.fullName}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Mã sinh viên:</span> {examDetail.studentCode}
        </div>
        {examDetail.questions.map(q => (
          <div key={q.questionId} className="mb-6 border rounded p-4 bg-gray-50">
            <div className="mb-2 font-semibold">{q.content}</div>
            <button
              className="text-blue-600 underline text-sm mb-2"
              type="button"
              onClick={() => setShowCriteria(prev => ({ ...prev, [q.questionId]: !prev[q.questionId] }))}
            >
              {showCriteria[q.questionId] ? 'Ẩn tiêu chí chấm' : 'Xem tiêu chí chấm'}
            </button>
            {showCriteria[q.questionId] && (
              <div className="mb-2 text-gray-700 text-sm bg-blue-50 rounded p-2">{q.gradingCriteria}</div>
            )}
            <div className="mb-2">
              <span className="font-semibold">Câu trả lời của sinh viên:</span>
              <div className="bg-white border rounded p-2 mt-1">{q.studentAnswer}</div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="font-semibold">Điểm:</label>
              <input
                type="number"
                min={0}
                value={scores[q.questionId] ?? ''}
                onChange={e => handleScoreChange(q.questionId, e.target.value === '' ? '' : Number(e.target.value))}
                className="border rounded px-2 py-1 w-20"
              />
              <button
                className="ml-2 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-sm font-semibold"
                type="button"
                disabled={suggesting[q.questionId]}
                onClick={() => handleSuggestScore(q)}
              >
                {suggesting[q.questionId] ? 'Đang gợi ý...' : 'Gợi ý chấm AI'}
              </button>
            </div>
            {suggestResult[q.questionId] && (
              <div className="mb-2 mt-2 p-3 border rounded bg-green-50">
                <div className="font-semibold text-green-700">Gợi ý AI:</div>
                <div className="mb-1 text-gray-700">
                  <b>Giải thích:</b> {suggestResult[q.questionId]?.explanation || suggestResult[q.questionId]?.Explanation}
                </div>
                <div className="mb-2 text-gray-700">
                  <b>Điểm gợi ý:</b> {suggestResult[q.questionId]?.score ?? suggestResult[q.questionId]?.Score}
                </div>
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                  type="button"
                  onClick={() => handleApplySuggestScore(q, suggestResult[q.questionId]?.score ?? suggestResult[q.questionId]?.Score || 0)}
                >
                  Áp dụng điểm này
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowConfirmPopup(true)}
          className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
          type="button"
        >
          Xác nhận chấm xong bài
        </button>

        {/* Popup xác nhận */}
        {showConfirmPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-100 z-50">
            <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Xác nhận</h3>
              <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn xác nhận đã chấm xong bài này?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmPopup(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
                  type="button"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowConfirmPopup(false);
                    handleConfirm();
                  }}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
                  type="button"
                >
                 Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}