// Types
export interface SimilarQuestion {
  questionID: number;
  content: string;
}

export interface SimilarityGroup {
  similarityScore: number;
  questions: SimilarQuestion[];
}

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface QuestionResponse {
  totalPages: number;
  questions: any[];
  totalCount: number;
  totalMulti: number;
  totalPrac: number;
}

export interface QuestionFilters {
  selectedPublic: any;
  selectedCategory: any;
  selectedSubject: any;
  selectedType: any;
  selectedLevel: any;
  selectedChapter: any;
  selectedSemester: any;
  selectedYear: any;
  page: number;
  teacherId?: string | null;
}

export interface CreateQuestionParams {
  categoryExamId?: string;
  subjectId?: string;
  subjectName?: string;
  questionType?: string;
  levelId?: string;
  chapterId?: string;
  chapterName?: string;
  semesterId?: string;
  semesterName?: string;
  year?: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";
const PAGE_SIZE = 10;

// API Service Functions
export const questionBankService = {
  // Fetch categories
  async fetchCategories(): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/PracticeQuestion/GetAllCategoryExam`
      );
      const data = await response.json();
      return data.map((c: any) => ({
        value: c.categoryExamId,
        label: c.categoryExamName,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // Fetch semesters
  async fetchSemesters(): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/Semesters`);
      const data = await response.json();
      return data.map((s: Semester) => ({
        value: s.semesterId,
        label: s.semesterName,
      }));
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return [];
    }
  },

  // Fetch subjects by category
  async fetchSubjectsByCategory(categoryId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/PracticeQuestion/GetSubjectsByCategoryExam/${categoryId}`
      );
      const data = await response.json();
      return data.map((s: any) => ({
        value: s.subjectId,
        label: s.subjectName,
      }));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  },

  // Fetch chapters by subject
  async fetchChaptersBySubject(subjectId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/MultipleExam/chapter/${subjectId}`
      );
      const data = await response.json();
      return data.map((c: any) => ({ value: c.id, label: c.chapterName }));
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return [];
    }
  },

  // Fetch questions with filters
  async fetchQuestions(filters: QuestionFilters): Promise<QuestionResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.selectedCategory)
        params.append("headId", filters.selectedCategory.value);
      if (filters.selectedSubject)
        params.append("subjectId", filters.selectedSubject.value);
      if (filters.selectedType)
        params.append("questionType", filters.selectedType.value);
      if (filters.selectedLevel)
        params.append("levelId", filters.selectedLevel.value);
      if (filters.selectedChapter)
        params.append("chapterId", filters.selectedChapter.value);
      if (filters.selectedSemester)
        params.append("semesterId", filters.selectedSemester.value);
      if (filters.selectedYear)
        params.append("year", filters.selectedYear.value);

      if (filters.selectedPublic) {
        params.append(
          "isPublic",
          filters.selectedPublic.value === "public" ? "true" : "false"
        );
        if (filters.teacherId && filters.selectedPublic.value === "private") {
          params.append("teacherId", filters.teacherId.toString());
        }
      }

      params.append("pageNumber", filters.page.toString());
      params.append("pageSize", PAGE_SIZE.toString());

      const response = await fetch(
        `${BASE_URL}/PracticeQuestion/all-questions?${params.toString()}`
      );
      const data = await response.json();

      return {
        questions: data.questions || [],
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
        totalMulti: data.totalMulti || 0,
        totalPrac: data.totalPrac || 0,
      };
    } catch (error) {
      console.error("Error fetching questions:", error);
      return {
        questions: [],
        totalPages: 1,
        totalCount: 0,
        totalMulti: 0,
        totalPrac: 0,
      };
    }
  },

  // Check for duplicate questions
  async checkDuplicates(filters: QuestionFilters): Promise<SimilarityGroup[]> {
    try {
      // First, get all questions with current filters (without semester and year)
      const params = new URLSearchParams();
      if (filters.selectedCategory)
        params.append("headId", filters.selectedCategory.value);
      if (filters.selectedSubject)
        params.append("subjectId", filters.selectedSubject.value);
      if (filters.selectedType)
        params.append("questionType", filters.selectedType.value);
      if (filters.selectedLevel)
        params.append("levelId", filters.selectedLevel.value);
      if (filters.selectedChapter)
        params.append("chapterId", filters.selectedChapter.value);

      if (filters.selectedPublic) {
        params.append(
          "isPublic",
          filters.selectedPublic.value === "public" ? "true" : "false"
        );
        if (filters.teacherId && filters.selectedPublic.value === "private") {
          params.append("teacherId", filters.teacherId.toString());
        }
      }

      params.append("pageNumber", "1");
      params.append("pageSize", "1000"); // Get many to have all questions

      const allQuestionsResponse = await fetch(
        `${BASE_URL}/PracticeQuestion/all-questions?${params.toString()}`
      );
      const allQuestionsData = await allQuestionsResponse.json();
      const allQuestions = allQuestionsData.questions || [];

      if (allQuestions.length === 0) {
        throw new Error("Không có câu hỏi nào để kiểm tra!");
      }

      // Prepare data for duplicate check API
      const questionsForCheck = allQuestions.map((q: any) => ({
        questionID: q.questionId,
        content: q.content,
      }));

      const requestBody = {
        questions: questionsForCheck,
        similarityThreshold: 1,
      };

      // Call duplicate check API
      const duplicateResponse = await fetch(
        `${BASE_URL}/AIGradePracExam/FindSimilar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const duplicateData = await duplicateResponse.json();

      if (Array.isArray(duplicateData) && duplicateData.length > 0) {
        return duplicateData;
      } else {
        throw new Error("Không tìm thấy câu hỏi trùng lặp nào!");
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
      throw error;
    }
  },

  // Delete question
  async deleteQuestion(
    questionId: number,
    questionType: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const type = questionType === "multiple" ? "1" : "2";
      const response = await fetch(
        `${BASE_URL}/PracticeQuestion/DeleteQuestion/${questionId}/${type}`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw new Error("Có lỗi xảy ra khi xóa câu hỏi!");
    }
  },

  // Build create question URL
  buildCreateQuestionUrl(
    type: "multiple" | "essay",
    params: CreateQuestionParams
  ): string {
    const urlParams = new URLSearchParams();

    if (params.categoryExamId)
      urlParams.append("categoryExamId", params.categoryExamId);
    if (params.subjectId) {
      urlParams.append("subjectId", params.subjectId);
      urlParams.append("subjectName", params.subjectName || "");
    }
    if (params.questionType)
      urlParams.append("questionType", params.questionType);
    if (params.levelId) urlParams.append("levelId", params.levelId);
    if (params.chapterId) {
      urlParams.append("chapterId", params.chapterId);
      urlParams.append("chapterName", params.chapterName || "");
    }
    if (params.semesterId) {
      urlParams.append("semesterId", params.semesterId);
      urlParams.append("semesterName", params.semesterName || "");
    }
    if (params.year) urlParams.append("year", params.year);

    if (type === "multiple") {
      return `/teacher/questionbank/createmulquestion?${urlParams.toString()}`;
    } else {
      return `/teacher/questionbank/createpracquestion?${urlParams.toString()}`;
    }
  },
};

// Static data
export const questionTypes = [
  { value: "multiple", label: "Trắc nghiệm" },
  { value: "essay", label: "Tự luận" },
];

export const questionLevels = [
  { value: 1, label: "Dễ" },
  { value: 2, label: "Trung bình" },
  { value: 3, label: "Khó" },
];

export const publicOptions = [
  { value: "public", label: "Bank chung" },
  { value: "private", label: "Bank riêng" },
];

// Generate years from current year back 20 years
export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 20; i++) {
    const year = currentYear - i;
    years.push({ value: year, label: year.toString() });
  }
  return years;
};

// Utility functions
export const answerCharacter = (idx: number) => String.fromCharCode(65 + idx);

export const getLevelColor = (level: string) => {
  switch (level) {
    case "Dễ":
      return "bg-green-100 text-green-800";
    case "Trung bình":
      return "bg-yellow-100 text-yellow-800";
    case "Khó":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// React-Select styles
export const getSelectStyles = (
  isRequired: boolean = false,
  hasValue: boolean = false
) => ({
  control: (provided: any) => ({
    ...provided,
    minHeight: "44px",
    borderColor: isRequired && !hasValue ? "#f87171" : "#d1d5db",
    "&:hover": { borderColor: "#3b82f6" },
  }),
});

export const PAGE_SIZE_CONSTANT = PAGE_SIZE;
