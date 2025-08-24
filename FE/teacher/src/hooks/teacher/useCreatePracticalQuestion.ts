import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  createPracticalQuestionService,
  type EssayQuestion,
  type Criterion,
  difficulties,
} from "@/services/teacher/createPracticalQuestionService";

export const useCreatePracticalQuestion = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters
  const chapterId = Number(searchParams.get("chapterId"));
  const categoryExamId = Number(searchParams.get("categoryExamId"));
  const chapterName = searchParams.get("chapterName") || "";
  const subjectName = searchParams.get("subjectName") || "";
  const semesterName = searchParams.get("semesterName") || "";
  const year = searchParams.get("year") || "";

  // Core state
  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // File import state
  const [fileName, setFileName] = useState<string>("");
  const [importError, setImportError] = useState<string>("");

  // AI generation state
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiLink, setAILink] = useState(
    "https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0"
  );
  const [aiNum, setAINum] = useState(2);
  const [aiLevel, setAILevel] = useState("dễ");
  const [aiLoading, setAILoading] = useState(false);

  // Manual question form state
  const [manualQ, setManualQ] = useState<EssayQuestion>({
    id: Date.now(),
    content: "",
    criteria: [{ criterionName: "", weightPercent: 25, description: "" }],
    difficulty: 1,
    isPublic: true,
  });
  const [showManualForm, setShowManualForm] = useState(false);

  // Refs for scrolling
  const manualFormRef = useRef<HTMLDivElement>(null);
  const questionsListRef = useRef<HTMLDivElement>(null);
  const aiFormRef = useRef<HTMLDivElement>(null);

  // Initialize semester data
  useEffect(() => {
    const fetchSemester = async () => {
      const semester =
        await createPracticalQuestionService.getCurrentSemester();
      setSemesterId(semester);
    };
    fetchSemester();
  }, []);

  // Download template handler
  const handleDownloadTemplate = () => {
    createPracticalQuestionService.downloadTemplate();
  };

  // File upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    const result = await createPracticalQuestionService.parseExcelFile(file);

    if (result.success && result.data) {
      setQuestions([...questions, ...result.data]);
      setFileName(result.fileName || "");
      setImportError("");
    } else {
      setImportError(result.error || "Lỗi không xác định");
      setFileName("");
    }
  };

  // Manual question form handlers
  const handleShowManualForm = () => {
    setShowManualForm(true);
    setTimeout(() => {
      manualFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAddManual = () => {
    const validation = createPracticalQuestionService.validateQuestion(manualQ);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const validCriteria = manualQ.criteria.filter((c) =>
      c.criterionName.trim()
    );

    setQuestions([
      ...questions,
      { ...manualQ, id: Date.now(), criteria: validCriteria },
    ]);

    setManualQ({
      id: Date.now(),
      content: "",
      criteria: [{ criterionName: "", weightPercent: 25, description: "" }],
      difficulty: 1,
      isPublic: true,
    });

    setShowManualForm(false);

    // Auto scroll to questions list after adding
    setTimeout(() => {
      questionsListRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Criterion management for manual form
  const addCriterion = () => {
    setManualQ({
      ...manualQ,
      criteria: [
        ...manualQ.criteria,
        { criterionName: "", weightPercent: 0, description: "" },
      ],
    });
  };

  const removeCriterion = (index: number) => {
    const newCriteria = manualQ.criteria.filter((_, i) => i !== index);
    setManualQ({ ...manualQ, criteria: newCriteria });
  };

  const updateCriterion = (
    index: number,
    field: keyof Criterion,
    value: string | number
  ) => {
    const newCriteria = [...manualQ.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setManualQ({ ...manualQ, criteria: newCriteria });
  };

  // AI generation handlers
  const handleShowAIForm = () => {
    setShowAIGen(true);
    setTimeout(() => {
      aiFormRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleGenerateAI = async () => {
    if (!aiLink || !aiNum || !aiLevel) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setAILoading(true);
    try {
      const newQuestions =
        await createPracticalQuestionService.generateQuestionsWithAI({
          subjectName: subjectName,
          materialLink: aiLink,
          levels: [{ difficulty: aiLevel, numberOfQuestions: aiNum }],
        });

      setQuestions((prev) => [...prev, ...newQuestions]);
      setShowAIGen(false);
      setAINum(2);
      setAILevel("dễ");

      // Auto scroll to questions list after AI generation
      setTimeout(() => {
        questionsListRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      alert(`Đã tạo thành công ${newQuestions.length} câu hỏi bằng AI!`);
    } catch (err: any) {
      alert(
        "Lỗi tạo câu hỏi bằng AI: " +
          "\nKiểm tra lại link tài liệu(đã được chia sẻ editable) và đã có nội dung"
      );
    }
    setAILoading(false);
  };

  // Question list management
  const handleEditQuestion = (
    idx: number,
    key: keyof EssayQuestion,
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [key]: value } : q))
    );
  };

  const handleDeleteQuestion = (idx: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  // Criterion management for questions in list
  const addCriterionToQuestion = (questionIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIdx].criteria.push({
      criterionName: "",
      weightPercent: 0,
      description: "",
    });
    setQuestions(newQuestions);
  };

  const removeCriterionFromQuestion = (
    questionIdx: number,
    criterionIdx: number
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIdx].criteria = newQuestions[
      questionIdx
    ].criteria.filter((_, i) => i !== criterionIdx);
    setQuestions(newQuestions);
  };

  const updateQuestionCriterion = (
    questionIdx: number,
    criterionIdx: number,
    field: keyof Criterion,
    value: string | number
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIdx].criteria[criterionIdx] = {
      ...newQuestions[questionIdx].criteria[criterionIdx],
      [field]: value,
    };
    setQuestions(newQuestions);
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
      createPracticalQuestionService.validateAllQuestions(questions);
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

      const success = await createPracticalQuestionService.saveQuestions(
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
    createPracticalQuestionService.getLevelColor(level);

  // Statistics
  const statistics = {
    total: questions.length,
    easy: questions.filter((q) => q.difficulty === 1).length,
    medium: questions.filter((q) => q.difficulty === 2).length,
    hard: questions.filter((q) => q.difficulty === 3).length,
  };

  return {
    // URL params
    chapterId,
    categoryExamId,
    chapterName,
    subjectName,
    semesterName,
    year,

    // Core state
    questions,
    setQuestions,
    semesterId,
    statistics,

    // File import
    fileName,
    importError,
    handleUpload,
    handleDownloadTemplate,

    // AI generation
    showAIGen,
    setShowAIGen,
    aiLink,
    setAILink,
    aiNum,
    setAINum,
    aiLevel,
    setAILevel,
    aiLoading,
    handleShowAIForm,
    handleGenerateAI,

    // Manual form
    manualQ,
    setManualQ,
    showManualForm,
    setShowManualForm,
    handleShowManualForm,
    handleAddManual,
    addCriterion,
    removeCriterion,
    updateCriterion,

    // Question management
    handleEditQuestion,
    handleDeleteQuestion,
    addCriterionToQuestion,
    removeCriterionFromQuestion,
    updateQuestionCriterion,

    // Actions
    handleSaveQuestions,
    handleGoBack,

    // Utilities
    getLevelColor,
    difficulties,

    // Refs
    manualFormRef,
    questionsListRef,
    aiFormRef,
  };
};
