'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import { useMyExamPaper } from '@/hooks/teacher/useMyExamPaper';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  Calendar,
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  PenTool
} from 'lucide-react';

function MyEssayExamsContent() {
  const {
    // Filter state
    searchName,
    selectedSubject,
    selectedHead,
    selectedSemester,

    // Data
    exams,
    loading,

    // Options for dropdowns
    subjectOptions,
    semesterOptions,
    headOptions,

    // Pagination
    page,
    totalPages,
    paginationInfo,
    paginationRange,

    // Statistics
    statistics,

    // Styles
    selectStyles,

    // Filter handlers
    handleSearchChange,
    handleSubjectChange,
    handleHeadChange,
    handleSemesterChange,
    handleFormSubmit,

    // Pagination handlers
    handlePageChange,
    handlePreviousPage,
    handleNextPage,

    // CRUD handlers
    handleEdit,
    handleView,
    handleDelete,
    handleCreateNew,

    // Utilities
    formatDate,

    // Constants
    PAGE_SIZE,
  } = useMyExamPaper();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách đề thi tự luận</h1>
              <p className="text-gray-600">Quản lý và theo dõi các đề thi tự luận của bạn</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đề thi</p>
                <p className="text-2xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa thi</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {exams.filter(e => e.status === 'Draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã thi</p>
                <p className="text-2xl font-bold text-green-600">
                  {exams.filter(e => e.status !== 'Draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Bộ lọc và tìm kiếm</h3>
          </div>
          
          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên đề thi"
                value={searchName}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <Select
                options={subjectOptions}
                value={selectedSubject}
                onChange={handleSubjectChange}
                placeholder="Chọn môn học"
                isClearable
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <Select
                options={headOptions}
                value={selectedHead}
                onChange={handleHeadChange}
                placeholder="Chọn đầu điểm"
                isClearable
                isSearchable={false}
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <Select
                options={semesterOptions}
                value={selectedSemester}
                onChange={handleSemesterChange}
                placeholder="Chọn học kỳ"
                isClearable
                isSearchable={false}
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
          </form>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            type="button"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={handleCreateNew}
          >
            <Plus className="w-5 h-5" />
            <span>Tạo đề thi mới</span>
          </button>
        </div>

        {/* Exam List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Danh sách đề thi ({exams.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Đang tải dữ liệu...</span>
            </div>
          ) : exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Đầu điểm</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam: any, idx: number) => (
                    <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <PenTool className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                            <div className="text-sm text-gray-500">ID: {exam.pracExamPaperId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{exam.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Target className="w-3 h-3 mr-1" />
                          {exam.categoryExamName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDate(exam.createBy)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {exam.semesterName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {exam.status === 'Draft' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Chưa thi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã thi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleView(exam.pracExamPaperId)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(exam.pracExamPaperId)}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.pracExamPaperId)}
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
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có đề thi nào</h3>
              <p className="text-gray-600 mb-4">Bạn chưa tạo đề thi nào hoặc không có đề thi phù hợp với bộ lọc.</p>
              <button
                onClick={handleCreateNew}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo đề thi đầu tiên</span>
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {exams.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{paginationInfo.start}</span> đến{' '}
              <span className="font-medium">{paginationInfo.end}</span> của{' '}
              <span className="font-medium">{paginationInfo.total}</span> kết quả
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {paginationRange.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyEssayExamsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    }>
      <MyEssayExamsContent />
    </Suspense>
  );
}