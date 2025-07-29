'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@utils/tokenUtils';

type StudentGradingDTO = {
 // practiceExamHistoryId: string;
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

  // Chuyển sang trang chấm bài cho sinh viên
  const handleGradeStudent = (studentId: string) => {
    router.push(
      `/teacher/midterm/givegrade/examofstudent?studentId=${studentId}&examId=${examId}&classId=${classId}&examType=${examType}`
    );
  };
const handleConfirm = async () => {
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

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4 max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
          type="button"
        >
          ← Quay lại trang chấm thi
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chấm điểm giữa kỳ</h2>
        {loading ? (
          <div className="mb-6 text-blue-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto rounded shadow bg-white mb-6">
            <table className="min-w-[800px] w-full text-sm md:text-base border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <th className="py-2 px-2 border-b w-14 text-center">STT</th>
                  <th className="py-2 px-2 border-b w-40 text-left">Tên sinh viên</th>
                  <th className="py-2 px-2 border-b w-32 text-center">Mã sinh viên</th>
                  <th className="py-2 px-2 border-b w-24 text-center">Ảnh</th>
                  <th className="py-2 px-2 border-b w-32 text-center">Trạng thái</th>
                  <th className="py-2 px-2 border-b w-32 text-center">Điểm thi</th>
                  <th className="py-2 px-2 border-b w-32 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-blue-50 transition">
                    <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                    <td className="py-2 px-2 border-b">{student.fullName}</td>
                    <td className="py-2 px-2 border-b text-center">{student.code}</td>
                    <td className="py-2 px-2 border-b text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={'https://randomuser.me/api/portraits/men/1.jpg'}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-full object-cover mx-auto"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <span className={
                        student.isGraded === 1
                          ? 'text-green-600 font-semibold'
                          : 'text-blue-600 font-semibold'
                      }>
                        {student.isGraded === 1 ? 'Đã chấm' : 'Chưa chấm'}
                      </span>
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      {student.isGraded === 1 ? student.score : '-'}
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      {student.isGraded === 0 ? (
                        <button
                          onClick={() => handleGradeStudent(student.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition font-semibold"
                          type="button"
                        >
                          Chấm bài
                        </button>
                      ) : (
                        <span className="text-gray-400">Đã chấm</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!students || students.length === 0) && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      Không có sinh viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
            type="button"
          >
            ← Quay lại trang chấm thi
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
            type="button"
          >
            Xác nhận chấm xong phòng thi
          </button>
        </div>
      </div>
    </div>
  );
}