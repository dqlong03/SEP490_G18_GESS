"use client";

import React, { useState, useEffect } from "react";
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
    (ex) =>
      typeof ex === "object" &&
      ex.examId &&
      ex.examName &&
      ex.examType
  );

  // Thêm sinh viên
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

  // Lưu danh sách sinh viên
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

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    if (status === "Chưa thi" || !status) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          Chưa thi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        {status}
      </span>
    );
  };

  // Get grading badge
  const getGradingBadge = (isGraded: string) => {
    if (isGraded === "Chưa chấm") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Chưa chấm
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        {isGraded}
      </span>
    );
  };

  const truncateText = (text: string, maxLength: number = 15) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chi tiết lớp học</h1>
                <p className="text-gray-600">{className || `Lớp ${params.classId}`}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowStudentList(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Quản lý sinh viên</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {showStudentList ? (
          /* Student List Section */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Danh sách sinh viên
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">Tổng: {filteredStudents.length} sinh viên</span>
                  <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay lại</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sinh viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar URL</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((sv, idx) => (
                    <tr key={`${sv.studentId}-${sv.code}`} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sv.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {sv.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{sv.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sv.avatarURL || "-"}
                      </td>
                    </tr>
                  ))}
                  {/* Add new student row */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <svg className="w-5 h-5 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mã sinh viên"
                        value={newStudent.code}
                        onChange={e => setNewStudent(s => ({ ...s, code: e.target.value }))}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tên sinh viên"
                        value={newStudent.name}
                        onChange={e => setNewStudent(s => ({ ...s, name: e.target.value }))}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Avatar URL"
                        value={newStudent.avatarURL}
                        onChange={e => setNewStudent(s => ({ ...s, avatarURL: e.target.value }))}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddStudent}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Thêm sinh viên</span>
                </button>
                <button
                  onClick={handleSaveStudents}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lưu danh sách</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Exams List Section */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Các bài thi trong lớp học
                </h3>
                
                <div className="relative">
                  <button
                    onClick={() => setShowExamOptions(!showExamOptions)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Tạo bài kiểm tra</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showExamOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showExamOptions && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={() => {
                          setShowExamOptions(false);
                          router.push(`/teacher/myexam/createmulexam/${CLASS_ID}`);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span>Tạo bài trắc nghiệm</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowExamOptions(false);
                          router.push(`/teacher/myexam/createpracexam/${CLASS_ID}`);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <span>Tạo bài tự luận</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bài thi</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Đầu điểm</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu/đề</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Loại bài</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chấm bài</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SV</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExams.map((item, idx) => (
                      <tr key={`${item.examId}-${item.examName}`} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{truncateText(item.examName)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{item.gradeComponent || "-"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{item.duration} phút</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{item.questionCount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            item.examType === "Multiple" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {item.examType === "Multiple" ? "Trắc nghiệm" : "Tự luận"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getGradingBadge(item.isGraded)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{item.studentCount}</span>
                          </div>
                        </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {item.examType === "Multiple" ? (
                            // Multiple Choice exam logic
                            item.status === "Chưa mở ca" ? (
                              <>
                                <button
                                  onClick={() => handleExamAction(item, "watch")}
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Coi thi
                                </button>
                                <button
                                  onClick={() => handleExamAction(item, "edit")}
                                  className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Sửa
                                </button>
                              </>
                            ) : item.status === "Đang mở ca" ? (
                              <button
                                onClick={() => handleExamAction(item, "watch")}
                                className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Đang coi thi
                              </button>
                            ) : (
                              // Đã đóng ca
                              <button
                                onClick={() => handleExamAction(item, "view")}
                                className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Xem điểm
                              </button>
                            )
                          ) : (
                            // Essay/Practical exam logic
                            item.status === "Chưa mở ca" ? (
                              <>
                                <button
                                  onClick={() => handleExamAction(item, "watch")}
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Coi thi
                                </button>
                                <button
                                  onClick={() => handleExamAction(item, "edit")}
                                  className="inline-flex items-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Sửa
                                </button>
                              </>
                            ) : item.status === "Đang mở ca" ? (
                              <button
                                onClick={() => handleExamAction(item, "watch")}
                                className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Đang coi thi
                              </button>
                            ) : item.isGraded === "Chưa chấm" ? (
                              // Đã đóng ca & Chưa chấm
                              <button
                                onClick={() => handleExamAction(item, "grade")}
                                className="inline-flex items-center px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Chấm bài
                              </button>
                            ) : (
                              // Đã đóng ca & Đã chấm
                              <button
                                onClick={() => handleExamAction(item, "view")}
                                className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
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
                        <td colSpan={10} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">Chưa có bài thi nào</p>
                            <p className="text-gray-400 text-sm">Tạo bài kiểm tra đầu tiên cho lớp học này</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}