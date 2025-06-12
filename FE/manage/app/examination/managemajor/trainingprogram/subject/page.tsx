'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

type Subject = {
  subjectId: number;
  subjectName: string;
  description?: string;
  course?: string;
  noCredits: number;
};

const API_URL = 'https://localhost:7074/api/Subject';

export default function TrainingProgramSubjectManager() {
  const searchParams = useSearchParams();
  const trainingProgramId = Number(searchParams.get('trainingProgramId')) || 1;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & search state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchName, setSearchName] = useState('');

  // Môn học được chọn để thêm vào chương trình
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  // Lấy danh sách môn học trong chương trình đào tạo
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());

      const res = await fetch(`${API_URL}/TrainingProgram/${trainingProgramId}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch subjects in training program');
      const data = await res.json();
      setSubjects(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Lấy tất cả môn học để chọn thêm vào chương trình
  const fetchAllSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}?pageNumber=1&pageSize=1000`);
      if (res.ok) {
        const data = await res.json();
        setAllSubjects(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchSubjects();
    fetchAllSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, searchName, trainingProgramId]);

  // Thêm môn học vào chương trình đào tạo
  const handleAddSubject = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/AddSubjectToTrainingProgram/${trainingProgramId}/${selectedSubjectId}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to add subject to training program');
      setSelectedSubjectId(null);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Xóa môn học khỏi chương trình đào tạo
  const handleDelete = async (subjectId: number) => {
    if (!confirm('Bạn có chắc muốn xóa môn học này khỏi chương trình?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/RemoveSubjectFromTrainingProgram/${trainingProgramId}/${subjectId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to remove subject from training program');
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Tìm kiếm
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    fetchSubjects();
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-4xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý môn học trong chương trình đào tạo</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-center mb-5">
          <input
            type="text"
            placeholder="Tìm theo tên môn học"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-40"
          />
          <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition font-semibold">
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setPageNumber(1);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
        </form>

        {/* Add subject to training program */}
        <form onSubmit={handleAddSubject} className="mb-10 flex items-center gap-2">
          <select
            value={selectedSubjectId ?? ''}
            onChange={e => setSelectedSubjectId(Number(e.target.value))}
            className="border rounded px-3 py-2 w-60"
          >
            <option value="">-- Chọn môn học để thêm --</option>
            {allSubjects
              .filter(s => !subjects.some(sub => sub.subjectId === s.subjectId))
              .map(subject => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName} ({subject.noCredits} TC)
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={!selectedSubjectId || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            Thêm vào chương trình
          </button>
        </form>

        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto rounded shadow bg-white">
            <table className="min-w-full text-sm md:text-base border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <th className="py-2 px-2 border-b">ID</th>
                  <th className="py-2 px-2 border-b">Tên môn học</th>
                  <th className="py-2 px-2 border-b">Mô tả</th>
                  <th className="py-2 px-2 border-b">Khóa học</th>
                  <th className="py-2 px-2 border-b">Tín chỉ</th>
                  <th className="py-2 px-2 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.subjectId}>
                    <td className="py-2 px-2 text-center border-b">{subject.subjectId}</td>
                    <td className="py-2 px-2 border-b">{subject.subjectName}</td>
                    <td className="py-2 px-2 border-b">{subject.description}</td>
                    <td className="py-2 px-2 border-b">{subject.course}</td>
                    <td className="py-2 px-2 text-center border-b">{subject.noCredits}</td>
                    <td className="py-2 px-2 text-center border-b">
                      <button
                        onClick={() => handleDelete(subject.subjectId)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-semibold"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      Không có môn học nào trong chương trình này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
