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

export interface NoQuestionInChapterDTO {
  numberQuestion: number;
  chapterId: number;
  levelQuestionId: number;
}

export interface StudentExamDTO {
  studentId: string;
}

export interface CreateMCQExamRequest {
  MultiExamName: string;
  NumberQuestion: number;
  Duration: number;
  StartDay: string;
  EndDay: string;
  CreateAt: string;
  teacherId: string;
  subjectId: number | null;
  classId: number;
  categoryExamId: number;
  semesterId: number | null;
  isPublish?: boolean;
  // questionBankType: "all" | "common" | "private";
  noQuestionInChapterDTO: NoQuestionInChapterDTO[];
  studentExamDTO: StudentExamDTO[];
}

export interface ClassData {
  semesterId: number;
  gradeComponents: GradeComponent[];
  chapters: Chapter[];
  students: Student[];
  subjectId: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export const createMCQExamService = {
  // Get class semester ID
  async getSemesterId(classId: number): Promise<number> {
    try {
      const response = await fetch(
        `${API_BASE}/api/Class/${classId}/semester-id`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch semester ID: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching semester ID:", error);
      throw error;
    }
  },

  // Get class grade components
  async getGradeComponents(classId: number): Promise<GradeComponent[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/Class/${classId}/grade-components`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch grade components: ${response.status}`);
      }
      const data = await response.json();
      return data.map((g: any) => ({
        value: g.categoryExamId,
        label: g.categoryExamName,
      }));
    } catch (error) {
      console.error("Error fetching grade components:", error);
      throw error;
    }
  },

  // Get class chapters
  async getChapters(classId: number): Promise<Chapter[]> {
    try {
      const response = await fetch(`${API_BASE}/api/Class/${classId}/chapters`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw error;
    }
  },

  // Get class students
  async getStudents(classId: number): Promise<Student[]> {
    try {
      const response = await fetch(`${API_BASE}/api/Class/${classId}/students`);
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  // Get class subject ID
  async getSubjectId(classId: number): Promise<number> {
    try {
      const response = await fetch(
        `${API_BASE}/api/Class/${classId}/subject-id`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch subject ID: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching subject ID:", error);
      throw error;
    }
  },

  // Get question count for specific chapter and level
  async getQuestionCount(
    chapterId: number,
    level: "easy" | "medium" | "hard",
    questionBankType: "all" | "common" | "private",
    teacherId?: string
  ): Promise<number> {
    try {
      const levelId = level === "easy" ? 1 : level === "medium" ? 2 : 3;
      let url = `${API_BASE}/api/MultipleExam/question-count?chapterId=${chapterId}&levelId=${levelId}`;

      if (questionBankType === "common") {
        url += "&isPublic=true";
      } else if (questionBankType === "private") {
        url += "&isPublic=false";
        if (teacherId) {
          url += `&teacherId=${teacherId}`;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch question count: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching question count:", error);
      throw error;
    }
  },

  // Create MCQ exam
  async createMCQExam(request: CreateMCQExamRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/MultipleExam/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        // Try to parse error message from API response
        let errorMessage = "Tạo bài kiểm tra thất bại!";
        try {
          const errorData = await response.json();
          // Check different possible error message formats from API
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.title) {
            errorMessage = errorData.title;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          }
        } catch (parseError) {
          // If can't parse error, use status text
          errorMessage =
            response.statusText ||
            `HTTP ${response.status}: Tạo bài kiểm tra thất bại!`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating MCQ exam:", error);
      // Re-throw the error to be handled by the hook
      throw error;
    }
  },

  // Build NoQuestionInChapterDTO array
  buildNoQuestionInChapterDTO(
    selectedChapters: Chapter[],
    chapterQuestions: Record<number, QuestionConfig>
  ): NoQuestionInChapterDTO[] {
    const arr: NoQuestionInChapterDTO[] = [];

    selectedChapters.forEach((chap: Chapter) => {
      if (chapterQuestions[chap.chapterId]?.easy > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].easy,
          chapterId: chap.chapterId,
          levelQuestionId: 1,
        });
      }
      if (chapterQuestions[chap.chapterId]?.medium > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].medium,
          chapterId: chap.chapterId,
          levelQuestionId: 2,
        });
      }
      if (chapterQuestions[chap.chapterId]?.hard > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].hard,
          chapterId: chap.chapterId,
          levelQuestionId: 3,
        });
      }
    });

    return arr;
  },

  // Build StudentExamDTO array
  buildStudentExamDTO(selectedStudents: Student[]): StudentExamDTO[] {
    return selectedStudents.map((sv: Student) => ({
      studentId: sv.studentId,
    }));
  },

  // Load all class data
  async loadClassData(classId: number): Promise<ClassData> {
    try {
      const [semesterId, gradeComponents, chapters, students, subjectId] =
        await Promise.all([
          this.getSemesterId(classId),
          this.getGradeComponents(classId),
          this.getChapters(classId),
          this.getStudents(classId),
          this.getSubjectId(classId),
        ]);

      return {
        semesterId,
        gradeComponents,
        chapters,
        students,
        subjectId,
      };
    } catch (error) {
      console.error("Error loading class data:", error);
      throw error;
    }
  },
};
