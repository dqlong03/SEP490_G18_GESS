const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface Chapter {
  id: number;
  chapterName: string;
  description: string;
  curriculum: string;
}

export interface SubjectBasicDTO {
  subjectName: string;
  course: string;
}

export interface ChapterFormData {
  title: string;
  description: string;
  syllabusFile: FileList;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API Error");
  return res.json();
};

export const chapterService = {
  // Lấy thông tin subject
  getSubjectInfo: async (subjectId: string): Promise<SubjectBasicDTO> => {
    return fetcher(`${API_BASE}/api/Subject/${subjectId}`);
  },

  // Lấy danh sách chapters theo subject
  getChaptersBySubject: async (subjectId: string): Promise<Chapter[]> => {
    return fetcher(`${API_BASE}/api/Chapter/GetAllChapterBySub/${subjectId}`);
  },

  // Tạo chapter mới
  createChapter: async (
    data: ChapterFormData,
    subjectId: string
  ): Promise<void> => {
    const file = data.syllabusFile?.[0];
    if (!file) throw new Error("Vui lòng chọn file giáo trình!");

    const formData = new FormData();
    formData.append("ChapterName", data.title);
    formData.append("Description", data.description);
    formData.append("CurriculumFile", file);
    formData.append("SubjectId", subjectId);

    const res = await fetch(`${API_BASE}/api/Chapter`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Thêm chương thất bại");
  },

  // Cập nhật chapter
  updateChapter: async (
    data: ChapterFormData,
    chapter: Chapter,
    subjectId: string
  ): Promise<void> => {
    const file = data.syllabusFile?.[0];

    const formData = new FormData();
    formData.append("ChapterName", data.title);
    formData.append("Description", data.description);
    formData.append("SubjectId", subjectId);
    formData.append("ExistingCurriculumUrl", chapter.curriculum);
    if (file) formData.append("NewCurriculumFile", file);

    const res = await fetch(`${API_BASE}/api/Chapter/${chapter.id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) throw new Error("Cập nhật chương thất bại");
  },

  // Xóa chapter
  deleteChapter: async (chapterId: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/Chapter/${chapterId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Xóa chương thất bại");
  },
};
