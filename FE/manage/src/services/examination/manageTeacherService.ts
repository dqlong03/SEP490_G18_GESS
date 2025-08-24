const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/Teacher";

export type Teacher = {
  teacherId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  gender: boolean;
  isActive: boolean;
  hireDate: string;
};

export type TeacherForm = {
  userName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  gender: boolean;
  isActive: boolean;
  hireDate: string;
};

export async function fetchTeachers(keyword = ""): Promise<Teacher[]> {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  const url = keyword ? `${API_URL}/search?${params.toString()}` : API_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch teachers");
  return res.json();
}

export async function createTeacher(form: Partial<TeacherForm>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Failed to add teacher");
}

export async function updateTeacher(id: string, form: Partial<TeacherForm>) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Failed to update teacher");
}

export async function deleteTeacher(id: string) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete teacher");
}
