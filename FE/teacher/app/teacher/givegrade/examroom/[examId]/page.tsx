'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// DTO cho dữ liệu từ API
type StudentGradingDTO = {
  practiceExamHistoryId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  isGraded: number;
  score: number | null;
};

type ExamSlotRoomGradingInfoDTO = {
  examSlotRoomId: number;
  examName: string;
  duration: number;
  startDay: string;
  slotName: string;
  subjectName: string;
  students: StudentGradingDTO[];
};

interface PageProps {
  params: { examId: string };
}

export default function ExamGradingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const examId = Number(params.examId);
  const searchParams = useSearchParams();
  const action = searchParams.get('action'); 

  const [examInfo, setExamInfo] = useState<ExamSlotRoomGradingInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy thông tin bài thi và danh sách sinh viên
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://localhost:7074/api/GradeSchedule/examslotroom/${examId}/grading-info`);
        if (!res.ok) {
          setExamInfo(null);
        } else {
          const data: ExamSlotRoomGradingInfoDTO = await res.json();
          setExamInfo(data);
        }
      } catch (error) {
        setExamInfo(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [examId]);

  // Chuyển sang trang chấm bài cho sinh viên
  const handleGradeStudent = (studentId: string) => {
    if (action === 'edit') {
      router.push(`/teacher/givegrade/examroom/${examId}/gradeexampaper?studentId=${studentId}&action=edit`);
    } else {
      router.push(`/teacher/givegrade/examroom/${examId}/gradeexampaper?studentId=${studentId}`);
    }
  };

  // Xác nhận chấm xong phòng thi
  const handleConfirm = async () => {
    try {
      const res = await fetch(
        `https://localhost:7074/api/GradeSchedule/examslotroom/${examId}/mark-graded`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        alert(msg || 'Không thể cập nhật trạng thái chấm bài!');
      } else {
        alert('Đã chuyển trạng thái chấm bài thành công cho ca/phòng thi!');
        router.push('/teacher/givegrade');
      }
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái chấm bài!');
    }
  };

  // Quay lại
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
        {loading ? (
          <div className="mb-6 text-blue-500">Đang tải dữ liệu...</div>
        ) : examInfo ? (
          <div className="mb-6 border rounded p-4 bg-gray-50">
            <div className="mb-2"><span className="font-semibold">Tên bài thi:</span> {examInfo.examName}</div>
            <div className="mb-2"><span className="font-semibold">Ngày thi:</span> {new Date(examInfo.startDay).toLocaleString('vi-VN')}</div>
            <div className="mb-2"><span className="font-semibold">Ca thi:</span> {examInfo.slotName}</div>
            <div className="mb-2"><span className="font-semibold">Môn thi:</span> {examInfo.subjectName}</div>
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
              {examInfo?.students?.map((student, idx) => (
                <tr key={student.studentId} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                  <td className="py-2 px-2 border-b">{student.fullName}</td>
                  <td className="py-2 px-2 border-b text-center">{student.studentCode}</td>
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
                        onClick={() => handleGradeStudent(student.studentId)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition font-semibold"
                        type="button"
                      >
                        Chấm bài
                      </button>
                    ) : (
                      action === 'edit' ? (
                        <button
                          onClick={() => handleGradeStudent(student.studentId)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition font-semibold"
                          type="button"
                        >
                          Sửa điểm
                        </button>
                      ) : (
                        <span className="text-gray-400">Đã chấm</span>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {(!examInfo?.students || examInfo.students.length === 0) && (
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
          {action !== 'edit' && (
            <button
              onClick={handleConfirm}
              className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
              type="button"
            >
              Xác nhận chấm xong phòng thi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}