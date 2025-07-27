"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@services/common/changePassService";

export function useChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    const passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordPattern.test(password)) {
      setError(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt."
      );
      return;
    }

    const email =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resetEmail")
        : null;
    if (!email) {
      setError(
        "Không tìm thấy email xác thực. Vui lòng quay lại bước nhập email."
      );
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, password, confirmPassword);
    if (result.success) {
      setSuccess("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => {
        router.push("/common/login");
      }, 1500);
    } else {
      setError(result.message ?? "");
    }
    setLoading(false);
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    loading,
    handleSubmit,
  };
}
