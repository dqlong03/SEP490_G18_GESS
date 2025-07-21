'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';

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

const pageSize = 5;

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
    // Build params
    const params = new URLSearchParams();
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedCategory) params.append('headId', selectedCategory.value); // Nếu API cần categoryId thì đổi tên param
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
      })
      .catch(() => {
        setQuestions([]);
        setTotalPages(1);
      });
  }, [selectedSubject, selectedCategory, selectedType, selectedLevel, selectedChapter, page]);

  // Tạo câu hỏi: truyền toàn bộ filter sang trang tạo
  const handleCreateQuestion = (type: 'multiple' | 'essay') => {
    if (!selectedChapter || !selectedCategory) {
      alert('Vui lòng chọn chương và đầu điểm trước khi tạo câu hỏi!');
      return;
    }
    // Build query string với tất cả filter hiện có
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
  const answerChar = (idx: number) => String.fromCharCode(65 + idx); // A, B, C, D, ...

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-gray-800 text-left">Ngân hàng câu hỏi</h2>
          <div className="relative">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
              onClick={() => {
                const menu = document.getElementById('create-question-menu');
                if (menu) menu.classList.toggle('hidden');
              }}
              type="button"
            >
              + Tạo câu hỏi
            </button>
            <div
              id="create-question-menu"
              className="hidden absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50"
            >
              <button
                className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                onClick={() => handleCreateQuestion('multiple')}
                type="button"
              >
                Tạo câu hỏi trắc nghiệm
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                onClick={() => handleCreateQuestion('essay')}
                type="button"
              >
                Tạo câu hỏi tự luận
              </button>
            </div>
          </div>
        </div>
        {/* Bộ lọc */}
        <form
          onSubmit={e => { e.preventDefault(); setPage(1); }}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-8"
        >
          <div className="relative w-44 z-20">
            <Select
              options={subjects}
              value={selectedSubject}
              onChange={option => { setSelectedSubject(option); setPage(1); }}
              placeholder="Chọn môn học"
              isClearable
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <div className="relative w-44 z-20">
            <Select
              options={categories}
              value={selectedCategory}
              onChange={option => { setSelectedCategory(option); setPage(1); }}
              placeholder="Chọn đầu điểm"
              isClearable
              isSearchable={false}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <div className="relative w-44 z-20">
            <Select
              options={types}
              value={selectedType}
              onChange={option => { setSelectedType(option); setPage(1); }}
              placeholder="Loại câu hỏi"
              isClearable
              isSearchable={false}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <div className="relative w-44 z-20">
            <Select
              options={levels}
              value={selectedLevel}
              onChange={option => { setSelectedLevel(option); setPage(1); }}
              placeholder="Độ khó"
              isClearable
              isSearchable={false}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <div className="relative w-44 z-20">
            <Select
              options={chapters}
              value={selectedChapter}
              onChange={option => { setSelectedChapter(option); setPage(1); }}
              placeholder="Chương"
              isClearable
              isSearchable={false}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 20 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleResetFilter}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
        </form>
        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white" style={{ maxWidth: '100%' }}>
          <table className="min-w-[700px] w-full text-sm md:text-base border border-gray-200 table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-14 text-center">STT</th>
                <th className="py-2 px-2 border-b w-64 text-left">Nội dung câu hỏi</th>
                <th className="py-2 px-2 border-b w-24 text-center">Loại</th>
                <th className="py-2 px-2 border-b w-24 text-center">Độ khó</th>
                <th className="py-2 px-2 border-b w-24 text-center">Chương</th>
                <th className="py-2 px-2 border-b w-80 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {questions.length > 0 ? questions.map((q, idx) => (
                <tr key={q.questionId + '-' + q.questionType + '-' + idx} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{q.content}</td>
                  <td className="py-2 px-2 border-b text-center">
                    {q.questionType}
                  </td>
                  <td className="py-2 px-2 border-b text-center">{q.level}</td>
                  <td className="py-2 px-2 border-b text-center">{q.chapter}</td>
                  <td className="py-2 px-2 border-b text-left">
                    {q.questionType === 'Trắc nghiệm' ? (
                      <div>
                        <div className="font-semibold">Đáp án:</div>
                        <ul className="list-none ml-0">
                          {q.answers && q.answers.map((a: any, i: number) => (
                            <li key={i} className={a.isCorrect ? 'text-green-700 font-semibold' : ''}>
                              <span className="inline-block w-6">{answerChar(i)}.</span> {a.content} {a.isCorrect && <span>(Đúng)</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold">Tiêu chí chấm:</div>
                        <div>{q.answers && q.answers[0]?.content}</div>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có câu hỏi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-4 flex flex-wrap justify-left items-center gap-2 text-base ">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="mx-2 font-semibold">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
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
        .table-fixed {
          table-layout: fixed;
        }
      `}</style>
      {/* Đóng menu khi click ngoài */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('click', function(e) {
              const menu = document.getElementById('create-question-menu');
              if (menu && !menu.contains(e.target) && !e.target.closest('button.bg-blue-600')) {
                menu.classList.add('hidden');
              }
            });
          `,
        }}
      />
    </div>
  );
}