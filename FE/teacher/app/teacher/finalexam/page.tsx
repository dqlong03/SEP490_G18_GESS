'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import { 
  Eye, 
  Plus, 
  Search, 
  BookOpen, 
  Calendar, 
  GraduationCap,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  PenTool,
  CheckSquare,
  Filter,
  Clock
} from 'lucide-react';
import { useFinalExam } from '../../../src/hooks/teacher/useFinalExam';

const PAGE_SIZE = 10;

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="text-gray-500 font-medium">Đang tải...</span>
  </div>
);

// Main content component
const FinalExamContent = () => {
  const {
    // Data
    subjects,
    semesters,
    exams,
    selectedSubject,
    selectedSemester,
    selectedYear,
    textSearch,
    examTypeFilter,
    
    // Pagination
    page,
    totalPages,
    
    // Loading states
    loading,
    fetchError,
    detailLoading,
    detailError,
    
    // Modal states
    showModal,
    showCreateModal,
    selectedExam,
    examDetail,
    
    // Statistics
    statistics,
    
    // Options
    subjectOptions,
    semesterOptions,
    yearOptions,
    examTypeFilterOptions,
    
    // Event handlers
    setSelectedSubject,
    setSelectedSemester,
    setSelectedYear,
    setTextSearch,
    setExamTypeFilter,
    setPage,
    setShowModal,
    setShowCreateModal,
    
    // Actions
    handleViewExam,
    handleCreateMultipleChoice,
    handleCreateEssay,
    
    // Utility functions
    getExamTypeColor,
    getExamTypeLabel,
  } = useFinalExam();

  const getExamTypeIcon = (type: number) => {
    return type === 1 ? <CheckSquare className="w-4 h-4" /> : <PenTool className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Danh sách bài thi cuối kỳ</h1>
                <p className="text-gray-600">Quản lý và theo dõi các bài thi cuối kỳ</p>
              </div>
            </div>
            
            <button
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Tạo bài thi cuối kỳ</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        {exams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng bài thi</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trắc nghiệm</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.multipleChoice}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tự luận</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.essay}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Bộ lọc tìm kiếm
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
              <Select
                options={subjectOptions}
                value={selectedSubject ? subjectOptions.find(s => s.value === selectedSubject.subjectId) : null}
                onChange={option => setSelectedSubject(option)}
                placeholder="Chọn môn học"
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ</label>
              <Select
                options={semesterOptions}
                value={selectedSemester ? semesterOptions.find(s => s.value === selectedSemester.semesterId) : null}
                onChange={option => setSelectedSemester(option)}
                placeholder="Chọn học kỳ"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
              <Select
                options={yearOptions}
                value={{ value: selectedYear, label: selectedYear.toString() }}
                onChange={option => setSelectedYear(option?.value ?? yearOptions[0]?.value)}
                placeholder="Chọn năm"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài thi</label>
              <Select
                options={examTypeFilterOptions}
                value={examTypeFilterOptions.find(option => option.value === examTypeFilter)}
                onChange={option => setExamTypeFilter(option?.value ?? 0)}
                placeholder="Loại bài thi"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Tìm kiếm bài thi..."
              value={textSearch}
              onChange={e => setTextSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Exams Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách bài thi ({statistics.total})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bài thi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-red-500 font-medium">Có lỗi xảy ra khi tải dữ liệu</div>
                    </td>
                  </tr>
                ) : exams.length > 0 ? (
                  exams.map((exam, idx) => (
                    <tr key={exam.examId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            {getExamTypeIcon(exam.examType)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{exam.examName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.subjectName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.semesterName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Calendar className="w-3 h-3 mr-1" />
                          {exam.year}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExamTypeColor(exam.examType)}`}>
                          {getExamTypeIcon(exam.examType)}
                          <span className="ml-1">
                            {getExamTypeLabel(exam.examType)}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                          onClick={() => handleViewExam(exam)}
                          title="Xem bài thi"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span>Xem</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có bài thi nào</h3>
                      <p className="text-gray-600">Tạo bài thi đầu tiên để bắt đầu</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Trang {page} / {totalPages || 1}
              </span>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Hiển thị {exams.length} kết quả
            </div>
          </div>
        )}
      </div>

      {/* Modal xem bài thi */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-600" />
                  Chi tiết bài thi
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : detailError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-red-500 font-medium">{detailError}</div>
                </div>
              ) : examDetail ? (
                <div className="space-y-6">
                  {selectedExam?.examType === 2 ? (
                    // Tự luận
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <PenTool className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tên bài thi</p>
                            <p className="font-semibold text-gray-900">{examDetail.pracExamName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Môn học</p>
                            <p className="font-semibold text-gray-900">{examDetail.subjectName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Học kỳ</p>
                            <p className="font-semibold text-gray-900">{examDetail.semesterName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Người tạo</p>
                            <p className="font-semibold text-gray-900">{examDetail.teacherName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Danh sách đề thi
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <ul className="space-y-2">
                            {examDetail.practiceExamPaperDTO?.map((item: any, index: number) => (
                              <li key={item.pracExamPaperId} className="flex items-center space-x-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-sm text-gray-700">{item.pracExamPaperName}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Trắc nghiệm
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tên bài thi</p>
                            <p className="font-semibold text-gray-900">{examDetail.multiExamName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Môn học</p>
                            <p className="font-semibold text-gray-900">{examDetail.subjectName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Học kỳ</p>
                            <p className="font-semibold text-gray-900">{examDetail.semesterName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Người tạo</p>
                            <p className="font-semibold text-gray-900">{examDetail.teacherName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Số lượng câu hỏi</p>
                          <p className="font-semibold text-gray-900">{examDetail.numberQuestion} câu</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Chi tiết số câu hỏi theo chương
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            {examDetail.noQuestionInChapterDTO?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{item.chapterName}</p>
                                    <p className="text-xs text-gray-500">{item.levelName}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-blue-600">{item.numberQuestion} câu</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-500">Không có dữ liệu</div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-4 h-4" />
                  <span>Đóng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo bài thi cuối kỳ */}
      {showCreateModal && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 text-center flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Chọn loại bài thi cuối kỳ
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <button
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                onClick={handleCreateMultipleChoice}
              >
                <CheckSquare className="w-5 h-5" />
                <span>Tạo bài thi trắc nghiệm</span>
              </button>
              
              <button
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                onClick={handleCreateEssay}
              >
                <PenTool className="w-5 h-5" />
                <span>Tạo bài thi tự luận</span>
              </button>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                className="w-full flex items-center justify-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-4 h-4" />
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component with Suspense wrapper
export default function ExamListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FinalExamContent />
    </Suspense>
  );
}
