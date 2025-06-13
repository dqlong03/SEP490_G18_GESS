"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
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
      setError(err.message);
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
    fetchSubjects();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName, trainingProgramId]);

  const handleAddSubject = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    setLoading(true);
    setError(null);
    try {
      await addSubjectToProgram(trainingProgramId, selectedSubjectId);
      setSelectedSubjectId(null);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (subjectId: number) => {
    if (!confirm("Bạn có chắc muốn xóa môn học này khỏi chương trình?")) return;
    setLoading(true);
    setError(null);
    try {
      await removeSubjectFromProgram(trainingProgramId, subjectId);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
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
  };
}
