import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  StudentGradingDTO,
  getStudentsForGrading,
  markExamAsCompleted,
} from "@/services/teacher/midtermGradingService";

export const useMidtermGrading = (
  classId: string | null,
  examId: string | null,
  examType: string | null
) => {
  const router = useRouter();
  const teacherId = getUserIdFromToken();

  // State
  const [students, setStudents] = useState<StudentGradingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch students data
  useEffect(() => {
    if (!teacherId || !examId || !classId || !examType) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const studentsData = await getStudentsForGrading(
          teacherId,
          examId,
          classId,
          examType
        );
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [teacherId, examId, classId, examType]);

  // Statistics
  const totalStudents = students.length;
  const gradedStudents = students.filter((s) => s.isGraded === 1).length;
  const ungradedStudents = totalStudents - gradedStudents;
  const averageScore =
    gradedStudents > 0
      ? (
          students
            .filter((s) => s.isGraded === 1)
            .reduce((sum, s) => sum + (s.score || 0), 0) / gradedStudents
        ).toFixed(1)
      : "0";

  // Chuyển sang trang chấm bài cho sinh viên
  const handleGradeStudent = (studentId: string) => {
    router.push(
      `/teacher/midterm/givegrade/examofstudent?studentId=${studentId}&examId=${examId}&classId=${classId}&examType=${examType}`
    );
  };

  // Xác nhận hoàn thành chấm bài
  const handleConfirm = async () => {
    if (ungradedStudents > 0) {
      const confirmed = window.confirm(
        `Còn ${ungradedStudents} sinh viên chưa được chấm bài. Bạn có chắc chắn muốn hoàn thành chấm bài?`
      );
      if (!confirmed) return;
    }

    if (!examId) {
      alert("Không tìm thấy mã ca thi (pracExamId)!");
      return;
    }

    try {
      const result = await markExamAsCompleted(examId);
      if (result.success) {
        alert(result.message);
        router.back();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      alert("Lỗi khi cập nhật trạng thái chấm bài!");
    }
  };

  // Quay lại
  const handleBack = () => {
    router.back();
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    return totalStudents > 0
      ? Math.round((gradedStudents / totalStudents) * 100)
      : 0;
  };

  // Get status badge props
  const getStatusBadgeProps = (isGraded: number) => {
    if (isGraded === 1) {
      return {
        className:
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
        text: "Đã chấm",
        icon: "CheckCircle",
      };
    }
    return {
      className:
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800",
      text: "Chưa chấm",
      icon: "Clock",
    };
  };

  // Get action button props
  const getActionButtonProps = (student: StudentGradingDTO) => {
    if (student.isGraded === 0) {
      return {
        className:
          "inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200",
        text: "Chấm bài",
        icon: "Eye",
        onClick: () => handleGradeStudent(student.id),
      };
    }
    return {
      className:
        "inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm",
      text: "Hoàn thành",
      icon: "UserCheck",
      onClick: undefined,
    };
  };

  return {
    // State
    students,
    loading,
    totalStudents,
    gradedStudents,
    ungradedStudents,
    averageScore,

    // Functions
    handleGradeStudent,
    handleConfirm,
    handleBack,
    getProgressPercentage,
    getStatusBadgeProps,
    getActionButtonProps,
  };
};
