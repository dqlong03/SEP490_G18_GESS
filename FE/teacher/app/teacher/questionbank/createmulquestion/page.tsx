'use client';

import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import { useRouter } from 'next/navigation';



type Answer = { text: string; isTrue: boolean };
type Question = {
  id: number;
  content: string;
  answers: Answer[];
  difficulty: number;
};

type Option = { value: number; label: string };

const defaultDifficulties: Option[] = [
  { value: 1, label: 'Dễ' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Khó' },
];

export default function CreateMCQQuestionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [levels, setLevels] = useState<Option[]>(defaultDifficulties);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const chapterId = Number(searchParams.get('chapterId'));
  const categoryExamId = Number(searchParams.get('categoryExamId'));

  const router = useRouter();
  

  // Lấy mức độ khó và học kỳ hiện tại
  useEffect(() => {
    fetch('https://localhost:7074/api/MultipleQuestion/GetLevelQuestion')
      .then(res => res.json())
      .then(data => setLevels(data.map((l: any) => ({ value: l.levelQuestionId, label: l.levelQuestionName }))))
      .catch(() => setLevels(defaultDifficulties));
    fetch('https://localhost:7074/api/MultipleQuestion/GetCurrentSemester')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSemesterId(data[0].semesterId);
        else if (data.semesterId) setSemesterId(data.semesterId);
      })
      .catch(() => setSemesterId(null));
  }, []);

  // Thêm thủ công
  const [manualQ, setManualQ] = useState<Question>({
    id: Date.now(),
    content: '',
    answers: Array(6).fill({ text: '', isTrue: false }),
    difficulty: 1,
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const manualFormRef = useRef<HTMLDivElement>(null);

  // Tải file mẫu
  const handleDownloadTemplate = () => {
    const header = [
      'Nội dung',
      'Đáp án A', 'IsTrueA',
      'Đáp án B', 'IsTrueB',
      'Đáp án C', 'IsTrueC',
      'Đáp án D', 'IsTrueD',
      'Đáp án E', 'IsTrueE',
      'Đáp án F', 'IsTrueF',
      'Độ khó'
    ];
    const rows = [
      [
        '2 + 2 = ?', '3', false, '4', true, '5', false, '', false, '', false, '', false, 1
      ],
      [
        'C++ là ngôn ngữ gì?', 'Lập trình hướng đối tượng', true, 'Chỉ dùng cho web', false, '', false, '', false, '', false, '', false, 2
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'mau_cau_hoi.xlsx');
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
      const requiredHeader = [
        'Nội dung',
        'Đáp án A', 'IsTrueA',
        'Đáp án B', 'IsTrueB',
        'Đáp án C', 'IsTrueC',
        'Đáp án D', 'IsTrueD',
        'Đáp án E', 'IsTrueE',
        'Đáp án F', 'IsTrueF',
        'Độ khó'
      ];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);
      if (!isHeaderValid) {
        setImportError('File mẫu không đúng định dạng!');
        setFileName('');
        return;
      }
      const dataArr: Question[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 13) continue;
        const answers: Answer[] = [];
        for (let j = 1; j <= 11; j += 2) {
          answers.push({ text: row[j], isTrue: row[j + 1] === true || row[j + 1] === 'TRUE' || row[j + 1] === true });
        }
        dataArr.push({
          id: Date.now() + i,
          content: row[0],
          answers,
          difficulty: Number(row[12]) || 1,
        });
      }
      setQuestions(prev => [...prev, ...dataArr]);
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
      answers: Array(6).fill({ text: '', isTrue: false }),
      difficulty: 1,
    });
    setShowManualForm(false);
  };

  // Hiện form thêm thủ công
  const handleShowManualForm = () => {
    setShowManualForm(true);
    setTimeout(() => {
      manualFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Sửa câu hỏi
  const handleEditQuestion = (idx: number, key: keyof Question, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [key]: value } : q))
    );
  };

  // Sửa đáp án
  const handleEditAnswer = (qIdx: number, aIdx: number, key: keyof Answer, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === aIdx ? { ...a, [key]: value } : a
              ),
            }
          : q
      )
    );
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Xóa đáp án
  const handleDeleteAnswer = (qIdx: number, aIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              answers: q.answers.map((a, j) =>
                j === aIdx ? { ...a, text: '', isTrue: false } : a
              ),
            }
          : q
      )
    );
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
    for (const q of questions) {
      const answers = q.answers
        .filter(a => a.text)
        .map(a => ({
          content: a.text,
          isCorrect: a.isTrue
        }));
         const teacherId = getUserIdFromToken();
      const body = {
        content: q.content,
        urlImg: null,
        isActive: true,
        createdBy:teacherId, 
        isPublic: true,
        chapterId: chapterId,
        categoryExamId: categoryExamId,
        levelQuestionId: q.difficulty,
        semesterId: semesterId,
        answers: answers
      };
      await fetch('https://localhost:7074/api/MultipleQuestion/CreateMultipleQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    alert('Lưu thành công!');
    setQuestions([]);
    router.push(`/teacher/questionbank?${searchParams.toString()}`);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo câu hỏi trắc nghiệm</h2>
        {/* Nút thêm câu hỏi thủ công */}
        <div className="mb-6">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
            onClick={handleShowManualForm}
          >
            Thêm câu hỏi thủ công
          </button>
        </div>
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
                    <span className="font-bold">Độ khó:</span> {levels.find(d => d.value === q.difficulty)?.label || q.difficulty}
                  </div>
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    value={q.content}
                    onChange={e => handleEditQuestion(idx, 'content', e.target.value)}
                    className="border rounded px-3 py-2 w-full font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.answers.map((ans, aIdx) =>
                    ans.text !== '' || ans.isTrue ? (
                      <div key={aIdx} className="flex items-center gap-2">
                        <span className="w-6">{String.fromCharCode(65 + aIdx)}.</span>
                        <input
                          type="text"
                          value={ans.text}
                          onChange={e => handleEditAnswer(idx, aIdx, 'text', e.target.value)}
                          className="border rounded px-2 py-1 flex-1"
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={ans.isTrue}
                            onChange={e => handleEditAnswer(idx, aIdx, 'isTrue', e.target.checked)}
                          />
                          Đúng
                        </label>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteAnswer(idx, aIdx)}
                          title="Xóa đáp án"
                        >×</button>
                      </div>
                    ) : null
                  )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {manualQ.answers.map((ans, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6">{String.fromCharCode(65 + idx)}.</span>
                        <input
                          type="text"
                          value={ans.text}
                          onChange={e => {
                            const newAns = manualQ.answers.map((a, i) =>
                              i === idx ? { ...a, text: e.target.value } : a
                            );
                            setManualQ({ ...manualQ, answers: newAns });
                          }}
                          placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                          className="border rounded px-2 py-1 flex-1"
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={ans.isTrue}
                            onChange={e => {
                              const newAns = manualQ.answers.map((a, i) =>
                                i === idx ? { ...a, isTrue: e.target.checked } : a
                              );
                              setManualQ({ ...manualQ, answers: newAns });
                            }}
                          />
                          Đúng
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <Select
                      options={levels}
                      value={levels.find(d => d.value === manualQ.difficulty)}
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
