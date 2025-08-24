'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
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
  FileSpreadsheet, 
  Copy,
  Calendar
} from 'lucide-react';
import { useCreateMultipleQuestion } from '@/hooks/teacher/useCreateMultipleQuestion';

function CreateMCQQuestionContent() {
  const router = useRouter();
  
  const {
    // Core data
    questions,
    levels,
    statistics,
    
    // URL parameters
    chapterId,
    categoryExamId,
    chapterName,
    subjectName,
    semesterName,
    semesterId,
    
    // File import
    fileName,
    importError,
    
    // Duplicate checking
    duplicateMap,
    checkingDuplicate,
    
    // AI generation
    showAIGen,
    setShowAIGen,
    aiLink,
    setAILink,
    aiLevels,
    setAILevels,
    aiQuestionType,
    setAIQuestionType,
    aiLoading,
    aiTotalQuestions,
    
    // Manual question
    showManualForm,
    setShowManualForm,
    manualQ,
    setManualQ,
    
    // Refs
    manualFormRef,
    questionsListRef,
    aiFormRef,
    
    // Handlers
    handleCheckDuplicate,
    handleDownloadTemplate,
    handleUpload,
    handleShowManualForm,
    handleShowAIForm,
    handleAddManual,
    handleAddAnswerManual,
    handleDeleteAnswerManual,
    handleGenerateAI,
    handleEditQuestion,
    handleEditAnswer,
    handleDeleteQuestion,
    handleDeleteAnswer,
    handleSaveQuestions,
    handleGoBack,
    getLevelColor
  } = useCreateMultipleQuestion();

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

                   {semesterName && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{semesterName}</span>
                  </div>
                )}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        {questions.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-4 gap-6 mb-8">
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
                    {statistics.easy}
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
                  <p className="text-sm font-medium text-gray-600">Câu trung bình</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.medium}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Câu khó</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.hard}
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
                      <span className="ml-2 text-sm text-gray-700">Chung</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={manualQ.isPublic === false}
                        onChange={() => setManualQ({ ...manualQ, isPublic: false })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Cá nhân</span>
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
                          <span className="ml-2 text-sm text-gray-700">Chung</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`isPublic-${idx}`}
                            checked={q.isPublic === false}
                            onChange={() => handleEditQuestion(idx, 'isPublic', false)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Cá nhân</span>
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
      </div>
    </div>
  );
}

export default function CreateMCQQuestionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Đang tải...</div>
    </div>}>
      <CreateMCQQuestionContent />
    </Suspense>
  );
}