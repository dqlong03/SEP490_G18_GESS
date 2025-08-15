"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import Select from "react-select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Play,
  UserCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';

type YearOption = { value: number; label: string };
type WeekOption = { value: string; label: string };

type ApiExamSchedule = {
  examSlotRoomId: number;
  examSlotId: number;
  roomName: string;
  subjectName: string;
  examDate: string;
  startDay: string; // Không dùng
  endDay: string; // Không dùng
  startTime: string; // Dùng cho thời gian bắt đầu
  endTime: string; // Dùng cho thời gian kết thúc
  status: number; // 0: chưa điểm danh, 1: đang thi, 2: đã thi
  examSlotStatus: string; // Trạng thái gán bài thi
};

const weekdays = [
  "Thứ 2",
  "Thứ 3", 
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

// Lấy danh sách các ngày thứ 2 đầu tuần của năm
function getWeekStartOptions(year: number): WeekOption[] {
  const options: WeekOption[] = [];
  let d = new Date(year, 0, 1);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }
  while (d.getFullYear() === year) {
    const value = d.toISOString().slice(0, 10);
    const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    options.push({ value, label });
    d.setDate(d.getDate() + 7);
  }
  return options;
}

// Trả về mảng 7 ngày của tuần đó (thứ 2 -> chủ nhật)
function getWeekDatesFromStart(startDate: string): string[] {
  const dates: string[] = [];
  const d = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const dateCopy = new Date(d);
    dateCopy.setDate(d.getDate() + i);
    dates.push(dateCopy.toISOString().slice(0, 10));
  }
  return dates;
}

// Format time từ TimeSpan string (HH:mm:ss)
function formatTimeFromTimeSpan(timeSpan: string): string {
  if (!timeSpan) return "";
  
  // Lấy phần time từ TimeSpan (HH:mm:ss)
  const [hours, minutes] = timeSpan.split(':');
  
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

// Kiểm tra xem ngày thi có trùng với ngày hiện tại không
function isExamDateToday(examDate: string): boolean {
  const today = new Date();
  const examDay = new Date(examDate);
  
  return today.getFullYear() === examDay.getFullYear() &&
         today.getMonth() === examDay.getMonth() &&
         today.getDate() === examDay.getDate();
}

// Group lịch thi theo ngày và sắp xếp theo thời gian
function groupSchedulesByDay(
  schedules: ApiExamSchedule[],
  weekDates: string[]
) {
  const grouped: { [date: string]: (ApiExamSchedule & { timeLabel: string; isToday: boolean })[] } = {};
  
  weekDates.forEach((date) => {
    grouped[date] = [];
  });

  schedules.forEach((exam) => {
    const date = exam.examDate.slice(0, 10);
    const startTime = formatTimeFromTimeSpan(exam.startTime);
    const endTime = formatTimeFromTimeSpan(exam.endTime);
    const timeLabel = `${startTime} - ${endTime}`;
    const isToday = isExamDateToday(exam.examDate);
    
    if (weekDates.includes(date)) {
      grouped[date].push({ ...exam, timeLabel, isToday });
    }
  });

  // Sắp xếp các ca thi trong ngày theo thời gian bắt đầu
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const timeA = formatTimeFromTimeSpan(a.startTime);
      const timeB = formatTimeFromTimeSpan(b.startTime);
      return timeA.localeCompare(timeB);
    });
  });

  return grouped;
}

// Lấy danh sách năm hiện tại và 10 năm về trước
function getYearOptions(): YearOption[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString(),
  }));
}

// Tìm tuần chứa ngày hiện tại
function findWeekOfToday(weekOptions: WeekOption[]): WeekOption | undefined {
  const today = new Date();
  for (let i = 0; i < weekOptions.length; i++) {
    const weekStart = new Date(weekOptions[i].value);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (today >= weekStart && today <= weekEnd) {
      return weekOptions[i];
    }
  }
  return weekOptions[0];
}

// Hàm lấy thông tin trạng thái từ status, kiểm tra ngày và examSlotStatus
function getStatusInfo(status: number, isToday: boolean, examSlotStatus: string) {
  // Kiểm tra trường hợp chưa gán bài thi
  const isNotAssigned = examSlotStatus === "Chưa gán bài thi";
  const isNotOpened = examSlotStatus === "Chưa mở ca";
  const isDisabled = !isToday && (status === 0 || status === 1) || isNotAssigned || isNotOpened;

  // Nếu chưa mở ca, return trạng thái đặc biệt
  if (isNotOpened) {
    return {
      label: 'Chưa mở ca',
      color: 'gray',
      bgColor: 'from-gray-50 to-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-500',
      buttonColor: 'bg-gray-400 cursor-not-allowed',
      icon: Lock,
      buttonText: 'Chưa mở ca',
      disabled: true
    };
  }

  // Nếu chưa gán bài thi, return trạng thái đặc biệt
  if (isNotAssigned) {
    return {
      label: 'Chưa gán bài thi',
      color: 'red',
      bgColor: 'from-red-50 to-pink-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600',
      buttonColor: 'bg-red-400 cursor-not-allowed',
      icon: AlertTriangle,
      buttonText: 'Chưa gán bài thi',
      disabled: true
    };
  }

  switch (status) {
    case 0:
      return {
        label: 'Chưa điểm danh',
        color: 'blue',
        bgColor: isDisabled ? 'from-gray-50 to-gray-50' : 'from-blue-50 to-indigo-50',
        borderColor: isDisabled ? 'border-gray-200' : 'border-blue-200',
        textColor: isDisabled ? 'text-gray-500' : 'text-blue-600',
        buttonColor: isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700',
        icon: isDisabled ? Lock : UserCheck,
        buttonText: isDisabled ? 'Chưa đến ngày thi' : 'Điểm danh',
        disabled: isDisabled
      };
    case 1:
      return {
        label: 'Đang thi',
        color: 'orange',
        bgColor: isDisabled ? 'from-gray-50 to-gray-50' : 'from-orange-50 to-yellow-50',
        borderColor: isDisabled ? 'border-gray-200' : 'border-orange-200',
        textColor: isDisabled ? 'text-gray-500' : 'text-orange-600',
        buttonColor: isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700',
        icon: isDisabled ? Lock : Play,
        buttonText: isDisabled ? 'Chưa đến ngày thi' : 'Đang diễn ra',
        disabled: isDisabled
      };
    case 2:
      return {
        label: 'Đã thi',
        color: 'green',
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        icon: Eye,
        buttonText: 'Xem lịch sử',
        disabled: false
      };
    default:
      return {
        label: 'Không xác định',
        color: 'gray',
        bgColor: 'from-gray-50 to-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-600',
        buttonColor: 'bg-gray-600 hover:bg-gray-700',
        icon: Clock,
        buttonText: 'Không xác định',
        disabled: false
      };
  }
}

export default function ExamSchedulePage() {
  const [yearOptions] = useState<YearOption[]>(getYearOptions());
  const [selectedYear, setSelectedYear] = useState<YearOption>(yearOptions[0]);
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>(getWeekStartOptions(yearOptions[0].value));
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [examSchedules, setExamSchedules] = useState<ApiExamSchedule[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const router = useRouter();

  // Khi đổi năm, cập nhật tuần và chọn tuần chứa ngày hiện tại
  useEffect(() => {
    const options = getWeekStartOptions(selectedYear.value);
    setWeekOptions(options);
    const weekOfToday = findWeekOfToday(options);
    setSelectedWeek(weekOfToday || options[0] || null);
  }, [selectedYear]);

  // Khi đổi tuần, fetch lịch thi
  useEffect(() => {
    const fetchExamSchedules = async () => {
      const teacherId = getUserIdFromToken();
      if (!teacherId || !selectedWeek) {
        setExamSchedules([]);
        return;
      }
      const fromDate = selectedWeek.value;
      const d = new Date(selectedWeek.value);
      d.setDate(d.getDate() + 6);
      const toDate = d.toISOString().slice(0, 10);

      try {
        const response = await fetch(
          `https://localhost:7074/api/ExamSchedule/teacher/${teacherId}?fromDate=${fromDate}&toDate=${toDate}`
        );
        const data = await response.json();
        const schedules = Array.isArray(data) ? data : [];
        setExamSchedules(schedules);
      } catch (error) {
        setExamSchedules([]);
      }
    };

    fetchExamSchedules();
  }, [selectedWeek]);

  const weekDates = selectedWeek ? getWeekDatesFromStart(selectedWeek.value) : [];
  const groupedSchedules = groupSchedulesByDay(examSchedules, weekDates);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  }

  // Tìm số ca thi nhiều nhất trong 1 ngày để làm số hàng
  const maxExamsPerDay = Math.max(...weekDates.map(date => groupedSchedules[date]?.length || 0), 1);

  const goToPrevWeek = () => {
    const currentIndex = weekOptions.findIndex(w => w.value === selectedWeek?.value);
    if (currentIndex > 0) {
      setSelectedWeek(weekOptions[currentIndex - 1]);
    }
  };

  const goToNextWeek = () => {
    const currentIndex = weekOptions.findIndex(w => w.value === selectedWeek?.value);
    if (currentIndex < weekOptions.length - 1) {
      setSelectedWeek(weekOptions[currentIndex + 1]);
    }
  };

  // Xử lý click nút theo status
  const handleExamAction = async (exam: ApiExamSchedule & { isToday: boolean }) => {
    // Kiểm tra nếu chưa gán bài thi
    if (exam.examSlotStatus === "Chưa gán bài thi") {
      return; // Không làm gì nếu chưa gán bài thi
    }

    // Kiểm tra validation ngày
    if (!exam.isToday && (exam.status === 0 || exam.status === 1)) {
      return; // Không làm gì nếu không phải ngày thi
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch coi thi</h1>
              <p className="text-gray-600">Quản lý và theo dõi lịch coi thi theo tuần</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-end gap-6">
              <div className="w-40">
                <label className="block mb-2 text-sm font-medium text-gray-700">Chọn năm</label>
                <Select
                  options={yearOptions}
                  value={selectedYear}
                  onChange={opt => setSelectedYear(opt as YearOption)}
                  isSearchable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "44px",
                      borderColor: "#d1d5db",
                      '&:hover': { borderColor: '#3b82f6' }
                    }),
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-64">
                <label className="block mb-2 text-sm font-medium text-gray-700">Chọn tuần</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevWeek}
                    disabled={!selectedWeek || weekOptions.findIndex(w => w.value === selectedWeek.value) === 0}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1">
                    <Select
                      options={weekOptions}
                      value={selectedWeek}
                      onChange={opt => setSelectedWeek(opt as WeekOption)}
                      isSearchable={false}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "44px",
                          borderColor: "#d1d5db",
                          '&:hover': { borderColor: '#3b82f6' }
                        }),
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={goToNextWeek}
                    disabled={!selectedWeek || weekOptions.findIndex(w => w.value === selectedWeek.value) === weekOptions.length - 1}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {weekDates.length > 0 && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Tuần từ <span className="font-semibold">{formatDate(weekDates[0])}</span> đến{' '}
                      <span className="font-semibold">{formatDate(weekDates[6])}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        {weekDates.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Lịch coi thi tuần
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    {weekdays.map((weekday, idx) => (
                      <th
                        key={weekday}
                        className="px-4 py-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{weekday}</span>
                          <span className="text-xs text-gray-500 font-normal">
                            {weekDates[idx] ? formatDate(weekDates[idx]) : ""}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from({ length: maxExamsPerDay }, (_, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {weekDates.map((date, dayIdx) => {
                        const exams = groupedSchedules[date] || [];
                        const exam = exams[rowIndex];
                        
                        if (!exam) {
                          return (
                            <td
                              key={dayIdx}
                              className="px-4 py-4 align-top border-b border-gray-200"
                            >
                              <div className="h-32 flex items-center justify-center text-gray-400">
                                <span className="text-sm">Không có ca thi</span>
                              </div>
                            </td>
                          );
                        }

                        const statusInfo = getStatusInfo(exam.status, exam.isToday, exam.examSlotStatus);
                        const StatusIcon = statusInfo.icon;
                        const isUpdating = updatingStatus === exam.examSlotRoomId;
                        
                        return (
                          <td
                            key={dayIdx}
                            className="px-4 py-4 align-top border-b border-gray-200"
                          >
                            <div className={`border rounded-lg p-3 hover:shadow-md transition-shadow duration-200 bg-gradient-to-r ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.textColor} bg-${statusInfo.color}-100`}>
                                  Ca {rowIndex + 1}
                                </span>
                                <span className={`flex items-center text-xs px-2 py-1 rounded-full ${statusInfo.textColor} bg-${statusInfo.color}-100`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </span>
                              </div>
                              
                              {/* Thời gian ở dòng riêng */}
                              <div className="mb-3">
                                <div className="flex items-center justify-center text-sm font-semibold text-gray-800 bg-gray-100 rounded-md py-1">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {exam.timeLabel}
                                </div>
                              </div>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center">
                                  <BookOpen className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                  <span className="font-medium text-gray-900 text-sm leading-tight">{exam.subjectName}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">Phòng {exam.roomName}</span>
                                </div>
                                {/* Hiển thị trạng thái gán bài thi nếu cần */}
                                {exam.examSlotStatus === "Chưa gán bài thi" && (
                                  <div className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                                    <span className="text-sm text-red-600 font-medium">{exam.examSlotStatus}</span>
                                  </div>
                                )}
                              </div>
                              
                              <button
                                className={`w-full flex items-center justify-center space-x-2 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 ${
                                  isUpdating 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : statusInfo.buttonColor
                                }`}
                                onClick={() => handleExamAction(exam)}
                                disabled={isUpdating || statusInfo.disabled}
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
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có dữ liệu</h3>
            <p className="text-gray-600">Không có dữ liệu tuần để hiển thị lịch coi thi</p>
          </div>
        )}

        {/* Statistics */}
        {examSchedules.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
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
                  <p className="text-sm font-medium text-gray-600">Chưa gán bài thi</p>
                  <p className="text-2xl font-bold text-red-600">
                    {examSchedules.filter(e => e.examSlotStatus === "Chưa gán bài thi").length}
                  </p>
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
                  <p className="text-2xl font-bold text-blue-600">
                    {examSchedules.filter(e => e.status === 0 && e.examSlotStatus !== "Chưa gán bài thi").length}
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
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}