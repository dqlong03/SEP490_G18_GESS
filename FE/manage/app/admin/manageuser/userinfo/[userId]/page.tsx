'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type User = {
  userId: string;
  userName: string;
  email: string;
  fullname?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: boolean;
  isActive?: boolean;
  role?: string;
};

const API_BASE = 'https://localhost:7074';

export default function UserInformation() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [userData, setUserData] = useState<Partial<User>>({});
  const [apiFields, setApiFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/User/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setApiFields(Object.keys(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (id === 'gender') {
      setUserData(prev => ({
        ...prev,
        gender: value === '' ? undefined : value === 'male'
      }));
    } else if (id === 'isActive') {
      setUserData(prev => ({
        ...prev,
        isActive: value === '' ? undefined : value === 'active'
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleBackClick = () => {
    router.push('/admin/manageuser');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only submit fields that exist in the API response
    const submitData: Partial<User> = {};
    apiFields.forEach(field => {
      if (userData[field as keyof User] !== undefined) {
        (submitData as any)[field] = userData[field as keyof User];
      }
    });
    await fetch(`${API_BASE}/api/User/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    });
    // Optionally show a success message or redirect
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <form
        className="w-full px-4 max-w-7xl bg-white shadow-lg rounded-lg p-6 space-y-6"
        onSubmit={handleSubmit}
      >
        {/* General Info Section */}
        <section className="space-y-4 fadeIn">
          <h2 className="text-xl font-semibold text-gray-700 bg-gray-100 p-2 rounded-md">Thông tin chung</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-semibold text-gray-700">Mã nhân viên</label>
              <input
                id="userId"
                type="text"
                value={userData.userId || ''}
                className="w-full p-2 rounded-md border border-gray-300"
                disabled
              />
            </div>
            <div>
              <label htmlFor="userName" className="block text-sm font-semibold text-gray-700">Tên đăng nhập</label>
              <input
                id="userName"
                type="text"
                value={userData.userName || ''}
                className="w-full p-2 rounded-md border border-gray-300"
                disabled
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={userData.email || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700">Họ tên</label>
              <input
                id="fullname"
                type="text"
                value={userData.fullname || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700">Số điện thoại</label>
              <input
                id="phoneNumber"
                type="tel"
                value={userData.phoneNumber || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700">Ngày sinh</label>
              <input
                id="dateOfBirth"
                type="date"
                value={userData.dateOfBirth ? userData.dateOfBirth.substring(0, 10) : ''}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700">Chức vụ</label>
              <input
                id="role"
                type="text"
                value={userData.role || ''}
                className="w-full p-2 rounded-md border border-gray-300"
                disabled
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">Giới tính</label>
              <select
                id="gender"
                value={
                  userData.gender === undefined
                    ? ''
                    : userData.gender
                    ? 'male'
                    : 'female'
                }
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              >
                <option value="">Chọn</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div>
              <label htmlFor="isActive" className="block text-sm font-semibold text-gray-700">Trạng thái</label>
              <select
                id="isActive"
                value={
                  userData.isActive === undefined
                    ? ''
                    : userData.isActive
                    ? 'active'
                    : 'inactive'
                }
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              >
                <option value="">Chọn</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <div className="flex space-x-4 mt-15">
          <button
            type="button"
            onClick={handleBackClick}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="px-6 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Lưu thông tin
          </button>
        </div>
      </form>
    </div>
  );
}
