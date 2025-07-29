"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useParams, useRouter } from 'next/navigation';



const API_URL = "https://localhost:7074";

export default function CreateMCQExamPage() {
  const params = useParams();
  const router = useRouter();
  const classId = Number(params.classId);

  // State
  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [startDate, setStartDate] = useState(""); // Ngày giờ bắt đầu
  const [endDate, setEndDate] = useState("");     // Ngày giờ kết thúc
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
  const [questionInput, setQuestionInput] = useState<number>(0); // Số câu hỏi nhập vào
  const [isPublic, setIsPublic] = useState(true); // Lưu public hay không
  const [questionBankType, setQuestionBankType] = useState<"all" | "common" | "private">("all"); // Loại bank câu hỏi

  useEffect(() => {
    setTeacherId(getUserIdFromToken() || "");
    fetch(`${API_URL}/api/Semesters/CurrentSemester`)
      .then(res => res.json())
      .then(data => setSemesterId(data[0]?.semesterId));
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
    // Thêm isPublic nếu chọn bank chung hoặc riêng
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
      .forEach((chap: any) => {
        allChecked[chap.chapterId] = true;
      });
    setChapterChecks(allChecked);
  };

  const handleUncheckAllChapters = () => {
    setChapterChecks({});
  };

  // Tạo mảng noQuestionInChapterDTO
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

  // Submit
  const handleSave = async (e: React.FormEvent) => {
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
      MultiExamName: examName,
      NumberQuestion: totalQuestions,
      Duration:duration,
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
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">
          Tạo bài kiểm tra trắc nghiệm
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          {/* Filter & Info */}
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
            <div className="flex flex-col w-44">
              <label className="mb-1 font-semibold text-gray-700">Chọn đầu điểm</label>
              <Select
                options={gradeComponents}
                value={selectedGradeComponent}
                onChange={setSelectedGradeComponent}
                isClearable={false}
                isSearchable={false}
              />
            </div>
            <div className="flex flex-col w-44">
              <label className="mb-1 font-semibold text-gray-700">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div className="flex flex-col w-44">
              <label className="mb-1 font-semibold text-gray-700">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div className="flex flex-col w-32">
              <label className="mb-1 font-semibold text-gray-700">Thời lượng</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="border rounded px-3 py-2 w-full"
                placeholder="Nhập thời lượng (phút)"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="mb-1 font-semibold text-gray-700">Lưu public</label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-5 h-5"
                style={{ marginTop: "7px" }}
              />
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold self-end"
              onClick={handleOpenStudentPopup}
            >
              Chọn sinh viên
            </button>
            {selectedStudents.length > 0 && (
              <span className="text-base text-blue-700 self-end">
                Đã chọn {selectedStudents.length} sinh viên
              </span>
            )}
          </div>

          {/* Dropdown chọn loại bank câu hỏi */}
          <div className="flex flex-col w-64 mb-2">
            <label className="mb-1 font-semibold text-gray-700">Nguồn câu hỏi</label>
            <select
              className="border rounded px-3 py-2"
              value={questionBankType}
              onChange={e => setQuestionBankType(e.target.value as "all" | "common" | "private")}
            >
              <option value="all">Cả hai (chung & riêng)</option>
              <option value="common">Chỉ bank chung</option>
              <option value="private">Chỉ bank riêng</option>
            </select>
          </div>

          {/* Chọn chương và nhập số câu hỏi */}
          <div className="mt-6 flex gap-4 items-center">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
              onClick={() => setShowChapterPopup(true)}
            >
              Chọn chương
            </button>
            <span>Nhập số câu hỏi</span>
            <input
              type="number"
              min={1}
              value={questionInput}
              onChange={(e) => setQuestionInput(Number(e.target.value))}
              className="border rounded px-3 py-2 w-44"
              placeholder="Nhập số câu hỏi"
              required
            />
          </div>

          {/* Popup chọn sinh viên */}
          {showStudentPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative animate-popup">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                  onClick={() => setShowStudentPopup(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Danh sách sinh viên trong lớp
                </h3>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition font-semibold"
                    onClick={handleCheckAllStudents}
                  >
                    Chọn tất cả
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 transition font-semibold"
                    onClick={handleUncheckAllStudents}
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
                <div className="overflow-x-auto rounded shadow bg-white mb-4">
                  <table className="min-w-[500px] w-full text-sm md:text-base border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-semibold">
                        <th className="py-2 px-2 border-b w-10 text-center">STT</th>
                        <th className="py-2 px-2 border-b w-32 text-left">Mã sinh viên</th>
                        <th className="py-2 px-2 border-b w-40 text-left">Họ và tên</th>
                        <th className="py-2 px-2 border-b w-20 text-center">Chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((sv: any, idx: number) => (
                        <tr key={sv.studentId} className="hover:bg-blue-50 transition">
                          <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                          <td className="py-2 px-2 border-b">{sv.code}</td>
                          <td className="py-2 px-2 border-b">{sv.fullName}</td>
                          <td className="py-2 px-2 border-b text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) =>
                                handleCheckStudent(sv.studentId, e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

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
                      {chapters
                        .filter(
                          (chap) =>
                            !selectedChapters.some(
                              (selected) => selected.chapterId === chap.chapterId
                            )
                        )
                        .map((chap: any, idx: number) => (
                          <tr key={chap.chapterId} className="hover:bg-blue-50 transition">
                            <td className="py-2 px-2 border-b text-center">
                              Chương {idx + 1}
                            </td>
                            <td className="py-2 px-2 border-b">{chap.chapterName}</td>
                            <td className="py-2 px-2 border-b text-center">
                              <input
                                type="checkbox"
                                checked={!!chapterChecks[chap.chapterId]}
                                onChange={(e) =>
                                  setChapterChecks((prev) => ({
                                    ...prev,
                                    [chap.chapterId]: e.target.checked,
                                  }))
                                }
                              />
                            </td>
                          </tr>
                        ))}
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
                    <th className="py-2 px-2 border-b w-32 text-center">Số câu dễ</th>
                    <th className="py-2 px-2 border-b w-32 text-center">Số câu trung bình</th>
                    <th className="py-2 px-2 border-b w-32 text-center">Số câu khó</th>
                    <th className="py-2 px-2 border-b w-20 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChapters.map((chap: any) => (
                    <tr key={chap.chapterId} className="hover:bg-blue-50 transition">
                      <td className="py-2 px-2 border-b">{chap.chapterName}</td>
                      <td className="py-2 px-2 border-b text-center">
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
                          className="border rounded px-2 py-1 w-20 text-center"
                          disabled={chapterQuestions[chap.chapterId]?.max?.easy === 0}
                          placeholder="Số câu dễ"
                        />
                        <span className="ml-2 text-gray-500 text-xs">
                          / {chapterQuestions[chap.chapterId]?.max?.easy ?? 0}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-b text-center">
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
                          className="border rounded px-2 py-1 w-20 text-center"
                          disabled={chapterQuestions[chap.chapterId]?.max?.medium === 0}
                          placeholder="Số câu TB"
                        />
                        <span className="ml-2 text-gray-500 text-xs">
                          / {chapterQuestions[chap.chapterId]?.max?.medium ?? 0}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-b text-center">
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
                          className="border rounded px-2 py-1 w-20 text-center"
                          disabled={chapterQuestions[chap.chapterId]?.max?.hard === 0}
                          placeholder="Số câu khó"
                        />
                        <span className="ml-2 text-gray-500 text-xs">
                          / {chapterQuestions[chap.chapterId]?.max?.hard ?? 0}
                        </span>
                      </td>
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
      animate-popup { animation: popup 0.2s }
      `}</style>
    </div>
  );
}