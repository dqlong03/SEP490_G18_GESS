'use client';

import { useMajors } from '@/hooks/examination/manageMajorHook';

export default function MajorManager() {
  const {
    majors,
    loading,
    error,
    form,
    editingId,
    showPopup,
    pageNumber,
    totalPages,
    searchName,
    setSearchName,
    searchFromDate,
    setSearchFromDate,
    searchToDate,
    setSearchToDate,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSearch,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    handleRowClick,
  } = useMajors();

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý ngành học</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-10"
        >
          <input
            type="text"
            placeholder="Tìm theo tên ngành"
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
              setForm({ majorName: '', startDate: '', endDate: '', isActive: true });
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
              <h3 className="text-xl font-bold mb-4 text-gray-700">{editingId === null ? 'Thêm ngành mới' : 'Cập nhật ngành'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Tên ngành</label>
                  <input
                    name="majorName"
                    placeholder="Tên ngành"
                    value={form.majorName}
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="accent-blue-500"
                  />
                  <span className="font-semibold">Đang hoạt động</span>
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
                <th className="py-2 px-2 border-b">Tên ngành</th>
                <th className="py-2 px-2 border-b">Ngày bắt đầu</th>
                <th className="py-2 px-2 border-b">Ngày kết thúc</th>
                <th className="py-2 px-2 border-b">Trạng thái</th>
                <th className="py-2 px-2 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {majors.map((major) => (
                <tr
                  key={major.majorId}
                  className="hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => handleRowClick(major.majorId)}
                  title="Nhấn đúp để xem chương trình đào tạo"
                >
                  <td className="py-2 px-2 text-center border-b">{major.majorId}</td>
                  <td className="py-2 px-2 border-b">{major.majorName}</td>
                  <td className="py-2 px-2 text-center border-b">{major.startDate ? major.startDate.substring(0, 10) : ''}</td>
                  <td className="py-2 px-2 text-center border-b">{major.endDate ? major.endDate.substring(0, 10) : ''}</td>
                  <td className="py-2 px-2 text-center border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${major.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {major.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center border-b">
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(major); }}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(major.majorId); }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-semibold"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {majors.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có ngành nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap justify-left items-center gap-2 text-base mt-5">
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
        <div className="mt-2 text-xs text-gray-400 text-left">* Nhấn đúp vào dòng để xem chương trình đào tạo</div>
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
