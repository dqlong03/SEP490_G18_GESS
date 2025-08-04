'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserRoleFromToken } from '@/utils/tokenUtils';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    handleResize();
    setRole(getUserRoleFromToken());
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={handleClose}
        ></div>
      )}     <aside
        className={`h-screen left-0 h-screen z-20 transition-all duration-300 
          ${isMobile ? (isSidebarOpen ? 'w-70' : 'w-0') : 'w-70'}
          bg-white border-r border-gray-200 shadow-xl overflow-hidden`}
        style={{ pointerEvents: 'auto' }}
      >        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">GESS Management</h1>
            <p className="text-xs text-gray-500">Hệ thống quản lý giáo dục</p>
          </div>
        </div>        <nav className="py-6 px-3 h-[calc(100vh-120px)] overflow-y-auto">
          {role === 'Admin' && (
            <div className="mb-8">
              <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản trị hệ thống</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/manageuser"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                      ${pathname === '/admin/manageuser'
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                    `}
                    onClick={handleClose}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>Quản lý người dùng</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                      ${pathname === '/admin/dashboard'
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                    `}
                    onClick={handleClose}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Thống kê hệ thống</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {role === 'Examination' && (
            <>
              <div className="mb-8">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý học thuật</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/examination/managemajor"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/managemajor'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Quản lý ngành</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/examination/managesubject"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/managesubject'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Quản lý môn học</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/examination/manageteacher"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/manageteacher'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Quản lý giáo viên</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/examination/manageroom"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/manageroom'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Quản lý phòng học</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/examination/managesemester"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/managesemester'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Quản lý kỳ học</span>
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="mb-8">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý thi cử</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/examination/examslot/create"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/examslot/create'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span>Tạo ca thi</span>
                      <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">New</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}