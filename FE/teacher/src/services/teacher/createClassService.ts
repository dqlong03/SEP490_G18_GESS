const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface SubjectData {
  subjectId: number;
  subjectName: string;
}

export interface SemesterData {
  semesterId: number;
  semesterName: string;
}

export interface StudentData {
  studentId: string;
  avatar: string;
  code: string;
  email: string;
  gender: string;
  dob: string;
  fullName: string;
  cohortId?: number;
}

export interface CreateClassPayload {
  teacherId: string;
  subjectId: number;
  semesterId: number;
  className: string;
  students: {
    studentId: string;
    code: string;
    fullName: string;
    email: string;
    gender: boolean;
    dateOfBirth: string;
    avartar: string;
    cohortId: number;
  }[];
}

class CreateClassService {
  async getSubjectsByTeacher(teacherId: string): Promise<SubjectData[]> {
    const response = await fetch(
      `${API_URL}/api/Class/subjects-by-teacher/${teacherId}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được danh sách môn học");
    }
    return await response.json();
  }

  async getSemesters(): Promise<SemesterData[]> {
    const response = await fetch(`${API_URL}/api/Semesters`);
    if (!response.ok) {
      throw new Error("Không lấy được danh sách kỳ học");
    }
    return await response.json();
  }

  async createClass(payload: CreateClassPayload): Promise<void> {
    const response = await fetch(`${API_URL}/api/Class/CreateClass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Lỗi khi tạo lớp học");
    }
  }
}

export const createClassService = new CreateClassService();
