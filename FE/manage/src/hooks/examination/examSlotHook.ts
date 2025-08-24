import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  examSlotService,
  MajorResponse,
  SubjectResponse,
  SemesterResponse,
  RoomResponse,
  ExamSlotResponse,
  StudentData,
  RoomData,
} from "@/services/examination/examSlotService";
import { showToast } from "@/utils/toastUtils";

export interface Student {
  id: number;
  avatar: string;
  mssv: string;
  email: string;
  gender: string;
  dob: string;
  name: string;
}

export interface ProcessedSlot {
  stt: number;
  date: string;
  startTime: string;
  endTime: string;
  rooms: string;
  students: any[];
  studentsDisplay: string;
  slotName: string;
  status: string;
  multiOrPractice: string;
  originalData: ExamSlotResponse;
}

export interface SelectOption {
  value: any;
  label: string;
  [key: string]: any;
}

export const useExamSlotCreate = () => {
  const router = useRouter();

  // Form states
  const [major, setMajor] = useState<SelectOption | null>(null);
  const [subject, setSubject] = useState<SelectOption | null>(null);
  const [semester, setSemester] = useState<SelectOption | null>(null);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [breakTime, setBreakTime] = useState("");
  const [slotName, setSlotName] = useState("");
  const [examType, setExamType] = useState<"Multiple" | "Practice">("Multiple");
  const [optimizationType, setOptimizationType] = useState<"room" | "slot">(
    "slot"
  );

  // Data states
  const [majors, setMajors] = useState<SelectOption[]>([]);
  const [subjects, setSubjects] = useState<SelectOption[]>([]);
  const [semesters, setSemesters] = useState<SelectOption[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [createdSlots, setCreatedSlots] = useState<ProcessedSlot[]>([]);

  // UI states
  const [roomPopup, setRoomPopup] = useState(false);
  const [studentPopup, setStudentPopup] = useState(false);
  const [studentListPopup, setStudentListPopup] = useState(false);
  const [selectedSlotStudents, setSelectedSlotStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Student file upload states
  const [studentFileName, setStudentFileName] = useState<string>("");
  const [studentErrorMsg, setStudentErrorMsg] = useState<string>("");

  // Fetch data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchMajors(), fetchSemesters(), fetchRooms()]);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    initializeData();
  }, []);

  // Fetch subjects when major changes
  useEffect(() => {
    if (major?.value) {
      fetchSubjects(major.value);
    } else {
      setSubjects([]);
      setSubject(null);
    }
  }, [major]);

  // Fetch functions
  const fetchMajors = async () => {
    try {
      const data = await examSlotService.getMajors();
      setMajors(
        data.map((item: MajorResponse) => ({
          value: item.majorId,
          label: item.majorName,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching majors:", error);
    }
  };

  const fetchSubjects = async (majorId: number) => {
    try {
      const data = await examSlotService.getSubjectsByMajor(majorId);
      setSubjects(
        data.map((item: SubjectResponse) => ({
          value: item.subjectId,
          label: item.subjectName,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const data = await examSlotService.getSemesters();
      setSemesters(
        data.map((item: SemesterResponse) => ({
          value: item.semesterId,
          label: item.semesterName,
          ...item,
        }))
      );
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await examSlotService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Validation
  const validateForm = () => {
    if (
      !major ||
      !subject ||
      !semester ||
      !date ||
      !duration ||
      !startTime ||
      !endTime ||
      !slotName
    ) {
      showToast("warning", "Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    if (examDate < today) {
      showToast("error", "Ngày thi phải lớn hơn hoặc bằng ngày hiện tại!");
      return false;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationMinutes = parseInt(duration) || 0;
    const startPlusDuration = new Date(
      start.getTime() + durationMinutes * 60000
    );

    if (startPlusDuration > end) {
      showToast(
        "error",
        "Giờ bắt đầu cộng thời lượng phải nhỏ hơn hoặc bằng giờ kết thúc!"
      );
      return false;
    }

    if (selectedRooms.length === 0 || studentList.length === 0) {
      showToast("warning", "Vui lòng chọn phòng thi và danh sách sinh viên!");
      return false;
    }

    return true;
  };

  // Create exam slots
  const handleCreateSlots = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedRoomData = rooms.filter((room) =>
        selectedRooms.includes(room.roomId)
      );

      const studentsData: StudentData[] = studentList.map((student) => ({
        email: student.email || "string",
        code: student.mssv || "string",
        fullName: student.name || "string",
        gender: student.gender === "Nam" || student.gender === "true",
        dateOfBirth: student.dob
          ? new Date(student.dob).toISOString()
          : new Date().toISOString(),
        urlAvatar:
          student.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
      }));

      const roomsData: RoomData[] = selectedRoomData.map((room) => ({
        roomId: room.roomId,
        roomName: room.roomName || "string",
        description: room.description || "string",
        status: room.status || "string",
        capacity: room.capacity || 1,
      }));

      // Helper function to convert to VN ISO string
      const toVNISOString = (date: Date) => date.toISOString();

      // Create date objects
      const examDateObj = new Date(date + "T00:00:00");
      const startDateTime = new Date(date + "T" + startTime);
      const endDateTime = new Date(date + "T" + endTime);

      const requestBody = {
        students: studentsData,
        rooms: roomsData,
        startDate: toVNISOString(startDateTime),
        duration: parseInt(duration) || 1,
        startTimeInday: toVNISOString(startDateTime),
        endTimeInDay: toVNISOString(endDateTime),
        relaxationTime: parseInt(breakTime) || 1,
        optimizedByRoom: optimizationType === "room",
        optimizedBySlotExam: optimizationType === "slot",
        slotName: slotName,
        subjectId: subject?.value || 1,
        semesterId: semester?.value || 1,
      };

      const result = await examSlotService.createExamSlots(requestBody);

      // Process response data
      const processedSlots: ProcessedSlot[] = result.map(
        (slot: ExamSlotResponse, index: number) => ({
          stt: index + 1,
          date: new Date(slot.date).toLocaleDateString("vi-VN"),
          startTime: new Date(slot.startTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          endTime: new Date(slot.endTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          rooms: slot.rooms
            .map(
              (r: any) =>
                rooms.find((room) => room.roomId === r.roomId)?.roomName
            )
            .join(", "),
          students: slot.rooms.flatMap((r: any) => r.students),
          studentsDisplay: slot.rooms
            .flatMap((r: any) => r.students.map((s: any) => s.fullName))
            .join(", "),
          slotName: slot.slotName,
          status: slot.status,
          multiOrPractice: slot.multiOrPractice,
          originalData: slot,
        })
      );

      setCreatedSlots(processedSlots);
      showToast("success", "Tạo ca thi thành công!");
    } catch (error) {
      console.error("Error creating exam slots:", error);
      showToast("error", "Có lỗi xảy ra khi tạo ca thi!");
    } finally {
      setLoading(false);
    }
  };

  // Save exam slots
  const handleSaveSlots = async () => {
    if (createdSlots.length === 0) {
      showToast("warning", "Không có ca thi nào để lưu!");
      return;
    }

    const toVNISOString = (date: Date) => date.toISOString();

    try {
      const saveData = createdSlots.map((slot, index) => {
        const slotRooms = slot.originalData?.rooms || [];

        // Parse date and time
        let slotDateStr = slot.originalData?.date || date;
        let slotStartStr = slot.originalData?.startTime || startTime;
        let slotEndStr = slot.originalData?.endTime || endTime;

        let startDateTime: Date;
        let endDateTime: Date;
        let examDateObj: Date;

        // Handle date parsing
        if (/^\d{4}-\d{2}-\d{2}T/.test(slotDateStr)) {
          slotDateStr = slotDateStr.substring(0, 10);
        }

        // Handle start time parsing
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotStartStr)) {
          startDateTime = new Date(slotStartStr);
        } else if (/^\d{2}:\d{2}/.test(slotStartStr)) {
          startDateTime = new Date(`${slotDateStr}T${slotStartStr}`);
        } else {
          throw new Error("Giờ bắt đầu không hợp lệ");
        }

        // Handle end time parsing
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotEndStr)) {
          endDateTime = new Date(slotEndStr);
        } else if (/^\d{2}:\d{2}/.test(slotEndStr)) {
          endDateTime = new Date(`${slotDateStr}T${slotEndStr}`);
        } else {
          throw new Error("Giờ kết thúc không hợp lệ");
        }

        examDateObj = new Date(`${slotDateStr}T00:00:00`);

        // Validate dates
        if (
          isNaN(startDateTime.getTime()) ||
          isNaN(endDateTime.getTime()) ||
          isNaN(examDateObj.getTime())
        ) {
          throw new Error("Giá trị ngày hoặc giờ không hợp lệ!");
        }

        return {
          subjectId: subject?.value || 1,
          status: slot.status || "Chưa gán bài thi",
          multiOrPractice: examType,
          slotName: slot.slotName || `Slot ${index + 1}`,
          semesterId: semester?.value || 1,
          date: toVNISOString(examDateObj),
          startTime: toVNISOString(startDateTime),
          endTime: toVNISOString(endDateTime),
          rooms: slotRooms.map((room: any) => ({
            roomId: room.roomId,
            students: (room.students || []).map((student: any) => ({
              email: student.email || "string",
              code: student.code || student.mssv || "string",
              fullName: student.fullName || student.name || "string",
              gender: student.gender === "Nam" || student.gender === true,
              dateOfBirth:
                student.dateOfBirth || student.dob || new Date().toISOString(),
              urlAvatar: student.urlAvatar || student.avatar || "default.png",
            })),
          })),
        };
      });

      await examSlotService.saveExamSlots(saveData);
      showToast("success", "Lưu ca thi thành công!");
      router.push("/examination/examslot/list");
    } catch (error: any) {
      console.error("Error saving exam slots:", error);
      showToast("error", error.message || "Có lỗi xảy ra khi lưu ca thi!");
    }
  };

  // Student management functions
  const handleStudentEdit = (idx: number, field: string, value: string) => {
    const newList = [...studentList];
    (newList[idx] as any)[field] = value;
    setStudentList(newList);
  };

  const handleDownloadStudentTemplate = () => {
    const header = [
      "Avatar",
      "MSSV",
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
      //   "SV002",
      //   "sv002@example.com",
      //   "Nữ",
      //   "2002-02-02",
      //   "Trần Thị B",
      // ],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSach");
    XLSX.writeFile(wb, "mau_sinh_vien_tao_ca_thi.xlsx");
  };

  const handleStudentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetInput = () => {
      if (e.target) e.target.value = "";
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      setStudentErrorMsg("");
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      if (json.length < 2) {
        setStudentErrorMsg("File phải có ít nhất 1 dòng dữ liệu sinh viên.");
        setStudentFileName("");
        resetInput();
        return;
      }

      const header = json[0];
      const requiredHeader = [
        "Avatar",
        "MSSV",
        "Email",
        "Giới tính",
        "Ngày sinh",
        "Họ và tên",
      ];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);

      if (!isHeaderValid) {
        setStudentErrorMsg(
          "File mẫu không đúng định dạng hoặc thiếu trường thông tin!"
        );
        setStudentFileName("");
        resetInput();
        return;
      }

      const dataArr: Student[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 6 || row.some((cell: string) => cell === "")) {
          setStudentErrorMsg(
            `Dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ tất cả trường!`
          );
          setStudentFileName("");
          resetInput();
          return;
        }

        const [avatar, mssv, email, gender, dob, name] = row;

        if (!isValidEmail(email)) {
          setStudentErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${email}`);
          setStudentFileName("");
          resetInput();
          return;
        }

        // if (!isValidDate(dob)) {
        //   setStudentErrorMsg(
        //     `Ngày sinh không hợp lệ ở dòng ${i + 1}: ${dob} (Định dạng: YYYY-MM-DD)`
        //   );
        //   setStudentFileName("");
        //   resetInput();
        //   return;
        // }

        dataArr.push({
          id: Date.now() + i,
          avatar,
          mssv,
          email,
          gender,
          dob,
          name,
        });
      }

      setStudentFileName(file.name);
      setStudentList(dataArr);
      setStudentErrorMsg("");
      resetInput();
    };

    reader.readAsArrayBuffer(file);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidDate = (date: string) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  };

  const handleViewStudents = (students: any[]) => {
    setSelectedSlotStudents(students);
    setStudentListPopup(true);
  };

  const addStudent = () => {
    setStudentList([
      ...studentList,
      {
        id: Date.now(),
        avatar: "",
        mssv: "",
        email: "",
        gender: "",
        dob: "",
        name: "",
      },
    ]);
  };

  const removeStudent = (idx: number) => {
    const newList = studentList.filter((_, i) => i !== idx);
    setStudentList(newList);
  };

  return {
    // Form states
    major,
    setMajor,
    subject,
    setSubject,
    semester,
    setSemester,
    date,
    setDate,
    duration,
    setDuration,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    breakTime,
    setBreakTime,
    slotName,
    setSlotName,
    examType,
    setExamType,
    optimizationType,
    setOptimizationType,

    // Data states
    majors,
    subjects,
    semesters,
    rooms,
    selectedRooms,
    setSelectedRooms,
    studentList,
    setStudentList,
    createdSlots,

    // UI states
    roomPopup,
    setRoomPopup,
    studentPopup,
    setStudentPopup,
    studentListPopup,
    setStudentListPopup,
    selectedSlotStudents,
    loading,
    studentFileName,
    studentErrorMsg,

    // Functions
    handleCreateSlots,
    handleSaveSlots,
    handleStudentEdit,
    handleDownloadStudentTemplate,
    handleStudentUpload,
    handleViewStudents,
    addStudent,
    removeStudent,
  };
};
