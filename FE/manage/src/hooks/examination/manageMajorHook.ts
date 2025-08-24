"use client";

import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toastUtils";
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

      // Gọi count API để tính tổng số trang
      try {
        const countParams = {
          name: searchName,
          fromDate: searchFromDate,
          toDate: searchToDate,
        };
        const countResponse = await countMajors(countParams);
        // API có thể trả về object {count: number} hoặc chỉ là number
        const totalCount =
          typeof countResponse === "number"
            ? countResponse
            : countResponse.count || countResponse;
        const calculatedPages = Math.ceil(totalCount / pageSize);
        setTotalPages(calculatedPages);
      } catch (countErr) {
        setTotalPages(1);
      }
    } catch (err: any) {
      showToast("error", err.message || "Có lỗi xảy ra khi tải dữ liệu");
      setMajors([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  // Debounce function for search
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      setPageNumber(1);
      fetchAllMajors();
    }, 800),
    [searchName, searchFromDate, searchToDate]
  );

  useEffect(() => {
    fetchAllMajors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  // Handle search input changes with debounce
  useEffect(() => {
    if (searchName || searchFromDate || searchToDate) {
      debouncedSearch();
    } else {
      setPageNumber(1);
      fetchAllMajors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName, searchFromDate, searchToDate]);

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

    try {
      if (editingId === null) {
        await createMajor(form);
        showToast("success", "Thêm ngành học thành công!");
      } else {
        await updateMajor(editingId, form);
        showToast("success", "Cập nhật ngành học thành công!");
      }
      setForm({ majorName: "", startDate: "", endDate: "", isActive: true });
      setEditingId(null);
      setShowPopup(false);
      fetchAllMajors();
    } catch (err: any) {
      showToast("error", err.message || "Có lỗi xảy ra");
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
    try {
      await deleteMajor(id);
      showToast("success", "Xóa ngành học thành công!");
      fetchAllMajors();
    } catch (err: any) {
      showToast("error", err.message || "Có lỗi xảy ra khi xóa");
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
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    handleRowClick,
  };
}
