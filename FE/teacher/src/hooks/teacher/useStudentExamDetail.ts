import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  studentExamDetailService,
  StudentExamDetail,
  QuestionDTO,
  SuggestResult,
} from "@/services/teacher/studentExamDetailService";

export const useStudentExamDetail = (
  examId: string | null,
  studentId: string | null,
  examType: string = "2"
) => {
  const router = useRouter();
  const teacherId = getUserIdFromToken();

  // State
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

  // Tải dữ liệu bài thi
  useEffect(() => {
    async function fetchExamDetail() {
      if (!teacherId || !examId || !studentId) return;

      setLoading(true);
      try {
        const data = await studentExamDetailService.getStudentExamDetail(
          teacherId,
          examId,
          studentId,
          examType
        );

        if (data) {
          setExamDetail(data);

          // Khởi tạo scores và tính tổng điểm ban đầu
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
        }
      } catch (error) {
        console.error("Error loading exam detail:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchExamDetail();
  }, [teacherId, examId, studentId, examType]);

  // Tính toán tổng điểm từ các câu hỏi
  const calculateTotalFromQuestions = () => {
    return Object.values(scores).reduce((total: number, score) => {
      return total + (typeof score === "number" ? score : 0);
    }, 0);
  };

  // Cập nhật tổng điểm khi scores thay đổi
  useEffect(() => {
    const calculated = calculateTotalFromQuestions();
    setTotalScore(calculated);
  }, [scores]);

  // Tính tổng maxScore của tất cả câu hỏi
  const getTotalMaxScore = () => {
    if (!examDetail) return 0;
    return examDetail.questions.reduce(
      (total, q) => total + (q.maxScore || 10),
      0
    );
  };

  // Xử lý thay đổi điểm
  const handleScoreChange = async (qid: number, value: number | "") => {
    setScores((prev) => ({ ...prev, [qid]: value }));

    if (
      teacherId &&
      examDetail &&
      examDetail.pracExamId &&
      value !== "" &&
      examDetail.questions
    ) {
      const question = examDetail.questions.find((q) => q.questionId === qid);
      if (!question) return;

      try {
        await studentExamDetailService.updateQuestionScore(
          teacherId,
          examId,
          studentId,
          {
            practiceExamHistoryId: question.practiceExamHistoryId,
            practiceQuestionId: question.practiceQuestionId,
            gradedScore: value as number,
          }
        );
      } catch (error) {
        // Error handling is done in service
      }
    }
  };

  // Xử lý gợi ý chấm điểm từ AI
  const handleSuggestScore = async (q: QuestionDTO) => {
    setSuggesting((prev) => ({ ...prev, [q.questionId]: true }));
    setSuggestResult((prev) => ({ ...prev, [q.questionId]: null }));

    try {
      const result = await studentExamDetailService.getSuggestedScore(q);
      setSuggestResult((prev) => ({ ...prev, [q.questionId]: result }));
    } catch (error) {
      setSuggestResult((prev) => ({ ...prev, [q.questionId]: null }));
    } finally {
      setSuggesting((prev) => ({ ...prev, [q.questionId]: false }));
    }
  };

  // Áp dụng điểm gợi ý
  const handleApplySuggestScore = async (q: QuestionDTO, score: number) => {
    await handleScoreChange(q.questionId, score);
    setScores((prev) => ({ ...prev, [q.questionId]: score }));
    setSuggestResult((prev) => ({ ...prev, [q.questionId]: null }));
  };

  // Hoàn thành chấm bài
  const handleConfirm = async () => {
    try {
      await studentExamDetailService.completeGrading(
        examId,
        studentId,
        totalScore
      );
      router.back();
    } catch (error) {
      // Error handling is done in service
    }
  };

  // Đếm số câu đã chấm
  const getGradedQuestionsCount = () => {
    return Object.values(scores).filter((score) => score !== "").length;
  };

  // Toggle hiển thị tiêu chí chấm điểm
  const toggleCriteria = (qid: number) => {
    setShowCriteria((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  // Quay lại trang trước
  const handleBack = () => {
    router.back();
  };

  // Toggle popup xác nhận
  const toggleConfirmPopup = (show: boolean) => {
    setShowConfirmPopup(show);
  };

  // Tạo quick score buttons
  const getQuickScoreButtons = (maxScore: number) => {
    return [
      0,
      Math.round(maxScore * 0.5),
      Math.round(maxScore * 0.8),
      maxScore,
    ];
  };

  return {
    // State
    examDetail,
    scores,
    totalScore,
    showCriteria,
    loading,
    showConfirmPopup,
    suggesting,
    suggestResult,

    // Computed values
    gradedQuestionsCount: getGradedQuestionsCount(),
    totalMaxScore: getTotalMaxScore(),
    calculatedTotal: calculateTotalFromQuestions(),

    // Functions
    handleScoreChange,
    handleSuggestScore,
    handleApplySuggestScore,
    handleConfirm,
    handleBack,
    toggleCriteria,
    toggleConfirmPopup,
    getQuickScoreButtons,
    setTotalScore,
  };
};
