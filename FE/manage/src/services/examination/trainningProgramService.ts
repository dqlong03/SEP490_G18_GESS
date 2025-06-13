const API_URL = process.env.NEXT_PUBLIC_API_URL + "/TrainingProgram";

export type TrainingProgram = {
  trainingProgramId: number;
  trainProName: string;
  startDate: string;
  endDate?: string | null;
  noCredits: number;
};

export type TrainingProgramForm = {
  trainProName: string;
  startDate: string;
  endDate?: string | null;
  noCredits: number;
};

export async function fetchPrograms(
  majorId: number,
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(`${API_URL}/${majorId}?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch training programs");
  return res.json();
}

export async function countPrograms(
  majorId: number,
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(
    `${API_URL}/count/${majorId}?${searchParams.toString()}`
  );
  if (!res.ok) throw new Error("Failed to count training programs");
  return res.json();
}

export async function createProgram(
  majorId: number,
  form: TrainingProgramForm
) {
  // Loại bỏ endDate nếu rỗng
  const dataToSend: any = { ...form };
  if (!dataToSend.endDate) delete dataToSend.endDate;
  const res = await fetch(`${API_URL}/${majorId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSend),
  });
  if (!res.ok) throw new Error("Failed to add training program");
}

export async function updateProgram(id: number, form: TrainingProgramForm) {
  // Loại bỏ endDate nếu rỗng
  const dataToSend: any = { ...form, trainingProgramId: id };
  if (!dataToSend.endDate) delete dataToSend.endDate;
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSend),
  });
  if (!res.ok) throw new Error("Failed to update training program");
}

export async function deleteProgram(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete training program");
}
