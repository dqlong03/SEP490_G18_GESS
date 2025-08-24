import * as XLSX from "xlsx";

export type Criterion = {
  criterionName: string;
  weightPercent: number;
  description: string;
};

export type EssayQuestion = {
  id: number;
  content: string;
  criteria: Criterion[];
  difficulty: number;
  isPublic: boolean;
};

export type AIGenerationRequest = {
  subjectName: string;
  materialLink: string;
  levels: {
    difficulty: string;
    numberOfQuestions: number;
  }[];
};

export type SaveQuestionRequest = {
  content: string;
  answerContent: string;
  urlImg: string;
  isActive: boolean;
  createdBy: number;
  isPublic: boolean;
  categoryExamId: number;
  levelQuestionId: number;
  semesterId: number;
  criteria: string;
};

export const difficulties = [
  { value: 1, label: "Dễ" },
  { value: 2, label: "Trung bình" },
  { value: 3, label: "Khó" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export const createPracticalQuestionService = {
  // Get current semester
  getCurrentSemester: async (): Promise<number | null> => {
    try {
      const response = await fetch(
        `${API_URL}/api/MultipleQuestion/GetCurrentSemester`
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        return data[0].semesterId;
      } else if (data.semesterId) {
        return data.semesterId;
      }
      return null;
    } catch (error) {
      console.error("Error fetching current semester:", error);
      return null;
    }
  },

  // Download Excel template
  downloadTemplate: () => {
    const header = [
      "Nội dung",
      "Độ khó",
      "Tiêu chí 1 - Tên",
      "Tiêu chí 1 - Mô tả",
      "Tiêu chí 1 - Phần trăm",
      "Tiêu chí 2 - Tên",
      "Tiêu chí 2 - Mô tả",
      "Tiêu chí 2 - Phần trăm",
      "Tiêu chí 3 - Tên",
      "Tiêu chí 3 - Mô tả",
      "Tiêu chí 3 - Phần trăm",
      "Tiêu chí 4 - Tên",
      "Tiêu chí 4 - Mô tả",
      "Tiêu chí 4 - Phần trăm",
      "Tiêu chí 5 - Tên",
      "Tiêu chí 5 - Mô tả",
      "Tiêu chí 5 - Phần trăm",
    ];

    const rows = [
      [
        "Trình bày khái niệm lập trình hướng đối tượng.",
        1,
        "Độ rõ ràng",
        "Trình bày rõ ràng và dễ hiểu",
        30,
        "Nội dung chuyên môn",
        "Đảm bảo mô tả đúng các khái niệm",
        30,
        "Tư duy/phân tích",
        "Phân tích và kết nối hợp lý",
        20,
        "Ví dụ minh họa",
        "Cung cấp ví dụ cụ thể",
        20,
        "",
        "",
        "",
      ],
      [
        "Phân tích ưu điểm của ngôn ngữ C++ so với C.",
        2,
        "So sánh chính xác",
        "So sánh đúng về tính năng",
        40,
        "Ví dụ minh họa",
        "Đưa ra ví dụ cụ thể",
        30,
        "Cấu trúc bài viết",
        "Trình bày có logic",
        30,
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EssayQuestions");
    XLSX.writeFile(wb, "mau_cau_hoi_tu_luan.xlsx");
  },

  // Parse Excel file and validate data
  parseExcelFile: (
    file: File
  ): Promise<{
    success: boolean;
    data?: EssayQuestion[];
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

          // Validate header
          const expectedHeader = [
            "Nội dung",
            "Độ khó",
            "Tiêu chí 1 - Tên",
            "Tiêu chí 1 - Mô tả",
            "Tiêu chí 1 - Phần trăm",
            "Tiêu chí 2 - Tên",
            "Tiêu chí 2 - Mô tả",
            "Tiêu chí 2 - Phần trăm",
            "Tiêu chí 3 - Tên",
            "Tiêu chí 3 - Mô tả",
            "Tiêu chí 3 - Phần trăm",
            "Tiêu chí 4 - Tên",
            "Tiêu chí 4 - Mô tả",
            "Tiêu chí 4 - Phần trăm",
            "Tiêu chí 5 - Tên",
            "Tiêu chí 5 - Mô tả",
            "Tiêu chí 5 - Phần trăm",
          ];

          const fileHeader = json[0]?.map((h: any) =>
            (h || "").toString().trim()
          );
          const isHeaderValid = expectedHeader.every(
            (h, idx) => fileHeader[idx] === h
          );

          if (!isHeaderValid) {
            resolve({
              success: false,
              error:
                "File không đúng định dạng mẫu. Vui lòng tải file mẫu và nhập đúng các cột!",
            });
            return;
          }

          if (json.length < 2) {
            resolve({
              success: false,
              error: "File phải có ít nhất 1 dòng dữ liệu.",
            });
            return;
          }

          const dataArr: EssayQuestion[] = [];

          for (let i = 1; i < json.length; i++) {
            const row = json[i];

            // Validate: Nội dung và độ khó phải có
            if (row.length < 2 || !row[0] || !row[1]) {
              resolve({
                success: false,
                error: `Dòng ${i + 1}: Thiếu nội dung hoặc độ khó!`,
              });
              return;
            }

            // Validate: Độ khó phải là 1, 2 hoặc 3
            if (![1, 2, 3].includes(Number(row[1]))) {
              resolve({
                success: false,
                error: `Dòng ${i + 1}: Độ khó phải là 1 (Dễ), 2 (Trung bình), hoặc 3 (Khó)!`,
              });
              return;
            }

            const criteria: Criterion[] = [];

            // Duyệt qua 5 nhóm tiêu chí (mỗi nhóm 3 cột: tên, mô tả, phần trăm)
            for (let j = 0; j < 5; j++) {
              const nameIndex = 2 + j * 3;
              const descIndex = 3 + j * 3;
              const weightIndex = 4 + j * 3;

              // Nếu có tên tiêu chí thì validate các trường còn lại
              if (row[nameIndex] && row[nameIndex].trim()) {
                // Validate: Phần trăm phải là số và từ 1-100
                const weight = Number(row[weightIndex]);
                if (isNaN(weight) || weight < 1 || weight > 100) {
                  resolve({
                    success: false,
                    error: `Dòng ${i + 1}: Phần trăm tiêu chí "${row[nameIndex]}" phải là số từ 1 đến 100!`,
                  });
                  return;
                }

                criteria.push({
                  criterionName: row[nameIndex].trim(),
                  description: row[descIndex] ? row[descIndex].trim() : "",
                  weightPercent: weight,
                });
              }
            }

            // Validate: Phải có ít nhất 1 tiêu chí
            if (criteria.length === 0) {
              resolve({
                success: false,
                error: `Dòng ${i + 1}: Phải có ít nhất 1 tiêu chí chấm!`,
              });
              return;
            }

            // Validate: Tổng phần trăm tiêu chí phải bằng 100
            const totalWeight = criteria.reduce(
              (sum, c) => sum + c.weightPercent,
              0
            );
            if (totalWeight !== 100) {
              resolve({
                success: false,
                error: `Dòng ${i + 1}: Tổng phần trăm các tiêu chí phải bằng 100% (hiện tại: ${totalWeight}%)!`,
              });
              return;
            }

            dataArr.push({
              id: Date.now() + i,
              content: row[0],
              criteria: criteria,
              difficulty: Number(row[1]) || 1,
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

  // Generate questions using AI
  generateQuestionsWithAI: async (
    request: AIGenerationRequest
  ): Promise<EssayQuestion[]> => {
    const response = await fetch(
      `${API_URL}/api/GenerateQuestions/GenerateEssayQuestion`,
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

    return data.map((q: any, idx: number) => ({
      id: Date.now() + idx,
      content: q.content,
      criteria: q.bandScoreGuide || [],
      difficulty: 1,
      isPublic: true,
    }));
  },

  // Save questions to server
  saveQuestions: async (
    questions: EssayQuestion[],
    chapterId: number,
    categoryExamId: number,
    semesterId: number,
    teacherId: string
  ): Promise<boolean> => {
    const body = questions.map((q) => ({
      content: q.content,
      answerContent: q.content,
      urlImg: "Default.png",
      isActive: true,
      createdBy: teacherId,
      isPublic: q.isPublic,
      categoryExamId: categoryExamId,
      levelQuestionId: q.difficulty,
      semesterId: semesterId,
      criteria: JSON.stringify(q.criteria),
    }));

    const response = await fetch(
      `${API_URL}/api/PracticeQuestion/CreateMultiple/${chapterId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    return response.ok;
  },

  // Validation helpers
  validateQuestion: (
    question: EssayQuestion
  ): { isValid: boolean; error?: string } => {
    if (!question.content.trim()) {
      return { isValid: false, error: "Nội dung câu hỏi không được trống!" };
    }

    if (question.criteria.length === 0) {
      return { isValid: false, error: "Phải có ít nhất một tiêu chí chấm!" };
    }

    const validCriteria = question.criteria.filter((c) =>
      c.criterionName.trim()
    );
    if (validCriteria.length === 0) {
      return { isValid: false, error: "Phải có ít nhất một tiêu chí có tên!" };
    }

    const totalWeight = validCriteria.reduce(
      (sum, c) => sum + c.weightPercent,
      0
    );
    if (totalWeight !== 100) {
      return {
        isValid: false,
        error: "Tổng phần trăm điểm của các tiêu chí phải bằng 100%!",
      };
    }

    for (const criterion of validCriteria) {
      if (!criterion.criterionName.trim()) {
        return { isValid: false, error: "Tên tiêu chí không được để trống!" };
      }
    }

    return { isValid: true };
  },

  validateAllQuestions: (
    questions: EssayQuestion[]
  ): { isValid: boolean; error?: string } => {
    for (let i = 0; i < questions.length; i++) {
      const validation = createPracticalQuestionService.validateQuestion(
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
  getLevelColor: (level: number): string => {
    const levelObj = difficulties.find((d) => d.value === level);
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

  calculateTotalWeight: (criteria: Criterion[]): number => {
    return criteria.reduce((sum, c) => sum + c.weightPercent, 0);
  },
};
