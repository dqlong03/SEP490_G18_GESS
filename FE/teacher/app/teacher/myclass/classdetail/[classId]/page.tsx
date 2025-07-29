"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

type Student = {
  studentId: string;
  code: string;
  fullName: string;
  avatarURL: string;
};

type Exam = {
  examId: number;
  examName: string;
  gradeComponent?: string;
  duration: number;
  questionCount: number;
  examType: string;
  isGraded: string;
  status: string | null;
  studentCount: number;
};

type ClassDetail = {
  classId: number;
  className: string;
  students: Student[];
  exams: Exam[];
};

const API_BASE = "https://localhost:7074/api/Class";

export default function ClassDetailPage() {
  const router = useRouter();
  const [showStudentList, setShowStudentList] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [className, setClassName] = useState<string>("");
  const [newStudent, setNewStudent] = useState({ code: "", name: "", avatarURL: "" });
  const [loading, setLoading] = useState(true);
  const [showExamOptions, setShowExamOptions] = useState(false);
  const params = useParams();

  const CLASS_ID = params.classId;

  // Lấy dữ liệu lớp học từ API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/${CLASS_ID}/detail`);
        if (!res.ok) throw new Error("Không thể lấy dữ liệu lớp học");
        const data: ClassDetail = await res.json();
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

  // Chỉ lấy đúng dữ liệu sinh viên (không lấy nhầm dữ liệu exam)
  const filteredStudents = students.filter(
    (sv) =>
      typeof sv === "object" &&
      sv.studentId &&
      sv.code &&
      sv.fullName &&
      !("examName" in sv)
  );

  // Chỉ lấy đúng dữ liệu bài thi (loại bỏ các bản ghi trùng hoặc không hợp lệ)
  const filteredExams = exams.filter(
    (ex) =>
      typeof ex === "object" &&
      ex.examId &&
      ex.examName &&
      ex.examType
  );

  // Thêm sinh viên (chỉ cập nhật local, muốn lưu thực tế cần gọi API)
  const handleAddStudent = () => {
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

  // Lưu danh sách sinh viên (nếu muốn gọi API thực tế)
  const handleSaveStudents = () => {
    alert("Đã lưu danh sách sinh viên (chức năng demo, cần gọi API để lưu thực tế)!");
    setShowStudentList(false);
  };

  // Quay lại màn hình chính
  const handleBack = () => {
    setShowStudentList(false);
  };

  // Xử lý hành động bài thi
  const handleExamAction = (exam: Exam, action: string) => {
    if (action === "view") {
      router.push(`/teacher/myexam/examresult/${exam.examId}`);
    } else if (action === "edit") {
      router.push(`/teacher/myexam/edit/${exam.examId}`);
    } else if (action === "grade") {
      // Sửa tại đây: Nếu là trắc nghiệm thì examType=1, tự luận thì examType=2
      const examType = exam.examType === "Multiple" ? 1 : 2;
      router.push(
        `/teacher/midterm/givegrade?examId=${exam.examId}&examType=${examType}&classId=${CLASS_ID}`
      );
    } else if (action === "watch") {
      // Sửa tại đây: Nếu là trắc nghiệm thì examType=1, tự luận thì examType=2
      const examType = exam.examType === "Multiple" ? 1 : 2;
      router.push(
        `/teacher/midterm/attendancechecking?examId=${exam.examId}&examType=${examType}&classId=${CLASS_ID}`
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 py-8 font-sans text-gray-800 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">
          Chi tiết lớp học - {className || params.classId}
        </h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition min-w-[120px] text-sm"
          onClick={() => setShowStudentList(true)}
        >
          Danh sách học sinh sinh viên
        </button>
      </div>

      {/* Danh sách sinh viên */}
      {showStudentList ? (
        <div className="bg-blue-50 rounded-lg p-4 shadow animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-black">Danh sách sinh viên</div>
            <button
              className="flex items-center gap-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold min-w-[100px] text-sm"
              onClick={handleBack}
            >
              <X size={18} /> Quay lại
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-blue-200 rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-gray-100 text-black">
                  <th className="py-2 px-2 border-b border-blue-200 text-center w-10">STT</th>
                  <th className="py-2 px-2 border-b border-blue-200 text-center w-28">Mã sinh viên</th>
                  <th className="py-2 px-2 border-b border-blue-200 text-center">Tên sinh viên</th>
                  <th className="py-2 px-2 border-b border-blue-200 text-center w-32">AvatarURL</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((sv, idx) => (
                  <tr
                    key={`${sv.studentId}-${sv.code}`}
                    className="text-gray-800 bg-white"
                  >
                    <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{idx + 1}</td>
                    <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                      {sv.code}
                    </td>
                    <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                      {sv.fullName}
                    </td>
                    <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                      {sv.avatarURL}
                    </td>
                  </tr>
                ))}
                {/* Thêm sinh viên mới */}
                <tr>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle font-semibold">
                    <Plus size={16} />
                  </td>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                    <input
                      className="border rounded px-2 py-1 w-24 text-sm"
                      placeholder="Mã sinh viên"
                      value={newStudent.code}
                      onChange={e =>
                        setNewStudent(s => ({ ...s, code: e.target.value }))
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                    <input
                      className="border rounded px-2 py-1 w-32 text-sm"
                      placeholder="Tên sinh viên"
                      value={newStudent.name}
                      onChange={e =>
                        setNewStudent(s => ({ ...s, name: e.target.value }))
                      }
                    />
                  </td>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                    <input
                      className="border rounded px-2 py-1 w-28 text-sm"
                      placeholder="AvatarURL"
                      value={newStudent.avatarURL}
                      onChange={e =>
                        setNewStudent(s => ({ ...s, avatarURL: e.target.value }))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded min-w-[90px] text-sm"
              onClick={handleSaveStudents}
            >
              Lưu
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded min-w-[90px] text-sm"
              onClick={handleBack}
            >
              Quay lại
            </button>
          </div>
        </div>
      ) : (
        // Màn hình chính: Đầu điểm
        <div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="text-lg font-semibold text-black">Các bài thi trong môn học</div>
            <div className="relative">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded min-w-[120px] flex items-center gap-2 text-sm"
                onClick={() => setShowExamOptions((v) => !v)}
                type="button"
              >
                Tạo bài kiểm tra
                <ChevronDown size={16} />
              </button>
              {showExamOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10 animate-fadeIn">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800 font-semibold text-sm"
                    onClick={() => {
                      setShowExamOptions(false);
                      router.push(`/teacher/myexam/createmulexam/${CLASS_ID}`);
                    }}
                  >
                    Tạo bài trắc nghiệm
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-800 font-semibold text-sm"
                    onClick={() => {
                      setShowExamOptions(false);
                      router.push(`/teacher/myexam/createpracexam/${CLASS_ID}`);
                    }}
                  >
                    Tạo bài tự luận
                  </button>
                </div>
              )}
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-xs md:text-sm border border-blue-200 rounded-lg bg-white table-fixed">
                <thead>
                  <tr className="bg-gray-100 text-black">
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-8">STT</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-32">Bài thi</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-20">Đầu điểm</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-16">Thời lượng</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-16">Số câu/Số đề</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-20">Loại bài</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-16">Chấm bài</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-20">Trạng thái</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-16">Số HS</th>
                    <th className="py-2 px-2 border-b border-blue-200 text-center w-36">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((item, idx) => (
                    <tr
                      key={`${item.examId}-${item.examName}`}
                      className="text-gray-800 bg-white"
                    >
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{idx + 1}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle truncate">{item.examName}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle truncate">{item.gradeComponent}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.duration}p</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.questionCount}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.examType === "Multiple" ? "Trắc nghiệm" : "Tự luận"}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.isGraded}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.status || "Chưa thi"}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.studentCount}</td>
                      <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                        <div className="flex flex-row flex-nowrap gap-1 justify-center">
                          {item.examType === "Multiple" ? (
                            item.status === "Chưa thi" ? (
                              <>
                                <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded font-semibold text-xs"
                                  onClick={() => handleExamAction(item, "watch")}
                                >
                                  Coi thi
                                </button>
                                <button
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded font-semibold text-xs"
                                  onClick={() => handleExamAction(item, "edit")}
                                >
                                  Sửa bài
                                </button>
                              </>
                            ) : (
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold text-xs"
                                onClick={() => handleExamAction(item, "view")}
                              >
                                Xem điểm
                              </button>
                            )
                          ) : (
                            item.status === "Chưa thi" ? (
                              <>
                                <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded font-semibold text-xs"
                                  onClick={() => handleExamAction(item, "watch")}
                                >
                                  Coi thi
                                </button>
                                <button
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded font-semibold text-xs"
                                  onClick={() => handleExamAction(item, "edit")}
                                >
                                  Sửa bài
                                </button>
                              </>
                            ) : item.isGraded === "Chưa chấm" ? (
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-semibold text-xs"
                                onClick={() => handleExamAction(item, "grade")}
                              >
                                Chấm bài
                              </button>
                            ) : (
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold text-xs"
                                onClick={() => handleExamAction(item, "view")}
                              >
                                Xem điểm
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-4 text-gray-500">
                        Không có bài thi nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.2s }
        .table-fixed { table-layout: fixed; }
      `}</style>
    </div>
  );
}