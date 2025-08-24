// Service cho trang chấm điểm giữa kỳ

export interface StudentGradingDTO {
  id: string;
  code: string;
  fullName: string;
  isGraded: number;
  score: number | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api/GradeScheduleMidTerm" ||
  "https://localhost:7074/api/GradeScheduleMidTerm";

// Lấy danh sách sinh viên để chấm điểm
export const getStudentsForGrading = async (
  teacherId: string,
  examId: string,
  classId: string,
  examType: string
): Promise<StudentGradingDTO[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/teacher/${teacherId}/exam/${examId}/students?classID=${classId}&ExamType=${examType}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching students for grading:", error);
    return [];
  }
};

// Đánh dấu hoàn thành chấm bài
export const markExamAsCompleted = async (
  pracExamId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/practice-exam/${pracExamId}/mark-graded`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const message = await response.text();
      return {
        success: false,
        message: message || "Không thể cập nhật trạng thái chấm bài!",
      };
    }

    return {
      success: true,
      message: "Đã chuyển trạng thái chấm bài thành công!",
    };
  } catch (error) {
    console.error("Error marking exam as completed:", error);
    return {
      success: false,
      message: "Lỗi khi cập nhật trạng thái chấm bài!",
    };
  }
};
