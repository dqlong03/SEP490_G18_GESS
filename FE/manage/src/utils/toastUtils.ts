import { toast } from "react-toastify";

export const showToast = (
  type: "success" | "error" | "warning" | "info",
  message: string,
  options?: any
) => {
  const defaultOptions = {
    position: "top-right" as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  };

  switch (type) {
    case "success":
      toast.success(message, defaultOptions);
      break;
    case "error":
      toast.error(message, defaultOptions);
      break;
    case "warning":
      toast.warning(message, defaultOptions);
      break;
    case "info":
      toast.info(message, defaultOptions);
      break;
    default:
      toast(message, defaultOptions);
  }
};

// Các helper functions để sử dụng nhanh
export const showSuccess = (message: string, options?: any) =>
  showToast("success", message, options);
export const showError = (message: string, options?: any) =>
  showToast("error", message, options);
export const showWarning = (message: string, options?: any) =>
  showToast("warning", message, options);
export const showInfo = (message: string, options?: any) =>
  showToast("info", message, options);
