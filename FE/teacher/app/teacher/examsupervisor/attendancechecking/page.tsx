"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAttendanceChecking } from "@/hooks/teacher/useAttendanceChecking";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  User,
  Hash,
  Timer,
  Shield,
  Eye,
  Play,
  FileText,
  Pause
} from "lucide-react";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-700 font-medium">Đang tải thông tin ca thi...</span>
    </div>
  </div>
);

// Main component content
function AttendanceCheckingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const isViewMode = searchParams.get("view") === "true";

  const {
    // Main state
    examInfo,
    students,
    attendance,
    isConfirmed,
    setIsConfirmed,
    collapsed,
    setCollapsed,
    loading,
    isFinishing,
    isRefreshing,

    // Timer state
    codeRefreshTimer,
    dataRefreshTimer,

    // Statistics
    attendedCount,
    totalStudents,
    attendanceRate,

    // Functions
    formatTime,
    handleCheck,
    handleConfirmAttendance,
    handleFinishExam,
    handleManualRefresh
  } = useAttendanceChecking({ examId, isViewMode });

  // Get status badge for exam history
  const getExamStatusBadge = (status: string) => {
    switch (status) {
      case "Chưa thi":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Pause className="w-3 h-3 mr-1" />
            Chưa thi
          </span>
        );
      case "Đang thi":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Play className="w-3 h-3 mr-1" />
            Đang thi
          </span>
        );
      case "Đã nộp bài":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FileText className="w-3 h-3 mr-1" />
            Đã nộp bài
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r rounded-xl flex items-center justify-center ${
                isViewMode 
                  ? 'from-gray-600 to-gray-700' 
                  : 'from-blue-600 to-indigo-600'
              }`}>
                {isViewMode ? (
                  <Eye className="w-6 h-6 text-white" />
                ) : (
                  <Shield className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isViewMode ? 'Xem lịch sử điểm danh' : 'Điểm danh coi thi'}
                </h1>
                <p className="text-gray-600">
                  {isViewMode 
                    ? 'Xem thông tin và lịch sử điểm danh ca thi' 
                    : 'Quản lý điểm danh và giám sát ca thi'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Manual Refresh Button - only show when not in view mode */}
              {!isViewMode && (
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isRefreshing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
                </button>
              )}

              {/* View Mode Badge */}
              {isViewMode && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  <Eye className="w-4 h-4 mr-2" />
                  Chế độ xem
                </span>
              )}
              
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exam Info */}
        {examInfo ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin ca thi
              {isRefreshing && (
                <div className="ml-3 flex items-center text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  Đang cập nhật...
                </div>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Môn thi</p>
                    <p className="font-semibold text-gray-900">{examInfo.subjectName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phòng thi</p>
                    <p className="font-semibold text-gray-900">{examInfo.roomName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ca thi</p>
                    <p className="font-semibold text-gray-900">{examInfo.slotName}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Timer className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="font-semibold text-gray-900">{examInfo.startTime} - {examInfo.endTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tên bài thi</p>
                    <p className="font-semibold text-gray-900">{examInfo.examName}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Code Section */}
            <div className={`mt-6 p-4 border rounded-xl ${
              isViewMode 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isViewMode ? 'bg-gray-600' : 'bg-blue-600'
                  }`}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {isViewMode ? 'Mã code đã sử dụng' : 'Mã code vào thi'}
                    </p>
                    <p className={`text-2xl font-bold font-mono tracking-wider ${
                      isViewMode ? 'text-gray-700' : 'text-blue-700'
                    }`}>
                      {examInfo.code}
                    </p>
                  </div>
                </div>
                
                {!isViewMode && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Làm mới mã code sau</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <RefreshCw className={`w-4 h-4 text-red-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="text-xl font-bold text-red-600 font-mono">{formatTime(codeRefreshTimer)}</span>
                    </div>
                    {/* <div className="pt-3 border-t border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Cập nhật dữ liệu sau</p>
                      <div className="flex items-center space-x-2">
                        <RefreshCw className={`w-4 h-4 text-orange-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="text-lg font-bold text-orange-600 font-mono">{formatTime(dataRefreshTimer)}</span>
                      </div>
                    </div> */}
                  </div>
                )}
                
                {isViewMode && (
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                      <Eye className="w-4 h-4 mr-1" />
                      Chỉ xem
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy thông tin ca thi</h3>
            <p className="text-gray-600">Vui lòng kiểm tra lại hoặc liên hệ quản trị viên</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã điểm danh</p>
                <p className="text-2xl font-bold text-green-600">{attendedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ tham dự</p>
                <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Danh sách sinh viên ({totalStudents})
                {isViewMode && (
                  <span className="ml-2 text-sm text-gray-500">(Chỉ xem)</span>
                )}
                {isRefreshing && (
                  <div className="ml-3 flex items-center text-sm text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    Đang cập nhật...
                  </div>
                )}
              </h3>
              
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setCollapsed(!collapsed)}
                type="button"
              >
                {collapsed ? (
                  <>
                    <span className="text-sm text-gray-600">Mở rộng</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600">Thu gọn</span>
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          {!collapsed && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sinh viên</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái bài</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    {!isViewMode && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm danh</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((sv, idx) => (
                    <tr
                      key={sv.id}
                      className={`transition-colors duration-200 ${
                        isViewMode 
                          ? (attendance[sv.id] ? 'bg-green-50' : 'bg-red-50')
                          : `hover:bg-gray-50 ${attendance[sv.id] ? 'bg-green-50' : ''}`
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{sv.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getExamStatusBadge(sv.statusExamHistory)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {attendance[sv.id] ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Có mặt
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Vắng mặt
                          </span>
                        )}
                      </td>
                      {!isViewMode && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!attendance[sv.id]}
                              onChange={() => handleCheck(sv.id)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="sr-only">Điểm danh {sv.fullName}</span>
                          </label>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons - CHỈ hiển thị khi KHÔNG phải view mode */}
        {!isViewMode && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              {!collapsed && (
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                  onClick={handleConfirmAttendance}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Xác nhận điểm danh</span>
                </button>
              )}
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="confirm-finish"
                    checked={isConfirmed}
                    onChange={() => setIsConfirmed((v) => !v)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Tôi xác nhận đã coi thi xong
                  </span>
                </label>
                
                <button
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg ${
                    isConfirmed && !isFinishing
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isConfirmed || isFinishing}
                  onClick={handleFinishExam}  
                >
                  {isFinishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Hoàn thành coi thi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Summary */}
        {isViewMode && (
          <div className="mt-8 bg-gray-50 rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Eye className="w-6 h-6 text-gray-600" />
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">Lịch sử điểm danh</p>
                <p className="text-sm text-gray-600">
                  Ca thi này đã hoàn thành với tỷ lệ tham dự <span className="font-semibold text-purple-600">{attendanceRate}%</span> 
                  ({attendedCount}/{totalStudents} sinh viên)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function AttendanceCheckingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AttendanceCheckingContent />
    </Suspense>
  );
}