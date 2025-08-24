import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  updateMCQExamService,
  GradeComponent,
  Chapter,
  Student,
  QuestionConfig,
} from "@/services/teacher/updateMCQExamService";

export const useUpdateMCQExam = (examId: number) => {
  const router = useRouter();

  // State
  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] =
    useState<GradeComponent | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [chapterChecks, setChapterChecks] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [chapterQuestions, setChapterQuestions] = useState<
    Record<number, QuestionConfig>
  >({});
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [questionInput, setQuestionInput] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(true);
  const [questionBankType, setQuestionBankType] = useState<
    "all" | "common" | "private"
  >("all");
  const [classId, setClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    setTeacherId(getUserIdFromToken() || "");
    if (!examId) return;

    const loadExamData = async () => {
      setLoading(true);
      try {
        const data = await updateMCQExamService.getExamForUpdate(examId);
        if (data) {
          setExamName(data.multiExamName || "");
          setDuration(data.duration || 60);
          setStartDate(data.startDay ? data.startDay.slice(0, 16) : "");
          setEndDate(data.endDay ? data.endDay.slice(0, 16) : "");
          setSelectedGradeComponent({
            value: data.categoryExamId,
            label: "",
          });
          setSemesterId(data.semesterId);

          // Set questionBankType based on isPublish value
          if (data.isPublish === null) {
            setQuestionBankType("all");
          } else if (data.isPublish === true) {
            setQuestionBankType("common");
          } else if (data.isPublish === false) {
            setQuestionBankType("private");
          }

          setClassId(data.classId);
          setSubjectId(data.subjectId);
          setSelectedStudents(
            (data.studentExamDTO || []).map((s: any) => ({
              studentId: s.studentId,
              code: s.code || "",
              fullName: s.fullName || "",
            }))
          );

          // Process chapters and questions
          setSelectedChapters(
            (data.noQuestionInChapterDTO || []).reduce(
              (arr: any[], item: any) => {
                if (!arr.some((c: any) => c.chapterId === item.chapterId)) {
                  arr.push({
                    chapterId: item.chapterId,
                    chapterName: item.chapterName,
                  });
                }
                return arr;
              },
              []
            )
          );

          const chapterQ: Record<number, any> = {};
          for (const item of data.noQuestionInChapterDTO || []) {
            if (!chapterQ[item.chapterId]) {
              chapterQ[item.chapterId] = {
                easy: 0,
                medium: 0,
                hard: 0,
                max: { easy: 0, medium: 0, hard: 0 },
              };
            }
            if (item.levelQuestionId === 1)
              chapterQ[item.chapterId].easy = item.numberQuestion;
            if (item.levelQuestionId === 2)
              chapterQ[item.chapterId].medium = item.numberQuestion;
            if (item.levelQuestionId === 3)
              chapterQ[item.chapterId].hard = item.numberQuestion;
          }

          for (const chapId of Object.keys(chapterQ)) {
            const easy = await updateMCQExamService.getQuestionCount(
              Number(chapId),
              "easy",
              questionBankType,
              teacherId
            );
            const medium = await updateMCQExamService.getQuestionCount(
              Number(chapId),
              "medium",
              questionBankType,
              teacherId
            );
            const hard = await updateMCQExamService.getQuestionCount(
              Number(chapId),
              "hard",
              questionBankType,
              teacherId
            );
            chapterQ[Number(chapId)].max = { easy, medium, hard };
          }
          setChapterQuestions(chapterQ);
          setQuestionInput(data.numberQuestion || 0);
        }
      } catch (error) {
        console.error("Error loading exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId]);

  // Lấy dữ liệu phụ thuộc classId
  useEffect(() => {
    if (!classId) return;

    const loadClassData = async () => {
      try {
        // Load grade components
        const gradeComps =
          await updateMCQExamService.getGradeComponents(classId);
        setGradeComponents(gradeComps);

        setSelectedGradeComponent((prev: GradeComponent | null) => {
          if (prev && prev.value) {
            const found = gradeComps.find((g) => g.value === prev.value);
            return found || null;
          }
          return null;
        });

        // Load chapters
        const chaptersData = await updateMCQExamService.getChapters(classId);
        setChapters(chaptersData);
        setSelectedChapters((prev: Chapter[]) => {
          if (!prev.length) return prev;
          return prev.map((item) => {
            const found = chaptersData.find(
              (c) => c.chapterId === item.chapterId
            );
            return found
              ? { chapterId: item.chapterId, chapterName: found.chapterName }
              : item;
          });
        });

        // Load students
        const studentsData = await updateMCQExamService.getStudents(classId);
        setStudents(studentsData);

        // Load subject ID
        const subjectIdData = await updateMCQExamService.getSubjectId(classId);
        setSubjectId(subjectIdData);
      } catch (error) {
        console.error("Error loading class data:", error);
      }
    };

    loadClassData();
  }, [classId]);

  // Thêm chapters đã chọn
  const handleSaveChapters = async () => {
    const chaptersSelected = chapters.filter(
      (chap) => chapterChecks[chap.chapterId]
    );
    const newChapterQuestions: Record<number, any> = { ...chapterQuestions };

    for (const chap of chaptersSelected) {
      if (!newChapterQuestions[chap.chapterId]) {
        const easy = await updateMCQExamService.getQuestionCount(
          chap.chapterId,
          "easy",
          questionBankType,
          teacherId
        );
        const medium = await updateMCQExamService.getQuestionCount(
          chap.chapterId,
          "medium",
          questionBankType,
          teacherId
        );
        const hard = await updateMCQExamService.getQuestionCount(
          chap.chapterId,
          "hard",
          questionBankType,
          teacherId
        );
        newChapterQuestions[chap.chapterId] = {
          easy: 0,
          medium: 0,
          hard: 0,
          max: { easy, medium, hard },
        };
      }
    }

    setSelectedChapters([
      ...selectedChapters,
      ...chaptersSelected.filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      ),
    ]);
    setChapterQuestions(newChapterQuestions);
    setShowChapterPopup(false);
  };

  // Xóa chapter
  const handleRemoveChapter = (id: number) => {
    setSelectedChapters((prev) => prev.filter((c) => c.chapterId !== id));
    setChapterQuestions((prev) => {
      const newQ = { ...prev };
      delete newQ[id];
      return newQ;
    });
  };

  // Thay đổi số lượng câu hỏi
  const handleChangeQuestionCount = (
    chapterId: number,
    type: "easy" | "medium" | "hard",
    value: number
  ) => {
    setChapterQuestions((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [type]: Math.max(0, Math.min(value, prev[chapterId].max[type])),
        max: prev[chapterId].max,
      },
    }));
  };

  // Tính tổng số câu hỏi
  const totalQuestions = Object.values(chapterQuestions).reduce(
    (sum, q) => sum + (q.easy || 0) + (q.medium || 0) + (q.hard || 0),
    0
  );

  // Xử lý popup sinh viên
  const handleOpenStudentPopup = () => {
    setShowStudentPopup(true);
  };

  const handleCheckStudent = (id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllStudents = () => {
    const allChecked: Record<string, boolean> = {};
    students.forEach((sv) => {
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

  // Xử lý popup chapters
  const handleCheckAllChapters = () => {
    const allChecked: Record<number, boolean> = {};
    chapters
      .filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      )
      .forEach((chap) => {
        allChecked[chap.chapterId] = true;
      });
    setChapterChecks(allChecked);
  };

  const handleUncheckAllChapters = () => {
    setChapterChecks({});
  };

  // Tạo payload cho API
  const buildNoQuestionInChapterDTO = () => {
    const arr: {
      numberQuestion: number;
      chapterId: number;
      levelQuestionId: number;
    }[] = [];
    selectedChapters.forEach((chap) => {
      if (chapterQuestions[chap.chapterId]?.easy > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].easy,
          chapterId: chap.chapterId,
          levelQuestionId: 1,
        });
      }
      if (chapterQuestions[chap.chapterId]?.medium > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].medium,
          chapterId: chap.chapterId,
          levelQuestionId: 2,
        });
      }
      if (chapterQuestions[chap.chapterId]?.hard > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].hard,
          chapterId: chap.chapterId,
          levelQuestionId: 3,
        });
      }
    });
    return arr;
  };

  // Cập nhật bài thi
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !examName ||
      !selectedGradeComponent ||
      !startDate ||
      !endDate ||
      !duration ||
      !semesterId ||
      !teacherId
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (questionInput > 0 && totalQuestions !== questionInput) {
      alert("Tổng số câu đã chọn phải bằng số câu hỏi yêu cầu!");
      return;
    }

    // Determine isPublish based on questionBankType
    let finalIsPublish: boolean | undefined;
    if (questionBankType === "common") {
      finalIsPublish = true;
    } else if (questionBankType === "private") {
      finalIsPublish = false;
    }
    // If questionBankType is "all", don't include isPublish (undefined)

    const payload = {
      MultiExamId: examId,
      MultiExamName: examName,
      NumberQuestion: totalQuestions,
      Duration: duration,
      StartDay: startDate,
      EndDay: endDate,
      CreateAt: new Date().toISOString(),
      teacherId,
      subjectId,
      classId,
      categoryExamId: selectedGradeComponent.value,
      semesterId,
      ...(finalIsPublish !== undefined && { isPublish: finalIsPublish }),
      noQuestionInChapterDTO: buildNoQuestionInChapterDTO(),
      studentExamDTO: selectedStudents.map((sv) => ({
        studentId: sv.studentId,
      })),
    };

    try {
      const success = await updateMCQExamService.updateExam(payload);
      if (success) {
        alert("Cập nhật bài kiểm tra thành công!");
        router.push(`/teacher/myclass/classdetail/${classId?.toString()}`);
      } else {
        alert("Cập nhật bài kiểm tra thất bại!");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  // Quay lại
  const handleBack = () => {
    router.back();
  };

  return {
    // State
    examName,
    duration,
    startDate,
    endDate,
    gradeComponents,
    selectedGradeComponent,
    chapters,
    showChapterPopup,
    chapterChecks,
    selectedChapters,
    chapterQuestions,
    students,
    showStudentPopup,
    studentChecks,
    selectedStudents,
    questionInput,
    isPublic,
    questionBankType,
    loading,
    totalQuestions,

    // Setters
    setExamName,
    setDuration,
    setStartDate,
    setEndDate,
    setSelectedGradeComponent,
    setShowChapterPopup,
    setChapterChecks,
    setShowStudentPopup,
    setQuestionInput,
    setIsPublic,
    setQuestionBankType,

    // Functions
    handleSaveChapters,
    handleRemoveChapter,
    handleChangeQuestionCount,
    handleOpenStudentPopup,
    handleCheckStudent,
    handleCheckAllStudents,
    handleUncheckAllStudents,
    handleConfirmStudents,
    handleCheckAllChapters,
    handleUncheckAllChapters,
    handleUpdate,
    handleBack,
  };
};
