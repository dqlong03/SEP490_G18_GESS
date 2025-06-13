export function getUserInitialsFromToken(): string {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return "U";
    }

    const payload = token.split(".")[1];
    if (!payload) {
      return "U";
    }

    const decodedPayload = JSON.parse(atob(payload));
    const username =
      decodedPayload.Username || decodedPayload.username || "User";

    return username
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  } catch (error) {
    console.error("Error decoding token:", error);
    return "U";
  }
}

export function getUserRoleFromToken(): string | null {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return null;
    }

    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));

    return decodedPayload.Role || decodedPayload.role || null;
  } catch (error) {
    console.error("Error decoding token role:", error);
    return null;
  }
}

export function getUserIdFromToken(): string | null {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return null;
    }
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.Userid || decodedPayload.userid || null;
  } catch (error) {
    console.error("Error decoding token id:", error);
    return null;
  }
}

// utils/tokenUtils.ts
export const resetToken = () => {
  localStorage.removeItem("token"); // hoặc sessionStorage, cookies tùy cách lưu
};
