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
          {role?.toLowerCase() === 'teacher' && (
            <>
              <li><Link href="/teacher/myclass" className="sidebar-link" onClick={handleClose}>Lớp của tôi</Link> </li>
              <li><Link href="/teacher/questionbank" className="sidebar-link" onClick={handleClose}>Ngân hàng câu hỏi</Link> </li>
              <li><Link href="/teacher/examsupervisor" className="sidebar-link" onClick={handleClose}>Lịch coi thi</Link> </li>
               <li><Link href="/teacher/givegrade" className="sidebar-link" onClick={handleClose}>Chấm thi</Link> </li>               
               {/* <li><Link href="/teacher/createexampaperfinal" className="sidebar-link" onClick={handleClose}>Tạo lịch thi</Link> </li> */}
              <li><Link href="/teacher/finalexam" className="sidebar-link" onClick={handleClose}>Bài thi cuối kỳ</Link> </li>               
               <li><Link href="/teacher/finalexampaper" className="sidebar-link" onClick={handleClose}>Đề thi cuối kỳ</Link> </li>               

            
            </>
          )}
          {role?.toLowerCase() == 'hod' && (
            <>
               <li><Link href="/teacher/myclass" className="sidebar-link" onClick={handleClose}>Lớp của tôi</Link> </li>
              <li><Link href="/teacher/questionbank" className="sidebar-link" onClick={handleClose}>Ngân hàng câu hỏi</Link> </li>
              <li><Link href="/teacher/examsupervisor" className="sidebar-link" onClick={handleClose}>Lịch coi thi</Link> </li>
               <li><Link href="/teacher/givegrade" className="sidebar-link" onClick={handleClose}>Chấm thi</Link> </li>
               <li><Link href="/leader/setrole" className="sidebar-link" onClick={handleClose}>Quản lý ngành</Link> </li>
               {/* <li><Link href="/teacher/createexampaperfinal" className="sidebar-link" onClick={handleClose}>Tạo lịch thi</Link> </li> */}
              <li><Link href="/teacher/finalexam" className="sidebar-link" onClick={handleClose}>Bài thi cuối kỳ</Link> </li>      
             <li><Link href="/teacher/finalexampaper" className="sidebar-link" onClick={handleClose}>Đề thi cuối kỳ</Link> </li>               
         

            </>
          )}
          
        </ul>
      </aside>
    </>
  );
}