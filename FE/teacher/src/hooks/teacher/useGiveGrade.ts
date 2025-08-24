import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  giveGradeService,
  type Subject,
  type Semester,
  type Exam,
  type GradeScheduleParams,
} from "@/services/teacher/giveGradeService";

export interface SelectOption {
  value: number;
  label: string;
}

const statusOptions = [
  { value: 0, label: "Chưa chấm" },
  { value: 1, label: "Đã chấm" },
];

// 10 năm gần nhất
const getYearOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  return Array.from({ length: 10 }, (_, i) => {
    const y1 = currentYear - i;
    const y2 = y1 + 1;
    return {
      value: y1,
      label: `${y1}-${y2}`,
    };
  });
};

export const useGiveGrade = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SelectOption[]>([]);
  const [semesters, setSemesters] = useState<SelectOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(
    statusOptions[0]
  );
  const [selectedYear, setSelectedYear] = useState<SelectOption | null>(null);

  const [exams, setExams] = useState<Exam[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const teacherId =
    getUserIdFromToken() || "2A96A929-C6A1-4501-FC19-08DDB5DCA989";
  const yearOptions = useMemo(() => getYearOptions(), []);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await giveGradeService.getSubjectsByTeacher(teacherId);
        const subjectOptions = data.map((s: Subject) => ({
          value: s.subjectId,
          label: s.subjectName,
        }));
        setSubjects(subjectOptions);

        // Set môn học đầu tiên làm mặc định
        if (subjectOptions.length > 0) {
          setSelectedSubject(subjectOptions[0]);
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
        setSubjects([]);
      }
    };

    loadSubjects();
  }, [teacherId]);

  // Load semesters
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const data = await giveGradeService.getSemesters();
        const semesterOptions = data.map((s: Semester) => ({
          value: s.semesterId,
          label: s.semesterName,
        }));
        setSemesters(semesterOptions);

        // Set học kỳ đầu tiên làm mặc định
        if (semesterOptions.length > 0) {
          setSelectedSemester(semesterOptions[0]);
        }
      } catch (error) {
        console.error("Error loading semesters:", error);
        setSemesters([]);
      }
    };

    loadSemesters();
  }, []);

  // Set năm học hiện tại làm mặc định
  useEffect(() => {
    if (yearOptions.length > 0) {
      setSelectedYear(yearOptions[0]);
    }
  }, [yearOptions]);

  // Load exams
  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);
      try {
        const params: GradeScheduleParams = {
          teacherId,
          pagesize: pageSize,
          pageindex: page,
          ...(selectedSubject && { subjectId: selectedSubject.value }),
          ...(selectedStatus && { statusExam: selectedStatus.value }),
          ...(selectedSemester && { semesterId: selectedSemester.value }),
          ...(selectedYear && { year: selectedYear.value }),
        };

        const data = await giveGradeService.getGradeSchedule(params);
        setExams(data);
      } catch (error) {
        console.error("Error loading exams:", error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [
    selectedSubject,
    selectedStatus,
    selectedSemester,
    selectedYear,
    page,
    teacherId,
  ]);

  // Load total pages
  useEffect(() => {
    const loadTotalPages = async () => {
      try {
        const params: GradeScheduleParams = {
          teacherId,
          pagesize: pageSize,
          pageindex: page,
          ...(selectedSubject && { subjectId: selectedSubject.value }),
          ...(selectedStatus && { statusExam: selectedStatus.value }),
          ...(selectedSemester && { semesterId: selectedSemester.value }),
          ...(selectedYear && { year: selectedYear.value }),
        };

        const count = await giveGradeService.getGradeScheduleCount(params);
        setTotalPages(count);
      } catch (error) {
        console.error("Error loading total pages:", error);
        setTotalPages(1);
      }
    };

    loadTotalPages();
  }, [
    selectedSubject,
    selectedStatus,
    selectedSemester,
    selectedYear,
    page,
    teacherId,
  ]);

  // Handle grading action
  const handleGrade = (
    examSlotRoomId: number,
    action: "edit" | "grade" = "grade"
  ) => {
    router.push(
      `/teacher/givegrade/examroom/${examSlotRoomId}?action=${action}`
    );
  };

  // Reset filter - set về giá trị mặc định
  const handleReset = () => {
    setSelectedSubject(subjects.length > 0 ? subjects[0] : null);
    setSelectedSemester(semesters.length > 0 ? semesters[0] : null);
    setSelectedStatus(statusOptions[0]);
    setSelectedYear(yearOptions.length > 0 ? yearOptions[0] : null);
    setPage(1);
  };

  // Format trạng thái
  const getStatusLabel = (isGrade: number | null) => {
    if (isGrade === null || isGrade === 0) return "Chưa chấm";
    if (isGrade === 1) return "Đã chấm";
    return "";
  };

  // Format trạng thái màu và badge
  const getStatusBadgeProps = (isGrade: number | null) => {
    if (isGrade === null || isGrade === 0) {
      return {
        type: "ungraded" as const,
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800",
        dotClassName: "w-2 h-2 bg-red-500 rounded-full mr-2",
        text: "Chưa chấm",
      };
    }
    if (isGrade === 1) {
      return {
        type: "graded" as const,
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800",
        dotClassName: "w-2 h-2 bg-green-500 rounded-full mr-2",
        text: "Đã chấm",
      };
    }
    return {
      type: "unknown" as const,
      className: "",
      dotClassName: "",
      text: "",
    };
  };

  // Format ngày
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Statistics
  const statistics = useMemo(() => {
    const totalExams = exams.length;
    const ungradedExams = exams.filter(
      (e) => !e.isGrade || e.isGrade === 0
    ).length;
    const gradedExams = exams.filter((e) => e.isGrade === 1).length;
    const completionRate =
      totalExams > 0 ? Math.round((gradedExams / totalExams) * 100) : 0;

    return {
      totalExams,
      ungradedExams,
      gradedExams,
      completionRate,
    };
  }, [exams]);

  return {
    // State
    subjects,
    semesters,
    selectedSubject,
    setSelectedSubject,
    selectedSemester,
    setSelectedSemester,
    selectedStatus,
    setSelectedStatus,
    selectedYear,
    setSelectedYear,
    yearOptions,
    statusOptions,
    exams,
    totalPages,
    page,
    setPage,
    loading,
    pageSize,
    statistics,

    // Functions
    handleGrade,
    handleReset,
    getStatusLabel,
    getStatusBadgeProps,
    formatDate,
  };
};
