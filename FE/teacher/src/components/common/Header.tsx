'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import '@/styles/header.css';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { getUserInitialsFromToken, resetToken } from '@/utils/tokenUtils';

interface HeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Header({ setIsSidebarOpen }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initials, setInitials] = useState('U');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setInitials(getUserInitialsFromToken());
  }, []);

  const handleLogout = () => {
    resetToken(); // Giả định hàm resetToken để xóa token
    router.push('/common/login'); // Chuyển hướng về trang login
  };

  return (
<header className="fixed top-0 left-0 right-0 w-full bg-white text-gray-600 p-2 flex justify-between items-center shadow-md z-50 pl-8">      <div className="flex items-center space-x-2">
        <button
          className="lg:hidden mr-2 text-gray-800"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/uni.png" alt="School Icon" width={30} height={30} />
          <span className="text-md font-semibold">FPT University</span>
        </div>
      </div>

    <div className="relative">
  <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-all duration-200 group"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
        {initials}
      </div>
    </div>
    <ChevronDown 
      size={14} 
      className={`text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
    />
  </button>

  {isDropdownOpen && (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-10" 
        onClick={() => setIsDropdownOpen(false)}
      ></div>
      
      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/50 z-20 overflow-hidden">
        {/* Profile Header - Compact */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Giáo viên FPT</p>
            </div>
          </div>
        </div>

        {/* Menu Items - Compact */}
        <div className="py-1">
          <Link 
            href="/common/profile" 
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
              <User size={14} className="group-hover:text-blue-600" />
            </div>
            <span className="font-medium text-sm">Thông tin cá nhân</span>
          </Link>

          <div className="border-t border-gray-200 my-1 mx-3"></div>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
              <LogOut size={14} />
            </div>
            <span className="font-medium text-sm">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  )}
</div>
    </header>
  );
}
