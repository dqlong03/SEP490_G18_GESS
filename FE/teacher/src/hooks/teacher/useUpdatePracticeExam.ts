import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  updatePracticeExamService,
  PracticeExamPaperDTO,
  SemesterDTO,
  ExamPaperDetail,
  Student,
  GradeComponent,
  UpdatePracticeExamPayload,
} from "@/services/teacher/updatePracticeExamService";

interface SelectOption {
  value: number;
  label: string;
}

interface YearOption {
  value: string;
  label: string;
}

export const useUpdatePracticeExam = (examId: string | undefined) => {
  const router = useRouter();

  // Basic exam info state
  const [examName, setExamName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(true);

  // Class and subject info
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);

  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>(
    {}
  );

  // Grade components state
  const [gradeComponents, setGradeComponents] = useState<SelectOption[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] =
    useState<SelectOption | null>(null);

  // Semesters state
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );

  // Years state
  const [years, setYears] = useState<YearOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  // Exam papers state
  const [examPapers, setExamPapers] = useState<PracticeExamPaperDTO[]>([]);
  const [selectedExams, setSelectedExams] = useState<PracticeExamPaperDTO[]>(
    []
  );
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [examChecks, setExamChecks] = useState<Record<number, boolean>>({});
  const [loadingExams, setLoadingExams] = useState(false);

  // Detail modal state
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Preview state
  const [hoveredExam, setHoveredExam] = useState<PracticeExamPaperDTO | null>(
    null
  );
  const [previewPosition, setPreviewPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Initialize years array
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearArr: YearOption[] = [];
    for (let y = currentYear; y >= 2020; y--) {
      yearArr.push({ value: y.toString(), label: y.toString() });
    }
    setYears(yearArr);
  }, []);

  // Load initial exam data
  useEffect(() => {
    if (!examId) return;

    const loadExamData = async () => {
      setLoading(true);
      try {
        const data =
          await updatePracticeExamService.getPracticeExamForUpdate(examId);
        setExamName(data.pracExamName || "");
        setDuration(data.duration || 60);
        setStartDate(data.startDay ? data.startDay.slice(0, 16) : "");
        setEndDate(data.endDay ? data.endDay.slice(0, 16) : "");
        setSelectedGradeComponent({
          value: data.categoryExamId,
          label: "", // Will be set after loading grade components
        });
        setSubjectId(data.subjectId);
        setClassId(data.classId);
        setSelectedSemester({
          value: data.semesterId,
          label: "", // Will be set after loading semesters
        });
        setSelectedExams(data.practiceExamPaperDTO || []);
        setSelectedStudents(
          (data.studentIds || []).map(
            (id: string) =>
              ({
                studentId: id,
                code: "",
                fullName: "",
              }) as Student
          )
        );
      } catch (error: any) {
        alert(error.message || "Lỗi khi tải dữ liệu bài kiểm tra");
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId]);

  // Load class-related data when classId changes
  useEffect(() => {
    if (!classId) return;

    const loadClassData = async () => {
      try {
        // Load students
        const studentsData =
          await updatePracticeExamService.getStudentsByClass(classId);
        setStudents(studentsData || []);

        // Set student checks based on selected students
        setStudentChecks((prev) => {
          const checks: Record<string, boolean> = {};
          (selectedStudents || []).forEach((sv: Student) => {
            checks[sv.studentId] = true;
          });
          return checks;
        });

        // Load grade components
        const gradeComponentsData =
          await updatePracticeExamService.getGradeComponentsByClass(classId);
        const mappedGradeComponents = (gradeComponentsData || []).map(
          (g: GradeComponent) => ({
            value: g.categoryExamId,
            label: g.categoryExamName,
          })
        );
        setGradeComponents(mappedGradeComponents);

        // Update selected grade component label
        setSelectedGradeComponent((prev: SelectOption | null) => {
          if (!prev) return null;
          const found = mappedGradeComponents.find(
            (g: SelectOption) => g.value === prev.value
          );
          return found || prev;
        });

        // Load subject ID
        const subjectIdData =
          await updatePracticeExamService.getSubjectIdByClass(classId);
        setSubjectId(subjectIdData);

        // Load semesters
        const semestersData = await updatePracticeExamService.getSemesters();
        setSemesters(semestersData || []);

        // Update selected semester label
        setSelectedSemester((prev: SelectOption | null) => {
          if (!prev) return null;
          const found = (semestersData || []).find(
            (s: SemesterDTO) => s.semesterId === prev.value
          );
          return found
            ? { value: found.semesterId, label: found.semesterName }
            : prev;
        });
      } catch (error: any) {
        alert(error.message || "Lỗi khi tải dữ liệu lớp học");
      }
    };

    loadClassData();
  }, [classId, selectedStudents]);

  // Fetch exam papers when popup opens or filters change
  useEffect(() => {
    if (showExamPopup) {
      fetchExamPapers(
        selectedSemester?.label ?? null,
        selectedYear?.value ?? null
      );
    }
    // eslint-disable-next-line
  }, [
    showExamPopup,
    selectedSemester,
    selectedYear,
    selectedGradeComponent,
    subjectId,
  ]);

  const fetchExamPapers = async (
    semesterName: string | null,
    year: string | null
  ) => {
    setLoadingExams(true);
    try {
      const teacherId = getUserIdFromToken();
      if (!teacherId) throw new Error("Không lấy được thông tin giáo viên");
      if (!subjectId) throw new Error("Không lấy được subjectId");
      const categoryId = selectedGradeComponent?.value;
      if (!categoryId) throw new Error("Vui lòng chọn đầu điểm");

      const exams = await updatePracticeExamService.getExamPapers(
        subjectId,
        categoryId,
        teacherId
      );
      let filtered = exams || [];

      if (semesterName && year) {
        filtered = filtered.filter(
          (e: PracticeExamPaperDTO) =>
            e.semester === semesterName &&
            e.year === year &&
            !selectedExams.some(
              (se) => se.pracExamPaperId === e.pracExamPaperId
            )
        );
      } else {
        filtered = filtered.filter(
          (e: PracticeExamPaperDTO) =>
            !selectedExams.some(
              (se) => se.pracExamPaperId === e.pracExamPaperId
            )
        );
      }
      setExamPapers(filtered);
    } catch (err: any) {
      setExamPapers([]);
      alert(err.message || "Lỗi lấy danh sách đề thi");
    } finally {
      setLoadingExams(false);
    }
  };

  // Student popup handlers
  const handleOpenStudentPopup = () => setShowStudentPopup(true);

  const handleCheckStudent = (id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllStudents = () => {
    const allChecked: Record<string, boolean> = {};
    students.forEach((sv: Student) => {
      allChecked[sv.studentId] = true;
    });
    setStudentChecks(allChecked);
  };

  const handleUncheckAllStudents = () => {
    setStudentChecks({});
  };

  const handleConfirmStudents = () => {
    setSelectedStudents(students.filter((sv) => studentChecks[sv.studentId]));
    setShowStudentPopup(false);
  };

  // Exam popup handlers
  const handleOpenExamPopup = () => {
    setExamChecks({});
    setShowExamPopup(true);
    setSelectedSemester(null);
    setSelectedYear(null);
    setExamPapers([]);
  };

  const handleCheckExam = (id: number, checked: boolean) => {
    setExamChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllExams = () => {
    const allChecked: Record<number, boolean> = {};
    examPapers.forEach((exam) => {
      allChecked[exam.pracExamPaperId] = true;
    });
    setExamChecks(allChecked);
  };

  const handleUncheckAllExams = () => {
    setExamChecks({});
  };

  const handleSaveExams = () => {
    const selected = examPapers.filter(
      (exam) => examChecks[exam.pracExamPaperId]
    );
    setSelectedExams((prev) => [...prev, ...selected]);
    setShowExamPopup(false);
  };

  const handleRemoveExam = (id: number) => {
    setSelectedExams((prev) => prev.filter((c) => c.pracExamPaperId !== id));
  };

  // Detail modal handlers
  const handleShowDetail = async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const data =
        await updatePracticeExamService.getExamPaperDetail(examPaperId);
      setDetailData(data);
    } catch (err: any) {
      setDetailData(null);
      alert(err.message || "Lỗi lấy chi tiết đề thi");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  // Preview handlers
  const handleMouseEnterExam = async (
    exam: PracticeExamPaperDTO,
    e: React.MouseEvent
  ) => {
    setPreviewPosition({ x: e.clientX, y: e.clientY });
    setHoveredExam(exam);
    setLoadingDetail(true);
    try {
      const data = await updatePracticeExamService.getExamPaperDetail(
        exam.pracExamPaperId
      );
      setDetailData(data);
    } catch {
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleMouseLeaveExam = () => {
    setHoveredExam(null);
    setPreviewPosition(null);
    setDetailData(null);
  };

  // Submit handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teacherId = getUserIdFromToken();
      if (!teacherId) throw new Error("Không lấy được thông tin giáo viên");
      if (!subjectId) throw new Error("Không lấy được subjectId");
      if (!selectedSemester) throw new Error("Vui lòng chọn kỳ");
      if (!selectedGradeComponent) throw new Error("Vui lòng chọn đầu điểm");
      if (
        !examName ||
        !startDate ||
        !endDate ||
        !duration ||
        !selectedExams.length ||
        !selectedStudents.length
      ) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }

      const payload: UpdatePracticeExamPayload = {
        pracExamId: Number(examId),
        pracExamName: examName,
        duration: duration,
        startDay: startDate,
        endDay: endDate,
        createAt: new Date().toISOString(),
        teacherId: teacherId,
        categoryExamId: selectedGradeComponent.value,
        subjectId: subjectId,
        status: "Chưa thi",
        classId: classId!,
        semesterId: selectedSemester.value,
        practiceExamPaperDTO: selectedExams.map((e) => ({
          pracExamPaperId: e.pracExamPaperId,
          pracExamPaperName: e.pracExamPaperName,
          year: e.year,
          semester: e.semester,
        })),
        studentIds: selectedStudents.map((s: Student) => s.studentId),
      };

      await updatePracticeExamService.updatePracticeExam(payload);
      alert("Cập nhật bài kiểm tra thành công!");
      router.push(`/teacher/myclass/classdetail/${classId?.toString()}`);
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật bài kiểm tra");
    }
  };

  return {
    // Basic state
    examName,
    setExamName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    duration,
    setDuration,
    loading,
    classId,

    // Students
    students,
    selectedStudents,
    showStudentPopup,
    setShowStudentPopup,
    studentChecks,
    handleOpenStudentPopup,
    handleCheckStudent,
    handleCheckAllStudents,
    handleUncheckAllStudents,
    handleConfirmStudents,

    // Grade components and semesters
    gradeComponents,
    selectedGradeComponent,
    setSelectedGradeComponent,
    semesters,
    selectedSemester,
    setSelectedSemester,
    years,
    selectedYear,
    setSelectedYear,

    // Exam papers
    examPapers,
    selectedExams,
    showExamPopup,
    setShowExamPopup,
    examChecks,
    loadingExams,
    handleOpenExamPopup,
    handleCheckExam,
    handleCheckAllExams,
    handleUncheckAllExams,
    handleSaveExams,
    handleRemoveExam,

    // Detail modal
    showDetail,
    detailData,
    loadingDetail,
    handleShowDetail,
    handleCloseDetail,

    // Preview
    hoveredExam,
    previewPosition,
    handleMouseEnterExam,
    handleMouseLeaveExam,

    // Submit
    handleUpdate,

    // Router
    router,
  };
};
