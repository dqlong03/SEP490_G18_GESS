"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Subject,
  SubjectForm,
  fetchSubjects,
  countSubjects,
  createSubject,
  updateSubject,
} from "@services/examination/manageSubjectService";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectForm>({
    subjectName: "",
    description: "",
    course: "",
    noCredits: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState("");

  const router = useRouter();

  const fetchAllSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: searchName,
        pageNumber,
        pageSize,
      };
      const data = await fetchSubjects(params);
      setSubjects(data);

      const count = await countSubjects({
        name: searchName,
        pageSize,
      });
      setTotalPages(Math.ceil(count / pageSize));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId === null) {
        await createSubject(form);
      } else {
        await updateSubject(editingId, form);
      }
      setForm({ subjectName: "", description: "", course: "", noCredits: 0 });
      setEditingId(null);
      setShowPopup(false);
      fetchAllSubjects();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEdit = (subject: Subject) => {
    setForm({
      subjectName: subject.subjectName,
      description: subject.description || "",
      course: subject.course || "",
      noCredits: subject.noCredits,
    });
    setEditingId(subject.subjectId);
    setShowPopup(true);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchAllSubjects();
  };

  const handleMenuAction = (action: "score" | "chapter", subjectId: number) => {
    setOpenMenuId(null);
    if (action === "score") {
      router.push(
        `/examination/managesubject/managescore?subjectId=${subjectId}`
      );
    } else if (action === "chapter") {
      router.push(
        `/examination/managesubject/managechapter?subjectId=${subjectId}`
      );
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({ subjectName: "", description: "", course: "", noCredits: 0 });
  };

  return {
    subjects,
    loading,
    error,
    form,
    editingId,
    showPopup,
    openMenuId,
    menuRef,
    pageNumber,
    pageSize,
    totalPages,
    searchName,
    setSearchName,
    setPageNumber,
    handleChange,
    handleSubmit,
    handleEdit,
    handleSearch,
    handleMenuAction,
    closePopup,
    setShowPopup,
    setEditingId,
    setForm,
    setOpenMenuId,
  };
}
