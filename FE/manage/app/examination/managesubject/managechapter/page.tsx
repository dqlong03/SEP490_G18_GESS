"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { create } from "zustand";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import useSWR, { mutate } from "swr";

interface Chapter {
  id: number;
  chapterName: string;
  description: string;
  curriculum: string;
}

interface ChapterState {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  isPopupOpen: boolean;
  expandedChapterIds: number[];
  setChapters: (chapters: Chapter[]) => void;
  setSelectedChapter: (chapter: Chapter | null) => void;
  setIsPopupOpen: (isOpen: boolean) => void;
  toggleExpanded: (id: number) => void;
}

const useChapterStore = create<ChapterState>((set) => ({
  chapters: [],
  selectedChapter: null,
  isPopupOpen: false,
  expandedChapterIds: [],
  setChapters: (chapters) => set({ chapters }),
  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  setIsPopupOpen: (isOpen) => set({ isPopupOpen: isOpen }),
  toggleExpanded: (id) =>
    set((state) => ({
      expandedChapterIds: state.expandedChapterIds.includes(id)
        ? state.expandedChapterIds.filter((i) => i !== id)
        : [...state.expandedChapterIds, id],
    })),
}));

interface ChapterFormData {
  title: string;
  description: string;
  syllabusFile: FileList;
}

interface SubjectBasicDTO {
  subjectName: string;
  course: string;
}

const API = "https://localhost:7074";
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API Error");
  return res.json();
};

export default function ChapterManagement() {
  const {
    chapters,
    selectedChapter,
    isPopupOpen,
    expandedChapterIds,
    setChapters,
    setSelectedChapter,
    setIsPopupOpen,
    toggleExpanded,
  } = useChapterStore();

  const { register, handleSubmit, reset, setValue } =
    useForm<ChapterFormData>();

  const [subjectId, setSubjectId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("subjectId");
    if (id) setSubjectId(id);
    else toast.error("Không tìm thấy subjectId từ URL");
  }, []);

  const { data: subjectInfo } = useSWR<SubjectBasicDTO>(
    subjectId ? `${API}/api/Subject/${subjectId}` : null,
    fetcher
  );

  const { data: chapterData } = useSWR<Chapter[]>(
    subjectId ? `${API}/api/Chapter/GetAllChapterBySub/${subjectId}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        setChapters(data);
      },
    }
  );

  const mutateChapters = () =>
    mutate(`${API}/api/Chapter/GetAllChapterBySub/${subjectId}`);

  const handleSave: SubmitHandler<ChapterFormData> = async (data) => {
    const file = data.syllabusFile?.[0];
    if (!file) return toast.error("Vui lòng chọn file giáo trình!");

    const formData = new FormData();
    formData.append("ChapterName", data.title);
    formData.append("Description", data.description);
    formData.append("CurriculumFile", file);
    formData.append("SubjectId", subjectId);

    try {
      const res = await fetch(`${API}/api/Chapter`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Thêm chương thất bại");
      mutateChapters();
      setIsPopupOpen(false);
      reset();
      toast.success("Đã thêm chương mới!");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleEdit: SubmitHandler<ChapterFormData> = async (data) => {
    if (!selectedChapter) return;
    const file = data.syllabusFile?.[0];

    const formData = new FormData();
    formData.append("ChapterName", data.title);
    formData.append("Description", data.description);
    formData.append("SubjectId", subjectId);
    formData.append("ExistingCurriculumUrl", selectedChapter.curriculum);
    if (file) formData.append("NewCurriculumFile", file);

    try {
      const res = await fetch(`${API}/api/Chapter/${selectedChapter.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Cập nhật chương thất bại");
      mutateChapters();
      setSelectedChapter(null);
      setIsPopupOpen(false);
      reset();
      toast.success("Đã cập nhật chương!");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleOpenPopup = (ch: Chapter | null) => {
    if (ch) {
      setSelectedChapter(ch);
      setValue("title", ch.chapterName);
      setValue("description", ch.description);
    } else {
      reset();
    }
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedChapter(null);
    reset();
  };

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
            onClick={() => handleOpenPopup(null)}
          >
            + Thêm chương
          </button>
        </div>
        <div className="space-y-4">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-xl shadow p-4 cursor-pointer"
              onClick={() => handleOpenPopup(ch)}
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
                onClick={handleClosePopup}
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
                    // onClick={handleDelete}
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
