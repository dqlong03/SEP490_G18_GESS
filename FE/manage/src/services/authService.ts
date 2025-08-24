import axios from "axios";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export interface LoginData {
  username: string;
  password: string;
  recaptchaToken: string;
}

export const login = async (data: LoginData) => {
  const response = await axios.post(`${API_URL}/Auth/login`, data);
  return response.data;
};

export interface LoginGoogleData {
  idToken: string;
}
export const loginGoogle = async (data: LoginGoogleData) => {
  const response = await axios.post(`${API_URL}/Auth/login-google`, data);
  return response.data;
};
