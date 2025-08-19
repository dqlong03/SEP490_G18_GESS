"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useParams, useRouter } from 'next/navigation';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  FileText, 
  Plus, 
  Search,
  Trash2,
  Save,
  X,
  ChevronLeft,
  Settings,
  BookOpen,
  Target,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Hash,
  Star,
  BarChart3,
  Database
} from 'lucide-react';

const API_URL = "https://localhost:7074";

export default function CreateMCQExamPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.classId);

  // State
  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState("");     
  const [gradeComponents, setGradeComponents] = useState<any[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [showChapterPopup, setShowChapterPopup] = useState(false);
  const [chapterChecks, setChapterChecks] = useState<Record<number, boolean>>({});
  const [selectedChapters, setSelectedChapters] = useState<any[]>([]);
  const [chapterQuestions, setChapterQuestions] = useState<Record<
    number,
    { easy: number; medium: number; hard: number; max: { easy: number; medium: number; hard: number } }
  >>({});
  const [students, setStudents] = useState<any[]>([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [questionInput, setQuestionInput] = useState<number>(0);
  const [isPublic, setIsPublic] = useState(true);
  const [questionBankType, setQuestionBankType] = useState<"all" | "common" | "private">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTeacherId(getUserIdFromToken() || "");
    fetch(`${API_URL}/api/Class/${classId}/semester-id`)
      .then(res => res.json())
      .then(data => setSemesterId(data));
    fetch(`${API_URL}/api/Class/${classId}/grade-components`)
      .then(res => res.json())
      .then(data => setGradeComponents(data.map((g: any) => ({
        value: g.categoryExamId,
        label: g.categoryExamName
      }))));
    fetch(`${API_URL}/api/Class/${classId}/chapters`)
      .then(res => res.json())
      .then(data => setChapters(data));
    fetch(`${API_URL}/api/Class/${classId}/students`)
      .then(res => res.json())
      .then(data => setStudents(data));
    fetch(`${API_URL}/api/Class/${classId}/subject-id`)
      .then(res => res.json())
      .then(data => setSubjectId(data));
  }, [classId]);

  const fetchQuestionCount = async (
    chapterId: number,
    level: "easy" | "medium" | "hard"
  ) => {
    const levelId = level === "easy" ? 1 : level === "medium" ? 2 : 3;
    let url = `${API_URL}/api/MultipleExam/question-count?chapterId=${chapterId}&levelId=${levelId}`;
    if (questionBankType === "common") {
      url += "&isPublic=true";
    } else if (questionBankType === "private") {
      url += "&isPublic=false";
      const teacherId = getUserIdFromToken();
      if (teacherId) {
        url += `&teacherId=${teacherId}`;
      }
    }
    const res = await fetch(url);
    return await res.json();
  };

  const handleSaveChapters = async () => {
    const chaptersSelected = chapters.filter((chap) => chapterChecks[chap.chapterId]);
    const newChapterQuestions: Record<number, any> = { ...chapterQuestions };
    for (const chap of chaptersSelected) {
      if (!newChapterQuestions[chap.chapterId]) {
        const easy = await fetchQuestionCount(chap.chapterId, "easy");
        const medium = await fetchQuestionCount(chap.chapterId, "medium");
        const hard = await fetchQuestionCount(chap.chapterId, "hard");
        newChapterQuestions[chap.chapterId] = {
          easy: 0,
          medium: 0,
          hard: 0,
          max: { easy, medium, hard },
        };
      }
    }
    setSelectedChapters([
      ...selectedChapters,
      ...chaptersSelected.filter(
        (chap) => !selectedChapters.some((selected) => selected.chapterId === chap.chapterId)
      ),
    ]);
    setChapterQuestions(newChapterQuestions);
    setShowChapterPopup(false);
  };

  const handleRemoveChapter = (id: number) => {
    setSelectedChapters((prev) => prev.filter((c) => c.chapterId !== id));
    setChapterQuestions((prev) => {
      const newQ = { ...prev };
      delete newQ[id];
      return newQ;
    });
    setChapterChecks((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const handleChangeQuestionCount = (
    chapterId: number,
    type: "easy" | "medium" | "hard",
    value: number
  ) => {
    setChapterQuestions((prev) => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [type]: Math.max(0, Math.min(value, prev[chapterId].max[type])),
        max: prev[chapterId].max,
      },
    }));
  };

  const totalQuestions = Object.values(chapterQuestions).reduce(
    (sum, q) => sum + (q.easy || 0) + (q.medium || 0) + (q.hard || 0),
    0
  );

  const handleOpenStudentPopup = () => {
    setShowStudentPopup(true);
  };

  const handleCheckStudent = (id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllStudents = () => {
    const allChecked: Record<string, boolean> = {};
    students.forEach((sv: any) => {
      allChecked[sv.studentId] = true;
    });
    setStudentChecks(allChecked);
  };

  const handleUncheckAllStudents = () => {
    setStudentChecks({});
  };

  const handleConfirmStudents = () => {
    setSelectedStudents(
      students.filter((sv) => studentChecks[sv.studentId])
    );
    setShowStudentPopup(false);
  };

  const handleCheckAllChapters = () => {
    const allChecked: Record<number, boolean> = {};
    chapters
      .filter(
        (chap) =>
          !selectedChapters.some(
            (selected) => selected.chapterId === chap.chapterId
          )
      )
      .forEach((chap: any) => {
        allChecked[chap.chapterId] = true;
      });
    setChapterChecks(allChecked);
  };

  const handleUncheckAllChapters = () => {
    setChapterChecks({});
  };

  const buildNoQuestionInChapterDTO = () => {
    const arr: { numberQuestion: number; chapterId: number; levelQuestionId: number }[] = [];
    selectedChapters.forEach((chap: any) => {
      if (chapterQuestions[chap.chapterId]?.easy > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].easy,
          chapterId: chap.chapterId,
          levelQuestionId: 1,
        });
      }
      if (chapterQuestions[chap.chapterId]?.medium > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].medium,
          chapterId: chap.chapterId,
          levelQuestionId: 2,
        });
      }
      if (chapterQuestions[chap.chapterId]?.hard > 0) {
        arr.push({
          numberQuestion: chapterQuestions[chap.chapterId].hard,
          chapterId: chap.chapterId,
          levelQuestionId: 3,
        });
      }
    });
    return arr;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !selectedGradeComponent || !startDate || !endDate || !duration || !semesterId || !teacherId) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    if (selectedStudents.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sinh viên!");
      return;
    }
    if (questionInput > 0 && totalQuestions !== questionInput) {
      alert("Tổng số câu đã chọn phải bằng số câu hỏi yêu cầu!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      MultiExamName: examName,
      NumberQuestion: totalQuestions,
      Duration: duration,
      StartDay: startDate,
      EndDay: endDate,
      CreateAt: new Date().toISOString(),
      teacherId,
      subjectId,
      classId,
      categoryExamId: selectedGradeComponent.value,
      semesterId,
      isPublish: isPublic,
      questionBankType,
      noQuestionInChapterDTO: buildNoQuestionInChapterDTO(),
      studentExamDTO: selectedStudents.map((sv: any) => ({
        studentId: sv.studentId
      })),
    };
    
    try {
      const res = await fetch(`${API_URL}/api/MultipleExam/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Tạo bài kiểm tra thành công!");
        router.push(`/teacher/myclass/classdetail/${classId.toString()}`);
      } else {
        alert("Tạo bài kiểm tra thất bại!");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo bài kiểm tra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateChapterMaxQuestions = async () => {
    const newChapterQuestions: Record<number, any> = { ...chapterQuestions };
    for (const chap of selectedChapters) {
      const easy = await fetchQuestionCount(chap.chapterId, "easy");
      const medium = await fetchQuestionCount(chap.chapterId, "medium");
      const hard = await fetchQuestionCount(chap.chapterId, "hard");
      newChapterQuestions[chap.chapterId] = {
        ...newChapterQuestions[chap.chapterId],
        max: { easy, medium, hard },
        easy: Math.min(newChapterQuestions[chap.chapterId]?.easy ?? 0, easy),
        medium: Math.min(newChapterQuestions[chap.chapterId]?.medium ?? 0, medium),
        hard: Math.min(newChapterQuestions[chap.chapterId]?.hard ?? 0, hard),
      };
    }
    setChapterQuestions(newChapterQuestions);
  };

  useEffect(() => {
    if (selectedChapters.length > 0) {
      updateChapterMaxQuestions();
    }
  }, [selectedChapters, questionBankType]);

  // Custom styles cho react-select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '48px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 20,
      borderRadius: '8px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
      }
    })
  };

  const getLevelColor = (level: string) => {
    const colors = {
      easy: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      hard: 'text-red-600 bg-red-50'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo bài kiểm tra trắc nghiệm</h1>
                <p className="text-gray-600">Thiết lập bài kiểm tra và phân công cho sinh viên</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sinh viên đã chọn</p>
                <p className="text-2xl font-bold text-blue-600">{selectedStudents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chương đã chọn</p>
                <p className="text-2xl font-bold text-green-600">{selectedChapters.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng câu hỏi</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Hash className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thời lượng thi</p>
                <p className="text-2xl font-bold text-orange-600">{duration} phút</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
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
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Nhập tên bài kiểm tra"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đầu điểm <span className="text-red-500">*</span>
                </label>
                <Select
                  options={gradeComponents}
                  value={selectedGradeComponent}
                  onChange={setSelectedGradeComponent}
                  placeholder="Chọn đầu điểm"
                  styles={selectStyles}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nguồn câu hỏi
                </label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors appearance-none"
                    value={questionBankType}
                    onChange={e => setQuestionBankType(e.target.value as "all" | "common" | "private")}
                  >
                    <option value="all">Cả hai (chung & riêng)</option>
                    <option value="common">Chỉ bank chung</option>
                    <option value="private">Chỉ bank riêng</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng thi (phút) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Nhập thời lượng"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số câu hỏi mong muốn
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={questionInput}
                    onChange={(e) => setQuestionInput(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Nhập số câu hỏi"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Lưu public</span>
                </label>
              </div>
            </div>
          </div>

          {/* Selection Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Chọn sinh viên
              </h3>
              
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                onClick={handleOpenStudentPopup}
              >
                <Users className="w-4 h-4" />
                <span>Chọn sinh viên tham gia</span>
              </button>
              
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      Đã chọn {selectedStudents.length} sinh viên
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                Chọn chương
              </h3>
              
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                onClick={() => setShowChapterPopup(true)}
              >
                <BookOpen className="w-4 h-4" />
                <span>Chọn chương học</span>
              </button>
              
              {selectedChapters.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Đã chọn {selectedChapters.length} chương
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Chapters Table */}
          {selectedChapters.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Phân bố câu hỏi theo chương ({selectedChapters.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chương</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu dễ</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu trung bình</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu khó</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedChapters.map((chap: any) => (
                      <tr key={chap.chapterId} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{chap.chapterName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min={0}
                              max={chapterQuestions[chap.chapterId]?.max?.easy ?? 0}
                              value={chapterQuestions[chap.chapterId]?.easy ?? 0}
                              onChange={(e) =>
                                handleChangeQuestionCount(
                                  chap.chapterId,
                                  "easy",
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              disabled={chapterQuestions[chap.chapterId]?.max?.easy === 0}
                            />
                            <span className="text-gray-500 text-xs">
                              / {chapterQuestions[chap.chapterId]?.max?.easy ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min={0}
                              max={chapterQuestions[chap.chapterId]?.max?.medium ?? 0}
                              value={chapterQuestions[chap.chapterId]?.medium ?? 0}
                              onChange={(e) =>
                                handleChangeQuestionCount(
                                  chap.chapterId,
                                  "medium",
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                              disabled={chapterQuestions[chap.chapterId]?.max?.medium === 0}
                            />
                            <span className="text-gray-500 text-xs">
                              / {chapterQuestions[chap.chapterId]?.max?.medium ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min={0}
                              max={chapterQuestions[chap.chapterId]?.max?.hard ?? 0}
                              value={chapterQuestions[chap.chapterId]?.hard ?? 0}
                              onChange={(e) =>
                                handleChangeQuestionCount(
                                  chap.chapterId,
                                  "hard",
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              disabled={chapterQuestions[chap.chapterId]?.max?.hard === 0}
                            />
                            <span className="text-gray-500 text-xs">
                              / {chapterQuestions[chap.chapterId]?.max?.hard ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveChapter(chap.chapterId)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
                  <div className="flex items-center space-x-6">
                    <div className="text-sm font-medium text-gray-900">
                      Tổng câu hỏi: <span className="text-purple-600 font-bold">{totalQuestions}</span>
                      {questionInput > 0 && (
                        <span className="text-gray-600 ml-2">/ {questionInput}</span>
                      )}
                    </div>
                    {questionInput > 0 && totalQuestions !== questionInput && (
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Số câu chưa khớp yêu cầu</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !examName || !selectedGradeComponent || !startDate || !endDate || !duration || selectedStudents.length === 0}
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
                        <span>Tạo bài kiểm tra</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button for Empty State */}
          {selectedChapters.length === 0 && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !examName || !selectedGradeComponent || !startDate || !endDate || !duration || selectedStudents.length === 0}
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
                    <span>Tạo bài kiểm tra</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Student Selection Modal */}
        {showStudentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Danh sách sinh viên trong lớp
                  </h3>
                  <button
                    onClick={() => setShowStudentPopup(false)}
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
                    onClick={handleCheckAllStudents}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleUncheckAllStudents}
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((sv, idx) => (
                        <tr key={sv.studentId} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) => handleCheckStudent(sv.studentId, e.target.checked)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Selection Modal */}
        {showChapterPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Danh sách chương học
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
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllChapters}
                  >
                    <CheckCircle2 className="w-4 h-4" />
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
                
                <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chương</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chương</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chapters.map((chap: any, idx: number) => {
                        const checked =
                          chapterChecks[chap.chapterId] !== undefined
                            ? chapterChecks[chap.chapterId]
                            : selectedChapters.some((selected) => selected.chapterId === chap.chapterId);
                        return (
                          <tr key={chap.chapterId} className="hover:bg-green-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-bold text-green-600">{idx + 1}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Chương {idx + 1}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{chap.chapterName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setChapterChecks((prev) => ({
                                    ...prev,
                                    [chap.chapterId]: e.target.checked,
                                  }))
                                }
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
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
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu chương đã chọn</span>
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