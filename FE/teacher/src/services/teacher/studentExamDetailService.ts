import { showToast } from "@/utils/toastUtils";

export interface QuestionDTO {
  questionId: number;
  content: string;
  gradingCriteria: string;
  studentAnswer: string;
  score: number;
  practiceExamHistoryId: string;
  practiceQuestionId: number;
  maxScore: number;
}

export interface StudentExamDetail {
  studentId: string;
  studentCode: string;
  fullName: string;
  pracExamId: number;
  questions: QuestionDTO[];
}

export interface SuggestResult {
  totalScore: number;
  overallExplanation: string;
  criterionScores?: Array<{
    criterionName: string;
    achievementPercent: number;
    weightedScore: number;
    explanation: string;
  }>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api/GradeScheduleMidTerm" ||
  "https://localhost:7074/api/GradeScheduleMidTerm";
const SUGGEST_API =
  process.env.NEXT_PUBLIC_API_URL + "/api/AIGradePracExam/GradeEssayAnswer" ||
  "https://localhost:7074/api/AIGradePracExam/GradeEssayAnswer";
const MATERIAL_LINK =
  "https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0#heading=h.bllyran0q013";

export const studentExamDetailService = {
  // Lấy chi tiết bài thi của sinh viên
  async getStudentExamDetail(
    teacherId: string | null,
    examId: string | null,
    studentId: string | null,
    examType: string = "2"
  ): Promise<StudentExamDetail | null> {
    if (!teacherId || !examId || !studentId) {
      throw new Error("Missing required parameters");
    }

    try {
      const res = await fetch(
        `${API_BASE}/teacher/${teacherId}/exam/${examId}/student/${studentId}/submission?examType=${examType}`
      );

      if (!res.ok) {
        throw new Error("Không lấy được dữ liệu bài thi");
      }

      const raw = await res.json();

      const data: StudentExamDetail = {
        studentId: raw.studentId,
        studentCode: raw.studentCode,
        fullName: raw.fullName,
        pracExamId: raw.pracExamHistoryId,
        questions: (raw.questionPracExamDTO || []).map((q: any) => ({
          questionId: q.practiceQuestionId,
          content: q.questionContent,
          gradingCriteria: q.gradingCriteria,
          studentAnswer: q.answer,
          score: q.gradedScore ?? q.score ?? 0,
          practiceExamHistoryId: q.pracExamHistoryId,
          practiceQuestionId: q.practiceQuestionId,
          maxScore: q.score || 10,
        })),
      };

      return data;
    } catch (error) {
      console.error("Error fetching student exam detail:", error);
      throw error;
    }
  },

  // Cập nhật điểm cho một câu hỏi
  async updateQuestionScore(
    teacherId: string | null,
    examId: string | null,
    studentId: string | null,
    questionData: {
      practiceExamHistoryId: string;
      practiceQuestionId: number;
      gradedScore: number;
    }
  ): Promise<void> {
    if (!teacherId || !examId || !studentId) {
      throw new Error("Missing required parameters");
    }

    try {
      const res = await fetch(
        `${API_BASE}/teacher/${teacherId}/exam/${examId}/student/${studentId}/grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        }
      );

      if (!res.ok) {
        throw new Error("Không thể cập nhật điểm");
      }

      showToast("success", "Cập nhật điểm thành công!");
    } catch (error) {
      console.error("Error updating question score:", error);
      showToast("error", "Lỗi khi gửi điểm!");
      throw error;
    }
  },

  // Lấy gợi ý chấm điểm từ AI
  async getSuggestedScore(question: QuestionDTO): Promise<SuggestResult> {
    try {
      // Đảm bảo bandScoreGuide là array
      let bandScoreGuide: any[] = [];
      if (Array.isArray(question.gradingCriteria)) {
        bandScoreGuide = question.gradingCriteria;
      } else if (typeof question.gradingCriteria === "string") {
        try {
          const parsed = JSON.parse(question.gradingCriteria);
          if (Array.isArray(parsed)) bandScoreGuide = parsed;
        } catch {
          // Nếu không parse được thì để mảng rỗng
          bandScoreGuide = [];
        }
      }

      const body = {
        questionContent: question.content,
        answerContent: question.studentAnswer,
        bandScoreGuide: bandScoreGuide,
        materialLink: MATERIAL_LINK,
        maxScore: question.maxScore || 10,
      };

      const res = await fetch(SUGGEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Không lấy được gợi ý chấm điểm");
      }

      const result = await res.json();
      return result;
    } catch (error) {
      console.error("Error getting suggested score:", error);
      showToast("error", "Lỗi khi lấy gợi ý chấm điểm!");
      throw error;
    }
  },

  // Hoàn thành chấm bài
  async completeGrading(
    examId: string | null,
    studentId: string | null,
    totalScore: number
  ): Promise<void> {
    if (!examId || !studentId) {
      throw new Error("Missing required parameters");
    }

    try {
      const res = await fetch(
        `${API_BASE}/examId/${examId}/student/${studentId}/mark-graded`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalScore }),
        }
      );

      if (!res.ok) {
        throw new Error("Không thể cập nhật trạng thái chấm bài!");
      }

      showToast("success", "Đã chuyển trạng thái chấm bài thành công!");
    } catch (error) {
      console.error("Error completing grading:", error);
      showToast("error", "Lỗi khi cập nhật trạng thái chấm bài!");
      throw error;
    }
  },
};
