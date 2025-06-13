"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Major,
  MajorForm,
  fetchMajors,
  countMajors,
  createMajor,
  updateMajor,
  deleteMajor,
} from "@services/examination/manageMajorService";

export function useMajors() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MajorForm>({
    majorName: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [editForm, setEditForm] = useState<Major>({
    majorId: 1,
    majorName: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [lastClick, setLastClick] = useState<{
    id: number;
    time: number;
  } | null>(null);

  const router = useRouter();

  const fetchAllMajors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: searchName,
        fromDate: searchFromDate,
        toDate: searchToDate,
        pageNumber,
        pageSize,
      };
      const data = await fetchMajors(params);
      setMajors(data);

      const count = await countMajors({
        name: searchName,
        fromDate: searchFromDate,
        toDate: searchToDate,
        pageSize,
      });
      setTotalPages(Math.ceil(count / pageSize));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllMajors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName, searchFromDate, searchToDate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingId === null) {
        await createMajor(form);
      } else {
        await updateMajor(editingId, form);
      }
      setForm({ majorName: "", startDate: "", endDate: "", isActive: true });
      setEditingId(null);
      setShowPopup(false);
      fetchAllMajors();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEdit = (major: Major) => {
    setForm({
      majorName: major.majorName,
      startDate: major.startDate ? major.startDate.substring(0, 10) : "",
      endDate: major.endDate ? major.endDate.substring(0, 10) : "",
      isActive: major.isActive,
    });
    setEditForm({
      majorId: 1,
      majorName: major.majorName,
      startDate: major.startDate ? major.startDate.substring(0, 10) : "",
      endDate: major.endDate ? major.endDate.substring(0, 10) : null,
      isActive: major.isActive,
    });
    setEditingId(major.majorId);
    setShowPopup(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa ngành này?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteMajor(id);
      fetchAllMajors();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchAllMajors();
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({ majorName: "", startDate: "", endDate: "", isActive: true });
  };

  const handleRowClick = (majorId: number) => {
    const now = Date.now();
    if (lastClick && lastClick.id === majorId && now - lastClick.time < 400) {
      router.push(
        `/examination/managemajor/trainingprogram?majorId=${majorId}`
      );
    }
    setLastClick({ id: majorId, time: now });
  };

  return {
    majors,
    loading,
    error,
    form,
    editingId,
    showPopup,
    pageNumber,
    pageSize,
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
  };
}
