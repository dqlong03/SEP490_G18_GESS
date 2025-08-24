'use client';

import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  Edit3, 
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookOpen
} from 'lucide-react';
import { useMajors } from '@/hooks/examination/manageMajorHook';
import { Suspense } from "react";

export default function MajorManager() {
  const {
    majors,
    loading,
    form,
    editingId,
    showPopup,
    pageNumber,
    totalPages,
    searchName,
    setSearchName,
    searchFromDate,
    setSearchFromDate,
    searchToDate,
    setSearchToDate,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    handleRowClick,
  } = useMajors();
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
                Quản lý ngành học
              </h1>
              <p className="text-gray-600 text-sm mt-1">Quản lý thông tin ngành học và chương trình đào tạo</p>
            </div>
          </div>
          
          {/* Hướng dẫn sử dụng */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">💡 Hướng dẫn sử dụng</h4>
                <p className="text-sm text-blue-700">
                  Nhấn 2 lần vào bất kỳ dòng nào trong bảng để xem chi tiết chương trình đào tạo của ngành học đó.
                  Tìm kiếm sẽ tự động thực hiện sau khi bạn dừng gõ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Search and Action Bar */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchName}
                    onChange={e => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    placeholder="Từ ngày"
                    value={searchFromDate}
                    onChange={e => setSearchFromDate(e.target.value)}
                    className="pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    placeholder="Đến ngày"
                    value={searchToDate}
                    onChange={e => setSearchToDate(e.target.value)}
                    className="pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setSearchName('');
                    setSearchFromDate('');
                    setSearchToDate('');
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
                    setForm({ majorName: '', startDate: '', endDate: '', isActive: true });
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm mới
                </button>
              </div>
            </div>
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
                      {editingId === null ? 'Thêm ngành học mới' : 'Cập nhật ngành học'}
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
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <GraduationCap className="w-4 h-4" />
                        Tên ngành học *
                      </label>
                      <input
                        name="majorName"
                        placeholder="Nhập tên ngành học"
                        value={form.majorName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Ngày bắt đầu *
                      </label>
                      <input
                        name="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Ngày kết thúc
                      </label>
                      <input
                        name="endDate"
                        type="date"
                        value={form.endDate || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={form.isActive}
                          onChange={handleChange}
                          className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Ngành học đang hoạt động
                        </label>
                      </div>
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
                          {editingId === null ? 'Thêm ngành học' : 'Cập nhật'}
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
            ) : majors.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <GraduationCap className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có ngành học nào</h3>
                    <p className="text-gray-500">Bắt đầu bằng cách thêm ngành học đầu tiên</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPopup(true);
                      setEditingId(null);
                      setForm({ majorName: '', startDate: '', endDate: '', isActive: true });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm ngành học đầu tiên
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
                          <GraduationCap className="w-4 h-4" />
                          STT
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Tên ngành học
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Ngày bắt đầu
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Ngày kết thúc
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Trạng thái
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {majors.map((major, index) => (
                      <tr 
                        key={major.majorId} 
                        className="hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer group"
                        onClick={() => handleRowClick(major.majorId)}
                        title="Nhấn để xem chương trình đào tạo"
                      >
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-medium text-sm">
                            {(pageNumber - 1) * 10 + index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                            {major.majorName}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">
                              {major.startDate ? major.startDate.substring(0, 10) : 'Chưa có'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-orange-600" />
                            <span className="text-gray-700">
                              {major.endDate ? major.endDate.substring(0, 10) : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            major.isActive 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {major.isActive ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Hoạt động
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Ngừng hoạt động
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={e => { 
                                e.stopPropagation(); 
                                handleEdit(major); 
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200 text-sm font-medium"
                              title="Chỉnh sửa ngành học"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            {major.isActive && (
                              <button
                                onClick={e => { 
                                  e.stopPropagation(); 
                                  handleDelete(major.majorId); 
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                title="Xóa ngành học"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>        </div>

        {/* Pagination & Info */}
        {majors.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Trang <span className="font-medium">{pageNumber}</span> của{' '}
                <span className="font-medium">{totalPages+1}</span>
              </div>
              
              {totalPages > 0 && (
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
                    {Array.from({ length: totalPages+1 }, (_, i) => {
                      const pageNum = i + 1;
                      
                      // Hiển thị tối đa 5 số trang
                      if (totalPages <= 5) {
                        // Nếu <= 5 trang thì hiển thị hết
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPageNumber(pageNum)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              pageNumber === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else {
                        // Logic cho nhiều hơn 5 trang
                        const shouldShow = 
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= pageNumber - 1 && pageNum <= pageNumber + 1);
                        
                        if (!shouldShow) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPageNumber(pageNum)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors duration-200 ${
                              pageNumber === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
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
              )}
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
        
        .animate-fadeIn { 
          animation: fadeIn 0.3s ease-out; 
        }
        
        .animate-slideUp { 
          animation: slideUp 0.3s ease-out; 
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
    </Suspense>
  );
}
