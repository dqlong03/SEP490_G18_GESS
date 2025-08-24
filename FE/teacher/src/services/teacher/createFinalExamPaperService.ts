const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface Question {
  id: number;
  content: string;
  level: string;
}

export interface Chapter {
  chapterId: number;
  chapterName: string;
  description: string;
}

export interface Subject {
  subjectId: number;
  subjectName: string;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface Criterion {
  criterionName: string;
  weightPercent: number;
  description: string;
}

export interface ManualQuestion {
  manualId: number;
  content: string;
  score: number;
  criteria: Criterion[];
  level: string;
  chapterId: number;
}

export interface FinalExamPaperPayload {
  examName: string;
  totalQuestion: number;
  teacherId: string;
  semesterId: number;
  subjectId: number;
  manualQuestions: {
    content: string;
    criteria: string;
    score: number;
    level: string;
    chapterId: number;
  }[];
  selectedQuestions: {
    practiceQuestionId: number;
    score: number;
  }[];
}

export interface QuestionsResponse {
  data?: Question[];
  totalPages?: number;
  page?: number;
}

export const createFinalExamPaperService = {
  // Lấy danh sách môn học theo teacherId
  async getSubjectsByTeacherId(teacherId: string): Promise<Subject[]> {
    const response = await fetch(
      `${API_URL}/api/FinalExamPaper/GetAllMajorByTeacherId?teacherId=${teacherId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch subjects");
    }
    const data = await response.json();
    return data || [];
  },

  // Lấy danh sách học kỳ
  async getSemesters(): Promise<Semester[]> {
    const response = await fetch(`${API_URL}/api/Semesters`);
    if (!response.ok) {
      throw new Error("Failed to fetch semesters");
    }
    const data = await response.json();
    return data || [];
  },

  // Lấy danh sách chương theo subjectId
  async getChaptersBySubjectId(subjectId: number): Promise<Chapter[]> {
    const response = await fetch(
      `${API_URL}/api/FinalExam/GetAllChapterBySubjectId?subjectId=${subjectId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch chapters");
    }
    const data = await response.json();
    return data || [];
  },

  // Lấy danh sách câu hỏi với phân trang và bộ lọc
  async getQuestions(params: {
    subjectId: number;
    semesterId: number;
    page: number;
    pageSize: number;
    textSearch?: string;
    levelId?: number;
    chapterId?: number;
  }): Promise<{
    questions: Question[];
    totalPages: number;
    currentPage: number;
  }> {
    const queryParams = new URLSearchParams({
      subjectId: String(params.subjectId),
      semesterId: String(params.semesterId),
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.textSearch && { textSearch: params.textSearch }),
      ...(params.levelId && { levelId: String(params.levelId) }),
      ...(params.chapterId && { chapterId: String(params.chapterId) }),
    });

    const response = await fetch(
      `${API_URL}/api/FinalExamPaper/GetFinalPracticeQuestion?${queryParams}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    const data = await response.json();

    // Handle different response structures
    if (Array.isArray(data)) {
      return {
        questions: data,
        totalPages: Math.ceil(data.length / params.pageSize) || 1,
        currentPage: params.page,
      };
    } else if (data.data && Array.isArray(data.data)) {
      return {
        questions: data.data,
        totalPages: data.totalPages || 1,
        currentPage: data.page || params.page,
      };
    } else {
      return {
        questions: [],
        totalPages: 1,
        currentPage: 1,
      };
    }
  },

  // Tạo đề thi cuối kỳ
  async createFinalExamPaper(
    payload: FinalExamPaperPayload
  ): Promise<{ pracExamPaperId: string }> {
    const response = await fetch(
      `${API_URL}/api/FinalExamPaper/CreateFinalExamPaper`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create final exam paper");
    }

    return await response.json();
  },
};
