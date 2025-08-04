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
  ChevronRight
} from 'lucide-react';

type YearOption = { value: number; label: string };
type WeekOption = { value: string; label: string };

type ApiExamSchedule = {
  examSlotRoomId: number;
  examSlotId: number;
  roomName: string;
  subjectName: string;
  examDate: string;
  startDay: string;
  endDay: string;
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

// Group lịch thi theo ngày và sắp xếp theo thời gian
function groupSchedulesByDay(
  schedules: ApiExamSchedule[],
  weekDates: string[]
) {
  const grouped: { [date: string]: (ApiExamSchedule & { timeLabel: string })[] } = {};
  
  weekDates.forEach((date) => {
    grouped[date] = [];
  });

  schedules.forEach((exam) => {
    const date = exam.examDate.slice(0, 10);
    const start = new Date(exam.startDay);
    const end = new Date(exam.endDay);
    const timeLabel = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    
    if (weekDates.includes(date)) {
      grouped[date].push({ ...exam, timeLabel });
    }
  });

  // Sắp xếp các ca thi trong ngày theo thời gian bắt đầu
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => new Date(a.startDay).getTime() - new Date(b.startDay).getTime());
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

export default function ExamSchedulePage() {
  const [yearOptions] = useState<YearOption[]>(getYearOptions());
  const [selectedYear, setSelectedYear] = useState<YearOption>(yearOptions[0]);
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>(getWeekStartOptions(yearOptions[0].value));
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [examSchedules, setExamSchedules] = useState<ApiExamSchedule[]>([]);
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
    const teacherId = getUserIdFromToken();
    if (!teacherId || !selectedWeek) {
      setExamSchedules([]);
      return;
    }
    const fromDate = selectedWeek.value;
    const d = new Date(selectedWeek.value);
    d.setDate(d.getDate() + 6);
    const toDate = d.toISOString().slice(0, 10);

    fetch(
      `https://localhost:7074/api/ExamSchedule/teacher/${teacherId}?fromDate=${fromDate}&toDate=${toDate}`
    )
      .then((res) => res.json())
      .then((data) => setExamSchedules(Array.isArray(data) ? data : []))
      .catch(() => setExamSchedules([]));
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
                        className="px-6 py-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200"
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
                        
                        return (
                          <td
                            key={dayIdx}
                            className="px-6 py-4 align-top border-b border-gray-200"
                          >
                            {exam ? (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Ca {rowIndex + 1}
                                  </span>
                                  <div className="flex items-center text-xs text-gray-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {exam.timeLabel}
                                  </div>
                                </div>
                                
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                                    <span className="font-medium text-gray-900 text-sm">{exam.subjectName}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-700">Phòng {exam.roomName}</span>
                                  </div>
                                </div>
                                
                                <button
                                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                                  onClick={() =>
                                    router.push(
                                      `/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}`
                                    )
                                  }
                                >
                                  <Users className="w-4 h-4" />
                                  <span>Điểm danh</span>
                                </button>
                              </div>
                            ) : (
                              <div className="h-32 flex items-center justify-center text-gray-400">
                                <span className="text-sm">Không có ca thi</span>
                              </div>
                            )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
                  <p className="text-sm font-medium text-gray-600">Số phòng thi</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(examSchedules.map(e => e.roomName)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Số môn thi</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(examSchedules.map(e => e.subjectName)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}