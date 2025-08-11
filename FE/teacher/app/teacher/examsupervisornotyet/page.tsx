"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Eye,
  Play,
  UserCheck
} from 'lucide-react';

type ApiExamSchedule = {
  examSlotRoomId: number;
  examSlotId: number;
  roomName: string;
  subjectName: string;
  examDate: string;
  startDay: string;
  endDay: string;
  status: number; // 0: chưa điểm danh, 1: đang thi, 2: đã thi
};

// Hàm lấy thông tin trạng thái từ status
function getStatusInfo(status: number) {
  switch (status) {
    case 0:
      return {
        label: 'Chưa điểm danh',
        color: 'bg-blue-100 text-blue-800',
        icon: UserCheck,
        buttonText: 'Điểm danh',
        buttonColor: 'bg-blue-600 hover:bg-blue-700'
      };
    case 1:
      return {
        label: 'Đang thi',
        color: 'bg-orange-100 text-orange-800',
        icon: Play,
        buttonText: 'Đang diễn ra',
        buttonColor: 'bg-orange-600 hover:bg-orange-700'
      };
    case 2:
      return {
        label: 'Đã thi',
        color: 'bg-green-100 text-green-800',
        icon: Eye,
        buttonText: 'Xem lịch sử',
        buttonColor: 'bg-green-600 hover:bg-green-700'
      };
    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        buttonText: 'Không xác định',
        buttonColor: 'bg-gray-600 hover:bg-gray-700'
      };
  }
}

export default function TodayExamSchedulePage() {
  const [examSchedules, setExamSchedules] = useState<ApiExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Mặc định là ngày hiện tại
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const router = useRouter();

  // Fetch lịch thi theo ngày được chọn
  const fetchExamSchedules = (date: string) => {
    const teacherId = getUserIdFromToken();
    if (!teacherId) {
      setExamSchedules([]);
      setLoading(false);
      return;
    }
 
    // Tạo Date object từ string
    const currentDate = new Date(date);
    // Tạo ngày hôm qua
    const date1 = new Date(currentDate);
    date1.setDate(date1.getDate() - 1);
    const yesterdayString = date1.toISOString().slice(0, 10);
    
    // Tạo ngày mai
    const date2 = new Date(currentDate);
    date2.setDate(date2.getDate() + 1);
    const tomorrowString = date2.toISOString().slice(0, 10);

    setLoading(true);
    fetch(
      `https://localhost:7074/api/ExamSchedule/teacher/${teacherId}?fromDate=${yesterdayString}&toDate=${tomorrowString}`
    )
      .then((res) => res.json())
      .then((data) => {
        const schedules = Array.isArray(data) ? data : [];
        // Sắp xếp theo thời gian bắt đầu
        schedules.sort((a, b) => new Date(a.startDay).getTime() - new Date(b.startDay).getTime());
        setExamSchedules(schedules);
      })
      .catch(() => setExamSchedules([]))
      .finally(() => setLoading(false));
  };

  // Fetch lịch thi khi component mount hoặc ngày thay đổi
  useEffect(() => {
    fetchExamSchedules(selectedDate);
  }, [selectedDate]);

  // Xử lý click nút theo status
  const handleExamAction = async (exam: ApiExamSchedule) => {
    if (exam.status === 0) {
      // Chưa điểm danh -> cập nhật status thành 1 trước khi chuyển trang
      setUpdatingStatus(exam.examSlotRoomId);
      
      try {
        const response = await fetch(
          `https://localhost:7074/api/ExamSchedule/changestatus?examSlotRoomId=${exam.examSlotRoomId}&status=1`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Cập nhật lại state local để UI reflect ngay lập tức
          setExamSchedules(prev => 
            prev.map(e => 
              e.examSlotRoomId === exam.examSlotRoomId 
                ? { ...e, status: 1 } 
                : e
            )
          );
          
          // Chuyển đến trang điểm danh
          router.push(`/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}`);
        } else {
          alert("Không thể cập nhật trạng thái ca thi. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error updating exam status:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái ca thi. Vui lòng thử lại.");
      } finally {
        setUpdatingStatus(null);
      }
    } else if (exam.status === 1) {
      // Đang thi -> vào trang điểm danh
      router.push(`/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}`);
    } else if (exam.status === 2) {
      // Đã thi -> xem lịch sử
      router.push(`/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}&view=true`);
    }
  };

  // Xử lý khi thay đổi ngày
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
  };

  // Format thời gian
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Format ngày hiển thị
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Format ngày cho tiêu đề
  const formatDateForTitle = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `hôm nay (${formatDate(dateStr)})`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `hôm qua (${formatDate(dateStr)})`;
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isTomorrow) {
      return `ngày mai (${formatDate(dateStr)})`;
    }
    
    return formatDate(dateStr);
  };

  // Kiểm tra ca thi đã qua hay chưa
  const isExamPassed = (endTime: string) => {
    return new Date() > new Date(endTime);
  };

  // Kiểm tra ca thi đang diễn ra
  const isExamOngoing = (startTime: string, endTime: string) => {
    const now = new Date();
    return now >= new Date(startTime) && now <= new Date(endTime);
  };

  // Nút nhanh chọn ngày
  const getQuickDateButtons = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      { label: 'Hôm qua', date: yesterday.toISOString().slice(0, 10) },
      { label: 'Hôm nay', date: today.toISOString().slice(0, 10) },
      { label: 'Ngày mai', date: tomorrow.toISOString().slice(0, 10) }
    ];
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
                  Danh sách các ca thi cần coi trong ngày {formatDateForTitle(selectedDate)}
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
              <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
              Chọn ngày xem lịch
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Input */}
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
            
            {/* Quick Date Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhanh
              </label>
              <div className="flex space-x-3">
                {getQuickDateButtons().map((button) => (
                  <button
                    key={button.label}
                    onClick={() => setSelectedDate(button.date)}
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
                  <p className="text-2xl font-bold text-blue-600">{examSchedules.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chưa điểm danh</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {examSchedules.filter(e => e.status === 0).length}
                  </p>
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
                  <p className="text-2xl font-bold text-orange-600">
                    {examSchedules.filter(e => e.status === 1).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-2xl font-bold text-green-600">
                    {examSchedules.filter(e => e.status === 2).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải lịch thi...</span>
            </div>
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
                    const statusInfo = getStatusInfo(exam.status);
                    const StatusIcon = statusInfo.icon;
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
                              {formatTime(exam.startDay)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 text-red-600 mr-2" />
                            <span className="text-sm text-gray-900 font-medium">
                              {formatTime(exam.endDay)}
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleExamAction(exam)}
                            disabled={isUpdating}
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
                          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
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

        {/* Quick Actions */}
        {examSchedules.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/teacher/examsupervisor')}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors duration-200"
              >
                <Calendar className="w-5 h-5" />
                <span>Xem lịch tuần</span>
              </button>
              
              <button
                onClick={() => {
                  const ongoingExam = examSchedules.find(e => e.status === 1);
                  if (ongoingExam) {
                    router.push(`/teacher/examsupervisor/attendancechecking?examId=${ongoingExam.examSlotRoomId}`);
                  } else {
                    alert('Không có ca thi nào đang diễn ra');
                  }
                }}
                disabled={!examSchedules.some(e => e.status === 1)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Ca thi hiện tại</span>
              </button>
              
              <button
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setSelectedDate(today);
                }}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors duration-200"
              >
                <Clock className="w-5 h-5" />
                <span>Về hôm nay</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}