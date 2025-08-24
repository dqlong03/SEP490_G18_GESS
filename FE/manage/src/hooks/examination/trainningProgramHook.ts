"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from '@/utils/toastUtils';
import {
  TrainingProgram,
  TrainingProgramForm,
  fetchPrograms,
  countPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@services/examination/trainningProgramService";

export function useTrainingPrograms() {
  const searchParams = useSearchParams();
  const majorId = Number(searchParams.get("majorId")) || 1;

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TrainingProgramForm>({
    trainProName: "",
    startDate: "",
    endDate: "",
    noCredits: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [lastClick, setLastClick] = useState<{
    id: number;
    time: number;
  } | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const fetchAllPrograms = async () => {
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
      const data = await fetchPrograms(majorId, params);
      setPrograms(data);

      try {
        const count = await countPrograms(majorId, {
          name: searchName,
          fromDate: searchFromDate,
          toDate: searchToDate,
          pageSize,
        });
        setTotalCount(count);
        setTotalPages(Math.ceil(count / pageSize));
      } catch (countErr) {
        // Không hiển thị lỗi cho API count
        console.error('Count API error:', countErr);
        setTotalPages(1);
        setTotalCount(data.length);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi tải dữ liệu');
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchFromDate, searchToDate, majorId]);

  // Debounced search for searchName
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPageNumber(1);
      fetchAllPrograms();
    }, 800); // 800ms delay

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate end date must be greater than start date
    if (form.endDate && form.startDate && form.endDate <= form.startDate) {
      showToast('error', 'Ngày kết thúc phải lớn hơn ngày bắt đầu');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      if (editingId === null) {
        await createProgram(majorId, form);
        showToast('success', 'Thêm chương trình đào tạo thành công');
      } else {
        await updateProgram(editingId, form);
        showToast('success', 'Cập nhật chương trình đào tạo thành công');
      }
      setForm({ trainProName: "", startDate: "", endDate: "", noCredits: 0 });
      setEditingId(null);
      setShowPopup(false);
      fetchAllPrograms();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra');
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEdit = (program: TrainingProgram) => {
    setForm({
      trainProName: program.trainProName,
      startDate: program.startDate ? program.startDate.substring(0, 10) : "",
      endDate: program.endDate ? program.endDate.substring(0, 10) : "",
      noCredits: program.noCredits,
    });
    setEditingId(program.trainingProgramId);
    setShowPopup(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa chương trình này?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteProgram(id);
      showToast('success', 'Xóa chương trình đào tạo thành công');
      fetchAllPrograms();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi xóa');
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchAllPrograms();
  };

  const handleDateSearch = () => {
    setPageNumber(1);
    fetchAllPrograms();
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({ trainProName: "", startDate: "", endDate: "", noCredits: 0 });
  };

  const handleRowClick = (trainingProgramId: number) => {
    const now = Date.now();
    if (
      lastClick &&
      lastClick.id === trainingProgramId &&
      now - lastClick.time < 400
    ) {
      router.push(
        `/examination/managemajor/trainingprogram/subject?trainingProgramId=${trainingProgramId}`
      );
    }
    setLastClick({ id: trainingProgramId, time: now });
  };

  return {
    programs,
    loading,
    error,
    form,
    editingId,
    showPopup,
    pageNumber,
    pageSize,
    totalPages,
    totalCount,
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
    handleDateSearch,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    handleRowClick,
  };
}
