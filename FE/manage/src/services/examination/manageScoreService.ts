const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

// Interfaces
export interface CategoryExamSubjectDTO {
  subjectId: number;
  categoryExamId: number;
  categoryExamName: string;
  gradeComponent: number;
  isDelete: boolean;
}

export interface CategoryExamType {
  categoryExamId: number;
  categoryExamName: string;
}

export interface SubjectBasicDTO {
  subjectName: string;
  course: string;
}

export interface ScoreFormData {
  SubjectId: number;
  CategoryExamId: number;
  GradeComponent: string;
  IsDelete?: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
};

export const scoreService = {
  // Lấy thông tin subject
  getSubjectInfo: async (subjectId: string): Promise<SubjectBasicDTO> => {
    return fetcher(`${API_BASE}/api/Subject/${subjectId}`);
  },

  // Lấy danh sách loại bài thi
  getExamTypes: async (): Promise<CategoryExamType[]> => {
    return fetcher(`${API_BASE}/api/CategoryExam`);
  },

  // Lấy danh sách điểm theo subject
  getScoresBySubject: async (
    subjectId: string
  ): Promise<CategoryExamSubjectDTO[]> => {
    return fetcher(`${API_BASE}/api/GradeComponent/${subjectId}`);
  },

  // Thêm điểm mới
  createScore: async (
    data: ScoreFormData,
    subjectId: string
  ): Promise<void> => {
    const dto = {
      subjectId: parseInt(subjectId),
      categoryExamId: Number(data.CategoryExamId),
      categoryExamName: "",
      gradeComponent: parseFloat(data.GradeComponent.toString()),
      isDelete: Boolean(data.IsDelete),
    };

    const res = await fetch(`${API_BASE}/api/GradeComponent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) throw new Error("Thêm điểm thất bại");
  },

  // Cập nhật điểm
  updateScore: async (
    data: ScoreFormData,
    scoreId: number,
    subjectId: string
  ): Promise<void> => {
    const dto = {
      subjectId: parseInt(subjectId),
      categoryExamId: Number(data.CategoryExamId),
      categoryExamName: "",
      gradeComponent: parseFloat(data.GradeComponent.toString()),
      isDelete: Boolean(data.IsDelete),
    };

    const res = await fetch(
      `${API_BASE}/api/GradeComponent/${subjectId}/${scoreId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!res.ok) throw new Error("Cập nhật điểm thất bại");
  },

  // Xóa điểm
  deleteScore: async (scoreId: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/GradeComponent/${scoreId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Xóa điểm thất bại");
  },
};
