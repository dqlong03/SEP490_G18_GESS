// useMyExam.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  myExamService,
  Major,
  Subject,
  Semester,
  ExamType,
  ExamHead,
  Exam,
  SelectOption,
  ExamFilters,
} from "@/services/teacher/myExamService";

const PAGE_SIZE = 5;

export const useMyExam = () => {
  // Teacher ID
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Filter state
  const [searchName, setSearchName] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<SelectOption | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<SelectOption | null>(null);
  const [selectedHead, setSelectedHead] = useState<SelectOption | null>(null);

  // Dropdown data
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [examHeads, setExamHeads] = useState<ExamHead[]>([]);

  // Exam data
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get teacherId on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTeacherId(getUserIdFromToken());
    }
  }, []);

  // Load majors
  useEffect(() => {
    const loadMajors = async () => {
      try {
        const majorData = await myExamService.getMajors();
        setMajors(majorData);
      } catch (error) {
        console.error("Error loading majors:", error);
      }
    };

    loadMajors();
  }, []);

  // Load subjects when major changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (selectedMajor?.value) {
        try {
          const subjectData = await myExamService.getSubjectsByMajor(
            selectedMajor.value
          );
          setSubjects(subjectData);
        } catch (error) {
          console.error("Error loading subjects:", error);
          setSubjects([]);
        }
      } else {
        setSubjects([]);
        setSelectedSubject(null);
      }
    };

    loadSubjects();
  }, [selectedMajor]);

  // Load semesters
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const semesterData = await myExamService.getCurrentSemester();
        setSemesters(semesterData);
      } catch (error) {
        console.error("Error loading semesters:", error);
      }
    };

    loadSemesters();
  }, []);

  // Load exams when filters change
  useEffect(() => {
    const loadExams = async () => {
      if (!teacherId) return;

      setLoading(true);
      try {
        const filters: ExamFilters = {
          pageNumber: page,
          pageSize: PAGE_SIZE,
        };

        if (selectedMajor) filters.majorId = selectedMajor.value;
        if (selectedSemester) filters.semesterId = selectedSemester.value;
        if (selectedSubject) filters.subjectId = selectedSubject.value;
        if (selectedType) filters.examType = selectedType.value as string;
        if (searchName) filters.searchName = searchName;

        const response = await myExamService.getTeacherExams(
          teacherId,
          filters
        );

        setExams(response.data);
        setTotalPages(
          myExamService.utils.calculateTotalPages(
            response.totalCount,
            PAGE_SIZE
          )
        );

        // Extract unique exam types and heads from the response
        setExamTypes(myExamService.utils.extractExamTypes(response.data));
        setExamHeads(myExamService.utils.extractExamHeads(response.data));
      } catch (error) {
        console.error("Error loading exams:", error);
        setExams([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [
    teacherId,
    page,
    selectedMajor,
    selectedSemester,
    selectedSubject,
    selectedType,
    searchName,
  ]);

  // Filter exams by head (status) on client side
  const filteredExams = useMemo(() => {
    return myExamService.utils.filterExamsByHead(exams, selectedHead);
  }, [exams, selectedHead]);

  // Formatted options for react-select
  const majorOptions = useMemo(() => {
    return myExamService.utils.formatMajorOptions(majors);
  }, [majors]);

  const subjectOptions = useMemo(() => {
    return myExamService.utils.formatSubjectOptions(subjects);
  }, [subjects]);

  const semesterOptions = useMemo(() => {
    return myExamService.utils.formatSemesterOptions(semesters);
  }, [semesters]);

  // Handlers with page reset
  const handleMajorChange = useCallback((option: SelectOption | null) => {
    setSelectedMajor(option);
    setPage(1);
  }, []);

  const handleSubjectChange = useCallback((option: SelectOption | null) => {
    setSelectedSubject(option);
    setPage(1);
  }, []);

  const handleSemesterChange = useCallback((option: SelectOption | null) => {
    setSelectedSemester(option);
    setPage(1);
  }, []);

  const handleTypeChange = useCallback((option: SelectOption | null) => {
    setSelectedType(option);
    setPage(1);
  }, []);

  const handleHeadChange = useCallback((option: SelectOption | null) => {
    setSelectedHead(option);
    setPage(1);
  }, []);

  const handleSearchNameChange = useCallback((name: string) => {
    setSearchName(name);
    setPage(1);
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    const initialFilters = myExamService.utils.getInitialFilters();
    setSearchName(initialFilters.searchName);
    setSelectedMajor(initialFilters.selectedMajor);
    setSelectedSubject(initialFilters.selectedSubject);
    setSelectedSemester(initialFilters.selectedSemester);
    setSelectedType(initialFilters.selectedType);
    setSelectedHead(initialFilters.selectedHead);
    setPage(1);
  }, []);

  // Handle edit action
  const handleEdit = useCallback((id: number) => {
    // TODO: Implement edit functionality
    alert(`Sửa bài thi có ID: ${id}`);
  }, []);

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  // Select styles for react-select
  const selectStyles = {
    menu: (provided: any) => ({ ...provided, zIndex: 20 }),
    control: (provided: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: "#d1d5db",
      boxShadow: "none",
    }),
  };

  return {
    // Filter state
    searchName,
    selectedMajor,
    selectedSubject,
    selectedSemester,
    selectedType,
    selectedHead,

    // Dropdown options
    majorOptions,
    subjectOptions,
    semesterOptions,
    examTypes,
    examHeads,

    // Exam data
    exams: filteredExams,
    loading,

    // Pagination
    page,
    totalPages,
    pageSize: PAGE_SIZE,

    // Handlers
    handleMajorChange,
    handleSubjectChange,
    handleSemesterChange,
    handleTypeChange,
    handleHeadChange,
    handleSearchNameChange,
    handleClearFilters,
    handleEdit,
    handlePreviousPage,
    handleNextPage,
    setPage,

    // Utilities
    selectStyles,
    formatDate: myExamService.utils.formatDate,
  };
};
