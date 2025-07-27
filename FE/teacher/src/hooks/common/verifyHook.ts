"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@services/common/verifyService";

export function useOtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    } else if (value === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpString = otp.join("");
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
    if (otpString.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    setLoading(true);
    const result = await verifyOtp(email, otpString);
    if (result.success) {
      router.push("/common/forgotpass/changepass");
    } else {
      setError(result.message ?? null);
    }
    setLoading(false);
  };

  return {
    otp,
    setOtp,
    error,
    loading,
    handleChange,
    handleFocus,
    handleSubmit,
  };
}
