import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  createMultipleQuestionService,
  type Question,
  type Answer,
  type Option,
  type AILevels,
  type DuplicateResult,
  defaultDifficulties,
} from "@/services/teacher/createMultipleQuestionService";

export const useCreateMultipleQuestion = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters
  const chapterId = Number(searchParams.get("chapterId"));
  const categoryExamId = Number(searchParams.get("categoryExamId"));
  const chapterName = searchParams.get("chapterName") || "";
  const subjectName = searchParams.get("subjectName") || "";
  const semesterName = searchParams.get("semesterName") || "";
  const semesterId = Number(searchParams.get("semesterId"));

  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levels, setLevels] = useState<Option[]>(defaultDifficulties);

  // File import state
  const [fileName, setFileName] = useState<string>("");
  const [importError, setImportError] = useState<string>("");

  // Duplicate checking state
  const [duplicateMap, setDuplicateMap] = useState<DuplicateResult>({});
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // AI generation state
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiLink, setAILink] = useState(
    "https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0"
  );
  const [aiLevels, setAILevels] = useState<AILevels>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [aiQuestionType, setAIQuestionType] = useState<1 | 2 | 3>(2);
  const [aiLoading, setAILoading] = useState(false);

  // Manual question form state
  const [manualQ, setManualQ] = useState<Question>({
    id: createMultipleQuestionService.generateRandomId(),
    content: "",
    answers: [
      { text: "", isTrue: false },
      { text: "", isTrue: false },
    ],
    difficulty: 1,
    isPublic: true,
  });
  const [showManualForm, setShowManualForm] = useState(false);

  // Refs for scrolling
  const manualFormRef = useRef<HTMLDivElement>(null);
  const questionsListRef = useRef<HTMLDivElement>(null);
  const aiFormRef = useRef<HTMLDivElement>(null);

  // Initialize difficulty levels
  useEffect(() => {
    const fetchLevels = async () => {
      const levels = await createMultipleQuestionService.getLevelQuestions();
      setLevels(levels);
    };
    fetchLevels();
  }, []);

  // Download template handler
  const handleDownloadTemplate = () => {
    createMultipleQuestionService.downloadTemplate();
  };

  // File upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    const result = await createMultipleQuestionService.parseExcelFile(file);

    if (result.success && result.data) {
      setQuestions((prev) => [...prev, ...result.data!]);
      setFileName(result.fileName || "");
      setImportError("");
    } else {
      setImportError(result.error || "Lỗi không xác định");
      setFileName("");
    }
  };

  // Duplicate checking
  const handleCheckDuplicate = async () => {
    setCheckingDuplicate(true);
    setDuplicateMap({});

    try {
      const duplicates =
        await createMultipleQuestionService.checkDuplicateQuestions(
          questions,
          chapterId
        );
      setDuplicateMap(duplicates);
    } catch (error) {
      alert("Lỗi kiểm tra trùng lặp!");
    }

    setCheckingDuplicate(false);
  };

  // Manual question form handlers
  const handleShowManualForm = () => {
    setShowManualForm(true);
    setTimeout(() => {
      manualFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAddManual = () => {
    const validation = createMultipleQuestionService.validateQuestion(manualQ);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setQuestions([
      ...questions,
      { ...manualQ, id: createMultipleQuestionService.generateRandomId() },
    ]);

    setManualQ({
      id: createMultipleQuestionService.generateRandomId(),
      content: "",
      answers: [
        { text: "", isTrue: false },
        { text: "", isTrue: false },
      ],
      difficulty: 1,
      isPublic: true,
    });

    setShowManualForm(false);

    // Auto scroll to questions list after adding
    setTimeout(() => {
      questionsListRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Manual form answer management
  const handleAddAnswerManual = () => {
    setManualQ(createMultipleQuestionService.addAnswerToQuestion(manualQ));
  };

  const handleDeleteAnswerManual = (idx: number) => {
    setManualQ(
      createMultipleQuestionService.removeAnswerFromQuestion(manualQ, idx)
    );
  };

  // AI generation handlers
  const handleShowAIForm = () => {
    setShowAIGen(true);
    setTimeout(() => {
      aiFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleGenerateAI = async () => {
    if (!aiLink) {
      alert("Vui lòng nhập link tài liệu!");
      return;
    }

    const totalQuestions = aiLevels.easy + aiLevels.medium + aiLevels.hard;
    if (totalQuestions === 0) {
      alert("Vui lòng nhập số câu hỏi cho ít nhất một mức độ!");
      return;
    }

    setAILoading(true);
    try {
      const levels = [];
      if (aiLevels.easy > 0) {
        levels.push({
          difficulty: "dễ",
          numberOfQuestions: aiLevels.easy,
          type: aiQuestionType,
        });
      }
      if (aiLevels.medium > 0) {
        levels.push({
          difficulty: "trung bình",
          numberOfQuestions: aiLevels.medium,
          type: aiQuestionType,
        });
      }
      if (aiLevels.hard > 0) {
        levels.push({
          difficulty: "khó",
          numberOfQuestions: aiLevels.hard,
          type: aiQuestionType,
        });
      }

      const newQuestions =
        await createMultipleQuestionService.generateQuestionsWithAI({
          subjectName: subjectName,
          materialLink: aiLink,
          specifications: levels,
        });

      // Apply difficulty levels based on order
      const questionsWithDifficulty = newQuestions.map((q, idx) => ({
        ...q,
        difficulty:
          createMultipleQuestionService.calculateDifficultyFromAILevels(
            idx,
            aiLevels
          ),
      }));

      setQuestions((prev) => [...prev, ...questionsWithDifficulty]);
      setShowAIGen(false);
      setAILevels({ easy: 0, medium: 0, hard: 0 });

      // Auto scroll to questions list after AI generation
      setTimeout(() => {
        questionsListRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      alert(
        `Đã tạo thành công ${questionsWithDifficulty.length} câu hỏi bằng AI!`
      );
    } catch (err: any) {
      alert(
        "Lỗi tạo câu hỏi bằng AI: " +
          "\nKiểm tra lại link tài liệu(đã được chia sẻ editable) và đã có nội dung"
      );
    }
    setAILoading(false);
  };

  // Question list management
  const handleEditQuestion = (idx: number, key: keyof Question, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [key]: value } : q))
    );
  };

  const handleEditAnswer = (
    qIdx: number,
    aIdx: number,
    key: keyof Answer,
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === aIdx ? { ...a, [key]: value } : a
              ),
            }
          : q
      )
    );
  };

  const handleDeleteQuestion = (idx: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  const handleDeleteAnswer = (qIdx: number, aIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? createMultipleQuestionService.clearAnswer(q, aIdx) : q
      )
    );
  };

  // Save questions handler
  const handleSaveQuestions = async () => {
    if (!semesterId) {
      alert("Không tìm thấy học kỳ hiện tại!");
      return;
    }

    if (!chapterId || !categoryExamId) {
      alert("Thiếu chapterId hoặc categoryExamId trên URL!");
      return;
    }

    if (questions.length === 0) {
      alert("Không có câu hỏi để lưu!");
      return;
    }

    const validation =
      createMultipleQuestionService.validateAllQuestions(questions);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      const teacherId = getUserIdFromToken();
      if (!teacherId) {
        alert("Không thể xác định thông tin giáo viên!");
        return;
      }

      const success = await createMultipleQuestionService.saveQuestions(
        questions,
        chapterId,
        categoryExamId,
        semesterId,
        teacherId
      );

      if (success) {
        alert("Lưu thành công!");
        setQuestions([]);
        router.push(`/teacher/questionbank?${searchParams.toString()}`);
      } else {
        alert("Lưu thất bại!");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu câu hỏi!");
    }
  };

  // Navigation
  const handleGoBack = () => {
    router.back();
  };

  // Utility functions
  const getLevelColor = (level: number) =>
    createMultipleQuestionService.getLevelColor(level, levels);

  // Statistics
  const statistics = {
    total: questions.length,
    easy: questions.filter((q) => q.difficulty === 1).length,
    medium: questions.filter((q) => q.difficulty === 2).length,
    hard: questions.filter((q) => q.difficulty === 3).length,
  };

  // AI levels total
  const aiTotalQuestions = aiLevels.easy + aiLevels.medium + aiLevels.hard;

  return {
    // URL params
    chapterId,
    categoryExamId,
    chapterName,
    subjectName,
    semesterName,
    semesterId,

    // Core state
    questions,
    setQuestions,
    levels,
    statistics,

    // File import
    fileName,
    importError,
    handleUpload,
    handleDownloadTemplate,

    // Duplicate checking
    duplicateMap,
    checkingDuplicate,
    handleCheckDuplicate,

    // AI generation
    showAIGen,
    setShowAIGen,
    aiLink,
    setAILink,
    aiLevels,
    setAILevels,
    aiQuestionType,
    setAIQuestionType,
    aiLoading,
    aiTotalQuestions,
    handleShowAIForm,
    handleGenerateAI,

    // Manual form
    manualQ,
    setManualQ,
    showManualForm,
    setShowManualForm,
    handleShowManualForm,
    handleAddManual,
    handleAddAnswerManual,
    handleDeleteAnswerManual,

    // Question management
    handleEditQuestion,
    handleEditAnswer,
    handleDeleteQuestion,
    handleDeleteAnswer,

    // Actions
    handleSaveQuestions,
    handleGoBack,

    // Utilities
    getLevelColor,

    // Refs
    manualFormRef,
    questionsListRef,
    aiFormRef,
  };
};
