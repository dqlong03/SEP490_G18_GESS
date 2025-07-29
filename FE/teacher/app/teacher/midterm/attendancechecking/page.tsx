"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getUserIdFromToken } from "@utils/tokenUtils";

interface Student {
  id: string;
  code: string;
  fullName: string;
  avatarURL: string;
  isCheckedIn: number;
}

interface MidtermExamInfo {
  pracExamId: number;
  examName: string;
  subjectName: string;
  duration: number;
  status: string;
  category: string;
  code: string;
  students: Student[];
}

export default function MidtermAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const examType = searchParams.get("examType") || "2";
  const teacherId = getUserIdFromToken();
  const classId = searchParams.get("classId");

  const [examInfo, setExamInfo] = useState<MidtermExamInfo | null>(null);
  const [attendance, setAttendance] = useState<{ [id: string]: boolean }>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Fetch exam info
  useEffect(() => {
    if (!examId || !teacherId) return;
    fetch(
      `https://localhost:7074/api/ExamineTheMidTermExam/slots/${teacherId}/${examId}?examType=${examType}`
    )
      .then((res) => res.json())
      .then((data) => {
        setExamInfo(data);
        // Map trạng thái điểm danh
        const att: { [id: string]: boolean } = {};
        (data.students || []).forEach((sv: Student) => {
          att[sv.id] = sv.isCheckedIn === 1;
        });
        setAttendance(att);
      })
      .catch(() => setExamInfo(null));
  }, [examId, teacherId, examType]);

  // Điểm danh từng sinh viên
  const handleCheck = async (studentId: string) => {
    if (!examInfo) return;
    try {
      await fetch(
        `https://localhost:7074/api/ExamineTheMidTermExam/checkin?examId=${examId}&studentId=${studentId}&examType=${examType}`,
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

  // Hoàn thành coi thi
  const handleFinishExam = async () => {
    if (!examInfo) return;
    await fetch(
      `https://localhost:7074/api/ExamineTheMidTermExam/changestatus?examId=${examId}&status=Đã%20thi&examType=${examType}`,
      { method: "POST" }
    );
    router.push(`/teacher/myclass/classdetail/${classId}`);
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
              <span className="font-semibold">Thời lượng:</span> {examInfo.duration} phút
            </div>
            <div>
              <span className="font-semibold">Tên bài thi:</span> {examInfo.examName}
            </div>
            <div>
              <span className="font-semibold">Đầu điểm:</span> {examInfo.category}
            </div>
            <div>
              <span className="font-semibold">Mã code vào thi:</span>{" "}
              <span className="text-blue-700 font-mono">{examInfo.code}</span>
            </div>
            <div>
              <span className="font-semibold">Trạng thái:</span> {examInfo.status}
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
            <table className="min-w-full border border-blue-200 rounde  d-lg bg-blue-50">
              <thead>
                <tr className="bg-blue-100 text-blue-900 text-base">
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-16">STT</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-40">Mã sinh viên</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center">Tên sinh viên</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-32">Điểm danh</th>
                </tr>
              </thead>
              <tbody>
                {(examInfo?.students || []).map((sv, idx) => (
                  <tr key={sv.id} className="text-gray-800 text-base bg-white">
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