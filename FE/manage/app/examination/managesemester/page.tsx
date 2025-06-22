"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "https://localhost:7074/api/Semesters";
const SEMESTER_OPTIONS = [2, 3, 4];

interface SemesterForm {
  semesterNames: { name: string }[];
}

export default function SemesterSetup() {
  const [loading, setLoading] = useState(true);
  const [selectedCount, setSelectedCount] = useState(2);
  const [initialData, setInitialData] = useState<any[]>([]);

  const { register, control, handleSubmit, reset } = useForm<SemesterForm>({
    defaultValues: {
      semesterNames: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "semesterNames",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Lỗi khi tải dữ liệu học kỳ");

        const semesters = await res.json();
        const active = semesters.filter(
          (s: any) => s.semesterName?.trim() !== ""
        );
        setInitialData(semesters);
        setSelectedCount(active.length);

        const mapped = active.map((s: any) => ({ name: s.semesterName }));
        replace(mapped);
        reset({ semesterNames: mapped });
      } catch (err: any) {
        toast.error(err.message || "Không thể tải dữ liệu học kỳ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [replace, reset]);

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setSelectedCount(count);

    const filled = initialData.map((s: any) => ({
      name: s.semesterName || "",
    }));

    const newValues =
      filled.length >= count
        ? filled.slice(0, count)
        : [...filled, ...Array(count - filled.length).fill({ name: "" })];

    replace(newValues);
    reset({ semesterNames: newValues });
  };

  const onSubmit = async (data: SemesterForm) => {
    try {
      const payload = {
        semesters: data.semesterNames.map((x, idx) => ({
          semesterId: idx + 1,
          semesterName: x.name,
        })),
      };

      const res = await fetch(`${API}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Đã xảy ra lỗi");
        } else {
          const text = await res.text();
          throw new Error(text || "Đã xảy ra lỗi không rõ");
        }
      }

      toast.success("Cập nhật học kỳ thành công!");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra");
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-semibold text-center mb-4">
          Thiết lập học kỳ
        </h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Số lượng học kỳ
          </label>
          <select
            value={selectedCount}
            onChange={handleCountChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {SEMESTER_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} học kỳ
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên học kỳ {index + 1}
              </label>
              <input
                {...register(`semesterNames.${index}.name`, { required: true })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={`VD: Học kỳ ${index + 1}`}
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg"
          >
            Lưu học kỳ
          </button>
        </form>
      </div>
    </div>
  );
}
