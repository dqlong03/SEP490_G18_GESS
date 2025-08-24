// examSupervisorService.ts

export interface YearOption {
  value: number;
  label: string;
}

export interface WeekOption {
  value: string;
  label: string;
}

export interface ApiExamSchedule {
  examSlotRoomId: number;
  examSlotId: number;
  roomName: string;
  subjectName: string;
  examDate: string;
  startDay: string; // Not used
  endDay: string; // Not used
  startTime: string; // Used for start time
  endTime: string; // Used for end time
  status: number; // 0: not attended, 1: in progress, 2: completed
  examSlotStatus: string; // Assignment status
}

export interface ExamScheduleWithTime extends ApiExamSchedule {
  timeLabel: string;
  isToday: boolean;
}

export interface StatusInfo {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  buttonColor: string;
  icon: any;
  buttonText: string;
  disabled: boolean;
}

export interface GroupedSchedules {
  [date: string]: ExamScheduleWithTime[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api/ExamSchedule" ||
  "https://localhost:7074/api/ExamSchedule";

export const examSupervisorService = {
  // Get exam schedules for teacher within date range
  async getExamSchedules(
    teacherId: string,
    fromDate: string,
    toDate: string
  ): Promise<ApiExamSchedule[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher/${teacherId}?fromDate=${fromDate}&toDate=${toDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch exam schedules");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching exam schedules:", error);
      return [];
    }
  },

  // Update exam status
  async updateExamStatus(
    examSlotRoomId: number,
    status: number
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/changestatus?examSlotRoomId=${examSlotRoomId}&status=${status}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Error updating exam status:", error);
      return false;
    }
  },

  // Utility functions
  utils: {
    // Get list of years (current year and 10 years back)
    getYearOptions(): YearOption[] {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 11 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString(),
      }));
    },

    // Get list of Monday dates for the year (week start options)
    getWeekStartOptions(year: number): WeekOption[] {
      const options: WeekOption[] = [];
      let d = new Date(year, 0, 1);

      // Find first Monday
      while (d.getDay() !== 1) {
        d.setDate(d.getDate() + 1);
      }

      // Generate all Mondays for the year
      while (d.getFullYear() === year) {
        const value = d.toISOString().slice(0, 10);
        const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
        options.push({ value, label });
        d.setDate(d.getDate() + 7);
      }

      return options;
    },

    // Get 7 dates of the week from start date (Monday -> Sunday)
    getWeekDatesFromStart(startDate: string): string[] {
      const dates: string[] = [];
      const d = new Date(startDate);

      for (let i = 0; i < 7; i++) {
        const dateCopy = new Date(d);
        dateCopy.setDate(d.getDate() + i + 1);
        dates.push(dateCopy.toISOString().slice(0, 10));
      }

      return dates;
    },

    // Format time from TimeSpan string (HH:mm:ss)
    formatTimeFromTimeSpan(timeSpan: string): string {
      if (!timeSpan) return "";

      const [hours, minutes] = timeSpan.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    },

    // Check if exam date is today
    isExamDateToday(examDate: string): boolean {
      const today = new Date();
      const examDay = new Date(examDate);

      return (
        today.getFullYear() === examDay.getFullYear() &&
        today.getMonth() === examDay.getMonth() &&
        today.getDate() === examDay.getDate()
      );
    },

    // Format date string
    formatDate(dateStr: string): string {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    },

    // Find week that contains today
    findWeekOfToday(weekOptions: WeekOption[]): WeekOption | undefined {
      const today = new Date();

      for (let i = 0; i < weekOptions.length; i++) {
        const weekStart = new Date(weekOptions[i].value);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Set hours to 0 for accurate day comparison
        weekStart.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);

        if (today >= weekStart && today <= weekEnd) {
          return weekOptions[i];
        }
      }

      return undefined;
    },

    // Group schedules by day and sort by time
    groupSchedulesByDay(
      schedules: ApiExamSchedule[],
      weekDates: string[]
    ): GroupedSchedules {
      const grouped: GroupedSchedules = {};

      // Initialize empty arrays for each day
      weekDates.forEach((date) => {
        grouped[date] = [];
      });

      // Group exams by date
      schedules.forEach((exam) => {
        const date = exam.examDate.slice(0, 10);
        const startTime = this.formatTimeFromTimeSpan(exam.startTime);
        const endTime = this.formatTimeFromTimeSpan(exam.endTime);
        const timeLabel = `${startTime} - ${endTime}`;
        const isToday = this.isExamDateToday(exam.examDate);

        if (weekDates.includes(date)) {
          grouped[date].push({ ...exam, timeLabel, isToday });
        }
      });

      // Sort exams within each day by start time
      Object.keys(grouped).forEach((date) => {
        grouped[date].sort((a, b) => {
          const timeA = this.formatTimeFromTimeSpan(a.startTime);
          const timeB = this.formatTimeFromTimeSpan(b.startTime);
          return timeA.localeCompare(timeB);
        });
      });

      return grouped;
    },

    // Get status information for exam
    getStatusInfo(
      status: number,
      isToday: boolean,
      examSlotStatus: string
    ): StatusInfo {
      // Check if exam is not assigned
      const isNotAssigned = examSlotStatus === "Chưa gán bài thi";
      const isNotOpened = examSlotStatus === "Chưa mở ca";
      const isDisabled =
        (!isToday && (status === 0 || status === 1)) ||
        isNotAssigned ||
        isNotOpened;

      // If not opened yet, return special status
      if (isNotOpened) {
        return {
          label: "Chưa mở ca",
          color: "gray",
          bgColor: "from-gray-50 to-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-500",
          buttonColor: "bg-gray-400 cursor-not-allowed",
          icon: "Lock",
          buttonText: "Chưa mở ca",
          disabled: true,
        };
      }

      // If not assigned, return special status
      if (isNotAssigned) {
        return {
          label: "Chưa gán bài thi",
          color: "red",
          bgColor: "from-red-50 to-pink-50",
          borderColor: "border-red-200",
          textColor: "text-red-600",
          buttonColor: "bg-red-400 cursor-not-allowed",
          icon: "AlertTriangle",
          buttonText: "Chưa gán bài thi",
          disabled: true,
        };
      }

      switch (status) {
        case 0:
          return {
            label: "Chưa điểm danh",
            color: "blue",
            bgColor: isDisabled
              ? "from-gray-50 to-gray-50"
              : "from-blue-50 to-indigo-50",
            borderColor: isDisabled ? "border-gray-200" : "border-blue-200",
            textColor: isDisabled ? "text-gray-500" : "text-blue-600",
            buttonColor: isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700",
            icon: isDisabled ? "Lock" : "UserCheck",
            buttonText: isDisabled ? "Chưa đến ngày thi" : "Điểm danh",
            disabled: isDisabled,
          };
        case 1:
          return {
            label: "Đang thi",
            color: "orange",
            bgColor: isDisabled
              ? "from-gray-50 to-gray-50"
              : "from-orange-50 to-yellow-50",
            borderColor: isDisabled ? "border-gray-200" : "border-orange-200",
            textColor: isDisabled ? "text-gray-500" : "text-orange-600",
            buttonColor: isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700",
            icon: isDisabled ? "Lock" : "Play",
            buttonText: isDisabled ? "Chưa đến ngày thi" : "Đang diễn ra",
            disabled: isDisabled,
          };
        case 2:
          return {
            label: "Đã thi",
            color: "green",
            bgColor: "from-green-50 to-emerald-50",
            borderColor: "border-green-200",
            textColor: "text-green-600",
            buttonColor: "bg-green-600 hover:bg-green-700",
            icon: "Eye",
            buttonText: "Xem lịch sử",
            disabled: false,
          };
        default:
          return {
            label: "Không xác định",
            color: "gray",
            bgColor: "from-gray-50 to-gray-50",
            borderColor: "border-gray-200",
            textColor: "text-gray-600",
            buttonColor: "bg-gray-600 hover:bg-gray-700",
            icon: "Clock",
            buttonText: "Không xác định",
            disabled: false,
          };
      }
    },

    // Calculate statistics
    calculateStatistics(examSchedules: ApiExamSchedule[]) {
      return {
        total: examSchedules.length,
        notAssigned: examSchedules.filter(
          (e) => e.examSlotStatus === "Chưa gán bài thi"
        ).length,
        notAttended: examSchedules.filter(
          (e) => e.status === 0 && e.examSlotStatus !== "Chưa gán bài thi"
        ).length,
        inProgress: examSchedules.filter((e) => e.status === 1).length,
        completed: examSchedules.filter((e) => e.status === 2).length,
      };
    },
  },
};
