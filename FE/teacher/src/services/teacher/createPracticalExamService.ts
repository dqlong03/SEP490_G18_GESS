// createPracticalExamService.ts

import { showToast } from "@/utils/toastUtils";

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

export interface CreatePracticalExamPayload {
  pracExamName: string;
  teacherId: string;
  subjectId: number;
  semesterId: number;
  practiceExamPaperDTO: Array<{
    pracExamPaperId: number;
  }>;
}

export interface SubjectOption {
  value: number;
  label: string;
}

export interface SemesterOption {
  value: number;
  label: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export const createPracticalExamService = {
  // Get all subjects by teacher ID
  async getSubjectsByTeacherId(teacherId: string): Promise<SubjectDTO[]> {
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

  // Get all exam papers by subject and semester
  async getExamPapers(
    subjectId: number,
    semesterId: number
  ): Promise<PracExamPaperDTO[]> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExam/GetAllFinalExamPaper?subjectId=${subjectId}&semesterId=${semesterId}`
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
        `${API_URL}/api/FinalExam/ViewFinalExamPaperDetail/${examPaperId}`
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

  // Create final practical exam
  async createFinalPracticalExam(
    payload: CreatePracticalExamPayload
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_URL}/api/FinalExam/CreateFinalPracExam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        showToast("success", "Tạo bài thi thành công!");
      }
      return response.ok;
    } catch (error) {
      console.error("Error creating practical exam:", error);
      showToast("error", "Tạo bài thi thất bại!");
      return false;
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

    // Filter available exam papers (exclude already selected ones)
    filterAvailableExamPapers(
      allExamPapers: PracExamPaperDTO[],
      selectedExams: PracExamPaperDTO[]
    ): PracExamPaperDTO[] {
      return allExamPapers.filter(
        (exam) =>
          !selectedExams.some(
            (selected) => selected.pracExamPaperId === exam.pracExamPaperId
          )
      );
    },

    // Calculate total questions from selected exams and exam details
    calculateTotalQuestions(
      examDetails: Record<number, ExamPaperDetail>
    ): number {
      return Object.values(examDetails).reduce((sum, detail) => {
        return sum + (detail?.questions?.length || 0);
      }, 0);
    },

    // Build exam payload for submission
    buildExamPayload(
      examName: string,
      teacherId: string,
      selectedSubject: SubjectOption,
      selectedSemester: SemesterOption,
      selectedExams: PracExamPaperDTO[]
    ): CreatePracticalExamPayload {
      return {
        pracExamName: examName,
        teacherId,
        subjectId: selectedSubject.value,
        semesterId: selectedSemester.value,
        practiceExamPaperDTO: selectedExams.map((e) => ({
          pracExamPaperId: e.pracExamPaperId,
        })),
      };
    },

    // Validate exam data before submission
    validateExamData(
      examName: string,
      selectedSubject: SubjectOption | null,
      selectedSemester: SemesterOption | null,
      selectedExams: PracExamPaperDTO[]
    ): { isValid: boolean; message?: string } {
      if (!selectedSubject) {
        return { isValid: false, message: "Vui lòng chọn môn học" };
      }

      if (!selectedSemester) {
        return { isValid: false, message: "Vui lòng chọn học kỳ" };
      }

      if (!examName || selectedExams.length === 0) {
        return { isValid: false, message: "Vui lòng nhập đầy đủ thông tin" };
      }

      return { isValid: true };
    },

    // Generate exam checks for select all/none functionality
    generateExamChecks(
      examPapers: PracExamPaperDTO[],
      selectAll: boolean
    ): Record<number, boolean> {
      const checks: Record<number, boolean> = {};
      if (selectAll) {
        examPapers.forEach((exam) => {
          checks[exam.pracExamPaperId] = true;
        });
      }
      return checks;
    },

    // Get selected exams from checks
    getSelectedExamsFromChecks(
      examPapers: PracExamPaperDTO[],
      examChecks: Record<number, boolean>
    ): PracExamPaperDTO[] {
      return examPapers.filter((exam) => examChecks[exam.pracExamPaperId]);
    },
  },
};
