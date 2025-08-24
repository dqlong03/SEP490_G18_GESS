// useExamSupervisor.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  examSupervisorService,
  YearOption,
  WeekOption,
  ApiExamSchedule,
  ExamScheduleWithTime,
  GroupedSchedules,
  StatusInfo,
} from "../../services/teacher/examSupervisorService";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import { toast } from "react-toastify";

interface UseExamSupervisorReturn {
  yearOptions: YearOption[];
  weekOptions: WeekOption[];
  selectedYear: number;
  selectedWeek: WeekOption | null;
  examSchedules: ApiExamSchedule[];
  loading: boolean;
  groupedSchedules: GroupedSchedules;
  weekDates: string[];
  statistics: {
    total: number;
    notAssigned: number;
    notAttended: number;
    inProgress: number;
    completed: number;
  };
  handleYearChange: (newYear: number) => void;
  handleWeekChange: (newWeek: WeekOption) => void;
  handleExamAction: (
    exam: ExamScheduleWithTime,
    statusInfo: StatusInfo
  ) => void;
  getStatusInfo: (
    status: number,
    isToday: boolean,
    examSlotStatus: string
  ) => StatusInfo;
  getDateDisplayName: (date: string) => string;
  refreshData: () => void;
}

export const useExamSupervisor = (): UseExamSupervisorReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = examSupervisorService.utils;

  // State
  const [yearOptions] = useState<YearOption[]>(() => utils.getYearOptions());
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [examSchedules, setExamSchedules] = useState<ApiExamSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Generate week options when year changes
  useEffect(() => {
    const newWeekOptions = utils.getWeekStartOptions(selectedYear);
    setWeekOptions(newWeekOptions);

    // Find week containing today
    const weekOfToday = utils.findWeekOfToday(newWeekOptions);
    if (
      weekOfToday &&
      (!selectedWeek || selectedWeek.value !== weekOfToday.value)
    ) {
      setSelectedWeek(weekOfToday);
    } else if (!weekOfToday && newWeekOptions.length > 0) {
      // If today's week not found, select first week
      setSelectedWeek(newWeekOptions[0]);
    }
  }, [selectedYear]);

  // Parse URL parameters on mount
  useEffect(() => {
    const yearParam = searchParams.get("year");
    const weekParam = searchParams.get("week");

    if (yearParam) {
      const year = parseInt(yearParam, 10);
      if (!isNaN(year) && year !== selectedYear) {
        setSelectedYear(year);
      }
    }

    if (weekParam) {
      // Will be handled after weekOptions are updated
      const timer = setTimeout(() => {
        const weekOptions = utils.getWeekStartOptions(selectedYear);
        const week = weekOptions.find((w) => w.value === weekParam);
        if (week) {
          setSelectedWeek(week);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Calculate week dates
  const weekDates = useMemo(() => {
    return selectedWeek ? utils.getWeekDatesFromStart(selectedWeek.value) : [];
  }, [selectedWeek]);

  // Fetch exam schedules
  const fetchExamSchedules = useCallback(async () => {
    if (!selectedWeek || weekDates.length === 0) return;

    const teacherId = getUserIdFromToken();
    if (!teacherId) {
      toast.error("Không thể lấy thông tin giáo viên");
      return;
    }

    setLoading(true);
    try {
      const fromDate = weekDates[0];
      const toDate = weekDates[weekDates.length - 1];

      const schedules = await examSupervisorService.getExamSchedules(
        teacherId,
        fromDate,
        toDate
      );
      setExamSchedules(schedules);
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      toast.error("Lỗi khi tải lịch thi");
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, weekDates]);

  // Fetch data when parameters change
  useEffect(() => {
    fetchExamSchedules();
  }, [fetchExamSchedules]);

  // Group schedules by day
  const groupedSchedules = useMemo(() => {
    return utils.groupSchedulesByDay(examSchedules, weekDates);
  }, [examSchedules, weekDates]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return utils.calculateStatistics(examSchedules);
  }, [examSchedules]);

  // Handlers
  const handleYearChange = useCallback(
    (newYear: number) => {
      setSelectedYear(newYear);

      // Update URL
      const params = new URLSearchParams();
      params.set("year", newYear.toString());
      router.replace(`?${params.toString()}`);
    },
    [router]
  );

  const handleWeekChange = useCallback(
    (newWeek: WeekOption) => {
      setSelectedWeek(newWeek);

      // Update URL
      const params = new URLSearchParams();
      params.set("year", selectedYear.toString());
      params.set("week", newWeek.value);
      router.replace(`?${params.toString()}`);
    },
    [router, selectedYear]
  );

  const handleExamAction = useCallback(
    async (exam: ExamScheduleWithTime, statusInfo: StatusInfo) => {
      if (statusInfo.disabled) return;

      switch (exam.status) {
        case 0: // Not attended -> Start attendance
          const success = await examSupervisorService.updateExamStatus(
            exam.examSlotRoomId,
            1
          );
          if (success) {
            router.push(
              `/teacher/examsupervisor/attendancechecking?examSlotRoomId=${exam.examSlotRoomId}`
            );
          } else {
            toast.error("Lỗi khi cập nhật trạng thái ca thi");
          }
          break;
        case 1: // In progress -> Continue attendance
          router.push(
            `/teacher/examsupervisor/attendancechecking?examSlotRoomId=${exam.examSlotRoomId}`
          );
          break;
        case 2: // Completed -> View history
          router.push(
            `/teacher/examsupervisor/attendancechecking?examSlotRoomId=${exam.examSlotRoomId}`
          );
          break;
        default:
          console.warn("Unknown exam status:", exam.status);
      }
    },
    [router]
  );

  const getStatusInfo = useCallback(
    (status: number, isToday: boolean, examSlotStatus: string): StatusInfo => {
      return utils.getStatusInfo(status, isToday, examSlotStatus);
    },
    []
  );

  const getDateDisplayName = useCallback((date: string): string => {
    const dayNames = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    const d = new Date(date);
    const dayName = dayNames[d.getDay()];
    const formattedDate = utils.formatDate(date);

    return `${dayName} (${formattedDate})`;
  }, []);

  const refreshData = useCallback(() => {
    fetchExamSchedules();
  }, [fetchExamSchedules]);

  return {
    yearOptions,
    weekOptions,
    selectedYear,
    selectedWeek,
    examSchedules,
    loading,
    groupedSchedules,
    weekDates,
    statistics,
    handleYearChange,
    handleWeekChange,
    handleExamAction,
    getStatusInfo,
    getDateDisplayName,
    refreshData,
  };
};
