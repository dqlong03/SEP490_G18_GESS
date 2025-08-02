"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import Select from "react-select";

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

// Các giờ từ 7h đến 19h
const hourSlots = Array.from({ length: 13 }, (_, i) => 7 + i); // [7,8,...,19]

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

// Trả về ngày thứ 2 của tuần hiện tại (YYYY-MM-DD)
function getCurrentMonday() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return monday.toISOString().slice(0, 10);
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

// Group lịch thi theo ngày và giờ
function groupSchedulesByDayAndHour(
  schedules: ApiExamSchedule[],
  weekDates: string[]
) {
  // { [date]: { [hour]: [exam, ...] } }
  const grouped: { [date: string]: { [hour: number]: (ApiExamSchedule & { timeLabel: string })[] } } = {};
  weekDates.forEach((date) => {
    grouped[date] = {};
    hourSlots.forEach((h) => {
      grouped[date][h] = [];
    });
  });

  schedules.forEach((exam) => {
    const date = exam.examDate.slice(0, 10);
    const start = new Date(exam.startDay);
    const end = new Date(exam.endDay);
    const hour = start.getHours();
    const timeLabel = `${start.getHours()}h${start.getMinutes() ? `:${start.getMinutes().toString().padStart(2, "0")}` : ""} - ${end.getHours()}h${end.getMinutes() ? `:${end.getMinutes().toString().padStart(2, "0")}` : ""}`;
    if (weekDates.includes(date) && hourSlots.includes(hour)) {
      grouped[date][hour].push({ ...exam, timeLabel });
    }
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
    d.setDate(d.getDate() + 6); // 7 ngày
    const toDate = d.toISOString().slice(0, 10);

    fetch(
      `https://localhost:7074/api/ExamSchedule/teacher/${teacherId}?fromDate=${fromDate}&toDate=${toDate}`
    )
      .then((res) => res.json())
      .then((data) => setExamSchedules(Array.isArray(data) ? data : []))
      .catch(() => setExamSchedules([]));
  }, [selectedWeek]);

  const weekDates = selectedWeek ? getWeekDatesFromStart(selectedWeek.value) : [];
  const groupedSchedules = groupSchedulesByDayAndHour(examSchedules, weekDates);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-0 py-8 font-sans text-gray-800 bg-white">
      <div className="mb-6 flex gap-6 items-end">
        <div className="w-40">
          <label className="block mb-2 text-base font-medium text-blue-900">Chọn năm</label>
          <Select
            options={yearOptions}
            value={selectedYear}
            onChange={opt => setSelectedYear(opt as YearOption)}
            isSearchable={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "38px",
                borderColor: "#d1d5db",
                boxShadow: "none",
              }),
            }}
          />
        </div>
        <div className="w-56">
          <label className="block mb-2 text-base font-medium text-blue-900">Chọn tuần</label>
          <Select
            options={weekOptions}
            value={selectedWeek}
            onChange={opt => setSelectedWeek(opt as WeekOption)}
            isSearchable={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "38px",
                borderColor: "#d1d5db",
                boxShadow: "none",
              }),
            }}
          />
        </div>
        <div>
          <div className="text-sm text-gray-600 mt-6">
            {weekDates.length > 0 ? (
              <>
                {/* Tuần từ <span className="font-semibold">{formatDate(weekDates[0])}</span> đến <span className="font-semibold">{formatDate(weekDates[6])}</span> */}
              </>
            ) : (
              <span className="font-semibold text-red-500">Không có dữ liệu tuần</span>
            )}
          </div>
        </div>
      </div>
      {weekDates.length > 0 ? (
        <div className="overflow-x-auto">
         <table className="w-full border border-blue-200 rounded-lg shadow-sm min-w-[1200px] table-fixed">
  <thead>
    <tr>
      <th className="p-3 border-b bg-blue-50 text-blue-900 text-center">Giờ</th>
      {weekdays.map((weekday, idx) => (
        <th
          key={weekday}
          className="p-3 border-b bg-blue-50 text-blue-900 text-center w-1/7"
        >
          {weekday}
          <div className="text-xs text-gray-500 font-normal">
            {weekDates[idx] ? formatDate(weekDates[idx]) : ""}
          </div>
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {hourSlots.map((hour) => (
      <tr key={hour}>
        <td className="p-3 border-b font-semibold text-blue-700 text-center">
          {hour}:00
        </td>
        {weekDates.map((date, dayIdx) => {
          const exams = groupedSchedules[date]?.[hour] || [];
          return (
            <td
              key={dayIdx}
              className="p-3 border-b align-top text-center min-w-[120px] w-1/7"
            >
              {exams.length > 0 ? exams.map((exam, i) => (
                <div
                  key={exam.examSlotRoomId + '-' + i}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2"
                >
                  <div className="font-medium text-blue-900">{exam.subjectName}</div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Phòng:</span> {exam.roomName}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Bắt đầu:</span> {exam.startDay.slice(11, 16)}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Kết thúc:</span> {exam.endDay.slice(11, 16)}
                  </div>
                  <button
                    className="mt-2 text-white text-xs font-semibold py-1 px-2 rounded transition bg-blue-600 hover:bg-blue-700"
                    style={{ width: "100%" }}
                    onClick={() =>
                      router.push(
                        `/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}`
                      )
                    }
                  >
                    Điểm danh
                  </button>
                </div>
              )) : (
                <span className="text-gray-400 text-xs"></span>
              )}
            </td>
          );
        })}
      </tr>
    ))}
  </tbody>
</table>
        </div>
      ) : (
        <div className="text-center text-red-500 font-semibold mt-8">Không có dữ liệu tuần để hiển thị bảng</div>
      )}
     </div>
  );
}