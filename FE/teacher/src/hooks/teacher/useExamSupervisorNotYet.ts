// useExamSupervisorNotYet.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  examSupervisorNotYetService,
  ApiExamSchedule,
  StatusInfo,
  QuickDateButton,
  ExamStatistics,
} from "../../services/teacher/examSupervisorNotYetService";
import { getUserIdFromToken } from "../../utils/tokenUtils";

interface UseExamSupervisorNotYetReturn {
  examSchedules: ApiExamSchedule[];
  loading: boolean;
  updatingStatus: number | null;
  selectedDate: string;
  quickDateButtons: QuickDateButton[];
  statistics: ExamStatistics;
  handleDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuickDateSelect: (date: string) => void;
  handleExamAction: (exam: ApiExamSchedule) => Promise<void>;
  getStatusInfo: (
    status: number,
    isToday: boolean,
    examSlotStatus: string
  ) => StatusInfo;
  formatTimeFromTimeSpan: (timeSpan: string) => string;
  formatDate: (dateStr: string) => string;
  isExamDateToday: (examDate: string) => boolean;
  refreshData: () => void;
}

export const useExamSupervisorNotYet = (): UseExamSupervisorNotYetReturn => {
  const router = useRouter();
  const utils = examSupervisorNotYetService.utils;

  // State
  const [examSchedules, setExamSchedules] = useState<ApiExamSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    utils.getTodayDateString()
  );

  // Quick date buttons
  const quickDateButtons = useMemo(() => utils.getQuickDateButtons(), []);

  // Statistics
  const statistics = useMemo(
    () => utils.calculateStatistics(examSchedules),
    [examSchedules]
  );

  // Fetch exam schedules by date
  const fetchExamSchedules = useCallback(async (date: string) => {
    const teacherId = getUserIdFromToken();
    if (!teacherId) {
      setExamSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const schedules =
        await examSupervisorNotYetService.getExamSchedulesByDate(
          teacherId,
          date
        );
      setExamSchedules(schedules);
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when selectedDate changes
  useEffect(() => {
    fetchExamSchedules(selectedDate);
  }, [selectedDate, fetchExamSchedules]);

  // Handle date change from input
  const handleDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(event.target.value);
    },
    []
  );

  // Handle quick date button selection
  const handleQuickDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  // Handle exam action based on status
  const handleExamAction = useCallback(
    async (exam: ApiExamSchedule) => {
      const isToday = utils.isExamDateToday(exam.examDate);
      const statusInfo = utils.getStatusInfo(
        exam.status,
        isToday,
        exam.examSlotStatus
      );

      if (statusInfo.disabled) return;

      if (exam.status === 0) {
        // Update status from 0 to 1 and navigate to attendance checking
        setUpdatingStatus(exam.examSlotRoomId);
        try {
          const success = await examSupervisorNotYetService.updateExamStatus(
            exam.examSlotRoomId,
            1
          );
          if (success) {
            // Update local state
            setExamSchedules((prev) =>
              prev.map((e) =>
                e.examSlotRoomId === exam.examSlotRoomId
                  ? { ...e, status: 1 }
                  : e
              )
            );
            router.push(
              `/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}`
            );
          } else {
            alert("Không thể cập nhật trạng thái ca thi. Vui lòng thử lại.");
          }
        } catch (error) {
          console.error("Error updating exam status:", error);
          alert(
            "Có lỗi xảy ra khi cập nhật trạng thái ca thi. Vui lòng thử lại."
          );
        } finally {
          setUpdatingStatus(null);
        }
      } else if (exam.status === 1) {
        // Navigate to attendance checking (in progress)
        router.push(
          `/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}`
        );
      } else if (exam.status === 2) {
        // Navigate to attendance checking (view mode)
        router.push(
          `/teacher/examsupervisor/attendancechecking?examId=${exam.examSlotRoomId}&view=true`
        );
      }
    },
    [router]
  );

  // Utility function wrappers
  const getStatusInfo = useCallback(
    (status: number, isToday: boolean, examSlotStatus: string): StatusInfo => {
      return utils.getStatusInfo(status, isToday, examSlotStatus);
    },
    []
  );

  const formatTimeFromTimeSpan = useCallback((timeSpan: string): string => {
    return utils.formatTimeFromTimeSpan(timeSpan);
  }, []);

  const formatDate = useCallback((dateStr: string): string => {
    return utils.formatDate(dateStr);
  }, []);

  const isExamDateToday = useCallback((examDate: string): boolean => {
    return utils.isExamDateToday(examDate);
  }, []);

  const refreshData = useCallback(() => {
    fetchExamSchedules(selectedDate);
  }, [fetchExamSchedules, selectedDate]);

  return {
    examSchedules,
    loading,
    updatingStatus,
    selectedDate,
    quickDateButtons,
    statistics,
    handleDateChange,
    handleQuickDateSelect,
    handleExamAction,
    getStatusInfo,
    formatTimeFromTimeSpan,
    formatDate,
    isExamDateToday,
    refreshData,
  };
};
