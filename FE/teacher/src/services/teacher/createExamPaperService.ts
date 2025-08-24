// createExamPaperService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

// Types
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

export interface Level {
  value: number;
  label: string;
}

export interface GradeComponent {
  value: number;
  label: string;
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

export interface SelectedQuestion {
  practiceQuestionId: number;
  score: number;
}

export interface CreateExamPaperPayload {
  classId: number;
  examName: string;
  totalQuestion: number;
  teacherId: string;
  categoryExamId: number;
  semesterId: number | null;
  manualQuestions: {
    content: string;
    criteria: string;
    score: number;
    level: string;
    chapterId: number;
  }[];
  selectedQuestions: SelectedQuestion[];
}

export interface QuestionsResponse {
  data: Question[];
  totalPages: number;
  page: number;
}

export interface QuestionFilters {
  classId: number;
  page: number;
  pageSize: number;
  content?: string;
  levelId?: number;
  chapterId?: number;
}

export interface CreateExamPaperResponse {
  pracExamPaperId: number;
}

class CreateExamPaperService {
  // Get chapters for a class
  async getChapters(classId: number): Promise<Chapter[]> {
    try {
      const response = await fetch(`${API_URL}/api/Class/${classId}/chapters`);
      if (!response.ok) {
        throw new Error("Failed to fetch chapters");
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return [];
    }
  }

  // Get grade components for a class
  async getGradeComponents(classId: number): Promise<GradeComponent[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/Class/${classId}/grade-components`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch grade components");
      }
      const data = await response.json();
      return (data || []).map((g: any) => ({
        value: g.categoryExamId,
        label: g.categoryExamName,
      }));
    } catch (error) {
      console.error("Error fetching grade components:", error);
      return [];
    }
  }

  // Get questions with filters and pagination
  async getQuestions(filters: QuestionFilters): Promise<QuestionsResponse> {
    try {
      const params = new URLSearchParams({
        classId: String(filters.classId),
        page: String(filters.page),
        pageSize: String(filters.pageSize),
        ...(filters.content && { content: filters.content }),
        ...(filters.levelId && { levelId: String(filters.levelId) }),
        ...(filters.chapterId && { chapterId: String(filters.chapterId) }),
      });

      const response = await fetch(
        `${API_URL}/api/PracticeQuestion/practice-questions?${params}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      return {
        data: data.data || [],
        totalPages: data.totalPages || 1,
        page: data.page || 1,
      };
    } catch (error) {
      console.error("Error fetching questions:", error);
      return {
        data: [],
        totalPages: 1,
        page: 1,
      };
    }
  }

  // Create exam paper
  async createExamPaper(
    payload: CreateExamPaperPayload
  ): Promise<CreateExamPaperResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/PracticeExamPaper/create-exam-paper`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create exam paper");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating exam paper:", error);
      throw error;
    }
  }

  // Utility functions
  utils = {
    // Get level info for styling
    getLevelInfo: (level: string) => {
      const levelMap: Record<string, { color: string; bgColor: string }> = {
        Dễ: { color: "text-green-600", bgColor: "bg-green-50" },
        "Trung bình": { color: "text-yellow-600", bgColor: "bg-yellow-50" },
        Khó: { color: "text-red-600", bgColor: "bg-red-50" },
      };
      return (
        levelMap[level] || { color: "text-gray-600", bgColor: "bg-gray-50" }
      );
    },

    // Calculate total score from questions and manual questions
    calculateTotalScore: (
      questionScores: Record<number, number>,
      manualQuestions: ManualQuestion[]
    ): number => {
      const selectedQuestionScore = Object.values(questionScores).reduce(
        (sum, score) => sum + (score || 0),
        0
      );
      const manualQuestionScore = manualQuestions.reduce(
        (sum, q) => sum + (q.score || 0),
        0
      );
      return selectedQuestionScore + manualQuestionScore;
    },

    // Validate criteria total percentage
    validateCriteriaPercentage: (criteria: Criterion[]): boolean => {
      const totalWeight = criteria.reduce((sum, c) => sum + c.weightPercent, 0);
      return totalWeight === 100;
    },

    // Get levels array
    getLevels: (): Level[] => [
      { value: 1, label: "Dễ" },
      { value: 2, label: "Trung bình" },
      { value: 3, label: "Khó" },
    ],

    // Generate unique manual question ID
    generateManualQuestionId: (): number => Date.now(),

    // Filter out empty criteria
    filterValidCriteria: (criteria: Criterion[]): Criterion[] => {
      return criteria.filter((c) => c.criterionName.trim());
    },

    // Validate manual question input
    validateManualQuestion: (
      content: string,
      score: number,
      level: string,
      chapterId: number | null,
      criteria: Criterion[]
    ): { valid: boolean; error?: string } => {
      if (!content.trim()) {
        return { valid: false, error: "Vui lòng nhập nội dung câu hỏi!" };
      }
      if (score <= 0) {
        return { valid: false, error: "Điểm phải lớn hơn 0!" };
      }
      if (!level) {
        return { valid: false, error: "Vui lòng chọn độ khó!" };
      }
      if (!chapterId) {
        return { valid: false, error: "Vui lòng chọn chương!" };
      }

      const validCriteria = criteria.filter((c) => c.criterionName.trim());
      if (validCriteria.length === 0) {
        return {
          valid: false,
          error: "Vui lòng thêm ít nhất một tiêu chí chấm!",
        };
      }

      const totalWeight = validCriteria.reduce(
        (sum, c) => sum + c.weightPercent,
        0
      );
      if (totalWeight !== 100) {
        return {
          valid: false,
          error: "Tổng phần trăm điểm của các tiêu chí phải bằng 100%!",
        };
      }

      return { valid: true };
    },

    // Validate form before submission
    validateForm: (
      examName: string,
      selectedGradeComponent: GradeComponent | null,
      selectedQuestions: Question[],
      manualQuestions: ManualQuestion[],
      totalScore: number
    ): { valid: boolean; error?: string } => {
      if (!examName.trim()) {
        return { valid: false, error: "Vui lòng nhập tên đề thi!" };
      }
      if (!selectedGradeComponent) {
        return { valid: false, error: "Vui lòng chọn đầu điểm!" };
      }
      if (selectedQuestions.length + manualQuestions.length === 0) {
        return { valid: false, error: "Vui lòng chọn/thêm ít nhất 1 câu hỏi!" };
      }
      if (totalScore !== 10) {
        return {
          valid: false,
          error: `Tổng điểm của đề thi phải bằng 10! Hiện tại: ${totalScore} điểm`,
        };
      }
      return { valid: true };
    },

    // Create default criterion
    createDefaultCriterion: (): Criterion => ({
      criterionName: "",
      weightPercent: 25,
      description: "",
    }),

    // Build create exam paper payload
    buildCreatePayload: (
      classId: number,
      examName: string,
      selectedGradeComponent: GradeComponent,
      semesterId: number | null,
      teacherId: string,
      selectedQuestions: Question[],
      questionScores: Record<number, number>,
      manualQuestions: ManualQuestion[]
    ): CreateExamPaperPayload => ({
      classId,
      examName,
      totalQuestion: selectedQuestions.length + manualQuestions.length,
      teacherId,
      categoryExamId: selectedGradeComponent.value,
      semesterId,
      manualQuestions: manualQuestions.map((q) => ({
        content: q.content,
        criteria: JSON.stringify(q.criteria),
        score: q.score,
        level: q.level,
        chapterId: q.chapterId,
      })),
      selectedQuestions: selectedQuestions.map((q) => ({
        practiceQuestionId: q.id,
        score: questionScores[q.id] ?? 1,
      })),
    }),
  };
}

export const createExamPaperService = new CreateExamPaperService();
