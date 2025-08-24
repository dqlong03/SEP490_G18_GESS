import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  classService,
  Student,
  Exam,
} from "@/services/teacher/classDetailService";

interface NewStudent {
  code: string;
  name: string;
  avatarURL: string;
}

export const useClassDetail = (classId?: string) => {
  const router = useRouter();
  const [showStudentList, setShowStudentList] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [className, setClassName] = useState<string>("");
  const [newStudent, setNewStudent] = useState<NewStudent>({
    code: "",
    name: "",
    avatarURL: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showExamOptions, setShowExamOptions] = useState<boolean>(false);
  const params = useParams();

  const CLASS_ID = classId || (params.classId as string);

  // Lấy dữ liệu lớp học từ API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await classService.getClassDetail(CLASS_ID as string);
        setStudents(data.students || []);
        setExams(data.exams || []);
        setClassName(data.className || "");
      } catch {
        setStudents([]);
        setExams([]);
        setClassName("");
      }
      setLoading(false);
    }
    fetchData();
  }, [CLASS_ID]);

  // Chỉ lấy đúng dữ liệu sinh viên
  const filteredStudents = students.filter(
    (sv) =>
      typeof sv === "object" &&
      sv.studentId &&
      sv.code &&
      sv.fullName &&
      !("examName" in sv)
  );

  // Chỉ lấy đúng dữ liệu bài thi
  const filteredExams = exams.filter(
    (ex) => typeof ex === "object" && ex.examId && ex.examName && ex.examType
  );

  // Thêm sinh viên
  const handleAddStudent = (): void => {
    if (!newStudent.code.trim() || !newStudent.name.trim()) return;
    setStudents([
      ...students,
      {
        studentId: Math.random().toString(),
        code: newStudent.code,
        fullName: newStudent.name,
        avatarURL: newStudent.avatarURL,
      },
    ]);
    setNewStudent({ code: "", name: "", avatarURL: "" });
  };

  // Lưu danh sách sinh viên
  const handleSaveStudents = (): void => {
    alert(
      "Đã lưu danh sách sinh viên (chức năng demo, cần gọi API để lưu thực tế)!"
    );
    setShowStudentList(false);
  };

  // Quay lại màn hình chính
  const handleBack = (): void => {
    setShowStudentList(false);
  };

  // Xử lý hành động bài thi
  const handleExamAction = (exam: Exam, action: string): void => {
    if (action === "view") {
      router.push(
        `/teacher/myclass/classdetail/${CLASS_ID}/examstudentscore?classId=${CLASS_ID}&examId=${exam.examId}&examType=${exam.examType === "Multiple" ? 1 : 2}`
      );
    } else if (action === "edit") {
      // Sửa logic cho nút edit
      if (exam.examType === "Multiple") {
        router.push(`/teacher/midterm/updatemulexam/${exam.examId}`);
      } else {
        router.push(`/teacher/midterm/updatepracexam/${exam.examId}`);
      }
    } else if (action === "grade") {
      const examType = exam.examType === "Multiple" ? 1 : 2;
      router.push(
        `/teacher/midterm/givegrade?examId=${exam.examId}&examType=${examType}&classId=${CLASS_ID}`
      );
    } else if (action === "watch") {
      const examType = exam.examType === "Multiple" ? 1 : 2;
      router.push(
        `/teacher/midterm/attendancechecking?examId=${exam.examId}&examType=${examType}&classId=${CLASS_ID}`
      );
    }
  };

  const truncateText = (text: string, maxLength: number = 15) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return {
    // State
    showStudentList,
    setShowStudentList,
    students,
    setStudents,
    exams,
    setExams,
    className,
    setClassName,
    newStudent,
    setNewStudent,
    loading,
    setLoading,
    showExamOptions,
    setShowExamOptions,
    CLASS_ID,
    router,
    // Computed values
    filteredStudents,
    filteredExams,
    // Methods
    handleAddStudent,
    handleSaveStudents,
    handleBack,
    handleExamAction,
    truncateText,
  };
};
