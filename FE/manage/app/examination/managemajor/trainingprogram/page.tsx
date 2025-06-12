'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type TrainingProgram = {
  trainingProgramId: number;
  trainProName: string;
  startDate: string;
  endDate?: string | null;
  noCredits: number;
};

type TrainingProgramForm = {
  trainProName: string;
  startDate: string;
  endDate?: string | null;
  noCredits: number;
};

const API_URL = 'https://localhost:7074/api/TrainingProgram';

export default function TrainingProgramManager() {
  // Lấy majorId từ query string
  const searchParams = useSearchParams();
  const majorId = Number(searchParams.get('majorId')) || 1;

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TrainingProgramForm>({
    trainProName: '',
    startDate: '',
    endDate: '',
    noCredits: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Pagination & search state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');

  // Double click state
  const [lastClick, setLastClick] = useState<{ id: number; time: number } | null>(null);

  const router = useRouter();

  // Fetch training programs with pagination and search
  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchFromDate) params.append('fromDate', searchFromDate);
      if (searchToDate) params.append('toDate', searchToDate);
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());

      const res = await fetch(`${API_URL}/${majorId}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch training programs');
      const data = await res.json();
      setPrograms(data);

      const countParams = new URLSearchParams();
      if (searchName) countParams.append('name', searchName);
      if (searchFromDate) countParams.append('fromDate', searchFromDate);
      if (searchToDate) countParams.append('toDate', searchToDate);
      countParams.append('pageSize', pageSize.toString());

      const countRes = await fetch(`${API_URL}/count/${majorId}?${countParams.toString()}`);
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
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName, searchFromDate, searchToDate, majorId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        const res = await fetch(`${API_URL}/${majorId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainProName: form.trainProName,
            startDate: form.startDate,
            endDate: form.endDate,
            noCredits: form.noCredits,
          }),
        });
        if (!res.ok) throw new Error('Failed to add training program');
      } else {
        // Update
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainingProgramId: editingId,
            trainProName: form.trainProName,
            startDate: form.startDate,
            endDate: form.endDate,
            noCredits: form.noCredits,
          }),
        });
        if (!res.ok) throw new Error('Failed to update training program');
      }
      setForm({ trainProName: '', startDate: '', endDate: '', noCredits: 0 });
      setEditingId(null);
      setShowPopup(false);
      fetchPrograms();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (program: TrainingProgram) => {
    setForm({
      trainProName: program.trainProName,
      startDate: program.startDate ? program.startDate.substring(0, 10) : '',
      endDate: program.endDate ? program.endDate.substring(0, 10) : '',
      noCredits: program.noCredits,
    });
    setEditingId(program.trainingProgramId);
    setShowPopup(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa chương trình này?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete training program');
      fetchPrograms();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle search
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchPrograms();
  };

  // Popup close
  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({ trainProName: '', startDate: '', endDate: '', noCredits: 0 });
  };

  // Double click handler
  const handleRowClick = (trainingProgramId: number) => {
    const now = Date.now();
    if (lastClick && lastClick.id === trainingProgramId && now - lastClick.time < 400) {
      router.push(`/examination/managemajor/trainingprogram/subject?trainingProgramId=${trainingProgramId}`);
    }
    setLastClick({ id: trainingProgramId, time: now });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-4xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý chương trình đào tạo</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-10"
        >
          <input
            type="text"
            placeholder="Tìm theo tên chương trình"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-40"
          />
          <input
            type="date"
            placeholder="Từ ngày"
            value={searchFromDate}
            onChange={e => setSearchFromDate(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition"
          />
          <input
            type="date"
            placeholder="Đến ngày"
            value={searchToDate}
            onChange={e => setSearchToDate(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition"
          />
          <button
            type="submit"
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition font-semibold"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setSearchFromDate('');
              setSearchToDate('');
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
              setForm({ trainProName: '', startDate: '', endDate: '', noCredits: 0 });
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
              <h3 className="text-xl font-bold mb-4 text-gray-700">{editingId === null ? 'Thêm chương trình' : 'Cập nhật chương trình'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Tên chương trình</label>
                  <input
                    name="trainProName"
                    placeholder="Tên chương trình"
                    value={form.trainProName}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ngày bắt đầu</label>
                  <input
                    name="startDate"
                    type="date"
                    placeholder="Ngày bắt đầu"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ngày kết thúc</label>
                  <input
                    name="endDate"
                    type="date"
                    placeholder="Ngày kết thúc"
                    value={form.endDate || ''}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tổng số tín chỉ</label>
                  <input
                    name="noCredits"
                    type="number"
                    placeholder="Tổng số tín chỉ"
                    value={form.noCredits}
                    onChange={handleChange}
                    required
                    min={0}
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
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
                <th className="py-2 px-2 border-b">Tên chương trình</th>
                <th className="py-2 px-2 border-b">Ngày bắt đầu</th>
                <th className="py-2 px-2 border-b">Ngày kết thúc</th>
                <th className="py-2 px-2 border-b">Tín chỉ</th>
                <th className="py-2 px-2 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr
                  key={program.trainingProgramId}
                  className="hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => handleRowClick(program.trainingProgramId)}
                  title="Nhấn đúp để xem môn học trong chương trình"
                >
                  <td className="py-2 px-2 text-center border-b">{program.trainingProgramId}</td>
                  <td className="py-2 px-2 border-b">{program.trainProName}</td>
                  <td className="py-2 px-2 text-center border-b">{program.startDate ? program.startDate.substring(0, 10) : ''}</td>
                  <td className="py-2 px-2 text-center border-b">{program.endDate ? program.endDate.substring(0, 10) : ''}</td>
                  <td className="py-2 px-2 text-center border-b">{program.noCredits}</td>
                  <td className="py-2 px-2 text-center border-b">
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(program); }}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(program.trainingProgramId); }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-semibold"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có chương trình nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-5 text-xs text-gray-400 text-left">* Nhấn đúp vào dòng để xem môn học trong chương trình</div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap justify-left items-center gap-2 text-base ">
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
