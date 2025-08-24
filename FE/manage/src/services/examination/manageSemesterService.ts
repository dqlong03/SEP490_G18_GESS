const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface Semester {
  semesterId: number;
  semesterName: string;
}

export interface SemesterForm {
  semesterNames: { name: string }[];
}

export interface SemesterPayload {
  semesters: Semester[];
}

export const semesterService = {
  // Lấy danh sách semester
  getSemesters: async (): Promise<Semester[]> => {
    const res = await fetch(`${API_BASE}/api/Semesters`);
    if (!res.ok) throw new Error("Lỗi khi tải dữ liệu học kỳ");
    return res.json();
  },

  // Cập nhật semester
  updateSemesters: async (data: SemesterForm): Promise<void> => {
    const payload: SemesterPayload = {
      semesters: data.semesterNames.map((x, idx) => ({
        semesterId: idx + 1,
        semesterName: x.name,
      })),
    };

    const res = await fetch(`${API_BASE}/api/Semesters`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Đã xảy ra lỗi");
      } else {
        const text = await res.text();
        throw new Error(text || "Đã xảy ra lỗi không rõ");
      }
    }
  },
};
