// attendanceCheckingService.ts

export interface ExamInfo {
  examSlotRoomId: number;
  slotName: string;
  roomName: string;
  subjectName: string;
  examDate: string;
  examName: string;
  startTime: string;
  endTime: string;
  code: string;
  status?: number;
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  avatarURL: string;
  isCheckedIn: number;
  statusExamHistory: string;
}

export interface AttendanceData {
  [id: string]: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api/ExamSchedule" ||
  "https://localhost:7074/api/ExamSchedule";

export const attendanceCheckingService = {
  // Fetch exam information
  async getExamInfo(examId: string): Promise<ExamInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/slots/${examId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exam info");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching exam info:", error);
      return null;
    }
  },

  // Fetch students list
  async getStudents(examId: string): Promise<Student[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${examId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  },

  // Refresh exam code
  async refreshCode(examId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/refresh?examSlotId=${examId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to refresh code");
      }
      console.log("Code refreshed successfully");
    } catch (error) {
      console.error("Error refreshing code:", error);
      throw error;
    }
  },

  // Check in student
  async checkInStudent(examId: string, studentId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/checkin?examSlotId=${examId}&studentId=${studentId}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Failed to check in student");
      }
    } catch (error) {
      console.error("Error checking in student:", error);
      throw error;
    }
  },

  // Finish exam session
  async finishExam(examSlotRoomId: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/changestatus?examSlotRoomId=${examSlotRoomId}&status=2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to finish exam");
      }
    } catch (error) {
      console.error("Error finishing exam:", error);
      throw error;
    }
  },

  // Get exam status (for checking if exam is finished)
  async getExamStatus(examId: string): Promise<number | null> {
    try {
      const examInfo = await this.getExamInfo(examId);
      return examInfo?.status || null;
    } catch (error) {
      console.error("Error getting exam status:", error);
      return null;
    }
  },

  // Load both exam info and students
  async loadExamData(examId: string): Promise<{
    examInfo: ExamInfo | null;
    students: Student[];
  }> {
    try {
      const [examInfo, students] = await Promise.all([
        this.getExamInfo(examId),
        this.getStudents(examId),
      ]);
      return { examInfo, students };
    } catch (error) {
      console.error("Error loading exam data:", error);
      return { examInfo: null, students: [] };
    }
  },
};
