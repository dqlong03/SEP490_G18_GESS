'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import { useCreateClass } from '@/hooks/teacher/useCreateClass';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Download, 
  Upload, 
  Plus, 
  Trash2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

function CreateClassContent() {
  const {
    // Form state
    className,
    setClassName,
    selectedSubject,
    setSelectedSubject,
    selectedSemester,
    setSelectedSemester,
    subjectOptions,
    semesterOptions,

    // Students state
    students,
    fileName,

    // UI state
    errorMsg,
    loading,

    // Handlers
    handleDownloadTemplate,
    handleUpload,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleFormSubmit,

    // Styles
    selectStyles,
  } = useCreateClass();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tạo Lớp Học Mới</h1>
              <p className="text-gray-600">Thêm lớp học và quản lý danh sách sinh viên</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-8">
          
          {/* Form Fields */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Thông tin lớp học
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập tên lớp học"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỳ học
                </label>
                <Select
                  options={semesterOptions}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  placeholder="Chọn kỳ học"
                  isClearable
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn học
                </label>
                <Select
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="Chọn môn học"
                  isClearable
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Danh sách sinh viên
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Tải file mẫu
              </button>
              
              <label className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                Tải lên danh sách
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
              
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4" />
                  {fileName}
                </div>
              )}
            </div>

            {/* Display errors */}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Students table */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Danh sách sinh viên ({students.length} sinh viên)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới tính</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((sv, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={sv.avatar}
                            onChange={e => handleEditStudent(idx, 'avatar', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="URL ảnh"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={sv.code}
                            onChange={e => handleEditStudent(idx, 'code', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Mã sinh viên"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="email"
                            value={sv.email}
                            onChange={e => handleEditStudent(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Email sinh viên"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={sv.gender}
                            onChange={e => handleEditStudent(idx, 'gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="date"
                            value={sv.dob}
                            onChange={e => handleEditStudent(idx, 'dob', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={sv.fullName}
                            onChange={e => handleEditStudent(idx, 'fullName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Họ và tên"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(idx)}
                            className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Thêm sinh viên
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Hoàn tất tạo lớp</h3>
                <p className="text-sm text-gray-600">Kiểm tra thông tin và lưu lớp học</p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Lưu lớp học
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateClassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Đang tải</h3>
            <p className="text-sm text-gray-600">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    }>
      <CreateClassContent />
    </Suspense>
  );
}
