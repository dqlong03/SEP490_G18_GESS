import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ExamSlotRoomGradingInfoDTO,
  StudentGradingDTO,
  getExamGradingInfo,
  markExamRoomAsGraded,
} from "@/services/teacher/examGradingDetailService";

export const useExamGradingDetail = (examId: number, action: string | null) => {
  const router = useRouter();
  const [examInfo, setExamInfo] = useState<ExamSlotRoomGradingInfoDTO | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch exam info
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getExamGradingInfo(examId);
      setExamInfo(data);
      setLoading(false);
    };

    fetchData();
  }, [examId]);

  // Chuyển sang trang chấm bài cho sinh viên
  const handleGradeStudent = (studentId: string) => {
    if (action === "edit") {
      router.push(
        `/teacher/givegrade/examroom/${examId}/gradeexampaper?studentId=${studentId}&action=edit`
      );
    } else {
      router.push(
        `/teacher/givegrade/examroom/${examId}/gradeexampaper?studentId=${studentId}`
      );
    }
  };

  // Xác nhận chấm xong phòng thi
  const handleConfirm = async () => {
    const result = await markExamRoomAsGraded(examId);

    if (result.success) {
      alert(result.message);
      router.push("/teacher/givegrade");
    } else {
      alert(result.message);
    }

    setShowConfirmModal(false);
  };

  // Quay lại
  const handleBack = () => {
    router.push("/teacher/givegrade");
  };

  // Format ngày
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge props
  const getStatusBadgeProps = (isGraded: number) => {
    if (isGraded === 1) {
      return {
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800",
        text: "Đã chấm",
        dotClass: "w-2 h-2 bg-green-500 rounded-full mr-2",
      };
    }
    return {
      className:
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800",
      text: "Chưa chấm",
      dotClass: "w-2 h-2 bg-red-500 rounded-full mr-2",
    };
  };

  // Get progress stats
  const getProgressStats = () => {
    if (!examInfo?.students) return { total: 0, graded: 0, percentage: 0 };
    const total = examInfo.students.length;
    const graded = examInfo.students.filter((s) => s.isGraded === 1).length;
    const percentage = total > 0 ? Math.round((graded / total) * 100) : 0;
    return { total, graded, percentage };
  };

  // Kiểm tra và mở modal xác nhận
  const handleOpenConfirm = () => {
    if (!examInfo || !examInfo.students) {
      alert("Không có dữ liệu phòng thi để xác nhận.");
      return;
    }
    const totalStudents = examInfo.students.length;
    const gradedCount = examInfo.students.filter(
      (s) => s.isGraded === 1
    ).length;
    if (gradedCount !== totalStudents) {
      alert(
        `Còn ${totalStudents - gradedCount} bài chưa chấm. Vui lòng chấm hết trước khi xác nhận.`
      );
      return;
    }
    setShowConfirmModal(true);
  };

  return {
    examInfo,
    loading,
    showConfirmModal,
    setShowConfirmModal,
    handleGradeStudent,
    handleConfirm,
    handleBack,
    formatDate,
    getStatusBadgeProps,
    getProgressStats,
    handleOpenConfirm,
  };
};
