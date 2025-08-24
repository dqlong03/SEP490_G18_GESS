// examSupervisorNotYetService.ts

export interface ApiExamSchedule {
  examSlotRoomId: number;
  examSlotId: number;
  roomName: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status: number; // 0: chưa điểm danh, 1: đang thi, 2: đã thi
  examSlotStatus: string; // Trạng thái gán bài thi
}

export interface StatusInfo {
  label: string;
  color: string;
  buttonColor: string;
  icon: any;
  buttonText: string;
  disabled: boolean;
}

export interface QuickDateButton {
  label: string;
  date: string;
}

export interface ExamStatistics {
  total: number;
  notAssigned: number;
  notAttended: number;
  inProgress: number;
  completed: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api/ExamSchedule" ||
  "https://localhost:7074/api/ExamSchedule";

export const examSupervisorNotYetService = {
  // Get exam schedules for a specific date
  async getExamSchedulesByDate(
    teacherId: string,
    date: string
  ): Promise<ApiExamSchedule[]> {
    try {
      // Create Date object from string
      const currentDate = new Date(date);
      // Get the same day (today)
      const date1 = new Date(currentDate);
      date1.setDate(date1.getDate());
      const todayString = date1.toISOString().slice(0, 10);

      // Get tomorrow
      const date2 = new Date(currentDate);
      date2.setDate(date2.getDate() + 1);
      const tomorrowString = date2.toISOString().slice(0, 10);

      const response = await fetch(
        `${API_BASE_URL}/teacher/${teacherId}?fromDate=${todayString}&toDate=${tomorrowString}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam schedules");
      }

      const data = await response.json();
      const schedules = Array.isArray(data) ? data : [];

      // Sort by start time
      schedules.sort((a, b) => {
        const tA = this.utils.formatTimeFromTimeSpan(a.startTime);
        const tB = this.utils.formatTimeFromTimeSpan(b.startTime);
        return tA.localeCompare(tB);
      });

      return schedules;
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

    // Get status information from status, date check and examSlotStatus
    getStatusInfo(
      status: number,
      isToday: boolean,
      examSlotStatus: string
    ): StatusInfo {
      const isNotAssigned = examSlotStatus === "Chưa gán bài thi";
      const isNotOpened = examSlotStatus === "Chưa mở ca";
      const isDisabled =
        (!isToday && (status === 0 || status === 1)) ||
        isNotAssigned ||
        isNotOpened;

      if (isNotOpened) {
        return {
          label: "Chưa mở ca",
          color: "gray",
          buttonColor: "bg-gray-400 cursor-not-allowed",
          icon: "Lock",
          buttonText: "Chưa mở ca",
          disabled: true,
        };
      }

      if (isNotAssigned) {
        return {
          label: "Chưa gán bài thi",
          color: "red",
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
            color: isDisabled ? "gray" : "blue",
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
            color: isDisabled ? "gray" : "orange",
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
            buttonColor: "bg-green-600 hover:bg-green-700",
            icon: "Eye",
            buttonText: "Xem lịch sử",
            disabled: false,
          };
        default:
          return {
            label: "Không xác định",
            color: "gray",
            buttonColor: "bg-gray-600 hover:bg-gray-700",
            icon: "Clock",
            buttonText: "Không xác định",
            disabled: false,
          };
      }
    },

    // Get quick date buttons (yesterday, today, tomorrow)
    getQuickDateButtons(): QuickDateButton[] {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      return [
        { label: "Hôm qua", date: yesterday.toISOString().slice(0, 10) },
        { label: "Hôm nay", date: today.toISOString().slice(0, 10) },
        { label: "Ngày mai", date: tomorrow.toISOString().slice(0, 10) },
      ];
    },

    // Calculate exam statistics
    calculateStatistics(examSchedules: ApiExamSchedule[]): ExamStatistics {
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

    // Get today's date string
    getTodayDateString(): string {
      const today = new Date();
      return today.toISOString().slice(0, 10);
    },
  },
};
