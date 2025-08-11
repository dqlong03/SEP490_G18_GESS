'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  Calendar,
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  PenTool
} from 'lucide-react';

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
      .then(data => setSubjects(data || []))
      .catch(() => setSubjects([]));
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
          new Set((data || []).map((e: any) => e.categoryExamName).filter(Boolean))
        ).map(name => ({ value: name, label: name }));
        setHeadOptions(heads);
      })
      .catch(() => setExams([]))
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
      .then(total => setTotalPages(total || 1))
      .catch(() => setTotalPages(1));
    // eslint-disable-next-line
  }, [searchName, selectedSubject, selectedHead, selectedSemester, page]);

  // Dropdown options
  const subjectOptions = subjects.map((s: any) => ({
    value: s.subjectId,
    label: s.subjectName,
  }));

  // Lấy danh sách kỳ học duy nhất từ dữ liệu trả về
  const semesterOptions = Array.from(
    new Set(exams.map((e: any) => e.semesterName).filter(Boolean))
  ).map(name => ({ value: name, label: name }));

  // Xử lý sửa/xóa
  const handleEdit = (id: number) => {
    router.push(`/teacher/myexampaper/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      // Gọi API xóa
      fetch(`https://localhost:7074/api/PracticeExamPaper/${id}`, {
        method: 'DELETE'
      })
      .then(() => {
        alert('Xóa đề thi thành công!');
        // Reload dữ liệu
        setPage(1);
      })
      .catch(() => {
        alert('Có lỗi xảy ra khi xóa đề thi!');
      });
    }
  };

  const handleView = (id: number) => {
    router.push(`/teacher/myexampaper/view/${id}`);
  };

  // Custom styles cho react-select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '48px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 20,
      borderRadius: '8px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
      }
    })
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Danh sách đề thi tự luận</h1>
              <p className="text-gray-600">Quản lý và theo dõi các đề thi tự luận của bạn</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đề thi</p>
                <p className="text-2xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chưa thi</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {exams.filter(e => e.status === 'Draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã thi</p>
                <p className="text-2xl font-bold text-green-600">
                  {exams.filter(e => e.status !== 'Draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Bộ lọc và tìm kiếm</h3>
          </div>
          
          <form
            onSubmit={e => { e.preventDefault(); setPage(1); }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên đề thi"
                value={searchName}
                onChange={e => { setSearchName(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div>
              <Select
                options={subjectOptions}
                value={selectedSubject}
                onChange={(option) => { setSelectedSubject(option); setPage(1); }}
                placeholder="Chọn môn học"
                isClearable
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <Select
                options={headOptions}
                value={selectedHead}
                onChange={(option) => { setSelectedHead(option); setPage(1); }}
                placeholder="Chọn đầu điểm"
                isClearable
                isSearchable={false}
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <Select
                options={semesterOptions}
                value={selectedSemester}
                onChange={(option) => { setSelectedSemester(option); setPage(1); }}
                placeholder="Chọn học kỳ"
                isClearable
                isSearchable={false}
                styles={selectStyles}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
          </form>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            type="button"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={() => router.push('/teacher/myexampaper/createexampaper')}
          >
            <Plus className="w-5 h-5" />
            <span>Tạo đề thi mới</span>
          </button>
        </div>

        {/* Exam List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Danh sách đề thi ({exams.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Đang tải dữ liệu...</span>
            </div>
          ) : exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Đầu điểm</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam: any, idx: number) => (
                    <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <PenTool className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                            <div className="text-sm text-gray-500">ID: {exam.pracExamPaperId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{exam.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Target className="w-3 h-3 mr-1" />
                          {exam.categoryExamName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDate(exam.createBy)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {exam.semesterName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {exam.status === 'Draft' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Chưa thi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã thi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleView(exam.pracExamPaperId)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(exam.pracExamPaperId)}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.pracExamPaperId)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa đề thi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có đề thi nào</h3>
              <p className="text-gray-600 mb-4">Bạn chưa tạo đề thi nào hoặc không có đề thi phù hợp với bộ lọc.</p>
              <button
                onClick={() => router.push('/teacher/myexampaper/createexampaper')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo đề thi đầu tiên</span>
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {exams.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{(page - 1) * pageSize + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(page * pageSize, exams.length)}</span> của{' '}
              <span className="font-medium">{exams.length}</span> kết quả
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}