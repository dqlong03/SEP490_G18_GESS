"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Users, Clock, Settings, ChevronLeft, Save, Plus, Trash2, X, Check } from "lucide-react";

const API_URL = "https://localhost:7074";

export default function UpdateMCQExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);

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
  const [classId, setClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    setTeacherId(getUserIdFromToken() || "");
    if (!examId) return;
    setLoading(true);
    fetch(`${API_URL}/api/MultipleExam/get-for-update/${examId}`)
      .then(res => res.json())
      .then(async data => {
        setExamName(data.multiExamName || "");
        setDuration(data.duration || 60);
        setStartDate(data.startDay ? data.startDay.slice(0, 16) : "");
        setEndDate(data.endDay ? data.endDay.slice(0, 16) : "");
        setSelectedGradeComponent({
          value: data.categoryExamId,
          label: "",
        });
        setSemesterId(data.semesterId);
        setIsPublic(data.isPublish);
        setQuestionBankType(data.questionBankType || "all");
        setClassId(data.classId);
        setSubjectId(data.subjectId);
        setSelectedStudents((data.studentExamDTO || []).map((s: any) => ({
          studentId: s.studentId
        })));
        
        // Process chapters and questions
        setSelectedChapters((data.noQuestionInChapterDTO || []).reduce((arr: any[], item: any) => {
          if (!arr.some((c: any) => c.chapterId === item.chapterId)) {
            arr.push({ chapterId: item.chapterId, chapterName: item.chapterName });
          }
          return arr;
        }, []));
        
        const chapterQ: Record<number, any> = {};
        for (const item of (data.noQuestionInChapterDTO || [])) {
          if (!chapterQ[item.chapterId]) {
            chapterQ[item.chapterId] = { easy: 0, medium: 0, hard: 0, max: { easy: 0, medium: 0, hard: 0 } };
          }
          if (item.levelQuestionId === 1) chapterQ[item.chapterId].easy = item.numberQuestion;
          if (item.levelQuestionId === 2) chapterQ[item.chapterId].medium = item.numberQuestion;
          if (item.levelQuestionId === 3) chapterQ[item.chapterId].hard = item.numberQuestion;
        }
        
        for (const chapId of Object.keys(chapterQ)) {
          const easy = await fetchQuestionCount(Number(chapId), "easy");
          const medium = await fetchQuestionCount(Number(chapId), "medium");
          const hard = await fetchQuestionCount(Number(chapId), "hard");
          chapterQ[chapId].max = { easy, medium, hard };
        }
        setChapterQuestions(chapterQ);
        setQuestionInput(data.numberQuestion || 0);
      })
      .finally(() => setLoading(false));
  }, [examId]);

  // Lấy dữ liệu phụ thuộc classId
  useEffect(() => {
    if (!classId) return;
    fetch(`${API_URL}/api/Class/${classId}/grade-components`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((g: any) => ({
          value: g.categoryExamId,
          label: g.categoryExamName
        }));
        setGradeComponents(mapped);

        setSelectedGradeComponent((prev: any) => {
          if (prev && prev.value) {
            const found = mapped.find((g: any) => g.value === prev.value);
            return found || null;
          }
          return null;
        });
      });
    
    fetch(`${API_URL}/api/Class/${classId}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data);
        setSelectedChapters((prev: any[]) => {
          if (!prev.length) return prev;
          return prev.map((item) => {
            const found = data.find((c: any) => c.chapterId === item.chapterId);
            return found
              ? { chapterId: item.chapterId, chapterName: found.chapterName }
              : item;
          });
        });
      });

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !selectedGradeComponent || !startDate || !endDate || !duration || !semesterId || !teacherId) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    if (questionInput > 0 && totalQuestions !== questionInput) {
      alert("Tổng số câu đã chọn phải bằng số câu hỏi yêu cầu!");
      return;
    }
    const payload = {
      MultiExamId: examId,
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
      const res = await fetch(`${API_URL}/api/MultipleExam/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Cập nhật bài kiểm tra thành công!");
        router.push(`/teacher/myclass/classdetail/${classId?.toString()}`);
      } else {
        alert("Cập nhật bài kiểm tra thất bại!");
      }
    } catch {
      alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cập nhật bài kiểm tra trắc nghiệm</h1>
                <p className="text-gray-600">Chỉnh sửa thông tin và cấu hình bài kiểm tra</p>
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

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
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
                  Đầu điểm <span className="text-red-500">*</span>
                </label>
                <Select
                  options={gradeComponents}
                  value={selectedGradeComponent}
                  onChange={setSelectedGradeComponent}
                  isClearable={false}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Chọn đầu điểm"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '48px',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng (phút) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="60"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nguồn câu hỏi
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={questionBankType}
                  onChange={e => setQuestionBankType(e.target.value as "all" | "common" | "private")}
                >
                  <option value="all">Cả hai (chung & riêng)</option>
                  <option value="common">Chỉ bank chung</option>
                  <option value="private">Chỉ bank riêng</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Lưu public</span>
                </label>
              </div>
            </div>
          </div>

          {/* Students Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Sinh viên tham gia
              </h3>
              <button
                type="button"
                onClick={handleOpenStudentPopup}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Chọn sinh viên</span>
              </button>
            </div>
            
            {selectedStudents.length > 0 ? (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  Đã chọn {selectedStudents.length} sinh viên
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Chưa chọn sinh viên nào</p>
              </div>
            )}
          </div>

          {/* Question Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Cấu hình câu hỏi
              </h3>
              <button
                type="button"
                onClick={() => setShowChapterPopup(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Chọn chương</span>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng số câu hỏi <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={questionInput}
                onChange={(e) => setQuestionInput(Number(e.target.value))}
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập số câu hỏi"
                required
              />
            </div>

            {/* Selected Chapters Table */}
            {selectedChapters.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chương</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu dễ</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu trung bình</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Câu khó</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedChapters.map((chap: any) => (
                      <tr key={chap.chapterId} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{chap.chapterName}</div>
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
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={chapterQuestions[chap.chapterId]?.max?.easy === 0}
                            />
                            <span className="text-xs text-gray-500">
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
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={chapterQuestions[chap.chapterId]?.max?.medium === 0}
                            />
                            <span className="text-xs text-gray-500">
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
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={chapterQuestions[chap.chapterId]?.max?.hard === 0}
                            />
                            <span className="text-xs text-gray-500">
                              / {chapterQuestions[chap.chapterId]?.max?.hard ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveChapter(chap.chapterId)}
                            className="inline-flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    Tổng số câu đã chọn:{" "}
                    <span className="text-blue-600">{totalQuestions}</span>
                    {questionInput > 0 && (
                      <span className="text-gray-600 ml-2">/ {questionInput}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    <span>Cập nhật bài kiểm tra</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Student Selection Modal */}
        {showStudentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Chọn sinh viên tham gia</h3>
                <button
                  onClick={() => setShowStudentPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleCheckAllStudents}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUncheckAllStudents}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((sv: any, idx: number) => (
                        <tr key={sv.studentId} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sv.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sv.fullName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) =>
                                handleCheckStudent(sv.studentId, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Selection Modal */}
        {showChapterPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Chọn chương</h3>
                <button
                  onClick={() => setShowChapterPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleCheckAllChapters}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUncheckAllChapters}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chương</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chương</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chapters
                        .filter(
                          (chap) =>
                            !selectedChapters.some(
                              (selected) => selected.chapterId === chap.chapterId
                            )
                        )
                        .map((chap: any, idx: number) => (
                          <tr key={chap.chapterId} className="hover:bg-blue-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Chương {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{chap.chapterName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={!!chapterChecks[chap.chapterId]}
                                onChange={(e) =>
                                  setChapterChecks((prev) => ({
                                    ...prev,
                                    [chap.chapterId]: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowChapterPopup(false)}
                    className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChapters}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu</span>
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