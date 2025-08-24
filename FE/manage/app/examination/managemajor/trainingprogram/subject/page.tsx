'use client';

import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen,
  Award,
  GraduationCap,
  Trash2,
  Target,
  FileText,
  X
} from 'lucide-react';
import { useTrainingProgramSubjects } from '@/hooks/examination/subjectHook';
import { Suspense } from "react";
import Select from 'react-select';

function TrainingProgramSubjectContent() {
  const {
    subjects,
    allSubjects,
    loading,
    error,
    pageNumber,
    setPageNumber,
    pageSize,
    searchName,
    setSearchName,
    selectedSubjectId,
    setSelectedSubjectId,
    handleAddSubject,
    handleDelete,
  } = useTrainingProgramSubjects();

  // Prepare options for react-select
  const subjectOptions = allSubjects
    .filter(s => !subjects.some(sub => sub.subjectId === s.subjectId))
    .map(subject => ({
      value: subject.subjectId,
      label: `${subject.subjectName} (${subject.noCredits} TC)`,
      subject: subject
    }));
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Quản lý môn học trong chương trình
              </h1>
              <p className="text-gray-600 text-sm mt-1">Quản lý các môn học thuộc chương trình đào tạo</p>
            </div>
          </div>
        </div>
     
        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Search and Add Section */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 space-y-6">
            {/* Search Bar */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchName('');
                    setPageNumber(1);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  <Filter className="w-4 h-4" />
                  Xóa lọc
                </button>
              </div>
            </div>

            {/* Add Subject Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Thêm môn học vào chương trình</h3>
              </div>
              <form onSubmit={handleAddSubject} className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-80">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chọn môn học</label>
                  <Select
                    value={subjectOptions.find(opt => opt.value === selectedSubjectId) || null}
                    onChange={(selectedOption) => setSelectedSubjectId(selectedOption?.value || null)}
                    options={subjectOptions}
                    placeholder="-- Chọn môn học để thêm --"
                    isSearchable={true}
                    noOptionsMessage={() => "Không tìm thấy môn học"}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '48px',
                        border: state.isFocused ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                        '&:hover': {
                          border: state.isFocused ? '2px solid #3b82f6' : '1px solid #9ca3af'
                        }
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected 
                          ? '#3b82f6' 
                          : state.isFocused 
                            ? '#eff6ff' 
                            : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
                        }
                      })
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedSubjectId || loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? 'Đang thêm...' : 'Thêm vào chương trình'}
                </button>
              </form>
            </div>
          </div>          {/* Table Section */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Đang tải dữ liệu...</span>
                </div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {error ? 'Có lỗi xảy ra' : 'Chưa có môn học nào'}
                    </h3>
                    <p className="text-gray-500">
                      {error ? 'Không thể tải dữ liệu môn học' : 'Chương trình đào tạo này chưa có môn học nào'}
                    </p>
                  </div>
                  {!error && (
                    <div className="text-sm text-blue-600">
                      Sử dụng form bên trên để thêm môn học vào chương trình
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          STT
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Tên môn học
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Mô tả
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Khóa học
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-4 h-4" />
                          Tín chỉ
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subjects.map((subject, index) => (
                      <tr key={subject.subjectId} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-medium text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{subject.subjectName}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-xs truncate text-gray-600" title={subject.description}>
                            {subject.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {subject.course ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {subject.course}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Chưa có</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg font-semibold">
                            {subject.noCredits}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDelete(subject.subjectId)}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Xóa môn học khỏi chương trình (sẽ xóa ngay lập tức)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {loading ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Info */}
          {subjects.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Tổng môn học: <span className="font-bold text-blue-700">{subjects.length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Tổng tín chỉ: <span className="font-bold text-green-700">
                        {subjects.reduce((total, subject) => total + subject.noCredits, 0)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
}

export default function TrainingProgramSubjectManager() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <TrainingProgramSubjectContent />
    </Suspense>
  );
}
