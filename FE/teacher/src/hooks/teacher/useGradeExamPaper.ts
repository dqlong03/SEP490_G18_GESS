import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { showToast } from "@/utils/toastUtils";
import {
  QuestionDTO,
  StudentExamDetail,
  SuggestResult,
  getStudentExamDetail,
  submitQuestionGrade,
  getSuggestedScore,
  markStudentAsGraded,
  parseGradingCriteria,
  MATERIAL_LINK,
} from "@/services/teacher/gradeExamPaperService";

export const useGradeExamPaper = (
  examSlotRoomId: string | string[],
  studentId: string | null
) => {
  const router = useRouter();
  const teacherId = getUserIdFromToken();

  // State management
  const [examDetail, setExamDetail] = useState<StudentExamDetail | null>(null);
  const [scores, setScores] = useState<{ [qid: number]: number | "" }>({});
  const [totalScore, setTotalScore] = useState<number>(0);
  const [showCriteria, setShowCriteria] = useState<{ [qid: number]: boolean }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [suggesting, setSuggesting] = useState<{ [qid: number]: boolean }>({});
  const [suggestResult, setSuggestResult] = useState<{
    [qid: number]: SuggestResult | null;
  }>({});

  // Fetch exam detail
  useEffect(() => {
    async function fetchExamDetail() {
      if (!studentId) return;

      setLoading(true);
      try {
        const data = await getStudentExamDetail(examSlotRoomId, studentId);
        setExamDetail(data);

        const initialScores: { [qid: number]: number | "" } = {};
        let calculatedTotal = 0;

        data.questions.forEach((q) => {
          initialScores[q.questionId] = q.score ?? "";
          if (typeof q.score === "number") {
            calculatedTotal += q.score;
          }
        });

        setScores(initialScores);
        setTotalScore(calculatedTotal);
      } catch (err) {
        showToast("error", "Lỗi khi lấy dữ liệu bài thi");
      }
      setLoading(false);
    }

    fetchExamDetail();
  }, [examSlotRoomId, studentId]);

  // Calculate total score from individual question scores
  const calculateTotalFromQuestions = (): number => {
    return Object.values(scores).reduce((total: number, score) => {
      return total + (typeof score === "number" ? score : 0);
    }, 0);
  };

  // Update total score when scores change
  useEffect(() => {
    const calculated = calculateTotalFromQuestions();
    setTotalScore(calculated);
  }, [scores]);

  // Get total max score of all questions
  const getTotalMaxScore = () => {
    if (!examDetail) return 0;
    return examDetail.questions.reduce(
      (total, q) => total + (q.maxScore || 10),
      0
    );
  };

  // Handle score change for a question
  const handleScoreChange = async (qid: number, value: number | "") => {
    // Special case for total score (qid = -1)
    if (qid === -1) {
      setTotalScore(typeof value === "number" ? value : 0);
      return;
    }

    setScores((prev) => ({ ...prev, [qid]: value }));

    if (
      teacherId &&
      examDetail &&
      examDetail.pracExamId &&
      value !== "" &&
      examDetail.questions &&
      studentId
    ) {
      const question = examDetail.questions.find((q) => q.questionId === qid);
      if (!question) return;

      try {
        await submitQuestionGrade(teacherId, examDetail.pracExamId, studentId, {
          practiceExamHistoryId: question.practiceExamHistoryId,
          practiceQuestionId: question.practiceQuestionId,
          gradedScore: value as number,
        });
        showToast("success", "Cập nhật điểm thành công!");
      } catch (err) {
        showToast("error", "Lỗi khi gửi điểm!");
      }
    }
  };

  // Handle AI suggestion for scoring
  const handleSuggestScore = async (q: QuestionDTO) => {
    setSuggesting((prev) => ({ ...prev, [q.questionId]: true }));
    setSuggestResult((prev) => ({ ...prev, [q.questionId]: null }));

    try {
      const bandScoreGuide = parseGradingCriteria(q.gradingCriteria);

      const result = await getSuggestedScore({
        questionContent: q.content,
        answerContent: q.studentAnswer,
        bandScoreGuide: bandScoreGuide,
        materialLink: MATERIAL_LINK,
        maxScore: q.maxScore || 10,
      });

      setSuggestResult((prev) => ({ ...prev, [q.questionId]: result }));
    } catch (err) {
      setSuggestResult((prev) => ({ ...prev, [q.questionId]: null }));
      showToast("error", "Lỗi khi lấy gợi ý chấm điểm!");
    }

    setSuggesting((prev) => ({ ...prev, [q.questionId]: false }));
  };

  // Apply suggested score
  const handleApplySuggestScore = async (q: QuestionDTO, score: number) => {
    await handleScoreChange(q.questionId, score);
    setScores((prev) => ({ ...prev, [q.questionId]: score }));
    setSuggestResult((prev) => ({ ...prev, [q.questionId]: null }));
  };

  // Toggle criteria display
  const toggleCriteria = (qid: number) => {
    setShowCriteria((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    if (!studentId) return;

    try {
      await markStudentAsGraded(examSlotRoomId, studentId, { totalScore });
      showToast("success", "Đã chuyển trạng thái chấm bài thành công!");
      router.back();
    } catch (err) {
      showToast("error", "Lỗi khi cập nhật trạng thái chấm bài!");
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Open confirmation popup
  const openConfirmPopup = () => {
    setShowConfirmPopup(true);
  };

  // Close confirmation popup
  const closeConfirmPopup = () => {
    setShowConfirmPopup(false);
  };

  return {
    // Data
    examDetail,
    scores,
    totalScore,
    showCriteria,
    loading,
    showConfirmPopup,
    suggesting,
    suggestResult,

    // Actions
    handleScoreChange,
    handleSuggestScore,
    handleApplySuggestScore,
    toggleCriteria,
    handleConfirm,
    handleBack,
    openConfirmPopup,
    closeConfirmPopup,

    // Utils
    getTotalMaxScore,
  };
};
