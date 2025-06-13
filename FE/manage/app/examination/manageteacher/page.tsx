'use client';

import { useTeachers } from '@/hooks/examination/manageTeacherHook';

export default function TeacherManagementPage() {
  const {
    teachers,
    loading,
    search,
    setSearch,
    form,
    editingId,
    showPopup,
    handleChange,
    handleSubmit,
    handleEdit,
    handleRowClick,
    handleDelete,
    handleSearch,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
  } = useTeachers();

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý giáo viên</h2>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center mb-6">
          <input
            type="text"
            placeholder="Tìm theo email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-48"
          />
          <button
            type="submit"
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition font-semibold"
            disabled={loading}
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => { setSearch(''); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={() => { setShowPopup(true); setEditingId(null); setForm({
              userName: '',
              email: '',
              phoneNumber: '',
              fullName: '',
              gender: true,
              isActive: true,
              hireDate: '',
            }); }}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold shadow"
          >
            + Thêm mới
          </button>
        </form>

        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-popup">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                onClick={closePopup}
                aria-label="Đóng"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-700">{editingId ? 'Cập nhật giáo viên' : 'Thêm giáo viên'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Tên đăng nhập</label>
                  <input
                    name="userName"
                    placeholder="Tên đăng nhập"
                    value={form.userName || ''}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    name="email"
                    placeholder="Email"
                    value={form.email || ''}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Số điện thoại</label>
                  <input
                    name="phoneNumber"
                    placeholder="Số điện thoại"
                    value={form.phoneNumber || ''}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Họ tên</label>
                  <input
                    name="fullName"
                    placeholder="Họ tên"
                    value={form.fullName || ''}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Giới tính</label>
                    <select
                      name="gender"
                      value={form.gender ? 'true' : 'false'}
                      onChange={e => setForm(f => ({ ...f, gender: e.target.value === 'true' }))}
                      className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Trạng thái</label>
                    <select
                      name="isActive"
                      value={form.isActive ? 'true' : 'false'}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                      className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Ngừng</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ngày vào làm</label>
                  <input
                    name="hireDate"
                    type="date"
                    placeholder="Ngày vào làm"
                    value={form.hireDate || ''}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold flex-1"
                  >
                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold flex-1"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b">Email</th>
                <th className="py-2 px-2 border-b">Trạng thái</th>
                <th className="py-2 px-2 border-b">Ngày vào làm</th>
                <th className="py-2 px-2 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr
                  key={t.teacherId}
                  className="hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => handleRowClick(t)}
                  title="Nhấn đúp để sửa"
                >
                  <td className="py-2 px-2 border-b">{t.email}</td>
                  <td className="py-2 px-2 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {t.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-b">{t.hireDate ? t.hireDate.slice(0, 10) : ''}</td>
                  <td className="py-2 px-2 border-b">
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(t); }}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(t.teacherId); }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-semibold"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Không có giáo viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.2s }
        @keyframes popup {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        .animate-popup { animation: popup 0.2s }
      `}</style>
    </div>
  );
}
