'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import universitylogo from '@public/uni.png';
import { ArrowLeft } from 'lucide-react';
import '@/styles/forgotpass.css'; 
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpString = otp.join('');
    const email = typeof window !== 'undefined' ? sessionStorage.getItem('resetEmail') : null;

    if (!email) {
      setError('Không tìm thấy email xác thực. Vui lòng quay lại bước nhập email.');
      return;
    }
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://localhost:7074/api/Otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      if (res.ok) {
        // Xác thực thành công, chuyển sang trang đổi mật khẩu
        router.push('/common/forgotpass/changepass');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    } else if (value === '') {
      // Cho phép xóa số
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
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
          <h2 className="text-2xl font-extrabold text-gray-900">Xác nhận mã OTP</h2>
        </div>
        <p className="text-sm text-gray-600 opacity-75 mb-4 animate-fadeInDelayed">Chúng tôi đã gửi mã OTP đến Gmail của bạn</p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="flex space-x-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onFocus={handleFocus}
                className="w-14 h-14 text-center text-2xl font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="•"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 mb-4 animate-fadeInDelayed"
            disabled={loading}
          >
            {loading ? 'Đang xác thực...' : 'Tiếp tục'}
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
