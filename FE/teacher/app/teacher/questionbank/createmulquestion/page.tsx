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
  FileSpreadsheet, Copy,
} from 'lucide-react';

type Answer = { text: string; isTrue: boolean };
type Question = {
  id: number;
  content: string;
  answers: Answer[];
  difficulty: number;
  isPublic: boolean;
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
  const chapterName = searchParams.get('chapterName') || '';
  const subjectName = searchParams.get('subjectName') || '';

  const [duplicateIds, setDuplicateIds] = useState<number[]>([]);

  const [duplicateMap, setDuplicateMap] = useState<{ [id: number]: { similarityScore: number, similarQuestions: { questionID: number, content: string }[] } }>({});
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [aiQuestionType, setAIQuestionType] = useState<1 | 2 | 3>(2); // 1: True/False, 2: 1 lựa chọn, 3: nhiều lựa chọn

  const router = useRouter();

  // Thêm thủ công: chỉ 2 đáp án ban đầu
  const [manualQ, setManualQ] = useState<Question>({
    id: Math.floor(10000 + Math.random() * 90000),
    content: '',
    answers: [
      { text: '', isTrue: false },
      { text: '', isTrue: false }
    ],
    difficulty: 1,
    isPublic: true,
  });
  const [showManualForm, setShowManualForm] = useState(false);
  const manualFormRef = useRef<HTMLDivElement>(null);
  const questionsListRef = useRef<HTMLDivElement>(null);

  // Tạo bằng AI
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiLink, setAILink] = useState("https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0");
  const [aiLevels, setAILevels] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [aiLoading, setAILoading] = useState(false);
  const aiFormRef = useRef<HTMLDivElement>(null);

  // Kiểm tra trùng lặp
  const handleCheckDuplicate = async () => {
    setCheckingDuplicate(true);
    setDuplicateMap({});
    try {
      // Lấy danh sách câu hỏi đã có (theo response mới)
      const existedRes = await fetch(
        `https://localhost:7074/api/PracticeQuestion/all-questions?chapterId=${chapterId}&levelId=&questionType=multiple&pageNumber=1&pageSize=1000`
      );
      const existedData = await existedRes.json();
      const existedQuestions = (existedData?.questions || []).map((q: any) => ({
        questionID: q.questionId,
        content: q.content
      }));

      // Danh sách câu hỏi mới (tạo id ngẫu nhiên nếu cần)
      const newQuestions = questions.map(q => ({
        questionID: q.id,
        content: q.content
      }));

      // Gộp lại để so sánh
      const allQuestions = [...newQuestions, ...existedQuestions];

      // Gọi API kiểm tra trùng
      const res = await fetch('https://localhost:7074/api/AIGradePracExam/FindSimilar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: allQuestions,
          similarityThreshold: 0.7
        })
      });
      const result = await res.json();

      // Lưu lại các câu hỏi trùng lặp (chỉ quan tâm đến câu hỏi mới)
      const map: { [id: number]: { similarityScore: number, similarQuestions: { questionID: number, content: string }[] } } = {};
      result.forEach((group: any) => {
        // Nếu trong nhóm có câu hỏi mới (id thuộc questions), thì đánh dấu là trùng
        const newQ = group.questions.find((q: any) => newQuestions.some(nq => nq.questionID === q.questionID));
        if (newQ) {
          map[newQ.questionID] = {
            similarityScore: group.similarityScore,
            similarQuestions: group.questions.filter((q: any) => !newQuestions.some(nq => nq.questionID === q.questionID))
          };
        }
      });
      setDuplicateMap(map);
    } catch (err) {
      alert('Lỗi kiểm tra trùng lặp!');
    }
    setCheckingDuplicate(false);
  };

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
          isPublic: true,
        });
      }
      setQuestions(prev => [...prev, ...dataArr]);
      setFileName(file.name);
      setImportError('');
    };
    reader.readAsArrayBuffer(file);
  };

  // Show manual form with scroll
  const handleShowManualForm = () => {
    setShowManualForm(true);
    setTimeout(() => {
      manualFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Show AI form with scroll
  const handleShowAIForm = () => {
    setShowAIGen(true);
    setTimeout(() => {
      aiFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
      { ...manualQ, id: Math.floor(10000 + Math.random() * 90000) }
    ]);
    setManualQ({
      id: Math.floor(10000 + Math.random() * 90000),
      content: '',
      answers: [
        { text: '', isTrue: false },
        { text: '', isTrue: false }
      ],
      difficulty: 1,
      isPublic: true,
    });
    setShowManualForm(false);
    
    // Auto scroll to questions list after adding
    setTimeout(() => {
      questionsListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
    if (!aiLink) {
      alert('Vui lòng nhập link tài liệu!');
      return;
    }
    
    const totalQuestions = aiLevels.easy + aiLevels.medium + aiLevels.hard;
    if (totalQuestions === 0) {
      alert('Vui lòng nhập số câu hỏi cho ít nhất một mức độ!');
      return;
    }
    
    setAILoading(true);
    try {
      const levels = [];
      if (aiLevels.easy > 0) {
        levels.push({ difficulty: 'dễ', numberOfQuestions: aiLevels.easy, type: aiQuestionType });
      }
      if (aiLevels.medium > 0) {
        levels.push({ difficulty: 'trung bình', numberOfQuestions: aiLevels.medium , type: aiQuestionType });
      }
      if (aiLevels.hard > 0) {
        levels.push({ difficulty: 'khó', numberOfQuestions: aiLevels.hard, type: aiQuestionType });
      }

      const res = await fetch('https://localhost:7074/api/GenerateQuestions/GenerateMultipleQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subjectName,
          materialLink: aiLink,
          specifications: levels
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
        
        // Xác định difficulty dựa trên thứ tự levels
        let difficulty = 1;
        if (idx < aiLevels.easy) {
          difficulty = 1;
        } else if (idx < aiLevels.easy + aiLevels.medium) {
          difficulty = 2;
        } else {
          difficulty = 3;
        }
        
        return {
          id: Date.now() + idx,
          content: q.content || '',
          answers,
          difficulty: difficulty,
          isPublic: true
        };
      });
      
      setQuestions(prev => [...prev, ...newQuestions]);
      setShowAIGen(false);
      setAILink('');
      setAILevels({ easy: 0, medium: 0, hard: 0 });
      
      // Auto scroll to questions list after AI generation
      setTimeout(() => {
        questionsListRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
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
          isPublic: q.isPublic,
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
                {/* Hiển thị thông tin môn học và chương */}
                {(subjectName || chapterName) && (
                  <div className="flex items-center space-x-2 mt-2">
                    {subjectName && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        <Target className="w-4 h-4" />
                        <span>Môn: {subjectName}</span>
                      </div>
                    )}
                    {chapterName && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        <span>Chương: {chapterName}</span>
                      </div>
                    )}
                  </div>
                )}
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
              onClick={handleShowManualForm}
            >
              <Edit3 className="w-5 h-5" />
              <span>Thêm thủ công</span>
            </button>
            
            <button
              type="button"
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
              onClick={handleShowAIForm}
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
          <div ref={aiFormRef} className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
            
            <div className="space-y-6">
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại câu hỏi</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiQuestionType"
                      value={2}
                      checked={aiQuestionType === 2}
                      onChange={() => setAIQuestionType(2)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Đúng/Sai</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiQuestionType"
                      value={1}
                      checked={aiQuestionType === 1}
                      onChange={() => setAIQuestionType(1)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">1 lựa chọn</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aiQuestionType"
                      value={3}
                      checked={aiQuestionType === 3}
                      onChange={() => setAIQuestionType(3)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Nhiều lựa chọn</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Số câu hỏi theo từng mức độ</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">Dễ</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={aiLevels.easy}
                      onChange={e => setAILevels({ ...aiLevels, easy: Math.max(0, Number(e.target.value)) })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
                    />
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-800">Trung bình</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={aiLevels.medium}
                      onChange={e => setAILevels({ ...aiLevels, medium: Math.max(0, Number(e.target.value)) })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors bg-white"
                    />
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-800">Khó</span>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={aiLevels.hard}
                      onChange={e => setAILevels({ ...aiLevels, hard: Math.max(0, Number(e.target.value)) })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors bg-white"
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600 text-center">
                  Tổng số câu hỏi: <span className="font-medium text-purple-600">
                    {aiLevels.easy + aiLevels.medium + aiLevels.hard}
                  </span>
                </div>
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
                disabled={aiLoading || (aiLevels.easy + aiLevels.medium + aiLevels.hard === 0)}
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
          <div ref={manualFormRef} className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                  <Select
                    options={levels}
                    value={levels.find(d => d.value === manualQ.difficulty)}
                    onChange={opt => setManualQ({ ...manualQ, difficulty: opt?.value || 1 })}
                    placeholder="Chọn độ khó"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quyền truy cập</label>
                  <div className="flex items-center space-x-6 mt-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={manualQ.isPublic === true}
                        onChange={() => setManualQ({ ...manualQ, isPublic: true })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Public</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={manualQ.isPublic === false}
                        onChange={() => setManualQ({ ...manualQ, isPublic: false })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Private</span>
                    </label>
                  </div>
                </div>
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
          <div ref={questionsListRef} className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách câu hỏi ({questions.length})
            </h3>
            
            <div className="mb-4 flex justify-end">
              <button
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                onClick={handleCheckDuplicate}
                disabled={checkingDuplicate}
              >
                <AlertCircle className="w-5 h-5" />
                <span>{checkingDuplicate ? 'Đang kiểm tra...' : 'Kiểm tra trùng'}</span>
              </button>
            </div>

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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${q.isPublic ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {q.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <button
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      onClick={() => handleDeleteQuestion(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cảnh báo trùng lặp */}
                  {duplicateMap[q.id] && (
                    <div className="mb-2 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>
                        Câu hỏi này bị trùng với các câu hỏi trong ngân hàng:
                        {duplicateMap[q.id].similarQuestions.map((sq, i) => (
                          <span key={sq.questionID} className="ml-2 font-semibold">
                            "{sq.content}"{i < duplicateMap[q.id].similarQuestions.length - 1 ? ',' : ''}
                          </span>
                        ))}
                        <button
                          className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => handleDeleteQuestion(idx)}
                        >
                          Xóa câu này
                        </button>
                      </span>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quyền truy cập</label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`isPublic-${idx}`}
                            checked={q.isPublic === true}
                            onChange={() => handleEditQuestion(idx, 'isPublic', true)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Public</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`isPublic-${idx}`}
                            checked={q.isPublic === false}
                            onChange={() => handleEditQuestion(idx, 'isPublic', false)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Private</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
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
                onClick={handleShowManualForm}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
                <span>Thêm thủ công</span>
              </button>
              <button
                onClick={handleShowAIForm}
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