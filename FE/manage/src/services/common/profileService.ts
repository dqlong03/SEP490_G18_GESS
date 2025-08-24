const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type User = {
  userId: string;
  userName: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

export type UserEditFields = {
  fullname?: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string | null;
  email?: string | null;
  userName?: string | null;
};

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

export async function updateUser(
  userId: string,
  data: UserEditFields
): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/User/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
