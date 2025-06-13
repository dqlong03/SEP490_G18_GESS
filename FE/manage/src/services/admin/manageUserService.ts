export type User = {
  userId: string;
  userName: string;
  email: string;
  fullname?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: boolean;
  isActive?: boolean;
  role?: string;
};
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/User`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch {
    return [];
  }
}
