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
          className="fixed inset-0 backdrop-blur-sm z-10"
          onClick={handleClose}
        ></div>
      )}     <aside
        className={`fixed top-0 left-0 h-screen z-20 transition-all duration-300 pt-13  
          ${isMobile ? (isSidebarOpen ? 'w-80' : 'w-0') : 'w-70'}
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
          {role?.toLowerCase() === 'admin' && (
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
          {role?.toLowerCase() === 'examination' && (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 3L12 2l1.5 1H21v4H3V3h7.5z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Tạo ca thi</span>
                      <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">New</span>
                    </Link>
                  </li>

                   <li>
                    <Link
                      href="/examination/examslot/list"
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/examination/examslot/list'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M6 7V6a2 2 0 012-2h8a2 2 0 012 2v1M6 7h12v10a2 2 0 01-2 2H8a2 2 0 01-2-2V7zM8 11h8M8 15h4" />
                      </svg>
                      <span>Danh sách ca thi</span>
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