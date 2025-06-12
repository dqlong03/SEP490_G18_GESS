'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import universitylogo from '@public/uni.png';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import '@/styles/forgotpass.css';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra nếu mật khẩu và xác nhận mật khẩu khớp
    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    // Kiểm tra yêu cầu mật khẩu
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordPattern.test(password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái, số và ký tự đặc biệt.');
      return;
    }

    // Lấy email từ sessionStorage (đã lưu ở bước xác thực OTP)
    const email = typeof window !== 'undefined' ? sessionStorage.getItem('resetEmail') : null;
    if (!email) {
      setError('Không tìm thấy email xác thực. Vui lòng quay lại bước nhập email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://localhost:7074/api/Auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword: password,
          confirmPassword: confirmPassword,
        }),
      });

      if (res.ok) {
        setSuccess('Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...');
        setTimeout(() => {
          router.push('/common/login');
        }, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative animate-fadeIn">
      {/* Logo + tên trường (màn hình lớn) */}
      <div className="school-info absolute top-4 left-4 flex items-center space-x-2 lg:flex hidden animate-fadeInDelayed">
        <Image src={universitylogo} alt="School Icon" width={50} height={50} />
        <span className="text-2xl font-semibold text-gray-800">Fpt University</span>
      </div>

      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        {/* Header khi màn hình lớn */}
        <div className="hidden lg:block animate-fadeInDelayed">
          <h2 className="text-2xl font-extrabold text-gray-900">Đổi mật khẩu</h2>
        </div>
        <p className="text-sm text-gray-600 opacity-75 mb-4 animate-fadeInDelayed">Tạo mới mật khẩu cho tài khoản của bạn</p>

        {/* Hiển thị lỗi hoặc thành công */}
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
          {/* Input mật khẩu mới */}
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

          {/* Input xác nhận mật khẩu */}
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

          {/* Các yêu cầu mật khẩu */}
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
