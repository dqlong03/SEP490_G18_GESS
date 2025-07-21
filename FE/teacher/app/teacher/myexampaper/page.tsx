'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

export default function MyEssayExamsPage() {
  const router = useRouter();
  const [searchName, setSearchName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedHead, setSelectedHead] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Đầu điểm (categoryExamName) lấy từ API trả về trong từng đề thi
  const [headOptions, setHeadOptions] = useState<any[]>([]);

  // Lấy danh sách môn học
  useEffect(() => {
    fetch('https://localhost:7074/api/Subject/ListSubject')
      .then(res => res.json())
      .then(data => setSubjects(data || []));
  }, []);

  // Lấy danh sách đề thi tự luận
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchName) params.append('searchName', searchName);
    if (selectedSubject) params.append('subjectId', selectedSubject.value);
    if (selectedSemester) params.append('semesterId', selectedSemester.value);
    if (selectedHead) params.append('categoryExamId', selectedHead.value);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    fetch(`https://localhost:7074/api/PracticeExamPaper/GetAllExamPaperListAsync?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setExams(data || []);
        // Lấy các đầu điểm duy nhất từ dữ liệu trả về
        const heads = Array.from(
          new Set((data || []).map((e: any) => ({
            value: e.categoryExamName,
            label: e.categoryExamName
          })))
        ).filter(h => h.value);
        setHeadOptions(heads);
      })
      .finally(() => setLoading(false));

    // Lấy tổng số trang
    const paramsCount = new URLSearchParams();
    if (searchName) paramsCount.append('name', searchName);
    if (selectedSubject) paramsCount.append('subjectId', selectedSubject.value);
    if (selectedSemester) paramsCount.append('semesterId', selectedSemester.value);
    if (selectedHead) paramsCount.append('categoryExamId', selectedHead.value);
    paramsCount.append('pageSize', pageSize.toString());

    fetch(`https://localhost:7074/api/PracticeExamPaper/CountPages?${paramsCount.toString()}`)
      .then(res => res.json())
      .then(total => setTotalPages(total || 1));
    // eslint-disable-next-line
  }, [searchName, selectedSubject, selectedHead, selectedSemester, page]);

  // Dropdown options
  const subjectOptions = subjects.map((s: any) => ({
    value: s.subjectId,
    label: s.subjectName,
  }));

  // Lấy danh sách kỳ học duy nhất từ dữ liệu trả về
  const semesterOptions = Array.from(
    new Set(exams.map((e: any) => ({
      value: e.semesterName,
      label: e.semesterName
    })))
  ).filter(s => s.value);

  // Xử lý sửa/xóa (để sau)
  const handleEdit = (id: number) => {
    alert(`Sửa đề thi có ID: ${id}`);
  };
  const handleDelete = (id: number) => {
    alert(`Xóa đề thi có ID: ${id}`);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Danh sách đề thi của tôi</h2>
        <form
          onSubmit={e => { e.preventDefault(); setPage(1); }}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-6"
        >
          <input
            type="text"
            placeholder="Tìm theo tên đề thi"
            value={searchName}
            onChange={e => { setSearchName(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-44 h-10"
            style={{
              minHeight: '40px',
              borderColor: '#d1d5db',
              boxShadow: 'none',
            }}
          />
          <div className="relative w-44 z-20">
            <Select
              options={subjectOptions}
              value={selectedSubject}
              onChange={(option) => { setSelectedSubject(option); setPage(1); }}
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
              options={headOptions}
              value={selectedHead}
              onChange={(option) => { setSelectedHead(option); setPage(1); }}
              placeholder="Đầu điểm"
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
              options={semesterOptions}
              value={selectedSemester}
              onChange={(option) => { setSelectedSemester(option); setPage(1); }}
              placeholder="Chọn kỳ"
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
        </form>
        <div className="mb-4">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
            onClick={() => router.push('/teacher/myexampaper/createexampaper')}
          >
            Tạo đề thi
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-[900px] w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-14 text-center">STT</th>
                <th className="py-2 px-2 border-b w-56 text-left">Tên đề</th>
                <th className="py-2 px-2 border-b w-32 text-left">Môn học</th>
                <th className="py-2 px-2 border-b w-32 text-center">Đầu điểm</th>
                <th className="py-2 px-2 border-b w-32 text-center">Ngày tạo</th>
                <th className="py-2 px-2 border-b w-32 text-center">Kỳ</th>
                <th className="py-2 px-2 border-b w-32 text-center">Trạng thái</th>
                <th className="py-2 px-2 border-b w-32 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? exams.map((exam: any, idx: number) => (
                <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{exam.pracExamPaperName}</td>
                  <td className="py-2 px-2 border-b">{exam.subjectName}</td>
                  <td className="py-2 px-2 border-b text-center">{exam.categoryExamName}</td>
                  <td className="py-2 px-2 border-b text-center">{exam.createBy}</td>
                  <td className="py-2 px-2 border-b text-center">{exam.semesterName}</td>
                  <td className="py-2 px-2 border-b text-center">
                    {exam.status === 'Draft' ? (
                      <span className="text-yellow-600 font-semibold">Chưa thi</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Đã thi</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {/* Sửa/xóa để sau */}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Không có đề thi nào.
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
            Trang {page} / {totalPages || 1}
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
    </div>
  );
}
