const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL + "/api" || "https://localhost:7074/api";

export interface MajorResponse {
  majorId: number;
  majorName: string;
}

export interface SubjectResponse {
  subjectId: number;
  subjectName: string;
}

export interface SemesterResponse {
  semesterId: number;
  semesterName: string;
}

export interface RoomResponse {
  roomId: number;
  roomName: string;
  description: string;
  status: string;
  capacity: number;
}

export interface StudentData {
  email: string;
  code: string;
  fullName: string;
  gender: boolean;
  dateOfBirth: string;
  urlAvatar: string;
}

export interface RoomData {
  roomId: number;
  roomName: string;
  description: string;
  status: string;
  capacity: number;
}

export interface CreateExamSlotRequest {
  students: StudentData[];
  rooms: RoomData[];
  startDate: string;
  duration: number;
  startTimeInday: string;
  endTimeInDay: string;
  relaxationTime: number;
  optimizedByRoom: boolean;
  optimizedBySlotExam: boolean;
  slotName: string;
  subjectId: number;
  semesterId: number;
}

export interface ExamSlotRoom {
  roomId: number;
  students: StudentData[];
}

export interface ExamSlotResponse {
  date: string;
  startTime: string;
  endTime: string;
  rooms: ExamSlotRoom[];
  slotName: string;
  status: string;
  multiOrPractice: string;
}

export interface SaveExamSlotRequest {
  subjectId: number;
  status: string;
  multiOrPractice: string;
  slotName: string;
  semesterId: number;
  date: string;
  startTime: string;
  endTime: string;
  rooms: {
    roomId: number;
    students: StudentData[];
  }[];
}

export const examSlotService = {
  // Lấy danh sách ngành
  async getMajors(): Promise<MajorResponse[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/CreateExamSlot/GetAllMajor`
      );
      if (!response.ok) throw new Error("Failed to fetch majors");
      return await response.json();
    } catch (error) {
      console.error("Error fetching majors:", error);
      throw error;
    }
  },

  // Lấy danh sách môn học theo ngành
  async getSubjectsByMajor(majorId: number): Promise<SubjectResponse[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/MultipleExam/subject/${majorId}`
      );
      if (!response.ok) throw new Error("Failed to fetch subjects");
      return await response.json();
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }
  },

  // Lấy danh sách học kỳ
  async getSemesters(): Promise<SemesterResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/Semesters`);
      if (!response.ok) throw new Error("Failed to fetch semesters");
      return await response.json();
    } catch (error) {
      console.error("Error fetching semesters:", error);
      throw error;
    }
  },

  // Lấy danh sách phòng
  async getRooms(): Promise<RoomResponse[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/CreateExamSlot/GetAllRooms`
      );
      if (!response.ok) throw new Error("Failed to fetch rooms");
      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  // Tạo ca thi
  async createExamSlots(
    data: CreateExamSlotRequest
  ): Promise<ExamSlotResponse[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/CreateExamSlot/CalculateExamSlot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to create exam slots");
      return await response.json();
    } catch (error) {
      console.error("Error creating exam slots:", error);
      throw error;
    }
  },

  // Lưu ca thi
  async saveExamSlots(data: SaveExamSlotRequest[]): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/CreateExamSlot/SaveExamSlot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to save exam slots: " + errorText);
      }
    } catch (error) {
      console.error("Error saving exam slots:", error);
      throw error;
    }
  },
};
