"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@services/common/forgotPassService";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await sendOtp(email);
    if (result.success) {
      setSuccess("Mã xác thực đã được gửi đến email của bạn.");
      sessionStorage.setItem("resetEmail", email);
      setTimeout(() => {
        router.push("/common/forgotpass/verify");
      }, 1000);
    } else {
      setError(result.message || "Đã xảy ra lỗi.");
    }
    setLoading(false);
  };

  return { email, setEmail, error, success, loading, handleSubmit };
}
