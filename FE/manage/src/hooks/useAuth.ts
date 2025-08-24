// src/hooks/useAuth.ts
import { useState } from "react";
import { login, loginGoogle } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { showToast } from "@/utils/toastUtils";

export const useAuthLogic = () => {
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (username: string, password: string) => {
    try {
      if (!recaptchaToken) {
        showToast("error", "Vui lòng xác thực captcha");
        return;
      }

      const response = await login({
        username,
        password,
        recaptchaToken,
      });

      const decodedToken = jwtDecode<any>(response.token);

      // Kiểm tra role - chỉ cho phép admin và examination
      if (
        decodedToken.Role.toLowerCase() !== "admin" &&
        decodedToken.Role.toLowerCase() !== "examination"
      ) {
        showToast(
          "error",
          "Tài khoản của bạn không có quyền truy cập vào hệ thống này. Vui lòng liên hệ quản trị viên."
        );
        return;
      }

      authLogin(response.token);

      if (decodedToken.Role.toLowerCase() === "admin") {
        router.push("/admin/homepage");
      } else if (decodedToken.Role.toLowerCase() === "examination") {
        router.push("/examination/homepage");
      }
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const googleLogin = async (tokenResponse: any) => {
    try {
      const idToken = tokenResponse?.credential;
      if (!idToken) {
        showToast("error", "Không lấy được id_token từ Google");
        return;
      }

      const googleResponse = await loginGoogle({ idToken });

      const decodedToken = jwtDecode<any>(googleResponse.token);

      // Kiểm tra role - chỉ cho phép admin và examination
      if (
        decodedToken.Role.toLowerCase() !== "admin" &&
        decodedToken.Role.toLowerCase() !== "examination"
      ) {
        showToast(
          "error",
          "Tài khoản của bạn không có quyền truy cập vào hệ thống này. Vui lòng liên hệ quản trị viên."
        );
        return;
      }

      authLogin(googleResponse.token);

      if (decodedToken.Role.toLowerCase() === "admin") {
        router.push("/admin/homepage");
      } else if (decodedToken.Role.toLowerCase() === "examination") {
        router.push("/examination/homepage");
      }
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return {
    handleSubmit,
    googleLogin,
    setRecaptchaToken,
  };
};
