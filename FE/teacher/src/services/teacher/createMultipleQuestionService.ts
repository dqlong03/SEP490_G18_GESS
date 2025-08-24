import * as XLSX from "xlsx";

export type Answer = {
  text: string;
  isTrue: boolean;
};

export type Question = {
  id: number;
  content: string;
  answers: Answer[];
  difficulty: number;
  isPublic: boolean;
};

export type Option = {
  value: number;
  label: string;
};

export type AILevels = {
  easy: number;
  medium: number;
  hard: number;
};

export type AIGenerationRequest = {
  subjectName: string;
  materialLink: string;
  specifications: {
    difficulty: string;
    numberOfQuestions: number;
    type: number;
  }[];
};

export type DuplicateResult = {
  [id: number]: {
    similarityScore: number;
    similarQuestions: {
      questionID: number;
      content: string;
    }[];
  };
};

export type SaveQuestionRequest = {
  content: string;
  urlImg: string | null;
  isActive: boolean;
  createdBy: string;
  isPublic: boolean;
  chapterId: number;
  categoryExamId: number;
  levelQuestionId: number;
  semesterId: number;
  answers: {
    content: string;
    isCorrect: boolean;
  }[];
};

export const defaultDifficulties: Option[] = [
  { value: 1, label: "Dễ" },
  { value: 2, label: "Trung bình" },
  { value: 3, label: "Khó" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export const createMultipleQuestionService = {
  // Get difficulty levels
  getLevelQuestions: async (): Promise<Option[]> => {
    try {
      const response = await fetch(
        `${API_URL}/api/MultipleQuestion/GetLevelQuestion`
      );
      const data = await response.json();
      return data.map((l: any) => ({
        value: l.levelQuestionId,
        label: l.levelQuestionName,
      }));
    } catch (error) {
      console.error("Error fetching level questions:", error);
      return defaultDifficulties;
    }
  },

  // Download Excel template
  downloadTemplate: () => {
    const header = [
      "Nội dung",
      "Đáp án A",
      "IsTrueA",
      "Đáp án B",
      "IsTrueB",
      "Đáp án C",
      "IsTrueC",
      "Đáp án D",
      "IsTrueD",
      "Đáp án E",
      "IsTrueE",
      "Đáp án F",
      "IsTrueF",
      "Độ khó",
    ];

    const rows = [
      [
        "2 + 2 = ?",
        "3",
        false,
        "4",
        true,
        "5",
        false,
        "",
        false,
        "",
        false,
        "",
        false,
        1,
      ],
      [
        "C++ là ngôn ngữ gì?",
        "Lập trình hướng đối tượng",
        true,
        "Chỉ dùng cho web",
        false,
        "",
        false,
        "",
        false,
        "",
        false,
        "",
        false,
        2,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "mau_cau_hoi.xlsx");
  },

  // Parse Excel file and validate data
  parseExcelFile: (
    file: File
  ): Promise<{
    success: boolean;
    data?: Question[];
    error?: string;
    fileName?: string;
  }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
          });

          if (json.length < 2) {
            resolve({
              success: false,
              error: "File phải có ít nhất 1 dòng dữ liệu.",
            });
            return;
          }

          const header = json[0];
          const requiredHeader = [
            "Nội dung",
            "Đáp án A",
            "IsTrueA",
            "Đáp án B",
            "IsTrueB",
            "Đáp án C",
            "IsTrueC",
            "Đáp án D",
            "IsTrueD",
            "Đáp án E",
            "IsTrueE",
            "Đáp án F",
            "IsTrueF",
            "Độ khó",
          ];

          const isHeaderValid = requiredHeader.every(
            (h, idx) => header[idx] === h
          );
          if (!isHeaderValid) {
            resolve({
              success: false,
              error: "File mẫu không đúng định dạng!",
            });
            return;
          }

          const dataArr: Question[] = [];
          for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (row.length < 13) continue;

            const answers: Answer[] = [];
            for (let j = 1; j <= 11; j += 2) {
              answers.push({
                text: row[j],
                isTrue:
                  row[j + 1] === true ||
                  row[j + 1] === "TRUE" ||
                  row[j + 1] === true,
              });
            }

            dataArr.push({
              id: Math.floor(10000 + Math.random() * 90000),
              content: row[0],
              answers,
              difficulty: Number(row[12]) || 1,
              isPublic: true,
            });
          }

          resolve({
            success: true,
            data: dataArr,
            fileName: file.name,
          });
        } catch (error) {
          resolve({
            success: false,
            error: "Lỗi khi đọc file Excel!",
          });
        }
      };

      reader.readAsArrayBuffer(file);
    });
  },

  // Check for duplicate questions
  checkDuplicateQuestions: async (
    questions: Question[],
    chapterId: number
  ): Promise<DuplicateResult> => {
    try {
      // Get existing questions from the database
      const existedRes = await fetch(
        `${API_URL}/api/PracticeQuestion/all-questions?chapterId=${chapterId}&levelId=&questionType=multiple&pageNumber=1&pageSize=1000`
      );
      const existedData = await existedRes.json();
      const existedQuestions = (existedData?.questions || []).map((q: any) => ({
        questionID: q.questionId,
        content: q.content,
      }));

      // Create new questions list
      const newQuestions = questions.map((q) => ({
        questionID: q.id,
        content: q.content,
      }));

      // Combine all questions for comparison
      const allQuestions = [...newQuestions, ...existedQuestions];

      // Call duplicate checking API
      const res = await fetch(`${API_URL}/api/AIGradePracExam/FindSimilar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: allQuestions,
          similarityThreshold: 0.7,
        }),
      });
      const result = await res.json();

      // Process duplicate results
      const duplicateMap: DuplicateResult = {};
      result.forEach((group: any) => {
        // Find new questions in duplicate groups
        const newQ = group.questions.find((q: any) =>
          newQuestions.some((nq) => nq.questionID === q.questionID)
        );
        if (newQ) {
          duplicateMap[newQ.questionID] = {
            similarityScore: group.similarityScore,
            similarQuestions: group.questions.filter(
              (q: any) =>
                !newQuestions.some((nq) => nq.questionID === q.questionID)
            ),
          };
        }
      });

      return duplicateMap;
    } catch (error) {
      console.error("Error checking duplicates:", error);
      throw new Error("Lỗi kiểm tra trùng lặp!");
    }
  },

  // Generate questions using AI
  generateQuestionsWithAI: async (
    request: AIGenerationRequest
  ): Promise<Question[]> => {
    const response = await fetch(
      `${API_URL}/api/GenerateQuestions/GenerateMultipleQuestion`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error("Lỗi tạo câu hỏi bằng AI");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Kết quả trả về không hợp lệ!");
    }

    return data.map((q: any, idx: number) => {
      let answers: Answer[] = Array.isArray(q.answers)
        ? q.answers.map((a: any) => ({
            text: a.text || "",
            isTrue: !!a.isTrue,
          }))
        : [];

      // Ensure minimum 2 answers, maximum 6
      while (answers.length < 2) {
        answers.push({ text: "", isTrue: false });
      }
      answers = answers.slice(0, 6);

      return {
        id: Math.floor(10000 + Math.random() * 90000),
        content: q.content || "",
        answers,
        difficulty: q.difficulty || 1,
        isPublic: true,
      };
    });
  },

  // Save questions to server
  saveQuestions: async (
    questions: Question[],
    chapterId: number,
    categoryExamId: number,
    semesterId: number,
    teacherId: string
  ): Promise<boolean> => {
    try {
      for (const q of questions) {
        const answers = q.answers
          .filter((a) => a.text.trim())
          .map((a) => ({
            content: a.text,
            isCorrect: a.isTrue,
          }));

        const body: SaveQuestionRequest = {
          content: q.content,
          urlImg: null,
          isActive: true,
          createdBy: teacherId,
          isPublic: q.isPublic,
          chapterId: chapterId,
          categoryExamId: categoryExamId,
          levelQuestionId: q.difficulty,
          semesterId: semesterId,
          answers: answers,
        };

        // Debug log
        console.log(
          "Sending request with createdBy:",
          teacherId,
          "type:",
          typeof teacherId
        );

        const response = await fetch(
          `${API_URL}/api/MultipleQuestion/CreateMultipleQuestion`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save question");
        }
      }
      return true;
    } catch (error) {
      console.error("Error saving questions:", error);
      return false;
    }
  },

  // Validation helpers
  validateQuestion: (
    question: Question
  ): { isValid: boolean; error?: string } => {
    if (!question.content.trim()) {
      return { isValid: false, error: "Nội dung câu hỏi không được trống!" };
    }

    const validAnswers = question.answers.filter((a) => a.text.trim());
    if (validAnswers.length < 2) {
      return { isValid: false, error: "Phải có ít nhất 2 đáp án!" };
    }

    const hasCorrectAnswer = validAnswers.some((a) => a.isTrue);
    if (!hasCorrectAnswer) {
      return { isValid: false, error: "Phải có ít nhất 1 đáp án đúng!" };
    }

    return { isValid: true };
  },

  validateAllQuestions: (
    questions: Question[]
  ): { isValid: boolean; error?: string } => {
    for (let i = 0; i < questions.length; i++) {
      const validation = createMultipleQuestionService.validateQuestion(
        questions[i]
      );
      if (!validation.isValid) {
        return {
          isValid: false,
          error: `Câu hỏi ${i + 1}: ${validation.error}`,
        };
      }
    }
    return { isValid: true };
  },

  // Utility functions
  getLevelColor: (level: number, levels: Option[]): string => {
    const levelObj = levels.find((l) => l.value === level);
    switch (levelObj?.label) {
      case "Dễ":
        return "bg-green-100 text-green-800";
      case "Trung bình":
        return "bg-yellow-100 text-yellow-800";
      case "Khó":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Answer management helpers
  addAnswerToQuestion: (question: Question): Question => {
    if (question.answers.length < 6) {
      return {
        ...question,
        answers: [...question.answers, { text: "", isTrue: false }],
      };
    }
    return question;
  },

  removeAnswerFromQuestion: (
    question: Question,
    answerIndex: number
  ): Question => {
    if (question.answers.length > 2) {
      return {
        ...question,
        answers: question.answers.filter((_, i) => i !== answerIndex),
      };
    }
    return question;
  },

  clearAnswer: (question: Question, answerIndex: number): Question => {
    return {
      ...question,
      answers: question.answers.map((a, i) =>
        i === answerIndex ? { ...a, text: "", isTrue: false } : a
      ),
    };
  },

  // AI level calculation helper
  calculateDifficultyFromAILevels: (
    index: number,
    aiLevels: AILevels
  ): number => {
    if (index < aiLevels.easy) {
      return 1;
    } else if (index < aiLevels.easy + aiLevels.medium) {
      return 2;
    } else {
      return 3;
    }
  },

  generateRandomId: (): number => {
    return Math.floor(10000 + Math.random() * 90000);
  },
};
