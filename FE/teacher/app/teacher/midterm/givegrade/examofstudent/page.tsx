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
        showToast("error", "Lỗi khi lấy dữ liệu bài thi");
      }
      setLoading(false);
    }
    fetchExamDetail();
  }, [teacherId, examId, studentId, examType]);

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

  const handleSuggestScore = async (q: QuestionDTO) => {
    setSuggesting(prev => ({ ...prev, [q.questionId]: true }));
    setSuggestResult(prev => ({ ...prev, [q.questionId]: null }));
    try {
      const body = {
        questionContent: q.content,
        answerContent: q.studentAnswer,
        bandScoreGuide: q.gradingCriteria,
        materialLink: MATERIAL_LINK,
        maxScore: 10
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
      showToast("error", "Lỗi khi lấy gợi ý chấm điểm!");
    }
    setSuggesting(prev => ({ ...prev, [q.questionId]: false }));
  };

  const handleApplySuggestScore = async (q: QuestionDTO, score: number) => {
    await handleScoreChange(q.questionId, score);
    setScores(prev => ({ ...prev, [q.questionId]: score }));
    setSuggestResult(prev => ({ ...prev, [q.questionId]: null }));
  };

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

  const getGradedQuestionsCount = () => {
    return Object.values(scores).filter(score => score !== '').length;
  };

  const getTotalScore = () => {
    return Object.values(scores).reduce((total, score) => {
      return total + (typeof score === 'number' ? score : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-700">Đang tải dữ liệu bài thi giữa kỳ...</span>
        </div>
      </div>
    );
  }

  if (!examDetail || !Array.isArray(examDetail.questions)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không có dữ liệu bài thi</h2>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ToastContainer />
      
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">Chấm bài giữa kỳ</h1>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{getGradedQuestionsCount()}</span>
                /{examDetail.questions.length} câu đã chấm
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(getGradedQuestionsCount() / examDetail.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {examDetail.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{examDetail.fullName}</h2>
              <p className="text-gray-600">Mã sinh viên: <span className="font-semibold">{examDetail.studentCode}</span></p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Bài thi giữa kỳ
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Tổng điểm hiện tại</div>
              <div className="text-3xl font-bold text-blue-600">{getTotalScore()}</div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {examDetail.questions.map((q, index) => (
            <div key={q.questionId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">
                    Câu hỏi {index + 1}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {scores[q.questionId] !== '' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ Đã chấm
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Question Content */}
                <div className="mb-6">
                  <div className="text-gray-800 font-medium leading-relaxed text-lg">{q.content}</div>
                </div>

                {/* Grading Criteria Toggle */}
                <div className="mb-6">
                  <button
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    type="button"
                    onClick={() => setShowCriteria(prev => ({ ...prev, [q.questionId]: !prev[q.questionId] }))}
                  >
                    <svg className={`w-5 h-5 transition-transform duration-200 ${showCriteria[q.questionId] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{showCriteria[q.questionId] ? 'Ẩn tiêu chí chấm điểm' : 'Xem tiêu chí chấm điểm'}</span>
                  </button>
                  
                  {showCriteria[q.questionId] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Tiêu chí chấm điểm:</h4>
                      <div className="text-gray-700 leading-relaxed">{q.gradingCriteria}</div>
                    </div>
                  )}
                </div>

                {/* Student Answer */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Câu trả lời của sinh viên:</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 leading-relaxed min-h-[100px]">
                    {q.studentAnswer || "Sinh viên chưa trả lời câu hỏi này."}
                  </div>
                </div>

                {/* Scoring Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Chấm điểm</h4>
                    <div className="flex items-center space-x-3">
                      {/* Quick Score Buttons */}
                      <div className="flex space-x-2">
                        {[0, 5, 8, 10].map(score => (
                          <button
                            key={score}
                            onClick={() => handleScoreChange(q.questionId, score)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              scores[q.questionId] === score 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                            type="button"
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="font-medium text-gray-700">Điểm:</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={scores[q.questionId] ?? ''}
                        onChange={e => handleScoreChange(q.questionId, e.target.value === '' ? '' : Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0-10"
                      />
                      <span className="text-gray-500">/ 10</span>
                    </div>

                    <button
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        suggesting[q.questionId] 
                          ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-md hover:shadow-lg'
                      }`}
                      type="button"
                      disabled={suggesting[q.questionId]}
                      onClick={() => handleSuggestScore(q)}
                    >
                      {suggesting[q.questionId] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span>Đang phân tích...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>Gợi ý AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Suggestion Result */}
                  {suggestResult[q.questionId] && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h5 className="font-semibold text-green-800">Gợi ý từ AI</h5>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-green-700 mb-2">Giải thích:</p>
                        <p className="text-gray-700 leading-relaxed">
                          {suggestResult[q.questionId]?.Explanation || suggestResult[q.questionId]?.explanation}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-green-700">Điểm đề xuất:</span>
                          <span className="px-3 py-1 bg-green-600 text-white rounded-lg font-bold">
                            {suggestResult[q.questionId]?.Score ?? suggestResult[q.questionId]?.score}/10
                          </span>
                        </div>
                        
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                          type="button"
                          onClick={() => handleApplySuggestScore(q, suggestResult[q.questionId]?.Score ?? suggestResult[q.questionId]?.score || 0)}
                        >
                          Áp dụng điểm này
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowConfirmPopup(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            type="button"
          >
            ✅ Hoàn thành chấm bài giữa kỳ
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-pulse">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Xác nhận hoàn thành</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bạn có chắc chắn muốn hoàn thành chấm bài giữa kỳ cho sinh viên <strong>{examDetail.fullName}</strong>?
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Tổng điểm: <span className="font-bold text-xl">{getTotalScore()}</span> điểm
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmPopup(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors duration-200"
                  type="button"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    setShowConfirmPopup(false);
                    handleConfirm();
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200 shadow-lg"
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