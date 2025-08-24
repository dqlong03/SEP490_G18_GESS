// setRoleService.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api/AssignGradeCreateExam" ||
  "https://localhost:7074/api/AssignGradeCreateExam";

export interface Subject {
  subjectId: number;
  subjectName: string;
  description: string;
  course: string;
  noCredits: number;
}

export interface Teacher {
  teacherId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  fullname: string;
  gender: boolean;
  code: string;
  isActive: boolean;
  majorId: number;
  majorName: string | null;
  hireDate: string;
  isCreateExam?: boolean;
  isGraded?: boolean;
}

export const setRoleService = {
  // Lấy tất cả môn học theo teacherId
  async getAllSubjectsByTeacherId(teacherId: string): Promise<Subject[]> {
    const response = await fetch(
      `${API_BASE_URL}/GetAllSubjectsByTeacherId?teacherId=${teacherId}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được danh sách môn học");
    }
    return response.json();
  },

  // Lấy giáo viên trong môn học với phân trang và tìm kiếm
  async getTeachersInSubject(
    subjectId: number,
    pageNumber: number,
    pageSize: number,
    textSearch?: string
  ): Promise<Teacher[]> {
    const searchParam = textSearch?.trim()
      ? `&textSearch=${encodeURIComponent(textSearch)}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}/GetAllTeacherHaveSubject?subjectId=${subjectId}&pageNumber=${pageNumber}&pageSize=${pageSize}${searchParam}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được danh sách giáo viên trong môn học");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Đếm số trang giáo viên trong môn học
  async countPageNumberTeacherHaveSubject(
    subjectId: number,
    pageSize: number,
    textSearch?: string
  ): Promise<number> {
    const searchParam = textSearch?.trim()
      ? `&textSearch=${encodeURIComponent(textSearch)}`
      : "";
    const response = await fetch(
      `${API_BASE_URL}/CountPageNumberTeacherHaveSubject?subjectId=${subjectId}&pageSize=${pageSize}${searchParam}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được số trang");
    }
    return response.json();
  },

  // Lấy tất cả giáo viên trong ngành
  async getAllTeachersInMajor(teacherId: string): Promise<Teacher[]> {
    const response = await fetch(
      `${API_BASE_URL}/GetAllTeacherInMajor?teacherId=${teacherId}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được danh sách giáo viên trong ngành");
    }
    return response.json();
  },

  // Thêm giáo viên vào môn học
  async addTeacherToSubject(
    teacherId: string,
    subjectId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/AddTeacherToSubject?teacherId=${teacherId}&subjectId=${subjectId}`,
      { method: "POST" }
    );
    if (!response.ok) {
      throw new Error("Có lỗi xảy ra khi thêm giáo viên");
    }
  },

  // Xóa giáo viên khỏi môn học
  async removeTeacherFromSubject(
    teacherId: string,
    subjectId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/DeleteTeacherFromSubject?teacherId=${teacherId}&subjectId=${subjectId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error("Có lỗi xảy ra khi xóa giáo viên");
    }
  },

  // Phân quyền tạo đề
  async assignRoleCreateExam(
    teacherId: string,
    subjectId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/AssignRoleCreateExam?teacherId=${teacherId}&subjectId=${subjectId}`,
      { method: "POST" }
    );
    if (!response.ok) {
      throw new Error("Có lỗi xảy ra khi cập nhật quyền");
    }
  },
};
