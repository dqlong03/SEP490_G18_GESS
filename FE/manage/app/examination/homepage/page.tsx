'use client';
import { useState } from "react";
import { Users, BarChart3, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import "@styles/adminhomepage.css";

export default function AdminHomepage() {
  const [showPopup, setShowPopup] = useState(false);

  const handleOpenPopup = (section: string) => {
    setShowPopup(true);
    // Có thể set section nếu cần sau này
  };

  return (
    <>
      {/* Banner section */}
      <div className="relative h-[40vh] w-full overflow-hidden rounded-xl shadow-xl hover:shadow-3xl transition-shadow duration-300 fade-in">
        <Image
          src="/adminhomepage.png"
          alt="Admin Homepage Background"
          fill
          className="sm:object-fill transition-transform duration-500 hover:scale-105 hover:brightness-110"
          priority
        />

        <div className="relative text-left text-black z-10 px-8 lg:mx-10">
          <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-normal pt-10 tracking-wider">
            HƯỚNG DẪN NGƯỜI DÙNG
          </h1>
          <p className="text-sm md:text-xl lg:text-md mt-4 font-light tracking-wider text-blink">
            Nhấn vào mục bên dưới để xem
          </p>
        </div>
      </div>

      {/* Feature section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-20 px-6 py-12 text-center bg-white fade-in mt-5 shadow-xl">
        {/* Cột 1 */}
        <div
          className="cursor-pointer transition-transform duration-300 transform hover:scale-105"
          onClick={() => handleOpenPopup("user-management")}
        >
          <Users className="mx-auto mb-4 w-8 h-8 text-blue-600" />
          <h3 className="text-base font-semibold">Quản lý người dùng</h3>
          <p className="mt-2 text-sm text-gray-600 tracking-wider">
            Bao gồm các chức năng thêm người dùng mới, thay đổi quyền truy cập, thay đổi thông tin
          </p>
        </div>

        {/* Cột 2 */}
        <div
          className="cursor-pointer transition-transform duration-300 transform hover:scale-105"
          onClick={() => handleOpenPopup("system-stats")}
        >
          <BarChart3 className="mx-auto mb-4 w-8 h-8 text-blue-600" />
          <h3 className="text-base font-semibold">Thống kê hệ thống</h3>
          <p className="mt-2 text-sm text-gray-600 tracking-wider">
            Bao gồm các thông tin về người dùng, phòng học, giáo viên, môn học ngành học
          </p>
        </div>

        {/* Cột 3 */}
        <div
          className="cursor-pointer transition-transform duration-300 transform hover:scale-105"
          onClick={() => handleOpenPopup("general-info")}
        >
          <ShieldCheck className="mx-auto mb-4 w-8 h-8 text-blue-600" />
          <h3 className="text-base font-semibold">Thông tin chung</h3>
          <p className="mt-2 text-sm text-gray-600 tracking-wider">
            Về bảo mật, cách thức quản lý, vận hành với tài khoản admin
          </p>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-white bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">Popup đang mở</h2>
            <p className="text-sm text-gray-600">Nội dung popup ở đây...</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
