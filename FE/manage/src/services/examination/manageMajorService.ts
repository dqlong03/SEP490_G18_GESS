const API_URL = process.env.NEXT_PUBLIC_API_URL + "/major";

export type Major = {
  majorId: number;
  majorName: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
};

export type MajorForm = {
  majorName: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
};

export async function fetchMajors(
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(`${API_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch majors");
  return res.json();
}

export async function countMajors(
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(`${API_URL}/CountPage?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to count majors");
  return res.json();
}

export async function createMajor(form: MajorForm) {
  const res = await fetch(`${API_URL}/CreateMajor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error("Failed to add major");
}

export async function updateMajor(id: number, form: MajorForm) {
  const dataToSend: any = { ...form };
  if (!dataToSend.endDate) {
    delete dataToSend.endDate;
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSend),
  });
  if (!res.ok) throw new Error("Failed to update major");
}

export async function deleteMajor(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete major");
}
