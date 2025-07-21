"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";

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

const yearOptions: YearOption[] = [
  { value: 2025, label: "2025" },
  { value: 2024, label: "2024" },
];

const weekdays = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

// Các ca thi mặc định (sẽ map theo giờ startDay/endDay thực tế)
const slotTimes = [
  { label: "Ca 1", start: 7, end: 9 },
  { label: "Ca 2", start: 9, end: 11 },
  { label: "Ca 3", start: 13, end: 15 },
  { label: "Ca 4", start: 15, end: 20 },
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
    const dateStr = new Date(d);
    dateStr.setDate(d.getDate() + i);
    dates.push(dateStr.toISOString().slice(0, 10));
  }
  return dates;
}

// Lấy index ca thi dựa vào giờ bắt đầu (startDay)
function getSlotIndexByHour(hour: number): number {
  if (hour >= 7 && hour < 9) return 0;
  if (hour >= 9 && hour < 11) return 1;
  if (hour >= 13 && hour < 15) return 2;
  if (hour >= 15 && hour < 20) return 3;
  return -1;
}

// Group lịch thi theo ngày và ca
function groupSchedulesByDayAndSlot(
  schedules: ApiExamSchedule[],
  weekDates: string[]
) {
  const grouped: { [date: string]: (ApiExamSchedule & { slotIdx: number; timeLabel: string })[] } = {};
  weekDates.forEach((date) => {
    grouped[date] = [];
  });

  schedules.forEach((exam) => {
    const date = exam.examDate.slice(0, 10);
    const start = new Date(exam.startDay);
    const end = new Date(exam.endDay);
    const hour = start.getHours();
    const slotIdx = getSlotIndexByHour(hour);
    const timeLabel = `${start.getHours()}h${start.getMinutes() ? `:${start.getMinutes().toString().padStart(2, "0")}` : ""} - ${end.getHours()}h${end.getMinutes() ? `:${end.getMinutes().toString().padStart(2, "0")}` : ""}`;
    if (weekDates.includes(date) && slotIdx !== -1) {
      grouped[date].push({ ...exam, slotIdx, timeLabel });
    }
  });
  return grouped;
}

export default function ExamSchedulePage() {
  const [selectedYear, setSelectedYear] = useState<number>(yearOptions[0].value);
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>(getWeekStartOptions(yearOptions[0].value));

  // Tìm tuần hiện tại trong danh sách tuần
  const currentMonday = getCurrentMonday();
  const defaultWeek =
    weekOptions.find((w) => w.value === currentMonday)?.value ||
    weekOptions[0]?.value ||
    "";

  const [selectedWeek, setSelectedWeek] = useState<string>(defaultWeek);
  const [examSchedules, setExamSchedules] = useState<ApiExamSchedule[]>([]);
  const router = useRouter();

  useEffect(() => {
    const options = getWeekStartOptions(selectedYear);
    setWeekOptions(options);

    // Khi đổi năm, chọn tuần hiện tại nếu có, nếu không chọn tuần đầu tiên
    const currentMonday = getCurrentMonday();
    const weekValue =
      options.find((w) => w.value === currentMonday)?.value ||
      options[0]?.value ||
      "";
    setSelectedWeek(weekValue);
  }, [selectedYear]);

  // Fetch exam schedules from API
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    if (!teacherId || !selectedWeek) {
      setExamSchedules([]);
      return;
    }
    const fromDate = selectedWeek;
    const d = new Date(selectedWeek);
    d.setDate(d.getDate() + 6); // 7 ngày
    const toDate = d.toISOString().slice(0, 10);

    fetch(
      `https://localhost:7074/api/ExamSchedule/teacher/${teacherId}?fromDate=${fromDate}&toDate=${toDate}`
    )
      .then((res) => res.json())
      .then((data) => setExamSchedules(Array.isArray(data) ? data : []))
      .catch(() => setExamSchedules([]));
  }, [selectedWeek]);

  const weekDates = selectedWeek ? getWeekDatesFromStart(selectedWeek) : [];

  // Group theo ngày và ca
  const groupedSchedules = groupSchedulesByDayAndSlot(examSchedules, weekDates);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-0 py-8 font-sans text-gray-800 bg-white">
      <div className="mb-6 flex gap-6 items-end">
        <div className="w-40">
          <label className="block mb-2 text-base font-medium text-blue-900">Chọn năm</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-56">
          <label className="block mb-2 text-base font-medium text-blue-900">Chọn tuần</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            disabled={weekOptions.length === 0}
          >
            {weekOptions.length === 0 ? (
              <option value="">Không có tuần nào</option>
            ) : (
              weekOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
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
        <table className="w-full border border-blue-200 rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="p-3 border-b bg-blue-50 text-blue-900 text-center">Ca / Thời gian</th>
              {weekdays.map((weekday, idx) => (
                <th key={weekday} className="p-3 border-b bg-blue-50 text-blue-900 text-center">
                  {weekday}
                  <div className="text-xs text-gray-500 font-normal">
                    {weekDates[idx] ? formatDate(weekDates[idx]) : ""}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slotTimes.map((slot, slotIdx) => (
              <tr key={slot.label}>
                <td className="p-3 border-b font-semibold text-blue-700 text-center">
                  {slot.label}
                  <div className="text-xs text-gray-500 font-normal">{`${slot.start}h - ${slot.end}h`}</div>
                </td>
                {weekDates.map((date, dayIdx) => {
                  // Tìm lịch thi đúng ca
                  const exams = groupedSchedules[date]?.filter(e => e.slotIdx === slotIdx) || [];
                  return (
                    <td key={dayIdx} className="p-3 border-b align-top text-center">
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
                            <span className="font-semibold">Thời gian:</span> {exam.timeLabel}
                          </div>
                          <button
                            className="mt-2 text-white text-xs font-semibold py-1 px-2 rounded transition bg-blue-600 hover:bg-blue-700"
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
                        <span className="text-gray-400 text-xs">Trống</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
         <div className="text-center text-red-500 font-semibold mt-8">Không có dữ liệu tuần để hiển thị bảng</div>
      )}
    </div>
  );
}