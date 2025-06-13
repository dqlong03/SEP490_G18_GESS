'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '@styles/sidebar.css';
import { getUserRoleFromToken } from '@/utils/tokenUtils';

interface SidebarProps {    
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    handleResize();
    setRole(getUserRoleFromToken());
    console.log(role);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={handleClose}
        ></div>
      )}
      <aside className={`sidebar ${isMobile ? (isSidebarOpen ? 'w-64 shadow-xl mt-10' : 'w-0') : 'w-64 shadow-xl'} ${isMobile && isSidebarOpen ? 'fixed' : ''}`}>
        <ul className="sidebar-list">
          {role === 'Admin' && (
            <>
              <li><Link href="/admin/manageuser" className="sidebar-link" onClick={handleClose}>Quản lý người dùng</Link></li>
              <li><Link href="/admin/dashboard" className="sidebar-link" onClick={handleClose}>Thống kê hệ thống</Link></li>
            </>
          )}
          {role == 'Examination' && (
            <>
              <li><Link href="/examination/managemajor" className="sidebar-link" onClick={handleClose}>Quản lý ngành</Link></li>
              <li><Link href="/examination/managesubject" className="sidebar-link" onClick={handleClose}>Quản lý môn học</Link></li>
              <li><Link href="/examination/manageteacher" className="sidebar-link" onClick={handleClose}>Quản lý giáo viên</Link></li>
              <li><Link href="/room-management" className="sidebar-link" onClick={handleClose}>Quản lý phòng học</Link></li>
            </>
          )}
          
        </ul>
      </aside>
    </>
  );
}