const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export async function resetPassword(
  email: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/Auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    });
    if (res.ok) {
      return { success: true };
    }
    const data = await res.json().catch(() => ({}));
    return {
      success: false,
      message: data.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.",
    };
  } catch {
    return { success: false, message: "Không thể kết nối đến máy chủ." };
  }
}
