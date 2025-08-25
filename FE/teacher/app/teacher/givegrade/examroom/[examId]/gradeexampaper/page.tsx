'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { useGradeExamPaper } from '@/hooks/teacher/useGradeExamPaper';

function GradeExamPaperContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const examSlotRoomId = params.examId as string;
  const studentId = searchParams.get('studentId');

  const {
    examDetail,
    scores,
    totalScore,
    showCriteria,
    loading,
    showConfirmPopup,
    suggesting,
    suggestResult,
    handleScoreChange,
    handleSuggestScore,
    handleApplySuggestScore,
    toggleCriteria,
    handleConfirm,
    handleBack,
    openConfirmPopup,
    closeConfirmPopup,
    getTotalMaxScore
  } = useGradeExamPaper(examSlotRoomId, studentId);

  const getGradedQuestionsCount = () => {
    return Object.values(scores).filter(score => score !== '').length;
  };

  const calculateTotalFromQuestions = () => {
    return Object.values(scores).reduce((total: number, score) => {
      return total + (typeof score === 'number' ? score : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-700">Đang tải dữ liệu bài thi...</span>
        </div>
      </div>
    );
  }

  if (!examDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">📄</div>
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
                onClick={handleBack}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">Chấm bài thi</h1>
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
            </div>
          </div>
        </div>

        {/* Total Score Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Tổng điểm bài thi</h3>
              <p className="text-sm text-green-600">
                Điểm từ các câu hỏi: <span className="font-semibold">{calculateTotalFromQuestions()}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Tổng điểm cuối cùng:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={0}
                    max={getTotalMaxScore()}
                    step={0.1}
                    value={totalScore}
                    onChange={e => handleScoreChange(-1, Number(e.target.value) || 0)}
                    className="border border-green-300 rounded-lg px-4 py-2 w-24 text-center font-bold text-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <span className="text-green-700 font-medium">/ {getTotalMaxScore()}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{Math.round((totalScore / getTotalMaxScore()) * 100)}%</div>
                <div className="text-sm text-green-600">Tỷ lệ đạt</div>
              </div>
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
                    Câu hỏi {index + 1} <span className="text-sm font-normal text-gray-600">(Tối đa: {q.maxScore || 10} điểm)</span>
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
                    onClick={() => toggleCriteria(q.questionId)}
                  >
                    <svg className={`w-5 h-5 transition-transform duration-200 ${showCriteria[q.questionId] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{showCriteria[q.questionId] ? 'Ẩn tiêu chí chấm điểm' : 'Xem tiêu chí chấm điểm'}</span>
                  </button>
                  
                  {showCriteria[q.questionId] && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Tiêu chí chấm điểm:</h4>
                      <div className="text-gray-700 leading-relaxed">
                        {(() => {
                          let criteria: { criterionName: string; weightPercent: number; description: string }[] = [];

                          // Nếu là mảng object (trường hợp của bạn)
                          if (Array.isArray(q.gradingCriteria)) {
                            criteria = q.gradingCriteria;
                          }
                          // Nếu là string (trường hợp backend trả về string JSON)
                          else if (typeof q.gradingCriteria === "string") {
                            try {
                              const parsed = JSON.parse(q.gradingCriteria);
                              if (Array.isArray(parsed)) criteria = parsed;
                            } catch {
                              // Không phải JSON, trả về nguyên văn
                              return <span>{q.gradingCriteria}</span>;
                            }
                          }
                          // Nếu không có tiêu chí hợp lệ
                          if (!criteria.length) return <span>{q.gradingCriteria}</span>;

                          // Hiển thị danh sách tiêu chí
                          return (
                            <ul className="list-disc pl-6 space-y-2">
                              {criteria.map((c, idx) => (
                                <li key={idx}>
                                  <span className="font-semibold text-blue-800">{c.criterionName}</span>
                                  {typeof c.weightPercent === "number" && (
                                    <span className="ml-2 text-sm text-gray-500">({c.weightPercent}%)</span>
                                  )}
                                  {c.description && (
                                    <div className="text-gray-700">{c.description}</div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>
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
                        {[0, Math.round((q.maxScore || 10) * 0.5), Math.round((q.maxScore || 10) * 0.8), q.maxScore || 10].map((score,idx) => (
                          <button
                            key={`${q.questionId}-${score}-${idx}`} 
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
                        max={q.maxScore || 10}
                        step={0.1}
                        value={scores[q.questionId] ?? ''}
                        onChange={e => handleScoreChange(q.questionId, e.target.value === '' ? '' : Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`0-${q.maxScore || 10}`}
                      />
                      <span className="text-gray-500">/ {q.maxScore || 10}</span>
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

                      {/* Hiển thị từng tiêu chí */}
                      {Array.isArray(suggestResult[q.questionId]?.criterionScores) && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-green-700 mb-2">Chi tiết từng tiêu chí:</p>
                          <ul className="list-disc pl-6 space-y-2">
                            {suggestResult[q.questionId]!.criterionScores!.map(
                              (c: { criterionName: string; achievementPercent: number; weightedScore: number; explanation: string }, idx: number) => (
                                <li key={idx}>
                                  <span className="font-semibold text-blue-800">{c.criterionName}</span>
                                  <span className="ml-2 text-sm text-gray-500">
                                    - Đạt: {c.achievementPercent}% | Điểm: {c.weightedScore}
                                  </span>
                                  {c.explanation && (
                                    <div className="text-gray-700">Giải thích: {c.explanation}</div>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Tổng điểm và giải thích tổng */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-green-700">Điểm đề xuất:</span>
                          <span className="px-3 py-1 bg-green-600 text-white rounded-lg font-bold">
                            {suggestResult[q.questionId]!.totalScore}/{q.maxScore || 10}
                          </span>
                        </div>
                      </div>
                      {suggestResult[q.questionId]!.overallExplanation && (
                        <div className="mt-2 text-gray-700">
                          <span className="font-medium text-green-700">Nhận xét tổng quan: </span>
                          {suggestResult[q.questionId]!.overallExplanation}
                        </div>
                      )}

                      <div className="mt-4 text-right">
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                          type="button"
                          onClick={() => handleApplySuggestScore(q, suggestResult[q.questionId]!.totalScore)}
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
            onClick={openConfirmPopup}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            type="button"
          >
            ✅ Hoàn thành chấm bài
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
                  Bạn có chắc chắn muốn hoàn thành chấm bài cho sinh viên <strong>{examDetail.fullName}</strong>?
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Tổng điểm: <span className="font-bold text-xl">{totalScore}</span> / {getTotalMaxScore()} điểm
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={closeConfirmPopup}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors duration-200"
                  type="button"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    closeConfirmPopup();
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

export default function GradeStudentPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-700">Đang tải trang...</span>
          </div>
        </div>
      }
    >
      <GradeExamPaperContent />
    </Suspense>
  );
}
