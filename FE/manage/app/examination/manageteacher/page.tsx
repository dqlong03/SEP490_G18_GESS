'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';

type Teacher = {
  teacherId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  gender: boolean;
  isActive: boolean;
  hireDate: string;
};

type TeacherForm = {
  userName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  gender: boolean;
  isActive: boolean;
  hireDate: string;
};

const API_URL = 'https://localhost:7074/api/Teacher';

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<TeacherForm>>({
    userName: '',
    email: '',
    phoneNumber: '',
    fullName: '',
    gender: true,
    isActive: true,
    hireDate: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Double click state
  const [lastClick, setLastClick] = useState<{ id: string; time: number } | null>(null);

  // Fetch teachers
  const fetchTeachers = async (keyword = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      const url = keyword
        ? `${API_URL}/search?${params.toString()}`
        : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      setTeachers(data);
    } catch {
      alert('Failed to fetch teachers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle form input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Add or update teacher
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Update
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        // Add
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm({
        userName: '',
        email: '',
        phoneNumber: '',
        fullName: '',
        gender: true,
        isActive: true,
        hireDate: '',
      });
      setEditingId(null);
      setShowPopup(false);
      fetchTeachers(search);
    } catch {
      alert('Failed to save teacher');
    }
    setLoading(false);
  };

  // Edit teacher (open popup)
  const handleEdit = (teacher: Teacher) => {
    setForm({
      userName: teacher.userName,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      fullName: teacher.fullName,
      gender: teacher.gender,
      isActive: teacher.isActive,
      hireDate: teacher.hireDate ? teacher.hireDate.slice(0, 10) : '',
    });
    setEditingId(teacher.teacherId);
    setShowPopup(true);
  };

  // Double click handler
  const handleRowClick = (teacher: Teacher) => {
    const now = Date.now();
    if (lastClick && lastClick.id === teacher.teacherId && now - lastClick.time < 400) {
      handleEdit(teacher);
    }
    setLastClick({ id: teacher.teacherId, time: now });
  };

  // Delete teacher
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa giáo viên này?')) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTeachers(search);
    } catch {
      alert('Failed to delete teacher');
    }
    setLoading(false);
  };

  // Search
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchTeachers(search);
  };

  // Popup close
  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({
      userName: '',
      email: '',
      phoneNumber: '',
      fullName: '',
      gender: true,
      isActive: true,
      hireDate: '',
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý giáo viên</h2>

        {/* Search bar */}
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
            onClick={() => { setSearch(''); fetchTeachers(''); }}
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

        {/* Popup Add/Edit */}
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

        {/* Teacher List */}
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
      {/* Tailwind animation for popup */}
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
