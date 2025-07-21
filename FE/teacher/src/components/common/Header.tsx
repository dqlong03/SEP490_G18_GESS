'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import universitylogo from '@public/uni.png';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import '@styles/header.css';

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
    <header className="bg-white text-gray-600 p-2 flex justify-between items-center shadow-md z-30 pl-8">
      <div className="flex items-center space-x-2">
        <button
          className="lg:hidden mr-2 text-gray-800"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Image src={universitylogo} alt="School Icon" width={30} height={30} />
          <span className="text-md font-semibold">FPT University</span>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer"
        >
          {initials}
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <Link 
              href="/common/profile" 
              onClick={() => setIsDropdownOpen(false)} // thêm dòng này
              className="block px-4 py-2 text-gray-800 no-underline hover:bg-gray-100"
            >
              Profile
            </Link>

            <button 
              onClick={handleLogout} 
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
