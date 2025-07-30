'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';

type Question = {
  id: number;
  content: string;
  level: string;
};

type Chapter = {
  chapterId: number;
  chapterName: string;
  description: string;
};

type Subject = {
  subjectId: number;
  subjectName: string;
};

type Semester = {
  semesterId: number;
  semesterName: string;
};

const levels = [
  { value: 1, label: 'Dễ' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Khó' },
];

const API_URL = 'https://localhost:7074';

export default function CreateFinalExamPaperPage() {
  const router = useRouter();

  // State
  const [inputName, setInputName] = useState('');
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [searchContent, setSearchContent] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionChecks, setQuestionChecks] = useState<Record<number, boolean>>({});
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [questionScores, setQuestionScores] = useState<Record<number, number>>({});
  const [manualQuestions, setManualQuestions] = useState<any[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);

  // Phân trang popup
  const [questionPage, setQuestionPage] = useState(1);
  const [questionTotalPages, setQuestionTotalPages] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // State cho nhập thủ công
  const [manualContent, setManualContent] = useState('');
  const [manualScore, setManualScore] = useState(1);
  const [manualCriteria, setManualCriteria] = useState('');
  const [manualLevel, setManualLevel] = useState('');
  const [manualChapter, setManualChapter] = useState<number | null>(null);

  // Sửa câu hỏi thủ công
  const [editingManualId, setEditingManualId] = useState<number | null>(null);

  // Subject & Semester
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  // Lấy danh sách môn học, kỳ, chapter
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    fetch(`${API_URL}/api/FinalExamPaper/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => setSubjects(data || []));
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => setSemesters(data || []));
  }, []);

   useEffect(() => {
    if (selectedSubject) {
      fetch(`${API_URL}/api/FinalExam/GetAllChapterBySubjectId?subjectId=${selectedSubject.subjectId}`)
        .then(res => res.json())
        .then(data => setChapters(data || []))
        .catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
    setSelectedChapter(null);
  }, [selectedSubject]);
  // Lấy tất cả câu hỏi khi chọn đủ bộ lọc
  useEffect(() => {
    if (selectedSubject && selectedSemester) {
      fetchQuestions(questionPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedSemester, searchContent, selectedLevel, selectedChapter, questionPage]);

  const fetchQuestions = async (page: number) => {
    setLoadingQuestions(true);
    const params = new URLSearchParams({
      subjectId: String(selectedSubject?.subjectId || ''),
      semesterId: String(selectedSemester?.semesterId || ''),
      page: String(page),
      pageSize: '10',
      ...(searchContent && { content: searchContent }),
      ...(selectedLevel && { levelId: String(selectedLevel.value) }),
      ...(selectedChapter && { chapterId: String(selectedChapter.chapterId) }),
    });
    const res = await fetch(`${API_URL}/api/PracticeQuestion/practice-questions?${params}`);
    const data = await res.json();
    setQuestions(data.data || []);
    setQuestionTotalPages(data.totalPages || 1);
    setQuestionPage(data.page || 1);
    setLoadingQuestions(false);
  };

  // Lưu câu hỏi đã chọn
  const handleSaveQuestions = () => {
    const newSelected = questions.filter(q => questionChecks[q.id]);
    setSelectedQuestions([...selectedQuestions, ...newSelected.filter(q => !selectedQuestions.some(sq => sq.id === q.id))]);
    setQuestionScores(prev => ({
      ...prev,
      ...Object.fromEntries(newSelected.map(q => [q.id, 1])),
    }));
    setShowQuestionPopup(false);
    setQuestionChecks({});
    setSearchContent('');
    setSelectedLevel(null);
    setSelectedChapter(null);
    setQuestionPage(1);
  };

  // Xóa câu hỏi khỏi danh sách đã chọn
  const handleRemoveQuestion = (id: number, isManual = false) => {
    if (isManual) {
      setManualQuestions(manualQuestions.filter(q => q.manualId !== id));
    } else {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== id));
      setQuestionScores(prev => {
        const newScores = { ...prev };
        delete newScores[id];
        return newScores;
      });
    }
  };

  // Tổng số điểm
  const totalScore =
    selectedQuestions.reduce((sum, q) => sum + (questionScores[q.id] || 0), 0) +
    manualQuestions.reduce((sum, q) => sum + (q.score || 0), 0);

  // Gửi tạo đề thi
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !inputName ||
      !selectedSubject ||
      !selectedSemester ||
      (selectedQuestions.length + manualQuestions.length) === 0
    ) {
      alert('Vui lòng nhập tên đề thi, chọn môn học, kỳ và chọn/thêm ít nhất 1 câu hỏi!');
      return;
    }
    const teacherId = getUserIdFromToken();
    const payload = {
      examName: inputName,
      totalQuestion: selectedQuestions.length + manualQuestions.length,
      teacherId,
      semesterId: selectedSemester.semesterId,
      subjectId: selectedSubject.subjectId,
      manualQuestions: manualQuestions.map(q => ({
        content: q.content,
        criteria: q.criteria,
        score: q.score,
        level: q.level,
        chapterId: q.chapterId,
      })),
      selectedQuestions: selectedQuestions.map(q => ({
        practiceQuestionId: q.id,
        score: questionScores[q.id] ?? 1,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/api/FinalExamPaper/CreateFinalExamPaper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        alert('Tạo đề thi thất bại: ' + err);
        return;
      }
      const data = await res.json();
      alert('Tạo đề thi thành công! Mã đề: ' + data.pracExamPaperId);
      router.push(`/teacher/finalexampaper`);
    } catch (error) {
      alert('Có lỗi xảy ra khi gọi API!');
      console.error(error);
    }
  };

  // Thêm hoặc cập nhật câu hỏi thủ công
  const handleAddManualQuestion = () => {
    if (!manualContent.trim() || manualScore <= 0 || !manualLevel || !manualChapter) {
      alert('Vui lòng nhập nội dung, điểm hợp lệ, chọn độ khó và chương!');
      return;
    }
    if (editingManualId) {
      setManualQuestions(manualQuestions.map(q =>
        q.manualId === editingManualId
          ? {
              ...q,
              content: manualContent,
              score: manualScore,
              criteria: manualCriteria,
              level: manualLevel,
              chapterId: manualChapter,
            }
          : q
      ));
      setEditingManualId(null);
    } else {
      setManualQuestions([
        ...manualQuestions,
        {
          manualId: Date.now(),
          content: manualContent,
          score: manualScore,
          criteria: manualCriteria,
          level: manualLevel,
          chapterId: manualChapter,
        },
      ]);
    }
    setManualContent('');
    setManualScore(1);
    setManualCriteria('');
    setManualLevel('');
    setManualChapter(null);
    setShowManualInput(false);
  };

  // Bắt đầu sửa câu hỏi thủ công
  const handleEditManualQuestion = (manualId: number) => {
    const q = manualQuestions.find(q => q.manualId === manualId);
    if (q) {
      setManualContent(q.content);
      setManualScore(q.score);
      setManualCriteria(q.criteria);
      setManualLevel(q.level);
      setManualChapter(q.chapterId);
      setEditingManualId(manualId);
      setShowManualInput(true);
    }
  };

  // Hủy sửa/thêm
  const handleCancelManualInput = () => {
    setManualContent('');
    setManualScore(1);
    setManualCriteria('');
    setManualLevel('');
    setManualChapter(null);
    setEditingManualId(null);
    setShowManualInput(false);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      {(selectedQuestions.length > 0 || manualQuestions.length > 0) && (
        <div
          className="fixed"
          style={{
            top: 100,
            left: 1300,
            zIndex: 50,
            background: '#2563eb',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            minWidth: 0,
            width: 'filter-content',
            height: 'fit-content',
            display: 'inline-block',
            fontSize: 15,
            lineHeight: 1.4,
          }}
        >
          <div className="font-semibold">
            Số câu hỏi: <span className="font-bold">{selectedQuestions.length + manualQuestions.length}</span>
          </div>
          <div className="font-semibold mt-1">
            Tổng điểm: <span className="font-bold">{totalScore}</span>
          </div>
        </div>
      )}
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo đề thi cuối kỳ</h2>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Dropdown chọn môn học */}
          <div className="mb-4 w-64">
            <label className="block font-semibold mb-1">Chọn môn học</label>
            <select
              value={selectedSubject?.subjectId || ''}
              onChange={e => {
                const val = Number(e.target.value);
                setSelectedSubject(val ? subjects.find(s => s.subjectId === val) || null : null);
              }}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="">Chọn môn học</option>
              {subjects.map(s => (
                <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
              ))}
            </select>
          </div>
          {/* Dropdown chọn kỳ */}
          <div className="mb-4 w-64">
            <label className="block font-semibold mb-1">Chọn kỳ</label>
            <select
              value={selectedSemester?.semesterId || ''}
              onChange={e => {
                const val = Number(e.target.value);
                setSelectedSemester(val ? semesters.find(s => s.semesterId === val) || null : null);
              }}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="">Chọn kỳ</option>
              {semesters.map(s => (
                <option key={s.semesterId} value={s.semesterId}>{s.semesterName}</option>
              ))}
            </select>
          </div>
          {/* Nhập tên đề thi */}
          <div>
            <label className="block font-semibold mb-1">Tên đề thi</label>
            <input
              type="text"
              placeholder="Nhập tên đề thi"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          {/* Nút chọn câu hỏi và thêm thủ công */}
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
              onClick={() => setShowQuestionPopup(true)}
              disabled={!selectedSubject || !selectedSemester}
            >
              Chọn câu hỏi
            </button>
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
              onClick={() => {
                setShowManualInput(true);
                setEditingManualId(null);
                setManualContent('');
                setManualScore(1);
                setManualCriteria('');
                setManualLevel('');
                setManualChapter(null);
              }}
            >
              Thêm câu hỏi thủ công
            </button>
          </div>

          {/* Popup chọn câu hỏi */}
          {showQuestionPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative animate-popup">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setShowQuestionPopup(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-700">Chọn câu hỏi</h3>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Tìm theo nội dung"
                    value={searchContent}
                    onChange={e => {
                      setSearchContent(e.target.value);
                      setQuestionPage(1);
                    }}
                    className="border rounded px-3 py-2 w-64"
                  />
                  <div className="w-44">
                    <select
                      value={selectedLevel?.value || ''}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSelectedLevel(val ? levels.find(l => l.value === val) || null : null);
                        setQuestionPage(1);
                      }}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Độ khó</option>
                      {levels.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-44">
                    <select
                      value={selectedChapter?.chapterId || ''}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSelectedChapter(val ? chapters.find(c => c.chapterId === val) || null : null);
                        setQuestionPage(1);
                      }}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Chương</option>
                      {chapters.map(c => (
                        <option key={c.chapterId} value={c.chapterId}>{c.chapterName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto rounded shadow bg-white mb-4">
                  <table className="min-w-[700px] w-full text-sm md:text-base border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-semibold">
                        <th className="py-2 px-2 border-b w-10 text-center">STT</th>
                        <th className="py-2 px-2 border-b w-64 text-left">Nội dung câu hỏi</th>
                        <th className="py-2 px-2 border-b w-20 text-center">Mức độ</th>
                        <th className="py-2 px-2 border-b w-20 text-center">Chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingQuestions ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-500">
                            Đang tải...
                          </td>
                        </tr>
                      ) : questions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-500">
                            Không có câu hỏi nào.
                          </td>
                        </tr>
                      ) : (
                        questions.map((q, idx) => (
                          <tr key={q.id} className="hover:bg-blue-50 transition">
                            <td className="py-2 px-2 border-b text-center">{(questionPage - 1) * 10 + idx + 1}</td>
                            <td className="py-2 px-2 border-b">{q.content}</td>
                            <td className="py-2 px-2 border-b text-center">{q.level}</td>
                            <td className="py-2 px-2 border-b text-center">
                              <input
                                type="checkbox"
                                checked={!!questionChecks[q.id]}
                                onChange={e =>
                                  setQuestionChecks((prev) => ({
                                    ...prev,
                                    [q.id]: e.target.checked,
                                  }))
                                }
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Phân trang */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    disabled={questionPage <= 1}
                    onClick={() => setQuestionPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border mr-2"
                  >
                    Trang trước
                  </button>
                  <span>Trang {questionPage} / {questionTotalPages}</span>
                  <button
                    type="button"
                    disabled={questionPage >= questionTotalPages}
                    onClick={() => setQuestionPage(p => Math.min(questionTotalPages, p + 1))}
                    className="px-3 py-1 rounded border ml-2"
                  >
                    Trang sau
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSaveQuestions}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form thêm/sửa câu hỏi thủ công */}
          {showManualInput && (
            <div className="mt-8 border rounded-lg p-6 bg-gray-50">
              <h4 className="font-semibold mb-4 text-gray-700">
                {editingManualId ? 'Sửa câu hỏi thủ công' : 'Thêm câu hỏi thủ công'}
              </h4>
              <div className="mb-3 flex gap-4 items-center">
                <div>
                  <label className="block mb-1 font-medium">Điểm</label>
                  <input
                    type="number"
                    min={1}
                    className="border rounded px-3 py-2 w-32"
                    value={manualScore}
                    onChange={e => setManualScore(Number(e.target.value))}
                    placeholder="Điểm"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Độ khó</label>
                  <select
                    className="border rounded px-3 py-2 w-40"
                    value={manualLevel}
                    onChange={e => setManualLevel(e.target.value)}
                  >
                    <option value="">Chọn độ khó</option>
                    {levels.map(l => (
                      <option key={l.value} value={l.label}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Chương</label>
                  <select
                    className="border rounded px-3 py-2 w-44"
                    value={manualChapter || ''}
                    onChange={e => setManualChapter(Number(e.target.value) || null)}
                  >
                    <option value="">Chọn chương</option>
                    {chapters.map(c => (
                      <option key={c.chapterId} value={c.chapterId}>{c.chapterName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Nội dung câu hỏi</label>
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                  value={manualContent}
                  onChange={e => setManualContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Tiêu chí chấm</label>
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  rows={2}
                  value={manualCriteria}
                  onChange={e => setManualCriteria(e.target.value)}
                  placeholder="Nhập tiêu chí chấm (nếu có)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
                  onClick={handleAddManualQuestion}
                >
                  {editingManualId ? 'Cập nhật' : 'Thêm vào đề thi'}
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
                  onClick={handleCancelManualInput}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Hiển thị các câu hỏi đã chọn và thủ công */}
          {(selectedQuestions.length > 0 || manualQuestions.length > 0) && (
            <div className="mt-8 space-y-8">
              {selectedQuestions.map((q, idx) => (
                <div key={q.id} className="border-b pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="font-semibold text-base">
                      Câu {idx + 1} ({q.level})
                    </div>
                    <div>
                      <span className="mr-2">Điểm:</span>
                      <input
                        type="number"
                        min={0}
                        value={questionScores[q.id] ?? 1}
                        onChange={e =>
                          setQuestionScores((prev) => ({
                            ...prev,
                            [q.id]: Number(e.target.value),
                          }))
                        }
                        className="border rounded px-2 py-1 w-20 text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="whitespace-pre-line text-gray-800">{q.content}</div>
                </div>
              ))}
              {manualQuestions.map((q, idx) => (
                <div key={q.manualId} className="border-b pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="font-semibold text-base">
                      Câu {selectedQuestions.length + idx + 1} (Thủ công - {q.level})
                    </div>
                    <div>
                      <span className="mr-2">Điểm:</span>
                      <input
                        type="number"
                        min={0}
                        value={q.score}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setManualQuestions(manualQuestions.map(mq =>
                            mq.manualId === q.manualId ? { ...mq, score: val } : mq
                          ));
                        }}
                        className="border rounded px-2 py-1 w-20 text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditManualQuestion(q.manualId)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.manualId, true)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="whitespace-pre-line text-gray-800">{q.content}</div>
                  {q.criteria && (
                    <div className="text-gray-600 mt-2">
                      <span className="font-medium">Tiêu chí chấm:</span> {q.criteria}
                    </div>
                  )}
                  <div className="text-gray-600 mt-2">
                    <span className="font-medium">Chương:</span> {chapters.find(c => c.chapterId === q.chapterId)?.chapterName || ''}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center mt-6">
                <div className="font-semibold text-base">
                  Số câu hỏi đã chọn: <span className="text-blue-700">{selectedQuestions.length + manualQuestions.length}</span>
                  <span className="ml-6">Tổng điểm: <span className="text-blue-700">{totalScore}</span></span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
     <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.2s }
        @keyframes popup {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
       .animate-popup { animation: popup 0.2s }
      `}</style>
    </div>
  );
}