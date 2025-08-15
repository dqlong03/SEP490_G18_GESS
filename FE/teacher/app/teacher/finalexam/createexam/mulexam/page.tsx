'use client';

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  CheckSquare,
  Calendar,
  GraduationCap,
  FileText,
  Settings,
  X,
  ChevronLeft,
  Target,
  BarChart3
} from 'lucide-react';

const API_URL = "https://localhost:7074";

type Subject = {
  subjectId: number;
  subjectName: string;
};

type Chapter = {
  chapterId: number;
  chapterName: string;
};

type Semester = {
  semesterId: number;
  semesterName: string;
};

type Level = "easy" | "medium" | "hard";
const LEVELS: { key: Level; label: string; id: number; color: string; bgColor: string }[] = [
  { key: "easy", label: "Dễ", id: 1, color: "text-green-700", bgColor: "bg-green-50" },
  { key: "medium", label: "Trung bình", id: 2, color: "text-yellow-700", bgColor: "bg-yellow-50" },
  { key: "hard", label: "Khó", id: 3, color: "text-red-700", bgColor: "bg-red-50" },
];

// Định nghĩa type riêng cho dữ liệu số câu hỏi của từng chương
type ChapterQuestion = {
  easy: number;
  medium: number;
  hard: number;
  max: {
    easy: number;
    medium: number;
    hard: number;
  };
};

export default function CreateFinalMultipleExamPage() {
  const router = useRouter();
  const [examName, setExamName] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>([]);
  const [chapterChecks, setChapterChecks] = useState<Record<number, boolean>>({});
  const [chapterQuestions, setChapterQuestions] = useState<Record<number, ChapterQuestion>>({});
  const [questionInput, setQuestionInput] = useState<number>(0);
  const [showChapterPopup, setShowChapterPopup] = useState<boolean>(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const teacherId = getUserIdFromToken();

  // Lấy danh sách môn học
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    fetch(`${API_URL}/api/FinalExam/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then((data: Subject[]) => setSubjects(data))
      .catch(() => alert('Không thể tải danh sách môn học'))
      .finally(() => setLoading(false));
  }, [teacherId]);

  // Lấy danh sách kỳ
  useEffect(() => {
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then((data: Semester[]) => setSemesters(data))
      .catch(() => alert('Không thể tải danh sách học kỳ'));
  }, []);

  // Lấy danh sách chương khi chọn môn học
  useEffect(() => {
    if (!selectedSubject) return;
    fetch(`${API_URL}/api/FinalExam/GetAllChapterBySubjectId?subjectId=${selectedSubject.subjectId}`)
      .then(res => res.json())
      .then((data: Chapter[]) => setChapters(data))
      .catch(() => alert('Không thể tải danh sách chương'));
    setSelectedChapters([]);
    setChapterQuestions({});
    setChapterChecks({});
  }, [selectedSubject]);

  // Lấy max số câu hỏi từng level cho từng chương
  const fetchMaxQuestions = async (chapterId: number, levelId: number): Promise<number> => {
    const res = await fetch(`${API_URL}/api/FinalExam/GetFinalQuestionCount?chapterId=${chapterId}&levelId=${levelId}&semesterId=${selectedSemester?.semesterId}`);
    return await res.json();
  };

  // Chọn chương
  const handleSaveChapters = async () => {
    const chaptersSelected = chapters.filter((chap) => chapterChecks[chap.chapterId]);
    const newChapters = chaptersSelected.filter(
      (chap) => !selectedChapters.some((selected) => selected.chapterId === chap.chapterId)
    );
    const newChapterQuestions = { ...chapterQuestions };
    
    setLoading(true);
    try {
      for (const chap of newChapters) {
        const max: ChapterQuestion["max"] = { easy: 0, medium: 0, hard: 0 };
        for (const lv of LEVELS) {
          max[lv.key] = await fetchMaxQuestions(chap.chapterId, lv.id);
        }
        newChapterQuestions[chap.chapterId] = { easy: 0, medium: 0, hard: 0, max };
      }
      setSelectedChapters([...selectedChapters, ...newChapters]);
      setChapterQuestions(newChapterQuestions);
      setShowChapterPopup(false);
      setChapterChecks({});
    } catch (error) {
      alert('Có lỗi xảy ra khi tải thông tin câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  // Xóa chương đã chọn
  const handleRemoveChapter = (id: number) => {
    setSelectedChapters((prev) => prev.filter((c) => c.chapterId !== id));
    setChapterQuestions((prev) => {
      const newQ = { ...prev };
      delete newQ[id];
      return newQ;
    });
  };

  // Đổi số câu hỏi cho chương và level
  const handleChangeQuestionCount = (chapterId: number, level: Level, value: number) => {
    setChapterQuestions((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [level]: Math.max(0, Math.min(value, prev[chapterId].max[level])),
        max: prev[chapterId].max,
      },
    }));
  };

  // Tổng số câu hỏi đã chọn
  const totalQuestions = Object.values(chapterQuestions).reduce(
    (sum, q) => sum + (q.easy || 0) + (q.medium || 0) + (q.hard || 0),
    0
  );

  // Submit
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!examName || !selectedSubject || !selectedSemester || selectedChapters.length === 0) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    if (questionInput > 0 && totalQuestions !== questionInput) {
      alert("Tổng số câu đã chọn phải bằng số câu hỏi yêu cầu!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const noQuestionInChapterDTO: {
        numberQuestion: number;
        chapterId: number;
        levelQuestionId: number;
      }[] = [];
      
      selectedChapters.forEach((chap) => {
        LEVELS.forEach((lv) => {
          const num = chapterQuestions[chap.chapterId]?.[lv.key] || 0;
          if (num > 0) {
            noQuestionInChapterDTO.push({
              numberQuestion: num,
              chapterId: chap.chapterId,
              levelQuestionId: lv.id,
            });
          }
        });
      });
      
      const payload = {
        multiExamName: examName,
        numberQuestion: totalQuestions,
        createAt: now,
        teacherId,
        subjectId: selectedSubject.subjectId,
        semesterId: selectedSemester.semesterId,
        noQuestionInChapterDTO,
      };
      
      const res = await fetch(`${API_URL}/api/FinalExam/CreateFinalMultipleExam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert("Tạo bài kiểm tra thành công!");
        router.push("/teacher/finalexam");
      } else {
        alert("Tạo bài kiểm tra thất bại!");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo bài kiểm tra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chọn tất cả chương
  const handleCheckAllChapters = () => {
    const allChecked: Record<number, boolean> = {};
    chapters
      .filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      )
      .forEach((chap) => {
        allChecked[chap.chapterId] = true;
      });
    setChapterChecks(allChecked);
  };

  const handleUncheckAllChapters = () => {
    setChapterChecks({});
  };

  // Dropdown môn học
  const subjectOptions = subjects.map(s => ({
    value: s.subjectId,
    label: s.subjectName,
    ...s,
  }));

  // Dropdown kỳ
  const semesterOptions = semesters.map(s => ({
    value: s.semesterId,
    label: s.semesterName,
    ...s,
  }));

  // Statistics for selected chapters
  const easyTotal = Object.values(chapterQuestions).reduce((sum, q) => sum + (q.easy || 0), 0);
  const mediumTotal = Object.values(chapterQuestions).reduce((sum, q) => sum + (q.medium || 0), 0);
  const hardTotal = Object.values(chapterQuestions).reduce((sum, q) => sum + (q.hard || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo bài thi trắc nghiệm cuối kỳ</h1>
                <p className="text-gray-600">Thiết lập và cấu hình bài thi trắc nghiệm theo chương</p>
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
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Nhập tên bài kiểm tra"
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
                  onChange={option => {
                    setSelectedSubject(option as Subject);
                    setSelectedChapters([]);
                    setChapterQuestions({});
                    setChapterChecks({});
                  }}
                  placeholder="Chọn môn học"
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
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
                  onChange={option => setSelectedSemester(option as Semester)}
                  placeholder="Chọn học kỳ"
                  isSearchable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    }),
                    menu: (provided) => ({ ...provided, zIndex: 20 }),
                  }}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số câu hỏi <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={questionInput}
                  onChange={(e) => setQuestionInput(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Nhập số câu hỏi"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => setShowChapterPopup(true)}
                disabled={!selectedSubject || !selectedSemester}
              >
                <Plus className="w-4 h-4" />
                <span>Chọn chương</span>
              </button>
            </div>
          </div>

          {/* Statistics */}
          {selectedChapters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                    <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Câu dễ</p>
                    <p className="text-2xl font-bold text-green-600">{easyTotal}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Câu trung bình</p>
                    <p className="text-2xl font-bold text-yellow-600">{mediumTotal}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Câu khó</p>
                    <p className="text-2xl font-bold text-red-600">{hardTotal}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chapter Selection Table */}
          {selectedChapters.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Phân bổ câu hỏi theo chương ({selectedChapters.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên chương
                      </th>
                      {LEVELS.map(lv => (
                        <th key={lv.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${lv.bgColor} ${lv.color}`}>
                            {lv.label}
                          </span>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedChapters.map((chap) => (
                      <tr key={chap.chapterId} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">{chap.chapterName}</div>
                          </div>
                        </td>
                        {LEVELS.map(lv => (
                          <td key={lv.key} className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <input
                                type="number"
                                min={0}
                                max={chapterQuestions[chap.chapterId]?.max?.[lv.key] ?? 0}
                                value={chapterQuestions[chap.chapterId]?.[lv.key] ?? 0}
                                onChange={(e) =>
                                  handleChangeQuestionCount(
                                    chap.chapterId,
                                    lv.key,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                                disabled={chapterQuestions[chap.chapterId]?.max?.[lv.key] === 0}
                              />
                              <span className="text-xs text-gray-500">
                                / {chapterQuestions[chap.chapterId]?.max?.[lv.key] ?? 0}
                              </span>
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveChapter(chap.chapterId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa chương"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-900">
                      Tổng số câu đã chọn: <span className="text-blue-600 font-bold">{totalQuestions}</span>
                      {questionInput > 0 && (
                        <span className="text-gray-600"> / {questionInput}</span>
                      )}
                    </div>
                    {questionInput > 0 && totalQuestions !== questionInput && (
                      <div className="text-sm text-red-600 font-medium">
                        ⚠️ Số câu chưa đúng yêu cầu
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !examName || !selectedSubject || !selectedSemester || selectedChapters.length === 0 || (questionInput > 0 && totalQuestions !== questionInput)}
                    className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Tạo bài thi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Chapter Selection Modal */}
        {showChapterPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Chọn chương học
                  </h3>
                  <button
                    onClick={() => setShowChapterPopup(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllChapters}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleUncheckAllChapters}
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chương</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chapters.map((chap, idx) => {
                        const checked =
                          chapterChecks[chap.chapterId] !== undefined
                            ? chapterChecks[chap.chapterId]
                            : selectedChapters.some((selected) => selected.chapterId === chap.chapterId);
                        const isAlreadySelected = selectedChapters.some((selected) => selected.chapterId === chap.chapterId);
                        
                        return (
                          <tr 
                            key={chap.chapterId} 
                            className={`hover:bg-gray-50 transition-colors duration-200 ${isAlreadySelected ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{chap.chapterName}</div>
                                  {isAlreadySelected && (
                                    <div className="text-xs text-blue-600">Đã được chọn</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isAlreadySelected}
                                onChange={(e) =>
                                  setChapterChecks((prev) => ({
                                    ...prev,
                                    [chap.chapterId]: e.target.checked,
                                  }))
                                }
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowChapterPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChapters}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Lưu chương</span>
                      </>
                    )}
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