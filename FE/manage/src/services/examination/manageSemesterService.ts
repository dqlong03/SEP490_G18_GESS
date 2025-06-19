const API_URL = process.env.NEXT_PUBLIC_API_URL + "/Semester";

export type Semester = {
  semesterId: number;
  semesterName: string;
  startDate: string; // ISO string format
  endDate: string;
};

export async function fetchSemesters(searchTerm: string): Promise<Semester[]> {
  const query = searchTerm ? `?name=${encodeURIComponent(searchTerm)}` : "";
  const res = await fetch(`${API_URL}${query}`);
  if (!res.ok) throw new Error("Không thể tải danh sách kỳ học");
  return res.json();
}

export async function addSemester(
  semester: Omit<Semester, "semesterId">
): Promise<Semester> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(semester),
  });
  if (!res.ok) throw new Error("Không thể thêm kỳ học");
  return res.json(); // Giả sử API trả về semester mới
}

export async function updateSemester(
  id: number,
  semester: Omit<Semester, "semesterId">
): Promise<Semester> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(semester),
  });
  if (!res.ok) throw new Error("Không thể cập nhật kỳ học");
  return res.json(); // Giả sử API trả về semester đã cập nhật
}

export async function deleteSemester(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không thể xóa kỳ học");
}

