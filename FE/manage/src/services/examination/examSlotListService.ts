const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

// Interfaces
export interface ExamSlot {
  examSlotId: number;
  slotName: string;
  status: string;
  examType: "Multiple" | "Practice";
  subjectId: number;
  subjectName: string;
  semesterId: number;
  semesterName: string;
  examDate: string;
  gradeTeacherStatus: string;
  proctorStatus: string;
}

export interface ExamSlotDetail {
  examSlotId: number;
  slotName: string;
  status: string;
  examType: "Multiple" | "Practice";
  subjectId: number;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  examName: string | null;
  semesterName: string;
  examSlotRoomDetails: ExamSlotRoom[];
}

export interface ExamSlotRoom {
  examSlotRoomId: number;
  roomId: number;
  roomName: string;
  gradeTeacherName: string;
  proctorName: string;
  status: number;
  examType: string;
  examDate: string;
  examName: string | null;
  subjectName: string;
  semesterName: string;
  students: Student[];
}

export interface Student {
  email: string;
  code: string;
  fullName: string;
  gender: boolean;
  dateOfBirth: string;
  urlAvatar?: string | null;
}

export interface Major {
  majorId: number;
  majorName: string;
}

export interface Subject {
  subjectId: number;
  subjectName: string;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface Exam {
  examId: number;
  examName: string;
  examType: string;
}

export interface TeacherExcelRow {
  code: string;
  fullName: string;
  email: string;
  majorName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

export interface TeacherCheck {
  teacherId: string;
  teacherName: string;
  isChecked: boolean;
  code?: string;
  majorId?: number;
  majorName?: string;
}

export interface ExamSlotFilters {
  subjectId?: string;
  semesterId?: string;
  year?: string;
  status?: string;
  examType?: string;
  fromDate?: string;
  toDate?: string;
  pageSize: number;
  pageIndex: number;
}

export interface TeacherAssignRequest {
  teacherExamslotRoom: {
    examSlotRoomId: number;
    teacherId: string;
    teacherName: string;
    majorId?: number;
  }[];
  isTheSame?: boolean;
  subjectId: number;
  subjectName: number;
}

export const examSlotListService = {
  // Lấy danh sách ngành
  async getMajors(): Promise<Major[]> {
    try {
      const response = await fetch(`${API_BASE}/Major/GetAllMajors`);
      if (!response.ok) throw new Error("Failed to fetch majors");
      return await response.json();
    } catch (error) {
      console.error("Error fetching majors:", error);
      throw error;
    }
  },

  // Lấy danh sách môn học theo ngành
  async getSubjectsByMajor(majorId: number): Promise<Subject[]> {
    try {
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/GetAllSubjectsByMajorId/${majorId}`
      );
      if (!response.ok) throw new Error("Failed to fetch subjects");
      return await response.json();
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }
  },

  // Lấy danh sách học kỳ
  async getSemesters(): Promise<Semester[]> {
    try {
      const response = await fetch(`${API_BASE}/Semesters`);
      if (!response.ok) throw new Error("Failed to fetch semesters");
      return await response.json();
    } catch (error) {
      console.error("Error fetching semesters:", error);
      throw error;
    }
  },

  // Lấy danh sách ca thi với phân trang
  async getExamSlots(filters: ExamSlotFilters): Promise<ExamSlot[]> {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId) params.append("SubjectId", filters.subjectId);
      if (filters.semesterId) params.append("SemesterId", filters.semesterId);
      if (filters.year) params.append("Year", filters.year);
      if (filters.status) params.append("Status", filters.status);
      if (filters.examType) params.append("ExamType", filters.examType);
      if (filters.fromDate) params.append("FromDate", filters.fromDate);
      if (filters.toDate) params.append("ToDate", filters.toDate);
      params.append("pageSize", filters.pageSize.toString());
      params.append("pageIndex", filters.pageIndex.toString());

      const response = await fetch(
        `${API_BASE}/ViewExamSlot/GetAllExamSlotsPagination?${params}`
      );
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching exam slots:", error);
      throw error;
    }
  },

  // Lấy tổng số trang
  async getTotalPages(filters: ExamSlotFilters): Promise<number> {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId) params.append("SubjectId", filters.subjectId);
      if (filters.semesterId) params.append("SemesterId", filters.semesterId);
      if (filters.year) params.append("Year", filters.year);
      if (filters.status) params.append("Status", filters.status);
      if (filters.examType) params.append("ExamType", filters.examType);
      if (filters.fromDate) params.append("FromDate", filters.fromDate);
      if (filters.toDate) params.append("ToDate", filters.toDate);
      params.append("pageSize", filters.pageSize.toString());
      params.append("pageIndex", filters.pageIndex.toString());

      const response = await fetch(
        `${API_BASE}/ViewExamSlot/CountPage?${params}`
      );
      if (!response.ok) return 1;
      return await response.json();
    } catch (error) {
      console.error("Error fetching total pages:", error);
      return 1;
    }
  },

  // Lấy chi tiết ca thi
  async getExamSlotDetail(examSlotId: number): Promise<ExamSlotDetail> {
    try {
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/GetExamSlotById/${examSlotId}`
      );
      if (!response.ok) throw new Error("Failed to fetch exam slot detail");
      return await response.json();
    } catch (error) {
      console.error("Error fetching exam slot detail:", error);
      throw error;
    }
  },

  // Lấy danh sách bài thi
  async getExams(
    semesterId: string,
    subjectId: string,
    examType: string,
    year: string
  ): Promise<Exam[]> {
    try {
      const params = new URLSearchParams({
        semesterId,
        subjectId,
        examType,
        year,
      });
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/GetAllExams?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch exams");
      return await response.json();
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  },

  // Thêm bài thi vào ca thi
  async addExamToSlot(
    examSlotId: number,
    examId: number,
    examType: string
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        examSlotId: examSlotId.toString(),
        examId: examId.toString(),
        examType,
      });
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/AddExamToExamSlot?${params}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to add exam to slot");
    } catch (error) {
      console.error("Error adding exam to slot:", error);
      throw error;
    }
  },

  // Thay đổi trạng thái ca thi
  async changeExamSlotStatus(
    examSlotId: number,
    examType: string
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        examSlotId: examSlotId.toString(),
        examType: examType.toString(),
      });
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/ChangeStatusExamSlot?${params}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to change status");
    } catch (error) {
      console.error("Error changing exam slot status:", error);
      throw error;
    }
  },

  // Kiểm tra giáo viên tồn tại
  async checkTeacherExist(teachers: any[]): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/CheckTeacherExist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teachers),
        }
      );
      if (!response.ok) throw new Error("CheckTeacherExist failed");
      return await response.json();
    } catch (error) {
      console.error("Error checking teacher exist:", error);
      throw error;
    }
  },

  // Kiểm tra giáo viên có thể coi thi
  async isTeacherAvailable(
    examSlotId: number,
    teacherChecks: TeacherCheck[]
  ): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/IsTeacherAvailable`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examSlotId,
            teacherChecks,
          }),
        }
      );
      if (!response.ok) throw new Error("IsTeacherAvailable failed");
      return await response.json();
    } catch (error) {
      console.error("Error checking teacher availability:", error);
      throw error;
    }
  },

  // Gán giáo viên chấm thi
  async addGradeTeacherToExamSlot(
    request: TeacherAssignRequest
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/AddGradeTeacherToExamSlot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );
      if (!response.ok) throw new Error("Failed to assign grade teacher");
    } catch (error) {
      console.error("Error assigning grade teacher:", error);
      throw error;
    }
  },

  // Gán giáo viên coi thi
  async addTeacherToExamSlotRoom(request: TeacherAssignRequest): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE}/ViewExamSlot/AddTeacherToExamSlotRoom`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        }
      );
      if (!response.ok) throw new Error("Failed to assign proctor teacher");
    } catch (error) {
      console.error("Error assigning proctor teacher:", error);
      throw error;
    }
  },
};
