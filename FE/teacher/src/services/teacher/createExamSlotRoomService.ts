// createExamSlotRoomService.ts

export interface Major {
  value: string;
  label: string;
}

export interface Subject {
  value: string;
  label: string;
}

export interface Semester {
  value: string;
  label: string;
}

export interface Year {
  value: string;
  label: string;
}

export interface Student {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Exam {
  id: string;
  name: string;
  type: string;
  semester: string;
  year: string;
}

export interface SlotOption {
  value: string;
  label: string;
}

export interface ExamSlotData {
  major: Major;
  subject: Subject;
  semester: Semester;
  year: Year;
  fromDate: string;
  toDate: string;
  students: Student[];
  teachers: Teacher[];
  rooms: Room[];
  splitRoom: Room;
  splitSlot: SlotOption;
  splitTeacher: Teacher;
  splitDate: string;
  splitStudents: Student[];
  selectedExam: Exam;
}

// Mock data - In real application, this would come from API
const subjectsByMajor: Record<string, Subject[]> = {
  IT: [
    { value: "IT01", label: "Lập trình C" },
    { value: "IT02", label: "Cơ sở dữ liệu" },
    { value: "IT03", label: "Mạng máy tính" },
  ],
  MATH: [
    { value: "MATH01", label: "Giải tích" },
    { value: "MATH02", label: "Đại số tuyến tính" },
    { value: "MATH03", label: "Xác suất thống kê" },
  ],
  ENG: [
    { value: "ENG01", label: "Tiếng Anh cơ bản" },
    { value: "ENG02", label: "Tiếng Anh nâng cao" },
    { value: "ENG03", label: "Tiếng Anh chuyên ngành" },
  ],
};

const mockMajors: Major[] = [
  { value: "IT", label: "Công nghệ thông tin" },
  { value: "MATH", label: "Toán học" },
  { value: "ENG", label: "Tiếng Anh" },
];

const mockSemesters: Semester[] = [
  { value: "1", label: "Kỳ 1" },
  { value: "2", label: "Kỳ 2" },
  { value: "3", label: "Kỳ 3" },
  { value: "4", label: "Kỳ 4" },
];

const mockYears: Year[] = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

const mockStudents: Student[] = [
  { id: "SV001", name: "Nguyễn Văn A" },
  { id: "SV002", name: "Trần Thị B" },
  { id: "SV003", name: "Phạm Văn C" },
  { id: "SV004", name: "Lê Thị D" },
  { id: "SV005", name: "Hoàng Văn E" },
];

const mockTeachers: Teacher[] = [
  { id: "GV001", name: "Nguyễn Văn A" },
  { id: "GV002", name: "Trần Thị B" },
  { id: "GV003", name: "Phạm Văn C" },
  { id: "GV004", name: "Lê Thị D" },
  { id: "GV005", name: "Hoàng Văn E" },
];

const mockRooms: Room[] = [
  { id: "BE1344", name: "Phòng BE1344" },
  { id: "BE1345", name: "Phòng BE1345" },
  { id: "BE1346", name: "Phòng BE1346" },
];

const mockExams: Exam[] = [
  {
    id: "EX01",
    name: "Đề 1",
    type: "Giữa kỳ",
    semester: "1",
    year: mockYears[0].value,
  },
  {
    id: "EX02",
    name: "Đề 2",
    type: "Cuối kỳ",
    semester: "2",
    year: mockYears[1].value,
  },
  {
    id: "EX03",
    name: "Đề 3",
    type: "Giữa kỳ",
    semester: "3",
    year: mockYears[2].value,
  },
];

const mockSlotOptions: SlotOption[] = [
  { value: "1", label: "Slot 1" },
  { value: "2", label: "Slot 2" },
  { value: "3", label: "Slot 3" },
  { value: "4", label: "Slot 4" },
];

export const createExamSlotRoomService = {
  // Get all majors
  async getMajors(): Promise<Major[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockMajors;
  },

  // Get subjects by major
  async getSubjectsByMajor(majorValue: string): Promise<Subject[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return subjectsByMajor[majorValue] || [];
  },

  // Get all semesters
  async getSemesters(): Promise<Semester[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockSemesters;
  },

  // Get all years
  async getYears(): Promise<Year[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockYears;
  },

  // Get all students
  async getStudents(): Promise<Student[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockStudents;
  },

  // Get all teachers
  async getTeachers(): Promise<Teacher[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockTeachers;
  },

  // Get all rooms
  async getRooms(): Promise<Room[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockRooms;
  },

  // Get all exams
  async getExams(): Promise<Exam[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockExams;
  },

  // Get slot options
  async getSlotOptions(): Promise<SlotOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockSlotOptions;
  },

  // Add student
  async addStudent(name: string, currentStudents: Student[]): Promise<Student> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newId =
      "SV" + (currentStudents.length + 1).toString().padStart(3, "0");
    return { id: newId, name };
  },

  // Remove student
  async removeStudent(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // In real app, would call API to remove student
  },

  // Add room
  async addRoom(name: string): Promise<Room> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newId = "BE" + (Math.floor(Math.random() * 9000) + 1000);
    return { id: newId, name };
  },

  // Remove room
  async removeRoom(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // In real app, would call API to remove room
  },

  // Save exam slot
  async saveExamSlot(data: ExamSlotData): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // In real app, would call API to save exam slot data
    console.log("Saving exam slot data:", data);
  },
};
