"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Clock, Users, BookOpen, Timer, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { getUserIdFromToken } from "@utils/tokenUtils";

interface Student {
  id: string;
  code: string;
  fullName: string;
  avatarURL: string;
  isCheckedIn: number;
  statusExamHistory: string;
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
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasOpenedExam, setHasOpenedExam] = useState(false);

  // Timer states - phân biệt 2 loại timer
  const [codeRefreshTimer, setCodeRefreshTimer] = useState(300); // 5 phút = 300 giây
  const [dataRefreshTimer, setDataRefreshTimer] = useState(5); // 5 giây
  
  const codeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTimerRef = useRef<NodeJS.Timeout | null>(null);
  const codeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isClosed, setIsClosed] = useState(false);


  // Open exam slot function
  const openExamSlot = async () => {
    if (!examId || hasOpenedExam) return;
    
    try {
      console.log("Opening exam slot...");
      const response = await fetch(
        `https://localhost:7074/api/ExamineTheMidTermExam/changestatus?examId=${examId}&status=%C4%90ang%20m%E1%BB%9F%20ca&examType=${examType}`,
        { method: "POST" }
      );
      
      if (response.ok) {
        console.log("Exam slot opened successfully");
        setHasOpenedExam(true);
      } else {
        console.error("Failed to open exam slot:", response.status);
      }
    } catch (error) {
      console.error("Error opening exam slot:", error);
    }
  };

  // Fetch exam info only
  const fetchExamInfo = async (showLoader = false) => {
    if (!examId || !teacherId) return;
    
    if (showLoader) setIsRefreshing(true);
    
    try {
      console.log("Fetching exam info...");
      const response = await fetch(
        `https://localhost:7074/api/ExamineTheMidTermExam/slots/${teacherId}/${examId}?examType=${examType}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Exam info received:", data);

        // Nếu status là "Đã đóng ca" thì tự động quay lại
        if (data.status === "Đã đóng ca") {
          setIsClosed(true);
          router.back();
          return true;
        }
      
      setExamInfo(data);
      
      // Map trạng thái điểm danh
      const att: { [id: string]: boolean } = {};
      (data.students || []).forEach((sv: Student) => {
        att[sv.id] = sv.isCheckedIn === 1;
      });
      setAttendance(att);

      return false;
    } catch (error) {
      console.error("Error fetching exam info:", error);
      setExamInfo(null);
    } finally {
      if (showLoader) setIsRefreshing(false);
    }
  };

  // Refresh code only
  const refreshCode = async () => {
    if (!examId) return;
    try {
      console.log("Refreshing code...");
      await fetch(
        `https://localhost:7074/api/ExamineTheMidTermExam/refresh?examId=${examId}&examType=${examType}`,
        { method: "POST" }
      );
      console.log("Code refreshed successfully");
    } catch (error) {
      console.error("Error refreshing code:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      if (!examId || !teacherId) return;
      
      console.log("Initializing data...");
      setLoading(true);
      
      try {
        const closed = await fetchExamInfo();
        if (closed) return; // Nếu đã đóng ca thì không mở lại ca thi

        // Bước 2: Mở ca thi (chỉ gọi 1 lần)
        await openExamSlot();

        // Bước 3: Refresh code
        await refreshCode();
        
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [examId, teacherId, examType]);

  // Auto refresh code every 5 minutes (300 seconds)
  useEffect(() => {
    if (loading || !examId || !teacherId) return;

    // Clear any existing interval
    if (codeIntervalRef.current) {
      clearInterval(codeIntervalRef.current);
    }

    // Set up new interval for code refresh (5 minutes)
    codeIntervalRef.current = setInterval(async () => {
      console.log("Auto refreshing code...");
      await refreshCode();
      await fetchExamInfo(); // Cũng cần lấy data mới sau khi refresh code
      setCodeRefreshTimer(300); // Reset timer về 5 phút
    }, 300000); // 300000ms = 5 phút

    // Cleanup on unmount or dependency change
    return () => {
      if (codeIntervalRef.current) {
        clearInterval(codeIntervalRef.current);
      }
    };
  }, [loading, examId, teacherId, examType]);

  // Auto refresh data every 5 seconds
  useEffect(() => {
    if (loading || !examId || !teacherId) return;

    // Clear any existing interval
    if (dataIntervalRef.current) {
      clearInterval(dataIntervalRef.current);
    }

    // Set up new interval for data refresh (5 seconds)
    dataIntervalRef.current = setInterval(async () => {
      console.log("Auto refreshing data...");
      await fetchExamInfo(true);
      setDataRefreshTimer(5); // Reset timer về 5 giây
    }, 5000);

    // Cleanup on unmount or dependency change
    return () => {
      if (dataIntervalRef.current) {
        clearInterval(dataIntervalRef.current);
      }
    };
  }, [loading, examId, teacherId, examType]);

  // Code refresh timer countdown (5 minutes)
  useEffect(() => {
    if (loading) return;
    
    if (codeRefreshTimer <= 0) {
      setCodeRefreshTimer(300); // Reset về 5 phút
      return;
    }
    
    codeTimerRef.current = setTimeout(() => setCodeRefreshTimer(t => t - 1), 1000);
    return () => {
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    };
  }, [codeRefreshTimer, loading]);

  // Data refresh timer countdown (5 seconds)
  useEffect(() => {
    if (loading) return;
    
    if (dataRefreshTimer <= 0) {
      setDataRefreshTimer(5); // Reset về 5 giây
      return;
    }
    
    dataTimerRef.current = setTimeout(() => setDataRefreshTimer(t => t - 1), 1000);
    return () => {
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);
    };
  }, [dataRefreshTimer, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);
      if (codeIntervalRef.current) clearInterval(codeIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
    };
  }, []);

  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Manual refresh function - refresh cả code và data
  const handleManualRefresh = async () => {
    await refreshCode();
    await fetchExamInfo(true);
    setCodeRefreshTimer(300); // Reset code timer về 5 phút
    setDataRefreshTimer(5); // Reset data timer về 5 giây
  };

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
    } catch (error) {
      console.error("Error checking attendance:", error);
    }
  };

  // Xác nhận điểm danh
  const handleConfirmAttendance = () => {
    setCollapsed(true);
  };

  // Hoàn thành coi thi
  const handleFinishExam = async () => {
    if (!examInfo) return;
    try {
      // Clear intervals before leaving
      if (codeIntervalRef.current) clearInterval(codeIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);
      
      // Đóng ca thi trước khi chuyển trang
      await fetch(
        `https://localhost:7074/api/ExamineTheMidTermExam/changestatus?examId=${examId}&status=%C4%90%C3%A3%20%C4%91%C3%B3ng%20ca&examType=${examType}`,
        { method: "POST" }
      );
      router.push(`/teacher/myclass/classdetail/${classId}`);
    } catch (error) {
      console.error("Error finishing exam:", error);
    }
  };

  // Get status badge for exam history
  const getExamStatusBadge = (status: string) => {
    switch (status) {
      case "Chưa thi":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Chưa thi
          </span>
        );
      case "Đang thi":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Đang thi
          </span>
        );
      case "Đã nộp bài":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Đã nộp bài
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Tính toán thống kê
  const getAttendanceStats = () => {
    const totalStudents = examInfo?.students?.length || 0;
    const checkedInCount = Object.values(attendance).filter(Boolean).length;
    return { totalStudents, checkedInCount };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Đang khởi tạo ca thi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Coi thi và điểm danh</h1>
                <p className="text-gray-600">Quản lý điểm danh sinh viên tham gia thi</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Manual Refresh Button */}
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

              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exam Info Card */}
        {examInfo ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin bài thi
              {isRefreshing && (
                <div className="ml-3 flex items-center text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  Đang cập nhật...
                </div>
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Môn thi</p>
                  <p className="font-semibold text-gray-900">{examInfo.subjectName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời lượng</p>
                  <p className="font-semibold text-gray-900">{examInfo.duration} phút</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đầu điểm</p>
                  <p className="font-semibold text-gray-900">{examInfo.category}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tên bài thi</p>
                  <p className="font-semibold text-gray-900">{examInfo.examName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    examInfo.status === "Đang mở ca" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {examInfo.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="text-center text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Không tìm thấy thông tin ca thi</p>
            </div>
          </div>
        )}

        {/* Code & Timer Card */}
        {examInfo && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Timer className="w-5 h-5 mr-2" />
                  Mã code vào thi
                </h3>
                <div className="font-mono text-3xl font-bold tracking-wider">
                  {examInfo.code}
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 mb-2">Làm mới mã code sau</p>
                <div className="flex items-center space-x-2">
                  <RefreshCw className={`w-5 h-5 text-yellow-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <div className="text-4xl font-bold font-mono">
                    {formatTime(codeRefreshTimer)}
                  </div>
                </div>
                {/* <div className="mt-3 pt-3 border-t border-blue-400">
                  <p className="text-blue-100 text-sm mb-1">Cập nhật dữ liệu sau</p>
                  <div className="text-xl font-bold font-mono">
                    {formatTime(dataRefreshTimer)}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng sinh viên</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã điểm danh</p>
                <p className="text-2xl font-bold text-gray-900">{stats.checkedInCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chưa điểm danh</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents - stats.checkedInCount}</p>
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
                Danh sách sinh viên
                {isRefreshing && (
                  <div className="ml-3 flex items-center text-sm text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    Đang cập nhật...
                  </div>
                )}
              </h3>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-gray-700"
              >
                {collapsed ? (
                  <>
                    <ChevronDown size={20} />
                    <span>Mở rộng</span>
                  </>
                ) : (
                  <>
                    <ChevronUp size={20} />
                    <span>Thu gọn</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sinh viên</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái thi</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm danh</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(examInfo?.students || []).map((sv, idx) => (
                    <tr key={sv.id} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sv.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {sv.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{sv.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getExamStatusBadge(sv.statusExamHistory)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!attendance[sv.id]}
                            onChange={() => handleCheck(sv.id)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {attendance[sv.id] ? "Có mặt" : "Vắng"}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-4">
              {!collapsed && (
                <button
                  onClick={handleConfirmAttendance}
                  className="self-start flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Xác nhận điểm danh</span>
                </button>
              )}
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={() => setIsConfirmed(!isConfirmed)}
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">Tôi xác nhận đã coi thi xong</span>
                </label>
                
                <button
                  onClick={handleFinishExam}
                  disabled={!isConfirmed}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                    isConfirmed
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Hoàn thành coi thi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}