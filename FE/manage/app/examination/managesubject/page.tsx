'use client';

import { 
  MoreVertical, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Edit3, 
  BookOpen, 
  GraduationCap,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  Target,
  Book
} from 'lucide-react';
import { useSubjects } from '@/hooks/examination/manageSubjectHook';

import { Suspense } from "react";

export default function SubjectManager() {
  const {
    subjects,
    loading,
    error,
    form,
    editingId,
    showPopup,
    openMenuId,
    menuRef,
    pageNumber,
    pageSize,
    totalPages,
    searchName,
    setSearchName,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleSearch,
    handleMenuAction,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    setOpenMenuId,
  } = useSubjects();

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold ">
              Quản lý môn học
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Quản lý danh sách môn học và thông tin liên quan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Search and Action Bar */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên môn học..."
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  Tìm kiếm
                </button>
                
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
                
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(true);
                    setEditingId(null);
                    setForm({ subjectName: '', description: '', course: '', noCredits: 0 });
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm mới
                </button>
              </div>
            </form>
          </div>          {/* Popup Add/Edit */}
          {showPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 animate-slideUp border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      {editingId === null ? <Plus className="w-5 h-5 text-white" /> : <Edit3 className="w-5 h-5 text-white" />}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {editingId === null ? 'Thêm môn học mới' : 'Cập nhật môn học'}
                    </h3>
                  </div>
                  <button
                    onClick={closePopup}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Tên môn học *
                      </label>
                      <input
                        name="subjectName"
                        placeholder="Nhập tên môn học"
                        value={form.subjectName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <GraduationCap className="w-4 h-4" />
                        Khóa học
                      </label>
                      <input
                        name="course"
                        placeholder="VD: CS101, MATH201"
                        value={form.course}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Award className="w-4 h-4" />
                        Số tín chỉ *
                      </label>
                      <input
                        name="noCredits"
                        type="number"
                        placeholder="Nhập số tín chỉ"
                        value={form.noCredits}
                        onChange={handleChange}
                        required
                        min={0}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        placeholder="Nhập mô tả môn học"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {editingId === null ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          {editingId === null ? 'Thêm môn học' : 'Cập nhật'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closePopup}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      <X className="w-4 h-4" />
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}          {/* Table */}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có môn học nào</h3>
                    <p className="text-gray-500">Bắt đầu bằng cách thêm môn học đầu tiên</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPopup(true);
                      setEditingId(null);
                      setForm({ subjectName: '', description: '', course: '', noCredits: 0 });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm môn học đầu tiên
                  </button>
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
                          ID
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
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Mô tả
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
                            {subject.subjectId}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{subject.subjectName}</div>
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
                        <td className="py-4 px-6">
                          <div className="max-w-xs truncate text-gray-600" title={subject.description}>
                            {subject.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2 relative">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200 text-sm font-medium"
                              title="Chỉnh sửa môn học"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === subject.subjectId ? null : subject.subjectId)}
                                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                title="Thêm tùy chọn"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openMenuId === subject.subjectId && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[200px] py-2 animate-slideDown"
                                >
                                  <button
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors duration-200 text-sm"
                                    onClick={() => handleMenuAction('score', subject.subjectId)}
                                  >
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <span className="text-gray-700">Quản lý đầu điểm</span>
                                  </button>
                                  <button
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-green-50 transition-colors duration-200 text-sm"
                                    onClick={() => handleMenuAction('chapter', subject.subjectId)}
                                  >
                                    <Book className="w-4 h-4 text-green-600" />
                                    <span className="text-gray-700">Quản lý chapter</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>        </div>

        {/* Pagination */}
        {subjects.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(pageNumber - 1) * pageSize + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(pageNumber * pageSize, subjects.length)}
                </span>{' '}
                của <span className="font-medium">{subjects.length}</span> kết quả
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pageNumber <= 3) {
                      pageNum = i + 1;
                    } else if (pageNumber >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pageNumber - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPageNumber(pageNum)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          pageNumber === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNumber === totalPages}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fadeIn { 
          animation: fadeIn 0.3s ease-out; 
        }
        
        .animate-slideUp { 
          animation: slideUp 0.3s ease-out; 
        }
        
        .animate-slideDown { 
          animation: slideDown 0.2s ease-out; 
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
    </Suspense>
  );
}
