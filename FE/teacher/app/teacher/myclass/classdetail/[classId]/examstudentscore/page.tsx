"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ExamScore = {
  studentId: string;
  fullName: string;
  score: number | null;
  code: string;
};

export default function ExamScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const classId = searchParams.get("classId");
  const examId = searchParams.get("examId");
  const examType = searchParams.get("examType");

  const [scores, setScores] = useState<ExamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId || !examType) return;
    async function fetchScores() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://localhost:7074/api/Class/exam-scores?examId=${examId}&examType=${examType}`
        );
        if (!res.ok) throw new Error("Không thể lấy dữ liệu điểm thi");
        const data: ExamScore[] = await res.json();
        setScores(data);
      } catch {
        setScores([]);
      }
      setLoading(false);
    }
    fetchScores();
  }, [examId, examType]);

  return (
    <div className="w-full max-w-2xl mx-auto px-2 py-8 font-sans text-gray-800 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Xem điểm thi</h2>
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded text-sm"
          onClick={() => router.back()}
        >
          Quay lại
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-blue-200 rounded-lg bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="py-2 px-2 border-b border-blue-200 text-center w-10">STT</th>
                <th className="py-2 px-2 border-b border-blue-200 text-center w-28">Mã sinh viên</th>
                <th className="py-2 px-2 border-b border-blue-200 text-center">Tên sinh viên</th>
                <th className="py-2 px-2 border-b border-blue-200 text-center w-20">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((item, idx) => (
                <tr key={`${item.studentId}-${item.code}`} className="text-gray-800 bg-white">
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{idx + 1}</td>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.code}</td>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">{item.fullName}</td>
                  <td className="py-2 px-2 border-b border-blue-100 text-center align-middle">
                    {item.score !== null ? item.score : "Chưa có"}
                  </td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Không có dữ liệu điểm thi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    )}
    </div>
  );
}