// myExamService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

// Interfaces
export interface Major {
  majorId?: number;
  id?: number;
  majorName?: string;
  name?: string;
}

export interface Subject {
  subjectId?: number;
  id?: number;
  subjectName?: string;
  name?: string;
}

export interface Semester {
  semesterId?: number;
  id?: number;
  semesterName?: string;
  name?: string;
}

export interface ExamType {
  value: string;
  label: string;
}

export interface ExamHead {
  value: string;
  label: string;
}

export interface Exam {
  examId?: number;
  id?: number;
  examName: string;
  semesterName: string;
  createDate?: string;
  statusExam?: string;
  examType?: string;
}

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface ExamFilters {
  pageNumber: number;
  pageSize: number;
  majorId?: number | string;
  semesterId?: number | string;
  subjectId?: number | string;
  examType?: string;
  searchName?: string;
}

export interface ExamResponse {
  data: Exam[];
  totalCount: number;
}

class MyExamService {
  // Get majors from MultipleExamController
  async getMajors(): Promise<Major[]> {
    try {
      const response = await fetch(`${API_URL}/api/MultipleExam/major`);
      if (!response.ok) throw new Error("Failed to fetch majors");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching majors:", error);
      return [];
    }
  }

  // Get subjects by major from MultipleExamController
  async getSubjectsByMajor(majorId: number | string): Promise<Subject[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/MultipleExam/subject/${majorId}`
      );
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  }

  // Get current semester
  async getCurrentSemester(): Promise<Semester[]> {
    try {
      const response = await fetch(`${API_URL}/api/Semesters/CurrentSemester`);
      if (!response.ok) throw new Error("Failed to fetch semesters");
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return [];
    }
  }

  // Get teacher exams with filters
  async getTeacherExams(
    teacherId: string,
    filters: ExamFilters
  ): Promise<ExamResponse> {
    try {
      const params = new URLSearchParams();
      params.append("pageNumber", filters.pageNumber.toString());
      params.append("pageSize", filters.pageSize.toString());

      if (filters.majorId) params.append("majorId", filters.majorId.toString());
      if (filters.semesterId)
        params.append("semesterId", filters.semesterId.toString());
      if (filters.subjectId)
        params.append("subjectId", filters.subjectId.toString());
      if (filters.examType) params.append("examType", filters.examType);
      if (filters.searchName) params.append("searchName", filters.searchName);

      const response = await fetch(
        `${API_URL}/api/Exam/teacher-exams/${teacherId}?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch exams");

      const data = await response.json();
      return {
        data: Array.isArray(data.data) ? data.data : [],
        totalCount: data.totalCount || 0,
      };
    } catch (error) {
      console.error("Error fetching teacher exams:", error);
      return {
        data: [],
        totalCount: 0,
      };
    }
  }

  // Utility functions
  utils = {
    // Format major options for react-select
    formatMajorOptions: (majors: Major[]): SelectOption[] => {
      return majors.map((m) => ({
        value: m.majorId || m.id || 0,
        label: m.majorName || m.name || "",
      }));
    },

    // Format subject options for react-select
    formatSubjectOptions: (subjects: Subject[]): SelectOption[] => {
      return subjects.map((s) => ({
        value: s.subjectId || s.id || 0,
        label: s.subjectName || s.name || "",
      }));
    },

    // Format semester options for react-select
    formatSemesterOptions: (semesters: Semester[]): SelectOption[] => {
      return semesters.map((s) => ({
        value: s.semesterId || s.id || 0,
        label: s.semesterName || s.name || "",
      }));
    },

    // Extract unique exam types from exam data
    extractExamTypes: (exams: Exam[]): ExamType[] => {
      return Array.from(new Set(exams.map((e) => e.examType)))
        .filter(Boolean)
        .map((type) => ({
          value: String(type),
          label: String(type),
        }));
    },

    // Extract unique exam heads (status) from exam data
    extractExamHeads: (exams: Exam[]): ExamHead[] => {
      return Array.from(new Set(exams.map((e) => e.statusExam)))
        .filter(Boolean)
        .map((head) => ({
          value: String(head),
          label: String(head),
        }));
    },

    // Filter exams by head (status) on client side
    filterExamsByHead: (
      exams: Exam[],
      selectedHead: SelectOption | null
    ): Exam[] => {
      return exams.filter((exam) => {
        const matchHead = selectedHead
          ? exam.statusExam === selectedHead.value
          : true;
        return matchHead;
      });
    },

    // Calculate total pages
    calculateTotalPages: (totalCount: number, pageSize: number): number => {
      return Math.ceil(totalCount / pageSize);
    },

    // Format date for display
    formatDate: (dateString?: string): string => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString();
    },

    // Reset all filters
    getInitialFilters: (): {
      searchName: string;
      selectedMajor: SelectOption | null;
      selectedSubject: SelectOption | null;
      selectedSemester: SelectOption | null;
      selectedType: SelectOption | null;
      selectedHead: SelectOption | null;
    } => ({
      searchName: "",
      selectedMajor: null,
      selectedSubject: null,
      selectedSemester: null,
      selectedType: null,
      selectedHead: null,
    }),
  };
}

export const myExamService = new MyExamService();
