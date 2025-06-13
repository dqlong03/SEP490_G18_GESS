"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Teacher,
  TeacherForm,
  fetchTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@services/examination/manageTeacherService";

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<TeacherForm>>({
    userName: "",
    email: "",
    phoneNumber: "",
    fullName: "",
    gender: true,
    isActive: true,
    hireDate: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [lastClick, setLastClick] = useState<{
    id: string;
    time: number;
  } | null>(null);

  const fetchAllTeachers = async (keyword = "") => {
    setLoading(true);
    try {
      const data = await fetchTeachers(keyword);
      setTeachers(data);
    } catch {
      alert("Failed to fetch teachers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllTeachers();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateTeacher(editingId, form);
      } else {
        await createTeacher(form);
      }
      setForm({
        userName: "",
        email: "",
        phoneNumber: "",
        fullName: "",
        gender: true,
        isActive: true,
        hireDate: "",
      });
      setEditingId(null);
      setShowPopup(false);
      fetchAllTeachers(search);
    } catch {
      alert("Failed to save teacher");
    }
    setLoading(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setForm({
      userName: teacher.userName,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      fullName: teacher.fullName,
      gender: teacher.gender,
      isActive: teacher.isActive,
      hireDate: teacher.hireDate ? teacher.hireDate.slice(0, 10) : "",
    });
    setEditingId(teacher.teacherId);
    setShowPopup(true);
  };

  const handleRowClick = (teacher: Teacher) => {
    const now = Date.now();
    if (
      lastClick &&
      lastClick.id === teacher.teacherId &&
      now - lastClick.time < 400
    ) {
      handleEdit(teacher);
    }
    setLastClick({ id: teacher.teacherId, time: now });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giáo viên này?")) return;
    setLoading(true);
    try {
      await deleteTeacher(id);
      fetchAllTeachers(search);
    } catch {
      alert("Failed to delete teacher");
    }
    setLoading(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchAllTeachers(search);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({
      userName: "",
      email: "",
      phoneNumber: "",
      fullName: "",
      gender: true,
      isActive: true,
      hireDate: "",
    });
  };

  return {
    teachers,
    loading,
    search,
    setSearch,
    form,
    setForm,
    editingId,
    setEditingId,
    showPopup,
    setShowPopup,
    lastClick,
    setLastClick,
    handleChange,
    handleSubmit,
    handleEdit,
    handleRowClick,
    handleDelete,
    handleSearch,
    closePopup,
  };
}
