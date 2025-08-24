"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { showToast } from "@/utils/toastUtils";
import {
  Subject,
  fetchSubjectsInProgram,
  fetchAllSubjects,
  addSubjectToProgram,
  removeSubjectFromProgram,
} from "@services/examination/subjectService";

export function useTrainingProgramSubjects() {
  const searchParams = useSearchParams();
  const trainingProgramId = Number(searchParams.get("trainingProgramId")) || 1;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchName, setSearchName] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        name: searchName,
        pageNumber,
        pageSize,
      };
      const data = await fetchSubjectsInProgram(trainingProgramId, params);
      setSubjects(data);
    } catch (err: any) {
      // Don't show toast for search errors, just set empty state
      setError(err.message);
      setSubjects([]);
    }
    setLoading(false);
  };

  const fetchAll = async () => {
    try {
      const data = await fetchAllSubjects();
      setAllSubjects(data);
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingProgramId]);

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, trainingProgramId]);

  // Debounced search for searchName
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setPageNumber(1);
      fetchSubjects();
    }, 800); // 800ms delay

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName]);

  const handleAddSubject = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    setLoading(true);
    setError(null);
    try {
      await addSubjectToProgram(trainingProgramId, selectedSubjectId);
      setSelectedSubjectId(null);
      showToast("success", "Thêm môn học vào chương trình thành công");
      fetchSubjects();
    } catch (err: any) {
      showToast("error", err.message || "Có lỗi xảy ra khi thêm môn học");
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (subjectId: number) => {
    setLoading(true);
    setError(null);
    try {
      await removeSubjectFromProgram(trainingProgramId, subjectId);
      showToast("success", "Xóa môn học khỏi chương trình thành công");
      fetchSubjects();
    } catch (err: any) {
      showToast("error", err.message || "Có lỗi xảy ra khi xóa môn học");
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchSubjects();
  };

  const handleDateSearch = () => {
    setPageNumber(1);
    fetchSubjects();
  };

  return {
    subjects,
    allSubjects,
    loading,
    error,
    pageNumber,
    setPageNumber,
    pageSize,
    searchName,
    setSearchName,
    selectedSubjectId,
    setSelectedSubjectId,
    handleAddSubject,
    handleDelete,
    handleSearch,
    handleDateSearch,
  };
}
