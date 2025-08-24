'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  PenTool,
  Settings,
  X,
  ChevronLeft,
  CheckSquare,
  Star,
  Hash,
  Search,
  Edit3,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useCreateFinalExamPaper } from '@/hooks/teacher/useCreateFinalExamPaper';
import type { Criterion } from '@/services/teacher/createFinalExamPaperService';

const levels = [
  { value: 1, label: 'Dễ', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 2, label: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 3, label: 'Khó', color: 'text-red-600', bgColor: 'bg-red-50' },
];

const getLevelInfo = (level: string) => {
  const levelMap: Record<string, { color: string; bgColor: string }> = {
    'Dễ': { color: 'text-green-600', bgColor: 'bg-green-50' },
    'Trung bình': { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'Khó': { color: 'text-red-600', bgColor: 'bg-red-50' },
  };
  return levelMap[level] || { color: 'text-gray-600', bgColor: 'bg-gray-50' };
};

function CreateFinalExamPaperContent() {
  const router = useRouter();
  const {
    // State
    inputName,
    setInputName,
    showQuestionPopup,
    setShowQuestionPopup,
    searchContent,
    setSearchContent,
    selectedLevel,
    setSelectedLevel,
    selectedChapter,
    setSelectedChapter,
    chapters,
    questions,
    questionChecks,
    setQuestionChecks,
    selectedQuestions,
    questionScores,
    setQuestionScores,
    manualQuestions,
    setManualQuestions,
    showManualInput,
    setShowManualInput,
    questionPage,
    setQuestionPage,
    questionTotalPages,
    loadingQuestions,
    manualContent,
    setManualContent,
    manualScore,
    setManualScore,
    manualCriteria,
    setManualCriteria,
    manualLevel,
    setManualLevel,
    manualChapter,
    setManualChapter,
    editingManualId,
    subjects,
    selectedSubject,
    setSelectedSubject,
    semesters,
    selectedSemester,
    setSelectedSemester,
    isSubmitting,
    totalScore,

    // Functions
    handleSaveQuestions,
    handleRemoveQuestion,
    handleSave,
    addCriterion,
    removeCriterion,
    updateCriterion,
    handleAddManualQuestion,
    handleEditManualQuestion,
    handleCancelManualInput,
  } = useCreateFinalExamPaper();

  // react-select options
  const subjectOptions = subjects.map(s => ({ value: s.subjectId, label: s.subjectName }));
  const semesterOptions = semesters.map(s => ({ value: s.semesterId, label: s.semesterName }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  setManualContent('');
                  setManualScore(1);
                  setManualCriteria([{ criterionName: '', weightPercent: 25, description: '' }]);
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
              
              <div className="space-y-6">
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
                
                {/* Tiêu chí chấm điểm */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tiêu chí chấm điểm</label>
                    <button
                      type="button"
                      onClick={addCriterion}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm tiêu chí</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {manualCriteria.map((criterion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">Tiêu chí {index + 1}</span>
                          {manualCriteria.length > 1 && (
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
                            />
                          </div>
                           <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                            <input
                              type="text"
                              value={criterion.description}
                              onChange={e => updateCriterion(index, 'description', e.target.value)}
                              placeholder="Mô tả tiêu chí"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
                            />
                          </div>
                         
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600">Tổng phần trăm: </span>
                    <span className={`font-medium ${
                      manualCriteria.reduce((sum, c) => sum + c.weightPercent, 0) === 100 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {manualCriteria.reduce((sum, c) => sum + c.weightPercent, 0)}%
                    </span>
                    <span className="text-gray-600"> (phải bằng 100%)</span>
                  </div>
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
                      
                      {/* Hiển thị tiêu chí chấm */}
                      {q.criteria && q.criteria.length > 0 && (
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <span className="text-sm font-medium text-gray-600 mb-2 block">Tiêu chí chấm điểm:</span>
                          <div className="space-y-2">
                            {q.criteria.map((criterion: Criterion, critIdx: number) => (
                              <div key={critIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                  <span className="font-medium text-sm text-gray-800">{criterion.criterionName}</span>
                                  {criterion.description && (
                                    <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-green-600 ml-3">
                                  {criterion.weightPercent}%
                                </span>
                              </div>
                            ))}
                          </div>
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
                      Tổng điểm: <span className={`font-bold ${totalScore === 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalScore}/10
                      </span>
                      {totalScore !== 10 && (
                        <span className="text-red-500 text-xs ml-2">(Phải bằng 10 điểm)</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !inputName || !selectedSubject || !selectedSemester || (selectedQuestions.length + manualQuestions.length) === 0 || totalScore !== 10}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[100vh] overflow-hidden">
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
                    <span>Đóng</span>
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

// Loading component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}

export default function CreateFinalExamPaperPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateFinalExamPaperContent />
    </Suspense>
  );
}
