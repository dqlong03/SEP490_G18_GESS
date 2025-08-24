// useCreateMultipleExam.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createMultipleExamService,
  Subject,
  Chapter,
  Semester,
  ChapterQuestion,
  Level,
  LEVELS,
  ExamStatistics,
} from "../../services/teacher/createMultipleExamService";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import { showToast } from "../../utils/toastUtils";

export interface UseCreateMultipleExamReturn {
  // State
  subjects: Subject[];
  semesters: Semester[];
  chapters: Chapter[];
  selectedSubject: Subject | null;
  selectedSemester: Semester | null;
  selectedChapters: Chapter[];
  chapterQuestions: Record<number, ChapterQuestion>;
  chapterChecks: Record<number, boolean>;
  examName: string;
  questionInput: number;
  isModalOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  hasQuestionInput: boolean;

  // Computed values
  totalQuestions: number;
  availableChapters: Chapter[];
  statistics: ExamStatistics;
  examData: {
    isValid: boolean;
    message?: string;
  };

  // Handlers
  setExamName: (name: string) => void;
  setQuestionInput: (count: number) => void;
  setHasQuestionInput: (has: boolean) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setSelectedSemester: (semester: Semester | null) => void;
  setIsModalOpen: (open: boolean) => void;
  handleChapterCheck: (chapterId: number, checked: boolean) => void;
  handleSelectAllChapters: () => void;
  handleSelectNoneChapters: () => void;
  handleAddSelectedChapters: () => void;
  handleRemoveChapter: (chapterId: number) => void;
  handleQuestionCountChange: (
    chapterId: number,
    level: Level,
    value: number
  ) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

export const useCreateMultipleExam = (): UseCreateMultipleExamReturn => {
  const router = useRouter();

  // State for data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // State for selections
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [chapterQuestions, setChapterQuestions] = useState<
    Record<number, ChapterQuestion>
  >({});
  const [chapterChecks, setChapterChecks] = useState<Record<number, boolean>>(
    {}
  );

  // State for form
  const [examName, setExamName] = useState("");
  const [questionInput, setQuestionInput] = useState(0);
  const [hasQuestionInput, setHasQuestionInput] = useState(false);

  // State for UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const teacherId = getUserIdFromToken();
        if (!teacherId) {
          showToast("error", "Không thể xác định giáo viên");
          router.push("/auth/login");
          return;
        }

        const [subjectsData, semestersData] = await Promise.all([
          createMultipleExamService.getSubjectsByTeacherId(teacherId),
          createMultipleExamService.getSemesters(),
        ]);

        setSubjects(subjectsData);
        setSemesters(semestersData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        showToast("error", "Không thể tải dữ liệu ban đầu");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [router]);

  // Load chapters when subject changes
  useEffect(() => {
    const loadChapters = async () => {
      if (!selectedSubject) {
        setChapters([]);
        return;
      }

      try {
        const chaptersData =
          await createMultipleExamService.getChaptersBySubjectId(
            selectedSubject.subjectId
          );
        setChapters(chaptersData);
      } catch (error) {
        console.error("Error loading chapters:", error);
        showToast("error", "Không thể tải danh sách chương");
        setChapters([]);
      }
    };

    loadChapters();
  }, [selectedSubject]);

  // Update chapter questions when selected chapters change
  useEffect(() => {
    const updateChapterQuestions = async () => {
      if (selectedChapters.length === 0) {
        setChapterQuestions({});
        return;
      }

      const newChapterQuestions: Record<number, ChapterQuestion> = {};

      for (const chapter of selectedChapters) {
        if (!chapterQuestions[chapter.chapterId]) {
          const maxQuestions = await Promise.all(
            LEVELS.map((level) =>
              createMultipleExamService.getMaxQuestions(
                chapter.chapterId,
                level.id,
                selectedSemester?.semesterId
              )
            )
          );

          newChapterQuestions[chapter.chapterId] = {
            easy: 0,
            medium: 0,
            hard: 0,
            max: {
              easy: maxQuestions[0],
              medium: maxQuestions[1],
              hard: maxQuestions[2],
            },
          };
        } else {
          newChapterQuestions[chapter.chapterId] =
            chapterQuestions[chapter.chapterId];
        }
      }

      setChapterQuestions(newChapterQuestions);
    };

    updateChapterQuestions();
  }, [selectedChapters, selectedSemester]);

  // Computed values
  const totalQuestions = useMemo(
    () =>
      createMultipleExamService.utils.calculateTotalQuestions(chapterQuestions),
    [chapterQuestions]
  );

  const availableChapters = useMemo(
    () =>
      chapters.filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      ),
    [chapters, selectedChapters]
  );

  const statistics = useMemo(
    () => createMultipleExamService.utils.calculateStatistics(chapterQuestions),
    [chapterQuestions]
  );

  const examData = useMemo(
    () =>
      createMultipleExamService.utils.validateExamData(
        examName,
        selectedSubject,
        selectedSemester,
        selectedChapters,
        questionInput,
        totalQuestions
      ),
    [
      examName,
      selectedSubject,
      selectedSemester,
      selectedChapters,
      questionInput,
      totalQuestions,
    ]
  );

  // Chapter selection handlers
  const handleChapterCheck = useCallback(
    (chapterId: number, checked: boolean) => {
      setChapterChecks((prev) => ({
        ...prev,
        [chapterId]: checked,
      }));
    },
    []
  );

  const handleSelectAllChapters = useCallback(() => {
    const allChecks = createMultipleExamService.utils.generateChapterChecks(
      chapters,
      selectedChapters,
      true
    );
    setChapterChecks(allChecks);
  }, [chapters, selectedChapters]);

  const handleSelectNoneChapters = useCallback(() => {
    setChapterChecks({});
  }, []);

  const handleAddSelectedChapters = useCallback(() => {
    const checkedChapters = chapters.filter(
      (chap) => chapterChecks[chap.chapterId]
    );

    if (checkedChapters.length === 0) {
      showToast("error", "Vui lòng chọn ít nhất một chương");
      return;
    }

    setSelectedChapters((prev) => [...prev, ...checkedChapters]);
    setChapterChecks({});
    setIsModalOpen(false);
  }, [chapters, chapterChecks]);

  const handleRemoveChapter = useCallback(
    (chapterId: number) => {
      const {
        selectedChapters: newSelectedChapters,
        chapterQuestions: newChapterQuestions,
      } = createMultipleExamService.utils.removeChapterFromSelections(
        selectedChapters,
        chapterQuestions,
        chapterId
      );

      setSelectedChapters(newSelectedChapters);
      setChapterQuestions(newChapterQuestions);
    },
    [selectedChapters, chapterQuestions]
  );

  const handleQuestionCountChange = useCallback(
    (chapterId: number, level: Level, value: number) => {
      const newChapterQuestions =
        createMultipleExamService.utils.updateChapterQuestionCount(
          chapterQuestions,
          chapterId,
          level,
          value
        );
      setChapterQuestions(newChapterQuestions);
    },
    [chapterQuestions]
  );

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!examData.isValid) {
      showToast("error", examData.message || "Dữ liệu không hợp lệ");
      return;
    }

    const teacherId = getUserIdFromToken();
    if (!teacherId || !selectedSubject || !selectedSemester) {
      showToast("error", "Thông tin không đầy đủ");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = createMultipleExamService.utils.buildExamPayload(
        examName,
        totalQuestions,
        teacherId,
        selectedSubject,
        selectedSemester,
        selectedChapters,
        chapterQuestions
      );

      const success =
        await createMultipleExamService.createFinalMultipleExam(payload);

      if (success) {
        showToast("success", "Tạo đề thi thành công!");
        router.push("/teacher/myexam");
      } else {
        showToast("error", "Tạo đề thi thất bại!");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showToast("error", "Có lỗi xảy ra khi tạo đề thi");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    examData,
    examName,
    totalQuestions,
    selectedSubject,
    selectedSemester,
    selectedChapters,
    chapterQuestions,
    router,
  ]);

  // Reset form
  const resetForm = useCallback(() => {
    setExamName("");
    setQuestionInput(0);
    setHasQuestionInput(false);
    setSelectedSubject(null);
    setSelectedSemester(null);
    setSelectedChapters([]);
    setChapterQuestions({});
    setChapterChecks({});
    setIsModalOpen(false);
  }, []);

  return {
    // State
    subjects,
    semesters,
    chapters,
    selectedSubject,
    selectedSemester,
    selectedChapters,
    chapterQuestions,
    chapterChecks,
    examName,
    questionInput,
    isModalOpen,
    isLoading,
    isSubmitting,
    hasQuestionInput,

    // Computed values
    totalQuestions,
    availableChapters,
    statistics,
    examData,

    // Handlers
    setExamName,
    setQuestionInput,
    setHasQuestionInput,
    setSelectedSubject,
    setSelectedSemester,
    setIsModalOpen,
    handleChapterCheck,
    handleSelectAllChapters,
    handleSelectNoneChapters,
    handleAddSelectedChapters,
    handleRemoveChapter,
    handleQuestionCountChange,
    handleSubmit,
    resetForm,
  };
};
