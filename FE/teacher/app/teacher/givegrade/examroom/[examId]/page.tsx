'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExamGradingDetail } from '@/hooks/teacher/useExamGradingDetail';

function ExamGradingDetailContent({ examId }: { examId: number }) {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const {
    examInfo,
    loading,
    showConfirmModal,
    setShowConfirmModal,
    handleGradeStudent,
    handleConfirm,
    handleBack,
    formatDate,
    getStatusBadgeProps,
    getProgressStats,
    handleOpenConfirm
  } = useExamGradingDetail(examId, action);

  const { total, graded, percentage } = getProgressStats();


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header với breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button
              onClick={handleBack}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Quản lý chấm thi
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">Chi tiết phòng thi</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Chi tiết phòng thi</h1>
            </div>
            
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium text-gray-700">Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : examInfo ? (
          <>
            {/* Exam Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{examInfo.examName}</h2>
                      <p className="text-gray-600">Môn thi: {examInfo.subjectName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0V7a1 1 0 00-1-1H7a1 1 0 00-1 1v0a1 1 0 001 1h10a1 1 0 001-1v0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Ca thi</p>
                        <p className="font-semibold text-gray-900">{examInfo.slotName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian</p>
                        <p className="font-semibold text-gray-900">{examInfo.duration} phút</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 col-span-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0V7a1 1 0 00-1-1H7a1 1 0 00-1 1v0a1 1 0 001 1h10a1 1 0 001-1v0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Ngày thi</p>
                        <p className="font-semibold text-gray-900">{formatDate(examInfo.startDay)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tiến độ chấm bài</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Đã chấm</span>
                      <span className="text-2xl font-bold text-blue-600">{graded}/{total}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{percentage}% hoàn thành</span>
                      <span className="text-gray-600">{total - graded} còn lại</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Danh sách sinh viên</h3>
                  <div className="text-sm text-gray-500">
                    Tổng: {total} sinh viên
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh viên</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mã số</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {examInfo.students.map((student, idx) => {
                      const statusProps = getStatusBadgeProps(student.isGraded);
                      return (
                        <tr key={student.studentId} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {student.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {student.studentCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={statusProps.className}>
                              <div className={statusProps.dotClass}></div>
                              {statusProps.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {student.isGraded === 1 ? (
                              <span className="text-lg font-bold text-blue-600">{student.score}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {student.isGraded === 0 ? (
                              <button
                                onClick={() => handleGradeStudent(student.studentId)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Chấm bài
                              </button>
                            ) : (
                              action === 'edit' ? (
                                <button
                                  onClick={() => handleGradeStudent(student.studentId)}
                                  className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Sửa điểm
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  ✓ Hoàn thành
                                </span>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!examInfo.students || examInfo.students.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">Không có sinh viên nào</p>
                            <p className="text-gray-400 text-sm">Phòng thi này chưa có sinh viên được phân công</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại danh sách</span>
              </button>
              
              {action !== 'edit' && (
                <button
                  onClick={handleOpenConfirm}
                  disabled={graded !== total}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Xác nhận hoàn thành phòng thi</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy thông tin bài thi</h2>
              <p className="text-gray-600">Vui lòng kiểm tra lại hoặc thử lại sau</p>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Xác nhận hoàn thành</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Bạn có chắc chắn muốn đánh dấu phòng thi này là đã hoàn thành chấm bài?
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors duration-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200 shadow-lg"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function ExamGradingDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId: examIdString } = await params;
  const examId = Number(examIdString);

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
      <ExamGradingDetailContent examId={examId} />
    </Suspense>
  );
}