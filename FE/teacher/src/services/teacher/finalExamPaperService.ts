// finalExamPaperService.ts

export interface SubjectDTO {
  subjectId: number;
  subjectName: string;
}

export interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

export interface PracExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  semesterName: string;
}

export interface GradingCriterion {
  criterionName: string;
  weightPercent: number;
  description: string;
}

export interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string | null;
  status: string | null;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export interface SubjectOption {
  value: number;
  label: string;
}

export interface SemesterOption {
  value: number;
  label: string;
}

export interface YearOption {
  value: string;
  label: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export const finalExamPaperService = {
  // Get subjects by teacher ID
  async getSubjectsByTeacherId(teacherId: string): Promise<SubjectDTO[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExamPaper/GetAllMajorByTeacherId?teacherId=${teacherId}`
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
  async getSemesters(): Promise<SemesterDTO[]> {
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

  // Get exam papers by filters
  async getExamPapers(
    subjectId: number,
    semesterId: number,
    year: string
  ): Promise<PracExamPaperDTO[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExamPaper/GetAllFinalExamPaper?subjectId=${subjectId}&semesterId=${semesterId}&year=${year}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch exam papers");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching exam papers:", error);
      throw new Error("Không thể tải danh sách đề thi");
    }
  },

  // Get exam paper detail
  async getExamPaperDetail(examPaperId: number): Promise<ExamPaperDetail> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExamPaper/ViewFinalExamPaperDetail/${examPaperId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch exam paper detail");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching exam paper detail:", error);
      throw new Error("Không thể tải chi tiết đề thi");
    }
  },

  // Utility functions
  utils: {
    // Format subject options for select
    formatSubjectOptions(subjects: SubjectDTO[]): SubjectOption[] {
      return subjects.map((s) => ({
        value: s.subjectId,
        label: s.subjectName,
      }));
    },

    // Format semester options for select
    formatSemesterOptions(semesters: SemesterDTO[]): SemesterOption[] {
      return semesters.map((s) => ({
        value: s.semesterId,
        label: s.semesterName,
      }));
    },

    // Generate year options (10 years back from current year)
    generateYearOptions(): YearOption[] {
      const currentYear = new Date().getFullYear();
      const years: YearOption[] = [];
      for (let y = currentYear; y > currentYear - 10; y--) {
        years.push({ value: y.toString(), label: y.toString() });
      }
      return years;
    },

    // Filter exam papers by search text
    filterExamPapersBySearch(
      examPapers: PracExamPaperDTO[],
      searchText: string
    ): PracExamPaperDTO[] {
      if (!searchText.trim()) return examPapers;

      return examPapers.filter((exam) =>
        exam.pracExamPaperName.toLowerCase().includes(searchText.toLowerCase())
      );
    },

    // Calculate total score from exam detail
    calculateTotalScore(detailData: ExamPaperDetail | null): number {
      if (!detailData?.questions) return 0;
      return detailData.questions.reduce((sum, q) => sum + q.score, 0);
    },

    // Parse grading criteria from JSON string or plain text
    parseGradingCriteria(answerContent: string): GradingCriterion[] {
      if (!answerContent) return [];

      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(answerContent);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.criterionName &&
              item.description
          );
        }
      } catch (error) {
        // If JSON parsing fails, fallback to text splitting
        const points = answerContent
          .split(/[\n\r]+|[.;]+/)
          .map((point) => point.trim())
          .filter((point) => point.length > 0 && point !== ".");

        // Convert to criterion format
        return points.map((point, index) => ({
          criterionName: `Tiêu chí ${index + 1}`,
          weightPercent: Math.round(100 / points.length),
          description: point,
        }));
      }

      return [];
    },

    // Format date for display
    formatDate(dateString: string): string {
      if (!dateString || dateString === "0001-01-01T00:00:00") {
        return "Chưa cập nhật";
      }
      try {
        return new Date(dateString).toLocaleDateString("vi-VN");
      } catch (error) {
        return "Chưa cập nhật";
      }
    },

    // Get default subject and semester from arrays
    getDefaultSelections(
      subjects: SubjectDTO[],
      semesters: SemesterDTO[]
    ): {
      defaultSubject: SubjectOption | null;
      defaultSemester: SemesterOption | null;
    } {
      const defaultSubject =
        subjects.length > 0
          ? { value: subjects[0].subjectId, label: subjects[0].subjectName }
          : null;

      const defaultSemester =
        semesters.length > 0
          ? { value: semesters[0].semesterId, label: semesters[0].semesterName }
          : null;

      return { defaultSubject, defaultSemester };
    },

    // Check if filters are complete for fetching data
    areFiltersComplete(
      selectedSubject: SubjectOption | null,
      selectedSemester: SemesterOption | null,
      selectedYear: YearOption | null
    ): boolean {
      return !!(selectedSubject && selectedSemester && selectedYear);
    },

    // Validate exam paper data
    validateExamPaper(examPaper: PracExamPaperDTO): boolean {
      return !!(
        examPaper &&
        examPaper.pracExamPaperId &&
        examPaper.pracExamPaperName &&
        examPaper.semesterName
      );
    },

    // Generate statistics for exam papers
    generateStatistics(examPapers: PracExamPaperDTO[]): {
      totalExams: number;
      hasData: boolean;
    } {
      return {
        totalExams: examPapers.length,
        hasData: examPapers.length > 0,
      };
    },
  },
};
