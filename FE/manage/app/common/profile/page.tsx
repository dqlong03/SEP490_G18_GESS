'use client';

import { useProfile } from '@/hooks/common/profileHook';
import { User, Edit3, Save, X, Phone, Mail, Calendar, UserCheck, Shield } from 'lucide-react';

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Lỗi xác thực</h3>
            <p className="text-gray-600">Không tìm thấy thông tin người dùng.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tải thông tin</h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Không tìm thấy dữ liệu</h3>
            <p className="text-gray-600">Không thể tải thông tin người dùng.</p>
          </div>
        </div>
      </div>
    );
  }

  // Các trường chỉ xem, loại bỏ userId
  const readonlyFields = Object.entries(user).filter(
    ([key]) =>
      !['userId', 'fullname', 'phoneNumber', 'gender', 'dateOfBirth', 'userName', 'email', 'isActive'].includes(key)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!editMode ? (
            /* View Mode */
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Thông tin cơ bản</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Tên người dùng</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">{user.userName}</span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Email</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">{user.email}</span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-lg font-semibold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Họ tên</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">{user.fullname || 'Chưa cập nhật'}</span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Số điện thoại</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">{user.phoneNumber || 'Chưa cập nhật'}</span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Giới tính</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {user.gender === true ? 'Nam' : user.gender === false ? 'Nữ' : 'Chưa cập nhật'}
                      </span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500">Ngày sinh</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              {readonlyFields.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin hệ thống</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readonlyFields.map(([key, value]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-500 block mb-1">{key.toLocaleUpperCase()}</span>
                        <span className="text-gray-800 font-medium">{String(value ?? 'N/A')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Edit3 className="w-5 h-5" />
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Read-only fields */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin không thể thay đổi</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <User className="w-4 h-4" />
                        Tên người dùng
                      </label>
                      <input
                        value={user.userName}
                        disabled
                        className="w-full p-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        value={user.email}
                        disabled
                        className="w-full p-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <UserCheck className="w-4 h-4" />
                        Trạng thái
                      </label>
                      <input
                        value={user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        disabled
                        className="w-full p-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin có thể chỉnh sửa</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="fullname"
                        value={form.fullname || ''}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Nhập họ tên đầy đủ"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </label>
                      <input
                        name="phoneNumber"
                        value={form.phoneNumber || ''}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={form.gender === true ? 'true' : form.gender === false ? 'false' : ''}
                        onChange={handleChange}
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="true">Nam</option>
                        <option value="false">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Ngày sinh
                      </label>
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={form.dateOfBirth || ''}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* System fields if any */}
              {readonlyFields.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin hệ thống</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readonlyFields.map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">{key}</label>
                        <input
                          value={String(value ?? '')}
                          disabled
                          className="w-full p-4 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}