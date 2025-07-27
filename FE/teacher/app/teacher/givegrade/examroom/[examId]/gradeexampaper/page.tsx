'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Fake data
const fakeQuestions = [
  {
    id: 1,
    content: 'Trình bày định lý Pythagoras?',
    criteria: 'Nêu đúng phát biểu định lý, có ví dụ minh họa.',
    suggestion: {
      score: 2,
      why: 'Câu trả lời đầy đủ định nghĩa và ví dụ minh họa rõ ràng.',
      explain: 'Định lý Pythagoras là: Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông. Ví dụ: ...',
    },
    studentAnswer: 'Định lý Pythagoras là ...',
  },
  {
    id: 2,
    content: 'Giải phương trình x^2 - 4 = 0',
    criteria: 'Giải đúng, trình bày rõ ràng các bước.',
    suggestion: {
      score: 1,
      why: 'Giải đúng và trình bày đủ các bước.',
      explain: 'x^2 - 4 = 0 ⇔ x^2 = 4 ⇔ x = ±2.',
    },
    studentAnswer: 'x = 2 hoặc x = -2',
  },
];

const fakeStudent = {
  name: 'Nguyễn Văn A',
};

export default function GradeStudentPage() {
  const router = useRouter();
  const params = useParams();
  const [scores, setScores] = useState<{ [qid: number]: number | '' }>({});
  const [showCriteria, setShowCriteria] = useState<{ [qid: number]: boolean }>({});
  const [showSuggestion, setShowSuggestion] = useState<{ [qid: number]: boolean }>({});
  const [note, setNote] = useState('');

  const handleApplySuggestion = (qid: number, score: number) => {
    setScores(prev => ({ ...prev, [qid]: score }));
    setShowSuggestion(prev => ({ ...prev, [qid]: false }));
  };

  const handleConfirm = () => {
    alert('Đã chấm xong bài!');
    router.back();
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4 max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
          type="button"
        >
          ← Quay lại danh sách sinh viên
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chấm bài cho sinh viên</h2>
        <div className="mb-4">
          <span className="font-semibold">Tên sinh viên:</span> {fakeStudent.name}
        </div>
        {fakeQuestions.map(q => (
          <div key={q.id} className="mb-6 border rounded p-4 bg-gray-50">
            <div className="mb-2 font-semibold">Câu hỏi {q.id}: {q.content}</div>
            <button
              className="text-blue-600 underline text-sm mb-2"
              type="button"
              onClick={() => setShowCriteria(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
            >
              {showCriteria[q.id] ? 'Ẩn tiêu chí chấm' : 'Xem tiêu chí chấm'}
            </button>
            {showCriteria[q.id] && (
              <div className="mb-2 text-gray-700 text-sm bg-blue-50 rounded p-2">{q.criteria}</div>
            )}
            <div className="mb-2">
              <span className="font-semibold">Câu trả lời của sinh viên:</span>
              <div className="bg-white border rounded p-2 mt-1">{q.studentAnswer}</div>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="font-semibold">Điểm:</label>
              <input
                type="number"
                min={0}
                max={q.suggestion.score}
                value={scores[q.id] ?? ''}
                onChange={e => setScores(prev => ({ ...prev, [q.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="border rounded px-2 py-1 w-20"
              />
              <button
                className="text-blue-600 underline text-sm"
                type="button"
                onClick={() => setShowSuggestion(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
              >
                {showSuggestion[q.id] ? 'Ẩn gợi ý chấm' : 'Gợi ý chấm'}
              </button>
            </div>
            {showSuggestion[q.id] && (
              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded mb-2">
                <div className="font-semibold mb-1">Gợi ý điểm: {q.suggestion.score}</div>
                <div className="mb-1"><span className="font-semibold">Tại sao:</span> {q.suggestion.why}</div>
                <div className="mb-2"><span className="font-semibold">Giải thích:</span> {q.suggestion.explain}</div>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition font-semibold"
                  type="button"
                  onClick={() => handleApplySuggestion(q.id, q.suggestion.score)}
                >
                  Áp dụng điểm này
                </button>
              </div>
            )}
          </div>
        ))}
        <div className="mb-6">
          <label className="font-semibold block mb-1">Ghi chú cho bài thi (nếu có):</label>
          <textarea
            className="border rounded w-full p-2"
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Nhập ghi chú..."
          />
        </div>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
          type="button"
        >
          Xác nhận chấm xong bài
        </button>
      </div>
    </div>
  );
}