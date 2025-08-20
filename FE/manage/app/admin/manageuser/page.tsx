"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUsers } from "@hooks/admin/manageUserHook";
import { Suspense } from "react";

export default function ManageUser() {
  const {
    filteredUsers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    roleOptions,
  } = useUsers();
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

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
    <Suspense fallback={<div>Loading...</div>}>
    <div className="container mx-auto px-4 py-6 fadeIn">
      {/* Search and filter bar */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg flex-1">
          <Search className="ml-4 text-gray-500" />
          <input
            type="text"
            className="w-full p-3 pl-10 border-none rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {roleOptions.length > 0 && (
          <select
            className="p-2 border rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả chức vụ</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        )}
        <select
          className="p-2 border rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      <div className="mb-4 text-sm text-gray-700">
        Số lượng người dùng:{" "}
        <span className="font-semibold">{filteredUsers.length}</span>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Mã NV</th>
              <th className="px-4 py-2 text-left">Tên đăng nhập</th>
              <th className="px-4 py-2 text-left">Email</th>
              {roleOptions.length > 0 && (
                <th className="px-4 py-2 text-left">Chức vụ</th>
              )}
              <th className="px-4 py-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.userId}
                className={`border-t ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} cursor-pointer hover:bg-gray-200`}
                onClick={() => handleRowClick(user.userId)}
              >
                <td className="px-4 py-2">{user.code}</td>
                <td className="px-4 py-2">{user.userName}</td>
                <td className="px-4 py-2">{user.email}</td>
                {roleOptions.length > 0 && (
                  <td className="px-4 py-2">{user.role}</td>
                )}
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {user.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={roleOptions.length > 0 ? 5 : 4}
                  className="text-center py-4 text-gray-500"
                >
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </Suspense>
  );
}
