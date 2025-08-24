'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Select from 'react-select';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  FileText, 
  Plus, 
  Search,
  Eye,
  Trash2,
  Save,
  X,
  ChevronLeft,
  Settings,
  BookOpen,
  Target,
  GraduationCap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCreatePracticeExamForClass } from '@/hooks/teacher/useCreatePracticeExamForClass';

interface CreatePracticeExamContentProps {
  classId: number;
}

function CreatePracticeExamContent({ classId }: CreatePracticeExamContentProps) {
  const {
    // Basic state
    examName,
    setExamName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    duration,
    setDuration,
    loading,
    error,

    // Class data
    students,
    gradeComponents,
    selectedGradeComponent,
    setSelectedGradeComponent,

    // Student selection
    showStudentPopup,
    setShowStudentPopup,
    studentChecks,
    selectedStudents,
    handleOpenStudentPopup,
    handleCheckStudent,
    handleCheckAllStudents,
    handleUncheckAllStudents,
    handleConfirmStudents,

    // Exam selection
    showExamPopup,
    setShowExamPopup,
    examChecks,
    examPapers,
    selectedExams,
    loadingExams,
    handleOpenExamPopup,
    handleCheckExam,
    handleCheckAllExams,
    handleUncheckAllExams,
    handleSaveExams,
    handleRemoveExam,

    // Semester and year
    semesters,
    selectedSemester,
    setSelectedSemester,
    years,
    selectedYear,
    setSelectedYear,

    // Detail modal
    showDetail,
    detailData,
    loadingDetail,
    handleShowDetail,
    handleCloseDetail,

    // Preview
    hoveredExam,
    previewPosition,
    handleMouseEnterExam,
    handleMouseLeaveExam,

    // Form submission
    isSubmitting,
    handleSave,

    // Navigation
    handleBack,
    handleCreateNewExamPaper,

    // Utilities
    selectStyles,
    totalQuestions,
    parseGradingCriteria,
  } = useCreatePracticeExamForClass(classId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu lớp học...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="text-red-500 text-xl mb-4">❌</div>
  //         <p className="text-red-600 text-lg font-medium">Có lỗi xảy ra</p>
  //         <p className="text-gray-600 mt-2">{error}</p>
  //         <button
  //           onClick={handleBack}
  //           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //         >
  //           Quay lại
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo bài kiểm tra tự luận</h1>
                <p className="text-gray-600">Thiết lập bài kiểm tra và phân công cho sinh viên</p>
              </div>
            </div>
            
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sinh viên đã chọn</p>
                <p className="text-2xl font-bold text-blue-600">{selectedStudents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đề thi đã chọn</p>
                <p className="text-2xl font-bold text-green-600">{selectedExams.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thời lượng thi</p>
                <p className="text-2xl font-bold text-orange-600">{duration} phút</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Đầu điểm <span className="text-red-500">*</span>
                </label>
                <Select
                  options={gradeComponents}
                  value={selectedGradeComponent}
                  onChange={setSelectedGradeComponent}
                  placeholder="Chọn đầu điểm"
                  styles={selectStyles}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng thi (phút) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Nhập thời lượng"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selection Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Chọn sinh viên
              </h3>
              
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                onClick={handleOpenStudentPopup}
              >
                <Users className="w-4 h-4" />
                <span>Chọn sinh viên tham gia</span>
              </button>
              
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      Đã chọn {selectedStudents.length} sinh viên
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Chọn đề thi
              </h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                  onClick={handleOpenExamPopup}
                >
                  <FileText className="w-4 h-4" />
                  <span>Chọn đề thi có sẵn</span>
                </button>
                
                <button
                  type="button"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                  onClick={handleCreateNewExamPaper}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo đề thi mới</span>
                </button>
              </div>
              
              {selectedExams.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Đã chọn {selectedExams.length} đề thi
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Exams */}
          {selectedExams.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Danh sách đề thi đã chọn ({selectedExams.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedExams.map((exam, idx) => (
                      <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {exam.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {exam.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleShowDetail(exam.pracExamPaperId)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExam(exam.pracExamPaperId)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Xóa đề thi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !examName || !selectedGradeComponent || !startDate || !endDate || !duration || selectedStudents.length === 0}
              className="flex items-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Tạo bài kiểm tra</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Student Selection Modal */}
        {showStudentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Danh sách sinh viên trong lớp
                  </h3>
                  <button
                    onClick={() => setShowStudentPopup(false)}
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
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllStudents}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleUncheckAllStudents}
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((sv, idx) => (
                        <tr key={sv.studentId} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) => handleCheckStudent(sv.studentId, e.target.checked)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam Selection Modal */}
        {showExamPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Chọn đề thi từ ngân hàng đề
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
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ học</label>
                    <Select
                      options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                      value={selectedSemester}
                      onChange={setSelectedSemester}
                      placeholder="Chọn kỳ học"
                      styles={selectStyles}
                      noOptionsMessage={() => 'Không có dữ liệu'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                    <Select
                      options={years}
                      value={selectedYear}
                      onChange={setSelectedYear}
                      placeholder="Chọn năm"
                      styles={selectStyles}
                      noOptionsMessage={() => 'Không có dữ liệu'}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllExams}
                  >
                    <CheckCircle2 className="w-4 h-4" />
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
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examPapers.map((exam, idx) => (
                          <tr 
                            key={exam.pracExamPaperId} 
                            className="hover:bg-blue-50 transition-colors duration-200"
                            onMouseEnter={e => handleMouseEnterExam(exam, e)}
                            onMouseLeave={handleMouseLeaveExam}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {exam.semester}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {exam.year}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={!!examChecks[exam.pracExamPaperId]}
                                onChange={(e) => handleCheckExam(exam.pracExamPaperId, e.target.checked)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {examPapers.length === 0 && !loadingExams && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có đề thi nào</p>
                    <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc tạo đề thi mới</p>
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
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu đề thi đã chọn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
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
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {loadingDetail ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : detailData ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{detailData.pracExamPaperName}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Môn học: <span className="font-medium">{detailData.subjectName}</span></div>
                        <div>Kỳ: <span className="font-medium">{detailData.semesterName}</span></div>
                        <div>Loại đề: <span className="font-medium">{detailData.categoryExamName}</span></div>
                        <div>Trạng thái: <span className="font-medium">{detailData.status}</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-4">Danh sách câu hỏi ({detailData.questions.length})</h5>
                      <div className="space-y-4">
                        {detailData.questions.map((q, index) => {
                          const criteria = parseGradingCriteria(q.answerContent);
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="font-medium text-gray-800">
                                  Câu {q.questionOrder}: ({q.score} điểm)
                                </h6>
                              </div>
                              <div className="mb-3">
                                <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">{q.content}</p>
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-700 mb-2">Đáp án/Tiêu chí chấm:</h6>
                                {criteria.length > 0 ? (
                                  <ul className="list-disc pl-6 space-y-1">
                                    {criteria.map((c, i) => (
                                      <li key={i}>
                                        <span className="font-semibold">{c.criterionName}</span>
                                        {c.weightPercent ? (
                                          <span className="ml-2 text-xs text-blue-600">({c.weightPercent}%)</span>
                                        ) : null}
                                        : <span>{c.description}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{q.answerContent}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không thể tải chi tiết đề thi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview Tooltip */}
        {hoveredExam && previewPosition && detailData && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md"
            style={{
              left: previewPosition.x + 10,
              top: previewPosition.y - 50,
              pointerEvents: 'none'
            }}
          >
            <div className="space-y-2">
              <h6 className="font-semibold text-gray-800">{hoveredExam.pracExamPaperName}</h6>
              <div className="text-sm text-gray-600">
                <div>Số câu hỏi: {detailData.questions.length}</div>
                <div>Môn: {detailData.subjectName}</div>
                <div>Kỳ: {detailData.semesterName}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải dữ liệu lớp học...</p>
      </div>
    </div>
  );
}

export default async function CreateEssayExamPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId: classIdString } = await params;
  const classId = Number(classIdString);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreatePracticeExamContent classId={classId} />
    </Suspense>
  );
}
