'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Subject = {
  subjectId: number;
  subjectName: string;
  description?: string;
  course?: string;
  noCredits: number;
};

type SubjectForm = {
  subjectName: string;
  description?: string;
  course?: string;
  noCredits: number;
};

const API_URL = 'https://localhost:7074/api/Subject';

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectForm>({
    subjectName: '',
    description: '',
    course: '',
    noCredits: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Menu state
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Pagination & search state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');

  const router = useRouter();

  // Fetch subjects with pagination and search
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());

      const res = await fetch(`${API_URL}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);

      // Count page
      const countParams = new URLSearchParams();
      if (searchName) countParams.append('name', searchName);
      countParams.append('pageSize', pageSize.toString());
      const countRes = await fetch(`${API_URL}/CountPage?${countParams.toString()}`);
      if (countRes.ok) {
        const count = await countRes.json();
        setTotalPages(Math.ceil(count / pageSize));
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // Handle submit (add or update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId === null) {
        // Add
        const res = await fetch(`${API_URL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to add subject');
      } else {
        // Update
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: editingId,
            ...form,
          }),
        });
        if (!res.ok) throw new Error('Failed to update subject');
      }
      setForm({ subjectName: '', description: '', course: '', noCredits: 0 });
      setEditingId(null);
      setShowPopup(false);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (subject: Subject) => {
    setForm({
      subjectName: subject.subjectName,
      description: subject.description || '',
      course: subject.course || '',
      noCredits: subject.noCredits,
    });
    setEditingId(subject.subjectId);
    setShowPopup(true);
  };

  // Handle search
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchSubjects();
  };

  // Handle menu actions
  const handleMenuAction = (action: 'score' | 'chapter', subjectId: number) => {
    setOpenMenuId(null);
    if (action === 'score') {
      router.push(`/examination/managesubject/managescore?subjectId=${subjectId}`);
    } else if (action === 'chapter') {
      router.push(`/examination/managesubject/managechapter?subjectId=${subjectId}`);
    }
  };

  // Popup close
  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({ subjectName: '', description: '', course: '', noCredits: 0 });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-4xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý môn học</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center mb-10">
          <input
            type="text"
            placeholder="Tìm theo tên môn học"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-40"
          />
          <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition font-semibold">
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setPageNumber(1);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPopup(true);
              setEditingId(null);
              setForm({ subjectName: '', description: '', course: '', noCredits: 0 });
            }}
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
              <h3 className="text-xl font-bold mb-4 text-gray-700">{editingId === null ? 'Thêm môn học' : 'Cập nhật môn học'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Tên môn học</label>
                  <input
                    name="subjectName"
                    placeholder="Tên môn học"
                    value={form.subjectName}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Khóa học (VD: CS101)</label>
                  <input
                    name="course"
                    placeholder="Khóa học"
                    value={form.course}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tín chỉ</label>
                  <input
                    name="noCredits"
                    type="number"
                    placeholder="Tín chỉ"
                    value={form.noCredits}
                    onChange={handleChange}
                    required
                    min={0}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    placeholder="Mô tả"
                    value={form.description}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition min-h-[40px]"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold flex-1"
                  >
                    {editingId === null ? 'Thêm mới' : 'Cập nhật'}
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

        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b">ID</th>
                <th className="py-2 px-2 border-b">Tên môn học</th>
                <th className="py-2 px-2 border-b">Khóa học</th>
                <th className="py-2 px-2 border-b">Tín chỉ</th>
                <th className="py-2 px-2 border-b">Mô tả</th>
                <th className="py-2 px-2 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.subjectId}>
                  <td className="py-2 px-2 text-center border-b">{subject.subjectId}</td>
                  <td className="py-2 px-2 border-b">{subject.subjectName}</td>
                  <td className="py-2 px-2 border-b">{subject.course}</td>
                  <td className="py-2 px-2 text-center border-b">{subject.noCredits}</td>
                  <td className="py-2 px-2 border-b">{subject.description}</td>
                  <td className="py-2 px-2 text-center border-b" style={{ position: 'relative' }}>
                    <button
                      onClick={() => handleEdit(subject)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === subject.subjectId ? null : subject.subjectId)}
                      className="inline-flex items-center justify-center px-2 py-1 rounded hover:bg-gray-100 transition"
                      title="Chức năng khác"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === subject.subjectId && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-8 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[180px]"
                      >
                        <button
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition"
                          onClick={() => handleMenuAction('score', subject.subjectId)}
                        >
                          Quản lý đầu điểm
                        </button>
                        <button
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition"
                          onClick={() => handleMenuAction('chapter', subject.subjectId)}
                        >
                          Quản lý chapter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có môn học nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-wrap justify-left items-center gap-2 text-base">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="mx-2 font-semibold">
            Trang {pageNumber} / {totalPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            disabled={pageNumber === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang sau
          </button>
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
