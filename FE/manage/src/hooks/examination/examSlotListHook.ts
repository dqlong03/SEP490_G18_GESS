import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import {
  examSlotListService,
  ExamSlot,
  ExamSlotDetail,
  Major,
  Subject,
  Semester,
  Exam,
  TeacherExcelRow,
  TeacherCheck,
  ExamSlotFilters,
} from "@/services/examination/examSlotListService";

export interface SelectOption {
  value: string;
  label: string;
}

export const useExamSlotList = () => {
  // States
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Filter states
  const [selectedMajor, setSelectedMajor] = useState<SelectOption | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<SelectOption | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(
    null
  );
  const [selectedExamType, setSelectedExamType] = useState<SelectOption | null>(
    null
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Modal states
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [assignType, setAssignType] = useState<"grade" | "proctor" | null>(
    null
  );
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [selectedExamSlot, setSelectedExamSlot] =
    useState<ExamSlotDetail | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // Teacher assign states
  const [teacherFileName, setTeacherFileName] = useState<string>("");
  const [teacherErrorMsg, setTeacherErrorMsg] = useState<string>("");
  const [teacherExcelRows, setTeacherExcelRows] = useState<TeacherExcelRow[]>(
    []
  );
  const [teacherChecks, setTeacherChecks] = useState<TeacherCheck[]>([]);
  const [teacherDropdowns, setTeacherDropdowns] = useState<{
    [roomId: number]: TeacherCheck | null;
  }>({});
  const [isTheSame, setIsTheSame] = useState(false);
  const [showStudents, setShowStudents] = useState<{
    [roomId: number]: boolean;
  }>({});

  // Options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const majorOptions: SelectOption[] = majors.map((major) => ({
    value: major.majorId.toString(),
    label: major.majorName,
  }));

  const subjectOptions: SelectOption[] = subjects.map((subject) => ({
    value: subject.subjectId?.toString() ?? "",
    label: subject.subjectName,
  }));

  const semesterOptions: SelectOption[] = semesters.map((semester) => ({
    value: semester.semesterId?.toString() ?? "",
    label: semester.semesterName,
  }));

  const yearOptions: SelectOption[] = years.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  // Fetch data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchMajors(), fetchSemesters(), fetchExamSlots()]);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    initializeData();
  }, []);

  // Fetch exam slots when filters change
  useEffect(() => {
    fetchExamSlots();
  }, [
    selectedSubject,
    selectedSemester,
    selectedYear,
    selectedStatus,
    selectedExamType,
    fromDate,
    toDate,
    currentPage,
  ]);

  // Fetch subjects when major changes
  useEffect(() => {
    if (selectedMajor?.value) {
      fetchSubjectsByMajor(parseInt(selectedMajor.value));
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedMajor]);

  // Fetch functions
  const fetchMajors = async () => {
    try {
      const data = await examSlotListService.getMajors();
      setMajors(data);
    } catch (err) {
      setError("Không thể tải danh sách ngành học");
    }
  };

  const fetchSubjectsByMajor = async (majorId: number) => {
    try {
      const data = await examSlotListService.getSubjectsByMajor(majorId);
      setSubjects(data);
    } catch (err) {
      setError("Không thể tải danh sách môn học");
    }
  };

  const fetchSemesters = async () => {
    try {
      const data = await examSlotListService.getSemesters();
      setSemesters(data);
    } catch (err) {
      setError("Không thể tải danh sách học kỳ");
    }
  };

  const fetchExamSlots = async () => {
    setLoading(true);
    try {
      const filters: ExamSlotFilters = {
        pageSize,
        pageIndex: currentPage,
      };

      if (selectedSubject?.value) filters.subjectId = selectedSubject.value;
      if (selectedSemester?.value) filters.semesterId = selectedSemester.value;
      if (selectedYear?.value) filters.year = selectedYear.value;
      if (selectedStatus?.value) filters.status = selectedStatus.value;
      if (selectedExamType?.value) filters.examType = selectedExamType.value;
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;

      const [slotsData, totalPagesData] = await Promise.all([
        examSlotListService.getExamSlots(filters),
        examSlotListService.getTotalPages(filters),
      ]);

      setExamSlots(slotsData);
      setTotalPages(totalPagesData);
    } catch (err) {
      alert("Không thể tải danh sách ca thi do lỗi hệ thống hoặc kết nối!");
      setExamSlots([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSlotDetail = async (examSlotId: number) => {
    try {
      const data = await examSlotListService.getExamSlotDetail(examSlotId);
      setSelectedExamSlot(data);
      setShowViewModal(true);
      setAssignType(null);
      setTeacherChecks([]);
      setTeacherDropdowns({});
      setTeacherExcelRows([]);
      setTeacherFileName("");
      setTeacherErrorMsg("");
      setIsTheSame(false);
    } catch (err) {
      setError("Không thể tải thông tin ca thi");
    }
  };

  const fetchExams = async (
    semesterId: string,
    subjectId: string,
    examType: string,
    year: string
  ) => {
    try {
      const data = await examSlotListService.getExams(
        semesterId,
        subjectId,
        examType,
        year
      );
      setExams(data);
    } catch (err) {
      setError("Không thể tải danh sách bài thi");
    }
  };

  // Action functions
  const addExamToSlot = async (
    examSlotId: number,
    examId: number,
    examType: string
  ) => {
    try {
      await examSlotListService.addExamToSlot(examSlotId, examId, examType);
      setShowExamModal(false);
      fetchExamSlots();
      alert("Thêm bài thi vào ca thi thành công!");
    } catch (err) {
      alert("Thêm bài thi vào ca thi không thành công!");
      setError(
        "Không thể thêm bài thi vào ca thi do đã có bài thi trong ca thi này"
      );
    }
  };

  const changeExamSlotStatus = async (examSlotId: number, examType: string) => {
    try {
      await examSlotListService.changeExamSlotStatus(examSlotId, examType);
      fetchExamSlots();
      alert("Thay đổi trạng thái ca thi thành công!");
    } catch (err) {
      setError("Không thể thay đổi trạng thái ca thi");
    }
  };

  // Event handlers
  const handleMajorChange = (option: SelectOption | null) => {
    setSelectedMajor(option);
    setSelectedSubject(null);
    setSubjects([]);
    setCurrentPage(1);
  };

  const handleSubjectChange = (option: SelectOption | null) => {
    setSelectedSubject(option);
    setCurrentPage(1);
  };

  const handleSemesterChange = (option: SelectOption | null) => {
    setSelectedSemester(option);
    setCurrentPage(1);
  };

  const handleYearChange = (option: SelectOption | null) => {
    setSelectedYear(option);
    setCurrentPage(1);
  };

  const handleStatusChange = (option: SelectOption | null) => {
    setSelectedStatus(option);
    setCurrentPage(1);
  };

  const handleExamTypeChange = (option: SelectOption | null) => {
    setSelectedExamType(option);
    setCurrentPage(1);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
    setCurrentPage(1);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusClick = async (examSlot: ExamSlot) => {
    if (examSlot.status === "Chưa gán bài thi") {
      if (
        selectedSemester?.value &&
        selectedSubject?.value &&
        selectedYear?.value
      ) {
        await fetchExams(
          selectedSemester.value,
          selectedSubject.value,
          examSlot.examType,
          selectedYear.value
        );
        setSelectedExamSlot({
          examSlotId: examSlot.examSlotId,
          slotName: examSlot.slotName,
          status: examSlot.status,
          examType: examSlot.examType,
          subjectId: examSlot.subjectId,
          subjectName: examSlot.subjectName,
          examDate: examSlot.examDate,
          startTime: "",
          endTime: "",
          examName: null,
          semesterName: examSlot.semesterName,
          examSlotRoomDetails: [],
        });
        setShowExamModal(true);
      } else {
        alert("Vui lòng chọn học kỳ, môn học và năm để xem danh sách bài thi");
      }
    } else if (examSlot.status === "Chưa mở ca") {
      if (examSlot.proctorStatus !== "Đã gán giảng viên coi thi") {
        alert(
          "Bạn cần gán đủ người coi thi cho tất cả các phòng trước khi mở ca!"
        );
        return;
      }

      const examDate = new Date(examSlot.examDate);
      const currentDate = new Date();
      examDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      if (examDate.getTime() !== currentDate.getTime()) {
        const examDateStr = examDate.toLocaleDateString("vi-VN");
        const currentDateStr = currentDate.toLocaleDateString("vi-VN");
        alert(
          `Không thể mở ca thi!\n\n` +
            `Ngày thi: ${examDateStr}\n` +
            `Ngày hiện tại: ${currentDateStr}\n\n` +
            `Ca thi chỉ có thể được mở vào đúng ngày thi.`
        );
        return;
      }
      const examTypeNum =
        examSlot.examType === "Multiple" ? "Multiple" : "Practice";
      await changeExamSlotStatus(examSlot.examSlotId, examTypeNum);
    } else {
      const examTypeNum =
        examSlot.examType === "Multiple" ? "Multiple" : "Practice";
      await changeExamSlotStatus(examSlot.examSlotId, examTypeNum);
    }
  };

  const handleAssignTeacher = async (
    examSlotId: number,
    type: "grade" | "proctor"
  ) => {
    try {
      const data = await examSlotListService.getExamSlotDetail(examSlotId);
      setSelectedExamSlot(data);
      setShowViewModal(true);
      setAssignType(type);
      setTeacherChecks([]);
      setTeacherDropdowns({});
      setTeacherExcelRows([]);
      setTeacherFileName("");
      setTeacherErrorMsg("");
      setIsTheSame(false);
    } catch (err) {
      setError("Không thể tải thông tin ca thi");
    }
  };

  const handleTeacherDropdownChange = (
    roomId: number,
    teacher: TeacherCheck | null
  ) => {
    setTeacherDropdowns((prev) => {
      const newDropdowns = { ...prev, [roomId]: teacher };
      if (teacher) {
        Object.keys(newDropdowns).forEach((key) => {
          const numKey = Number(key);
          if (
            numKey !== roomId &&
            newDropdowns[numKey]?.teacherId === teacher.teacherId
          ) {
            newDropdowns[numKey] = null;
          }
        });
      }
      return newDropdowns;
    });
  };

  const handleDownloadTeacherTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DanhSachGV");

    worksheet.addRow([
      "Mã GV",
      "Họ tên",
      "Email",
      "Số điện thoại",
      "Ngày sinh",
      "Giới tính",
      "Ngành",
    ]);
    worksheet.addRow([
      "GV001",
      "Nguyễn Văn A",
      "gv001@example.com",
      "0912345678",
      "1990-01-01",
      "Nam",
      majors[0]?.majorName || "",
    ]);
    worksheet.addRow([
      "GV002",
      "Trần Thị B",
      "gv002@example.com",
      "0987654321",
      "1992-02-02",
      "Nữ",
      majors[1]?.majorName || majors[0]?.majorName || "",
    ]);

    const majorNames = majors.map((m) => m.majorName);
    worksheet.getColumn(7).eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && rowNumber <= 3) {
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"${majorNames.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Lỗi",
          error: "Vui lòng chọn ngành từ danh sách!",
        };
      }
    });

    worksheet.getColumn(6).eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && rowNumber <= 3) {
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"Nam,Nữ"`],
          showErrorMessage: true,
          errorTitle: "Lỗi",
          error: "Vui lòng chọn giới tính Nam hoặc Nữ!",
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mau_giao_vien.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTeacherUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTeacherErrorMsg("");
    setTeacherExcelRows([]);
    setTeacherChecks([]);
    setTeacherDropdowns({});
    setTeacherFileName("");

    const resetInput = () => {
      if (e.target) e.target.value = "";
    };

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (json.length < 2) {
        setTeacherErrorMsg("File phải có ít nhất 1 dòng dữ liệu giáo viên.");
        setTeacherFileName("");
        resetInput();
        return;
      }

      const header = json[0];
      const requiredHeader = [
        "Mã GV",
        "Họ tên",
        "Email",
        "Số điện thoại",
        "Ngày sinh",
        "Giới tính",
        "Ngành",
      ];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);

      if (!isHeaderValid) {
        setTeacherErrorMsg(
          "File mẫu không đúng định dạng hoặc thiếu trường thông tin!"
        );
        setTeacherFileName("");
        resetInput();
        return;
      }

      const dataArr: TeacherExcelRow[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 7 || row.some((cell: string) => cell === "")) {
          setTeacherErrorMsg(
            `Dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ tất cả trường!`
          );
          setTeacherFileName("");
          resetInput();
          return;
        }

        const [
          code,
          fullName,
          email,
          phoneNumber,
          dateOfBirth,
          gender,
          majorName,
        ] = row;
        const foundMajor = majors.find((m) => m.majorName === majorName);

        if (!foundMajor) {
          setTeacherErrorMsg(
            `Ngành "${majorName}" ở dòng ${i + 1} không tồn tại. Vui lòng tải lên file khác!`
          );
          setTeacherFileName("");
          resetInput();
          return;
        }

        if (gender !== "Nam" && gender !== "Nữ") {
          setTeacherErrorMsg(
            `Giới tính ở dòng ${i + 1} phải là "Nam" hoặc "Nữ"!`
          );
          setTeacherFileName("");
          resetInput();
          return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
          setTeacherErrorMsg(
            `Ngày sinh ở dòng ${i + 1} phải có định dạng yyyy-mm-dd!`
          );
          setTeacherFileName("");
          resetInput();
          return;
        }

        dataArr.push({
          code,
          fullName,
          email,
          phoneNumber,
          dateOfBirth,
          gender,
          majorName,
        });
      }

      setTeacherFileName(file.name);
      setTeacherExcelRows(dataArr);

      try {
        const checkExistBody = dataArr.map((row) => ({
          code: row.code,
          fullname: row.fullName,
          email: row.email,
          phoneNumber: row.phoneNumber,
          dateOfBirth: row.dateOfBirth,
          gender: row.gender === "Nam",
          userName: row.email,
          isActive: true,
          password: "Password123!",
          majorName: row.majorName,
          majorId:
            majorOptions.find((m) => m.label === row.majorName)?.value || 0,
          hireDate: "2025-08-17T07:17:00.631Z",
          subjectId: 1,
        }));

        if (!selectedExamSlot) return;

        const checkExistData =
          await examSlotListService.checkTeacherExist(checkExistBody);
        const teacherIds = checkExistData.map((t: any, idx: number) => ({
          teacherId: t.teacherId,
          teacherName: t.fullname,
          isChecked: true,
          code: t.code,
          majorId: parseInt(
            majorOptions.find((m) => m.label === dataArr[idx].majorName)
              ?.value || "1"
          ),
          majorName: dataArr[idx].majorName,
        }));

        if (assignType === "grade") {
          setTeacherChecks(teacherIds);
          setTeacherErrorMsg("");
          resetInput();
          return;
        }

        const isAvailableData = await examSlotListService.isTeacherAvailable(
          selectedExamSlot.examSlotId,
          teacherIds.map((t: any) => ({
            teacherId: t.teacherId,
            teacherName: t.teacherName,
            isChecked: true,
          }))
        );

        const availableTeachers: TeacherCheck[] = isAvailableData.teacherChecks
          .filter((t: any) => t.isChecked)
          .map((t: any) => {
            const found = teacherIds.find(
              (x: any) => x.teacherId === t.teacherId
            );
            return {
              teacherId: t.teacherId,
              teacherName: t.teacherName,
              isChecked: t.isChecked,
              code: found?.code,
              majorId: found?.majorId,
              majorName: found?.majorName,
            };
          });

        setTeacherChecks(availableTeachers);
        setTeacherErrorMsg("");
      } catch (err) {
        setTeacherErrorMsg("Lỗi kiểm tra giáo viên. Vui lòng thử lại!");
      }
      resetInput();
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveGradeTeacher = async () => {
    if (!selectedExamSlot) return;

    const missingRooms = selectedExamSlot.examSlotRoomDetails.filter(
      (room) => !teacherDropdowns[room.roomId]
    );
    if (missingRooms.length > 0) {
      alert("Vui lòng chọn giáo viên cho tất cả các phòng trước khi lưu!");
      return;
    }

    const teacherExamslotRoom = selectedExamSlot.examSlotRoomDetails
      .map((room) => {
        const teacher = teacherDropdowns[room.roomId];
        if (!teacher) return null;
        return {
          examSlotRoomId: room.examSlotRoomId,
          teacherId: teacher.teacherId,
          teacherName: teacher.teacherName,
          majorId: teacher.majorId,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (
      teacherExamslotRoom.length !== selectedExamSlot.examSlotRoomDetails.length
    ) {
      alert("Vui lòng chọn đủ giáo viên cho tất cả các phòng!");
      return;
    }

    try {
      await examSlotListService.addGradeTeacherToExamSlot({
        teacherExamslotRoom,
        subjectId: 1,
        subjectName: 0,
      });
      alert("Thêm giảng viên chấm thi thành công!");
      setShowViewModal(false);
      setAssignType(null);
      fetchExamSlots();
    } catch (err) {
      alert("Lỗi khi lưu giảng viên chấm thi!");
    }
  };

  const handleSaveProctorTeacher = async () => {
    if (!selectedExamSlot) return;

    const missingRooms = selectedExamSlot.examSlotRoomDetails.filter(
      (room) => !teacherDropdowns[room.roomId]
    );
    if (missingRooms.length > 0) {
      alert("Vui lòng chọn giáo viên cho tất cả các phòng trước khi lưu!");
      return;
    }

    const teacherExamslotRoom = selectedExamSlot.examSlotRoomDetails
      .map((room) => {
        const teacher = teacherDropdowns[room.roomId];
        if (!teacher) return null;
        return {
          examSlotRoomId: room.examSlotRoomId,
          teacherId: teacher.teacherId,
          teacherName: teacher.teacherName,
          majorId: teacher.majorId,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (
      teacherExamslotRoom.length !== selectedExamSlot.examSlotRoomDetails.length
    ) {
      alert("Vui lòng chọn đủ giáo viên cho tất cả các phòng!");
      return;
    }

    try {
      await examSlotListService.addTeacherToExamSlotRoom({
        teacherExamslotRoom,
        isTheSame,
        subjectId: 1,
        subjectName: 0,
      });
      alert("Thêm giảng viên coi thi thành công!");
      setShowViewModal(false);
      setAssignType(null);
      fetchExamSlots();
    } catch (err) {
      alert("Lỗi khi lưu giảng viên coi thi!");
    }
  };

  const handleToggleStudents = (roomId: number) => {
    setShowStudents((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const handleClearFilters = () => {
    setSelectedMajor(null);
    setSelectedSubject(null);
    setSelectedSemester(null);
    setSelectedYear(null);
    setFromDate("");
    setToDate("");
    setSelectedStatus(null);
    setSelectedExamType(null);
    setCurrentPage(1);
  };

  return {
    // Data states
    examSlots,
    majors,
    subjects,
    semesters,
    exams,
    loading,
    error,
    setError,

    // Filter states
    selectedMajor,
    selectedSubject,
    selectedSemester,
    selectedYear,
    fromDate,
    toDate,
    selectedStatus,
    selectedExamType,

    // Options
    majorOptions,
    subjectOptions,
    semesterOptions,
    yearOptions,

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,

    // Modal states
    showViewModal,
    setShowViewModal,
    assignType,
    setAssignType,
    showExamModal,
    setShowExamModal,
    selectedExamSlot,
    selectedExamId,
    setSelectedExamId,

    // Teacher states
    teacherFileName,
    teacherErrorMsg,
    teacherExcelRows,
    teacherChecks,
    teacherDropdowns,
    isTheSame,
    setIsTheSame,
    showStudents,

    // Event handlers
    handleMajorChange,
    handleSubjectChange,
    handleSemesterChange,
    handleYearChange,
    handleStatusChange,
    handleExamTypeChange,
    handleFromDateChange,
    handleToDateChange,
    handleStatusClick,
    handleAssignTeacher,
    handleTeacherDropdownChange,
    handleDownloadTeacherTemplate,
    handleTeacherUpload,
    handleSaveGradeTeacher,
    handleSaveProctorTeacher,
    handleToggleStudents,
    handleClearFilters,

    // Action functions
    fetchExamSlotDetail,
    addExamToSlot,
    changeExamSlotStatus,
  };
};
