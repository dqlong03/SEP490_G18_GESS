import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  questionBankService,
  questionTypes,
  questionLevels,
  publicOptions,
  generateYearOptions,
  answerCharacter,
  getLevelColor,
  getSelectStyles,
  PAGE_SIZE_CONSTANT,
  type SimilarityGroup,
  type QuestionFilters,
  type CreateQuestionParams,
} from "@/services/teacher/questionBankService";

export const useQuestionBank = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get teacher ID
  const teacherId = getUserIdFromToken() || null;

  // Filter states
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [selectedPublic, setSelectedPublic] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<any>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<SimilarityGroup[]>([]);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null
  );

  // Data states
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMultiple, setTotalMultiple] = useState(0);
  const [totalEssay, setTotalEssay] = useState(0);

  // Static options
  const yearOptions = useMemo(() => generateYearOptions(), []);

  // URL parameter handling
  const initialChapterId = searchParams.get("chapterId");
  const initialCategoryExamId = searchParams.get("categoryExamId");
  const initialSubjectId = searchParams.get("subjectId");
  const initialType = searchParams.get("questionType");
  const initialLevel = searchParams.get("levelId");
  const initialSemesterId = searchParams.get("semesterId");
  const initialYear = searchParams.get("year");

  // Auto-set filters from URL when data is available
  useEffect(() => {
    if (categories.length > 0 && initialCategoryExamId && !selectedCategory) {
      const found = categories.find(
        (c) => String(c.value) === String(initialCategoryExamId)
      );
      if (found) setSelectedCategory(found);
    }
  }, [categories, initialCategoryExamId, selectedCategory]);

  useEffect(() => {
    if (subjects.length > 0 && initialSubjectId && !selectedSubject) {
      const found = subjects.find(
        (s) => String(s.value) === String(initialSubjectId)
      );
      if (found) setSelectedSubject(found);
    }
  }, [subjects, initialSubjectId, selectedSubject]);

  useEffect(() => {
    if (chapters.length > 0 && initialChapterId && !selectedChapter) {
      const found = chapters.find(
        (c) => String(c.value) === String(initialChapterId)
      );
      if (found) setSelectedChapter(found);
    }
  }, [chapters, initialChapterId, selectedChapter]);

  useEffect(() => {
    if (questionTypes.length > 0 && initialType && !selectedType) {
      const found = questionTypes.find(
        (t) => String(t.value) === String(initialType)
      );
      if (found) setSelectedType(found);
    }
  }, [initialType, selectedType]);

  useEffect(() => {
    if (questionLevels.length > 0 && initialLevel && !selectedLevel) {
      const found = questionLevels.find(
        (l) => String(l.value) === String(initialLevel)
      );
      if (found) setSelectedLevel(found);
    }
  }, [initialLevel, selectedLevel]);

  useEffect(() => {
    if (semesters.length > 0 && initialSemesterId && !selectedSemester) {
      const found = semesters.find(
        (s) => String(s.value) === String(initialSemesterId)
      );
      if (found) setSelectedSemester(found);
    }
  }, [semesters, initialSemesterId, selectedSemester]);

  useEffect(() => {
    if (yearOptions.length > 0 && initialYear && !selectedYear) {
      const found = yearOptions.find(
        (y) => String(y.value) === String(initialYear)
      );
      if (found) setSelectedYear(found);
    }
  }, [yearOptions, initialYear, selectedYear]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const [categoriesData, semestersData] = await Promise.all([
        questionBankService.fetchCategories(),
        questionBankService.fetchSemesters(),
      ]);
      setCategories(categoriesData);
      setSemesters(semestersData);
    };
    loadInitialData();
  }, []);

  // Load subjects when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubjects([]);
      setChapters([]);
      setSelectedSubject(null);
      setSelectedChapter(null);
      return;
    }

    questionBankService
      .fetchSubjectsByCategory(selectedCategory.value)
      .then((data) => setSubjects(data))
      .catch(() => setSubjects([]));

    setSelectedSubject(null);
    setSelectedChapter(null);
  }, [selectedCategory]);

  // Load chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setSelectedChapter(null);
      return;
    }

    questionBankService
      .fetchChaptersBySubject(selectedSubject.value)
      .then((data) => setChapters(data))
      .catch(() => setChapters([]));

    setSelectedChapter(null);
  }, [selectedSubject]);

  // Build current filters
  const currentFilters = useMemo(
    (): QuestionFilters => ({
      selectedPublic,
      selectedCategory,
      selectedSubject,
      selectedType,
      selectedLevel,
      selectedChapter,
      selectedSemester,
      selectedYear,
      page,
      teacherId,
    }),
    [
      selectedPublic,
      selectedCategory,
      selectedSubject,
      selectedType,
      selectedLevel,
      selectedChapter,
      selectedSemester,
      selectedYear,
      page,
      teacherId,
    ]
  );

  // Fetch questions when filters change
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await questionBankService.fetchQuestions(currentFilters);
      setQuestions(data.questions);
      setTotalPages(data.totalPages);
      setTotalQuestions(data.totalCount);
      setTotalMultiple(data.totalMulti);
      setTotalEssay(data.totalPrac);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
      setTotalPages(1);
      setTotalQuestions(0);
      setTotalMultiple(0);
      setTotalEssay(0);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Check if can check duplicates
  const canCheckDuplicates = useMemo(
    () =>
      selectedPublic &&
      selectedCategory &&
      selectedSubject &&
      selectedType &&
      selectedLevel &&
      selectedChapter,
    [
      selectedPublic,
      selectedCategory,
      selectedSubject,
      selectedType,
      selectedLevel,
      selectedChapter,
    ]
  );

  // Pagination info
  const paginationInfo = useMemo(
    () => ({
      start: (page - 1) * PAGE_SIZE_CONSTANT + 1,
      end: Math.min(page * PAGE_SIZE_CONSTANT, totalQuestions),
      total: totalQuestions,
      currentPage: page,
      totalPages,
    }),
    [page, totalQuestions, totalPages]
  );

  // Statistics
  const statistics = useMemo(
    () => ({
      total: totalQuestions,
      multiple: totalMultiple,
      essay: totalEssay,
    }),
    [totalQuestions, totalMultiple, totalEssay]
  );

  // Filter handlers
  const handlePublicChange = useCallback((option: any) => {
    setSelectedPublic(option);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((option: any) => {
    setSelectedCategory(option);
    setPage(1);
  }, []);

  const handleSubjectChange = useCallback((option: any) => {
    setSelectedSubject(option);
    setPage(1);
  }, []);

  const handleTypeChange = useCallback((option: any) => {
    setSelectedType(option);
    setPage(1);
  }, []);

  const handleLevelChange = useCallback((option: any) => {
    setSelectedLevel(option);
    setPage(1);
  }, []);

  const handleChapterChange = useCallback((option: any) => {
    setSelectedChapter(option);
    setPage(1);
  }, []);

  const handleSemesterChange = useCallback((option: any) => {
    setSelectedSemester(option);
    setPage(1);
  }, []);

  const handleYearChange = useCallback((option: any) => {
    setSelectedYear(option);
    setPage(1);
  }, []);

  // Reset filters
  const handleResetFilter = useCallback(() => {
    setSelectedPublic(null);
    setSelectedCategory(null);
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedLevel(null);
    setSelectedChapter(null);
    setSelectedSemester(null);
    setSelectedYear(null);
    setPage(1);
    router.replace("/teacher/questionbank");
  }, [router]);

  // Check duplicates
  const handleCheckDuplicates = useCallback(async () => {
    if (!canCheckDuplicates) {
      alert(
        "Vui lòng chọn đầy đủ tất cả các bộ lọc trước khi kiểm tra trùng lặp!"
      );
      return;
    }

    setCheckingDuplicates(true);

    try {
      const duplicateData =
        await questionBankService.checkDuplicates(currentFilters);
      setDuplicateGroups(duplicateData);
      setShowDuplicatePopup(true);
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi kiểm tra trùng lặp!");
    } finally {
      setCheckingDuplicates(false);
    }
  }, [canCheckDuplicates, currentFilters]);

  // Delete question
  const handleDeleteQuestion = useCallback(
    async (questionId: number, questionType: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
        return;
      }

      setDeletingQuestionId(questionId);

      try {
        const result = await questionBankService.deleteQuestion(
          questionId,
          selectedType?.value || questionType
        );

        if (result.success) {
          alert("Xóa câu hỏi thành công!");
          // Refresh questions list
          await fetchQuestions();

          // Update duplicate groups
          const updatedGroups = duplicateGroups
            .map((group) => ({
              ...group,
              questions: group.questions.filter(
                (q) => q.questionID !== questionId
              ),
            }))
            .filter((group) => group.questions.length > 1);

          setDuplicateGroups(updatedGroups);

          if (updatedGroups.length === 0) {
            setShowDuplicatePopup(false);
            alert("Đã xóa tất cả câu hỏi trùng lặp!");
          }
        } else {
          alert(result.message || "Xóa câu hỏi thất bại!");
        }
      } catch (error: any) {
        alert(error.message || "Có lỗi xảy ra khi xóa câu hỏi!");
      } finally {
        setDeletingQuestionId(null);
      }
    },
    [selectedType, fetchQuestions, duplicateGroups]
  );

  // Create question
  const handleCreateQuestion = useCallback(
    (type: "multiple" | "essay") => {
      if (
        !selectedChapter ||
        !selectedCategory ||
        !selectedSemester ||
        !selectedYear
      ) {
        alert(
          "Vui lòng chọn đầu điểm, chương, kỳ học và năm trước khi tạo câu hỏi!"
        );
        return;
      }

      const params: CreateQuestionParams = {
        categoryExamId: selectedCategory?.value,
        subjectId: selectedSubject?.value,
        subjectName: selectedSubject?.label,
        questionType: selectedType?.value,
        levelId: selectedLevel?.value,
        chapterId: selectedChapter?.value,
        chapterName: selectedChapter?.label,
        semesterId: selectedSemester?.value,
        semesterName: selectedSemester?.label,
        year: selectedYear?.value,
      };

      const url = questionBankService.buildCreateQuestionUrl(type, params);
      router.push(url);
      setShowCreateMenu(false);
    },
    [
      selectedChapter,
      selectedCategory,
      selectedSemester,
      selectedYear,
      selectedSubject,
      selectedType,
      selectedLevel,
      router,
    ]
  );

  // Toggle create menu
  const handleToggleCreateMenu = useCallback(() => {
    setShowCreateMenu((prev) => !prev);
  }, []);

  // Close duplicate popup
  const handleCloseDuplicatePopup = useCallback(() => {
    setShowDuplicatePopup(false);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  return {
    // Filter state
    selectedPublic,
    selectedCategory,
    selectedSubject,
    selectedType,
    selectedLevel,
    selectedChapter,
    selectedSemester,
    selectedYear,

    // Data state
    categories,
    subjects,
    chapters,
    semesters,
    questions,
    loading,

    // UI state
    checkingDuplicates,
    showCreateMenu,
    showDuplicatePopup,
    duplicateGroups,
    deletingQuestionId,

    // Pagination
    page,
    totalPages,
    paginationInfo,

    // Statistics
    statistics,

    // Computed values
    canCheckDuplicates,

    // Static options
    questionTypes,
    questionLevels,
    publicOptions,
    yearOptions,

    // Filter handlers
    handlePublicChange,
    handleCategoryChange,
    handleSubjectChange,
    handleTypeChange,
    handleLevelChange,
    handleChapterChange,
    handleSemesterChange,
    handleYearChange,
    handleResetFilter,

    // Action handlers
    handleCheckDuplicates,
    handleDeleteQuestion,
    handleCreateQuestion,
    handleToggleCreateMenu,
    handleCloseDuplicatePopup,

    // Pagination handlers
    handlePageChange,
    handlePreviousPage,
    handleNextPage,

    // Utility functions
    answerCharacter,
    getLevelColor,
    getSelectStyles,

    // Constants
    PAGE_SIZE: PAGE_SIZE_CONSTANT,
  };
};
