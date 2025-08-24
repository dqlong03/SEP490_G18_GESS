const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface PracticeExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  year: string;
  semester: string;
}

export interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

export interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string;
  status: string;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export interface Student {
  studentId: string;
  code: string;
  fullName: string;
}

export interface GradeComponent {
  categoryExamId: number;
  categoryExamName: string;
}

export interface PracticeExamForUpdate {
  pracExamName: string;
  duration: number;
  startDay: string;
  endDay: string;
  categoryExamId: number;
  subjectId: number;
  classId: number;
  semesterId: number;
  practiceExamPaperDTO: PracticeExamPaperDTO[];
  studentIds: string[];
}

export interface UpdatePracticeExamPayload {
  pracExamId: number;
  pracExamName: string;
  duration: number;
  startDay: string;
  endDay: string;
  createAt: string;
  teacherId: string;
  categoryExamId: number;
  subjectId: number;
  status: string;
  classId: number;
  semesterId: number;
  practiceExamPaperDTO: PracticeExamPaperDTO[];
  studentIds: string[];
}

class UpdatePracticeExamService {
  async getPracticeExamForUpdate(
    examId: string
  ): Promise<PracticeExamForUpdate> {
    const response = await fetch(
      `${API_URL}/api/PracticeExam/GetPracticeExamForUpdate/${examId}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được thông tin bài kiểm tra");
    }
    return await response.json();
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    const response = await fetch(`${API_URL}/api/Class/${classId}/students`);
    if (!response.ok) {
      throw new Error("Không lấy được danh sách sinh viên");
    }
    return await response.json();
  }

  async getGradeComponentsByClass(classId: number): Promise<GradeComponent[]> {
    const response = await fetch(
      `${API_URL}/api/Class/${classId}/grade-components`
    );
    if (!response.ok) {
      throw new Error("Không lấy được danh sách đầu điểm");
    }
    return await response.json();
  }

  async getSubjectIdByClass(classId: number): Promise<number> {
    const response = await fetch(`${API_URL}/api/Class/${classId}/subject-id`);
    if (!response.ok) {
      throw new Error("Không lấy được thông tin môn học");
    }
    return await response.json();
  }

  async getSemesters(): Promise<SemesterDTO[]> {
    const response = await fetch(`${API_URL}/api/Semesters`);
    if (!response.ok) {
      throw new Error("Không lấy được danh sách học kỳ");
    }
    return await response.json();
  }

  async getExamPapers(
    subjectId: number,
    categoryId: number,
    teacherId: string
  ): Promise<PracticeExamPaperDTO[]> {
    const response = await fetch(
      `${API_URL}/api/PracticeExam/exams_paper?subjectId=${subjectId}&categoryId=${categoryId}&teacherId=${teacherId}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được danh sách đề thi");
    }
    return await response.json();
  }

  async getExamPaperDetail(examPaperId: number): Promise<ExamPaperDetail> {
    const response = await fetch(
      `${API_URL}/api/PracticeExamPaper/DetailExamPaper/${examPaperId}`
    );
    if (!response.ok) {
      throw new Error("Không lấy được chi tiết đề thi");
    }
    return await response.json();
  }

  async updatePracticeExam(payload: UpdatePracticeExamPayload): Promise<void> {
    const response = await fetch(`${API_URL}/api/PracticeExam/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Cập nhật bài kiểm tra thất bại");
    }
  }
}

export const updatePracticeExamService = new UpdatePracticeExamService();
