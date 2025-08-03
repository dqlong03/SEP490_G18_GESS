'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Eye, 
  FileText,
  Calendar,
  GraduationCap,
  Settings,
  X,
  Target,
  Clock,
  Filter,
  AlertCircle,
  PenTool,
  Users,
  Search
} from 'lucide-react';

const API_URL = "https://localhost:7074";

interface SubjectDTO {
  subjectId: number;
  subjectName: string;
}

interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

interface PracExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  semesterName: string;
}

interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string | null;
  status: string | null;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export default function ExamPaperListPage() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState<{ value: string; label: string } | null>(null);

  const [examPapers, setExamPapers] = useState<PracExamPaperDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Chi tiết đề thi
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Lấy danh sách môn học, kỳ, năm
  useEffect(() => {
    const teacherId = getUserIdFromToken();
    fetch(`${API_URL}/api/FinalExamPaper/GetAllMajorByTeacherId?teacherId=${teacherId}`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data || []);
        if (data && data.length > 0) {
          setSelectedSubject({ value: data[0].subjectId, label: data[0].subjectName });
        }
      });
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => {
        setSemesters(data || []);
        if (data && data.length > 0) {
          setSelectedSemester({ value: data[0].semesterId, label: data[0].semesterName });
        }
      });
    // Năm: 10 năm về trước kể từ năm hiện tại
    const currentYear = new Date().getFullYear();
    const yearArr = [];
    for (let y = currentYear; y > currentYear - 10; y--) {
      yearArr.push({ value: y.toString(), label: y.toString() });
    }
    setYears(yearArr);
    if (yearArr.length > 0) {
      setSelectedYear(yearArr[0]);
    }
  }, []);

  // Lấy danh sách đề thi khi chọn đủ bộ lọc
  useEffect(() => {
    if (selectedSubject && selectedSemester && selectedYear) {
      setLoading(true);
      fetch(`${API_URL}/api/FinalExamPaper/GetAllFinalExamPaper?subjectId=${selectedSubject.value}&semesterId=${selectedSemester.value}&year=${selectedYear.value}`)
        .then(res => res.json())
        .then(data => setExamPapers(data || []))
        .finally(() => setLoading(false));
    } else {
      setExamPapers([]);
    }
  }, [selectedSubject, selectedSemester, selectedYear]);

  // Xem chi tiết đề thi
  const handleShowDetail = async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/FinalExamPaper/ViewFinalExamPaperDetail/${examPaperId}`);
      if (!res.ok) throw new Error('Không lấy được chi tiết đề thi');
      const data = await res.json();
      setDetailData(data);
    } catch (err: any) {
      setDetailData(null);
      alert(err.message || 'Lỗi lấy chi tiết đề thi');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  // Filter exam papers based on search text
  const filteredExamPapers = examPapers.filter(exam =>
    exam.pracExamPaperName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate total score from detail data
  const totalScore = detailData?.questions.reduce((sum, q) => sum + q.score, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Danh sách đề thi cuối kỳ</h1>
                <p className="text-gray-600">Quản lý và theo dõi các đề thi thực hành cuối kỳ</p>
              </div>
            </div>
            
            <Link 
              href="/teacher/finalexampaper/createfinalpaper"
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề thi cuối kỳ</span>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        {examPapers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng đề thi</p>
                  <p className="text-2xl font-bold text-blue-600">{examPapers.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Môn học</p>
                  <p className="text-2xl font-bold text-green-600">{selectedSubject?.label || '--'}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Học kỳ</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedSemester?.label || '--'}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Bộ lọc tìm kiếm
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
              <Select
                options={subjects.map(s => ({ value: s.subjectId, label: s.subjectName }))}
                value={selectedSubject}
                onChange={setSelectedSubject}
                placeholder="Chọn môn học"
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ</label>
              <Select
                options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                value={selectedSemester}
                onChange={setSelectedSemester}
                placeholder="Chọn học kỳ"
                isSearchable
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
              <Select
                options={years}
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="Chọn năm"
                isSearchable={false}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '44px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  menu: (provided) => ({ ...provided, zIndex: 20 }),
                }}
                noOptionsMessage={() => 'Không có dữ liệu'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Tìm kiếm đề thi..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exam Papers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách đề thi ({filteredExamPapers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500 font-medium">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredExamPapers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có đề thi nào</h3>
                      <p className="text-gray-600">Tạo đề thi đầu tiên để bắt đầu</p>
                    </td>
                  </tr>
                ) : (
                  filteredExamPapers.map((exam, idx) => (
                    <tr key={exam.pracExamPaperId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <PenTool className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Calendar className="w-3 h-3 mr-1" />
                          {exam.semesterName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                          onClick={() => handleShowDetail(exam.pracExamPaperId)}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span>Xem</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chi tiết đề thi modal */}
        {showDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Chi tiết đề thi
                  </h3>
                  <button
                    onClick={handleCloseDetail}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500 font-medium">Đang tải chi tiết...</span>
                  </div>
                ) : detailData ? (
                  <div className="space-y-6">
                    {/* Exam info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <PenTool className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tên đề thi</p>
                            <p className="font-semibold text-gray-900">{detailData.pracExamPaperName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Môn học</p>
                            <p className="font-semibold text-gray-900">{detailData.subjectName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Học kỳ</p>
                            <p className="font-semibold text-gray-900">{detailData.semesterName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ngày tạo</p>
                            <p className="font-semibold text-gray-900">{new Date(detailData.createAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trạng thái</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {detailData.status || 'Hoạt động'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tổng điểm</p>
                            <p className="font-semibold text-gray-900">{totalScore} điểm</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Questions */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Danh sách câu hỏi ({detailData.questions.length} câu)
                      </h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {detailData.questions.map(q => (
                          <div key={q.questionOrder} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                                {q.questionOrder}
                              </span>
                              <div className="flex-1">
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-600">Câu hỏi:</span>
                                  <p className="text-gray-900 mt-1">{q.content}</p>
                                </div>
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-600">Đáp án:</span>
                                  <p className="text-gray-900 mt-1">{q.answerContent}</p>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-600 mr-2">Điểm:</span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {q.score} điểm
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-gray-500">Không có dữ liệu chi tiết</div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCloseDetail}
                  >
                    <X className="w-4 h-4" />
                    <span>Đóng</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}