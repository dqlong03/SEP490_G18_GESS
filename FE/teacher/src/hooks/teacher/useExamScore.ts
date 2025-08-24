import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ExamScore,
  ExamInfo,
  ScoreStats,
  ExamScoreParams,
  examScoreService,
} from "@/services/teacher/examScoreService";

export const useExamScore = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters
  const classId = searchParams.get("classId");
  const examId = searchParams.get("examId");
  const examType = searchParams.get("examType");

  // State management
  const [scores, setScores] = useState<ExamScore[]>([]);
  const [examInfo, setExamInfo] = useState<ExamInfo>({
    examName: "",
    className: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exam scores and info
  useEffect(() => {
    const loadExamData = async () => {
      if (!examId || !examType) {
        setError("Missing exam parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load scores and exam info in parallel
        const [scoresData, examInfoData] = await Promise.all([
          examScoreService.getExamScores({ examId, examType }),
          examScoreService.getExamInfo(examId),
        ]);

        setScores(scoresData);
        setExamInfo(examInfoData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể lấy dữ liệu điểm thi";
        setError(errorMessage);
        setScores([]);
        console.error("Error loading exam data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId, examType]);

  // Calculate statistics
  const stats: ScoreStats = examScoreService.calculateStats(scores);

  // Navigation handlers
  const handleGoBack = () => {
    router.back();
  };

  // Export handlers
  const handleExportToExcel = async () => {
    try {
      await examScoreService.exportToExcel(scores, examInfo);
    } catch (err) {
      setError("Không thể xuất file Excel");
      console.error("Error exporting to Excel:", err);
    }
  };

  const handlePrintScores = async () => {
    try {
      await examScoreService.printScores(scores, examInfo);
    } catch (err) {
      setError("Không thể in bảng điểm");
      console.error("Error printing scores:", err);
    }
  };

  // Utility functions
  const getScoreBadgeClass = (score: number | null): string => {
    return examScoreService.getScoreBadgeClass(score);
  };

  const getScoreText = (score: number | null): string => {
    return examScoreService.getScoreText(score);
  };

  const getStudentInitial = (fullName: string): string => {
    return fullName.charAt(0).toUpperCase();
  };

  // Validation
  const hasValidParams = Boolean(examId && examType);

  return {
    // Data
    scores,
    examInfo,
    stats,
    classId,
    examId,
    examType,

    // State
    loading,
    error,
    hasValidParams,

    // Actions
    handleGoBack,
    handleExportToExcel,
    handlePrintScores,

    // Utilities
    getScoreBadgeClass,
    getScoreText,
    getStudentInitial,
  };
};
