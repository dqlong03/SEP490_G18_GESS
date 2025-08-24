"use client";

import { Suspense } from "react";
import { useCreatePracticalExam } from "../../../../../src/hooks/teacher/useCreatePracticalExam";
import Select from "react-select";
import {
  BookOpen,
  Plus,
  Trash2,
  Save,
  PenTool,
  Calendar,
  Settings,
  X,
  ChevronLeft,
  Eye,
  CheckSquare,
  Target,
  Clock,
  FileText,
  AlertCircle
} from "lucide-react";

const CreatePracticalExamClient = () => {
  const {
    examName,
    selectedSubject,
    selectedSemester,
    selectedExams,
    examPapers,
    examChecks,
    showExamPopup,
    showDetail,
    detailData,
    hoveredExam,
    previewPosition,
    loadingExams,
    loadingDetail,
    isSubmitting,
    totalQuestions,
    subjectOptions,
    semesterOptions,
    validationResult,
    setExamName,
    setSelectedSubject,
    setSelectedSemester,
    handleOpenExamPopup,
    handleCheckExam,
    handleCheckAllExams,
    handleUncheckAllExams,
    handleSaveExams,
    handleRemoveExam,
    handleShowDetail,
    handleCloseDetail,
    handleMouseEnterExam,
    handleMouseLeaveExam,
    setShowExamPopup,
    handleSubmit,
  } = useCreatePracticalExam();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo bài thi tự luận cuối kỳ</h1>
                <p className="text-gray-600">Thiết lập và cấu hình bài thi tự luận từ các đề thi có sẵn</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Nhập tên bài kiểm tra"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <Select
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="Chọn môn học"
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9333ea' }
                    }),
                    menu: (provided) => ({ ...provided, zIndex: 20 }),
                  }}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học kỳ <span className="text-red-500">*</span>
                </label>
                <Select
                  options={semesterOptions}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  placeholder="Chọn học kỳ"
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9333ea' }
                    }),
                    menu: (provided) => ({ ...provided, zIndex: 20 }),
                  }}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
                  onClick={handleOpenExamPopup}
                  disabled={!selectedSubject || !selectedSemester}
                >
                  <Plus className="w-4 h-4" />
                  <span>Chọn đề thi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {selectedExams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng đề thi</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedExams.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                    <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Môn học</p>
                    <p className="text-2xl font-bold text-green-600">{selectedSubject?.label || '--'}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Exams Table */}
          {selectedExams.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Danh sách đề thi đã chọn ({selectedExams.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedExams.map((exam, idx) => (
                      <tr key={exam.pracExamPaperId} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <PenTool className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            {exam.semesterName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveExam(exam.pracExamPaperId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa đề thi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">
                    Tổng số đề thi đã chọn: <span className="text-purple-600 font-bold">{selectedExams.length}</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !validationResult.isValid}
                    className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Tạo bài thi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Popup chọn đề thi */}
        {showExamPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Danh sách đề thi thực hành cuối kỳ
                  </h3>
                  <button
                    onClick={() => setShowExamPopup(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllExams}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleUncheckAllExams}
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                {loadingExams ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-500 font-medium">Đang tải đề thi...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[50vh]">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examPapers.map((exam, idx) => (
                          <tr
                            key={exam.pracExamPaperId}
                            className="hover:bg-purple-50 transition-colors duration-200"
                            onMouseEnter={e => handleMouseEnterExam(exam, e)}
                            onMouseLeave={handleMouseLeaveExam}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                  <PenTool className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Calendar className="w-3 h-3 mr-1" />
                                {exam.semesterName}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={!!examChecks[exam.pracExamPaperId]}
                                onChange={(e) =>
                                  handleCheckExam(exam.pracExamPaperId, e.target.checked)
                                }
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                                onClick={() => handleShowDetail(exam.pracExamPaperId)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                <span>Xem</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {examPapers.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có đề thi nào</h3>
                        <p className="text-gray-600">Không tìm thấy đề thi nào cho môn học và học kỳ đã chọn</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Preview popup */}
                {hoveredExam && previewPosition && (
                  <div
                    style={{
                      position: 'fixed',
                      left: Math.min(previewPosition.x + 20, window.innerWidth - 450),
                      top: Math.min(previewPosition.y - 20, window.innerHeight - 300),
                      zIndex: 1000,
                    }}
                    className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 min-w-[400px] max-w-[450px] pointer-events-none"
                  >
                    {loadingDetail ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span className="ml-2 text-gray-500">Đang tải...</span>
                      </div>
                    ) : detailData ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <PenTool className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-900">{detailData.pracExamPaperName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-600">Môn học:</span> <span className="font-medium">{detailData.subjectName}</span></div>
                          <div><span className="text-gray-600">Học kỳ:</span> <span className="font-medium">{detailData.semesterName}</span></div>
                          <div><span className="text-gray-600">Trạng thái:</span> <span className="font-medium">{detailData.status}</span></div>
                          <div><span className="text-gray-600">Số câu:</span> <span className="font-medium">{detailData.questions.length}</span></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Ngày tạo: {new Date(detailData.createAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">Không có dữ liệu</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowExamPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExams}
                    className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu đề thi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chi tiết đề thi modal */}
        {showDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Chi tiết đề thi
                  </h3>
                  <button
                    onClick={handleCloseDetail}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[100vh]">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500 font-medium">Đang tải chi tiết...</span>
                  </div>
                ) : detailData ? (
                  <div className="space-y-6">
                    {/* Exam info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <PenTool className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tên đề thi</p>
                          <p className="font-semibold text-gray-900">{detailData.pracExamPaperName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Môn học</p>
                          <p className="font-semibold text-gray-900">{detailData.subjectName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Học kỳ</p>
                          <p className="font-semibold text-gray-900">{detailData.semesterName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ngày tạo</p>
                          <p className="font-semibold text-gray-900">{new Date(detailData.createAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Questions */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Danh sách câu hỏi ({detailData.questions.length} câu)
                      </h4>
                      <div className="space-y-4">
                        {detailData.questions.map(q => (
                          <div key={q.questionOrder} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                                {q.questionOrder}
                              </span>
                              <div className="flex-1">
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-600">Câu hỏi:</span>
                                  <p className="text-gray-900 mt-1">{q.content}</p>
                                </div>
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-600">Đáp án:</span>
                                  <p className="text-gray-900 mt-1">{q.answerContent}</p>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-600 mr-2">Điểm:</span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {q.score} điểm
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-gray-500">Không có dữ liệu chi tiết</div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCloseDetail}
                  >
                    <X className="w-4 h-4" />
                    <span>Đóng</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreatePracticalExamPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    }>
      <CreatePracticalExamClient />
    </Suspense>
  );
}
