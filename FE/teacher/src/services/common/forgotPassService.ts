const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export async function sendOtp(
  email: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/Otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      return { success: true };
    }
    const data = await res.json();
    return {
      success: false,
      message: data.message || "Gửi mã xác thực thất bại.",
    };
  } catch {
    return { success: false, message: "Không thể kết nối đến máy chủ." };
  }
}
