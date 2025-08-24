'use client';

import { Suspense, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  Edit3, 
  BookOpen,
  Calendar,
  Award,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Target,
  FileText
} from 'lucide-react';
import { useTrainingPrograms } from '@hooks/examination/trainningProgramHook';

function TrainingProgramContent() {
  const [guideOpen, setGuideOpen] = useState(false);
  
  const {
    programs,
    loading,
    error,
    form,
    editingId,
    showPopup,
    pageNumber,
    totalPages,
    totalCount,
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
    handleDateSearch,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    handleRowClick,
  } = useTrainingPrograms();
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
                Quản lý chương trình đào tạo
              </h1>
              <p className="text-gray-600 text-sm mt-1">Quản lý các chương trình đào tạo và môn học liên quan</p>
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
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    placeholder="Từ ngày"
                    value={searchFromDate}
                    onChange={e => {
                      setSearchFromDate(e.target.value);
                      handleDateSearch();
                    }}
                    className="pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    placeholder="Đến ngày"
                    value={searchToDate}
                    onChange={e => {
                      setSearchToDate(e.target.value);
                      handleDateSearch();
                    }}
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
                    setForm({ trainProName: '', startDate: '', endDate: '', noCredits: 0 });
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
                      {editingId === null ? 'Thêm chương trình đào tạo' : 'Cập nhật chương trình đào tạo'}
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
                        Tên chương trình đào tạo *
                      </label>
                      <input
                        name="trainProName"
                        placeholder="Nhập tên chương trình đào tạo"
                        value={form.trainProName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
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
                        <Calendar className="w-4 h-4" />
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
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Award className="w-4 h-4" />
                        Tổng số tín chỉ *
                      </label>
                      <input
                        name="noCredits"
                        type="number"
                        placeholder="Nhập tổng số tín chỉ"
                        value={form.noCredits}
                        onChange={handleChange}
                        required
                        min={0}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                          {editingId === null ? 'Thêm chương trình' : 'Cập nhật'}
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
            ) : programs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <GraduationCap className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có chương trình đào tạo nào</h3>
                    <p className="text-gray-500">Bắt đầu bằng cách thêm chương trình đào tạo đầu tiên</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPopup(true);
                      setEditingId(null);
                      setForm({ trainProName: '', startDate: '', endDate: '', noCredits: 0 });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm chương trình đầu tiên
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
                          STT
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Tên chương trình
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Ngày bắt đầu
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Ngày kết thúc
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-4 h-4" />
                          Tổng tín chỉ
                        </div>
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {programs.map((program, index) => (
                      <tr 
                        key={program.trainingProgramId} 
                        className="hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer group"
                        onClick={() => handleRowClick(program.trainingProgramId)}
                        title="Nhấn để xem môn học trong chương trình"
                      >
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-medium text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                            {program.trainProName}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">
                              {program.startDate ? program.startDate.substring(0, 10) : 'Chưa có'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-gray-700">
                              {program.endDate ? program.endDate.substring(0, 10) : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center w-16 h-8 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg font-semibold">
                            {program.noCredits}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={e => { 
                                e.stopPropagation(); 
                                handleEdit(program); 
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200 text-sm font-medium"
                              title="Chỉnh sửa chương trình"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa
                            </button>
                            {/* Hiển thị nút xóa cho tất cả chương trình vì không có field isActive */}
                            <button
                              onClick={e => { 
                                e.stopPropagation(); 
                                handleDelete(program.trainingProgramId); 
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                              title="Xóa chương trình"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
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
        {programs.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{(pageNumber - 1) * 10 + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min(pageNumber * 10, (pageNumber - 1) * 10 + programs.length)}
                </span>{' '}
                của <span className="font-medium">{totalCount}</span> kết quả
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
 
  );
}

export default function TrainingProgramManager() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <TrainingProgramContent />
    </Suspense>
  );
}
