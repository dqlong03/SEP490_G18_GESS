"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExamInfo {
  examSlotRoomId: number;
  slotName: string;
  roomName: string;
  subjectName: string;
  examDate: string;
  examName: string;
  startTime: string;
  endTime: string;
  code: string;
}

interface Student {
  id: string;
  code: string;
  fullName: string;
  avatarURL: string;
  isCheckedIn: number;
}

export default function AttendanceCheckingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [id: string]: boolean }>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Timer state
  const [timer, setTimer] = useState(300); // 5 phút = 300 giây
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exam info
  useEffect(() => {
    if (!examId) return;
    fetch(`https://localhost:7074/api/ExamSchedule/slots/${examId}`)
      .then((res) => res.json())
      .then((data) => setExamInfo(data))
      .catch(() => setExamInfo(null));
  }, [examId]);

  // Fetch students
  useEffect(() => {
    if (!examId) return;
    fetch(`https://localhost:7074/api/ExamSchedule/students/${examId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        // Map trạng thái điểm danh
        const att: { [id: string]: boolean } = {};
        (Array.isArray(data) ? data : []).forEach((sv: Student) => {
          att[sv.id] = sv.isCheckedIn === 1;
        });
        setAttendance(att);
      })
      .catch(() => {
        setStudents([]);
        setAttendance({});
      });
  }, [examId]);

  // Timer countdown and refresh code
  useEffect(() => {
    if (timer <= 0) {
      // Gọi API tạo mã code mới
      if (examId) {
        fetch(`https://localhost:7074/api/ExamSchedule/refresh-code?examSlotId=${examId}`, {
          method: "POST",
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.code) {
              setExamInfo(prev => prev ? { ...prev, code: data.code } : prev);
            }
            setTimer(300); // Reset lại 5 phút
          })
          .catch(() => setTimer(300));
      } else {
        setTimer(300);
      }
      return;
    }
    timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, examId]);

  // Khi examId đổi thì reset timer
  useEffect(() => {
    setTimer(300);
  }, [examId]);

  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Điểm danh từng sinh viên
  const handleCheck = async (studentId: string) => {
    if (!examId) return;
    try {
      await fetch(
        `https://localhost:7074/api/ExamSchedule/checkin?examSlotId=${examId}&studentId=${studentId}`,
        { method: "POST" }
      );
      setAttendance((prev) => ({
        ...prev,
        [studentId]: !prev[studentId],
      }));
    } catch {
      // Có thể show toast lỗi nếu cần
    }
  };

  const handleConfirmAttendance = () => {
    setCollapsed(true);
    // Có thể gọi API xác nhận điểm danh nếu cần
  };

  const handleFinishExam = () => {
    router.push("/teacher/examsupervisor");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-gray-800 bg-white">
      <div className="mb-8">
        {examInfo ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-base">
            <div>
              <span className="font-semibold">Môn thi:</span> {examInfo.subjectName}
            </div>
            <div>
              <span className="font-semibold">Phòng thi:</span> {examInfo.roomName}
            </div>
            <div>
              <span className="font-semibold">Ca thi:</span> {examInfo.slotName}
            </div>
            <div>
              <span className="font-semibold">Thời gian:</span> {examInfo.startTime} - {examInfo.endTime}
            </div>
            <div>
              <span className="font-semibold">Tên bài thi:</span> {examInfo.examName}
            </div>
            <div>
              <span className="font-semibold">Mã code vào thi:</span>{" "}
              <span className="text-blue-700 font-mono">{examInfo.code}</span>
              <span className="ml-4 text-sm text-gray-600">
                (Tự động đổi mã sau <span className="font-bold text-red-600">{formatTime(timer)}</span>)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-red-500">Không tìm thấy thông tin ca thi.</div>
        )}
      </div>
      <div>
        <div className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
          Danh sách sinh viên
          {collapsed ? (
            <button
              className="ml-1 p-1 rounded hover:bg-blue-100"
              onClick={() => setCollapsed(false)}
              aria-label="Mở rộng danh sách"
              type="button"
            >
              <ChevronDown size={20} className="text-blue-700" />
            </button>
          ) : (
            <button
              className="ml-1 p-1 rounded hover:bg-blue-100"
              onClick={() => setCollapsed(true)}
              aria-label="Thu gọn danh sách"
              type="button"
            >
              <ChevronUp size={20} className="text-blue-700" />
            </button>
          )}
        </div>
        {!collapsed && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-blue-200 rounded-lg bg-blue-50">
              <thead>
                <tr className="bg-blue-100 text-blue-900 text-base">
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-16">STT</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-40">Mã sinh viên</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center">Tên sinh viên</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-32">Điểm danh</th>
                </tr>
              </thead>
              <tbody>
                {students.map((sv, idx) => (
                  <tr
                    key={sv.id}
                    className="text-gray-800 text-base bg-white"
                  >
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">{idx + 1}</td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">{sv.code}</td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">{sv.fullName}</td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={!!attendance[sv.id]}
                        onChange={() => handleCheck(sv.id)}
                        className="w-5 h-5 accent-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex flex-col items-start gap-4">
          {!collapsed && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-2 px-6 rounded transition"
              onClick={handleConfirmAttendance}
            >
              Xác nhận điểm danh
            </button>
          )}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="confirm-finish"
              checked={isConfirmed}
              onChange={() => setIsConfirmed((v) => !v)}
              className="w-5 h-5 accent-blue-600"
            />
            <label htmlFor="confirm-finish" className="text-base select-none">
              Tôi xác nhận đã coi thi xong
            </label>
            <button
              className={`ml-4 px-6 py-2 rounded text-base font-semibold transition ${
                isConfirmed
                  ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isConfirmed}
              onClick={handleFinishExam}
            >
              Hoàn thành coi thi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}