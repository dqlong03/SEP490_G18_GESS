// Service cho trang điểm danh giữa kỳ

export interface Student {
  id: string;
  code: string;
  fullName: string;
  avatarURL: string;
  isCheckedIn: number;
  statusExamHistory: string;
}

export interface MidtermExamInfo {
  pracExamId: number;
  examName: string;
  subjectName: string;
  duration: number;
  status: string;
  category: string;
  code: string;
  students: Student[];
}
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api/ExamineTheMidTermExam" ||
  "https://localhost:7074/api/ExamineTheMidTermExam";

// Mở ca thi
export const openExamSlot = async (
  examId: string,
  examType: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Opening exam slot...");
    const response = await fetch(
      `${API_BASE_URL}/changestatus?examId=${examId}&status=%C4%90ang%20m%E1%BB%9F%20ca&examType=${examType}`,
      { method: "POST" }
    );

    if (response.ok) {
      console.log("Exam slot opened successfully");
      return { success: true, message: "Exam slot opened successfully" };
    } else {
      console.error("Failed to open exam slot:", response.status);
      return {
        success: false,
        message: `Failed to open exam slot: ${response.status}`,
      };
    }
  } catch (error) {
    console.error("Error opening exam slot:", error);
    return { success: false, message: "Error opening exam slot" };
  }
};

// Lấy thông tin kỳ thi
export const fetchExamInfo = async (
  teacherId: string,
  examId: string,
  examType: string
): Promise<{ data: MidtermExamInfo | null; isClosed: boolean }> => {
  try {
    console.log("Fetching exam info...");
    const response = await fetch(
      `${API_BASE_URL}/slots/${teacherId}/${examId}?examType=${examType}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Exam info received:", data);

    // Nếu status là "Đã đóng ca" thì tự động quay lại
    if (data.status === "Đã đóng ca") {
      return { data: null, isClosed: true };
    }

    return { data, isClosed: false };
  } catch (error) {
    console.error("Error fetching exam info:", error);
    return { data: null, isClosed: false };
  }
};

// Refresh mã code
export const refreshCode = async (
  examId: string,
  examType: string
): Promise<{ success: boolean }> => {
  try {
    console.log("Refreshing code...");
    await fetch(
      `${API_BASE_URL}/refresh?examId=${examId}&examType=${examType}`,
      { method: "POST" }
    );
    console.log("Code refreshed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error refreshing code:", error);
    return { success: false };
  }
};

// Điểm danh sinh viên
export const checkStudentAttendance = async (
  examId: string,
  studentId: string,
  examType: string
): Promise<{ success: boolean }> => {
  try {
    await fetch(
      `${API_BASE_URL}/checkin?examId=${examId}&studentId=${studentId}&examType=${examType}`,
      { method: "POST" }
    );
    return { success: true };
  } catch (error) {
    console.error("Error checking attendance:", error);
    return { success: false };
  }
};

// Đóng ca thi
export const closeExamSlot = async (
  examId: string,
  examType: string
): Promise<{ success: boolean }> => {
  try {
    await fetch(
      `${API_BASE_URL}/changestatus?examId=${examId}&status=%C4%90%C3%A3%20%C4%91%C3%B3ng%20ca&examType=${examType}`,
      { method: "POST" }
    );
    return { success: true };
  } catch (error) {
    console.error("Error finishing exam:", error);
    return { success: false };
  }
};
