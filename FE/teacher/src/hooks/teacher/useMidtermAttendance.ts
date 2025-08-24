import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  MidtermExamInfo,
  Student,
  openExamSlot,
  fetchExamInfo,
  refreshCode,
  checkStudentAttendance,
  closeExamSlot,
} from "@/services/teacher/midtermAttendanceService";

export const useMidtermAttendance = (
  examId: string | null,
  examType: string,
  classId: string | null
) => {
  const router = useRouter();
  const teacherId = getUserIdFromToken();

  // State
  const [examInfo, setExamInfo] = useState<MidtermExamInfo | null>(null);
  const [attendance, setAttendance] = useState<{ [id: string]: boolean }>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasOpenedExam, setHasOpenedExam] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Timer states
  const [codeRefreshTimer, setCodeRefreshTimer] = useState(300); // 5 phút = 300 giây
  const [dataRefreshTimer, setDataRefreshTimer] = useState(5); // 5 giây

  // Refs
  const codeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTimerRef = useRef<NodeJS.Timeout | null>(null);
  const codeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy thông tin thi - wrapper function
  const fetchExamData = async (showLoader = false) => {
    if (!examId || !teacherId) return false;

    if (showLoader) setIsRefreshing(true);

    try {
      const result = await fetchExamInfo(teacherId, examId, examType);

      if (result.isClosed) {
        setIsClosed(true);
        router.back();
        return true;
      }

      if (result.data) {
        setExamInfo(result.data);

        // Map trạng thái điểm danh
        const att: { [id: string]: boolean } = {};
        (result.data.students || []).forEach((sv: Student) => {
          att[sv.id] = sv.isCheckedIn === 1;
        });
        setAttendance(att);
      } else {
        setExamInfo(null);
      }

      return false;
    } catch (error) {
      console.error("Error in fetchExamData:", error);
      return false;
    } finally {
      if (showLoader) setIsRefreshing(false);
    }
  };

  // Refresh code wrapper
  const handleRefreshCode = async () => {
    if (!examId) return;
    await refreshCode(examId, examType);
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      if (!examId || !teacherId) return;

      console.log("Initializing data...");
      setLoading(true);

      try {
        const closed = await fetchExamData();
        if (closed) return; // Nếu đã đóng ca thì không mở lại ca thi

        // Bước 2: Mở ca thi (chỉ gọi 1 lần)
        if (!hasOpenedExam) {
          await openExamSlot(examId, examType);
          setHasOpenedExam(true);
        }

        // Bước 3: Refresh code
        await handleRefreshCode();
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
      await handleRefreshCode();
      await fetchExamData(); // Cũng cần lấy data mới sau khi refresh code
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
      await fetchExamData(true);
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

    codeTimerRef.current = setTimeout(
      () => setCodeRefreshTimer((t) => t - 1),
      1000
    );
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

    dataTimerRef.current = setTimeout(
      () => setDataRefreshTimer((t) => t - 1),
      1000
    );
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
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Manual refresh function - refresh cả code và data
  const handleManualRefresh = async () => {
    await handleRefreshCode();
    await fetchExamData(true);
    setCodeRefreshTimer(300); // Reset code timer về 5 phút
    setDataRefreshTimer(5); // Reset data timer về 5 giây
  };

  // Điểm danh từng sinh viên
  const handleCheck = async (studentId: string) => {
    if (!examInfo || !examId) return;
    try {
      await checkStudentAttendance(examId, studentId, examType);
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
    setIsConfirmed(true);
  };

  // Hoàn thành coi thi
  const handleFinishExam = async () => {
    if (!examInfo || !examId) return;
    try {
      // Clear intervals before leaving
      if (codeIntervalRef.current) clearInterval(codeIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);

      // Đóng ca thi trước khi chuyển trang
      await closeExamSlot(examId, examType);
      router.push(`/teacher/myclass/classdetail/${classId}`);
    } catch (error) {
      console.error("Error finishing exam:", error);
    }
  };

  // Get status badge for exam history
  const getExamStatusBadgeProps = (status: string) => {
    switch (status) {
      case "Chưa thi":
        return {
          className:
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800",
          text: "Chưa thi",
        };
      case "Đang thi":
        return {
          className:
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
          text: "Đang thi",
        };
      case "Đã nộp bài":
        return {
          className:
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800",
          text: "Đã nộp bài",
        };
      default:
        return {
          className:
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800",
          text: status,
        };
    }
  };

  // Tính toán thống kê
  const getAttendanceStats = () => {
    const totalStudents = examInfo?.students?.length || 0;
    const checkedInCount = Object.values(attendance).filter(Boolean).length;
    return { totalStudents, checkedInCount };
  };

  return {
    // State
    examInfo,
    attendance,
    isConfirmed,
    collapsed,
    loading,
    isRefreshing,
    hasOpenedExam,
    isClosed,
    codeRefreshTimer,
    dataRefreshTimer,

    // Functions
    formatTime,
    handleManualRefresh,
    handleCheck,
    handleConfirmAttendance,
    handleFinishExam,
    getExamStatusBadgeProps,
    getAttendanceStats,
    setCollapsed,
  };
};
