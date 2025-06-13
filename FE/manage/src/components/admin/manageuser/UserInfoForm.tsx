'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { User } from "@services/admin/userInfoService";

type Props = {
  userData: Partial<User>;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
};

export default function UserInfoForm({ userData, loading, handleChange, handleSubmit }: Props) {
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <form
        className="w-full px-4 max-w-7xl bg-white shadow-lg rounded-lg p-6 space-y-6"
        onSubmit={handleSubmit}
      >
        <section className="space-y-4 fadeIn">
          <h2 className="text-xl font-semibold text-gray-700 bg-gray-100 p-2 rounded-md">Thông tin chung</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-gray-700">Mã nhân viên</label>
              <input id="userId" type="text" value={userData.userId || ''} className="w-full p-2 rounded-md border border-gray-300" disabled />
            </div>
            <div>
              <label htmlFor="userName" className="block text-sm font-semibold text-gray-700">Tên đăng nhập</label>
              <input id="userName" type="text" value={userData.userName || ''} className="w-full p-2 rounded-md border border-gray-300" disabled />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
              <input id="email" type="email" value={userData.email || ''} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" />
            </div>
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700">Họ tên</label>
              <input id="fullname" type="text" value={userData.fullname || ''} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700">Số điện thoại</label>
              <input id="phoneNumber" type="tel" value={userData.phoneNumber || ''} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700">Ngày sinh</label>
              <input id="dateOfBirth" type="date" value={userData.dateOfBirth ? userData.dateOfBirth.substring(0, 10) : ''} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700">Chức vụ</label>
              <input id="role" type="text" value={userData.role || ''} className="w-full p-2 rounded-md border border-gray-300" disabled />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">Giới tính</label>
              <select id="gender" value={userData.gender === undefined ? '' : userData.gender ? 'male' : 'female'} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300">
                <option value="">Chọn</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>  
              </select>
            </div>
            <div>
              <label htmlFor="isActive" className="block text-sm font-semibold text-gray-700">Trạng thái</label>
              <select id="isActive" value={userData.isActive === undefined ? '' : userData.isActive ? 'active' : 'inactive'} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300">
                <option value="">Chọn</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </section>
        <div className="flex space-x-4 mt-15">
          <button type="button" onClick={() => router.push('/admin/manageuser')} className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300">
            Quay lại
          </button>
          <button type="submit" className="px-6 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
            Lưu thông tin
          </button>
        </div>
      </form>
    </div>
  );
}
