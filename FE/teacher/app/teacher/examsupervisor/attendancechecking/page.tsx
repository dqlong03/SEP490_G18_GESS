"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Shield
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timer, setTimer] = useState(300); // 5 phút = 300 giây
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exam info
  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    fetch(`https://localhost:7074/api/ExamSchedule/slots/${examId}`)
      .then((res) => res.json())
      .then((data) => setExamInfo(data))
      .catch(() => setExamInfo(null))
      .finally(() => setLoading(false));
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

  const attendedCount = Object.values(attendance).filter(Boolean).length;
  const totalStudents = students.length;
  const attendanceRate = totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Đang tải thông tin ca thi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Điểm danh coi thi</h1>
                <p className="text-gray-600">Quản lý điểm danh và giám sát ca thi</p>
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

        {/* Exam Info */}
        {examInfo ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin ca thi
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
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mã code vào thi</p>
                    <p className="text-2xl font-bold text-blue-700 font-mono tracking-wider">{examInfo.code}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tự động đổi mã sau</p>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-red-600" />
                    <span className="text-xl font-bold text-red-600 font-mono">{formatTime(timer)}</span>
                  </div>
                </div>
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm danh</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((sv, idx) => (
                    <tr
                      key={sv.id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        attendance[sv.id] ? 'bg-green-50' : ''
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
                  isConfirmed
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isConfirmed}
                onClick={handleFinishExam}
              >
                <Shield className="w-4 h-4" />
                <span>Hoàn thành coi thi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}