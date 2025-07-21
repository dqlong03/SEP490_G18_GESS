"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import useSWR, { mutate } from "swr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { create } from "zustand";
import { X } from "lucide-react";

// DTO cho POST (thêm mới)

// DTO cho GET/PUT (hiển thị và cập nhật)
interface CategoryExamSubjectDTO {
  subjectId: number;
  categoryExamId: number;
  categoryExamName: string;
  gradeComponent: number;
  isDelete: boolean;
}

interface CategoryExamType {
  categoryExamId: number;
  categoryExamName: string;
}

export interface SubjectBasicDTO {
  subjectName: string;
  course: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
};

// Zustand store
interface ScoreState {
  scores: CategoryExamSubjectDTO[];
  isPopupOpen: boolean;
  selectedScore: CategoryExamSubjectDTO | null;
  setScores: (s: CategoryExamSubjectDTO[]) => void;
  setIsPopupOpen: (b: boolean) => void;
  setSelectedScore: (s: CategoryExamSubjectDTO | null) => void;
}

const useScoreStore = create<ScoreState>((set) => ({
  scores: [],
  isPopupOpen: false,
  selectedScore: null,
  setScores: (s) => set({ scores: s }),
  setIsPopupOpen: (b) => set({ isPopupOpen: b }),
  setSelectedScore: (s) => set({ selectedScore: s }),
}));

export interface ScoreFormData {
  SubjectId: number;
  CategoryExamId: number;
  GradeComponent: string;
  IsDelete?: boolean;
}

function ScoreManagement() {
  const {
    scores,
    isPopupOpen,
    selectedScore,
    setScores,
    setIsPopupOpen,
    setSelectedScore,
  } = useScoreStore();

  const [subjectId, setSubjectId] = useState<string>("");
  const API = "https://localhost:7074";

  const { register, handleSubmit, reset, setValue } = useForm<ScoreFormData>({
    defaultValues: { GradeComponent: "0.0" },
  });

  // Lấy subjectId từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("subjectId");
    if (id) setSubjectId(id);
    else {
      toast.error("Không tìm thấy subjectId từ URL");
      setSubjectId("");
    }
  }, []);

  const { data: subjectInfo, error: subjectInfoError } =
    useSWR<SubjectBasicDTO>(
      subjectId ? `${API}/api/Subject/${subjectId}` : null,
      fetcher
    );

  const { data: examTypes = [], error: examTypesError } = useSWR<
    CategoryExamType[]
  >(subjectId ? `${API}/api/CategoryExam` : null, fetcher);

  const { data, error } = useSWR<CategoryExamSubjectDTO[]>(
    subjectId ? `${API}/api/GradeComponent/${subjectId}` : null,
    fetcher
  );

  useEffect(() => {
    console.log("Fetched scores:", data);
    if (data && Array.isArray(data)) {
      setScores(
        data.map((item) => ({
          ...item,
          GradeComponent: Number(item.gradeComponent),
        }))
      );
    } else {
      setScores([]);
    }
  }, [data]);

  useEffect(() => {
    if (examTypesError)
      toast.error("Lỗi load exam types: " + (examTypesError as Error).message);
  }, [examTypesError]);

  const mutateScores = () => mutate(`${API}/api/GradeComponent/${subjectId}`);

  const handleAddScore: SubmitHandler<ScoreFormData> = async (d) => {
    const dto: CategoryExamSubjectDTO = {
      subjectId: parseInt(subjectId),
      categoryExamId: Number(d.CategoryExamId),
      categoryExamName: "",
      gradeComponent: parseFloat(d.GradeComponent.toString()),
      isDelete: Boolean(d.IsDelete),
    };
    console.log(dto);
    if (
      scores.some(
        (s) =>
          s.subjectId === Number(subjectId) &&
          s.categoryExamId === d.CategoryExamId
      )
    ) {
      toast.error("Đã tồn tại loại bài thi này");
      return;
    }

    try {
      const res = await fetch(`${API}/api/GradeComponent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      console.log(res.body);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Thêm thất bại");
      }

      const added = (await res.json()) as CategoryExamSubjectDTO;
      setScores([...scores, added]);
      mutateScores();
      reset(); // ✅ move vào đây
      setIsPopupOpen(false); // ✅ move vào đây
      toast.success("Thêm thành công"); // ✅ đảm bảo nằm trong block thành công
    } catch (err: any) {
      toast.error("Lỗi thêm: " + err.message);
    }
  };

  const handleEditScore: SubmitHandler<ScoreFormData> = async (d) => {
    if (!selectedScore) return;

    const updated: Partial<CategoryExamSubjectDTO> = {
      subjectId: Number(subjectId),
      categoryExamId: d.CategoryExamId,
      categoryExamName: "",
      gradeComponent: parseFloat(d.GradeComponent.toString()),
      isDelete: Boolean(d.IsDelete),
    };

    console.log(updated);
    try {
      const res = await fetch(
        `${API}/api/GradeComponent/${subjectId}/${selectedScore.categoryExamId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );

      if (!res.ok) throw new Error("Cập nhật thất bại");
      setScores(
        scores.map((s) =>
          s.subjectId === updated.subjectId &&
          s.categoryExamId === updated.categoryExamId
            ? { ...s, ...updated }
            : s
        )
      );
      mutateScores(); // hoặc gọi lại API lấy dữ liệu mới
      setIsPopupOpen(false);
      reset();
      toast.success("Cập nhật thành công");
    } catch (err: any) {
      toast.error("Lỗi cập nhật: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedScore) return;
    if (!confirm("Xóa điểm?")) return;

    try {
      const res = await fetch(
        `${API}/api/GradeComponent/${subjectId}/${selectedScore.categoryExamId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDelete: true }),
        }
      );

      if (!res.ok) throw new Error("Xóa thất bại");

      setScores(
        scores.filter(
          (s) =>
            !(
              s.subjectId === selectedScore.subjectId &&
              s.categoryExamId === selectedScore.categoryExamId
            )
        )
      );
      mutateScores();
      setIsPopupOpen(false);
      toast.success("Xóa thành công");
    } catch (err: any) {
      toast.error("Lỗi xóa: " + err.message);
    }
  };

  const openPopup = (sc: CategoryExamSubjectDTO) => {
    setSelectedScore(sc);
    setValue("CategoryExamId", sc.categoryExamId);
    setValue("GradeComponent", sc.gradeComponent.toFixed(1));
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedScore(null);
    reset();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Quản lý điểm</h2>
          <button
            onClick={() => {
              setSelectedScore(null);
              reset();
              setIsPopupOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Thêm điểm
          </button>
        </div>

        <div className="flex gap-6 mb-6">
          <div className="w-1/3 bg-white rounded-xl shadow-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Thông tin môn học
            </h3>
            {subjectInfo && (
              <div>
                <p className="text-gray-700">Mã môn: {subjectInfo.course}</p>
                <p className="text-gray-700">
                  Tên môn học: {subjectInfo.subjectName}
                </p>
              </div>
            )}
          </div>

          <div className="w-2/3 bg-white rounded-lg shadow overflow-auto">
            <table className="w-full table-auto">
              <thead className="bg-indigo-500 text-white">
                <tr className="text-center">
                  <th className="p-2">STT</th>
                  <th className="p-2">Tên điểm</th>
                  <th className="p-2">Phần trăm</th>
                </tr>
              </thead>
              <tbody>
                {!data ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : scores.length > 0 ? (
                  scores.map((s, i) => (
                    <tr
                      key={`${s.subjectId}-${s.categoryExamId}`}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => openPopup(s)}
                    >
                      <td className="p-2 text-center">{i + 1}</td>
                      <td className="p-2">
                        {s.categoryExamName || "(Không có tên loại)"}
                      </td>
                      <td className="p-2 text-center text-indigo-600">
                        {typeof s.gradeComponent === "number"
                          ? `${s.gradeComponent.toFixed(1)}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedScore ? "Chỉnh sửa điểm" : "Thêm điểm"}
                </h3>
                <button onClick={closePopup}>
                  <X />
                </button>
              </div>
              <form
                onSubmit={handleSubmit(
                  selectedScore ? handleEditScore : handleAddScore
                )}
              >
                <div className="mb-3">
                  <label className="block mb-1">Thể loại bài thi</label>
                  <select
                    {...register("CategoryExamId", { required: true })}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">-- Chọn loại --</option>
                    {examTypes.map((t) => (
                      <option
                        key={t.categoryExamId}
                        value={t.categoryExamId.toString()}
                      >
                        {t.categoryExamName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block mb-1">Phần trăm điểm</label>
                  <input
                    {...register("GradeComponent", {
                      required: true,
                      pattern: /^\d+(\.\d{1,2})?$/,
                      min: 0.1,
                      max: 100,
                      validate: (value) =>
                        parseFloat(value.toString()) > 0 ||
                        "Phần trăm điểm phải lớn hơn 0",
                    })}
                    type="number"
                    step="0.1"
                    className="w-full border p-2 rounded"
                    placeholder="Ví dụ 85.5"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {selectedScore && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Xóa
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    {selectedScore ? "Cập nhật" : "Thêm"}
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

export default ScoreManagement;
