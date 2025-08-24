// useAttendanceChecking.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  attendanceCheckingService,
  ExamInfo,
  Student,
  AttendanceData,
} from "@/services/teacher/attendanceCheckingService";

interface UseAttendanceCheckingProps {
  examId: string | null;
  isViewMode: boolean;
}

export const useAttendanceChecking = ({
  examId,
  isViewMode,
}: UseAttendanceCheckingProps) => {
  const router = useRouter();

  // Main state
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Timer states
  const [codeRefreshTimer, setCodeRefreshTimer] = useState(300); // 5 minutes
  const [dataRefreshTimer, setDataRefreshTimer] = useState(5); // 5 seconds

  // Refs for timers and intervals
  const codeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dataTimerRef = useRef<NodeJS.Timeout | null>(null);
  const codeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exam info
  const fetchExamInfo = useCallback(async () => {
    if (!examId) return;
    try {
      const data = await attendanceCheckingService.getExamInfo(examId);
      setExamInfo(data);
    } catch (error) {
      console.error("Error fetching exam info:", error);
      setExamInfo(null);
    }
  }, [examId]);

  // Fetch students
  const fetchStudents = useCallback(
    async (showLoader = false) => {
      if (!examId) return;

      if (showLoader) setIsRefreshing(true);

      try {
        const studentsData =
          await attendanceCheckingService.getStudents(examId);
        setStudents(studentsData);

        // Map attendance status
        const att: AttendanceData = {};
        studentsData.forEach((sv: Student) => {
          att[sv.id] = sv.isCheckedIn === 1;
        });
        setAttendance(att);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        setAttendance({});
      } finally {
        if (showLoader) setIsRefreshing(false);
      }
    },
    [examId]
  );

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchExamInfo(), fetchStudents()]);
    setLoading(false);
  }, [fetchExamInfo, fetchStudents]);

  // Refresh code only
  const refreshCode = useCallback(async () => {
    if (!examId) return;
    try {
      await attendanceCheckingService.refreshCode(examId);
    } catch (error) {
      console.error("Error refreshing code:", error);
    }
  }, [examId]);

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      if (!isViewMode && examId) {
        // Refresh code before loading data (only when not in view mode)
        await refreshCode();
      }
      // Then load data
      await loadData();
    };

    initializeData();
  }, [examId, isViewMode, loadData, refreshCode]);

  // Auto refresh code every 5 minutes - ONLY when NOT in view mode
  useEffect(() => {
    if (isViewMode || loading || !examId) return;

    // Clear any existing interval
    if (codeIntervalRef.current) {
      clearInterval(codeIntervalRef.current);
    }

    // Set up new interval for code refresh (5 minutes)
    codeIntervalRef.current = setInterval(async () => {
      console.log("Auto refreshing code...");
      await refreshCode();
      await fetchExamInfo(); // Also get new exam info after refreshing code
      setCodeRefreshTimer(300); // Reset timer to 5 minutes
    }, 300000); // 300000ms = 5 minutes

    // Cleanup on unmount or dependency change
    return () => {
      if (codeIntervalRef.current) {
        clearInterval(codeIntervalRef.current);
      }
    };
  }, [isViewMode, loading, examId, refreshCode, fetchExamInfo]);

  // Auto refresh students data every 5 seconds - ONLY when NOT in view mode
  useEffect(() => {
    if (isViewMode || loading || !examId) return;

    // Clear any existing interval
    if (dataIntervalRef.current) {
      clearInterval(dataIntervalRef.current);
    }

    // Set up new interval for data refresh (5 seconds)
    dataIntervalRef.current = setInterval(async () => {
      console.log("Auto refreshing student data...");
      // Fetch students and exam info simultaneously
      const [_, examStatus] = await Promise.all([
        fetchStudents(true),
        attendanceCheckingService.getExamStatus(examId),
      ]);

      // Check if exam is finished
      if (examStatus === 2) {
        router.push("/teacher/examsupervisor");
        return;
      }
      setDataRefreshTimer(5); // Reset timer to 5 seconds
    }, 5000);

    // Cleanup on unmount or dependency change
    return () => {
      if (dataIntervalRef.current) {
        clearInterval(dataIntervalRef.current);
      }
    };
  }, [isViewMode, loading, examId, fetchStudents, router]);

  // Code refresh timer countdown (5 minutes) - ONLY when NOT in view mode
  useEffect(() => {
    if (isViewMode || loading) return;

    if (codeRefreshTimer <= 0) {
      setCodeRefreshTimer(300); // Reset to 5 minutes
      return;
    }

    codeTimerRef.current = setTimeout(
      () => setCodeRefreshTimer((t) => t - 1),
      1000
    );
    return () => {
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    };
  }, [codeRefreshTimer, isViewMode, loading]);

  // Data refresh timer countdown (5 seconds) - ONLY when NOT in view mode
  useEffect(() => {
    if (isViewMode || loading) return;

    if (dataRefreshTimer <= 0) {
      setDataRefreshTimer(5); // Reset to 5 seconds
      return;
    }

    dataTimerRef.current = setTimeout(
      () => setDataRefreshTimer((t) => t - 1),
      1000
    );
    return () => {
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);
    };
  }, [dataRefreshTimer, isViewMode, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);
      if (codeIntervalRef.current) clearInterval(codeIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
    };
  }, []);

  // Format time (mm:ss)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handle student check-in
  const handleCheck = async (studentId: string) => {
    if (isViewMode || !examId) return;

    try {
      await attendanceCheckingService.checkInStudent(examId, studentId);
      setAttendance((prev) => ({
        ...prev,
        [studentId]: !prev[studentId],
      }));
    } catch (error) {
      console.error("Error checking in student:", error);
      // Could show toast error if needed
    }
  };

  // Handle confirm attendance
  const handleConfirmAttendance = () => {
    if (isViewMode) return;
    setCollapsed(true);
    // Could call API to confirm attendance if needed
  };

  // Handle finish exam
  const handleFinishExam = async () => {
    if (isViewMode || !examInfo?.examSlotRoomId) {
      if (!examInfo?.examSlotRoomId) {
        alert("Không tìm thấy thông tin ca thi");
      }
      return;
    }

    setIsFinishing(true);

    try {
      await attendanceCheckingService.finishExam(examInfo.examSlotRoomId);

      // Clear intervals before leaving
      if (codeIntervalRef.current) clearInterval(codeIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
      if (dataTimerRef.current) clearTimeout(dataTimerRef.current);

      // Show success message
      alert("Đã hoàn thành ca thi thành công!");

      // Wait a bit for user to see the message then navigate
      setTimeout(() => {
        router.push("/teacher/examsupervisor");
      }, 1000);
    } catch (error) {
      console.error("Error finishing exam:", error);
      alert("Có lỗi xảy ra khi hoàn thành ca thi. Vui lòng thử lại.");
    } finally {
      setIsFinishing(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    await refreshCode();
    await Promise.all([fetchExamInfo(), fetchStudents(true)]);
    setCodeRefreshTimer(300); // Reset code timer to 5 minutes
    setDataRefreshTimer(5); // Reset data timer to 5 seconds
  };

  // Calculate statistics
  const attendedCount = Object.values(attendance).filter(Boolean).length;
  const totalStudents = students.length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0;

  return {
    // Main state
    examInfo,
    students,
    attendance,
    isConfirmed,
    setIsConfirmed,
    collapsed,
    setCollapsed,
    loading,
    isFinishing,
    isRefreshing,

    // Timer state
    codeRefreshTimer,
    dataRefreshTimer,

    // Statistics
    attendedCount,
    totalStudents,
    attendanceRate,

    // Functions
    formatTime,
    handleCheck,
    handleConfirmAttendance,
    handleFinishExam,
    handleManualRefresh,

    // Data fetching functions
    fetchExamInfo,
    fetchStudents,
    refreshCode,
    loadData,
  };
};
