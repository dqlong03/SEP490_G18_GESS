// useCreatePracticeExamForClass.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createPracticeExamService,
  PracticeExamPaperDTO,
  SemesterDTO,
  ExamPaperDetail,
  Student,
  SelectOption,
  YearOption,
  ClassData,
} from "@/services/teacher/createPracticeExamService";
import { showToast } from "@/utils/toastUtils";

export const useCreatePracticeExamForClass = (classId: number) => {
  const router = useRouter();

  // Basic form state
  const [examName, setExamName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Class data state
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeComponents, setGradeComponents] = useState<SelectOption[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] =
    useState<SelectOption | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // Student selection state
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  // Exam paper selection state
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [examChecks, setExamChecks] = useState<Record<number, boolean>>({});
  const [examPapers, setExamPapers] = useState<PracticeExamPaperDTO[]>([]);
  const [selectedExams, setSelectedExams] = useState<PracticeExamPaperDTO[]>(
    []
  );
  const [loadingExams, setLoadingExams] = useState(false);

  // Semester and year state
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );
  const [years, setYears] = useState<YearOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  // Detail modal state
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Preview state (for hover in popup)
  const [hoveredExam, setHoveredExam] = useState<PracticeExamPaperDTO | null>(
    null
  );
  const [previewPosition, setPreviewPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load class data on mount
  useEffect(() => {
    if (!classId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: ClassData =
          await createPracticeExamService.loadClassData(classId);

        setStudents(data.students);
        setGradeComponents(data.gradeComponents);
        setSubjectId(data.subjectId);
        setSemesterId(data.semesterId);
        setSemesters(data.semesters);
        setYears(data.years);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu lớp học");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  // Fetch exam papers when popup opens or filters change
  const fetchExamPapers = useCallback(
    async (semesterName: string | null, year: string | null) => {
      if (!subjectId || !selectedGradeComponent) return;

      setLoadingExams(true);
      try {
        const filtered = await createPracticeExamService.getExamPapers(
          subjectId,
          selectedGradeComponent.value,
          semesterName,
          year,
          selectedExams,
          semesters,
          years
        );
        setExamPapers(filtered);
      } catch (err: any) {
        setExamPapers([]);
        showToast("error", err.message || "Lỗi lấy danh sách đề thi");
      } finally {
        setLoadingExams(false);
      }
    },
    [subjectId, selectedGradeComponent, selectedExams, semesters, years]
  );

  // Effect to fetch exam papers when dependencies change
  useEffect(() => {
    if (showExamPopup) {
      fetchExamPapers(
        selectedSemester?.label ?? null,
        selectedYear?.value ?? null
      );
    }
  }, [showExamPopup, selectedSemester, selectedYear, fetchExamPapers]);

  // Student popup handlers
  const handleOpenStudentPopup = useCallback(() => {
    setShowStudentPopup(true);
  }, []);

  const handleCheckStudent = useCallback((id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const handleCheckAllStudents = useCallback(() => {
    const allChecks = createPracticeExamService.utils.generateStudentChecks(
      students,
      true
    );
    setStudentChecks(allChecks);
  }, [students]);

  const handleUncheckAllStudents = useCallback(() => {
    setStudentChecks({});
  }, []);

  const handleConfirmStudents = useCallback(() => {
    const selected =
      createPracticeExamService.utils.getSelectedStudentsFromChecks(
        students,
        studentChecks
      );
    setSelectedStudents(selected);
    setShowStudentPopup(false);
  }, [students, studentChecks]);

  // Exam popup handlers
  const handleOpenExamPopup = useCallback(() => {
    setExamChecks({});
    setShowExamPopup(true);
    setSelectedSemester(null);
    setSelectedYear(null);
    setExamPapers([]);
  }, []);

  const handleCheckExam = useCallback((id: number, checked: boolean) => {
    setExamChecks((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const handleCheckAllExams = useCallback(() => {
    const allChecks = createPracticeExamService.utils.generateExamChecks(
      examPapers,
      true
    );
    setExamChecks(allChecks);
  }, [examPapers]);

  const handleUncheckAllExams = useCallback(() => {
    setExamChecks({});
  }, []);

  const handleSaveExams = useCallback(() => {
    const selected = createPracticeExamService.utils.getSelectedExamsFromChecks(
      examPapers,
      examChecks
    );
    setSelectedExams((prev) => [...prev, ...selected]);
    setShowExamPopup(false);
  }, [examPapers, examChecks]);

  const handleRemoveExam = useCallback((id: number) => {
    setSelectedExams((prev) => prev.filter((c) => c.pracExamPaperId !== id));
  }, []);

  // Detail modal handlers
  const handleShowDetail = useCallback(async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const data =
        await createPracticeExamService.getExamPaperDetail(examPaperId);
      setDetailData(data);
    } catch (err: any) {
      setDetailData(null);
      showToast("error", err.message || "Lỗi lấy chi tiết đề thi");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setDetailData(null);
  }, []);

  // Preview handlers
  const handleMouseEnterExam = useCallback(
    async (exam: PracticeExamPaperDTO, e: React.MouseEvent) => {
      setPreviewPosition({ x: e.clientX, y: e.clientY });
      setHoveredExam(exam);
      setLoadingDetail(true);
      try {
        const data = await createPracticeExamService.getExamPaperDetail(
          exam.pracExamPaperId
        );
        setDetailData(data);
      } catch {
        setDetailData(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    []
  );

  const handleMouseLeaveExam = useCallback(() => {
    setHoveredExam(null);
    setPreviewPosition(null);
    setDetailData(null);
  }, []);

  // Form submission
  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation
      if (!subjectId) {
        showToast("error", "Không lấy được subjectId");
        return;
      }
      if (!selectedGradeComponent) {
        showToast("error", "Vui lòng chọn đầu điểm");
        return;
      }
      if (
        !examName ||
        !startDate ||
        !endDate ||
        !duration ||
        !selectedExams.length ||
        !selectedStudents.length
      ) {
        showToast("error", "Vui lòng nhập đầy đủ thông tin");
        return;
      }
      if (selectedStudents.length === 0) {
        showToast("error", "Vui lòng chọn ít nhất 1 sinh viên!");
        return;
      }

      setIsSubmitting(true);
      try {
        const payload =
          createPracticeExamService.utils.buildPracticeExamPayload(
            examName,
            duration,
            startDate,
            endDate,
            selectedGradeComponent,
            subjectId,
            classId,
            semesterId!,
            selectedExams,
            selectedStudents
          );

        await createPracticeExamService.createPracticeExam(payload);
        showToast("success", "Tạo bài kiểm tra thành công!");
        router.push(`/teacher/myclass/classdetail/${classId.toString()}`);
      } catch (err: any) {
        showToast(
          "error",
          err.message ||
            "Thời gian bắt đầu nhỏ hơn thời gian kết thúc, trong khoảng thời lượng bài"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      examName,
      startDate,
      endDate,
      duration,
      selectedExams,
      selectedStudents,
      subjectId,
      selectedGradeComponent,
      classId,
      semesterId,
      router,
    ]
  );

  // Navigation handler
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Create new exam paper handler
  const handleCreateNewExamPaper = useCallback(() => {
    router.push(
      `/teacher/myexampaper/createexampaper/${classId}?semesterId=${semesterId}`
    );
  }, [router, classId, semesterId]);

  // Custom styles for react-select
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

  // Computed values
  const totalQuestions = selectedExams.length;

  return {
    // Basic state
    examName,
    setExamName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    duration,
    setDuration,
    loading,
    error,

    // Class data
    students,
    gradeComponents,
    selectedGradeComponent,
    setSelectedGradeComponent,
    subjectId,
    semesterId,

    // Student selection
    showStudentPopup,
    setShowStudentPopup,
    studentChecks,
    selectedStudents,
    handleOpenStudentPopup,
    handleCheckStudent,
    handleCheckAllStudents,
    handleUncheckAllStudents,
    handleConfirmStudents,

    // Exam selection
    showExamPopup,
    setShowExamPopup,
    examChecks,
    examPapers,
    selectedExams,
    loadingExams,
    handleOpenExamPopup,
    handleCheckExam,
    handleCheckAllExams,
    handleUncheckAllExams,
    handleSaveExams,
    handleRemoveExam,

    // Semester and year
    semesters,
    selectedSemester,
    setSelectedSemester,
    years,
    selectedYear,
    setSelectedYear,

    // Detail modal
    showDetail,
    detailData,
    loadingDetail,
    handleShowDetail,
    handleCloseDetail,

    // Preview
    hoveredExam,
    previewPosition,
    handleMouseEnterExam,
    handleMouseLeaveExam,

    // Form submission
    isSubmitting,
    handleSave,

    // Navigation
    handleBack,
    handleCreateNewExamPaper,

    // Utilities
    selectStyles,
    totalQuestions,
    parseGradingCriteria: createPracticeExamService.utils.parseGradingCriteria,
  };
};
