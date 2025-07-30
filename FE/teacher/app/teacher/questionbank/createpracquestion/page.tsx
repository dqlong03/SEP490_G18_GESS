'use client';

import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import { useRouter } from 'next/navigation';

const difficulties = [
  { value: 1, label: 'Dễ' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Khó' },
];

type EssayQuestion = {
  id: number;
  content: string;
  criteria: string;
  difficulty: number;
};

export default function CreateEssayQuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = Number(searchParams.get('chapterId'));
  const categoryExamId = Number(searchParams.get('categoryExamId'));

  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // AI form state
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiSubject, setAISubject] = useState('');
  const [aiLink, setAILink] = useState('');
  const [aiNum, setAINum] = useState(2);
  const [aiLevel, setAILevel] = useState('dễ');
  const [aiLoading, setAILoading] = useState(false);

  // Lấy học kỳ hiện tại
  useEffect(() => {
    fetch('https://localhost:7074/api/MultipleQuestion/GetCurrentSemester')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSemesterId(data[0].semesterId);
        else if (data.semesterId) setSemesterId(data.semesterId);
      })
      .catch(() => setSemesterId(null));
  }, []);

  const [manualQ, setManualQ] = useState<EssayQuestion>({
    id: Date.now(),
    content: '',
    criteria: '',
    difficulty: 1,
  });

  const [showManualForm, setShowManualForm] = useState(false);
  const manualFormRef = useRef<HTMLDivElement>(null);

  // Download template
  const handleDownloadTemplate = () => {
    const header = ['Nội dung', 'Tiêu chí chấm', 'Độ khó'];
    const rows = [
      ['Trình bày khái niệm lập trình hướng đối tượng.', 'Nêu được các đặc điểm chính của OOP, ví dụ minh họa.', 1],
      ['Phân tích ưu điểm của ngôn ngữ C++ so với C.', 'So sánh về tính hướng đối tượng, quản lý bộ nhớ, cú pháp.', 2],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EssayQuestions');
    XLSX.writeFile(wb, 'mau_cau_hoi_tu_luan.xlsx');
  };

  // Import file
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (json.length < 2) {
        setImportError('File phải có ít nhất 1 dòng dữ liệu.');
        setFileName('');
        return;
      }
      const header = json[0];
      const requiredHeader = ['Nội dung', 'Tiêu chí chấm', 'Độ khó'];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);
      if (!isHeaderValid) {
        setImportError('File mẫu không đúng định dạng!');
        setFileName('');
        return;
      }
      const dataArr: EssayQuestion[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 3) continue;
        dataArr.push({
          id: Date.now() + i,
          content: row[0],
          criteria: row[1],
          difficulty: Number(row[2]) || 1,
        });
      }
      setQuestions([...questions, ...dataArr]);
      setFileName(file.name);
      setImportError('');
    };
    reader.readAsArrayBuffer(file);
  };

  // Thêm thủ công
  const handleAddManual = () => {
    setQuestions([
      ...questions,
      { ...manualQ, id: Date.now() }
    ]);
    setManualQ({
      id: Date.now(),
      content: '',
      criteria: '',
      difficulty: 1,
    });
    setShowManualForm(false);
  };

  const handleShowManualForm = () => {
    setShowManualForm(true);
    setTimeout(() => {
      manualFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Sửa câu hỏi
  const handleEditQuestion = (idx: number, key: keyof EssayQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [key]: value } : q))
    );
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Tạo câu hỏi bằng AI
  const handleGenerateAI = async () => {
    if (!aiSubject || !aiLink || !aiNum || !aiLevel) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setAILoading(true);
    try {
      const res = await fetch('https://localhost:7074/api/GenerateQuestions/GenerateEssayQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: aiSubject,
          materialLink: aiLink,
          levels: [{ difficulty: aiLevel, numberOfQuestions: aiNum }]
        })
      });
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Kết quả trả về không hợp lệ!');
      // Chuyển đổi dữ liệu AI về dạng EssayQuestion
      const newQuestions: EssayQuestion[] = data.map((q: any, idx: number) => ({
        id: Date.now() + idx,
        content: q.content,
        criteria: q.bandScoreGuide,
        difficulty: 1 // hoặc map theo aiLevel nếu muốn
      }));
      setQuestions(prev => [...prev, ...newQuestions]);
      setShowAIGen(false);
      setAISubject('');
      setAILink('');
      setAINum(2);
      setAILevel('dễ');
    } catch (err: any) {
      alert('Lỗi tạo câu hỏi bằng AI: ' + err.message);
    }
    setAILoading(false);
  };

  // Lưu câu hỏi lên server
  const handleSaveQuestions = async () => {
    if (!semesterId) {
      alert('Không tìm thấy học kỳ hiện tại!');
      return;
    }
    if (!chapterId || !categoryExamId) {
      alert('Thiếu chapterId hoặc categoryExamId trên URL!');
      return;
    }
    if (questions.length === 0) {
      alert('Không có câu hỏi để lưu!');
      return;
    }
    const teacherId = getUserIdFromToken();
    const body = questions.map(q => ({
      content: q.content,
      urlImg: "Default.png",
      isActive: true,
      createdBy: teacherId,
      isPublic: true,
      categoryExamId: categoryExamId,
      levelQuestionId: q.difficulty,
      semesterId: semesterId,
      answerContent: q.criteria
    }));
    const res = await fetch(`https://localhost:7074/api/PracticeQuestion/CreateMultiple/${chapterId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      alert('Lưu thành công!');
      setQuestions([]);
      router.push(`/teacher/questionbank?${searchParams.toString()}`);
    } else {
      alert('Lưu thất bại!');
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo câu hỏi tự luận</h2>
        {/* Nút thêm câu hỏi thủ công và AI */}
        <div className="mb-6 flex gap-4">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
            onClick={handleShowManualForm}
          >
            Thêm câu hỏi thủ công
          </button>
          <button
            type="button"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition font-semibold"
            onClick={() => setShowAIGen(true)}
          >
            Tạo câu hỏi bằng AI
          </button>
        </div>
        {/* Form tạo câu hỏi bằng AI */}
        {showAIGen && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Tạo câu hỏi tự luận bằng AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <input
                type="text"
                value={aiSubject}
                onChange={e => setAISubject(e.target.value)}
                placeholder="Tên môn học"
                className="border rounded px-3 py-2 w-full"
              />
              <input
                type="text"
                value={aiLink}
                onChange={e => setAILink(e.target.value)}
                placeholder="Link tài liệu"
                className="border rounded px-3 py-2 w-full"
              />
              <input
                type="number"
                min={1}
                value={aiNum}
                onChange={e => setAINum(Number(e.target.value))}
                placeholder="Số câu hỏi"
                className="border rounded px-3 py-2 w-full"
              />
              <select
                value={aiLevel}
                onChange={e => setAILevel(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="dễ">Dễ</option>
                <option value="trung bình">Trung bình</option>
                <option value="khó">Khó</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
                onClick={handleGenerateAI}
                disabled={aiLoading}
              >
                {aiLoading ? 'Đang tạo...' : 'Tạo'}
              </button>
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
                onClick={() => setShowAIGen(false)}
                disabled={aiLoading}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
        {/* Import file */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Import file câu hỏi</h3>
          <div className="flex gap-4 items-center mb-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
            >
              Tải file mẫu
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold cursor-pointer">
              Tải lên file câu hỏi
              <input
                type="file"
                accept=".xlsx"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <span className="text-gray-600 text-sm ml-2">{fileName}</span>
            )}
          </div>
          {importError && (
            <div className="text-red-600 font-semibold mt-2">{importError}</div>
          )}
        </div>
        {/* Danh sách câu hỏi dạng card */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Danh sách câu hỏi ({questions.length})</h3>
          <div className="grid gap-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border rounded-lg p-4 shadow bg-white relative">
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteQuestion(idx)}
                  title="Xóa câu hỏi"
                >×</button>
                <div className="mb-2 flex gap-4">
                  <div>
                    <span className="font-bold">STT:</span> {idx + 1}
                  </div>
                  <div>
                    <span className="font-bold">Độ khó:</span> {difficulties.find(d => d.value === q.difficulty)?.label}
                  </div>
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    value={q.content}
                    onChange={e => handleEditQuestion(idx, 'content', e.target.value)}
                    className="border rounded px-3 py-2 w-full font-semibold"
                    placeholder="Nội dung câu hỏi"
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    value={q.criteria}
                    onChange={e => handleEditQuestion(idx, 'criteria', e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Tiêu chí chấm"
                  />
                </div>
              </div>
            ))}
            {/* Form thêm thủ công nằm dưới cùng */}
            {showManualForm && (
              <div ref={manualFormRef} className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Thêm câu hỏi thủ công</h3>
                <div className="mb-2">
                  <input
                    type="text"
                    value={manualQ.content}
                    onChange={e => setManualQ({ ...manualQ, content: e.target.value })}
                    placeholder="Nội dung câu hỏi"
                    className="border rounded px-3 py-2 w-full mb-2"
                  />
                  <input
                    type="text"
                    value={manualQ.criteria}
                    onChange={e => setManualQ({ ...manualQ, criteria: e.target.value })}
                    placeholder="Tiêu chí chấm"
                    className="border rounded px-3 py-2 w-full mb-2"
                  />
                  <div className="flex gap-4 mt-2">
                    <Select
                      options={difficulties}
                      value={difficulties.find(d => d.value === manualQ.difficulty)}
                      onChange={opt => setManualQ({ ...manualQ, difficulty: opt?.value || 1 })}
                      placeholder="Độ khó"
                      className="w-44"
                      isSearchable={false}
                    />
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
                      onClick={handleAddManual}
                    >
                      Thêm câu hỏi
                    </button>
                    <button
                      type="button"
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
                      onClick={() => setShowManualForm(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Nút lưu ở cuối trang */}
            <div className="flex justify-end">
              <button
                className="bg-green-600 text-white px-8 py-3 rounded font-semibold hover:bg-green-700 transition"
                onClick={handleSaveQuestions}
              >
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}