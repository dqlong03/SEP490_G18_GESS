'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  AlertCircle,
  ChevronLeft,
  Award,
  Target,
  Hash,
  Sparkles,
  FileSpreadsheet,
  CheckCircle,
  PenTool
} from 'lucide-react';

const difficulties = [
  { value: 1, label: 'Dễ' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Khó' },
];

type Criterion = {
  criterionName: string;
  weightPercent: number;
  description: string;
};

type EssayQuestion = {
  id: number;
  content: string;
  criteria: Criterion[];
  difficulty: number;
  isPublic: boolean;
};

export default function CreateEssayQuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = Number(searchParams.get('chapterId'));
  const categoryExamId = Number(searchParams.get('categoryExamId'));
  const chapterName = searchParams.get('chapterName') || '';
  const subjectName = searchParams.get('subjectName') || '';

  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // AI form state
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiLink, setAILink] = useState("https://docs.google.com/document/d/1xD31S45CPW3Np_bEfJ_HkvzM7LDynu5WNpecLec5z8I/edit?tab=t.0");
  const [aiNum, setAINum] = useState(2);
  const [aiLevel, setAILevel] = useState('dễ');
  const [aiLoading, setAILoading] = useState(false);

  const [manualQ, setManualQ] = useState<EssayQuestion>({
    id: Date.now(),
    content: '',
    criteria: [
      { criterionName: '', weightPercent: 25, description: '' }
    ],
    difficulty: 1,
    isPublic: true,
  });

  const [showManualForm, setShowManualForm] = useState(false);
  const manualFormRef = useRef<HTMLDivElement>(null);
  const questionsListRef = useRef<HTMLDivElement>(null); // Add ref for questions list
  const aiFormRef = useRef<HTMLDivElement>(null); // Add ref for AI form


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

  // Download template
  const handleDownloadTemplate = () => {
    const header = [
      'Nội dung', 'Độ khó',
      'Tiêu chí 1 - Tên', 'Tiêu chí 1 - Mô tả', 'Tiêu chí 1 - Phần trăm',
      'Tiêu chí 2 - Tên', 'Tiêu chí 2 - Mô tả', 'Tiêu chí 2 - Phần trăm',
      'Tiêu chí 3 - Tên', 'Tiêu chí 3 - Mô tả', 'Tiêu chí 3 - Phần trăm',
      'Tiêu chí 4 - Tên', 'Tiêu chí 4 - Mô tả', 'Tiêu chí 4 - Phần trăm',
      'Tiêu chí 5 - Tên', 'Tiêu chí 5 - Mô tả', 'Tiêu chí 5 - Phần trăm'
    ];
    const rows = [
      [
        'Trình bày khái niệm lập trình hướng đối tượng.', 1,
        'Độ rõ ràng', 'Trình bày rõ ràng và dễ hiểu', 30,
        'Nội dung chuyên môn', 'Đảm bảo mô tả đúng các khái niệm', 30,
        'Tư duy/phân tích', 'Phân tích và kết nối hợp lý', 20,
        'Ví dụ minh họa', 'Cung cấp ví dụ cụ thể', 20,
        '', '', ''
      ],
      [
        'Phân tích ưu điểm của ngôn ngữ C++ so với C.', 2,
        'So sánh chính xác', 'So sánh đúng về tính năng', 40,
        'Ví dụ minh họa', 'Đưa ra ví dụ cụ thể', 30,
        'Cấu trúc bài viết', 'Trình bày có logic', 30,
        '', '', '',
        '', '', ''
      ]
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
      
      const dataArr: EssayQuestion[] = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 2 || !row[0]) continue;
        
        const criteria: Criterion[] = [];
        // Duyệt qua 5 nhóm tiêu chí (mỗi nhóm 3 cột: tên, mô tả, phần trăm)
        for (let j = 0; j < 5; j++) {
          const nameIndex = 2 + j * 3;
          const descIndex = 3 + j * 3;
          const weightIndex = 4 + j * 3;
          
          if (row[nameIndex] && row[nameIndex].trim()) {
            criteria.push({
              criterionName: row[nameIndex].trim(),
              description: row[descIndex] ? row[descIndex].trim() : '',
              weightPercent: Number(row[weightIndex]) || 0
            });
          }
        }
        
        if (criteria.length > 0) {
          dataArr.push({
            id: Date.now() + i,
            content: row[0],
            criteria: criteria,
            difficulty: Number(row[1]) || 1,
            isPublic: true,
          });
        }
      }
      setQuestions([...questions, ...dataArr]);
      setFileName(file.name);
      setImportError('');
    };
    reader.readAsArrayBuffer(file);
  };

  // Thêm tiêu chí mới cho form thủ công
  const addCriterion = () => {
    if (manualQ.criteria.length >= 3) {
      alert('Chỉ được phép tối đa 3 tiêu chí chấm điểm!');
      return;
    }
    setManualQ({
      ...manualQ,
      criteria: [...manualQ.criteria, { criterionName: '', weightPercent: 0, description: '' }]
    });
  };

  // Xóa tiêu chí
  const removeCriterion = (index: number) => {
    const newCriteria = manualQ.criteria.filter((_, i) => i !== index);
    setManualQ({ ...manualQ, criteria: newCriteria });
  };

  // Cập nhật tiêu chí
  const updateCriterion = (index: number, field: keyof Criterion, value: string | number) => {
    const newCriteria = [...manualQ.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setManualQ({ ...manualQ, criteria: newCriteria });
  };

  // Thêm/xóa tiêu chí cho câu hỏi trong danh sách
  const addCriterionToQuestion = (questionIdx: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIdx].criteria.length >= 3) {
      alert('Chỉ được phép tối đa 3 tiêu chí chấm điểm!');
      return;
    }
    newQuestions[questionIdx].criteria.push({
      criterionName: '',
      weightPercent: 0,
      description: ''
    });
    setQuestions(newQuestions);
  };

  const removeCriterionFromQuestion = (questionIdx: number, criterionIdx: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIdx].criteria = newQuestions[questionIdx].criteria.filter((_, i) => i !== criterionIdx);
    setQuestions(newQuestions);
  };

  // Cập nhật tiêu chí trong danh sách câu hỏi
  const updateQuestionCriterion = (questionIdx: number, criterionIdx: number, field: keyof Criterion, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[questionIdx].criteria[criterionIdx] = {
      ...newQuestions[questionIdx].criteria[criterionIdx],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  // Thêm thủ công
  const handleAddManual = () => {
    if (!manualQ.content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    
    const validCriteria = manualQ.criteria.filter(c => c.criterionName.trim());
    if (validCriteria.length === 0) {
      alert('Vui lòng thêm ít nhất một tiêu chí chấm!');
      return;
    }
    
    const totalWeight = validCriteria.reduce((sum, c) => sum + c.weightPercent, 0);
    if (totalWeight !== 100) {
      alert('Tổng phần trăm điểm của các tiêu chí phải bằng 100%!');
      return;
    }
    
    setQuestions([
      ...questions,
      { ...manualQ, id: Date.now(), criteria: validCriteria }
    ]);
    setManualQ({
      id: Date.now(),
      content: '',
      criteria: [{ criterionName: '', weightPercent: 25, description: '' }],
      difficulty: 1,
      isPublic: true,
    });
    setShowManualForm(false);
    
    // Auto scroll to questions list after adding
    setTimeout(() => {
      questionsListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleShowManualForm = () => {
    setShowManualForm(true);
    setTimeout(() => {
      manualFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

    const handleShowAIForm = () => {
    setShowAIGen(true);
    setTimeout(() => {
      aiFormRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  // Tạo câu hỏi bằng AI
  const handleGenerateAI = async () => {
    if (!aiLink || !aiNum || !aiLevel) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setAILoading(true);
    try {
      const res = await fetch('https://localhost:7074/api/GenerateQuestions/GenerateEssayQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subjectName,
          materialLink: aiLink,
          levels: [{ difficulty: aiLevel, numberOfQuestions: aiNum }]
        })
      });
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Kết quả trả về không hợp lệ!');
      const newQuestions: EssayQuestion[] = data.map((q: any, idx: number) => ({
        id: Date.now() + idx,
        content: q.content,
        criteria: q.bandScoreGuide || [],
        difficulty: 1,
        isPublic: true
      }));
      setQuestions(prev => [...prev, ...newQuestions]);
      setShowAIGen(false);
      setAILink('');
      setAINum(2);
      setAILevel('dễ');
      
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
      if (q.criteria.length === 0) {
        alert(`Câu hỏi ${i + 1} chưa có tiêu chí chấm!`);
        return;
      }
      
      // Kiểm tra tổng phần trăm điểm
      const totalWeight = q.criteria.reduce((sum, c) => sum + c.weightPercent, 0);
      if (totalWeight !== 100) {
        alert(`Câu hỏi ${i + 1}: Tổng phần trăm điểm của các tiêu chí phải bằng 100% (hiện tại: ${totalWeight}%)`);
        return;
      }
      
      // Kiểm tra tên tiêu chí không được trống
      for (let j = 0; j < q.criteria.length; j++) {
        if (!q.criteria[j].criterionName.trim()) {
          alert(`Câu hỏi ${i + 1}, tiêu chí ${j + 1}: Tên tiêu chí không được để trống!`);
          return;
        }
      }
    }

    try {
      const teacherId = getUserIdFromToken();
      const body = questions.map(q => ({
        content: q.content,
        answerContent:q.content,
        urlImg: "Default.png",
        isActive: true,
        createdBy: teacherId,
        isPublic: q.isPublic,
        categoryExamId: categoryExamId,
        levelQuestionId: q.difficulty,
        semesterId: semesterId,
        criteria: JSON.stringify(q.criteria)
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
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu câu hỏi!');
    }
  };

  const getLevelColor = (level: number) => {
    const levelObj = difficulties.find(d => d.value === level);
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
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo câu hỏi tự luận</h1>
                <p className="text-gray-600">Tạo và quản lý câu hỏi tự luận cho ngân hàng câu hỏi</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    options={difficulties}
                    value={difficulties.find(d => d.value === manualQ.difficulty)}
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
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tiêu chí chấm điểm</label>
                  <button
                    type="button"
                    onClick={addCriterion}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                    disabled={manualQ.criteria.length >= 3}
                    title={manualQ.criteria.length >= 3 ? "Chỉ được phép tối đa 3 tiêu chí" : ""}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm tiêu chí</span>
                  </button>
                </div>
                
                {/* Warning message when having more than 3 criteria */}
                {manualQ.criteria.length > 3 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 font-medium">
                        Bạn có {manualQ.criteria.length} tiêu chí. Vui lòng xóa bớt để chỉ còn tối đa 3 tiêu chí!
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {manualQ.criteria.map((criterion, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Tiêu chí {index + 1}</span>
                        {manualQ.criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCriterion(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tên tiêu chí</label>
                          <input
                            type="text"
                            value={criterion.criterionName}
                            onChange={e => updateCriterion(index, 'criterionName', e.target.value)}
                            placeholder="Ví dụ: Độ rõ ràng"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Phần trăm (%)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={criterion.weightPercent}
                            onChange={e => updateCriterion(index, 'weightPercent', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                          <input
                            type="text"
                            value={criterion.description}
                            onChange={e => updateCriterion(index, 'description', e.target.value)}
                            placeholder="Mô tả tiêu chí"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  Tổng phần trăm: {manualQ.criteria.reduce((sum, c) => sum + c.weightPercent, 0)}% (phải bằng 100%)
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
            
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(q.difficulty)}`}>
                        {difficulties.find(d => d.value === q.difficulty)?.label || 'Không xác định'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${q.isPublic ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {q.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <button
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      onClick={() => handleDeleteQuestion(idx)}
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi</label>
                      <textarea
                        value={q.content}
                        onChange={e => handleEditQuestion(idx, 'content', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-medium"
                        rows={3}
                        placeholder="Nội dung câu hỏi"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Tiêu chí chấm điểm</label>
                        <button
                          type="button"
                          onClick={() => addCriterionToQuestion(idx)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                          disabled={q.criteria.length >= 3}
                          title={q.criteria.length >= 3 ? "Chỉ được phép tối đa 3 tiêu chí" : ""}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm tiêu chí</span>
                        </button>
                      </div>
                      
                      {/* Warning message when having more than 3 criteria */}
                      {q.criteria.length > 3 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-700 font-medium">
                              Câu hỏi này có {q.criteria.length} tiêu chí. Vui lòng xóa bớt để chỉ còn tối đa 3 tiêu chí!
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {q.criteria.map((criterion, critIdx) => (
                          <div key={critIdx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-600">Tiêu chí {critIdx + 1}</span>
                              {q.criteria.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCriterionFromQuestion(idx, critIdx)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  title="Xóa tiêu chí"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tên tiêu chí</label>
                                <input
                                  type="text"
                                  value={criterion.criterionName}
                                  onChange={e => updateQuestionCriterion(idx, critIdx, 'criterionName', e.target.value)}
                                  placeholder="Ví dụ: Độ rõ ràng"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Phần trăm (%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={criterion.weightPercent}
                                  onChange={e => updateQuestionCriterion(idx, critIdx, 'weightPercent', Number(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                                <input
                                  type="text"
                                  value={criterion.description}
                                  onChange={e => updateQuestionCriterion(idx, critIdx, 'description', e.target.value)}
                                  placeholder="Mô tả tiêu chí"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <span className="text-gray-600">Tổng phần trăm: </span>
                        <span className={`font-medium ${
                          q.criteria.reduce((sum, c) => sum + c.weightPercent, 0) === 100 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {q.criteria.reduce((sum, c) => sum + c.weightPercent, 0)}%
                        </span>
                        <span className="text-gray-600"> (phải bằng 100%)</span>
                      </div>
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
              <PenTool className="w-12 h-12 text-gray-400" />
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