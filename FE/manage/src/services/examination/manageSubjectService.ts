const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/Subject";

export type Subject = {
  subjectId: number;
  subjectName: string;
  description?: string;
  course?: string;
  noCredits: number;
};

export type SubjectForm = {
  subjectName: string;
  description?: string;
  course?: string;
  noCredits: number;
};

export async function fetchSubjects(
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(`${API_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch subjects");
  return res.json();
}

export async function countSubjects(
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(`${API_URL}/CountPage?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to count subjects");
  return res.json();
}

export async function createSubject(form: SubjectForm) {
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Failed to add subject");
}

export async function updateSubject(id: number, form: SubjectForm) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId: id, ...form }),
  });
  if (!res.ok) throw new Error("Failed to update subject");
}
