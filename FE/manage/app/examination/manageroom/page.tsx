// ✅ File: app/examination/manageroom/page.tsx

"use client";

import { useRoomManager } from "@/hooks/examination/manageRoomHook";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function RoomManager() {
  const {
    rooms,
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
    statusFilter,
    setSearchName,
    setStatusFilter,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleSearch,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    setOpenMenuId,
  } = useRoomManager();

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-4">
      <ToastContainer />
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý phòng</h2>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Filter & Search */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Tìm tên phòng"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border px-3 py-2 rounded w-48"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded w-40"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="0">Còn trống</option>
            <option value="1">Đã sử dụng</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchName("");
              setStatusFilter("");
              setPageNumber(1);
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPopup(true);
              setEditingId(null);
              setForm({
                roomName: "",
                description: "",
                status: "",
                capacity: 0,
              });
            }}
            className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Thêm mới
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border">ID</th>
                <th className="py-2 px-3 border">Tên phòng</th>
                <th className="py-2 px-3 border">Trạng thái</th>
                <th className="py-2 px-3 border">Sức chứa</th>
                <th className="py-2 px-3 border">Mô tả</th>
                <th className="py-2 px-3 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.roomId}>
                  <td className="border px-3 py-1 text-center">
                    {room.roomId}
                  </td>
                  <td className="border px-3 py-1">{room.roomName}</td>
                  <td className="py-2 px-2 border-b">
                    {room.status === "1"
                      ? "Đang sử dụng"
                      : room.status === "0"
                        ? "Không sử dụng"
                        : ""}
                  </td>
                  <td className="border px-3 py-1 text-center">
                    {room.capacity}
                  </td>
                  <td className="border px-3 py-1">{room.description}</td>
                  <td className="border px-3 py-1 text-center">
                    <button
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                      onClick={() => handleEdit(room)}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có phòng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mt-4">
          <button
            disabled={pageNumber === 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="font-semibold">
            Trang {pageNumber} / {totalPages}
          </span>
          <button
            disabled={pageNumber === totalPages}
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>

        {/* Popup */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingId === null ? "Thêm phòng" : "Cập nhật phòng"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block font-semibold mb-1">
                  Tên phòng học
                </label>
                <input
                  name="roomName"
                  placeholder="Tên phòng"
                  value={form.roomName}
                  onChange={handleChange}
                  required
                  className="border px-3 py-2 rounded w-full"
                />
                <div>
                  <label className="block font-semibold mb-1">Trạng thái</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                    className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="0">Còn trống</option>
                    <option value="1">Đang sử dụng</option>
                  </select>
                </div>
                <label className="block font-semibold mb-1">
                  Sức chứa phòng học
                </label>

                <input
                  name="capacity"
                  type="number"
                  placeholder="Sức chứa"
                  value={form.capacity}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                />
                <label className="block font-semibold mb-1">
                  Mô tả phòng học
                </label>

                <textarea
                  name="description"
                  placeholder="Mô tả"
                  value={form.description}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {editingId === null ? "Thêm mới" : "Cập nhật"}
                  </button>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
