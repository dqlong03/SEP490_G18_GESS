import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { create } from "zustand";
import useSWR, { mutate } from "swr";
import {
  scoreService,
  CategoryExamSubjectDTO,
  CategoryExamType,
  SubjectBasicDTO,
  ScoreFormData,
} from "@services/examination/manageScoreService";

// Zustand store
interface ScoreState {
  scores: CategoryExamSubjectDTO[];
  isPopupOpen: boolean;
  selectedScore: CategoryExamSubjectDTO | null;
  setScores: (s: CategoryExamSubjectDTO[]) => void;
  setIsPopupOpen: (b: boolean) => void;
  setSelectedScore: (s: CategoryExamSubjectDTO | null) => void;
}

const useScoreStore = create<ScoreState>((set) => ({
  scores: [],
  isPopupOpen: false,
  selectedScore: null,
  setScores: (s) => set({ scores: s }),
  setIsPopupOpen: (b) => set({ isPopupOpen: b }),
  setSelectedScore: (s) => set({ selectedScore: s }),
}));

export const useManageScore = () => {
  const {
    scores,
    isPopupOpen,
    selectedScore,
    setScores,
    setIsPopupOpen,
    setSelectedScore,
  } = useScoreStore();

  const [subjectId, setSubjectId] = useState<string>("");

  const { register, handleSubmit, reset, setValue } = useForm<ScoreFormData>({
    defaultValues: { GradeComponent: "0.0" },
  });

  // Lấy subjectId từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("subjectId");
    if (id) setSubjectId(id);
    else {
      toast.error("Không tìm thấy subjectId từ URL");
      setSubjectId("");
    }
  }, []);

  // Fetch subject info
  const { data: subjectInfo, error: subjectInfoError } =
    useSWR<SubjectBasicDTO>(subjectId ? `subject-${subjectId}` : null, () =>
      scoreService.getSubjectInfo(subjectId)
    );

  // Fetch exam types
  const { data: examTypes = [], error: examTypesError } = useSWR<
    CategoryExamType[]
  >("exam-types", scoreService.getExamTypes);

  // Fetch scores
  const { data, error } = useSWR<CategoryExamSubjectDTO[]>(
    subjectId ? `scores-${subjectId}` : null,
    () => scoreService.getScoresBySubject(subjectId)
  );

  // Update scores when data changes
  useEffect(() => {
    console.log("Fetched scores:", data);
    if (data && Array.isArray(data)) {
      setScores(
        data.map((item) => ({
          ...item,
          GradeComponent: Number(item.gradeComponent),
        }))
      );
    } else {
      setScores([]);
    }
  }, [data, setScores]);

  // Handle errors
  useEffect(() => {
    if (examTypesError)
      toast.error("Lỗi load exam types: " + (examTypesError as Error).message);
  }, [examTypesError]);

  // Mutate function
  const mutateScores = () => mutate(`scores-${subjectId}`);

  // Handle add score
  const handleAddScore: SubmitHandler<ScoreFormData> = async (d) => {
    // Check if score already exists
    const existingScore = scores.find(
      (s) =>
        s.subjectId === Number(subjectId) &&
        s.categoryExamId === Number(d.CategoryExamId)
    );

    if (existingScore) {
      toast.error("Đầu điểm đã có, không thể thêm");
      return;
    }

    // Validate total percentage
    const newGradeComponent = parseFloat(d.GradeComponent.toString());
    const currentTotal = scores.reduce(
      (sum, score) => sum + (score.gradeComponent || 0),
      0
    );
    const newTotal = currentTotal + newGradeComponent;

    if (newTotal > 100) {
      toast.error(
        `Tổng các đầu điểm phải nhỏ hơn 100%. Hiện tại: ${currentTotal.toFixed(1)}%, thêm ${newGradeComponent}% sẽ thành ${newTotal.toFixed(1)}%`
      );
      return;
    }

    try {
      await scoreService.createScore(d, subjectId);
      mutateScores();
      setIsPopupOpen(false);
      reset();
      toast.success("Đã thêm điểm mới thành công!");
    } catch (err: any) {
      if (
        err.message?.includes("already exists") ||
        err.message?.includes("đã tồn tại")
      ) {
        toast.error("Đầu điểm đã có, không thể thêm");
      } else {
        toast.error("Lỗi khi thêm điểm: " + (err.message || "Có lỗi xảy ra"));
      }
    }
  };

  // Handle edit score
  const handleEditScore: SubmitHandler<ScoreFormData> = async (d) => {
    if (!selectedScore) return;

    // Validate grade component > 0
    const newGradeComponent = parseFloat(d.GradeComponent.toString());
    if (newGradeComponent <= 0) {
      toast.error("Đầu điểm phải lớn hơn 0");
      return;
    }

    // Validate total percentage
    const currentTotal = scores.reduce(
      (sum, score) => sum + (score.gradeComponent || 0),
      0
    );
    const newTotal =
      currentTotal - selectedScore.gradeComponent + newGradeComponent;

    if (newTotal > 100) {
      toast.error(
        `Tổng các đầu điểm phải nhỏ hơn 100%. Tổng mới sẽ là: ${newTotal.toFixed(1)}%`
      );
      return;
    }

    try {
      await scoreService.updateScore(
        d,
        selectedScore.categoryExamId,
        subjectId
      );
      mutateScores();
      setSelectedScore(null);
      setIsPopupOpen(false);
      reset();
      toast.success("Đã cập nhật điểm thành công!");
    } catch (err: any) {
      if (
        err.message?.includes("not found") ||
        err.message?.includes("không tìm thấy")
      ) {
        toast.error("Đầu điểm không có trong cơ sở dữ liệu");
      } else {
        toast.error("Lỗi khi cập nhật: " + (err.message || "Có lỗi xảy ra"));
      }
    }
  };

  // Handle delete score
  const handleDeleteScore = async (scoreId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa điểm này không?")) return;

    try {
      await scoreService.deleteScore(scoreId);
      mutateScores();
      setSelectedScore(null);
      setIsPopupOpen(false);
      reset();
      toast.success("Đã xóa điểm thành công!");
    } catch (err: any) {
      if (
        err.message?.includes("not found") ||
        err.message?.includes("không tìm thấy")
      ) {
        toast.error("Đầu điểm không có trong cơ sở dữ liệu");
      } else {
        toast.error("Lỗi khi xóa: " + (err.message || "Có lỗi xảy ra"));
      }
    }
  };

  // Open edit popup
  const openEditPopup = (score: CategoryExamSubjectDTO) => {
    setSelectedScore(score);
    setValue("CategoryExamId", score.categoryExamId);
    setValue("GradeComponent", score.gradeComponent.toString());
    setValue("SubjectId", score.subjectId);
    setValue("IsDelete", score.isDelete);
    setIsPopupOpen(true);
  };

  // Open create popup
  const openCreatePopup = () => {
    setSelectedScore(null);
    reset({ GradeComponent: "0.0" });
    setIsPopupOpen(true);
  };

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedScore(null);
    reset();
  };

  return {
    // Data
    scores,
    selectedScore,
    subjectInfo,
    examTypes,
    subjectId,

    // UI State
    isPopupOpen,

    // Form
    register,
    handleSubmit,

    // Actions
    handleAddScore,
    handleEditScore,
    handleDeleteScore,
    openEditPopup,
    openCreatePopup,
    closePopup,

    // Loading states
    isLoadingSubject: !subjectInfo && !subjectInfoError,
    isLoadingScores: !data && !error,
    isLoadingExamTypes: !examTypes && !examTypesError,
  };
};
