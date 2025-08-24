'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useSetRole } from '@/hooks/leader/useSetRole';

import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Settings, 
  Trash2, 
  Edit3, 
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  Search
} from 'lucide-react';

const TEACHER_ID = getUserIdFromToken();

export default function SetRolePage() {
  const {
    // State
    subjects,
    filteredSubjects,
    searchTerm,
    setSearchTerm,
    currentSubjectPage,
    setCurrentSubjectPage,
    selectedSubject,
    teachersInSubject,
    filteredTeachersInMajor,
    showAddModal,
    setShowAddModal,
    page,
    setPage,
    totalPages,
    loading,
    searchTeacherInSubject,
    setSearchTeacherInSubject,
    searchTeacherInMajor,
    setSearchTeacherInMajor,
    
    // Computed values
    totalSubjectPages,
    currentSubjects,
    createExamCount,
    gradeExamCount,
    
    // Functions
    handlePreviousSubjects,
    handleNextSubjects,
    handleAddTeacher,
    handleRemoveTeacher,
    handleToggleCreateExam,
    isTeacherInSubject,
    handleSubjectSelect,
    handleCloseModal,
    fetchTeachersInMajor,
    
    // Constants
    PAGE_SIZE,
    SUBJECTS_PER_PAGE
  } = useSetRole({ teacherId: TEACHER_ID || '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý phân quyền giáo viên</h1>
              <p className="text-gray-600">Phân quyền tạo đề và chấm bài theo môn học</p>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Chọn môn học
            </h3>
            
            {selectedSubject && (
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(true);
                  fetchTeachersInMajor();
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm giáo viên</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Subject Carousel */}
          {filteredSubjects.length > 0 ? (
            <div className="relative">
              <div className="flex items-center space-x-4">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousSubjects}
                  disabled={currentSubjectPage === 0}
                  className="flex-shrink-0 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Subject Cards */}
                <div className="flex-1 grid grid-cols-6 gap-4">
                  {currentSubjects.map(subject => (
                    <div
                      key={subject.subjectId}
                      onClick={() => handleSubjectSelect(subject)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 text-center ${
                        selectedSubject?.subjectId === subject.subjectId
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <h4 className={`font-medium text-sm ${
                        selectedSubject?.subjectId === subject.subjectId
                          ? 'text-blue-900'
                          : 'text-gray-900'
                      }`}>
                        {subject.subjectName}
                      </h4>
                      
                      {selectedSubject?.subjectId === subject.subjectId && (
                        <div className="mt-2 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Fill empty slots if less than 6 subjects */}
                  {currentSubjects.length < SUBJECTS_PER_PAGE && (
                    <>
                      {Array.from({ length: SUBJECTS_PER_PAGE - currentSubjects.length }).map((_, index) => (
                        <div key={`empty-${index}`} className="p-4 border-2 border-dashed border-gray-200 rounded-lg opacity-50">
                          <div className="h-8"></div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextSubjects}
                  disabled={currentSubjectPage >= totalSubjectPages - 1}
                  className="flex-shrink-0 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Pagination Indicator */}
              {totalSubjectPages > 1 && (
                <div className="flex items-center justify-center mt-4 space-x-2">
                  {Array.from({ length: totalSubjectPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSubjectPage(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentSubjectPage ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchTerm ? 'Không tìm thấy môn học' : 'Chưa có môn học nào'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `Không có môn học nào chứa từ khóa "${searchTerm}"`
                  : 'Không tìm thấy môn học nào được phân công'
                }
              </p>
            </div>
          )}
        </div>

        {/* Teachers Table */}
        {selectedSubject && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Danh sách giáo viên môn: {selectedSubject.subjectName} ({teachersInSubject.length})
                </h3>
              </div>
              
              {/* Search teachers in subject */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm giáo viên trong môn (mã GV hoặc tên)..."
                  value={searchTeacherInSubject}
                  onChange={(e) => setSearchTeacherInSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GV</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo đề</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-gray-500 font-medium">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : teachersInSubject.length > 0 ? (
                    teachersInSubject.map((teacher, idx) => (
                      <tr key={teacher.teacherId} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{teacher.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {teacher.fullname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.email}
                        </td>
                        
                        {/* Toggle tạo đề */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              teacher.isCreateExam ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            onClick={() => handleToggleCreateExam(teacher)}
                            aria-pressed={teacher.isCreateExam}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                teacher.isCreateExam ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        
                        {/* Xóa */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            onClick={() => handleRemoveTeacher(teacher.teacherId)}
                            title="Xóa giáo viên"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {searchTeacherInSubject ? 'Không tìm thấy giáo viên' : 'Chưa có giáo viên nào'}
                        </h3>
                        <p className="text-gray-600">
                          {searchTeacherInSubject 
                            ? `Không có giáo viên nào chứa từ khóa "${searchTeacherInSubject}"`
                            : 'Thêm giáo viên vào môn học để bắt đầu phân quyền'
                          }
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {selectedSubject && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Trang {page} / {totalPages}
              </span>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Hiển thị {teachersInSubject.length} kết quả
            </div>
          </div>
        )}

        {/* Statistics - Moved to bottom */}
        {selectedSubject && teachersInSubject.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng giáo viên</p>
                  <p className="text-2xl font-bold text-blue-600">{teachersInSubject.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Được tạo đề</p>
                  <p className="text-2xl font-bold text-green-600">{createExamCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Được chấm bài</p>
                  <p className="text-2xl font-bold text-purple-600">{gradeExamCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder when no subject selected */}
        {!selectedSubject && subjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Chọn môn học để bắt đầu</h3>
            <p className="text-gray-600">Vui lòng chọn một môn học ở trên để xem và quản lý danh sách giáo viên</p>
          </div>
        )}
      </div>

      {/* Modal thêm giáo viên */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                    Thêm giáo viên vào môn học
                  </h3>
                  {selectedSubject && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                        {selectedSubject.subjectName}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Search teachers in major */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm giáo viên (mã GV hoặc tên)..."
                    value={searchTeacherInMajor}
                    onChange={(e) => setSearchTeacherInMajor(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[50vh]">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GV</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachersInMajor.length > 0 ? (
                      filteredTeachersInMajor.map(teacher => {
                        const alreadyInSubject = isTeacherInSubject(teacher.teacherId);
                        return (
                          <tr key={teacher.teacherId} className={`transition-colors duration-200 ${alreadyInSubject ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${alreadyInSubject ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                  <Users className={`w-4 h-4 ${alreadyInSubject ? 'text-gray-400' : 'text-blue-600'}`} />
                                </div>
                                <span className={`text-sm font-medium ${alreadyInSubject ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {teacher.code}
                                </span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${alreadyInSubject ? 'text-gray-500' : 'text-gray-900'}`}>
                              {teacher.fullname}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${alreadyInSubject ? 'text-gray-400' : 'text-gray-500'}`}>
                              {teacher.phoneNumber}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${alreadyInSubject ? 'text-gray-400' : 'text-gray-500'}`}>
                              {teacher.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {alreadyInSubject ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Đã thêm
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Chưa thêm
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {!alreadyInSubject ? (
                                <button
                                  className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                                  onClick={() => handleAddTeacher(teacher.teacherId)}
                                >
                                  <UserPlus className="w-4 h-4" />
                                  <span>Thêm</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm font-medium">Đã có trong môn</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {searchTeacherInMajor ? 'Không tìm thấy giáo viên' : 'Không có giáo viên nào'}
                          </h3>
                          <p className="text-gray-600">
                            {searchTeacherInMajor 
                              ? `Không có giáo viên nào chứa từ khóa "${searchTeacherInMajor}"`
                              : 'Không tìm thấy giáo viên nào trong ngành'
                            }
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Đóng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}