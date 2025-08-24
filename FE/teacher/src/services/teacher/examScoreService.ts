export interface ExamScore {
  studentId: string;
  fullName: string;
  score: number | null;
  code: string;
}

export interface ExamInfo {
  examName: string;
  className: string;
}

export interface ScoreStats {
  avg: string;
  max: number;
  min: number;
  passCount: number;
  totalStudents: number;
  passRate: number;
}

export interface ExamScoreParams {
  examId: string;
  examType: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export const examScoreService = {
  // Get exam scores
  async getExamScores(params: ExamScoreParams): Promise<ExamScore[]> {
    try {
      const response = await fetch(
        `${API_BASE}/Class/exam-scores?examId=${params.examId}&examType=${params.examType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exam scores: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching exam scores:", error);
      throw error;
    }
  },

  // Get exam information (placeholder for future API)
  async getExamInfo(examId: string): Promise<ExamInfo> {
    try {
      // TODO: Replace with actual API call when available
      // const response = await fetch(`${API_BASE}/Exam/${examId}/info`);
      // const data = await response.json();

      // Placeholder data
      return {
        examName: "Bài kiểm tra",
        className: "Lớp học",
      };
    } catch (error) {
      console.error("Error fetching exam info:", error);
      return {
        examName: "Bài kiểm tra",
        className: "Lớp học",
      };
    }
  },

  // Calculate score statistics
  calculateStats(scores: ExamScore[]): ScoreStats {
    const validScores = scores
      .filter((s) => s.score !== null)
      .map((s) => s.score!);
    const totalStudents = scores.length;

    if (validScores.length === 0) {
      return {
        avg: "0",
        max: 0,
        min: 0,
        passCount: 0,
        totalStudents,
        passRate: 0,
      };
    }

    const avg =
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    const max = Math.max(...validScores);
    const min = Math.min(...validScores);
    const passCount = validScores.filter((score) => score >= 5).length;
    const passRate =
      totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0;

    return {
      avg: avg.toFixed(1),
      max,
      min,
      passCount,
      totalStudents,
      passRate,
    };
  },

  // Get score badge class based on score
  getScoreBadgeClass(score: number | null): string {
    if (score === null) {
      return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600";
    }

    if (score >= 8) {
      return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800";
    } else if (score >= 6.5) {
      return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800";
    } else if (score >= 5) {
      return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800";
    } else {
      return "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800";
    }
  },

  // Get score display text
  getScoreText(score: number | null): string {
    return score === null ? "Chưa có điểm" : score.toString();
  },

  // Export to Excel (placeholder)
  async exportToExcel(scores: ExamScore[], examInfo: ExamInfo): Promise<void> {
    try {
      // TODO: Implement Excel export functionality
      console.log("Exporting scores to Excel:", { scores, examInfo });
      // This would typically create and download an Excel file
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw error;
    }
  },

  // Print scores (placeholder)
  async printScores(scores: ExamScore[], examInfo: ExamInfo): Promise<void> {
    try {
      // TODO: Implement print functionality
      console.log("Printing scores:", { scores, examInfo });
      // This would typically open a print dialog
      window.print();
    } catch (error) {
      console.error("Error printing scores:", error);
      throw error;
    }
  },
};
