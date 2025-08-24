export type Student = {
  studentId: string;
  code: string;
  fullName: string;
  avatarURL: string;
};

export type Exam = {
  examId: number;
  examName: string;
  gradeComponent?: string;
  duration: number;
  questionCount: number;
  examType: string;
  isGraded: string;
  status: string | null;
  studentCount: number;
};

export type ClassDetail = {
  classId: number;
  className: string;
  students: Student[];
  exams: Exam[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api/Class" ||
  "https://localhost:7074/api/Class";

export const classService = {
  async getClassDetail(classId: string): Promise<ClassDetail> {
    const res = await fetch(`${API_BASE}/${classId}/detail`);
    if (!res.ok) throw new Error("Không thể lấy dữ liệu lớp học");
    return await res.json();
  },
};
