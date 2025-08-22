'use client';
import { useState } from 'react';
import { useAuthLogic } from '@/hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import googlelogo from '@public/googlelogo.png';
import universitylogo from '@public/uni.png';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import '@/styles/login.css';
import Link from 'next/link'; // Đảm bảo đã import Link
import { Suspense } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Define setError using useState
  const { handleSubmit, googleLogin, setRecaptchaToken } = useAuthLogic();

  // Google Login handler
  const googleLoginHandler = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: googleLogin,
    onError: () => setError('Đăng nhập với Google thất bại'), // Set error if login fails
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>

    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      {/* Icon và tên trường học ở góc trái khi màn hình lớn */}
      <div className="school-info absolute top-4 left-4 flex items-center space-x-2 lg:flex hidden">
        <Image src={universitylogo} alt="School Icon" width={50} height={50} />
        <span className="text-2xl font-semibold text-gray-800">Fpt University</span>
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-xl">
        {/* Tiêu đề đăng nhập và logo trường học ở dòng trên cùng khi màn hình nhỏ */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="text-left text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
          <div className="flex items-center space-x-2">
            <Image src={universitylogo} alt="School Icon" width={30} height={30} />
            <span className="text-xl font-semibold text-gray-800">Fpt University</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form đăng nhập */}
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(username, password);
          }}
        >
          <div>
            <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Link quên mật khẩu */}
          <div className="text-sm text-left">
           <Link href="/common/forgotpass" className="text-indigo-600 hover:text-indigo-500 underline">
 Quên mật khẩu
</Link>
          </div>

          {/* ReCAPTCHA */}
          <div className="flex justify-start mt-4 w-full">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={(token) => setRecaptchaToken(token || '')}
            />
          </div>

          {/* Nút đăng nhập */}
          <div className="mt-6">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        {/* Đăng nhập với Google */}
        <div className="mb-4 text-center">
          <button
            type="button"
            onClick={()=>googleLoginHandler} // Fix here to directly call googleLoginHandler
            className="w-full py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 flex justify-center items-center"
          >
            <Image src={googlelogo} alt="Google Icon" width={20} height={20} className="mr-2" />
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </div>
    </Suspense >
  );
}
