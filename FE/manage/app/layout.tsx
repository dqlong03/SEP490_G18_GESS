// app/layout.tsx
"use client";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { isLayoutPage } from "@/utils/noLayoutPaths";
import { usePathname } from "next/navigation";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState, Dispatch, SetStateAction } from "react";

// Định nghĩa kiểu cho props
interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const showHeaderSidebar = !isLayoutPage(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Quản lý trạng thái ở đây

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <GoogleOAuthProvider clientId="542203501328-vsl3a9mr7pjmj9sro5tuc38673t289ae.apps.googleusercontent.com">
          <AuthProvider>
            {showHeaderSidebar && (
              <Header setIsSidebarOpen={setIsSidebarOpen} />
            )}
            <div className="flex flex-1">
              {showHeaderSidebar && (
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              )}
              <main className="flex-1 p-4">{children}</main>
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
