const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface ExamData {
  multiExamName: string;
  duration: number;
  startDay: string;
  endDay: string;
  categoryExamId: number;
  semesterId: number;
  isPublish?: boolean;
  // questionBankType: "all" | "common" | "private";
  classId: number;
  subjectId: number;
  studentExamDTO: Array<{ studentId: string }>;
  noQuestionInChapterDTO: Array<{
    numberQuestion: number;
    chapterId: number;
    levelQuestionId: number;
  }>;
  numberQuestion: number;
}

export interface GradeComponent {
  value: number;
  label: string;
}

export interface Chapter {
  chapterId: number;
  chapterName: string;
}

export interface Student {
  studentId: string;
  code: string;
  fullName: string;
}

export interface QuestionConfig {
  easy: number;
  medium: number;
  hard: number;
  max: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export const updateMCQExamService = {
  // Lấy thông tin bài thi để cập nhật
  async getExamForUpdate(examId: number): Promise<ExamData | null> {
    try {
      const res = await fetch(
        `${API_URL}/api/MultipleExam/get-for-update/${examId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch exam data");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching exam for update:", error);
      throw error;
    }
  },

  // Lấy danh sách đầu điểm theo class
  async getGradeComponents(classId: number): Promise<GradeComponent[]> {
    try {
      const res = await fetch(
        `${API_URL}/api/Class/${classId}/grade-components`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch grade components");
      }
      const data = await res.json();
      return data.map((g: any) => ({
        value: g.categoryExamId,
        label: g.categoryExamName,
      }));
    } catch (error) {
      console.error("Error fetching grade components:", error);
      throw error;
    }
  },

  // Lấy danh sách chương theo class
  async getChapters(classId: number): Promise<Chapter[]> {
    try {
      const res = await fetch(`${API_URL}/api/Class/${classId}/chapters`);
      if (!res.ok) {
        throw new Error("Failed to fetch chapters");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw error;
    }
  },

  // Lấy danh sách sinh viên theo class
  async getStudents(classId: number): Promise<Student[]> {
    try {
      const res = await fetch(`${API_URL}/api/Class/${classId}/students`);
      if (!res.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  // Lấy subject ID theo class
  async getSubjectId(classId: number): Promise<number> {
    try {
      const res = await fetch(`${API_URL}/api/Class/${classId}/subject-id`);
      if (!res.ok) {
        throw new Error("Failed to fetch subject ID");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching subject ID:", error);
      throw error;
    }
  },

  // Lấy số lượng câu hỏi theo chương và level
  async getQuestionCount(
    chapterId: number,
    level: "easy" | "medium" | "hard",
    questionBankType: "all" | "common" | "private",
    teacherId?: string
  ): Promise<number> {
    try {
      const levelId = level === "easy" ? 1 : level === "medium" ? 2 : 3;
      let url = `${API_URL}/api/MultipleExam/question-count?chapterId=${chapterId}&levelId=${levelId}`;

      if (questionBankType === "common") {
        url += "&isPublic=true";
      } else if (questionBankType === "private") {
        url += "&isPublic=false";
        if (teacherId) {
          url += `&teacherId=${teacherId}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch question count");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching question count:", error);
      return 0;
    }
  },

  // Cập nhật bài thi
  async updateExam(payload: {
    MultiExamId: number;
    MultiExamName: string;
    NumberQuestion: number;
    Duration: number;
    StartDay: string;
    EndDay: string;
    CreateAt: string;
    teacherId: string;
    subjectId: number | null;
    classId: number | null;
    categoryExamId: number;
    semesterId: number | null;
    isPublish?: boolean; // Make optional
    noQuestionInChapterDTO: Array<{
      numberQuestion: number;
      chapterId: number;
      levelQuestionId: number;
    }>;
    studentExamDTO: Array<{ studentId: string }>;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/api/MultipleExam/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (error) {
      console.error("Error updating exam:", error);
      throw error;
    }
  },
};
