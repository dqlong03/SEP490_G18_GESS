"use client";

import { useSemesterManager } from "@/hooks/examination/manageSemesterHook";
import { X } from "lucide-react";
export default function SemesterManager() {
  const {
    semesters,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleSearch,
    handleClear,
    handleOpenPopup,
    handleEdit,
    handleDelete,
    isPopupOpen,
    handleClosePopup,
    formData,
    handleChange,
    handleSubmit,
    selectedSemester,
  } = useSemesterManager();

  return (
    <div className="w-full min-h-screen bg-gray-100 !bg-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quản lý kỳ học
        </h2>

        {/* Search bar with Add button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên kỳ học"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-60"
            />
            <button
              type="submit"
              className="bg-gray-700 text-white px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold cursor-pointer"
            >
              Xóa lọc
            </button>
          </form>
          <button
            type="button"
            onClick={handleOpenPopup}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 cursor-pointer"
          >
            + Thêm mới
          </button>
        </div>

        {/* Table with loading/error state */}
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b">ID</th>
                <th className="py-2 px-2 border-b">Tên kỳ học</th>
                <th className="py-2 px-2 border-b">Ngày bắt đầu</th>
                <th className="py-2 px-2 border-b">Ngày kết thúc</th>
                <th className="py-2 px-2 border-b">Hành động</th>
              </tr>
            </thead>
            {!loading && !error && (
              <tbody>
                {semesters.length > 0 ? (
                  semesters.map((s) => (
                    <tr key={s.semesterId}>
                      <td className="py-2 px-2 text-center border-b">
                        {s.semesterId}
                      </td>
                      <td className="py-2 px-2 border-b">{s.semesterName}</td>
                      <td className="py-2 px-2 border-b">{s.startDate}</td>
                      <td className="py-2 px-2 border-b">{s.endDate}</td>
                      <td className="py-2 px-2 text-center border-b space-x-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(s.semesterId)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      Không có kỳ học nào.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
          {loading && (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          )}
          {error && (
            <div className="text-center py-4 text-red-500">Lỗi: {error}</div>
          )}
        </div>

        {/* Popup */}
        {isPopupOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)", // Màu đen với độ trong suốt 80%
            }}
          >
            <div
              className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Header chứa nút "x" và tiêu đề */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedSemester ? "Cập nhật kỳ học" : "Thêm kỳ học mới"}
                </h3>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                  style={{ lineHeight: "1" }}
                >
                  <X size={20} /> {/* Icon "x" từ lucide-react */}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Tên kỳ học"
                  name="semesterName"
                  value={formData.semesterName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded"
                  style={{
                    border: "1px solid #d1d5db",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.border = "1px solid rgb(48, 123, 235)")
                  }
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                  required
                />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded cursor-pointer"
                  style={{
                    border: "1px solid #d1d5db",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.border = "1px solid rgb(48, 123, 235)")
                  }
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                  required
                />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded cursor-pointer"
                  style={{
                    border: "1px solid #d1d5db",
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.border = "1px solid rgb(48, 123, 235)")
                  }
                  onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
                  required
                />
                <div className="flex justify-end gap-3">
                  {selectedSemester && (
                    <button
                      type="button"
                      // onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                    >
                      Xóa
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Lưu
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
