import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  createFinalExamPaperService,
  type Question,
  type Chapter,
  type Subject,
  type Semester,
  type Criterion,
  type ManualQuestion,
  type FinalExamPaperPayload,
} from "@/services/teacher/createFinalExamPaperService";
import { showToast } from "@/utils/toastUtils";

export const useCreateFinalExamPaper = () => {
  const router = useRouter();

  // State
  const [inputName, setInputName] = useState("");
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [searchContent, setSearchContent] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionChecks, setQuestionChecks] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [questionScores, setQuestionScores] = useState<Record<number, number>>(
    {}
  );
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);

  // Phân trang popup
  const [questionPage, setQuestionPage] = useState(1);
  const [questionTotalPages, setQuestionTotalPages] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // State cho nhập thủ công
  const [manualContent, setManualContent] = useState("");
  const [manualScore, setManualScore] = useState(1);
  const [manualCriteria, setManualCriteria] = useState<Criterion[]>([
    { criterionName: "", weightPercent: 25, description: "" },
  ]);
  const [manualLevel, setManualLevel] = useState("");
  const [manualChapter, setManualChapter] = useState<number | null>(null);

  // Sửa câu hỏi thủ công
  const [editingManualId, setEditingManualId] = useState<number | null>(null);

  // Subject & Semester
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const teacherId = getUserIdFromToken();
        if (!teacherId) {
          console.error("No teacher ID found");
          return;
        }

        // Load subjects and semesters in parallel
        const [subjectsData, semestersData] = await Promise.all([
          createFinalExamPaperService.getSubjectsByTeacherId(teacherId),
          createFinalExamPaperService.getSemesters(),
        ]);

        setSubjects(subjectsData);
        if (subjectsData.length > 0) setSelectedSubject(subjectsData[0]);

        setSemesters(semestersData);
        if (semestersData.length > 0) setSelectedSemester(semestersData[0]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Load chapters when subject changes
  useEffect(() => {
    const loadChapters = async () => {
      if (selectedSubject) {
        try {
          const chaptersData =
            await createFinalExamPaperService.getChaptersBySubjectId(
              selectedSubject.subjectId
            );
          setChapters(chaptersData);
        } catch (error) {
          console.error("Error loading chapters:", error);
          setChapters([]);
        }
      } else {
        setChapters([]);
      }
      setSelectedChapter(null);
    };

    loadChapters();
  }, [selectedSubject]);

  // Load questions when filters change
  useEffect(() => {
    if (selectedSubject && selectedSemester) {
      fetchQuestions(questionPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSubject,
    selectedSemester,
    searchContent,
    selectedLevel,
    selectedChapter,
    questionPage,
  ]);

  const fetchQuestions = async (page: number) => {
    if (!selectedSubject || !selectedSemester) return;

    setLoadingQuestions(true);
    try {
      const result = await createFinalExamPaperService.getQuestions({
        subjectId: selectedSubject.subjectId,
        semesterId: selectedSemester.semesterId,
        page,
        pageSize: 10,
        ...(searchContent && { textSearch: searchContent }),
        ...(selectedLevel && { levelId: selectedLevel.value }),
        ...(selectedChapter && { chapterId: selectedChapter.chapterId }),
      });

      setQuestions(result.questions);
      setQuestionTotalPages(result.totalPages);
      setQuestionPage(result.currentPage);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
      setQuestionTotalPages(1);
      setQuestionPage(1);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Save selected questions
  const handleSaveQuestions = () => {
    const newSelected = questions.filter((q) => questionChecks[q.id]);
    setSelectedQuestions([
      ...selectedQuestions,
      ...newSelected.filter(
        (q) => !selectedQuestions.some((sq) => sq.id === q.id)
      ),
    ]);
    setQuestionScores((prev) => ({
      ...prev,
      ...Object.fromEntries(newSelected.map((q) => [q.id, 1])),
    }));
    setShowQuestionPopup(false);
    setQuestionChecks({});
    setSearchContent("");
    setSelectedLevel(null);
    setSelectedChapter(null);
    setQuestionPage(1);
  };

  // Remove question from selected list
  const handleRemoveQuestion = (id: number, isManual = false) => {
    if (isManual) {
      setManualQuestions(manualQuestions.filter((q) => q.manualId !== id));
    } else {
      setSelectedQuestions(selectedQuestions.filter((q) => q.id !== id));
      setQuestionScores((prev) => {
        const newScores = { ...prev };
        delete newScores[id];
        return newScores;
      });
    }
  };

  // Calculate total score
  const totalScore =
    selectedQuestions.reduce((sum, q) => sum + (questionScores[q.id] || 0), 0) +
    manualQuestions.reduce((sum, q) => sum + (q.score || 0), 0);

  // Submit exam paper
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inputName ||
      !selectedSubject ||
      !selectedSemester ||
      selectedQuestions.length + manualQuestions.length === 0
    ) {
      alert(
        "Vui lòng nhập tên đề thi, chọn môn học, kỳ và chọn/thêm ít nhất 1 câu hỏi!"
      );
      return;
    }

    if (totalScore !== 10) {
      alert(`Tổng điểm của đề thi phải bằng 10! Hiện tại: ${totalScore} điểm`);
      return;
    }

    setIsSubmitting(true);
    try {
      const teacherId = getUserIdFromToken();
      if (!teacherId) {
        alert("Không tìm thấy thông tin giáo viên!");
        return;
      }

      const payload: FinalExamPaperPayload = {
        examName: inputName,
        totalQuestion: selectedQuestions.length + manualQuestions.length,
        teacherId,
        semesterId: selectedSemester.semesterId,
        subjectId: selectedSubject.subjectId,
        manualQuestions: manualQuestions.map((q) => ({
          content: q.content,
          criteria: JSON.stringify(q.criteria),
          score: q.score,
          level: q.level,
          chapterId: q.chapterId,
        })),
        selectedQuestions: selectedQuestions.map((q) => ({
          practiceQuestionId: q.id,
          score: questionScores[q.id] ?? 1,
        })),
      };

      const result =
        await createFinalExamPaperService.createFinalExamPaper(payload);
      showToast("success", "Tạo đề thi thành công!");
      router.push("/teacher/finalexampaper");
    } catch (error: any) {
      alert("Tạo đề thi thất bại: " + (error.message || "Có lỗi xảy ra"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Criterion management functions
  const addCriterion = () => {
    setManualCriteria([
      ...manualCriteria,
      { criterionName: "", weightPercent: 0, description: "" },
    ]);
  };

  const removeCriterion = (index: number) => {
    const newCriteria = manualCriteria.filter((_, i) => i !== index);
    setManualCriteria(newCriteria);
  };

  const updateCriterion = (
    index: number,
    field: keyof Criterion,
    value: string | number
  ) => {
    const newCriteria = [...manualCriteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setManualCriteria(newCriteria);
  };

  // Add manual question
  const handleAddManualQuestion = () => {
    if (
      !manualContent.trim() ||
      manualScore <= 0 ||
      !manualLevel ||
      !manualChapter
    ) {
      alert("Vui lòng nhập nội dung, điểm hợp lệ, chọn độ khó và chương!");
      return;
    }

    const validCriteria = manualCriteria.filter((c) => c.criterionName.trim());
    if (validCriteria.length === 0) {
      alert("Vui lòng thêm ít nhất một tiêu chí chấm!");
      return;
    }

    const totalWeight = validCriteria.reduce(
      (sum, c) => sum + c.weightPercent,
      0
    );
    if (totalWeight !== 100) {
      alert("Tổng phần trăm điểm của các tiêu chí phải bằng 100%!");
      return;
    }

    if (editingManualId) {
      setManualQuestions(
        manualQuestions.map((q) =>
          q.manualId === editingManualId
            ? {
                ...q,
                content: manualContent,
                score: manualScore,
                criteria: validCriteria,
                level: manualLevel,
                chapterId: manualChapter,
              }
            : q
        )
      );
      setEditingManualId(null);
    } else {
      setManualQuestions([
        ...manualQuestions,
        {
          manualId: Date.now(),
          content: manualContent,
          score: manualScore,
          criteria: validCriteria,
          level: manualLevel,
          chapterId: manualChapter,
        },
      ]);
    }
    setManualContent("");
    setManualScore(1);
    setManualCriteria([
      { criterionName: "", weightPercent: 25, description: "" },
    ]);
    setManualLevel("");
    setManualChapter(null);
    setShowManualInput(false);
  };

  // Edit manual question
  const handleEditManualQuestion = (manualId: number) => {
    const q = manualQuestions.find((q) => q.manualId === manualId);
    if (q) {
      setManualContent(q.content);
      setManualScore(q.score);
      setManualCriteria(
        q.criteria || [
          { criterionName: "", weightPercent: 25, description: "" },
        ]
      );
      setManualLevel(q.level);
      setManualChapter(q.chapterId);
      setEditingManualId(manualId);
      setShowManualInput(true);
    }
  };

  // Cancel manual input
  const handleCancelManualInput = () => {
    setManualContent("");
    setManualScore(1);
    setManualCriteria([
      { criterionName: "", weightPercent: 25, description: "" },
    ]);
    setManualLevel("");
    setManualChapter(null);
    setEditingManualId(null);
    setShowManualInput(false);
  };

  return {
    // State
    inputName,
    setInputName,
    showQuestionPopup,
    setShowQuestionPopup,
    searchContent,
    setSearchContent,
    selectedLevel,
    setSelectedLevel,
    selectedChapter,
    setSelectedChapter,
    chapters,
    questions,
    questionChecks,
    setQuestionChecks,
    selectedQuestions,
    questionScores,
    setQuestionScores,
    manualQuestions,
    setManualQuestions,
    showManualInput,
    setShowManualInput,
    questionPage,
    setQuestionPage,
    questionTotalPages,
    loadingQuestions,
    manualContent,
    setManualContent,
    manualScore,
    setManualScore,
    manualCriteria,
    setManualCriteria,
    manualLevel,
    setManualLevel,
    manualChapter,
    setManualChapter,
    editingManualId,
    subjects,
    selectedSubject,
    setSelectedSubject,
    semesters,
    selectedSemester,
    setSelectedSemester,
    isSubmitting,
    totalScore,

    // Functions
    handleSaveQuestions,
    handleRemoveQuestion,
    handleSave,
    addCriterion,
    removeCriterion,
    updateCriterion,
    handleAddManualQuestion,
    handleEditManualQuestion,
    handleCancelManualInput,
    fetchQuestions,
  };
};
