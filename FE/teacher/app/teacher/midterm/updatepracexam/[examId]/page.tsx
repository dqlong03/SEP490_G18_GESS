'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Users, 
  Clock, 
  Settings, 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  X, 
  Check,
  FileText,
  Calendar,
  Eye,
  Search
} from "lucide-react";
import { useUpdatePracticeExam } from '@/hooks/teacher/useUpdatePracticeExam';

function UpdatePracticeExamContent() {
  const params = useParams();
  const examId = params?.examId as string;

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
    classId,

    // Students
    students,
    selectedStudents,
    showStudentPopup,
    setShowStudentPopup,
    studentChecks,
    handleOpenStudentPopup,
    handleCheckStudent,
    handleCheckAllStudents,
    handleUncheckAllStudents,
    handleConfirmStudents,

    // Grade components and semesters
    gradeComponents,
    selectedGradeComponent,
    setSelectedGradeComponent,
    semesters,
    selectedSemester,
    setSelectedSemester,
    years,
    selectedYear,
    setSelectedYear,

    // Exam papers
    examPapers,
    selectedExams,
    showExamPopup,
    setShowExamPopup,
    examChecks,
    loadingExams,
    handleOpenExamPopup,
    handleCheckExam,
    handleCheckAllExams,
    handleUncheckAllExams,
    handleSaveExams,
    handleRemoveExam,

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

    // Submit
    handleUpdate,

    // Router
    router
  } = useUpdatePracticeExam(examId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cập nhật bài kiểm tra tự luận</h1>
                <p className="text-gray-600">Chỉnh sửa thông tin và cấu hình bài kiểm tra</p>
              </div>
            </div>
            
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  isClearable={false}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Chọn đầu điểm"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỳ học <span className="text-red-500">*</span>
                </label>
                <Select
                  options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  isClearable={false}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Chọn kỳ học"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng (phút) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="60"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Sinh viên tham gia
              </h3>
              <button
                type="button"
                onClick={handleOpenStudentPopup}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Chọn sinh viên</span>
              </button>
            </div>
            
            {selectedStudents.length > 0 ? (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  Đã chọn {selectedStudents.length} sinh viên
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Chưa chọn sinh viên nào</p>
              </div>
            )}
          </div>

          {/* Exam Papers Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Đề thi tự luận
              </h3>
              <div className="flex space-x-3">
                <Link
                  href={`/teacher/myexampaper/createexampaper/${classId}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo đề thi</span>
                </Link>
                <button
                  type="button"
                  onClick={handleOpenExamPopup}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Search className="w-4 h-4" />
                  <span>Chọn đề thi</span>
                </button>
              </div>
            </div>

            {/* Selected Exam Papers Table */}
            {selectedExams.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedExams.map((exam, idx) => (
                      <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{exam.semester}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{exam.year}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleShowDetail(exam.pracExamPaperId)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveExam(exam.pracExamPaperId)}
                            className="inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    Tổng số đề thi đã chọn:{" "}
                    <span className="text-blue-600">{selectedExams.length}</span>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    <span>Cập nhật bài kiểm tra</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Chưa chọn đề thi nào</p>
                <p className="text-gray-500 text-sm">Vui lòng chọn ít nhất một đề thi để tiếp tục</p>
              </div>
            )}
          </div>
        </form>

        {/* Student Selection Modal */}
        {showStudentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Chọn sinh viên tham gia</h3>
                <button
                  onClick={() => setShowStudentPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleCheckAllStudents}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUncheckAllStudents}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sv.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {sv.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{sv.fullName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) =>
                                handleCheckStudent(sv.studentId, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam Selection Modal */}
        {showExamPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Chọn đề thi tự luận</h3>
                <button
                  onClick={() => setShowExamPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="w-44">
                    <Select
                      options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                      value={selectedSemester}
                      onChange={option => {
                        setSelectedSemester(option);
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
                      }}
                      placeholder="Năm"
                      isClearable
                      isSearchable={false}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckAllExams}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUncheckAllExams}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                {loadingExams ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải đề thi...</span>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm text-gray-900">{exam.semester}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-sm text-gray-900">{exam.year}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => handleShowDetail(exam.pracExamPaperId)}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors duration-200"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Xem
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={!!examChecks[exam.pracExamPaperId]}
                                onChange={(e) =>
                                  handleCheckExam(exam.pracExamPaperId, e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Preview Tooltip */}
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
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                          padding: '16px',
                          minWidth: '320px',
                          maxWidth: '420px',
                          pointerEvents: 'none'
                        }}
                      >
                        {loadingDetail ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-sm">Đang tải chi tiết...</span>
                          </div>
                        ) : detailData ? (
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900 mb-2">{detailData.pracExamPaperName}</div>
                            <div className="space-y-1 text-gray-600">
                              <div><span className="font-medium">Môn học:</span> {detailData.subjectName}</div>
                              <div><span className="font-medium">Học kỳ:</span> {detailData.semesterName}</div>
                              <div><span className="font-medium">Số câu hỏi:</span> {detailData.questions.length}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Không có dữ liệu chi tiết.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowExamPopup(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExams}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Chi tiết đề thi</h3>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
                  </div>
                ) : detailData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-700">Tên đề thi:</span>
                        <p className="text-gray-900">{detailData.pracExamPaperName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Môn học:</span>
                        <p className="text-gray-900">{detailData.subjectName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Học kỳ:</span>
                        <p className="text-gray-900">{detailData.semesterName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Danh mục:</span>
                        <p className="text-gray-900">{detailData.categoryExamName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Trạng thái:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          {detailData.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Ngày tạo:</span>
                        <p className="text-gray-900">{new Date(detailData.createAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Câu hỏi ({detailData.questions.length})</h4>
                      <div className="space-y-4">
                        {detailData.questions.map(q => (
                          <div key={q.questionOrder} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">Câu {q.questionOrder}</h5>
                              <span className="text-sm font-medium text-blue-600">{q.score} điểm</span>
                            </div>
                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-700">Nội dung:</span>
                              <p className="text-gray-900 mt-1">{q.content}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Đáp án:</span>
                              <p className="text-gray-900 mt-1">{q.answerContent}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có dữ liệu chi tiết.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpdatePracticeExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Đang tải...</span>
        </div>
      </div>
    }>
      <UpdatePracticeExamContent />
    </Suspense>
  );
}
