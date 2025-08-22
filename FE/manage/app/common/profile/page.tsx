'use client';

import { useProfile } from '@/hooks/common/profileHook';
import { Suspense } from "react";
export default function ProfilePage() {
  const {
    user,
    editMode,
    setEditMode,
    form,
    loading,
    handleChange,
    handleSave,
    userId,
  } = useProfile();

  if (!userId) {
    return <div className="text-center text-red-500 mt-10">Không tìm thấy thông tin người dùng.</div>;
  }

  if (loading && !user) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (!user) {
    return <div className="text-center text-red-500 mt-10">Không tìm thấy thông tin người dùng.</div>;
  }

  // Các trường chỉ xem, loại bỏ userId
  const readonlyFields = Object.entries(user).filter(
    ([key]) =>
      !['userId', 'fullname', 'phoneNumber', 'gender', 'dateOfBirth', 'userName', 'email', 'isActive'].includes(key)
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-black opacity-80 text-left">Thông tin cá nhân</h1>
      {!editMode ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-gray-500 text-sm mb-1">Tên người dùng</span>
              <span className="font-medium text-lg">{user.userName}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm mb-1">Email</span>
              <span className="font-medium text-lg">{user.email}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm mb-1">Trạng thái</span>
              <span className={`font-medium text-lg ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            {readonlyFields.map(([key, value]) => (
              <div key={key}>
                <span className="block text-gray-500 text-sm mb-1">{key}</span>
                <span className="font-medium text-lg">{String(value ?? '')}</span>
              </div>
            ))}
            <div>
              <span className="block text-gray-500 text-sm mb-1">Họ tên</span>
              <span className="font-medium text-lg">{user.fullname}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm mb-1">Số điện thoại</span>
              <span className="font-medium text-lg">{user.phoneNumber || ''}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm mb-1">Giới tính</span>
              <span className="font-medium text-lg">
                {user.gender === true ? 'Nam' : user.gender === false ? 'Nữ' : ''}
              </span>
            </div>

            <div>
              <span className="block text-gray-500 text-sm mb-1">Ngày sinh</span>
              <span className="font-medium text-lg">
                {user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : ''}
              </span>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={() => setEditMode(true)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-lg"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Tên người dùng</label>
              <input
                value={user.userName}
                disabled
                className="w-full p-3 border border-gray-200 rounded bg-gray-100 text-lg"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full p-3 border border-gray-200 rounded bg-gray-100 text-lg"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Trạng thái</label>
              <input
                value={user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                disabled
                className="w-full p-3 border border-gray-200 rounded bg-gray-100 text-lg"
              />
            </div>
            {readonlyFields.map(([key, value]) => (
              <div key={key}>
                <label className="block text-gray-500 text-sm mb-1">{key}</label>
                <input
                  value={String(value ?? '')}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded bg-gray-100 text-lg"
                />
              </div>
            ))}
            <div>
              <label className="block text-gray-500 text-sm mb-1">Họ tên</label>
              <input
                name="fullname"
                value={form.fullname || ''}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded text-lg"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Số điện thoại</label>
              <input
                name="phoneNumber"
                value={form.phoneNumber || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded text-lg"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Giới tính</label>
              <select
                name="gender"
                value={form.gender === true ? 'true' : form.gender === false ? 'false' : ''}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded text-lg"
              >
                <option value="">--Chọn--</option>
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Ngày sinh</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded text-lg"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-lg"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              disabled={loading}
              className="px-8 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition text-lg"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
    </Suspense>
  );
}
