'use client';

import { useChangePassword } from '@/hooks/common/changePassHook';
import Link from 'next/link';
import Image from 'next/image';
import universitylogo from '@public/uni.png';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import '@/styles/forgotpass.css';
import { Suspense } from "react";

export default function ChangePasswordPage() {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    loading,
    handleSubmit,
  } = useChangePassword();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative animate-fadeIn">
      <div className="school-info absolute top-4 left-4 flex items-center space-x-2 lg:flex hidden animate-fadeInDelayed">
        <Image src={universitylogo} alt="School Icon" width={50} height={50} />
        <span className="text-2xl font-semibold text-gray-800">Fpt University</span>
      </div>
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        <div className="hidden lg:block animate-fadeInDelayed">
          <h2 className="text-2xl font-extrabold text-gray-900">Đổi mật khẩu</h2>
        </div>
        <p className="text-sm text-gray-600 opacity-75 mb-4 animate-fadeInDelayed">Tạo mới mật khẩu cho tài khoản của bạn</p>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
            {success}
          </div>
        )}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label htmlFor="password" className="sr-only">Mật khẩu mới</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm animate-fadeInDelayed"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <label htmlFor="confirmPassword" className="sr-only">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm animate-fadeInDelayed"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <div className="space-y-2 mb-4 mt-8">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" />
              <span className="text-sm text-gray-600">Ít nhất 6 ký tự</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" />
              <span className="text-sm text-gray-600">Bao gồm chữ cái và số</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" />
              <span className="text-sm text-gray-600">Có ít nhất một ký tự đặc biệt (ví dụ: @, #, !)</span>
            </div>
          </div>
          <button
            type="submit"
            className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 mb-4 animate-fadeInDelayed"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
        <div className="mt-4 text-sm animate-fadeInDelayed">
          <Link
            href="/common/login"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 transform hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay trở lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
   
  );
}
