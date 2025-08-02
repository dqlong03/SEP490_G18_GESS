'use client';

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useRouter } from "next/navigation";

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
const LEVELS: { key: Level; label: string; id: number }[] = [
  { key: "easy", label: "Dễ", id: 1 },
  { key: "medium", label: "Trung bình", id: 2 },
  { key: "hard", label: "Khó", id: 3 },
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

  const teacherId = getUserIdFromToken();

  // Lấy danh sách môn học
  useEffect(() => {
    if (!teacherId) return;
    fetch(`${API_URL}/api/FinalExam/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then((data: Subject[]) => setSubjects(data));
  }, [teacherId]);

  // Lấy danh sách kỳ
  useEffect(() => {
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then((data: Semester[]) => setSemesters(data));
  }, []);

  // Lấy danh sách chương khi chọn môn học
  useEffect(() => {
    if (!selectedSubject) return;
    fetch(`${API_URL}/api/FinalExam/GetAllChapterBySubjectId?subjectId=${selectedSubject.subjectId}`)
      .then(res => res.json())
      .then((data: Chapter[]) => setChapters(data));
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

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">
          Tạo bài kiểm tra trắc nghiệm cuối kỳ
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-gray-700">Tên bài kiểm tra</label>
              <input
                type="text"
                value={examName}
                onChange={e => setExamName(e.target.value)}
                className="border rounded px-3 py-2 w-64"
                placeholder="Tên bài kiểm tra"
                required
              />
            </div>
            <div className="flex flex-col w-64">
              <label className="mb-1 font-semibold text-gray-700">Chọn môn học</label>
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
              />
            </div>
            <div className="flex flex-col w-44">
              <label className="mb-1 font-semibold text-gray-700">Chọn kỳ</label>
              <Select
                options={semesterOptions}
                value={selectedSemester ? semesterOptions.find(s => s.value === selectedSemester.semesterId) : null}
                onChange={option => setSelectedSemester(option as Semester)}
                placeholder="Chọn kỳ"
                isSearchable
              />
            </div>
            <div className="flex flex-col w-44">
              <label className="mb-1 font-semibold text-gray-700">Nhập số câu hỏi</label>
              <input
                type="number"
                min={1}
                value={questionInput}
                onChange={(e) => setQuestionInput(Number(e.target.value))}
                className="border rounded px-3 py-2 w-full"
                placeholder="Nhập số câu hỏi"
                required
              />
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold self-end"
              onClick={() => setShowChapterPopup(true)}
              disabled={!selectedSubject}
            >
              Chọn chương
            </button>
          </div>

          {/* Popup chọn chương */}
          {showChapterPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative animate-popup">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setShowChapterPopup(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Chọn chương
                </h3>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition font-semibold"
                    onClick={handleCheckAllChapters}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 transition font-semibold"
                    onClick={handleUncheckAllChapters}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
                <div className="overflow-x-auto rounded shadow bg-white mb-4">
                  <table className="min-w-[500px] w-full text-sm md:text-base border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-semibold">
                        <th className="py-2 px-2 border-b w-20 text-center">Chương</th>
                        <th className="py-2 px-2 border-b w-56 text-left">Tên chương</th>
                        <th className="py-2 px-2 border-b w-20 text-center">Chọn</th>
                      </tr>
                    </thead>
                      <tbody>
                        {chapters.map((chap, idx) => {
                          const checked =
                            chapterChecks[chap.chapterId] !== undefined
                              ? chapterChecks[chap.chapterId]
                              : selectedChapters.some((selected) => selected.chapterId === chap.chapterId);
                          return (
                            <tr key={chap.chapterId} className="hover:bg-blue-50 transition">
                              <td className="py-2 px-2 border-b text-center">
                                Chương {idx + 1}
                              </td>
                              <td className="py-2 px-2 border-b">{chap.chapterName}</td>
                              <td className="py-2 px-2 border-b text-center">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) =>
                                    setChapterChecks((prev) => ({
                                      ...prev,
                                      [chap.chapterId]: e.target.checked,
                                    }))
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveChapters}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bảng chương đã chọn */}
          {selectedChapters.length > 0 && (
            <div className="overflow-x-auto rounded shadow bg-white mt-6 w-full">
              <table className="min-w-[700px] w-full text-sm md:text-base border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-semibold">
                    <th className="py-2 px-2 border-b w-56 text-left">Tên chương</th>
                    {LEVELS.map(lv => (
                      <th key={lv.key} className="py-2 px-2 border-b w-32 text-center">
                        Số câu {lv.label}
                      </th>
                    ))}
                    <th className="py-2 px-2 border-b w-20 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChapters.map((chap) => (
                    <tr key={chap.chapterId} className="hover:bg-blue-50 transition">
                      <td className="py-2 px-2 border-b">{chap.chapterName}</td>
                      {LEVELS.map(lv => (
                        <td key={lv.key} className="py-2 px-2 border-b text-center">
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
                            className="border rounded px-2 py-1 w-20 text-center"
                            disabled={chapterQuestions[chap.chapterId]?.max?.[lv.key] === 0}
                            placeholder={`Số câu ${lv.label}`}
                          />
                          <span className="ml-2 text-gray-500 text-xs">
                            / {chapterQuestions[chap.chapterId]?.max?.[lv.key] ?? 0}
                          </span>
                        </td>
                      ))}
                      <td className="py-2 px-2 border-b text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveChapter(chap.chapterId)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center">
                <div className="font-semibold text-base">
                  Tổng số câu đã chọn:{" "}
                  <span className="text-blue-700">{totalQuestions}</span>
                  {questionInput > 0 && (
                    <span className="ml-2 text-gray-600">
                      / {questionInput}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-20 py-2 rounded hover:bg-blue-700 transition font-semibold items-center mb-4"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.2s }
        @keyframes popup {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        .animate-popup { animation: popup 0.2s }
      `}</style>
    </div>
  );
}