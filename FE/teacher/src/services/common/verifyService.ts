const API_BASE =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/Otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (res.ok) {
      return { success: true };
    }
    const data = await res.json().catch(() => ({}));
    return {
      success: false,
      message: data.message || "Mã OTP không hợp lệ hoặc đã hết hạn.",
    };
  } catch {
    return { success: false, message: "Không thể kết nối đến máy chủ." };
  }
}
