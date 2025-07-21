'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Fake data for exams (should match the main page)
const fakeExams = [
  {
    id: 1,
    name: 'Bài thi cuối kỳ Toán lớp 10',
    subject: 'Toán',
    session: 1,
    examDate: '2024-06-18T08:00:00',
  },
  {
    id: 2,
    name: 'Bài thi cuối kỳ Vật lý lớp 11',
    subject: 'Vật lý',
    session: 2,
    examDate: '2024-06-12T09:00:00',
  },
  {
    id: 3,
    name: 'Bài thi cuối kỳ Hóa học lớp 12',
    subject: 'Hóa học',
    session: 2,
    examDate: '2024-06-22T10:00:00',
  },
  {
    id: 4,
    name: 'Bài thi cuối kỳ Toán lớp 11',
    subject: 'Toán',
    session: 2,
    examDate: '2024-06-28T08:00:00',
  },
  {
    id: 5,
    name: 'Bài thi cuối kỳ Vật lý lớp 12',
    subject: 'Vật lý',
    session: 1,
    examDate: '2024-06-20T09:00:00',
  },
  {
    id: 6,
    name: 'Bài thi cuối kỳ Hóa học lớp 10',
    subject: 'Hóa học',
    session: 1,
    examDate: '2024-06-25T10:00:00',
  },
];

// Fake students in the exam session
type Student = {
  id: number;
  name: string;
  code: string;
  avatar: string;
  status: 'Đã chấm' | 'Chưa chấm';
  score: number | null;
};

const fakeStudents: Student[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    code: 'SV001',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'Chưa chấm',
    score: null,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    code: 'SV002',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    status: 'Đã chấm',
    score: 8.5,
  },
  {
    id: 3,
    name: 'Lê Văn C',
    code: 'SV003',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    status: 'Chưa chấm',
    score: null,
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    code: 'SV004',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    status: 'Đã chấm',
    score: 7.0,
  },
];

interface PageProps {
  params: { examId: string };
}

export default function ExamGradingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const examId = Number(params.examId);

  // Find exam info
  const exam = fakeExams.find(e => e.id === examId);

  // Local state for students
  const [students, setStudents] = useState<Student[]>(fakeStudents);

  // Handle grading a student: chuyển sang trang chấm bài cho sinh viên
  const handleGradeStudent = (studentId: number) => {
    router.push(`/teacher/givegrade/examroom/${examId}/gradeexampaper?studentId=${studentId}`);
  };

  // Handle confirm grading
  const handleConfirm = () => {
    alert('Đã xác nhận chấm xong phòng thi!');
    router.push('/teacher/givegrade');
  };

  // Handle back
  const handleBack = () => {
    router.push('/teacher/givegrade');
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chấm bài thi</h2>
        {exam ? (
          <div className="mb-6 border rounded p-4 bg-gray-50">
            <div className="mb-2"><span className="font-semibold">Tên bài thi:</span> {exam.name}</div>
            <div className="mb-2"><span className="font-semibold">Ngày thi:</span> {new Date(exam.examDate).toLocaleString('vi-VN')}</div>
            <div className="mb-2"><span className="font-semibold">Ca thi:</span> {exam.session}</div>
            <div className="mb-2"><span className="font-semibold">Môn thi:</span> {exam.subject}</div>
          </div>
        ) : (
          <div className="mb-6 text-red-500">Không tìm thấy thông tin bài thi.</div>
        )}

        {/* Table */}
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
                  <td className="py-2 px-2 border-b">{student.name}</td>
                  <td className="py-2 px-2 border-b text-center">{student.code}</td>
                  <td className="py-2 px-2 border-b text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover mx-auto"
                    />
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    <span className={
                      student.status === 'Đã chấm'
                        ? 'text-green-600 font-semibold'
                        : 'text-blue-600 font-semibold'
                    }>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {student.status === 'Đã chấm' ? student.score : '-'}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {student.status === 'Chưa chấm' ? (
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
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Không có sinh viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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