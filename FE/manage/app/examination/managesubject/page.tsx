'use client';

import { MoreVertical } from 'lucide-react';
import { useSubjects } from '@/hooks/examination/manageSubjectHook';

export default function SubjectManager() {
  const {
    subjects,
    loading,
    error,
    form,
    editingId,
    showPopup,
    openMenuId,
    menuRef,
    pageNumber,
    pageSize,
    totalPages,
    searchName,
    setSearchName,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleSearch,
    handleMenuAction,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    setOpenMenuId,
  } = useSubjects();

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
