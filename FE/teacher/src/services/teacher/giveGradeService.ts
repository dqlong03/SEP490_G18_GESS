const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface Subject {
  subjectId: number;
  subjectName: string;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface Exam {
  examSlotRoomId: number;
  examName: string;
  subjectName: string;
  isGrade: number | null;
  semesterId: number;
  examDate: string;
}

export interface GradeScheduleParams {
  teacherId: string;
  subjectId?: number;
  statusExam?: number;
  semesterId?: number;
  year?: number;
  pagesize: number;
  pageindex: number;
}

export const giveGradeService = {
  // Lấy danh sách môn học theo giáo viên
  async getSubjectsByTeacher(teacherId: string): Promise<Subject[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/MultipleExam/subjects-by-teacher/${teacherId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  },

  // Lấy danh sách học kỳ
  async getSemesters(): Promise<Semester[]> {
    try {
      const response = await fetch(`${API_URL}/api/Semesters`);
      if (!response.ok) {
        throw new Error("Failed to fetch semesters");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return [];
    }
  },

  // Lấy danh sách bài thi cần chấm
  async getGradeSchedule(params: GradeScheduleParams): Promise<Exam[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("teacherId", params.teacherId);
      if (params.subjectId)
        queryParams.append("subjectId", params.subjectId.toString());
      if (params.statusExam !== undefined)
        queryParams.append("statusExam", params.statusExam.toString());
      if (params.semesterId)
        queryParams.append("semesterId", params.semesterId.toString());
      if (params.year) queryParams.append("year", params.year.toString());
      queryParams.append("pagesze", params.pagesize.toString());
      queryParams.append("pageindex", params.pageindex.toString());

      const response = await fetch(
        `${API_URL}/api/GradeSchedule/teacher?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch grade schedule");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching grade schedule:", error);
      return [];
    }
  },

  // Lấy tổng số trang
  async getGradeScheduleCount(params: GradeScheduleParams): Promise<number> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("teacherId", params.teacherId);
      if (params.subjectId)
        queryParams.append("subjectId", params.subjectId.toString());
      if (params.statusExam !== undefined)
        queryParams.append("statusExam", params.statusExam.toString());
      if (params.semesterId)
        queryParams.append("semesterId", params.semesterId.toString());
      if (params.year) queryParams.append("year", params.year.toString());
      queryParams.append("pagesze", params.pagesize.toString());
      queryParams.append("pageindex", params.pageindex.toString());

      const response = await fetch(
        `${API_URL}/api/GradeSchedule/teacher/count?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch grade schedule count");
      }
      const data = await response.json();
      return Number(data) || 1;
    } catch (error) {
      console.error("Error fetching grade schedule count:", error);
      return 1;
    }
  },
};
