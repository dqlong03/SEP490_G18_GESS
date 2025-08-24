// createMultipleExamService.ts

export interface Subject {
  subjectId: number;
  subjectName: string;
}

export interface Chapter {
  chapterId: number;
  chapterName: string;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export type Level = "easy" | "medium" | "hard";

export interface LevelConfig {
  key: Level;
  label: string;
  id: number;
  color: string;
  bgColor: string;
}

export interface ChapterQuestion {
  easy: number;
  medium: number;
  hard: number;
  max: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface CreateExamPayload {
  multiExamName: string;
  numberQuestion: number;
  createAt: string;
  teacherId: string;
  subjectId: number;
  semesterId: number;
  noQuestionInChapterDTO: Array<{
    numberQuestion: number;
    chapterId: number;
    levelQuestionId: number;
  }>;
}

export interface ExamStatistics {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export const LEVELS: LevelConfig[] = [
  {
    key: "easy",
    label: "Dễ",
    id: 1,
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  {
    key: "medium",
    label: "Trung bình",
    id: 2,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
  },
  {
    key: "hard",
    label: "Khó",
    id: 3,
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
];

export const createMultipleExamService = {
  // Get all subjects by teacher ID
  async getSubjectsByTeacherId(teacherId: string): Promise<Subject[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExam/GetAllMajorByTeacherId?teacherId=${teacherId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw new Error("Không thể tải danh sách môn học");
    }
  },

  // Get all semesters
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
      throw new Error("Không thể tải danh sách học kỳ");
    }
  },

  // Get chapters by subject ID
  async getChaptersBySubjectId(subjectId: number): Promise<Chapter[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExam/GetAllChapterBySubjectId?subjectId=${subjectId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chapters");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching chapters:", error);
      throw new Error("Không thể tải danh sách chương");
    }
  },

  // Get maximum question count for chapter and level
  async getMaxQuestions(
    chapterId: number,
    levelId: number,
    semesterId?: number
  ): Promise<number> {
    try {
      const url = `${API_URL}/api/FinalExam/GetFinalQuestionCount?chapterId=${chapterId}&levelId=${levelId}${semesterId ? `&semesterId=${semesterId}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch max questions");
      }
      const data = await response.json();
      return typeof data === "number" ? data : 0;
    } catch (error) {
      console.error("Error fetching max questions:", error);
      return 0;
    }
  },

  // Create final multiple choice exam
  async createFinalMultipleExam(payload: CreateExamPayload): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExam/CreateFinalMultipleExam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Error creating exam:", error);
      return false;
    }
  },

  // Utility functions
  utils: {
    // Format subject options for select
    formatSubjectOptions(subjects: Subject[]) {
      return subjects.map((s) => ({
        value: s.subjectId,
        label: s.subjectName,
        ...s,
      }));
    },

    // Format semester options for select
    formatSemesterOptions(semesters: Semester[]) {
      return semesters.map((s) => ({
        value: s.semesterId,
        label: s.semesterName,
        ...s,
      }));
    },

    // Calculate total questions from chapter questions
    calculateTotalQuestions(
      chapterQuestions: Record<number, ChapterQuestion>
    ): number {
      return Object.values(chapterQuestions).reduce(
        (sum, q) => sum + (q.easy || 0) + (q.medium || 0) + (q.hard || 0),
        0
      );
    },

    // Calculate exam statistics
    calculateStatistics(
      chapterQuestions: Record<number, ChapterQuestion>
    ): ExamStatistics {
      const stats = Object.values(chapterQuestions).reduce(
        (acc, q) => ({
          easy: acc.easy + (q.easy || 0),
          medium: acc.medium + (q.medium || 0),
          hard: acc.hard + (q.hard || 0),
        }),
        { easy: 0, medium: 0, hard: 0 }
      );

      return {
        total: stats.easy + stats.medium + stats.hard,
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
      };
    },

    // Build exam payload
    buildExamPayload(
      examName: string,
      totalQuestions: number,
      teacherId: string,
      selectedSubject: Subject,
      selectedSemester: Semester,
      selectedChapters: Chapter[],
      chapterQuestions: Record<number, ChapterQuestion>
    ): CreateExamPayload {
      const now = new Date().toISOString();
      const noQuestionInChapterDTO: CreateExamPayload["noQuestionInChapterDTO"] =
        [];

      selectedChapters.forEach((chap) => {
        LEVELS.forEach((lv) => {
          const num = chapterQuestions[chap.chapterId]?.[lv.key] || 0;
          if (num > 0) {
            noQuestionInChapterDTO.push({
              numberQuestion: num,
              chapterId: chap.chapterId,
              levelQuestionId: lv.id,
            });
          }
        });
      });

      return {
        multiExamName: examName,
        numberQuestion: totalQuestions,
        createAt: now,
        teacherId,
        subjectId: selectedSubject.subjectId,
        semesterId: selectedSemester.semesterId,
        noQuestionInChapterDTO,
      };
    },

    // Validate exam data
    validateExamData(
      examName: string,
      selectedSubject: Subject | null,
      selectedSemester: Semester | null,
      selectedChapters: Chapter[],
      questionInput: number,
      totalQuestions: number
    ): { isValid: boolean; message?: string } {
      if (
        !examName ||
        !selectedSubject ||
        !selectedSemester ||
        selectedChapters.length === 0
      ) {
        return {
          isValid: false,
          message: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
        };
      }

      if (questionInput > 0 && totalQuestions !== questionInput) {
        return {
          isValid: false,
          message: "Tổng số câu đã chọn phải bằng số câu hỏi yêu cầu!",
        };
      }

      return { isValid: true };
    },

    // Update chapter question count
    updateChapterQuestionCount(
      chapterQuestions: Record<number, ChapterQuestion>,
      chapterId: number,
      level: Level,
      value: number
    ): Record<number, ChapterQuestion> {
      if (!chapterQuestions[chapterId]) return chapterQuestions;

      const maxValue = chapterQuestions[chapterId].max[level];
      const clampedValue = Math.max(0, Math.min(value, maxValue));

      return {
        ...chapterQuestions,
        [chapterId]: {
          ...chapterQuestions[chapterId],
          [level]: clampedValue,
        },
      };
    },

    // Remove chapter from selections
    removeChapterFromSelections(
      selectedChapters: Chapter[],
      chapterQuestions: Record<number, ChapterQuestion>,
      chapterId: number
    ): {
      selectedChapters: Chapter[];
      chapterQuestions: Record<number, ChapterQuestion>;
    } {
      const newSelectedChapters = selectedChapters.filter(
        (c) => c.chapterId !== chapterId
      );
      const newChapterQuestions = { ...chapterQuestions };
      delete newChapterQuestions[chapterId];

      return {
        selectedChapters: newSelectedChapters,
        chapterQuestions: newChapterQuestions,
      };
    },

    // Generate chapter checks for all/none selection
    generateChapterChecks(
      chapters: Chapter[],
      selectedChapters: Chapter[],
      selectAll: boolean
    ): Record<number, boolean> {
      const availableChapters = chapters.filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      );

      const checks: Record<number, boolean> = {};
      if (selectAll) {
        availableChapters.forEach((chap) => {
          checks[chap.chapterId] = true;
        });
      }

      return checks;
    },
  },
};
