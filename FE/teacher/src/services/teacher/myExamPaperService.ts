// myExamPaperService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

// Types
export interface Subject {
  subjectId: number;
  subjectName: string;
}

export interface ExamPaper {
  pracExamPaperId: number;
  pracExamPaperName: string;
  subjectName: string;
  categoryExamName: string;
  createBy: string;
  semesterName: string;
  status: string;
}

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface ExamFilters {
  searchName?: string;
  subjectId?: number;
  categoryExamId?: string;
  semesterId?: string;
  page: number;
  pageSize: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

class MyExamPaperService {
  // Get list of subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await fetch(`${API_URL}/api/Subject/ListSubject`);
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  }

  // Get exam papers with filters and pagination
  async getExamPapers(filters: ExamFilters): Promise<ExamPaper[]> {
    try {
      const params = new URLSearchParams();

      if (filters.searchName) {
        params.append("searchName", filters.searchName);
      }
      if (filters.subjectId) {
        params.append("subjectId", filters.subjectId.toString());
      }
      if (filters.categoryExamId) {
        params.append("categoryExamId", filters.categoryExamId);
      }
      if (filters.semesterId) {
        params.append("semesterId", filters.semesterId);
      }

      params.append("page", filters.page.toString());
      params.append("pageSize", filters.pageSize.toString());

      const response = await fetch(
        `${API_URL}/api/PracticeExamPaper/GetAllExamPaperListAsync?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam papers");
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching exam papers:", error);
      return [];
    }
  }

  // Get total pages count
  async getTotalPages(filters: Omit<ExamFilters, "page">): Promise<number> {
    try {
      const params = new URLSearchParams();

      if (filters.searchName) {
        params.append("name", filters.searchName);
      }
      if (filters.subjectId) {
        params.append("subjectId", filters.subjectId.toString());
      }
      if (filters.categoryExamId) {
        params.append("categoryExamId", filters.categoryExamId);
      }
      if (filters.semesterId) {
        params.append("semesterId", filters.semesterId);
      }

      params.append("pageSize", filters.pageSize.toString());

      const response = await fetch(
        `${API_URL}/api/PracticeExamPaper/CountPages?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch total pages");
      }

      const total = await response.json();
      return total || 1;
    } catch (error) {
      console.error("Error fetching total pages:", error);
      return 1;
    }
  }

  // Delete exam paper
  async deleteExamPaper(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/PracticeExamPaper/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete exam paper");
      }
    } catch (error) {
      console.error("Error deleting exam paper:", error);
      throw error;
    }
  }

  // Utility functions
  utils = {
    // Format subjects for select dropdown
    formatSubjectOptions: (subjects: Subject[]): SelectOption[] => {
      return subjects.map((s) => ({
        value: s.subjectId,
        label: s.subjectName,
      }));
    },

    // Extract unique semester options from exam papers
    extractSemesterOptions: (examPapers: ExamPaper[]): SelectOption[] => {
      const uniqueSemesters = Array.from(
        new Set(examPapers.map((e) => e.semesterName).filter(Boolean))
      );
      return uniqueSemesters.map((name) => ({
        value: name,
        label: name,
      }));
    },

    // Extract unique head (category) options from exam papers
    extractHeadOptions: (examPapers: ExamPaper[]): SelectOption[] => {
      const uniqueHeads = Array.from(
        new Set(examPapers.map((e) => e.categoryExamName).filter(Boolean))
      );
      return uniqueHeads.map((name) => ({
        value: name,
        label: name,
      }));
    },

    // Format date for display
    formatDate: (dateString: string): string => {
      try {
        return new Date(dateString).toLocaleDateString("vi-VN");
      } catch {
        return dateString;
      }
    },

    // Calculate statistics from exam papers
    calculateStatistics: (examPapers: ExamPaper[]) => {
      const total = examPapers.length;
      const draft = examPapers.filter((e) => e.status === "Draft").length;
      const completed = total - draft;

      return {
        total,
        draft,
        completed,
      };
    },

    // Custom styles for react-select
    getSelectStyles: () => ({
      control: (provided: any, state: any) => ({
        ...provided,
        minHeight: "48px",
        borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
        borderRadius: "8px",
        boxShadow: state.isFocused
          ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
          : "none",
        "&:hover": {
          borderColor: "#3b82f6",
        },
      }),
      menu: (provided: any) => ({
        ...provided,
        zIndex: 20,
        borderRadius: "8px",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }),
      option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? "#3b82f6"
          : state.isFocused
            ? "#eff6ff"
            : "white",
        color: state.isSelected ? "white" : "#374151",
        "&:hover": {
          backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
        },
      }),
    }),

    // Build filters object from state
    buildFilters: (
      searchName: string,
      selectedSubject: SelectOption | null,
      selectedHead: SelectOption | null,
      selectedSemester: SelectOption | null,
      page: number,
      pageSize: number
    ): ExamFilters => ({
      ...(searchName && { searchName }),
      ...(selectedSubject && { subjectId: selectedSubject.value as number }),
      ...(selectedHead && { categoryExamId: selectedHead.value as string }),
      ...(selectedSemester && { semesterId: selectedSemester.value as string }),
      page,
      pageSize,
    }),

    // Generate pagination range
    generatePaginationRange: (
      currentPage: number,
      totalPages: number,
      maxVisible: number = 5
    ): number[] => {
      const range: number[] = [];
      const maxPages = Math.min(maxVisible, totalPages);

      for (let i = 1; i <= maxPages; i++) {
        range.push(i);
      }

      return range;
    },

    // Calculate display range for pagination info
    calculateDisplayRange: (
      page: number,
      pageSize: number,
      totalItems: number
    ) => ({
      start: (page - 1) * pageSize + 1,
      end: Math.min(page * pageSize, totalItems),
      total: totalItems,
    }),
  };
}

export const myExamPaperService = new MyExamPaperService();
