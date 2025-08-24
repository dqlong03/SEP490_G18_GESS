// useCreateExamPaper.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  createExamPaperService,
  Question,
  Chapter,
  Level,
  GradeComponent,
  Criterion,
  ManualQuestion,
} from "@/services/teacher/createExamPaperService";

export const useCreateExamPaper = (
  classId: number,
  semesterId: string | null
) => {
  const router = useRouter();

  // Basic form state
  const [inputName, setInputName] = useState("");
  const [selectedGradeComponent, setSelectedGradeComponent] =
    useState<GradeComponent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question selection state
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [questionChecks, setQuestionChecks] = useState<Record<number, boolean>>(
    {}
  );
  const [questionScores, setQuestionScores] = useState<Record<number, number>>(
    {}
  );

  // Question filters and pagination
  const [searchContent, setSearchContent] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [questionPage, setQuestionPage] = useState(1);
  const [questionTotalPages, setQuestionTotalPages] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Manual question state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);
  const [manualContent, setManualContent] = useState("");
  const [manualScore, setManualScore] = useState(1);
  const [manualCriteria, setManualCriteria] = useState<Criterion[]>([
    createExamPaperService.utils.createDefaultCriterion(),
  ]);
  const [manualLevel, setManualLevel] = useState("");
  const [manualChapter, setManualChapter] = useState<number | null>(null);
  const [editingManualId, setEditingManualId] = useState<number | null>(null);

  // Convert semesterId to number
  const semesterIdNumber = semesterId ? Number(semesterId) : null;

  // Get levels
  const levels = createExamPaperService.utils.getLevels();

  // Calculate total score
  const totalScore = createExamPaperService.utils.calculateTotalScore(
    questionScores,
    manualQuestions
  );

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (classId) {
        try {
          const [chaptersData, gradeComponentsData] = await Promise.all([
            createExamPaperService.getChapters(classId),
            createExamPaperService.getGradeComponents(classId),
          ]);

          setChapters(chaptersData);
          setGradeComponents(gradeComponentsData);
        } catch (error) {
          console.error("Error initializing data:", error);
        }
      }
    };

    initializeData();
  }, [classId]);

  // Fetch questions when filters change
  useEffect(() => {
    if (classId) {
      fetchQuestions(questionPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, searchContent, selectedLevel, selectedChapter, questionPage]);

  // Fetch questions with current filters
  const fetchQuestions = useCallback(
    async (page: number) => {
      setLoadingQuestions(true);
      try {
        const filters = {
          classId,
          page,
          pageSize: 10,
          ...(searchContent && { content: searchContent }),
          ...(selectedLevel && { levelId: selectedLevel.value }),
          ...(selectedChapter && { chapterId: selectedChapter.chapterId }),
        };

        const result = await createExamPaperService.getQuestions(filters);
        setQuestions(result.data);
        setQuestionTotalPages(result.totalPages);
        setQuestionPage(result.page);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]);
        setQuestionTotalPages(1);
        setQuestionPage(1);
      } finally {
        setLoadingQuestions(false);
      }
    },
    [classId, searchContent, selectedLevel, selectedChapter]
  );

  // Handle question selection and saving
  const handleSaveQuestions = useCallback(() => {
    const newSelected = questions.filter((q) => questionChecks[q.id]);
    const filteredNewSelected = newSelected.filter(
      (q) => !selectedQuestions.some((sq) => sq.id === q.id)
    );

    setSelectedQuestions((prev) => [...prev, ...filteredNewSelected]);
    setQuestionScores((prev) => ({
      ...prev,
      ...Object.fromEntries(filteredNewSelected.map((q) => [q.id, 1])),
    }));

    // Reset popup state
    setShowQuestionPopup(false);
    setQuestionChecks({});
    setSearchContent("");
    setSelectedLevel(null);
    setSelectedChapter(null);
    setQuestionPage(1);
  }, [questions, questionChecks, selectedQuestions]);

  // Remove question from selected list
  const handleRemoveQuestion = useCallback((id: number, isManual = false) => {
    if (isManual) {
      setManualQuestions((prev) => prev.filter((q) => q.manualId !== id));
    } else {
      setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
      setQuestionScores((prev) => {
        const newScores = { ...prev };
        delete newScores[id];
        return newScores;
      });
    }
  }, []);

  // Criteria management functions
  const addCriterion = useCallback(() => {
    setManualCriteria((prev) => [
      ...prev,
      createExamPaperService.utils.createDefaultCriterion(),
    ]);
  }, []);

  const removeCriterion = useCallback((index: number) => {
    setManualCriteria((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateCriterion = useCallback(
    (index: number, field: keyof Criterion, value: string | number) => {
      setManualCriteria((prev) => {
        const newCriteria = [...prev];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        return newCriteria;
      });
    },
    []
  );

  // Manual question management
  const handleAddManualQuestion = useCallback(() => {
    const validation = createExamPaperService.utils.validateManualQuestion(
      manualContent,
      manualScore,
      manualLevel,
      manualChapter,
      manualCriteria
    );

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const validCriteria =
      createExamPaperService.utils.filterValidCriteria(manualCriteria);

    if (editingManualId) {
      // Update existing manual question
      setManualQuestions((prev) =>
        prev.map((q) =>
          q.manualId === editingManualId
            ? {
                ...q,
                content: manualContent,
                score: manualScore,
                criteria: validCriteria,
                level: manualLevel,
                chapterId: manualChapter!,
              }
            : q
        )
      );
      setEditingManualId(null);
    } else {
      // Add new manual question
      const newQuestion: ManualQuestion = {
        manualId: createExamPaperService.utils.generateManualQuestionId(),
        content: manualContent,
        score: manualScore,
        criteria: validCriteria,
        level: manualLevel,
        chapterId: manualChapter!,
      };
      setManualQuestions((prev) => [...prev, newQuestion]);
    }

    // Reset form
    resetManualQuestionForm();
  }, [
    manualContent,
    manualScore,
    manualLevel,
    manualChapter,
    manualCriteria,
    editingManualId,
  ]);

  // Reset manual question form
  const resetManualQuestionForm = useCallback(() => {
    setManualContent("");
    setManualScore(1);
    setManualCriteria([createExamPaperService.utils.createDefaultCriterion()]);
    setManualLevel("");
    setManualChapter(null);
    setShowManualInput(false);
    setEditingManualId(null);
  }, []);

  // Edit manual question
  const handleEditManualQuestion = useCallback(
    (manualId: number) => {
      const question = manualQuestions.find((q) => q.manualId === manualId);
      if (question) {
        setManualContent(question.content);
        setManualScore(question.score);
        setManualCriteria(
          question.criteria || [
            createExamPaperService.utils.createDefaultCriterion(),
          ]
        );
        setManualLevel(question.level);
        setManualChapter(question.chapterId);
        setEditingManualId(manualId);
        setShowManualInput(true);
      }
    },
    [manualQuestions]
  );

  // Cancel manual input
  const handleCancelManualInput = useCallback(() => {
    resetManualQuestionForm();
  }, [resetManualQuestionForm]);

  // Form submission
  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validation = createExamPaperService.utils.validateForm(
        inputName,
        selectedGradeComponent,
        selectedQuestions,
        manualQuestions,
        totalScore
      );

      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setIsSubmitting(true);
      const teacherId = getUserIdFromToken();

      if (!teacherId) {
        alert("Không thể xác định giáo viên. Vui lòng đăng nhập lại.");
        setIsSubmitting(false);
        return;
      }

      try {
        const payload = createExamPaperService.utils.buildCreatePayload(
          classId,
          inputName,
          selectedGradeComponent!,
          semesterIdNumber,
          teacherId,
          selectedQuestions,
          questionScores,
          manualQuestions
        );

        const result = await createExamPaperService.createExamPaper(payload);
        alert(`Tạo đề thi thành công! Mã đề: ${result.pracExamPaperId}`);
        router.push(`/teacher/myexam/createpracexam/${classId.toString()}`);
      } catch (error: any) {
        alert(`Tạo đề thi thất bại: ${error.message}`);
        console.error("Error creating exam paper:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      inputName,
      selectedGradeComponent,
      selectedQuestions,
      manualQuestions,
      totalScore,
      classId,
      semesterIdNumber,
      questionScores,
      router,
    ]
  );

  // Question score management
  const updateQuestionScore = useCallback(
    (questionId: number, score: number) => {
      setQuestionScores((prev) => ({
        ...prev,
        [questionId]: score,
      }));
    },
    []
  );

  // Manual question score management
  const updateManualQuestionScore = useCallback(
    (manualId: number, score: number) => {
      setManualQuestions((prev) =>
        prev.map((q) => (q.manualId === manualId ? { ...q, score } : q))
      );
    },
    []
  );

  // Filter handlers
  const handleSearchChange = useCallback((search: string) => {
    setSearchContent(search);
    setQuestionPage(1);
  }, []);

  const handleLevelChange = useCallback((level: Level | null) => {
    setSelectedLevel(level);
    setQuestionPage(1);
  }, []);

  const handleChapterChange = useCallback((chapter: Chapter | null) => {
    setSelectedChapter(chapter);
    setQuestionPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQuestionPage(page);
  }, []);

  // Show manual input with clean state
  const showManualInputDialog = useCallback(() => {
    resetManualQuestionForm();
    setShowManualInput(true);
  }, [resetManualQuestionForm]);

  return {
    // Basic form state
    inputName,
    setInputName,
    selectedGradeComponent,
    setSelectedGradeComponent,
    isSubmitting,

    // Data
    chapters,
    gradeComponents,
    questions,
    levels,

    // Question selection
    showQuestionPopup,
    setShowQuestionPopup,
    selectedQuestions,
    questionChecks,
    setQuestionChecks,
    questionScores,

    // Question filters and pagination
    searchContent,
    selectedLevel,
    selectedChapter,
    questionPage,
    questionTotalPages,
    loadingQuestions,

    // Manual questions
    showManualInput,
    manualQuestions,
    manualContent,
    setManualContent,
    manualScore,
    setManualScore,
    manualCriteria,
    manualLevel,
    setManualLevel,
    manualChapter,
    setManualChapter,
    editingManualId,

    // Computed values
    totalScore,

    // Action handlers
    handleSave,
    handleSaveQuestions,
    handleRemoveQuestion,
    handleAddManualQuestion,
    handleEditManualQuestion,
    handleCancelManualInput,
    showManualInputDialog,
    updateQuestionScore,
    updateManualQuestionScore,

    // Criteria management
    addCriterion,
    removeCriterion,
    updateCriterion,

    // Filter handlers
    handleSearchChange,
    handleLevelChange,
    handleChapterChange,
    handlePageChange,

    // Utility functions
    getLevelInfo: createExamPaperService.utils.getLevelInfo,
  };
};
