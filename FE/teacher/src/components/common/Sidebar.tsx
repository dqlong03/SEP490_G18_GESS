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
      )}
      
      <aside
        className={`fixed top-0 left-0 h-screen z-20 transition-all duration-300 pt-13
          ${isMobile ? (isSidebarOpen ? 'w-80' : 'w-0') : 'w-70'}
          bg-white border-r border-gray-200 shadow-xl overflow-hidden`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
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
        </div>

        <nav className="py-4 px-3 h-[calc(100vh-80px)] overflow-y-auto">
          

          {role?.toLowerCase() === 'teacher' && (
            <>
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý lớp học</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/teacher/myclass"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/myclass'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Lớp của tôi</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/questionbank"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/questionbank'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Ngân hàng câu hỏi</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý thi cử</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/teacher/examsupervisor"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/examsupervisor'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Lịch coi thi</span>
                    </Link>
                  </li>
                   <li>
                    <Link
                      href="/teacher/examsupervisornotyet"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/examsupervisornotyet'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Coi thi</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/givegrade"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/givegrade'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Chấm thi</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Thi cuối kỳ</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/teacher/finalexam"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/finalexam'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                      </svg>
                      <span>Bài thi cuối kỳ</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/finalexampaper"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname.startsWith('/teacher/finalexampaper')
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Đề thi cuối kỳ</span>
                      <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">Hot</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}

          {role?.toLowerCase() === 'hod' && (
            <>
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý lớp học</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/teacher/myclass"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/myclass'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Lớp của tôi</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/questionbank"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/questionbank'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Ngân hàng câu hỏi</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý thi cử</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/teacher/examsupervisor"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/examsupervisor'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Lịch coi thi</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/teacher/examsupervisornotyet"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/examsupervisornotyet'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Coi thi</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/givegrade"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/givegrade'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Chấm thi</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Quản lý chuyên ngành                  <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">HOD</span>
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/leader/setrole"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/leader/setrole'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Phân quyền giáo viên</span>
                    </Link>

                  </li>
                  
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Thi cuối kỳ</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/teacher/finalexam"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname === '/teacher/finalexam'
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                      </svg>
                      <span>Bài thi cuối kỳ</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/teacher/finalexampaper"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group
                        ${pathname.startsWith('/teacher/finalexampaper')
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                      `}
                      onClick={handleClose}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Đề thi cuối kỳ</span>
                      <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">Hot</span>
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