const API_URL = process.env.NEXT_PUBLIC_API_URL + "/Subject";

export type Subject = {
  subjectId: number;
  subjectName: string;
  description?: string;
  course?: string;
  noCredits: number;
};

export async function fetchSubjectsInProgram(
  trainingProgramId: number,
  params: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") searchParams.append(k, String(v));
  });
  const res = await fetch(
    `${API_URL}/TrainingProgram/${trainingProgramId}?${searchParams.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch subjects in training program");
  return res.json();
}

export async function fetchAllSubjects() {
  const res = await fetch(`${API_URL}?pageNumber=1&pageSize=1000`);
  if (!res.ok) throw new Error("Failed to fetch all subjects");
  return res.json();
}

export async function addSubjectToProgram(
  trainingProgramId: number,
  subjectId: number
) {
  const res = await fetch(
    `${API_URL}/AddSubjectToTrainingProgram/${trainingProgramId}/${subjectId}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to add subject to training program");
}

export async function removeSubjectFromProgram(
  trainingProgramId: number,
  subjectId: number
) {
  const res = await fetch(
    `${API_URL}/RemoveSubjectFromTrainingProgram/${trainingProgramId}/${subjectId}`,
    { method: "DELETE" }
  );
  if (!res.ok)
    throw new Error("Failed to remove subject from training program");
}
