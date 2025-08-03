'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import { 
  Plus, 
  Filter, 
  RefreshCw, 
  BookOpen, 
  Target, 
  FileText, 
  Layers, 
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Brain,
  Award
} from 'lucide-react';

// Dropdown static
const types = [
  { value: 'multiple', label: 'Trắc nghiệm' },
  { value: 'essay', label: 'Tự luận' },
];

const levels = [
  { value: 1, label: 'Dễ' },
  { value: 2, label: 'Trung bình' },
  { value: 3, label: 'Khó' },
];

const pageSize = 10;

export default function QuestionBankPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Dropdown menu state
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Lấy filter từ URL nếu có
  const initialChapterId = searchParams.get('chapterId');
  const initialCategoryExamId = searchParams.get('categoryExamId');
  const initialSubjectId = searchParams.get('subjectId');
  const initialType = searchParams.get('questionType');
  const initialLevel = searchParams.get('levelId');

  // Khi danh sách filter thay đổi, tự động set filter nếu có giá trị truyền vào từ URL
  useEffect(() => {
    if (subjects.length > 0 && initialSubjectId && !selectedSubject) {
      const found = subjects.find(s => String(s.value) === String(initialSubjectId));
      if (found) setSelectedSubject(found);
    }
  }, [subjects, initialSubjectId, selectedSubject]);

  useEffect(() => {
    if (categories.length > 0 && initialCategoryExamId && !selectedCategory) {
      const found = categories.find(c => String(c.value) === String(initialCategoryExamId));
      if (found) setSelectedCategory(found);
    }
  }, [categories, initialCategoryExamId, selectedCategory]);

  useEffect(() => {
    if (chapters.length > 0 && initialChapterId && !selectedChapter) {
      const found = chapters.find(c => String(c.value) === String(initialChapterId));
      if (found) setSelectedChapter(found);
    }
  }, [chapters, initialChapterId, selectedChapter]);

  useEffect(() => {
    if (types.length > 0 && initialType && !selectedType) {
      const found = types.find(t => String(t.value) === String(initialType));
      if (found) setSelectedType(found);
    }
  }, [initialType, selectedType]);

  useEffect(() => {
    if (levels.length > 0 && initialLevel && !selectedLevel) {
      const found = levels.find(l => String(l.value) === String(initialLevel));
      if (found) setSelectedLevel(found);
    }
  }, [initialLevel, selectedLevel]);

  // Pagination
  const [page, setPage] = useState(1);

  // Questions
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Fetch subjects by teacherId on mount
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    if (!teacherId) {
      setSubjects([]);
      return;
    }
    fetch(`https://localhost:7074/api/MultipleExam/subjects-by-teacher/${teacherId}`)
      .then(res => res.json())
      .then(data => setSubjects(data.map((s: any) => ({ value: s.subjectId, label: s.subjectName }))))
      .catch(() => setSubjects([]));
  }, []);

  // Fetch categories and chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setCategories([]);
      setChapters([]);
      setSelectedCategory(null);
      setSelectedChapter(null);
      return;
    }
    fetch(`https://localhost:7074/api/MultipleExam/category/${selectedSubject.value}`)
      .then(res => res.json())
      .then(data => setCategories(data.map((c: any) => ({ value: c.categoryExamId, label: c.categoryExamName }))))
      .catch(() => setCategories([]));
    fetch(`https://localhost:7074/api/MultipleExam/chapter/${selectedSubject.value}`)
      .then(res => res.json())
      .then(data => setChapters(data.map((c: any) => ({ value: c.id, label: c.chapterName }))))
      .catch(() => setChapters([]));
    setSelectedCategory(null);
    setSelectedChapter(null);
  }, [selectedSubject]);

  // Fetch questions when filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedCategory) params.append('headId', selectedCategory.value);
    if (selectedType) params.append('questionType', selectedType.value);
    if (selectedLevel) params.append('levelId', selectedLevel.value);
    if (selectedChapter) params.append('chapterId', selectedChapter.value);
    params.append('pageNumber', page.toString());
    params.append('pageSize', pageSize.toString());

    fetch(`https://localhost:7074/api/PracticeQuestion/all-questions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setTotalPages(data.totalPages || 1);
        setTotalQuestions(data.totalQuestions || 0);
      })
      .catch(() => {
        setQuestions([]);
        setTotalPages(1);
        setTotalQuestions(0);
      })
      .finally(() => setLoading(false));
  }, [selectedSubject, selectedCategory, selectedType, selectedLevel, selectedChapter, page]);

  // Tạo câu hỏi: truyền toàn bộ filter sang trang tạo
  const handleCreateQuestion = (type: 'multiple' | 'essay') => {
    if (!selectedChapter || !selectedCategory) {
      alert('Vui lòng chọn chương và đầu điểm trước khi tạo câu hỏi!');
      return;
    }
    const params = new URLSearchParams();
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedCategory) params.append('categoryExamId', selectedCategory.value);
    if (selectedType) params.append('questionType', selectedType.value);
    if (selectedLevel) params.append('levelId', selectedLevel.value);
    if (selectedChapter) params.append('chapterId', selectedChapter.value);

    if (type === 'multiple') {
      router.push(`/teacher/questionbank/createmulquestion?${params.toString()}`);
    } else {
      router.push(`/teacher/questionbank/createpracquestion?${params.toString()}`);
    }
    setShowCreateMenu(false);
  };

  // Reset filter
  const handleResetFilter = () => {
    setSelectedSubject(null);
    setSelectedCategory(null);
    setSelectedType(null);
    setSelectedLevel(null);
    setSelectedChapter(null);
    setPage(1);
  };

  // Đáp án ký tự
  const answerChar = (idx: number) => String.fromCharCode(65 + idx);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Dễ': return 'bg-green-100 text-green-800';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
      case 'Khó': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Trắc nghiệm' ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
                <p className="text-gray-600">Quản lý và tổ chức câu hỏi theo môn học</p>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Tạo câu hỏi</span>
              </button>
              
              {showCreateMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  <button
                    onClick={() => handleCreateQuestion('multiple')}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-t-xl"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Tạo câu hỏi trắc nghiệm</span>
                  </button>
                  <button
                    onClick={() => handleCreateQuestion('essay')}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 rounded-b-xl"
                  >
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Tạo câu hỏi tự luận</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trắc nghiệm</p>
                <p className="text-2xl font-bold text-blue-600">
                  {questions.filter(q => q.questionType === 'Trắc nghiệm').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tự luận</p>
                <p className="text-2xl font-bold text-green-600">
                  {questions.filter(q => q.questionType === 'Tự luận').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Môn học</p>
                <p className="text-2xl font-bold text-purple-600">{subjects.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Bộ lọc tìm kiếm
            </h3>
            <button
              onClick={handleResetFilter}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Xóa lọc</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
              <Select
                options={subjects}
                value={selectedSubject}
                onChange={option => { setSelectedSubject(option); setPage(1); }}
                placeholder="Chọn môn học"
                isClearable
                isSearchable
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Đầu điểm</label>
              <Select
                options={categories}
                value={selectedCategory}
                onChange={option => { setSelectedCategory(option); setPage(1); }}
                placeholder="Chọn đầu điểm"
                isClearable
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại câu hỏi</label>
              <Select
                options={types}
                value={selectedType}
                onChange={option => { setSelectedType(option); setPage(1); }}
                placeholder="Loại câu hỏi"
                isClearable
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
              <Select
                options={levels}
                value={selectedLevel}
                onChange={option => { setSelectedLevel(option); setPage(1); }}
                placeholder="Độ khó"
                isClearable
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Chương</label>
              <Select
                options={chapters}
                value={selectedChapter}
                onChange={option => { setSelectedChapter(option); setPage(1); }}
                placeholder="Chương"
                isClearable
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
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Danh sách câu hỏi
              </h3>
              <span className="text-sm text-gray-600">
                Hiển thị {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalQuestions)} trong tổng số {totalQuestions} câu hỏi
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải câu hỏi...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung câu hỏi</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Độ khó</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chương</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.length > 0 ? questions.map((q, idx) => (
                    <tr key={q.questionId + '-' + q.questionType + '-' + idx} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md line-clamp-2">{q.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getTypeIcon(q.questionType)}
                          <span className="text-sm text-gray-900">{q.questionType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(q.level)}`}>
                          <Award className="w-3 h-3 mr-1" />
                          {q.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900">{q.chapter}</span>
                      </td>
                      <td className="px-6 py-4">
                        {q.questionType === 'Trắc nghiệm' ? (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đáp án:
                            </div>
                            <div className="space-y-1">
                              {q.answers && q.answers.map((a: any, i: number) => (
                                <div key={i} className={`text-xs flex items-center ${a.isCorrect ? 'text-green-700 font-semibold bg-green-50 rounded px-2 py-1' : 'text-gray-600'}`}>
                                  <span className="inline-block w-4 font-medium">{answerChar(i)}.</span> 
                                  <span className="flex-1">{a.content}</span>
                                  {a.isCorrect && <CheckCircle className="w-3 h-3 ml-1 text-green-600" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700 flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              Tiêu chí chấm:
                            </div>
                            <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              {q.answers && q.answers[0]?.content}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">Không có câu hỏi nào</p>
                          <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc để tìm kiếm câu hỏi khác</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(page * pageSize, totalQuestions)}</span> trong tổng số{' '}
              <span className="font-medium">{totalQuestions}</span> kết quả
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Trang {page} / {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showCreateMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowCreateMenu(false)}
        />
      )}
    </div>
  );
}