"use client";

import React, { useState, useEffect } from "react";
import { Plus, X,ChevronDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

type Student = {
  studentId: string;
  studentCode?: string;
  fullName: string;
  avatarURL: string;
};

type Exam = {
  examId: number;
  examName: string;
  gradeComponent?: string;
  status: string;
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
  const [newStudent, setNewStudent] = useState({ studentCode: "", name: "", avatarURL: "" });
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
      } catch {
        setStudents([]);
        setExams([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Thêm sinh viên (chỉ cập nhật local, muốn lưu thực tế cần gọi API)
  const handleAddStudent = () => {
    if (!newStudent.studentCode.trim() || !newStudent.name.trim()) return;
    setStudents([
      ...students,
      {
        studentId: Math.random().toString(),
        studentCode: newStudent.studentCode,
        fullName: newStudent.name,
        avatarURL: newStudent.avatarURL,
      },
    ]);
    setNewStudent({ studentCode: "", name: "", avatarURL: "" });
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 font-sans text-gray-800 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Chi tiết lớp học</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition min-w-[150px]"
          onClick={() => setShowStudentList(true)}
        >
          Danh sách học sinh sinh viên
        </button>
      </div>

      {/* Danh sách sinh viên */}
      {showStudentList ? (
        <div className="bg-blue-50 rounded-lg p-6 shadow animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-black">Danh sách sinh viên</div>
            <button
              className="flex items-center gap-1 px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold min-w-[120px]"
              onClick={handleBack}
            >
              <X size={18} /> Quay lại
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-blue-200 rounded-lg bg-white">
              <thead>
                <tr className="bg-blue-100 text-blue-900 text-base">
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-16">STT</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-40">Mã sinh viên</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center">Tên sinh viên</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center w-40">AvatarURL</th>
                </tr>
              </thead>
              <tbody>
                {students.map((sv, idx) => (
                  <tr key={sv.studentId || idx} className="text-gray-800 text-base bg-white">
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">{idx + 1}</td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                      {sv.studentCode || sv.studentId}
                    </td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                      {sv.fullName}
                    </td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                      {sv.avatarURL}
                    </td>
                  </tr>
                ))}
                {/* Thêm sinh viên mới */}
                <tr>
                  <td className="py-2 px-3 border-b border-blue-100 text-center align-middle font-semibold">
                    <Plus size={18} />
                  </td>
                  <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                    <input
                      className="border rounded px-2 py-1 w-32"
                      placeholder="Mã sinh viên"
                      value={newStudent.studentCode}
                      onChange={e =>
                        setNewStudent(s => ({ ...s, studentCode: e.target.value }))
                      }
                    />
                  </td>
                  <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                    <input
                      className="border rounded px-2 py-1 w-40"
                      placeholder="Tên sinh viên"
                      value={newStudent.name}
                      onChange={e =>
                        setNewStudent(s => ({ ...s, name: e.target.value }))
                      }
                    />
                  </td>
                  <td className="py-2 px-3 border-b border-blue-100 text-center align-middle">
                    <input
                      className="border rounded px-2 py-1 w-40"
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
          <div className="flex gap-4 mt-6">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded min-w-[120px]"
              onClick={handleSaveStudents}
            >
              Lưu
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded min-w-[120px]"
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
            <div className="text-lg font-semibold text-black">Các đầu điểm môn học</div>
            <div className="relative">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded min-w-[180px] flex items-center gap-2"
                onClick={() => setShowExamOptions((v) => !v)}
                type="button"
              >
                Tạo bài kiểm tra
                <ChevronDown size={18} />
              </button>
              {showExamOptions && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-10 animate-fadeIn">
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-800 font-semibold"
                    onClick={() => {
                      setShowExamOptions(false);
                      router.push(`/teacher/myexam/createmulexam/${CLASS_ID}`);                    }}
                  >
                    Tạo bài trắc nghiệm
                  </button>
                  <button
                    className="block w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-800 font-semibold"
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
            <div className="space-y-4"> 
              {exams.map((item, idx) => (
                <div
                  key={item.examId || idx}
                  className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-5 py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-base text-black">{item.gradeComponent}</span>
                      <span className="text-sm text-gray-700 mt-1">
                      Tên bài thi: <span className="font-semibold">{item.examName}</span>
                    </span>
                    <span className="text-sm text-gray-700 mt-1">
                      Trạng thái:{" "}
                      <span
                        className={
                          item.status === "Đã chấm"
                            ? "text-green-700 font-semibold"
                            : "text-gray-500 font-semibold"
                        }
                      >
                        {item.status}
                      </span>
                    </span>
              
                  </div>

                   <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 mt-1">
                      Số sinh viên: <span className="font-semibold">{item.studentCount}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.status === "Đã chấm" ? (
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold min-w-[150px]">
                        Xem điểm thi
                      </button>
                    ) : (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold min-w-[150px]">
                        Chấm thi
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
      `}</style>
    </div>
  );
}
