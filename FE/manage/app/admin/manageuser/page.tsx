'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { useRouter } from 'next/navigation';

type User = {
  userId: string;
  userName: string;
  email: string;
  fullname?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: boolean;
  isActive?: boolean;
  role?: string; // Nếu API trả về role
};

const API_BASE = 'https://localhost:7074';

export default function ManageUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

  // Lấy danh sách user từ API
  useEffect(() => {
    fetch(`${API_BASE}/api/User`)
      .then(res => res.json())
      .then(data => setUsers(data || []))
      .catch(() => setUsers([]));
  }, []);

  // Lấy danh sách role từ dữ liệu (nếu có)
  const roleOptions = Array.from(new Set(users.map(u => u.role).filter(Boolean)));

  // Lọc user theo search, role, status
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      user.userName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus =
      statusFilter === ''
        ? true
        : statusFilter === 'active'
        ? user.isActive
        : !user.isActive;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Chuyển hướng khi double click
  const handleRowClick = (userId: string) => {
    if (clickCount === 1) {
      router.push(`/admin/manageuser/userinfo/${userId}`);
      setClickCount(0);
    } else {
      setClickCount(1);
      setTimeout(() => setClickCount(0), 500);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 fadeIn">
      {/* Thanh tìm kiếm và filter */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg flex-1">
          <Search className="ml-4 text-gray-500" />
          <input
            type="text"
            className="w-full p-3 pl-10 border-none rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Combobox filter role nếu có */}
        {roleOptions.length > 0 && (
          <select
            className="p-2 border rounded-md"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả chức vụ</option>
            {roleOptions.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        )}
        {/* Combobox filter trạng thái */}
        <select
          className="p-2 border rounded-md"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      {/* Số lượng người dùng */}
      <div className="mb-4 text-sm text-gray-700">
        Số lượng người dùng: <span className="font-semibold">{filteredUsers.length}</span>
      </div>

      {/* Bảng người dùng */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Mã NV</th>
              <th className="px-4 py-2 text-left">Tên đăng nhập</th>
              <th className="px-4 py-2 text-left">Email</th>
              {roleOptions.length > 0 && <th className="px-4 py-2 text-left">Chức vụ</th>}
              <th className="px-4 py-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.userId}
                className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} cursor-pointer hover:bg-gray-200`}
                onClick={() => handleRowClick(user.userId)}
              >
                <td className="px-4 py-2">{user.userId}</td>
                <td className="px-4 py-2">{user.userName}</td>
                <td className="px-4 py-2">{user.email}</td>
                {roleOptions.length > 0 && <td className="px-4 py-2">{user.role}</td>}
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {user.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={roleOptions.length > 0 ? 5 : 4} className="text-center py-4 text-gray-500">
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
