import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  myClassService,
  ClassData,
  SemesterData,
  SubjectData,
  ClassFilterParams,
  CountPagesParams,
} from "@/services/teacher/myClassService";

interface SelectOption {
  value: number;
  label: string;
}

interface YearOption {
  value: number;
  label: string;
}

export const useMyClass = () => {
  const router = useRouter();

  // Filter state
  const [searchClassName, setSearchClassName] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(
    null
  );

  // Data state
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Year state
  const currentYear = new Date().getFullYear();
  const yearOptions: YearOption[] = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString(),
  }));
  const [selectedYear, setSelectedYear] = useState<YearOption>({
    value: currentYear,
    label: currentYear.toString(),
  });

  // Get teacherId from token
  const teacherId = getUserIdFromToken();

  // Load semesters on component mount
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const data = await myClassService.getCurrentSemesters();
        setSemesters(data || []);
      } catch (error: any) {
        console.error("Error loading semesters:", error.message);
        setSemesters([]);
      }
    };

    loadSemesters();
  }, []);

  // Load subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await myClassService.getSubjects();
        setSubjects(data || []);
      } catch (error: any) {
        console.error("Error loading subjects:", error.message);
        setSubjects([]);
      }
    };

    loadSubjects();
  }, []);

  // Load classes when filters change
  useEffect(() => {
    if (!teacherId) return;

    const loadClasses = async () => {
      setLoading(true);
      try {
        const classParams: ClassFilterParams = {
          teacherId,
          year: selectedYear?.value,
          name: searchClassName || undefined,
          subjectId: selectedSubject?.value,
          semesterId: selectedSemester?.value,
          pageNumber: page,
          pageSize: pageSize,
        };

        const classesData =
          await myClassService.getClassesByTeacher(classParams);
        setClasses(classesData || []);

        // Get total pages
        const countParams: CountPagesParams = {
          year: selectedYear?.value,
          name: searchClassName || undefined,
          subjectId: selectedSubject?.value,
          semesterId: selectedSemester?.value,
          pageSize: pageSize,
        };

        const totalPagesData = await myClassService.getPageCountByTeacher(
          teacherId,
          countParams
        );
        setTotalPages(totalPagesData || 1);
      } catch (error: any) {
        console.error("Error loading classes:", error.message);
        setClasses([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [
    teacherId,
    searchClassName,
    selectedSubject,
    selectedSemester,
    selectedYear,
    page,
  ]);

  // Create options for react-select
  const subjectOptions: SelectOption[] = subjects.map((s: SubjectData) => ({
    value: s.subjectId || s.id!,
    label: s.subjectName || s.name!,
  }));

  const semesterOptions: SelectOption[] = semesters.map((s: SemesterData) => ({
    value: s.semesterId || s.id!,
    label: s.semesterName || s.name!,
  }));

  // Event handlers
  const handleAddClass = () => {
    router.push("/teacher/myclass/createclass");
  };

  const handleEdit = (id: number) => {
    alert(`Sửa lớp có ID: ${id}`);
  };

  const handleDetail = (id: number) => {
    router.push(`/teacher/myclass/classdetail/${id}`);
  };

  const handleReset = () => {
    setSearchClassName("");
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedYear({ value: currentYear, label: currentYear.toString() });
    setPage(1);
  };

  const handleSearchClassNameChange = (value: string) => {
    setSearchClassName(value);
    setPage(1);
  };

  const handleSemesterChange = (option: SelectOption | null) => {
    setSelectedSemester(option);
    setPage(1);
  };

  const handleSubjectChange = (option: SelectOption | null) => {
    setSelectedSubject(option);
    setPage(1);
  };

  const handleYearChange = (option: YearOption | null) => {
    setSelectedYear(option || { value: 0, label: "0" });
    setPage(1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePreviousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  // Custom Select styles
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      borderRadius: "8px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 50,
      borderRadius: "8px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3B82F6"
        : state.isFocused
          ? "#EBF8FF"
          : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:active": {
        backgroundColor: "#3B82F6",
      },
    }),
  };

  return {
    // State
    searchClassName,
    selectedSemester,
    selectedSubject,
    selectedYear,
    semesters,
    subjects,
    classes,
    loading,
    page,
    pageSize,
    totalPages,
    yearOptions,
    subjectOptions,
    semesterOptions,
    selectStyles,

    // Event handlers
    handleAddClass,
    handleEdit,
    handleDetail,
    handleReset,
    handleSearchClassNameChange,
    handleSemesterChange,
    handleSubjectChange,
    handleYearChange,
    handleFormSubmit,
    handlePreviousPage,
    handleNextPage,
  };
};
