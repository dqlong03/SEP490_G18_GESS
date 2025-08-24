'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import { useQuestionBank } from '@/hooks/teacher/useQuestionBank';
import { 
  Plus, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  Target, 
  FileText, 
  Layers, 
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Brain,
  Award,
  Globe,
  Lock,
  Copy,
  X,
  Shield,
  Calendar
} from 'lucide-react';

function QuestionBankContent() {
  const {
    // Filter state
    selectedPublic,
    selectedCategory,
    selectedSubject,
    selectedType,
    selectedLevel,
    selectedChapter,
    selectedSemester,
    selectedYear,

    // Data state
    categories,
    subjects,
    chapters,
    semesters,
    questions,
    loading,

    // UI state
    checkingDuplicates,
    showCreateMenu,
    showDuplicatePopup,
    duplicateGroups,
    deletingQuestionId,

    // Pagination
    page,
    totalPages,
    paginationInfo,

    // Statistics
    statistics,

    // Computed values
    canCheckDuplicates,

    // Static options
    questionTypes,
    questionLevels,
    publicOptions,
    yearOptions,

    // Filter handlers
    handlePublicChange,
    handleCategoryChange,
    handleSubjectChange,
    handleTypeChange,
    handleLevelChange,
    handleChapterChange,
    handleSemesterChange,
    handleYearChange,
    handleResetFilter,

    // Action handlers
    handleCheckDuplicates,
    handleDeleteQuestion,
    handleCreateQuestion,
    handleToggleCreateMenu,
    handleCloseDuplicatePopup,

    // Pagination handlers
    handlePageChange,
    handlePreviousPage,
    handleNextPage,

    // Utility functions
    answerCharacter,
    getLevelColor,
    getSelectStyles,

    // Constants
    PAGE_SIZE
  } = useQuestionBank();

  const getTypeIcon = (type: string) => {
    return type === 'Trắc nghiệm' ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
                <p className="text-gray-600">Quản lý và tổ chức câu hỏi theo môn học</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Duplicate check button */}
              <button
                onClick={handleCheckDuplicates}
                disabled={!canCheckDuplicates || checkingDuplicates}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg ${
                  canCheckDuplicates && !checkingDuplicates
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {checkingDuplicates ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Kiểm tra trùng lặp</span>
                  </>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={handleToggleCreateMenu}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tạo câu hỏi</span>
                </button>
                
                {showCreateMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <button
                      onClick={() => handleCreateQuestion('multiple')}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-t-xl"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">Tạo câu hỏi trắc nghiệm</span>
                    </button>
                    <button
                      onClick={() => handleCreateQuestion('essay')}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-b-xl"
                    >
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Tạo câu hỏi tự luận</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trắc nghiệm</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.multiple}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tự luận</p>
                <p className="text-2xl font-bold text-green-600">{statistics.essay}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Bộ lọc tìm kiếm
            </h3>
            <div className="flex items-center space-x-4">
              {!canCheckDuplicates && (
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Chọn đầy đủ để kiểm tra trùng lặp
                </span>
              )}
              <button
                onClick={handleResetFilter}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Xóa lọc</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public <span className="text-red-500">*</span>
              </label>
              <Select
                options={publicOptions}
                value={selectedPublic}
                onChange={handlePublicChange}
                placeholder="Chọn loại bank"
                isClearable
                isSearchable={false}
                styles={getSelectStyles(true, !!selectedPublic)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đầu điểm <span className="text-red-500">*</span>
              </label>
              <Select
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Chọn đầu điểm"
                isClearable
                isSearchable={false}
                styles={getSelectStyles(true, !!selectedCategory)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học <span className="text-red-500">*</span>
              </label>
              <Select
                options={subjects}
                value={selectedSubject}
                onChange={handleSubjectChange}
                placeholder="Chọn môn học"
                isClearable
                isSearchable
                isDisabled={!selectedCategory}
                styles={getSelectStyles(true, !!selectedSubject)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại câu hỏi <span className="text-red-500">*</span>
              </label>
              <Select
                options={questionTypes}
                value={selectedType}
                onChange={handleTypeChange}
                placeholder="Loại câu hỏi"
                isClearable
                isSearchable={false}
                styles={getSelectStyles(true, !!selectedType)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó <span className="text-red-500">*</span>
              </label>
              <Select
                options={questionLevels}
                value={selectedLevel}
                onChange={handleLevelChange}
                placeholder="Độ khó"
                isClearable
                isSearchable={false}
                styles={getSelectStyles(true, !!selectedLevel)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chương <span className="text-red-500">*</span>
              </label>
              <Select
                options={chapters}
                value={selectedChapter}
                onChange={handleChapterChange}
                placeholder="Chương"
                isClearable
                isSearchable={false}
                isDisabled={!selectedSubject}
                styles={getSelectStyles(true, !!selectedChapter)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kỳ học
              </label>
              <Select
                options={semesters}
                value={selectedSemester}
                onChange={handleSemesterChange}
                placeholder="Chọn kỳ học"
                isClearable
                isSearchable={false}
                styles={getSelectStyles(false, !!selectedSemester)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm
              </label>
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={handleYearChange}
                placeholder="Chọn năm"
                isClearable
                isSearchable={false}
                styles={getSelectStyles(false, !!selectedYear)}
              />
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Danh sách câu hỏi
              </h3>
              <span className="text-sm text-gray-600">
                Hiển thị {paginationInfo.start} - {paginationInfo.end} trong tổng số {paginationInfo.total} câu hỏi
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải câu hỏi...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung câu hỏi</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Độ khó</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chương</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Public</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.length > 0 ? questions.map((q, idx) => (
                    <tr key={q.questionId + '-' + q.questionType + '-' + idx} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md line-clamp-2">{q.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getTypeIcon(q.questionType)}
                          <span className="text-sm text-gray-900">{q.questionType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(q.level)}`}>
                          <Award className="w-3 h-3 mr-1" />
                          {q.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900">{q.chapter}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${q.isPublic ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {q.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {q.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {q.questionType === 'Trắc nghiệm' ? (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đáp án:
                            </div>
                            <div className="space-y-1">
                              {q.answers && q.answers.map((a: any, i: number) => (
                                <div key={i} className={`text-xs flex items-center ${a.isCorrect ? 'text-green-700 font-semibold bg-green-50 rounded px-2 py-1' : 'text-gray-600'}`}>
                                  <span className="inline-block w-4 font-medium">{answerCharacter(i)}.</span> 
                                  <span className="flex-1">{a.content}</span>
                                  {a.isCorrect && <CheckCircle className="w-3 h-3 ml-1 text-green-600" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700 flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              Tiêu chí chấm:
                            </div>
                            <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              {q.answers && q.answers[0]?.content}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">Không có câu hỏi nào</p>
                          <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc để tìm kiếm câu hỏi khác</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{paginationInfo.start}</span> đến{' '}
              <span className="font-medium">{paginationInfo.end}</span> trong tổng số{' '}
              <span className="font-medium">{paginationInfo.total}</span> kết quả
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Trang {page} / {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Check Popup */}
      {showDuplicatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Copy className="w-6 h-6 mr-2" />
                  Câu hỏi trùng lặp ({duplicateGroups.length} nhóm)
                </h3>
                <button
                  onClick={handleCloseDuplicatePopup}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {duplicateGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-8 last:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-orange-600">{groupIndex + 1}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Nhóm {groupIndex + 1} - Độ tương tự: {Math.round(group.similarityScore * 100)}%
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {group.questions.map((question, questionIndex) => (
                      <div key={question.questionID} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                ID: {question.questionID}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 line-clamp-3">{question.content}</p>
                          </div>
                          <button
                            onClick={() => {
                              handleDeleteQuestion(question.questionID, "");
                            }}
                            disabled={deletingQuestionId === question.questionID}
                            className="ml-4 flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {deletingQuestionId === question.questionID ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>Đang xóa...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Tìm thấy {duplicateGroups.reduce((total, group) => total + group.questions.length, 0)} câu hỏi trùng lặp trong {duplicateGroups.length} nhóm
                </p>
                <button
                  onClick={handleCloseDuplicatePopup}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showCreateMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleToggleCreateMenu}
        />
      )}
    </div>
  );
}

export default function QuestionBankPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    }>
      <QuestionBankContent />
    </Suspense>
  );
}