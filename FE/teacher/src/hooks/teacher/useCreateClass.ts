import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import {
  createClassService,
  SubjectData,
  SemesterData,
  StudentData,
  CreateClassPayload,
} from "@/services/teacher/createClassService";

interface SelectOption {
  value: number;
  label: string;
  [key: string]: any;
}

export const useCreateClass = () => {
  const router = useRouter();

  // Form state
  const [className, setClassName] = useState("");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );

  // Students state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [fileName, setFileName] = useState<string>("");

  // UI state
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Constants
  const studentId = "FFD82D0C-E754-480F-FC1A-08DDB5DCA989";

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const teacherId = getUserIdFromToken();
        if (!teacherId) return;

        const [subjectsData, semestersData] = await Promise.all([
          createClassService.getSubjectsByTeacher(teacherId),
          createClassService.getSemesters(),
        ]);

        setSubjects(subjectsData || []);
        setSemesters(semestersData || []);
      } catch (error: any) {
        console.error("Error loading initial data:", error.message);
        setErrorMsg("Lỗi khi tải dữ liệu ban đầu");
      }
    };

    loadInitialData();
  }, []);

  // Create dropdown options
  const subjectOptions: SelectOption[] = subjects.map((s: SubjectData) => ({
    value: s.subjectId,
    label: s.subjectName,
    ...s,
  }));

  const semesterOptions: SelectOption[] = semesters.map((s: SemesterData) => ({
    value: s.semesterId,
    label: s.semesterName,
    ...s,
  }));

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidDate = (date: string): boolean => {
    // Chấp nhận yyyy-mm-dd hoặc dd/mm/yyyy
    return (
      /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)
    );
  };

  // Download template handler
  const handleDownloadTemplate = () => {
    const header = [
      "Avatar",
      "Code",
      "Email",
      "Giới tính",
      "Ngày sinh",
      "Họ và tên",
    ];
    const rows = [
      [
        "https://randomuser.me/api/portraits/men/1.jpg",
        "HE173114",
        "kienlvhe173114@fpt.edu.vn",
        "Nam",
        "2002-01-01",
        "Nguyễn Văn A",
      ],
      // [
      //   "https://randomuser.me/api/portraits/women/2.jpg",
      //   "HE",
      //   "sv002@example.com",
      //   "Nữ",
      //   "2002-02-02",
      //   "Trần Thị B",
      // ],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSach");
    XLSX.writeFile(wb, "mau_sinh_vien_tao_lop.xlsx");
  };

  // Upload file handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetInput = () => {
      if (e.target) e.target.value = "";
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      setErrorMsg("");
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (json.length < 2) {
        setErrorMsg("File phải có ít nhất 1 dòng dữ liệu sinh viên.");
        setFileName("");
        resetInput();
        return;
      }

      const header = json[0];
      const requiredHeader = [
        "Avatar",
        "Code",
        "Email",
        "Giới tính",
        "Ngày sinh",
        "Họ và tên",
      ];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);

      if (!isHeaderValid) {
        setErrorMsg(
          "File mẫu không đúng định dạng hoặc thiếu trường thông tin!"
        );
        setFileName("");
        resetInput();
        return;
      }

      const dataArr: StudentData[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (
          row.length < 6 ||
          row.some((cell: any) => String(cell).trim() === "")
        ) {
          setErrorMsg(
            `Dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ tất cả trường!`
          );
          setFileName("");
          resetInput();
          return;
        }

        let [avatar, code, email, gender, dob, fullName] = row;

        // Xử lý ngày sinh
        if (typeof dob === "number") {
          // Excel serial date to JS date
          const jsDate = XLSX.SSF.parse_date_code(dob);
          if (jsDate) {
            dob = `${jsDate.y}-${String(jsDate.m).padStart(2, "0")}-${String(jsDate.d).padStart(2, "0")}`;
          }
        } else if (typeof dob === "string") {
          // dd/mm/yyyy hoặc d/m/yyyy
          if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dob)) {
            const [day, month, year] = dob.split("/");
            dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
          // mm/dd/yyyy hoặc m/d/yyyy
          else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dob)) {
            const [month, day, year] = dob.split("-");
            dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
          // yyyy-mm-dd: giữ nguyên
        }

        if (!isValidEmail(email)) {
          setErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${email}`);
          setFileName("");
          resetInput();
          return;
        }

        if (!isValidDate(dob)) {
          setErrorMsg(
            `Ngày sinh không hợp lệ ở dòng ${i + 1}: ${dob} (Định dạng: dd/mm/yyyy)`
          );
          setFileName("");
          resetInput();
          return;
        }

        dataArr.push({
          studentId: studentId,
          avatar,
          code,
          email,
          gender,
          dob,
          fullName,
        });
      }

      setFileName(file.name);
      setStudents(dataArr);
      setErrorMsg("");
      resetInput();
    };
    reader.readAsArrayBuffer(file);
  };

  // Student management handlers
  const handleAddStudent = () => {
    setStudents([
      ...students,
      {
        studentId: studentId,
        avatar: "",
        code: "",
        email: "",
        gender: "",
        dob: "",
        fullName: "",
      },
    ]);
  };

  const handleEditStudent = (idx: number, key: string, value: string) => {
    setStudents((prev) =>
      prev.map((sv, i) => (i === idx ? { ...sv, [key]: value } : sv))
    );
  };

  const handleDeleteStudent = (idx: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!className.trim() || !selectedSubject || !selectedSemester) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin lớp học!");
      return false;
    }

    for (let i = 0; i < students.length; i++) {
      const sv = students[i];
      if (
        !sv.code?.trim() ||
        !sv.email.trim() ||
        !sv.gender.trim() ||
        !sv.dob.trim() ||
        !sv.fullName.trim() ||
        !sv.avatar.trim()
      ) {
        setErrorMsg(
          `Sinh viên dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ!`
        );
        return false;
      }

      if (!isValidEmail(sv.email)) {
        setErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${sv.email}`);
        return false;
      }

      if (!isValidDate(sv.dob)) {
        setErrorMsg(
          `Ngày sinh không hợp lệ ở dòng ${i + 1}: ${sv.dob} (Định dạng: YYYY-MM-DD)`
        );
        return false;
      }
    }

    return true;
  };

  // Save class handler
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const teacherId = getUserIdFromToken();
      if (!teacherId) {
        throw new Error("Không lấy được thông tin giáo viên");
      }

      const payload: CreateClassPayload = {
        teacherId,
        subjectId: selectedSubject!.value,
        semesterId: selectedSemester!.value,
        className: className.trim(),
        students: students.map((sv) => ({
          studentId: sv.studentId || studentId,
          code: sv.code,
          fullName: sv.fullName,
          email: sv.email,
          gender: sv.gender === "Nam" ? true : false,
          dateOfBirth: sv.dob,
          avartar: sv.avatar,
          cohortId: sv.cohortId || 0,
        })),
      };

      await createClassService.createClass(payload);

      setErrorMsg("");
      alert("Tạo lớp học thành công!");
      router.push("/teacher/myclass");
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi tạo lớp học");
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  // Select styles
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: "#d1d5db",
      boxShadow: "none",
    }),
  };

  return {
    // Form state
    className,
    setClassName,
    selectedSubject,
    setSelectedSubject,
    selectedSemester,
    setSelectedSemester,
    subjectOptions,
    semesterOptions,

    // Students state
    students,
    fileName,

    // UI state
    errorMsg,
    loading,

    // Handlers
    handleDownloadTemplate,
    handleUpload,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    handleSave,
    handleFormSubmit,

    // Styles
    selectStyles,
  };
};
