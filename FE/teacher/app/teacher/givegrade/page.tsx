'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { getUserIdFromToken } from '@utils/tokenUtils';

const statusOptions = [
  { value: 0, label: 'Chưa chấm' },
  { value: 1, label: 'Đã chấm' }
];

// 10 năm gần nhất
const getYearOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  return Array.from({ length: 10 }, (_, i) => {
    const y1 = currentYear - i;
    const y2 = y1 + 1;
    return {
      value: y1,
      label: `${y1}-${y2}`,
    };
  });
};

export default function GiveGradePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<any>(statusOptions[0]); // Mặc định: Chưa chấm
  const [selectedYear, setSelectedYear] = useState<any>(null);

  const [exams, setExams] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const router = useRouter();

  const teacherId = getUserIdFromToken() || '2A96A929-C6A1-4501-FC19-08DDB5DCA989';

  // Lấy năm hiện tại làm mặc định
  const yearOptions = useMemo(() => getYearOptions(), []);
  
  // Fetch subjects và set giá trị mặc định
  useEffect(() => {
    fetch(`https://localhost:7074/api/MultipleExam/subjects-by-teacher/${teacherId}`)
      .then(res => res.json())
      .then(data => {
        const subjectOptions = data.map((s: any) => ({
          value: s.subjectId,
          label: s.subjectName,
        }));
        setSubjects(subjectOptions);
        // Set môn học đầu tiên làm mặc định
        if (subjectOptions.length > 0) {
          setSelectedSubject(subjectOptions[0]);
        }
      })
      .catch(() => setSubjects([]));
  }, [teacherId]);

  // Fetch semesters và set giá trị mặc định
  useEffect(() => {
    fetch(`https://localhost:7074/api/Semesters`)
      .then(res => res.json())
      .then(data => {
        const semesterOptions = data.map((s: any) => ({
          value: s.semesterId,
          label: s.semesterName,
        }));
        setSemesters(semesterOptions);
        // Set học kỳ đầu tiên làm mặc định
        if (semesterOptions.length > 0) {
          setSelectedSemester(semesterOptions[0]);
        }
      })
      .catch(() => setSemesters([]));
  }, []);

  // Set năm học hiện tại làm mặc định
  useEffect(() => {
    if (yearOptions.length > 0) {
      setSelectedYear(yearOptions[0]);
    }
  }, [yearOptions]);

  // Fetch exams
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("teacherId", teacherId);
    if (selectedSubject) params.append("subjectId", selectedSubject.value);
    if (selectedStatus) params.append("statusExam", selectedStatus.value);
    if (selectedSemester) params.append("semesterId", selectedSemester.value);
    if (selectedYear) params.append("year", selectedYear.value);
    params.append("pagesze", pageSize.toString());
    params.append("pageindex", page.toString());

    fetch(`https://localhost:7074/api/GradeSchedule/teacher?${params.toString()}`)
      .then(res => res.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, [selectedSubject, selectedStatus, selectedSemester, selectedYear, page, teacherId]);

  // Fetch total pages
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("teacherId", teacherId);
    if (selectedSubject) params.append("subjectId", selectedSubject.value);
    if (selectedStatus) params.append("statusExam", selectedStatus.value);
    if (selectedSemester) params.append("semesterId", selectedSemester.value);
    if (selectedYear) params.append("year", selectedYear.value);
    params.append("pagesze", pageSize.toString());
    params.append("pageindex", page.toString());

    fetch(`https://localhost:7074/api/GradeSchedule/teacher/count?${params.toString()}`)
      .then(res => res.json())
      .then(data => setTotalPages(Number(data) || 1))
      .catch(() => setTotalPages(1));
  }, [selectedSubject, selectedStatus, selectedSemester, selectedYear, page, teacherId]);

  // Handle grading action
  const handleGrade = (examSlotRoomId: number, action: "edit" | "grade" = "grade") => {
    router.push(`/teacher/givegrade/examroom/${examSlotRoomId}?action=${action}`);
  };

  // Reset filter - set về giá trị mặc định
  const handleReset = () => {
    setSelectedSubject(subjects.length > 0 ? subjects[0] : null);
    setSelectedSemester(semesters.length > 0 ? semesters[0] : null);
    setSelectedStatus(statusOptions[0]);
    setSelectedYear(yearOptions.length > 0 ? yearOptions[0] : null);
    setPage(1);
  };

  // Format trạng thái
  const getStatusLabel = (isGrade: number | null) => {
    if (isGrade === null || isGrade === 0) return "Chưa chấm";
    if (isGrade === 1) return "Đã chấm";
    return "";
  };

  // Format trạng thái màu và badge
  const getStatusBadge = (isGrade: number | null) => {
    if (isGrade === null || isGrade === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Chưa chấm
        </span>
      );
    }
    if (isGrade === 1) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Đã chấm
        </span>
      );
    }
    return "";
  };

  // Format ngày
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Custom Select styles
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '42px',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3B82F6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 50,
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EBF8FF' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:active': {
        backgroundColor: '#3B82F6'
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý chấm thi</h1>
          </div>
          <p className="text-gray-600">Quản lý và thực hiện chấm điểm cho các bài thi của học sinh</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            Bộ lọc tìm kiếm
          </h3>
          
          <form
            onSubmit={e => { e.preventDefault(); setPage(1); }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Môn học <span className="text-red-500">*</span>
              </label>
              <Select
                options={subjects}
                value={selectedSubject}
                onChange={option => { setSelectedSubject(option); setPage(1); }}
                placeholder="Chọn môn học"
                isClearable
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kỳ học <span className="text-red-500">*</span>
              </label>
              <Select
                options={semesters}
                value={selectedSemester}
                onChange={option => { setSelectedSemester(option); setPage(1); }}
                placeholder="Chọn kỳ học"
                isClearable
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={option => { setSelectedStatus(option); setPage(1); }}
                placeholder="Trạng thái"
                isClearable
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Năm học <span className="text-red-500">*</span>
              </label>
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={option => { setSelectedYear(option); setPage(1); }}
                placeholder="Năm học"
                isClearable
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium h-[42px]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Đặt lại
            </button>
          </form>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài thi</p>
                <p className="text-2xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa chấm</p>
                <p className="text-2xl font-bold text-red-600">{exams.filter(e => !e.isGrade || e.isGrade === 0).length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã chấm</p>
                <p className="text-2xl font-bold text-green-600">{exams.filter(e => e.isGrade === 1).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold text-purple-600">
                  {exams.length > 0 ? Math.round((exams.filter(e => e.isGrade === 1).length / exams.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách bài thi</h3>
              <div className="text-sm text-gray-500">
                Tổng: {exams.length} bài thi
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bài thi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ học</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thi</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam, idx) => (
                    <tr key={exam.examSlotRoomId} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.examName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exam.subjectName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(exam.isGrade)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {semesters.find(s => s.value === exam.semesterId)?.label || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatDate(exam.examDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {exam.isGrade === 1 ? (
                          <button
                            onClick={() => handleGrade(exam.examSlotRoomId, "edit")}
                            className="inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa điểm
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrade(exam.examSlotRoomId, "grade")}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Chấm thi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">Không có bài thi nào</p>
                          <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc để tìm kiếm bài thi</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{Math.min((page - 1) * pageSize + 1, exams.length)}</span> đến{' '}
                  <span className="font-medium">{Math.min(page * pageSize, exams.length)}</span> trong tổng số{' '}
                  <span className="font-medium">{totalPages * pageSize}</span> bài thi
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>
                  
                  <span className="text-sm text-gray-700 px-4 py-2">
                    Trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                  </span>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Sau
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}