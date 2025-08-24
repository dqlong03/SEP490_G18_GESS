// useFinalExam.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  finalExamService,
  Subject,
  Semester,
  Exam,
  ExamDetail,
  ExamStatistics,
  ExamFilters,
} from "../../services/teacher/finalExamService";
import { getUserIdFromToken } from "../../utils/tokenUtils";

const PAGE_SIZE = 10;

interface UseFinalExamReturn {
  // Data
  subjects: Subject[];
  semesters: Semester[];
  exams: Exam[];
  selectedSubject: Subject | null;
  selectedSemester: Semester | null;
  selectedYear: number;
  textSearch: string;
  examTypeFilter: number;

  // Pagination
  page: number;
  totalPages: number;

  // Loading states
  loading: boolean;
  fetchError: boolean;
  detailLoading: boolean;
  detailError: string | null;

  // Modal states
  showModal: boolean;
  showCreateModal: boolean;
  selectedExam: Exam | null;
  examDetail: ExamDetail | null;

  // Statistics
  statistics: ExamStatistics;

  // Options for selects
  subjectOptions: any[];
  semesterOptions: any[];
  yearOptions: any[];
  examTypeFilterOptions: any[];

  // Event handlers
  setSelectedSubject: (subject: Subject | null) => void;
  setSelectedSemester: (semester: Semester | null) => void;
  setSelectedYear: (year: number) => void;
  setTextSearch: (search: string) => void;
  setExamTypeFilter: (filter: number) => void;
  setPage: (page: number) => void;
  setShowModal: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;

  // Actions
  handleViewExam: (exam: Exam) => Promise<void>;
  handleCreateMultipleChoice: () => void;
  handleCreateEssay: () => void;
  refreshData: () => void;

  // Utility functions
  getExamTypeColor: (type: number) => string;
  getExamTypeLabel: (type: number) => string;
}

export const useFinalExam = (): UseFinalExamReturn => {
  const router = useRouter();
  const teacherId = getUserIdFromToken();
  const utils = finalExamService.utils;

  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    utils.getCurrentYear()
  );
  const [textSearch, setTextSearch] = useState<string>("");
  const [examTypeFilter, setExamTypeFilter] = useState<number>(0);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);

  // Static options
  const yearOptions = useMemo(
    () => utils.formatYearOptions(utils.getYearOptions()),
    []
  );
  const examTypeFilterOptions = useMemo(
    () => utils.getExamTypeFilterOptions(),
    []
  );

  // Dynamic options
  const subjectOptions = useMemo(
    () => utils.formatSubjectOptions(subjects),
    [subjects]
  );
  const semesterOptions = useMemo(
    () => utils.formatSemesterOptions(semesters),
    [semesters]
  );

  // Statistics
  const statistics = useMemo(() => utils.calculateStatistics(exams), [exams]);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    setFetchError(false);
    try {
      const data = await finalExamService.getSubjectsByTeacherId(teacherId);
      setSubjects(data);
      if (data && data.length > 0) {
        setSelectedSubject(data[0]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Fetch semesters
  const fetchSemesters = useCallback(async () => {
    try {
      const data = await finalExamService.getSemesters();
      setSemesters(data);
      if (data && data.length > 0) {
        setSelectedSemester(data[0]);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  }, []);

  // Fetch exams
  const fetchExams = useCallback(async () => {
    const filters: ExamFilters = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
    };

    if (selectedSubject) filters.subjectId = selectedSubject.subjectId;
    if (selectedSemester) filters.semesterId = selectedSemester.semesterId;
    if (selectedYear) filters.year = selectedYear;
    if (textSearch) filters.textsearch = textSearch;
    if (examTypeFilter !== 0) filters.type = examTypeFilter;

    setLoading(true);
    setFetchError(false);

    try {
      const [examsData, pageCount] = await Promise.all([
        finalExamService.getFinalExams(filters),
        finalExamService.getExamPageCount(filters),
      ]);

      setExams(examsData);
      setTotalPages(pageCount);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
      setTotalPages(1);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [
    selectedSubject,
    selectedSemester,
    selectedYear,
    textSearch,
    page,
    examTypeFilter,
  ]);

  // Load initial data
  useEffect(() => {
    fetchSubjects();
    fetchSemesters();
  }, [fetchSubjects, fetchSemesters]);

  // Fetch exams when filters change
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Handle view exam detail
  const handleViewExam = useCallback(async (exam: Exam) => {
    setSelectedExam(exam);
    setShowModal(true);
    setExamDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const detail = await finalExamService.getExamDetail(
        exam.examId,
        exam.examType
      );
      if (detail) {
        setExamDetail(detail);
      } else {
        setDetailError("Không thể lấy thông tin bài thi.");
      }
    } catch (error) {
      console.error("Error fetching exam detail:", error);
      setDetailError("Không thể lấy thông tin bài thi.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Handle create multiple choice exam
  const handleCreateMultipleChoice = useCallback(() => {
    setShowCreateModal(false);
    router.push("/teacher/finalexam/createexam/mulexam");
  }, [router]);

  // Handle create essay exam
  const handleCreateEssay = useCallback(() => {
    setShowCreateModal(false);
    router.push("/teacher/finalexam/createexam/pracexam");
  }, [router]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchSubjects();
    fetchSemesters();
    fetchExams();
  }, [fetchSubjects, fetchSemesters, fetchExams]);

  // Utility functions
  const getExamTypeColor = useCallback(
    (type: number) => utils.getExamTypeColor(type),
    []
  );
  const getExamTypeLabel = useCallback(
    (type: number) => utils.getExamTypeLabel(type),
    []
  );

  // Reset page when filters change
  const handleSubjectChange = useCallback((subject: Subject | null) => {
    setSelectedSubject(subject);
    setPage(1);
  }, []);

  const handleSemesterChange = useCallback((semester: Semester | null) => {
    setSelectedSemester(semester);
    setPage(1);
  }, []);

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    setPage(1);
  }, []);

  const handleTextSearchChange = useCallback((search: string) => {
    setTextSearch(search);
    setPage(1);
  }, []);

  const handleExamTypeFilterChange = useCallback((filter: number) => {
    setExamTypeFilter(filter);
    setPage(1);
  }, []);

  return {
    // Data
    subjects,
    semesters,
    exams,
    selectedSubject,
    selectedSemester,
    selectedYear,
    textSearch,
    examTypeFilter,

    // Pagination
    page,
    totalPages,

    // Loading states
    loading,
    fetchError,
    detailLoading,
    detailError,

    // Modal states
    showModal,
    showCreateModal,
    selectedExam,
    examDetail,

    // Statistics
    statistics,

    // Options
    subjectOptions,
    semesterOptions,
    yearOptions,
    examTypeFilterOptions,

    // Event handlers with page reset
    setSelectedSubject: handleSubjectChange,
    setSelectedSemester: handleSemesterChange,
    setSelectedYear: handleYearChange,
    setTextSearch: handleTextSearchChange,
    setExamTypeFilter: handleExamTypeFilterChange,
    setPage,
    setShowModal,
    setShowCreateModal,

    // Actions
    handleViewExam,
    handleCreateMultipleChoice,
    handleCreateEssay,
    refreshData,

    // Utility functions
    getExamTypeColor,
    getExamTypeLabel,
  };
};
