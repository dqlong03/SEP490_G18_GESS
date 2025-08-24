'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import { useMyExam } from '@/hooks/teacher/useMyExam';

function MyExamsContent() {
  const {
    // Filter state
    searchName,
    selectedMajor,
    selectedSubject,
    selectedSemester,
    selectedType,
    selectedHead,

    // Dropdown options
    majorOptions,
    subjectOptions,
    semesterOptions,
    examTypes,
    examHeads,

    // Exam data
    exams,
    loading,

    // Pagination
    page,
    totalPages,
    pageSize,

    // Handlers
    handleMajorChange,
    handleSubjectChange,
    handleSemesterChange,
    handleTypeChange,
    handleHeadChange,
    handleSearchNameChange,
    handleClearFilters,
    handleEdit,
    handlePreviousPage,
    handleNextPage,

    // Utilities
    selectStyles,
    formatDate,
  } = useMyExam();

  return (
    <div className="w-full min-h-screen bg-white font-sans p-0">
      <div className="w-full py-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Bài thi của tôi</h2>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-wrap gap-2 md:gap-4 items-center mb-10"
        >
          <input
            type="text"
            placeholder="Tìm theo tên bài thi"
            value={searchName}
            onChange={(e) => handleSearchNameChange(e.target.value)}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-44 h-10"
            style={{
              minHeight: '40px',
              borderColor: '#d1d5db',
              boxShadow: 'none',
            }}
          />
          
          <div className="relative w-44 z-20">
            <Select
              options={majorOptions}
              value={selectedMajor}
              onChange={handleMajorChange}
              placeholder="Chọn ngành"
              isClearable
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          
          <div className="relative w-44 z-20">
            <Select
              options={subjectOptions}
              value={selectedSubject}
              onChange={handleSubjectChange}
              placeholder="Chọn môn học"
              isClearable
              styles={selectStyles}
            />
          </div>
          
          <div className="relative w-44 z-20">
            <Select
              options={semesterOptions}
              value={selectedSemester}
              onChange={handleSemesterChange}
              placeholder="Chọn kỳ"
              isClearable
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          
          <div className="relative w-44 z-20">
            <Select
              options={examTypes}
              value={selectedType}
              onChange={handleTypeChange}
              placeholder="Loại bài thi"
              isClearable
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          
          <div className="relative w-44 z-20">
            <Select
              options={examHeads}
              value={selectedHead}
              onChange={handleHeadChange}
              placeholder="Trạng thái"
              isClearable
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          
          <button
            type="button"
            onClick={handleClearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
          >
            Xóa lọc
          </button>
        </form>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded shadow bg-white" style={{ maxWidth: '100%' }}>
          <table className="min-w-[900px] w-full text-sm md:text-base border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-14 text-center">STT</th>
                <th className="py-2 px-2 border-b w-32 text-left">Kỳ</th>
                <th className="py-2 px-2 border-b w-56 text-left">Tên bài</th>
                <th className="py-2 px-2 border-b w-32 text-center">Ngày tạo</th>
                <th className="py-2 px-2 border-b w-32 text-center">Trạng thái</th>
                <th className="py-2 px-2 border-b w-32 text-center">Loại bài</th>
                <th className="py-2 px-2 border-b w-32 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, idx) => (
                <tr key={exam.examId || exam.id} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="py-2 px-2 border-b">{exam.semesterName}</td>
                  <td className="py-2 px-2 border-b">{exam.examName}</td>
                  <td className="py-2 px-2 border-b text-center">
                    {formatDate(exam.createDate)}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {exam.statusExam ? (
                      <span className="text-blue-600 font-semibold">{exam.statusExam}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    {exam.examType || ''}
                  </td>
                  <td className="py-2 px-2 border-b text-center">
                    <button
                      onClick={() => handleEdit(exam.examId || exam.id || 0)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition font-semibold"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Không có bài thi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap justify-left items-center gap-2 text-base">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="mx-2 font-semibold">
            Trang {page} / {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
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

function LoadingFallback() {
  return (
    <div className="w-full min-h-screen bg-white font-sans p-0 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải trang bài thi...</p>
      </div>
    </div>
  );
}

export default function MyExamsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyExamsContent />
    </Suspense>
  );
}
