// src/hooks/useAuth.ts
import { useState } from "react";
import { login, loginGoogle } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";

export const useAuthLogic = () => {
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (username: string, password: string) => {
    try {
      if (!recaptchaToken) {
        setError("Vui lòng xác thực captcha");
        return;
      }

      const response = await login({
        username,
        password,
        recaptchaToken,
      });

      authLogin(response.token);

      const decodedToken = jwtDecode<any>(response.token);
      if (decodedToken.Role === "Teacher") {
        router.push("/teacher/homepage");
      } else {
        router.push("/teacher/homepage");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const googleLogin = async (tokenResponse: any) => {
    try {
      const idToken = tokenResponse?.credential;
      if (!idToken) {
        setError("Không lấy được id_token từ Google");
        return;
      }

      const googleResponse = await loginGoogle({ idToken });
      authLogin(googleResponse.token);

      const decodedToken = jwtDecode<any>(googleResponse.token);
      if (decodedToken.Role === "Admin") {
        router.push("/admin/homepage");
      } else {
        router.push("/examination/homepage"); // Điều hướng đến trang người dùng bình thường
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return {
    error,
    handleSubmit,
    googleLogin,
    setRecaptchaToken,
  };
};
