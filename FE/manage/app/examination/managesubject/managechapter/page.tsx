"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Suspense } from "react";
import { useManageChapter } from "@hooks/examination/manageChapterHook";

function ChapterManagementContent() {
  const {
    chapters,
    selectedChapter,
    subjectInfo,
    isPopupOpen,
    expandedChapterIds,
    register,
    handleSubmit,
    handleSave,
    handleEdit,
    handleDelete,
    openEditPopup,
    openCreatePopup,
    closePopup,
    toggleExpanded,
  } = useManageChapter();

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <ToastContainer />

      {/* Thông tin môn học */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-center mb-4">
          Thông tin môn học
        </h2>
        <div className="flex justify-between">
          <span className="text-gray-800">
            Mã môn học: {subjectInfo?.course}
          </span>
          <span className="text-gray-800">
            Tên môn học: {subjectInfo?.subjectName}
          </span>
        </div>
      </div>

      {/* Danh sách chương */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Quản lý chương</h3>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            onClick={openCreatePopup}
          >
            + Thêm chương
          </button>
        </div>
        <div className="space-y-4">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-xl shadow p-4 cursor-pointer"
              onClick={() => openEditPopup(ch)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {ch.chapterName}
                  </h4>
                  <p className="text-gray-600 text-sm">{ch.description}</p>
                </div>
                <button
                  className="text-gray-500 hover:text-indigo-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(ch.id);
                  }}
                >
                  {expandedChapterIds.includes(ch.id) ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </button>
              </div>
              {expandedChapterIds.includes(ch.id) && (
                <div className="mt-4 border-t pt-2">
                  <p className="text-sm text-gray-700">Giáo trình:</p>
                  {ch.curriculum ? (
                    <a
                      href={ch.curriculum}
                      download
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {decodeURIComponent(
                        ch.curriculum.split("/").pop() || "File.pdf"
                      )}
                    </a>
                  ) : (
                    <p className="text-gray-500 italic">
                      Không có giáo trình cho chương này
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Popup Thêm/Chỉnh sửa */}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold mb-4">
                {selectedChapter ? "Chỉnh sửa chương" : "Thêm chương mới"}
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                style={{ lineHeight: "1" }}
              >
                <X size={20} /> {/* Icon "x" từ lucide-react */}
              </button>
            </div>
            <form
              onSubmit={handleSubmit(selectedChapter ? handleEdit : handleSave)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chương
                </label>
                <input
                  type="text"
                  {...register("title", { required: true })}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giáo trình (file PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  {...register(
                    "syllabusFile",
                    selectedChapter ? {} : { required: true }
                  )}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3">
                {selectedChapter && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedChapter.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  {selectedChapter ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChapterManagement() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToastContainer />
      <ChapterManagementContent />
    </Suspense>
  );
}
