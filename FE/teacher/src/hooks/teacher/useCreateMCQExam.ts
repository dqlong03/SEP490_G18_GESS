import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { showToast } from "@/utils/toastUtils";
import {
  createMCQExamService,
  GradeComponent,
  Chapter,
  Student,
  QuestionConfig,
  CreateMCQExamRequest,
} from "@/services/teacher/createMCQExamService";

export const useCreateMCQExam = (classId: number) => {
  const router = useRouter();

  // State
  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] =
    useState<GradeComponent | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [chapterChecks, setChapterChecks] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [chapterQuestions, setChapterQuestions] = useState<
    Record<number, QuestionConfig>
  >({});
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [questionInput, setQuestionInput] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(true);
  const [questionBankType, setQuestionBankType] = useState<
    "all" | "common" | "private"
  >("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        setTeacherId(getUserIdFromToken() || "");

        const classData = await createMCQExamService.loadClassData(classId);

        setSemesterId(classData.semesterId);
        setGradeComponents(classData.gradeComponents);
        setChapters(classData.chapters);
        setStudents(classData.students);
        setSubjectId(classData.subjectId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load class data";
        setError(errorMessage);
        showToast("error", errorMessage);
        console.error("Error initializing data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      initializeData();
    }
  }, [classId]);

  // Calculate total questions
  const totalQuestions = Object.values(chapterQuestions).reduce(
    (sum, q) => sum + (q.easy || 0) + (q.medium || 0) + (q.hard || 0),
    0
  );

  // Fetch question count for a specific chapter and level
  const fetchQuestionCount = async (
    chapterId: number,
    level: "easy" | "medium" | "hard"
  ): Promise<number> => {
    return await createMCQExamService.getQuestionCount(
      chapterId,
      level,
      questionBankType,
      teacherId
    );
  };

  // Update chapter max questions when question bank type changes
  const updateChapterMaxQuestions = async () => {
    try {
      const newChapterQuestions: Record<number, QuestionConfig> = {
        ...chapterQuestions,
      };

      for (const chap of selectedChapters) {
        const [easy, medium, hard] = await Promise.all([
          fetchQuestionCount(chap.chapterId, "easy"),
          fetchQuestionCount(chap.chapterId, "medium"),
          fetchQuestionCount(chap.chapterId, "hard"),
        ]);

        newChapterQuestions[chap.chapterId] = {
          ...newChapterQuestions[chap.chapterId],
          max: { easy, medium, hard },
          easy: Math.min(newChapterQuestions[chap.chapterId]?.easy ?? 0, easy),
          medium: Math.min(
            newChapterQuestions[chap.chapterId]?.medium ?? 0,
            medium
          ),
          hard: Math.min(newChapterQuestions[chap.chapterId]?.hard ?? 0, hard),
        };
      }

      setChapterQuestions(newChapterQuestions);
    } catch (err) {
      const errorMessage = "Lỗi khi tải số lượng câu hỏi theo chương";
      showToast("error", errorMessage);
      console.error("Error updating chapter max questions:", err);
    }
  };

  // Update max questions when selected chapters or question bank type changes
  useEffect(() => {
    if (selectedChapters.length > 0) {
      updateChapterMaxQuestions();
    }
  }, [selectedChapters, questionBankType]);

  // Chapter management
  const handleSaveChapters = async () => {
    try {
      const chaptersSelected = chapters.filter(
        (chap) => chapterChecks[chap.chapterId]
      );
      const newChapterQuestions: Record<number, QuestionConfig> = {
        ...chapterQuestions,
      };

      for (const chap of chaptersSelected) {
        if (!newChapterQuestions[chap.chapterId]) {
          const [easy, medium, hard] = await Promise.all([
            fetchQuestionCount(chap.chapterId, "easy"),
            fetchQuestionCount(chap.chapterId, "medium"),
            fetchQuestionCount(chap.chapterId, "hard"),
          ]);

          newChapterQuestions[chap.chapterId] = {
            easy: 0,
            medium: 0,
            hard: 0,
            max: { easy, medium, hard },
          };
        }
      }

      setSelectedChapters([
        ...selectedChapters,
        ...chaptersSelected.filter(
          (chap) =>
            !selectedChapters.some(
              (selected) => selected.chapterId === chap.chapterId
            )
        ),
      ]);

      setChapterQuestions(newChapterQuestions);
      setShowChapterPopup(false);
      setChapterChecks({});
    } catch (err) {
      const errorMessage = "Lỗi khi lưu chương đã chọn";
      showToast("error", errorMessage);
      console.error("Error saving chapters:", err);
    }
  };

  const handleRemoveChapter = (id: number) => {
    setSelectedChapters((prev) => prev.filter((c) => c.chapterId !== id));
    setChapterQuestions((prev) => {
      const newQ = { ...prev };
      delete newQ[id];
      return newQ;
    });
    setChapterChecks((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const handleChangeQuestionCount = (
    chapterId: number,
    type: "easy" | "medium" | "hard",
    value: number
  ) => {
    setChapterQuestions((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [type]: Math.max(0, Math.min(value, prev[chapterId].max[type])),
        max: prev[chapterId].max,
      },
    }));
  };

  const handleCheckAllChapters = () => {
    const allChecked: Record<number, boolean> = {};
    chapters
      .filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      )
      .forEach((chap: Chapter) => {
        allChecked[chap.chapterId] = true;
      });
    setChapterChecks(allChecked);
  };

  const handleUncheckAllChapters = () => {
    setChapterChecks({});
  };

  // Student management
  const handleOpenStudentPopup = () => {
    setShowStudentPopup(true);
  };

  const handleCheckStudent = (id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllStudents = () => {
    const allChecked: Record<string, boolean> = {};
    students.forEach((sv: Student) => {
      allChecked[sv.studentId] = true;
    });
    setStudentChecks(allChecked);
  };

  const handleUncheckAllStudents = () => {
    setStudentChecks({});
  };

  const handleConfirmStudents = () => {
    setSelectedStudents(students.filter((sv) => studentChecks[sv.studentId]));
    setShowStudentPopup(false);
  };

  // Form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !examName ||
      !selectedGradeComponent ||
      !startDate ||
      !endDate ||
      !duration ||
      !semesterId ||
      !teacherId
    ) {
      const errorMessage = "Vui lòng nhập đầy đủ thông tin bắt buộc!";
      setError(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    if (selectedStudents.length === 0) {
      const errorMessage = "Vui lòng chọn ít nhất 1 sinh viên!";
      setError(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    if (questionInput > 0 && totalQuestions !== questionInput) {
      const errorMessage = "Tổng số câu đã chọn phải bằng số câu hỏi yêu cầu!";
      setError(errorMessage);
      showToast("error", errorMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Determine isPublish based on questionBankType
      let finalIsPublish: boolean | undefined;
      if (questionBankType === "common") {
        finalIsPublish = true;
      } else if (questionBankType === "private") {
        finalIsPublish = false;
      }
      // If questionBankType is "all", don't include isPublish (undefined)

      const payload: CreateMCQExamRequest = {
        MultiExamName: examName,
        NumberQuestion: totalQuestions,
        Duration: duration,
        StartDay: startDate,
        EndDay: endDate,
        CreateAt: new Date().toISOString(),
        teacherId,
        subjectId,
        classId,
        categoryExamId: selectedGradeComponent.value,
        semesterId,
        ...(finalIsPublish !== undefined && { isPublish: finalIsPublish }),
        // questionBankType,
        noQuestionInChapterDTO:
          createMCQExamService.buildNoQuestionInChapterDTO(
            selectedChapters,
            chapterQuestions
          ),
        studentExamDTO:
          createMCQExamService.buildStudentExamDTO(selectedStudents),
      };

      await createMCQExamService.createMCQExam(payload);

      // Success - navigate back
      showToast("success", "Tạo bài kiểm tra thành công!");
      router.push(`/teacher/myclass/classdetail/${classId.toString()}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Tạo bài kiểm tra thất bại!";
      setError(errorMessage);
      showToast("error", errorMessage);
      console.error("Error creating exam:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation
  const handleBack = () => {
    router.back();
  };

  // React-select styles
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "48px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      borderRadius: "8px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 20,
      borderRadius: "8px",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? "#eff6ff"
          : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
  };

  return {
    // State
    examName,
    duration,
    startDate,
    endDate,
    gradeComponents,
    selectedGradeComponent,
    chapters,
    showChapterPopup,
    chapterChecks,
    selectedChapters,
    chapterQuestions,
    students,
    showStudentPopup,
    studentChecks,
    selectedStudents,
    questionInput,
    isPublic,
    questionBankType,
    isSubmitting,
    loading,
    error,
    totalQuestions,

    // Setters
    setExamName,
    setDuration,
    setStartDate,
    setEndDate,
    setSelectedGradeComponent,
    setShowChapterPopup,
    setChapterChecks,
    setShowStudentPopup,
    setQuestionInput,
    setIsPublic,
    setQuestionBankType,

    // Functions
    handleSaveChapters,
    handleRemoveChapter,
    handleChangeQuestionCount,
    handleCheckAllChapters,
    handleUncheckAllChapters,
    handleOpenStudentPopup,
    handleCheckStudent,
    handleCheckAllStudents,
    handleUncheckAllStudents,
    handleConfirmStudents,
    handleSave,
    handleBack,
    selectStyles,
  };
};
