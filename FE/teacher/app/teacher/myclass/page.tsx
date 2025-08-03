'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { getUserIdFromToken } from '@/utils/tokenUtils';

export default function MyClassPage() {
  const router = useRouter();
  const [searchClassName, setSearchClassName] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // Lấy teacherId từ token
  const teacherId = getUserIdFromToken();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: currentYear - i,
    label: (currentYear - i).toString(),
  }));
  const [selectedYear, setSelectedYear] = useState({ value: currentYear, label: currentYear.toString() });

  // Lấy danh sách kỳ học hiện tại
  useEffect(() => {
    fetch('https://localhost:7074/api/Semesters/CurrentSemester')
      .then(res => res.json())
      .then(data => setSemesters(data || []));
  }, []);

  // Lấy danh sách môn học từ API mới
  useEffect(() => {
    fetch('https://localhost:7074/api/Subject/ListSubject')
      .then(res => res.json())
      .then(data => setSubjects(data || []));
  }, []);

  // Lấy danh sách lớp của giáo viên (API 6)
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);

    // Tạo object params và loại bỏ key có giá trị rỗng/null/undefined
    const rawParams: Record<string, string> = {
      teacherId,
      year: selectedYear?.value?.toString() || '',
      name: searchClassName || '',
      subjectId: selectedSubject?.value?.toString() || '',
      semesterId: selectedSemester?.value?.toString() || '',
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    };
    Object.keys(rawParams).forEach(
      (key) => (rawParams[key] === '' || rawParams[key] == null) && delete rawParams[key]
    );
    const params = new URLSearchParams(rawParams);

    fetch(`https://localhost:7074/api/Class/teacherId?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        
        // Tạo params riêng cho API CountPagesByTeacher (bỏ pageNumber và pageSize)
        const countParams: Record<string, string> = {
          year: selectedYear?.value?.toString() || '',
          name: searchClassName || '',
          subjectId: selectedSubject?.value?.toString() || '',
          semesterId: selectedSemester?.value?.toString() || '',
          pageSize: pageSize.toString(),
        };
        Object.keys(countParams).forEach(
          (key) => (countParams[key] === '' || countParams[key] == null) && delete countParams[key]
        );
        const countParamsString = new URLSearchParams(countParams);
        
        // Lấy tổng số trang (API 7)
        fetch(`https://localhost:7074/api/Class/CountPagesByTeacher/${teacherId}?${countParamsString.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(res2 => res2.json())
          .then(total => setTotalPages(total || 1));
      })
      .finally(() => setLoading(false));
  }, [teacherId, searchClassName, selectedSubject, selectedSemester, selectedYear, page]);

  // Tạo options cho react-select
  const subjectOptions = subjects.map((s: any) => ({
    value: s.subjectId || s.id,
    label: s.subjectName || s.name,
  }));

  const semesterOptions = semesters.map((s: any) => ({
    value: s.semesterId || s.id,
    label: s.semesterName || s.name,
  }));

  // Chuyển sang trang tạo lớp học
  const handleAddClass = () => {
    router.push('/teacher/myclass/createclass');
  };

  // Xử lý sửa (để sau)
  const handleEdit = (id: number) => {
    alert(`Sửa lớp có ID: ${id}`);
  };

  // Xử lý chuyển sang trang chi tiết lớp
  const handleDetail = (id: number) => {
    router.push(`/teacher/myclass/classdetail/${id}`);
  };

  // Reset filters
  const handleReset = () => {
    setSearchClassName('');
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedYear({ value: currentYear, label: currentYear.toString() });
    setPage(1);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý lớp của tôi</h1>
          </div>
          <p className="text-gray-600">Quản lý và theo dõi các lớp học mà bạn đang giảng dạy</p>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tên lớp học</label>
              <input
                type="text"
                placeholder="Tìm theo tên lớp"
                value={searchClassName}
                onChange={e => { setSearchClassName(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kỳ học</label>
              <Select
                options={semesterOptions}
                value={selectedSemester}
                onChange={(option) => { setSelectedSemester(option); setPage(1); }}
                placeholder="Chọn kỳ học"
                isClearable
                isSearchable={false}
                styles={selectStyles}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Năm học</label>
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={option => { setSelectedYear(option); setPage(1); }}
                placeholder="Chọn năm"
                isSearchable={false}
                styles={selectStyles}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Môn học</label>
              <Select
                options={subjectOptions}
                value={selectedSubject}
                onChange={(option) => { setSelectedSubject(option); setPage(1); }}
                placeholder="Chọn môn học"
                isClearable
                styles={selectStyles}
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
            
            <button
              type="button"
              onClick={handleAddClass}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl h-[42px]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm lớp
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách lớp học</h3>
              <div className="text-sm text-gray-500">
                Tổng: {classes.length} lớp học
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên lớp học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ học</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số sinh viên</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classes.length > 0 ? classes.map((cls: any, idx: number) => (
                    <tr key={cls.classId} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                            {cls.className.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{cls.className}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cls.subjectName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cls.semesterName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">{cls.studentCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDetail(cls.classId)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">Không có lớp học nào</p>
                          <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc hoặc tạo lớp học mới</p>
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
                  Hiển thị <span className="font-medium">{Math.min((page - 1) * pageSize + 1, classes.length)}</span> đến{' '}
                  <span className="font-medium">{Math.min(page * pageSize, classes.length)}</span> trong tổng số{' '}
                  <span className="font-medium">{totalPages * pageSize}</span> lớp học
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