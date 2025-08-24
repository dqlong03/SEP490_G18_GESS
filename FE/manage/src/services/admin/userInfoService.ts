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

export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/User/${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateUser(userId: string, data: Partial<User>) {
  const res = await fetch(`${API_BASE}/api/User/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.ok;
}
