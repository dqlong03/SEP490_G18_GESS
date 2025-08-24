// Service cho trang chi tiết phòng thi chấm bài

export interface StudentGradingDTO {
  practiceExamHistoryId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  isGraded: number;
  score: number | null;
}

export interface ExamSlotRoomGradingInfoDTO {
  examSlotRoomId: number;
  examName: string;
  duration: number;
  startDay: string;
  slotName: string;
  subjectName: string;
  students: StudentGradingDTO[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

// Lấy thông tin chi tiết phòng thi để chấm bài
export const getExamGradingInfo = async (
  examId: number
): Promise<ExamSlotRoomGradingInfoDTO | null> => {
  try {
    const response = await fetch(
      `${API_URL}/api/GradeSchedule/examslotroom/${examId}/grading-info`
    );
    if (!response.ok) {
      return null;
    }
    const data: ExamSlotRoomGradingInfoDTO = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching exam grading info:", error);
    return null;
  }
};

// Đánh dấu phòng thi đã hoàn thành chấm bài
export const markExamRoomAsGraded = async (
  examId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${API_URL}/api/GradeSchedule/examslotroom/${examId}/mark-graded`,
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
      message: "Đã chuyển trạng thái chấm bài thành công cho ca/phòng thi!",
    };
  } catch (error) {
    console.error("Error marking exam room as graded:", error);
    return {
      success: false,
      message: "Lỗi khi cập nhật trạng thái chấm bài!",
    };
  }
};
