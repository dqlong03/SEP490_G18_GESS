'use client';
import { useState } from 'react';
import { useAuthLogic } from '@/hooks/useAuth';
import ReCAPTCHA from 'react-google-recaptcha';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, User, Lock, AlertCircle, GraduationCap, Mail } from 'lucide-react';
import '@/styles/login.css';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, googleLogin, setRecaptchaToken } = useAuthLogic();

  // Google Login handler
  const googleLoginHandler = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: googleLogin,
    onError: () => setError('Đăng nhập với Google thất bại'),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit(username, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://static.vecteezy.com/system/resources/previews/008/167/404/non_2x/simply-soft-gradation-technology-background-free-vector.jpg)'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                  <Image src="/uni.png" alt="FPT University" width={80} height={80} className="mx-auto" />
                </div>
              </div>
            </div>

            {/* Welcome Text */}
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Chào mừng đến với
              <span className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                GESS 
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Hệ thống quản lý giáo dục hiện đại và chuyên nghiệp
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Quản lý học tập</h3>
                  <p className="text-white/70 text-sm">Theo dõi tiến độ và kết quả học tập</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Quản lý người dùng</h3>
                  <p className="text-white/70 text-sm">Hệ thống phân quyền linh hoạt</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Bảo mật cao</h3>
                  <p className="text-white/70 text-sm">Thông tin được bảo vệ tuyệt đối</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 login-container overflow-y-auto">
          <div className="w-full max-w-sm my-4">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <Image src="/uni.png" alt="FPT University" width={40} height={40} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mt-3">FPT University</h2>
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white mb-1">Đăng nhập</h1>
                <p className="text-slate-300 text-sm">Truy cập vào hệ thống của bạn</p>
              </div>

              {/* Form */}
              <div className="px-6 py-6">
                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium text-sm">Có lỗi xảy ra</p>
                      <p className="text-red-600 text-xs">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Username field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên đăng nhập
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        className="tailwind-input w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 text-sm"
                        placeholder="Nhập tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="tailwind-input w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 text-sm"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 w-12 flex items-center justify-center hover:bg-gray-100/50 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div className="text-right">
                    <Link 
                      href="/common/forgotpass" 
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* ReCAPTCHA */}
                  <div className="flex justify-center">
                    <div className="transform scale-90">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                        onChange={(token) => setRecaptchaToken(token || '')}
                      />
                    </div>
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Đăng nhập
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-4 flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 px-4 text-xs text-gray-500 font-medium bg-gray-50 rounded-full py-1">
                    Hoặc đăng nhập bằng
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Google login */}
                <button
                  type="button"
                  onClick={() => googleLoginHandler()}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm"
                >
                  <Image src="/googlelogo.png" alt="Google" width={18} height={18} />
                  Google
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-white/80 text-xs">
                © 2025 FPT University. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}