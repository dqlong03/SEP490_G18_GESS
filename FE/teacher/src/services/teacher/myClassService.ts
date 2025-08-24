const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7074";

export interface ClassData {
  classId: number;
  className: string;
  subjectName: string;
  semesterName: string;
  studentCount: number;
}

export interface SemesterData {
  semesterId: number;
  semesterName: string;
  id?: number;
  name?: string;
}

export interface SubjectData {
  subjectId: number;
  subjectName: string;
  id?: number;
  name?: string;
}

export interface ClassFilterParams {
  teacherId: string;
  year?: number;
  name?: string;
  subjectId?: number;
  semesterId?: number;
  pageNumber: number;
  pageSize: number;
}

export interface CountPagesParams {
  year?: number;
  name?: string;
  subjectId?: number;
  semesterId?: number;
  pageSize: number;
}

class MyClassService {
  async getCurrentSemesters(): Promise<SemesterData[]> {
    const response = await fetch(`${API_URL}/api/Semesters/CurrentSemester`);
    if (!response.ok) {
      throw new Error("Không lấy được danh sách kỳ học");
    }
    return await response.json();
  }

  async getSubjects(): Promise<SubjectData[]> {
    const response = await fetch(`${API_URL}/api/Subject/ListSubject`);
    if (!response.ok) {
      throw new Error("Không lấy được danh sách môn học");
    }
    return await response.json();
  }

  async getClassesByTeacher(params: ClassFilterParams): Promise<ClassData[]> {
    // Create params object and remove empty values
    const rawParams: Record<string, string> = {
      teacherId: params.teacherId,
      year: params.year?.toString() || "",
      name: params.name || "",
      subjectId: params.subjectId?.toString() || "",
      semesterId: params.semesterId?.toString() || "",
      pageNumber: params.pageNumber.toString(),
      pageSize: params.pageSize.toString(),
    };

    Object.keys(rawParams).forEach(
      (key) =>
        (rawParams[key] === "" || rawParams[key] == null) &&
        delete rawParams[key]
    );

    const urlParams = new URLSearchParams(rawParams);

    const response = await fetch(
      `${API_URL}/api/Class/teacherId?${urlParams.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Không lấy được danh sách lớp học");
    }

    return await response.json();
  }

  async getPageCountByTeacher(
    teacherId: string,
    params: CountPagesParams
  ): Promise<number> {
    // Create params object and remove empty values
    const rawParams: Record<string, string> = {
      year: params.year?.toString() || "",
      name: params.name || "",
      subjectId: params.subjectId?.toString() || "",
      semesterId: params.semesterId?.toString() || "",
      pageSize: params.pageSize.toString(),
    };

    Object.keys(rawParams).forEach(
      (key) =>
        (rawParams[key] === "" || rawParams[key] == null) &&
        delete rawParams[key]
    );

    const urlParams = new URLSearchParams(rawParams);

    const response = await fetch(
      `${API_URL}/api/Class/CountPagesByTeacher/${teacherId}?${urlParams.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Không lấy được số trang");
    }

    return await response.json();
  }
}

export const myClassService = new MyClassService();
