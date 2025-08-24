// finalExamService.ts

export interface Subject {
  subjectId: number;
  subjectName: string;
  description: string;
  course: string;
  noCredits: number;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface Exam {
  examId: number;
  examName: string;
  subjectName: string;
  semesterName: string;
  year: number;
  semesterId: number;
  examType: number; // 1: Trắc nghiệm, 2: Tự luận
}

export interface ExamDetail {
  // For essay exam (type 2)
  pracExamName?: string;
  subjectName: string;
  semesterName: string;
  teacherName: string;
  practiceExamPaperDTO?: Array<{
    pracExamPaperId: number;
    pracExamPaperName: string;
  }>;

  // For multiple choice exam (type 1)
  multiExamName?: string;
  numberQuestion?: number;
  noQuestionInChapterDTO?: Array<{
    chapterName: string;
    levelName: string;
    numberQuestion: number;
  }>;
}

export interface ExamFilters {
  subjectId?: number;
  semesterId?: number;
  year?: number;
  textsearch?: string;
  type?: number;
  pageNumber: number;
  pageSize: number;
}

export interface ExamStatistics {
  total: number;
  multipleChoice: number;
  essay: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export const finalExamService = {
  // Get all subjects by teacher ID
  async getSubjectsByTeacherId(teacherId: string): Promise<Subject[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/AssignGradeCreateExam/GetAllSubjectsByTeacherId?teacherId=${teacherId}`
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

  // Get all semesters
  async getSemesters(): Promise<Semester[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Semesters`);
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

  // Get final exams with filters
  async getFinalExams(filters: ExamFilters): Promise<Exam[]> {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId)
        params.append("subjectId", filters.subjectId.toString());
      if (filters.semesterId)
        params.append("semesterId", filters.semesterId.toString());
      if (filters.year) params.append("year", filters.year.toString());
      if (filters.textsearch) params.append("textsearch", filters.textsearch);
      if (filters.type && filters.type !== 0)
        params.append("type", filters.type.toString());
      params.append("pageNumber", filters.pageNumber.toString());
      params.append("pageSize", filters.pageSize.toString());

      const response = await fetch(
        `${API_BASE_URL}/FinalExam/GetAllFinalExam?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch final exams");
      }
      const data = await response.json();

      // Sort: essay (2) first, multiple choice (1) second
      const sorted = [...data].sort((a, b) => {
        if (a.examType === b.examType) return 0;
        if (a.examType === 2) return -1;
        if (b.examType === 2) return 1;
        return 0;
      });

      return sorted;
    } catch (error) {
      console.error("Error fetching final exams:", error);
      return [];
    }
  },

  // Get total pages count for exams
  async getExamPageCount(filters: ExamFilters): Promise<number> {
    try {
      const params = new URLSearchParams();
      if (filters.subjectId)
        params.append("subjectId", filters.subjectId.toString());
      if (filters.semesterId)
        params.append("semesterId", filters.semesterId.toString());
      if (filters.year) params.append("year", filters.year.toString());
      if (filters.textsearch) params.append("textsearch", filters.textsearch);
      if (filters.type && filters.type !== 0)
        params.append("type", filters.type.toString());
      params.append("pageNumber", filters.pageNumber.toString());
      params.append("pageSize", filters.pageSize.toString());

      const response = await fetch(
        `${API_BASE_URL}/FinalExam/CountPageNumberFinalExam?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch page count");
      }
      const data = await response.json();
      return typeof data === "number" ? data : 1;
    } catch (error) {
      console.error("Error fetching page count:", error);
      return 1;
    }
  },

  // Get exam detail by ID and type
  async getExamDetail(
    examId: number,
    examType: number
  ): Promise<ExamDetail | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/FinalExam/ViewFinalExamDetail/${examId}/${examType}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch exam detail");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching exam detail:", error);
      return null;
    }
  },

  // Utility functions
  utils: {
    // Generate year options (current year and 10 years back)
    getYearOptions(): number[] {
      return Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
    },

    // Get exam type color class
    getExamTypeColor(type: number): string {
      return type === 1
        ? "bg-blue-100 text-blue-800"
        : "bg-purple-100 text-purple-800";
    },

    // Get exam type label
    getExamTypeLabel(type: number): string {
      return type === 1 ? "Trắc nghiệm" : "Tự luận";
    },

    // Calculate exam statistics
    calculateStatistics(exams: Exam[]): ExamStatistics {
      return {
        total: exams.length,
        multipleChoice: exams.filter((e) => e.examType === 1).length,
        essay: exams.filter((e) => e.examType === 2).length,
      };
    },

    // Format select options for subjects
    formatSubjectOptions(subjects: Subject[]) {
      return subjects.map((s) => ({
        value: s.subjectId,
        label: s.subjectName,
        ...s,
      }));
    },

    // Format select options for semesters
    formatSemesterOptions(semesters: Semester[]) {
      return semesters.map((s) => ({
        value: s.semesterId,
        label: s.semesterName,
        ...s,
      }));
    },

    // Format year options for select
    formatYearOptions(years: number[]) {
      return years.map((y) => ({ value: y, label: y.toString() }));
    },

    // Get exam type filter options
    getExamTypeFilterOptions() {
      return [
        { value: 0, label: "Tất cả" },
        { value: 2, label: "Tự luận" },
        { value: 1, label: "Trắc nghiệm" },
      ];
    },

    // Get current year
    getCurrentYear(): number {
      return new Date().getFullYear();
    },
  },
};
