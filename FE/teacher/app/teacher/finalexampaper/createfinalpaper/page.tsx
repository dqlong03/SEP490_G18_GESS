'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import Select from 'react-select';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  PenTool,
  Calendar,
  GraduationCap,
  FileText,
  Settings,
  X,
  ChevronLeft,
  Eye,
  CheckSquare,
  Users,
  Target,
  Clock,
  Filter,
  AlertCircle,
  Search,
  Edit3,
  Star,
  Hash
} from 'lucide-react';

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
  { value: 1, label: 'Dễ', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 2, label: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 3, label: 'Khó', color: 'text-red-600', bgColor: 'bg-red-50' },
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

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách môn học, kỳ, chapter
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    fetch(`${API_URL}/api/FinalExamPaper/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data || []);
        if (data && data.length > 0) setSelectedSubject(data[0]);
      });
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => {
        setSemesters(data || []);
        if (data && data.length > 0) setSelectedSemester(data[0]);
      });
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
  
  try {
    const res = await fetch(`${API_URL}/api/FinalExamPaper/GetFinalPracticeQuestion?${params}`);
    const data = await res.json();
    
    // Debug: Log response để kiểm tra cấu trúc
    console.log('API Response:', data);
    
    // Kiểm tra cấu trúc response và set questions phù hợp
    if (Array.isArray(data)) {
      // Nếu response trực tiếp là array
      setQuestions(data);
      setQuestionTotalPages(Math.ceil(data.length / 10) || 1);
      setQuestionPage(page);
    } else if (data.data && Array.isArray(data.data)) {
      // Nếu response có cấu trúc {data: [], totalPages: x, page: y}
      setQuestions(data.data);
      setQuestionTotalPages(data.totalPages || 1);
      setQuestionPage(data.page || page);
    } else {
      // Fallback
      setQuestions([]);
      setQuestionTotalPages(1);
      setQuestionPage(1);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    setQuestions([]);
    setQuestionTotalPages(1);
    setQuestionPage(1);
  } finally {
    setLoadingQuestions(false);
  }
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
    
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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

  // react-select options
  const subjectOptions = subjects.map(s => ({ value: s.subjectId, label: s.subjectName }));
  const semesterOptions = semesters.map(s => ({ value: s.semesterId, label: s.semesterName }));

  const getLevelInfo = (level: string) => {
    const levelMap: Record<string, { color: string; bgColor: string }> = {
      'Dễ': { color: 'text-green-600', bgColor: 'bg-green-50' },
      'Trung bình': { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'Khó': { color: 'text-red-600', bgColor: 'bg-red-50' },
    };
    return levelMap[level] || { color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Floating Stats */}
      {/* {(selectedQuestions.length > 0 || manualQuestions.length > 0) && (
        <div className="fixed top-6 right-6 z-50 bg-white rounded-xl shadow-2xl p-4 min-w-[200px]">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Số câu hỏi</div>
              <div className="text-2xl font-bold text-blue-600">{selectedQuestions.length + manualQuestions.length}</div>
              <div className="text-sm text-gray-600">Tổng điểm</div>
              <div className="text-xl font-bold text-green-600">{totalScore}</div>
            </div>
          </div>
        </div>
      )} */}

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo đề thi cuối kỳ</h1>
                <p className="text-gray-600">Thiết lập và cấu hình đề thi thực hành cuối kỳ</p>
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

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Nhập tên đề thi"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <Select
                  options={subjectOptions}
                  value={selectedSubject ? subjectOptions.find(s => s.value === selectedSubject.subjectId) : null}
                  onChange={option => setSelectedSubject(option ? subjects.find(s => s.subjectId === option.value) || null : null)}
                  placeholder="Chọn môn học"
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9333ea' }
                    }),
                    menu: (provided) => ({ ...provided, zIndex: 20 }),
                  }}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học kỳ <span className="text-red-500">*</span>
                </label>
                <Select
                  options={semesterOptions}
                  value={selectedSemester ? semesterOptions.find(s => s.value === selectedSemester.semesterId) : null}
                  onChange={option => setSelectedSemester(option ? semesters.find(s => s.semesterId === option.value) || null : null)}
                  placeholder="Chọn học kỳ"
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#9333ea' }
                    }),
                    menu: (provided) => ({ ...provided, zIndex: 20 }),
                  }}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => setShowQuestionPopup(true)}
                disabled={!selectedSubject || !selectedSemester}
              >
                <Search className="w-4 h-4" />
                <span>Chọn câu hỏi có sẵn</span>
              </button>
              
              <button
                type="button"
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
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
                <Plus className="w-4 h-4" />
                <span>Thêm câu hỏi thủ công</span>
              </button>
            </div>
          </div>

          {/* Manual Question Input Form */}
          {showManualInput && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-green-600" />
                {editingManualId ? 'Sửa câu hỏi thủ công' : 'Thêm câu hỏi thủ công'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điểm</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    value={manualScore}
                    onChange={e => setManualScore(Number(e.target.value))}
                    placeholder="Nhập điểm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chương</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    rows={4}
                    value={manualContent}
                    onChange={e => setManualContent(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu chí chấm</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    rows={3}
                    value={manualCriteria}
                    onChange={e => setManualCriteria(e.target.value)}
                    placeholder="Nhập tiêu chí chấm (tùy chọn)"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  onClick={handleAddManualQuestion}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingManualId ? 'Cập nhật' : 'Thêm vào đề thi'}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  onClick={handleCancelManualInput}
                >
                  <X className="w-4 h-4" />
                  <span>Hủy</span>
                </button>
              </div>
            </div>
          )}

          {/* Selected Questions */}
          {(selectedQuestions.length > 0 || manualQuestions.length > 0) && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Danh sách câu hỏi ({selectedQuestions.length + manualQuestions.length} câu)
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedQuestions.map((q, idx) => {
                  const levelInfo = getLevelInfo(q.level);
                  return (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                            {idx + 1}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelInfo.bgColor} ${levelInfo.color}`}>
                            <Star className="w-3 h-3 mr-1" />
                            {q.level}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Điểm:</span>
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
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-800 whitespace-pre-line">{q.content}</div>
                    </div>
                  );
                })}
                
                {manualQuestions.map((q, idx) => {
                  const levelInfo = getLevelInfo(q.level);
                  return (
                    <div key={q.manualId} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                            {selectedQuestions.length + idx + 1}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelInfo.bgColor} ${levelInfo.color}`}>
                            <PenTool className="w-3 h-3 mr-1" />
                            {q.level} (Thủ công)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Điểm:</span>
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
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEditManualQuestion(q.manualId)}
                            className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                            title="Sửa câu hỏi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.manualId, true)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-gray-800 whitespace-pre-line mb-3">{q.content}</div>
                      
                      {q.criteria && (
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <span className="text-sm font-medium text-gray-600">Tiêu chí chấm:</span>
                          <p className="text-gray-800 mt-1">{q.criteria}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        <span className="font-medium">Chương:</span> {chapters.find(c => c.chapterId === q.chapterId)?.chapterName || 'Không xác định'}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-sm font-medium text-gray-900">
                      Tổng câu hỏi: <span className="text-purple-600 font-bold">{selectedQuestions.length + manualQuestions.length}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      Tổng điểm: <span className="text-green-600 font-bold">{totalScore}</span>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !inputName || !selectedSubject || !selectedSemester || (selectedQuestions.length + manualQuestions.length) === 0}
                    className="flex items-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Tạo đề thi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Question Selection Modal */}
        {showQuestionPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-blue-600" />
                    Chọn câu hỏi từ ngân hàng đề thi
                  </h3>
                  <button
                    onClick={() => setShowQuestionPopup(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm theo nội dung"
                      value={searchContent}
                      onChange={e => {
                        setSearchContent(e.target.value);
                        setQuestionPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div>
                    <select
                      value={selectedLevel?.value || ''}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSelectedLevel(val ? levels.find(l => l.value === val) || null : null);
                        setQuestionPage(1);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Tất cả độ khó</option>
                      {levels.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={selectedChapter?.chapterId || ''}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setSelectedChapter(val ? chapters.find(c => c.chapterId === val) || null : null);
                        setQuestionPage(1);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Tất cả chương</option>
                      {chapters.map(c => (
                        <option key={c.chapterId} value={c.chapterId}>{c.chapterName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Questions Table */}
                <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung câu hỏi</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mức độ</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingQuestions ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="text-gray-500 font-medium">Đang tải...</span>
                            </div>
                          </td>
                        </tr>
                      ) : questions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <AlertCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có câu hỏi nào</h3>
                            <p className="text-gray-600">Thử thay đổi bộ lọc để tìm câu hỏi phù hợp</p>
                          </td>
                        </tr>
                      ) : (
                        questions.map((q, idx) => {
                          const levelInfo = getLevelInfo(q.level);
                          return (
                            <tr key={q.id} className="hover:bg-blue-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {(questionPage - 1) * 10 + idx + 1}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 line-clamp-3">{q.content}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelInfo.bgColor} ${levelInfo.color}`}>
                                  {q.level}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!questionChecks[q.id]}
                                  onChange={e =>
                                    setQuestionChecks((prev) => ({
                                      ...prev,
                                      [q.id]: e.target.checked,
                                    }))
                                  }
                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    disabled={questionPage <= 1}
                    onClick={() => setQuestionPage(p => Math.max(1, p - 1))}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Trang trước</span>
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Trang {questionPage} / {questionTotalPages}
                  </span>
                  
                  <button
                    type="button"
                    disabled={questionPage >= questionTotalPages}
                    onClick={() => setQuestionPage(p => Math.min(questionTotalPages, p + 1))}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <span>Trang sau</span>
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowQuestionPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuestions}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu câu hỏi đã chọn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}