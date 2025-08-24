// createPracticeExamService.ts
import { getUserIdFromToken } from "@/utils/tokenUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

// Interfaces
export interface PracticeExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  year: string;
  semester: string;
}

export interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

export interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string;
  status: string;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export interface Student {
  studentId: string;
  code: string;
  fullName: string;
}

export interface GradeComponent {
  categoryExamId: number;
  categoryExamName: string;
}

export interface SelectOption {
  value: number;
  label: string;
}

export interface YearOption {
  value: string;
  label: string;
}

export interface GradingCriterion {
  criterionName: string;
  weightPercent: number;
  description: string;
}

export interface CreatePracticeExamPayload {
  pracExamName: string;
  duration: number;
  startDay: string;
  endDay: string;
  createAt: string;
  teacherId: string | null;
  categoryExamId: number;
  subjectId: number;
  status: string;
  classId: number;
  semesterId: number;
  practiceExamPaperDTO: {
    pracExamPaperId: number;
    pracExamPaperName: string;
    year: string;
    semester: string;
  }[];
  studentIds: string[];
}

export interface ClassData {
  students: Student[];
  gradeComponents: SelectOption[];
  subjectId: number;
  semesterId: number;
  semesters: SemesterDTO[];
  years: YearOption[];
}

class CreatePracticeExamService {
  // Load class data (students, grade components, subject, semester, etc.)
  async loadClassData(classId: number): Promise<ClassData> {
    try {
      const [
        semesterIdRes,
        studentsRes,
        gradeComponentsRes,
        subjectIdRes,
        semestersRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/Class/${classId}/semester-id`),
        fetch(`${API_URL}/api/Class/${classId}/students`),
        fetch(`${API_URL}/api/Class/${classId}/grade-components`),
        fetch(`${API_URL}/api/Class/${classId}/subject-id`),
        fetch(`${API_URL}/api/Semesters`),
      ]);

      const [semesterId, students, gradeComponentsData, subjectId, semesters] =
        await Promise.all([
          semesterIdRes.json(),
          studentsRes.json(),
          gradeComponentsRes.json(),
          subjectIdRes.json(),
          semestersRes.json(),
        ]);

      const gradeComponents = (gradeComponentsData || []).map(
        (g: GradeComponent) => ({
          value: g.categoryExamId,
          label: g.categoryExamName,
        })
      );

      // Generate years from current year to 2020
      const currentYear = new Date().getFullYear();
      const years: YearOption[] = [];
      for (let y = currentYear; y >= 2020; y--) {
        years.push({ value: y.toString(), label: y.toString() });
      }

      return {
        students: students || [],
        gradeComponents,
        subjectId,
        semesterId,
        semesters: semesters || [],
        years,
      };
    } catch (error) {
      console.error("Error loading class data:", error);
      throw new Error("Không thể tải dữ liệu lớp học");
    }
  }

  // Get exam papers by filters
  async getExamPapers(
    subjectId: number,
    categoryId: number,
    semesterName: string | null,
    year: string | null,
    selectedExams: PracticeExamPaperDTO[],
    semesters: SemesterDTO[],
    years: YearOption[]
  ): Promise<PracticeExamPaperDTO[]> {
    try {
      const teacherId = getUserIdFromToken();
      if (!subjectId) throw new Error("Không lấy được subjectId");
      if (!categoryId) throw new Error("Vui lòng chọn đầu điểm");

      const examRes = await fetch(
        `${API_URL}/api/PracticeExam/exams_paper?subjectId=${subjectId}&categoryId=${categoryId}&teacherId=${teacherId}`
      );

      if (!examRes.ok) throw new Error("Không lấy được danh sách đề thi");

      const exams = await examRes.json();
      let filtered = exams || [];

      // Determine default values if not selected
      const semesterFilter = semesterName || semesters[0]?.semesterName;
      const yearFilter = year || years[0]?.value;

      filtered = filtered.filter(
        (e: PracticeExamPaperDTO) =>
          e.semester === semesterFilter &&
          e.year === yearFilter &&
          !selectedExams.some((se) => se.pracExamPaperId === e.pracExamPaperId)
      );

      return filtered;
    } catch (error) {
      console.error("Error fetching exam papers:", error);
      throw error;
    }
  }

  // Get exam paper detail
  async getExamPaperDetail(examPaperId: number): Promise<ExamPaperDetail> {
    try {
      const res = await fetch(
        `${API_URL}/api/PracticeExamPaper/DetailExamPaper/${examPaperId}`
      );
      if (!res.ok) throw new Error("Không lấy được chi tiết đề thi");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching exam paper detail:", error);
      throw error;
    }
  }

  // Create practice exam
  async createPracticeExam(payload: CreatePracticeExamPayload): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/PracticeExam/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Tạo bài kiểm tra thất bại");
    } catch (error) {
      console.error("Error creating practice exam:", error);
      throw error;
    }
  }

  // Utility functions
  utils = {
    // Parse grading criteria from answer content
    parseGradingCriteria: (answerContent: string): GradingCriterion[] => {
      if (!answerContent) return [];
      try {
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
      } catch {
        // If not JSON, return empty array
      }
      return [];
    },

    // Generate student checks object
    generateStudentChecks: (
      students: Student[],
      checked: boolean
    ): Record<string, boolean> => {
      const checks: Record<string, boolean> = {};
      students.forEach((student) => {
        checks[student.studentId] = checked;
      });
      return checks;
    },

    // Generate exam checks object
    generateExamChecks: (
      exams: PracticeExamPaperDTO[],
      checked: boolean
    ): Record<number, boolean> => {
      const checks: Record<number, boolean> = {};
      exams.forEach((exam) => {
        checks[exam.pracExamPaperId] = checked;
      });
      return checks;
    },

    // Get selected students from checks
    getSelectedStudentsFromChecks: (
      students: Student[],
      checks: Record<string, boolean>
    ): Student[] => {
      return students.filter((student) => checks[student.studentId]);
    },

    // Get selected exams from checks
    getSelectedExamsFromChecks: (
      exams: PracticeExamPaperDTO[],
      checks: Record<number, boolean>
    ): PracticeExamPaperDTO[] => {
      return exams.filter((exam) => checks[exam.pracExamPaperId]);
    },

    // Build practice exam payload
    buildPracticeExamPayload: (
      examName: string,
      duration: number,
      startDate: string,
      endDate: string,
      selectedGradeComponent: SelectOption,
      subjectId: number,
      classId: number,
      semesterId: number,
      selectedExams: PracticeExamPaperDTO[],
      selectedStudents: Student[]
    ): CreatePracticeExamPayload => {
      const teacherId = getUserIdFromToken();

      return {
        pracExamName: examName,
        duration: duration,
        startDay: startDate,
        endDay: endDate,
        createAt: new Date().toISOString(),
        teacherId: teacherId,
        categoryExamId: selectedGradeComponent.value,
        subjectId: subjectId,
        status: "Chưa thi",
        classId: classId,
        semesterId: semesterId,
        practiceExamPaperDTO: selectedExams.map((e) => ({
          pracExamPaperId: e.pracExamPaperId,
          pracExamPaperName: e.pracExamPaperName,
          year: Date.now().toString().slice(0, 4), // Current year
          semester: e.semester,
        })),
        studentIds: selectedStudents.map((s: Student) => s.studentId),
      };
    },
  };
}

export const createPracticeExamService = new CreatePracticeExamService();
