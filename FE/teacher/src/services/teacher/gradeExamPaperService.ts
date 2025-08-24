// Service cho trang chấm bài học sinh

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

export interface GradeSubmissionRequest {
  practiceExamHistoryId: string;
  practiceQuestionId: number;
  gradedScore: number;
}

export interface MarkGradedRequest {
  totalScore: number;
}

export interface SuggestScoreRequest {
  questionContent: string;
  answerContent: string;
  bandScoreGuide: any[];
  materialLink: string;
  maxScore: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api/GradeSchedule" ||
  "https://localhost:7074/api/GradeSchedule";
const SUGGEST_API =
  process.env.NEXT_PUBLIC_API_URL + "/api/AIGradePracExam/GradeEssayAnswer" ||
  "https://localhost:7074/api/AIGradePracExam/GradeEssayAnswer";
const MATERIAL_LINK =
  "https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0#heading=h.bllyran0q013";

// Lấy chi tiết bài thi của học sinh
export const getStudentExamDetail = async (
  examSlotRoomId: string | string[],
  studentId: string
): Promise<StudentExamDetail> => {
  const response = await fetch(
    `${API_BASE}/examslotroom/${examSlotRoomId}/student/${studentId}/exam-detail`
  );

  if (!response.ok) {
    throw new Error("Không lấy được dữ liệu bài thi");
  }

  return response.json();
};

// Gửi điểm cho một câu hỏi
export const submitQuestionGrade = async (
  teacherId: string,
  examId: number,
  studentId: string,
  gradeData: GradeSubmissionRequest
): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/teacher/${teacherId}/exam/${examId}/student/${studentId}/grade`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gradeData),
    }
  );

  if (!response.ok) {
    throw new Error("Lỗi khi gửi điểm!");
  }
};

// Gợi ý điểm từ AI
export const getSuggestedScore = async (
  request: SuggestScoreRequest
): Promise<SuggestResult> => {
  const response = await fetch(SUGGEST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Không lấy được gợi ý chấm điểm");
  }

  return response.json();
};

// Đánh dấu học sinh đã được chấm xong
export const markStudentAsGraded = async (
  examSlotRoomId: string | string[],
  studentId: string,
  request: MarkGradedRequest
): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/examslotroom/${examSlotRoomId}/student/${studentId}/mark-graded`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể cập nhật trạng thái chấm bài!");
  }
};

// Utility function để parse grading criteria
export const parseGradingCriteria = (gradingCriteria: any): any[] => {
  if (Array.isArray(gradingCriteria)) {
    return gradingCriteria;
  }

  if (typeof gradingCriteria === "string") {
    try {
      const parsed = JSON.parse(gradingCriteria);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Nếu không parse được thì trả về mảng rỗng
    }
  }

  return [];
};

export { MATERIAL_LINK };
