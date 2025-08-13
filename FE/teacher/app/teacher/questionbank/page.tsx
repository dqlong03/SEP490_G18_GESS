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
  Award,
  Globe,
  Lock,
  Copy,
  X,
  Shield
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

const publicOptions = [
  { value: 'public', label: 'Bank chung' },
  { value: 'private', label: 'Bank riêng' },
];

const pageSize = 10;

// Types
interface SimilarQuestion {
  questionID: number;
  content: string;
}

interface SimilarityGroup {
  similarityScore: number;
  questions: SimilarQuestion[];
}

export default function QuestionBankPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  const [selectedPublic, setSelectedPublic] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  const teacherId = getUserIdFromToken()||null;

  // Loading state
  const [loading, setLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Dropdown menu state
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Duplicate check popup
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<SimilarityGroup[]>([]);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  // Lấy filter từ URL nếu có
  const initialChapterId = searchParams.get('chapterId');
  const initialCategoryExamId = searchParams.get('categoryExamId');
  const initialSubjectId = searchParams.get('subjectId');
  const initialType = searchParams.get('questionType');
  const initialLevel = searchParams.get('levelId');

  // Khi danh sách filter thay đổi, tự động set filter nếu có giá trị truyền vào từ URL
  useEffect(() => {
    if (categories.length > 0 && initialCategoryExamId && !selectedCategory) {
      const found = categories.find(c => String(c.value) === String(initialCategoryExamId));
      if (found) setSelectedCategory(found);
    }
  }, [categories, initialCategoryExamId, selectedCategory]);

  useEffect(() => {
    if (subjects.length > 0 && initialSubjectId && !selectedSubject) {
      const found = subjects.find(s => String(s.value) === String(initialSubjectId));
      if (found) setSelectedSubject(found);
    }
  }, [subjects, initialSubjectId, selectedSubject]);

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

  // Fetch categories on mount
  useEffect(() => {
    fetch('https://localhost:7074/api/PracticeQuestion/GetAllCategoryExam')
      .then(res => res.json())
      .then(data => setCategories(data.map((c: any) => ({ value: c.categoryExamId, label: c.categoryExamName }))))
      .catch(() => setCategories([]));
  }, []);

  // Fetch subjects when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSubjects([]);
      setChapters([]);
      setSelectedSubject(null);
      setSelectedChapter(null);
      return;
    }
    fetch(`https://localhost:7074/api/PracticeQuestion/GetSubjectsByCategoryExam/${selectedCategory.value}`)
      .then(res => res.json())
      .then(data => setSubjects(data.map((s: any) => ({ value: s.subjectId, label: s.subjectName }))))
      .catch(() => setSubjects([]));
    setSelectedSubject(null);
    setSelectedChapter(null);
  }, [selectedCategory]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setSelectedChapter(null);
      return;
    }
    fetch(`https://localhost:7074/api/MultipleExam/chapter/${selectedSubject.value}`)
      .then(res => res.json())
      .then(data => setChapters(data.map((c: any) => ({ value: c.id, label: c.chapterName }))))
      .catch(() => setChapters([]));
    setSelectedChapter(null);
  }, [selectedSubject]);

  // Fetch questions when filter changes
  const fetchQuestions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('headId', selectedCategory.value);
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedType) params.append('questionType', selectedType.value);
    if (selectedLevel) params.append('levelId', selectedLevel.value);
    if (selectedChapter) params.append('chapterId', selectedChapter.value);
    if (selectedPublic) {
      params.append('isPublic', selectedPublic.value === 'public' ? 'true' : 'false');
      if (teacherId && selectedPublic.value === "private") params.append('teacherId', teacherId.toString());
    }
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
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedSubject, selectedType, selectedLevel, selectedChapter, selectedPublic, page]);

  // Kiểm tra trùng lặp
  const handleCheckDuplicates = async () => {
    if (!selectedPublic || !selectedCategory || !selectedSubject || !selectedType || !selectedLevel || !selectedChapter) {
      alert('Vui lòng chọn đầy đủ tất cả các bộ lọc trước khi kiểm tra trùng lặp!');
      return;
    }

    setCheckingDuplicates(true);
    
    try {
      // Lấy tất cả câu hỏi với filter hiện tại (không phân trang)
      const params = new URLSearchParams();
      if (selectedCategory) params.append('headId', selectedCategory.value);
      if (selectedSubject) params.append('subjectId', selectedSubject.value);
      if (selectedType) params.append('questionType', selectedType.value);
      if (selectedLevel) params.append('levelId', selectedLevel.value);
      if (selectedChapter) params.append('chapterId', selectedChapter.value);
      if (selectedPublic) {
        params.append('isPublic', selectedPublic.value === 'public' ? 'true' : 'false');
        if (teacherId && selectedPublic.value === "private") params.append('teacherId', teacherId.toString());
      }
      params.append('pageNumber', '1');
      params.append('pageSize', '1000'); // Lấy nhiều để có tất cả câu hỏi

      const allQuestionsResponse = await fetch(`https://localhost:7074/api/PracticeQuestion/all-questions?${params.toString()}`);
      const allQuestionsData = await allQuestionsResponse.json();
      const allQuestions = allQuestionsData.questions || [];

      if (allQuestions.length === 0) {
        alert('Không có câu hỏi nào để kiểm tra!');
        return;
      }

      // Chuẩn bị dữ liệu cho API kiểm tra trùng lặp
      const questionsForCheck = allQuestions.map((q: any) => ({
        questionID: q.questionId,
        content: q.content
      }));

      const requestBody = {
        questions: questionsForCheck,
        similarityThreshold: 1
      };

      // Gọi API kiểm tra trùng lặp
      const duplicateResponse = await fetch('https://localhost:7074/api/AIGradePracExam/FindSimilar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const duplicateData = await duplicateResponse.json();
      
      if (Array.isArray(duplicateData) && duplicateData.length > 0) {
        setDuplicateGroups(duplicateData);
        setShowDuplicatePopup(true);
      } else {
        alert('Không tìm thấy câu hỏi trùng lặp nào!');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi kiểm tra trùng lặp!');
      console.error('Error checking duplicates:', error);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (questionId: number, questionType: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return;
    }

    setDeletingQuestionId(questionId);
    
    try {
      const type = selectedType === 'multiple' ? '1' : '2';
      const response = await fetch(`https://localhost:7074/api/PracticeQuestion/DeleteQuestion/${questionId}/${type}`, {
        method: 'PUT'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Xóa câu hỏi thành công!');
        // Refresh danh sách câu hỏi
        fetchQuestions();
        // Refresh duplicate groups
        const updatedGroups = duplicateGroups.map(group => ({
          ...group,
          questions: group.questions.filter(q => q.questionID !== questionId)
        })).filter(group => group.questions.length > 1); // Chỉ giữ lại groups có >= 2 câu hỏi
        
        setDuplicateGroups(updatedGroups);
        
        if (updatedGroups.length === 0) {
          setShowDuplicatePopup(false);
          alert('Đã xóa tất cả câu hỏi trùng lặp!');
        }
      } else {
        alert(result.message || 'Xóa câu hỏi thất bại!');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa câu hỏi!');
      console.error('Error deleting question:', error);
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // Tạo câu hỏi: truyền toàn bộ filter sang trang tạo
  const handleCreateQuestion = (type: 'multiple' | 'essay') => {
    if (!selectedChapter || !selectedCategory) {
      alert('Vui lòng chọn đầu điểm và chương trước khi tạo câu hỏi!');
      return;
    }
    const params = new URLSearchParams();
    if (selectedCategory) params.append('categoryExamId', selectedCategory.value);
    if (selectedSubject) {
      params.append('subjectId', selectedSubject.value);
      params.append('subjectName', selectedSubject.label);
    }
    if (selectedType) params.append('questionType', selectedType.value);
    if (selectedLevel) params.append('levelId', selectedLevel.value);
    if (selectedChapter) {
      params.append('chapterId', selectedChapter.value);
      params.append('chapterName', selectedChapter.label);
    }

    if (type === 'multiple') {
      router.push(`/teacher/questionbank/createmulquestion?${params.toString()}`);
    } else {
      router.push(`/teacher/questionbank/createpracquestion?${params.toString()}`);
    }
    setShowCreateMenu(false);
  };

  // Reset filter
  const handleResetFilter = () => {
    setSelectedPublic(null);
    setSelectedCategory(null);
    setSelectedSubject(null);
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

  // Kiểm tra xem có thể bấm nút kiểm tra trùng lặp không
  const canCheckDuplicates = selectedPublic && selectedCategory && selectedSubject && selectedType && selectedLevel && selectedChapter;

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
            
            <div className="flex items-center space-x-4">
              {/* Nút kiểm tra trùng lặp */}
              <button
                onClick={handleCheckDuplicates}
                disabled={!canCheckDuplicates || checkingDuplicates}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg ${
                  canCheckDuplicates && !checkingDuplicates
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {checkingDuplicates ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Kiểm tra trùng lặp</span>
                  </>
                )}
              </button>

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
                <p className="text-sm font-medium text-gray-600">Đầu điểm</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
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
            <div className="flex items-center space-x-4">
              {!canCheckDuplicates && (
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Chọn đầy đủ để kiểm tra trùng lặp
                </span>
              )}
              <button
                onClick={handleResetFilter}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Xóa lọc</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public <span className="text-red-500">*</span>
              </label>
              <Select
                options={publicOptions}
                value={selectedPublic}
                onChange={option => { setSelectedPublic(option); setPage(1); }}
                placeholder="Chọn loại bank"
                isClearable
                isSearchable={false}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: selectedPublic ? '#d1d5db' : '#f87171',
                    '&:hover': { borderColor: '#3b82f6' }
                  })
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đầu điểm <span className="text-red-500">*</span>
              </label>
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
                    borderColor: selectedCategory ? '#d1d5db' : '#f87171',
                    '&:hover': { borderColor: '#3b82f6' }
                  })
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học <span className="text-red-500">*</span>
              </label>
              <Select
                options={subjects}
                value={selectedSubject}
                onChange={option => { setSelectedSubject(option); setPage(1); }}
                placeholder="Chọn môn học"
                isClearable
                isSearchable
                isDisabled={!selectedCategory}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: selectedSubject ? '#d1d5db' : '#f87171',
                    '&:hover': { borderColor: '#3b82f6' }
                  })
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại câu hỏi <span className="text-red-500">*</span>
              </label>
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
                    borderColor: selectedType ? '#d1d5db' : '#f87171',
                    '&:hover': { borderColor: '#3b82f6' }
                  })
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ khó <span className="text-red-500">*</span>
              </label>
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
                    borderColor: selectedLevel ? '#d1d5db' : '#f87171',
                    '&:hover': { borderColor: '#3b82f6' }
                  })
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chương <span className="text-red-500">*</span>
              </label>
              <Select
                options={chapters}
                value={selectedChapter}
                onChange={option => { setSelectedChapter(option); setPage(1); }}
                placeholder="Chương"
                isClearable
                isSearchable={false}
                isDisabled={!selectedSubject}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: selectedChapter ? '#d1d5db' : '#f87171',
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Public</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${q.isPublic ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {q.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {q.isPublic ? 'Public' : 'Private'}
                        </span>
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
                      <td colSpan={7} className="px-6 py-12 text-center">
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

      {/* Duplicate Check Popup */}
      {showDuplicatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Copy className="w-6 h-6 mr-2" />
                  Câu hỏi trùng lặp ({duplicateGroups.length} nhóm)
                </h3>
                <button
                  onClick={() => setShowDuplicatePopup(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {duplicateGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-8 last:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-orange-600">{groupIndex + 1}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Nhóm {groupIndex + 1} - Độ tương tự: {Math.round(group.similarityScore * 100)}%
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {group.questions.map((question, questionIndex) => (
                      <div key={question.questionID} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                ID: {question.questionID}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 line-clamp-3">{question.content}</p>
                          </div>
                          <button
                            onClick={() => {
                              handleDeleteQuestion(question.questionID, "");
                            }}
                            disabled={deletingQuestionId === question.questionID}
                            className="ml-4 flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {deletingQuestionId === question.questionID ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>Đang xóa...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Tìm thấy {duplicateGroups.reduce((total, group) => total + group.questions.length, 0)} câu hỏi trùng lặp trong {duplicateGroups.length} nhóm
                </p>
                <button
                  onClick={() => setShowDuplicatePopup(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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