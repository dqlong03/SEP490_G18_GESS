'use client';

import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Download, 
  Upload, 
  Brain, 
  Save, 
  X, 
  Edit3, 
  Trash2, 
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Award,
  Target,
  Hash,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

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

  // Thêm thủ công: chỉ 2 đáp án ban đầu
  const [manualQ, setManualQ] = useState<Question>({
    id: Date.now(),
    content: '',
    answers: [
      { text: '', isTrue: false },
      { text: '', isTrue: false }
    ],
    difficulty: 1,
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const manualFormRef = useRef<HTMLDivElement>(null);

  // Tạo bằng AI
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiSubject, setAISubject] = useState('');
  const [aiLink, setAILink] = useState('');
  const [aiNum, setAINum] = useState(2);
  const [aiLevel, setAILevel] = useState('dễ');
  const [aiLoading, setAILoading] = useState(false);

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
    if (!manualQ.content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    const validAnswers = manualQ.answers.filter(a => a.text.trim());
    if (validAnswers.length < 2) {
      alert('Phải có ít nhất 2 đáp án!');
      return;
    }
    const hasCorrectAnswer = validAnswers.some(a => a.isTrue);
    if (!hasCorrectAnswer) {
      alert('Phải có ít nhất 1 đáp án đúng!');
      return;
    }
    setQuestions([
      ...questions,
      { ...manualQ, id: Date.now() }
    ]);
    setManualQ({
      id: Date.now(),
      content: '',
      answers: [
        { text: '', isTrue: false },
        { text: '', isTrue: false }
      ],
      difficulty: 1,
    });
    setShowManualForm(false);
  };

  // Thêm đáp án cho thủ công
  const handleAddAnswerManual = () => {
    if (manualQ.answers.length < 6) {
      setManualQ({
        ...manualQ,
        answers: [...manualQ.answers, { text: '', isTrue: false }]
      });
    }
  };

  // Xóa đáp án thủ công
  const handleDeleteAnswerManual = (idx: number) => {
    if (manualQ.answers.length > 2) {
      setManualQ({
        ...manualQ,
        answers: manualQ.answers.filter((_, i) => i !== idx)
      });
    }
  };

  // Tạo câu hỏi bằng AI
  const handleGenerateAI = async () => {
    if (!aiSubject || !aiLink || !aiNum || !aiLevel) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setAILoading(true);
    try {
      const res = await fetch('https://localhost:7074/api/GenerateQuestions/GenerateMultipleQuestion', {
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
      const newQuestions: Question[] = data.map((q: any, idx: number) => {
        let answers: Answer[] = Array.isArray(q.answers)
          ? q.answers.map((a: any) => ({
              text: a.text || '',
              isTrue: !!a.isTrue
            }))
          : [];
        while (answers.length < 2) {
          answers.push({ text: '', isTrue: false });
        }
        answers = answers.slice(0, 6);
        return {
          id: Date.now() + idx,
          content: q.content || '',
          answers,
          difficulty: 1
        };
      });
      setQuestions(prev => [...prev, ...newQuestions]);
      setShowAIGen(false);
      setAISubject('');
      setAILink('');
      setAINum(2);
      setAILevel('dễ');
      alert(`Đã tạo thành công ${newQuestions.length} câu hỏi bằng AI!`);
    } catch (err: any) {
      alert('Lỗi tạo câu hỏi bằng AI: ' + err.message);
    }
    setAILoading(false);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
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

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        alert(`Câu hỏi ${i + 1} chưa có nội dung!`);
        return;
      }
      const validAnswers = q.answers.filter(a => a.text.trim());
      if (validAnswers.length < 2) {
        alert(`Câu hỏi ${i + 1} phải có ít nhất 2 đáp án!`);
        return;
      }
      const hasCorrectAnswer = validAnswers.some(a => a.isTrue);
      if (!hasCorrectAnswer) {
        alert(`Câu hỏi ${i + 1} phải có ít nhất 1 đáp án đúng!`);
        return;
      }
    }

    try {
      for (const q of questions) {
        const answers = q.answers
          .filter(a => a.text.trim())
          .map(a => ({
            content: a.text,
            isCorrect: a.isTrue
          }));
        const teacherId = getUserIdFromToken();
        const body = {
          content: q.content,
          urlImg: null,
          isActive: true,
          createdBy: teacherId,
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
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu câu hỏi!');
    }
  };

  const getLevelColor = (level: number) => {
    const levelObj = levels.find(l => l.value === level);
    switch (levelObj?.label) {
      case 'Dễ': return 'bg-green-100 text-green-800';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
      case 'Khó': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo câu hỏi trắc nghiệm</h1>
                <p className="text-gray-600">Tạo và quản lý câu hỏi trắc nghiệm cho ngân hàng câu hỏi</p>
              </div>
            </div>
            
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        {questions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                  <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Câu dễ</p>
                  <p className="text-2xl font-bold text-green-600">
                    {questions.filter(q => q.difficulty === 1).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Câu khó</p>
                  <p className="text-2xl font-bold text-red-600">
                    {questions.filter(q => q.difficulty === 3).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Thêm câu hỏi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              onClick={() => setShowManualForm(true)}
            >
              <Edit3 className="w-5 h-5" />
              <span>Thêm thủ công</span>
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              onClick={() => setShowAIGen(true)}
            >
              <Brain className="w-5 h-5" />
              <span>Tạo bằng AI</span>
            </button>
            
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Tải file mẫu</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
            Import từ file Excel
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                <Upload className="w-4 h-4 mr-2" />
                Chọn file Excel
              </span>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <p className="text-gray-500 text-sm mt-2">Chỉ hỗ trợ file .xlsx</p>
            
            {fileName && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">✓ Đã tải lên: {fileName}</p>
              </div>
            )}
            
            {importError && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-red-700 font-medium">✗ {importError}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Generation Form */}
        {showAIGen && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Tạo câu hỏi bằng AI
              </h3>
              <button
                onClick={() => setShowAIGen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên môn học</label>
                <input
                  type="text"
                  value={aiSubject}
                  onChange={e => setAISubject(e.target.value)}
                  placeholder="Nhập tên môn học"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link tài liệu</label>
                <input
                  type="url"
                  value={aiLink}
                  onChange={e => setAILink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số câu hỏi</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={aiNum}
                  onChange={e => setAINum(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                <select
                  value={aiLevel}
                  onChange={e => setAILevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="dễ">Dễ</option>
                  <option value="trung bình">Trung bình</option>
                  <option value="khó">Khó</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={() => setShowAIGen(false)}
                disabled={aiLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-purple-400"
                onClick={handleGenerateAI}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo câu hỏi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Manual Question Form */}
        {showManualForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
                Thêm câu hỏi thủ công
              </h3>
              <button
                onClick={() => setShowManualForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                <Select
                  options={levels}
                  value={levels.find(d => d.value === manualQ.difficulty)}
                  onChange={opt => setManualQ({ ...manualQ, difficulty: opt?.value || 1 })}
                  placeholder="Chọn độ khó"
                  className="w-48"
                  isSearchable={false}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '44px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi</label>
                <textarea
                  value={manualQ.content}
                  onChange={e => setManualQ({ ...manualQ, content: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Đáp án</label>
                  {manualQ.answers.length < 6 && (
                    <button
                      type="button"
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
                      onClick={handleAddAnswerManual}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm đáp án</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {manualQ.answers.map((ans, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + idx)}
                      </span>
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ans.isTrue}
                          onChange={e => {
                            const newAns = manualQ.answers.map((a, i) =>
                              i === idx ? { ...a, isTrue: e.target.checked } : a
                            );
                            setManualQ({ ...manualQ, answers: newAns });
                          }}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Đúng</span>
                      </label>
                      {manualQ.answers.length > 2 && idx >= 2 && (
                        <button
                          type="button"
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                          onClick={() => handleDeleteAnswerManual(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                onClick={() => setShowManualForm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                onClick={handleAddManual}
              >
                <Save className="w-4 h-4" />
                <span>Lưu câu hỏi</span>
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách câu hỏi ({questions.length})
            </h3>
            
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(q.difficulty)}`}>
                        {levels.find(d => d.value === q.difficulty)?.label || 'Không xác định'}
                      </span>
                    </div>
                    <button
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      onClick={() => handleDeleteQuestion(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <textarea
                      value={q.content}
                      onChange={e => handleEditQuestion(idx, 'content', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-medium"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.answers.map((ans, aIdx) =>
                      ans.text !== '' || ans.isTrue ? (
                        <div key={aIdx} className={`flex items-center space-x-3 p-3 rounded-lg border ${ans.isTrue ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-medium border">
                            {String.fromCharCode(65 + aIdx)}
                          </span>
                          <input
                            type="text"
                            value={ans.text}
                            onChange={e => handleEditAnswer(idx, aIdx, 'text', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ans.isTrue}
                              onChange={e => handleEditAnswer(idx, aIdx, 'isTrue', e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            {ans.isTrue && <CheckCircle className="w-4 h-4 text-green-600" />}
                          </label>
                          <button
                            type="button"
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                            onClick={() => handleDeleteAnswer(idx, aIdx)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        {questions.length > 0 && (
          <div className="flex justify-center">
            <button
              className="flex items-center space-x-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
              onClick={handleSaveQuestions}
            >
              <Save className="w-5 h-5" />
              <span>Lưu tất cả câu hỏi ({questions.length})</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có câu hỏi nào</h3>
            <p className="text-gray-600 mb-6">Bắt đầu tạo câu hỏi bằng cách thêm thủ công, sử dụng AI, hoặc import từ file Excel</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowManualForm(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
                <span>Thêm thủ công</span>
              </button>
              <button
                onClick={() => setShowAIGen(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Brain className="w-4 h-4" />
                <span>Tạo bằng AI</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}