'use client';

import { useTrainingProgramSubjects } from '@/hooks/examination/subjectHook';

export default function TrainingProgramSubjectManager() {
  const {
    subjects,
    allSubjects,
    loading,
    error,
    pageNumber,
    setPageNumber,
    pageSize,
    searchName,
    setSearchName,
    selectedSubjectId,
    setSelectedSubjectId,
    handleAddSubject,
    handleDelete,
    handleSearch,
  } = useTrainingProgramSubjects();

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
