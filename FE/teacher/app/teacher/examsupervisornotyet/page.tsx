"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ChevronLeft,
  Eye,
  Play,
  UserCheck,
  Lock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useExamSupervisorNotYet } from '../../../src/hooks/teacher/useExamSupervisorNotYet';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Đang tải lịch thi...</span>
  </div>
);

// Main content component
const ExamSupervisorNotYetContent = () => {
  const router = useRouter();
  const {
    examSchedules,
    loading,
    updatingStatus,
    selectedDate,
    quickDateButtons,
    statistics,
    handleDateChange,
    handleQuickDateSelect,
    handleExamAction,
    getStatusInfo,
    formatTimeFromTimeSpan,
    formatDate,
    isExamDateToday
  } = useExamSupervisorNotYet();

  // Get icon component from string name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Clock,
      UserCheck,
      Play,
      Eye,
      AlertTriangle,
      Lock
    };
    return iconMap[iconName] || Clock;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lịch coi thi</h1>
                <p className="text-gray-600">
                  Danh sách các ca thi cần coi trong ngày {formatDate(selectedDate)}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Chọn ngày xem lịch
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date-input" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn ngày cụ thể
              </label>
              <input
                id="date-input"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhanh
              </label>
              <div className="flex space-x-3">
                {quickDateButtons.map((button) => (
                  <button
                    key={button.label}
                    onClick={() => handleQuickDateSelect(button.date)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      selectedDate === button.date
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {examSchedules.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng ca thi</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chưa gán bài thi</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.notAssigned}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chưa điểm danh</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.notAttended}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang thi</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.inProgress}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam Schedule Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách ca thi ngày {formatDate(selectedDate)}
            </h3>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phòng thi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn thi
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian bắt đầu
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian kết thúc
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày thi
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examSchedules.length > 0 ? examSchedules.map((exam, index) => {
                    const isToday = isExamDateToday(exam.examDate);
                    const statusInfo = getStatusInfo(exam.status, isToday, exam.examSlotStatus);
                    const StatusIcon = getIconComponent(statusInfo.icon);
                    const isUpdating = updatingStatus === exam.examSlotRoomId;

                    return (
                      <tr key={exam.examSlotRoomId} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">Phòng {exam.roomName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-900">{exam.subjectName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm text-gray-900 font-medium">
                              {formatTimeFromTimeSpan(exam.startTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm text-gray-900 font-medium">
                              {formatTimeFromTimeSpan(exam.endTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatDate(exam.examDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-${statusInfo.color}-600 bg-${statusInfo.color}-100`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleExamAction(exam)}
                            disabled={isUpdating || statusInfo.disabled}
                            className={`inline-flex items-center space-x-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${
                              isUpdating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : statusInfo.buttonColor
                            }`}
                          >
                            {isUpdating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Đang cập nhật...</span>
                              </>
                            ) : (
                              <>
                                <StatusIcon className="w-4 h-4" />
                                <span>{statusInfo.buttonText}</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">
                            Không có ca thi nào trong ngày {formatDate(selectedDate)}
                          </p>
                          <p className="text-gray-400 text-sm">Thử chọn ngày khác để xem lịch coi thi</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense wrapper
export default function ExamSupervisorNotYetPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExamSupervisorNotYetContent />
    </Suspense>
  );
}
