'use client';

import Link from 'next/link';
import Image from 'next/image';
import universitylogo from '@public/uni.png';
import { ArrowLeft } from 'lucide-react';

type Props = {
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  success: string | null;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
};

export default function ForgotPasswordForm({
  email, setEmail, error, success, loading, handleSubmit
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative animate-fadeIn">
      <div className="school-info absolute top-4 left-4 flex items-center space-x-2 lg:flex hidden animate-fadeInDelayed">
        <Image src={universitylogo} alt="School Icon" width={50} height={50} />
        <span className="text-2xl font-semibold text-gray-800">Fpt University</span>
      </div>
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg">
        <div className="hidden lg:block animate-fadeInDelayed">
          <h2 className="text-2xl font-extrabold text-gray-900">Đặt lại mật khẩu</h2>
        </div>
        <p className="text-sm text-gray-600 opacity-75 mb-4 animate-fadeInDelayed">
          Nhập email của bạn để đặt lại mật khẩu
        </p>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded-md block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm animate-fadeInDelayed"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 mb-4 animate-fadeInDelayed"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Tiếp tục'}
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
