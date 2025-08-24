// useMyExamPaper.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  myExamPaperService,
  Subject,
  ExamPaper,
  SelectOption,
} from "@/services/teacher/myExamPaperService";

const PAGE_SIZE = 5;

export const useMyExamPaper = () => {
  const router = useRouter();

  // Filter state
  const [searchName, setSearchName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(
    null
  );
  const [selectedHead, setSelectedHead] = useState<SelectOption | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );

  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Memoized options for dropdowns
  const subjectOptions = useMemo(
    () => myExamPaperService.utils.formatSubjectOptions(subjects),
    [subjects]
  );

  const semesterOptions = useMemo(
    () => myExamPaperService.utils.extractSemesterOptions(exams),
    [exams]
  );

  const headOptions = useMemo(
    () => myExamPaperService.utils.extractHeadOptions(exams),
    [exams]
  );

  // Statistics
  const statistics = useMemo(
    () => myExamPaperService.utils.calculateStatistics(exams),
    [exams]
  );

  // Custom select styles
  const selectStyles = myExamPaperService.utils.getSelectStyles();

  // Load subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await myExamPaperService.getSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error loading subjects:", error);
      }
    };

    loadSubjects();
  }, []);

  // Load exams when filters change
  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);
      try {
        const filters = myExamPaperService.utils.buildFilters(
          searchName,
          selectedSubject,
          selectedHead,
          selectedSemester,
          page,
          PAGE_SIZE
        );

        const [examsData, totalPagesData] = await Promise.all([
          myExamPaperService.getExamPapers(filters),
          myExamPaperService.getTotalPages({
            ...filters,
            pageSize: PAGE_SIZE,
          }),
        ]);

        setExams(examsData);
        setTotalPages(totalPagesData);
      } catch (error) {
        console.error("Error loading exams:", error);
        setExams([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [searchName, selectedSubject, selectedHead, selectedSemester, page]);

  // Filter handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchName(value);
    setPage(1);
  }, []);

  const handleSubjectChange = useCallback((option: SelectOption | null) => {
    setSelectedSubject(option);
    setPage(1);
  }, []);

  const handleHeadChange = useCallback((option: SelectOption | null) => {
    setSelectedHead(option);
    setPage(1);
  }, []);

  const handleSemesterChange = useCallback((option: SelectOption | null) => {
    setSelectedSemester(option);
    setPage(1);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // CRUD handlers
  const handleEdit = useCallback(
    (id: number) => {
      router.push(`/teacher/myexampaper/edit/${id}`);
    },
    [router]
  );

  const handleView = useCallback(
    (id: number) => {
      router.push(`/teacher/myexampaper/view/${id}`);
    },
    [router]
  );

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này?")) {
      return;
    }

    try {
      await myExamPaperService.deleteExamPaper(id);
      alert("Xóa đề thi thành công!");
      // Reload data by resetting to page 1
      setPage(1);
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa đề thi!");
      console.error("Error deleting exam:", error);
    }
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push("/teacher/myexampaper/createexampaper");
  }, [router]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    return myExamPaperService.utils.calculateDisplayRange(
      page,
      PAGE_SIZE,
      exams.length
    );
  }, [page, exams.length]);

  // Pagination range
  const paginationRange = useMemo(() => {
    return myExamPaperService.utils.generatePaginationRange(page, totalPages);
  }, [page, totalPages]);

  // Form submission handler
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  // Format date utility
  const formatDate = myExamPaperService.utils.formatDate;

  return {
    // Filter state
    searchName,
    selectedSubject,
    selectedHead,
    selectedSemester,

    // Data
    subjects,
    exams,
    loading,

    // Options for dropdowns
    subjectOptions,
    semesterOptions,
    headOptions,

    // Pagination
    page,
    totalPages,
    paginationInfo,
    paginationRange,

    // Statistics
    statistics,

    // Styles
    selectStyles,

    // Filter handlers
    handleSearchChange,
    handleSubjectChange,
    handleHeadChange,
    handleSemesterChange,
    handleFormSubmit,

    // Pagination handlers
    handlePageChange,
    handlePreviousPage,
    handleNextPage,

    // CRUD handlers
    handleEdit,
    handleView,
    handleDelete,
    handleCreateNew,

    // Utilities
    formatDate,

    // Constants
    PAGE_SIZE,
  };
};
