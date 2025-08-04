'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@utils/tokenUtils';
import { 
  ChevronLeft, 
  Users, 
  CheckCircle, 
  Clock, 
  Award, 
  Eye, 
  UserCheck,
  GraduationCap,
  FileText,
  AlertCircle
} from 'lucide-react';

type StudentGradingDTO = {
  id: string;
  code: string;
  fullName: string;
  isGraded: number;
  score: number | null;
};

export default function MidtermGradingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const examId = searchParams.get('examId');
  const examType = searchParams.get('examType');
  const teacherId = getUserIdFromToken();

  const [students, setStudents] = useState<StudentGradingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId || !examId || !classId || !examType) return;
    setLoading(true);
    fetch(
      `https://localhost:7074/api/GradeScheduleMidTerm/teacher/${teacherId}/exam/${examId}/students?classID=${classId}&ExamType=${examType}`
    )
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [teacherId, examId, classId, examType]);

  // Statistics
  const totalStudents = students.length;
  const gradedStudents = students.filter(s => s.isGraded === 1).length;
  const ungradedStudents = totalStudents - gradedStudents;
  const averageScore = gradedStudents > 0 
    ? (students.filter(s => s.isGraded === 1).reduce((sum, s) => sum + (s.score || 0), 0) / gradedStudents).toFixed(1)
    : 0;

  // Chuyển sang trang chấm bài cho sinh viên
  const handleGradeStudent = (studentId: string) => {
    router.push(
      `/teacher/midterm/givegrade/examofstudent?studentId=${studentId}&examId=${examId}&classId=${classId}&examType=${examType}`
    );
  };

  const handleConfirm = async () => {
    if (ungradedStudents > 0) {
      const confirmed = window.confirm(
        `Còn ${ungradedStudents} sinh viên chưa được chấm bài. Bạn có chắc chắn muốn hoàn thành chấm bài?`
      );
      if (!confirmed) return;
    }

    try {
      const pracExamId = examId;
      if (!pracExamId) {
        alert('Không tìm thấy mã ca thi (pracExamId)!');
        return;
      }
      const res = await fetch(
        `https://localhost:7074/api/GradeScheduleMidTerm/practice-exam/${pracExamId}/mark-graded`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        alert(msg || 'Không thể cập nhật trạng thái chấm bài!');
      } else {
        alert('Đã chuyển trạng thái chấm bài thành công!');
        router.back();
      }
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái chấm bài!');
    }
  };

  // Quay lại
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chấm điểm giữa kỳ</h1>
                <p className="text-gray-600">Quản lý và chấm điểm bài thi sinh viên</p>
              </div>
            </div>
            
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã chấm</p>
                <p className="text-2xl font-bold text-green-600">{gradedStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa chấm</p>
                <p className="text-2xl font-bold text-orange-600">{ungradedStudents}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm TB</p>
                <p className="text-2xl font-bold text-purple-600">{averageScore}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Tiến độ chấm bài</h3>
            <span className="text-sm font-medium text-gray-600">
              {gradedStudents}/{totalStudents} ({totalStudents > 0 ? Math.round((gradedStudents / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalStudents > 0 ? (gradedStudents / totalStudents) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách sinh viên
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh viên</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm thi</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length > 0 ? students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {student.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {student.isGraded === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã chấm
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Chưa chấm
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {student.isGraded === 1 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800">
                          <Award className="w-4 h-4 mr-1" />
                          {student.score}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {student.isGraded === 0 ? (
                        <button
                          onClick={() => handleGradeStudent(student.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chấm bài
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                          <UserCheck className="w-4 h-4 mr-1" />
                          Hoàn thành
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">Không có sinh viên nào</p>
                        <p className="text-gray-400 text-sm">Danh sách sinh viên trống</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {ungradedStudents > 0 && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>Còn {ungradedStudents} sinh viên chưa chấm</span>
              </div>
            )}
            <button
              onClick={handleConfirm}
              disabled={totalStudents === 0}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Hoàn thành chấm bài</span>
            </button>
          </div>
        </div>

        {/* Warning for incomplete grading */}
        {ungradedStudents > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-orange-800 font-medium">Lưu ý:</p>
                <p className="text-orange-700 text-sm">
                  Vẫn còn {ungradedStudents} sinh viên chưa được chấm bài. 
                  Bạn có thể hoàn thành việc chấm bài sau hoặc tiếp tục chấm các bài còn lại.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}