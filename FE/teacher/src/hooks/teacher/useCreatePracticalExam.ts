// useCreatePracticalExam.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createPracticalExamService,
  SubjectDTO,
  SemesterDTO,
  PracExamPaperDTO,
  ExamPaperDetail,
  SubjectOption,
  SemesterOption,
} from "../../services/teacher/createPracticalExamService";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import { showToast } from "../../utils/toastUtils";

export interface UseCreatePracticalExamReturn {
  // State
  examName: string;
  subjects: SubjectDTO[];
  selectedSubject: SubjectOption | null;
  semesters: SemesterDTO[];
  selectedSemester: SemesterOption | null;
  examPapers: PracExamPaperDTO[];
  selectedExams: PracExamPaperDTO[];
  examChecks: Record<number, boolean>;
  examDetails: Record<number, ExamPaperDetail>;

  // UI State
  showExamPopup: boolean;
  showDetail: boolean;
  detailData: ExamPaperDetail | null;
  hoveredExam: PracExamPaperDTO | null;
  previewPosition: { x: number; y: number } | null;

  // Loading states
  loadingExams: boolean;
  loadingDetail: boolean;
  isSubmitting: boolean;

  // Computed values
  totalQuestions: number;
  subjectOptions: SubjectOption[];
  semesterOptions: SemesterOption[];
  availableExamPapers: PracExamPaperDTO[];
  validationResult: { isValid: boolean; message?: string };

  // Handlers
  setExamName: (name: string) => void;
  setSelectedSubject: (subject: SubjectOption | null) => void;
  setSelectedSemester: (semester: SemesterOption | null) => void;
  setShowExamPopup: (show: boolean) => void;
  setShowDetail: (show: boolean) => void;

  // Exam selection handlers
  handleOpenExamPopup: () => void;
  handleCheckExam: (id: number, checked: boolean) => void;
  handleCheckAllExams: () => void;
  handleUncheckAllExams: () => void;
  handleSaveExams: () => void;
  handleRemoveExam: (id: number) => void;

  // Detail handlers
  handleShowDetail: (examPaperId: number) => void;
  handleCloseDetail: () => void;
  handleMouseEnterExam: (exam: PracExamPaperDTO, e: React.MouseEvent) => void;
  handleMouseLeaveExam: () => void;

  // Form submission
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useCreatePracticalExam = (): UseCreatePracticalExamReturn => {
  const router = useRouter();

  // Form state
  const [examName, setExamName] = useState("");
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption | null>(
    null
  );
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] =
    useState<SemesterOption | null>(null);

  // Exam state
  const [examPapers, setExamPapers] = useState<PracExamPaperDTO[]>([]);
  const [selectedExams, setSelectedExams] = useState<PracExamPaperDTO[]>([]);
  const [examChecks, setExamChecks] = useState<Record<number, boolean>>({});
  const [examDetails, setExamDetails] = useState<
    Record<number, ExamPaperDetail>
  >({});

  // UI state
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [hoveredExam, setHoveredExam] = useState<PracExamPaperDTO | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Loading states
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const teacherId = getUserIdFromToken();
        if (!teacherId) {
          showToast("error", "Không thể xác định giáo viên");
          router.push("/auth/login");
          return;
        }

        const [subjectsData, semestersData] = await Promise.all([
          createPracticalExamService.getSubjectsByTeacherId(teacherId),
          createPracticalExamService.getSemesters(),
        ]);

        setSubjects(subjectsData);
        setSemesters(semestersData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        showToast("error", "Không thể tải dữ liệu ban đầu");
      }
    };

    loadInitialData();
  }, [router]);

  // Fetch exam papers when popup opens
  const fetchExamPapers = useCallback(async () => {
    if (!selectedSubject || !selectedSemester) {
      showToast("error", "Vui lòng chọn môn học và học kỳ");
      return;
    }

    setLoadingExams(true);
    try {
      const exams = await createPracticalExamService.getExamPapers(
        selectedSubject.value,
        selectedSemester.value
      );

      const availableExams =
        createPracticalExamService.utils.filterAvailableExamPapers(
          exams,
          selectedExams
        );

      setExamPapers(availableExams);
    } catch (error) {
      console.error("Error fetching exam papers:", error);
      showToast("error", "Không thể tải danh sách đề thi");
      setExamPapers([]);
    } finally {
      setLoadingExams(false);
    }
  }, [selectedSubject, selectedSemester, selectedExams]);

  useEffect(() => {
    if (showExamPopup && selectedSubject && selectedSemester) {
      fetchExamPapers();
    }
  }, [showExamPopup, fetchExamPapers]);

  // Computed values
  const subjectOptions = useMemo(
    () => createPracticalExamService.utils.formatSubjectOptions(subjects),
    [subjects]
  );

  const semesterOptions = useMemo(
    () => createPracticalExamService.utils.formatSemesterOptions(semesters),
    [semesters]
  );

  const availableExamPapers = useMemo(
    () =>
      createPracticalExamService.utils.filterAvailableExamPapers(
        examPapers,
        selectedExams
      ),
    [examPapers, selectedExams]
  );

  const totalQuestions = useMemo(
    () => createPracticalExamService.utils.calculateTotalQuestions(examDetails),
    [examDetails]
  );

  const validationResult = useMemo(
    () =>
      createPracticalExamService.utils.validateExamData(
        examName,
        selectedSubject,
        selectedSemester,
        selectedExams
      ),
    [examName, selectedSubject, selectedSemester, selectedExams]
  );

  // Popup handlers
  const handleOpenExamPopup = useCallback(() => {
    setExamChecks({});
    setShowExamPopup(true);
    setExamPapers([]);
  }, []);

  const handleCheckExam = useCallback((id: number, checked: boolean) => {
    setExamChecks((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const handleCheckAllExams = useCallback(() => {
    const allChecks = createPracticalExamService.utils.generateExamChecks(
      examPapers,
      true
    );
    setExamChecks(allChecks);
  }, [examPapers]);

  const handleUncheckAllExams = useCallback(() => {
    setExamChecks({});
  }, []);

  const handleSaveExams = useCallback(() => {
    const selected =
      createPracticalExamService.utils.getSelectedExamsFromChecks(
        examPapers,
        examChecks
      );
    setSelectedExams((prev) => [...prev, ...selected]);
    setShowExamPopup(false);
  }, [examPapers, examChecks]);

  const handleRemoveExam = useCallback((id: number) => {
    setSelectedExams((prev) =>
      prev.filter((exam) => exam.pracExamPaperId !== id)
    );
    setExamDetails((prev) => {
      const newDetails = { ...prev };
      delete newDetails[id];
      return newDetails;
    });
  }, []);

  // Detail handlers
  const handleShowDetail = useCallback(async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const data =
        await createPracticalExamService.getExamPaperDetail(examPaperId);
      setDetailData(data);
      setExamDetails((prev) => ({ ...prev, [examPaperId]: data }));
    } catch (error) {
      console.error("Error fetching exam detail:", error);
      showToast("error", "Không thể tải chi tiết đề thi");
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setDetailData(null);
  }, []);

  const handleMouseEnterExam = useCallback(
    async (exam: PracExamPaperDTO, e: React.MouseEvent) => {
      setPreviewPosition({ x: e.clientX, y: e.clientY });
      setHoveredExam(exam);
      setLoadingDetail(true);

      try {
        const data = await createPracticalExamService.getExamPaperDetail(
          exam.pracExamPaperId
        );
        setDetailData(data);
      } catch (error) {
        console.error("Error fetching preview detail:", error);
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
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validationResult.isValid) {
        showToast("error", validationResult.message || "Dữ liệu không hợp lệ");
        return;
      }

      const teacherId = getUserIdFromToken();
      if (!teacherId || !selectedSubject || !selectedSemester) {
        showToast("error", "Thông tin không đầy đủ");
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = createPracticalExamService.utils.buildExamPayload(
          examName,
          teacherId,
          selectedSubject,
          selectedSemester,
          selectedExams
        );

        const success =
          await createPracticalExamService.createFinalPracticalExam(payload);

        if (success) {
          showToast("success", "Tạo bài kiểm tra thành công!");
          router.push("/teacher/finalexam");
        } else {
          showToast("error", "Tạo bài kiểm tra thất bại!");
        }
      } catch (error) {
        console.error("Error submitting exam:", error);
        showToast("error", "Có lỗi xảy ra khi tạo bài kiểm tra");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validationResult,
      examName,
      selectedSubject,
      selectedSemester,
      selectedExams,
      router,
    ]
  );

  return {
    // State
    examName,
    subjects,
    selectedSubject,
    semesters,
    selectedSemester,
    examPapers,
    selectedExams,
    examChecks,
    examDetails,

    // UI State
    showExamPopup,
    showDetail,
    detailData,
    hoveredExam,
    previewPosition,

    // Loading states
    loadingExams,
    loadingDetail,
    isSubmitting,

    // Computed values
    totalQuestions,
    subjectOptions,
    semesterOptions,
    availableExamPapers,
    validationResult,

    // Handlers
    setExamName,
    setSelectedSubject,
    setSelectedSemester,
    setShowExamPopup,
    setShowDetail,

    // Exam selection handlers
    handleOpenExamPopup,
    handleCheckExam,
    handleCheckAllExams,
    handleUncheckAllExams,
    handleSaveExams,
    handleRemoveExam,

    // Detail handlers
    handleShowDetail,
    handleCloseDetail,
    handleMouseEnterExam,
    handleMouseLeaveExam,

    // Form submission
    handleSubmit,
  };
};
