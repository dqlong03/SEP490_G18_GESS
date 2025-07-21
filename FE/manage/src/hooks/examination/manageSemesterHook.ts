"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  Semester,
  fetchSemesters,
  addSemester,
  updateSemester,
  deleteSemester,
} from "@services/examination/manageSemesterService";

export function useSemesterManager() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Omit<Semester, "semesterId">>({
    semesterName: "",
    startDate: "",
    endDate: "",
  });
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchSemesters(searchTerm);
      setSemesters(data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải danh sách kỳ học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleClear = () => {
    setSearchTerm("");
    fetchData();
  };

  const handleOpenPopup = () => {
    setFormData({ semesterName: "", startDate: "", endDate: "" });
    setSelectedSemester(null);
    setIsPopupOpen(true);
  };

  const handleEdit = (semester: Semester) => {
    setFormData({
      semesterName: semester.semesterName,
      startDate: semester.startDate,
      endDate: semester.endDate,
    });
    setSelectedSemester(semester);
    setIsPopupOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kỳ học này?")) return;
    setLoading(true);
    try {
      await deleteSemester(id);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Lỗi khi xóa kỳ học");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedSemester) {
        await updateSemester(selectedSemester.semesterId, formData);
      } else {
        const newSemester = await addSemester(formData);
        setSemesters((prev) => [
          ...prev,
          { ...newSemester, semesterId: Date.now() },
        ]);
      }
      setIsPopupOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu kỳ học");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return {
    semesters,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    isPopupOpen,
    setIsPopupOpen,
    formData,
    handleSearch,
    handleClear,
    handleOpenPopup,
    handleEdit,
    handleDelete,
    handleChange,
    handleSubmit,
    handleClosePopup,
    selectedSemester, // Đảm bảo trả về selectedSemester
  };
}

