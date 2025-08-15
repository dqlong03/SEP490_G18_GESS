'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { 
  Calendar,
  FileText,
  Eye,
  X,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  User,
  Filter
} from 'lucide-react';

// Types
interface ExamSlot {
  examSlotId: number;
  slotName: string;
  status: string;
  examType: 'Multiple' | 'Practice';
  subjectName: string;
  examDate: string;
}

interface ExamSlotDetail {
  examSlotId: number;
  slotName: string;
  status: string;
  examType: 'Multiple' | 'Practice';
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  examName: string | null;
  semesterName: string;
  examSlotRoomDetails: ExamSlotRoom[];
}

interface ExamSlotRoom {
  examSlotRoomId: number;
  roomId: number;
  roomName: string;
  gradeTeacherName: string;
  proctorName: string;
  status: number;
  examType: string;
  examDate: string;
  examName: string;
  subjectName: string;
  semesterName: string;
  students: Student[];
}

interface Student {
  email: string;
  code: string;
  fullName: string;
  gender: boolean;
  dateOfBirth: string;
}

interface Major {
  majorId: number;
  majorName: string;
}

interface Subject {
  subjectId: number;
  subjectName: string;
}

interface Semester {
  semesterId: number;
  semesterName: string;
}

interface Exam {
  examId: number;
  examName: string;
  examType: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const statusOptions = [
  { value: 'Chưa gán bài thi', label: 'Chưa gán bài thi', color: 'gray' },
  { value: 'Chưa mở ca', label: 'Chưa mở ca', color: 'yellow' },
  { value: 'Đang mở ca', label: 'Đang mở ca', color: 'green' },
  { value: 'Đã kết thúc', label: 'Đã kết thúc', color: 'red' }
];

const examTypes = [
  { value: 'Multiple', label: 'Trắc nghiệm' },
  { value: 'Practice', label: 'Thực hành' }
];

const API_BASE = 'https://localhost:7074/api';

// Custom styles for react-select
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '48px',
    borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
    borderRadius: '8px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
    '&:hover': {
      borderColor: '#3B82F6'
    },
    backgroundColor: state.isDisabled ? '#F3F4F6' : 'white',
    cursor: state.isDisabled ? 'not-allowed' : 'default'
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#3B82F6' 
      : state.isFocused 
        ? '#EBF4FF' 
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3B82F6' : '#EBF4FF'
    }
  }),
  placeholder: (provided: any, state: any) => ({
    ...provided,
    color: state.isDisabled ? '#9CA3AF' : '#6B7280'
  }),
  singleValue: (provided: any, state: any) => ({
    ...provided,
    color: state.isDisabled ? '#9CA3AF' : '#374151'
  })
};

export default function ExamSlotListPage() {
  // States
  const [examSlots, setExamSlots] = useState<ExamSlot[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [selectedMajor, setSelectedMajor] = useState<SelectOption | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SelectOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectOption | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<SelectOption | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [selectedExamSlot, setSelectedExamSlot] = useState<ExamSlotDetail | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // Generate years (10 years from current year backwards)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Convert data to select options
  const majorOptions: SelectOption[] = majors.map(major => ({
    value: major.majorId.toString(),
    label: major.majorName
  }));

  const subjectOptions: SelectOption[] = subjects.map(subject => ({
    value: subject.subjectId.toString(),
    label: subject.subjectName
  }));

  const semesterOptions: SelectOption[] = semesters.map(semester => ({
    value: semester.semesterId.toString(),
    label: semester.semesterName
  }));

  const yearOptions: SelectOption[] = years.map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

  const statusSelectOptions: SelectOption[] = statusOptions.map(status => ({
    value: status.value,
    label: status.label
  }));

  const examTypeOptions: SelectOption[] = examTypes.map(type => ({
    value: type.value,
    label: type.label
  }));

  // Fetch initial data
  useEffect(() => {
    fetchMajors();
    fetchSemesters();
    fetchExamSlots(); // Fetch exam slots on initial load
  }, []);

  // Fetch majors
  const fetchMajors = async () => {
    try {
      const response = await fetch(`${API_BASE}/ViewExamSlot/GetAllMajor`);
      if (!response.ok) throw new Error('Failed to fetch majors');
      const data = await response.json();
      setMajors(data);
    } catch (err) {
      setError('Không thể tải danh sách ngành học');
    }
  };

  // Fetch subjects by major
  const fetchSubjectsByMajor = async (majorId: number) => {
    try {
      const response = await fetch(`${API_BASE}/ViewExamSlot/GetAllSubjectsByMajorId/${majorId}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      setError('Không thể tải danh sách môn học');
    }
  };

  // Fetch semesters
  const fetchSemesters = async () => {
    try {
      const response = await fetch(`${API_BASE}/Semesters`);
      if (!response.ok) throw new Error('Failed to fetch semesters');
      const data = await response.json();
      setSemesters(data);
    } catch (err) {
      setError('Không thể tải danh sách học kỳ');
    }
  };

  // Fetch exam slots
const fetchExamSlots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject?.value) params.append('SubjectId', selectedSubject.value);
      if (selectedSemester?.value) params.append('SemesterId', selectedSemester.value);
      if (selectedYear?.value) params.append('Year', selectedYear.value);
      if (selectedStatus?.value) params.append('Status', selectedStatus.value);
      if (selectedExamType?.value) params.append('ExamType', selectedExamType.value);
      if (fromDate) params.append('FromDate', fromDate);
      if (toDate) params.append('ToDate', toDate);
      params.append('pageSize', pageSize.toString());
      params.append('pageIndex', currentPage.toString());

      const response = await fetch(`${API_BASE}/ViewExamSlot/GetAllExamSlotsPagination?${params}`);
      if (!response.ok) {
        // Show alert and clear examSlots if filter API fails
        const errorText = await response.text();
       // alert(`Lỗi khi lọc ca thi: ${errorText || response.statusText}`);
        setExamSlots([]);
        setTotalPages(1);
        return;
      }
      const data = await response.json();
      setExamSlots(data);

      // Fetch total pages
      const countResponse = await fetch(`${API_BASE}/ViewExamSlot/CountPage?${params}`);
      if (countResponse.ok) {
        const totalPagesData = await countResponse.json();
        setTotalPages(totalPagesData);
      }
    } catch (err) {
      alert('Không thể tải danh sách ca thi do lỗi hệ thống hoặc kết nối!');
      setExamSlots([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam slot detail
  const fetchExamSlotDetail = async (examSlotId: number) => {
    try {
      const response = await fetch(`${API_BASE}/ViewExamSlot/GetExamSlotById/${examSlotId}`);
      if (!response.ok) throw new Error('Failed to fetch exam slot detail');
      const data = await response.json();
      setSelectedExamSlot(data);
      setShowViewModal(true);
    } catch (err) {
      setError('Không thể tải thông tin ca thi');
    }
  };

  // Fetch exams
  const fetchExams = async (semesterId: string, subjectId: string, examType: string, year: string) => {
    try {
      const params = new URLSearchParams({
        semesterId,
        subjectId,
        examType,
        year
      });
      const response = await fetch(`${API_BASE}/ViewExamSlot/GetAllExams?${params}`);
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      setExams(data);
    } catch (err) {
      setError('Không thể tải danh sách bài thi');
    }
  };

  // Add exam to exam slot
  const addExamToSlot = async (examSlotId: number, examId: number, examType: string) => {
    try {
      const params = new URLSearchParams({
        examSlotId: examSlotId.toString(),
        examId: examId.toString(),
        examType
      });
      const response = await fetch(`${API_BASE}/ViewExamSlot/AddExamToExamSlot?${params}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to add exam to slot');
      
      setShowExamModal(false);
      fetchExamSlots(); // Refresh data
      alert('Thêm bài thi vào ca thi thành công!');
    } catch (err) {
      alert('Thêm bài thi vào ca thi không thành công!');
      setError('Không thể thêm bài thi vào ca thi do đã có bài thi trong ca thi này');
    }
  };

  // Change exam slot status
  const changeExamSlotStatus = async (examSlotId: number, examType: string) => {
    try {
      const params = new URLSearchParams({
        examSlotId: examSlotId.toString(),
        examType: examType.toString()
      });
      const response = await fetch(`${API_BASE}/ViewExamSlot/ChangeStatusExamSlot?${params}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to change status');
      
      fetchExamSlots(); // Refresh data
      alert('Thay đổi trạng thái ca thi thành công!');
    } catch (err) {
      setError('Không thể thay đổi trạng thái ca thi');
    }
  };

  // Handle major change
  const handleMajorChange = (option: SelectOption | null) => {
    setSelectedMajor(option);
    setSelectedSubject(null);
    setSubjects([]);
    if (option?.value) {
      fetchSubjectsByMajor(parseInt(option.value));
    }
  };

  // Handle status click with date validation
  const handleStatusClick = async (examSlot: ExamSlot) => {
    if (examSlot.status === 'Chưa gán bài thi') {
      // Show exam selection modal
      if (selectedSemester?.value && selectedSubject?.value && selectedYear?.value) {
        await fetchExams(selectedSemester.value, selectedSubject.value, examSlot.examType, selectedYear.value);
        setSelectedExamSlot({ ...examSlot } as ExamSlotDetail);
        setShowExamModal(true);
      } else {
        alert('Vui lòng chọn học kỳ, môn học và năm để xem danh sách bài thi');
      }
    } else if (examSlot.status === 'Chưa mở ca') {
      // Validate exam date before changing status
      const examDate = new Date(examSlot.examDate);
      const currentDate = new Date();
      
      // Reset time to compare only dates
      examDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      if (examDate.getTime() !== currentDate.getTime()) {
        // Show warning if exam date doesn't match current date
        const examDateStr = examDate.toLocaleDateString('vi-VN');
        const currentDateStr = currentDate.toLocaleDateString('vi-VN');
        
        alert(
          `Không thể mở ca thi!\n\n` +
          `Ngày thi: ${examDateStr}\n` +
          `Ngày hiện tại: ${currentDateStr}\n\n` +
          `Ca thi chỉ có thể được mở vào đúng ngày thi.`
        );
        return; // Don't proceed with status change
      }
      
      // If date matches, proceed with status change
      const examTypeNum = examSlot.examType === 'Multiple' ? 'Multiple' : "Practice";
      await changeExamSlotStatus(examSlot.examSlotId, examTypeNum);
    } else {
      // Change status for other statuses (Đang mở ca -> Đã kết thúc)
      const examTypeNum = examSlot.examType === 'Multiple' ? 'Multiple' : "Practice";
      await changeExamSlotStatus(examSlot.examSlotId, examTypeNum);
    }
  };

  // Handle search when filters change
  useEffect(() => {
    fetchExamSlots();
  }, [selectedSubject, selectedSemester, selectedYear, selectedStatus, selectedExamType, fromDate, toDate, currentPage]);

  // Clear filters
  const handleClearFilters = () => {
    setSelectedMajor(null);
    setSelectedSubject(null);
    setSelectedSemester(null);
    setSelectedYear(null);
    setFromDate('');
    setToDate('');
    setSelectedStatus(null);
    setSelectedExamType(null);
    setCurrentPage(1);
  };

  // Get status badge with enhanced styling for clickable statuses
  const getStatusBadge = (status: string, isClickable: boolean = false, examDate?: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return null;

    const colorClasses = {
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200'
    };

    const icons = {
      'Chưa gán bài thi': <AlertCircle className="w-3.5 h-3.5" />,
      'Chưa mở ca': <Clock className="w-3.5 h-3.5" />,
      'Đang mở ca': <CheckCircle className="w-3.5 h-3.5" />,
      'Đã kết thúc': <XCircle className="w-3.5 h-3.5" />
    };

    // Check if status change is allowed for "Chưa mở ca"
    let isDisabled = false;
    let disabledReason = '';
    
    if (status === 'Chưa mở ca' && examDate && isClickable) {
      const examDateObj = new Date(examDate);
      const currentDate = new Date();
      
      examDateObj.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      isDisabled = examDateObj.getTime() !== currentDate.getTime();
      if (isDisabled) {
        disabledReason = 'Chỉ có thể mở ca thi vào đúng ngày thi';
      }
    }

    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          colorClasses[statusConfig.color as keyof typeof colorClasses]
        } ${isClickable && !isDisabled ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${
          isDisabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        title={isDisabled ? disabledReason : ''}
      >
        {icons[status as keyof typeof icons]}
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pl-4 pr-4">
      <div className="max-w-full py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Quản lý ca thi
            </h1>
          </div>
          <p className="text-gray-600 ml-11">Quản lý và theo dõi các ca thi trong hệ thống</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Filter Section */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Major Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngành học</label>
                <Select
                  value={selectedMajor}
                  onChange={handleMajorChange}
                  options={majorOptions}
                  placeholder="Chọn ngành học"
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                />
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                <Select
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  options={subjectOptions}
                  placeholder="Chọn môn học"
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                  isDisabled={!selectedMajor}
                />
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ</label>
                <Select
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  options={semesterOptions}
                  placeholder="Chọn học kỳ"
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                />
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm học</label>
                <Select
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={yearOptions}
                  placeholder="Chọn năm học"
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                />
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusSelectOptions}
                  placeholder="Chọn trạng thái"
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                />
              </div>

              {/* Exam Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài thi</label>
                <Select
                  value={selectedExamType}
                  onChange={setSelectedExamType}
                  options={examTypeOptions}
                  placeholder="Chọn loại bài thi"
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                <Filter className="w-4 h-4" />
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : examSlots.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Không có ca thi nào</h3>
                    <p className="text-gray-500">Thử điều chỉnh bộ lọc để xem kết quả</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <th className="text-center py-4 px-6 font-semibold text-gray-700 w-16">STT</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Tên ca thi</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Môn</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Ngày thi</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Loại bài thi</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-700">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {examSlots.map((slot, index) => (
                      <tr key={slot.examSlotId} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-medium text-sm">
                            {(currentPage - 1) * pageSize + index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{slot.slotName}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {slot.subjectName}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-700">
                              {new Date(slot.examDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div onClick={() => handleStatusClick(slot)}>
                            {getStatusBadge(slot.status, true, slot.examDate)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            slot.examType === 'Practice' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {examTypes.find(type => type.value === slot.examType)?.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => fetchExamSlotDetail(slot.examSlotId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                              title="Xem thông tin ca thi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {examSlots.length > 0 && totalPages > 1 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                          disabled={pageNum < 1 || pageNum > totalPages}
                        >
                          {pageNum}
                        </button>
                      );
                    })
                  }
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Exam Slot Detail Modal */}
        {showViewModal && selectedExamSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Thông tin ca thi</h3>
                    <p className="text-sm text-gray-600">{selectedExamSlot.slotName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Exam Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-500">Môn học:</span>
                  <p className="font-semibold text-gray-900">{selectedExamSlot.subjectName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Học kỳ:</span>
                  <p className="font-semibold text-gray-900">{selectedExamSlot.semesterName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Ngày thi:</span>
                  <p className="font-semibold text-gray-900">{new Date(selectedExamSlot.examDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Thời gian:</span>
                  <p className="font-semibold text-gray-900">{selectedExamSlot.startTime} - {selectedExamSlot.endTime}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tên bài thi:</span>
                  <p className="font-semibold text-gray-900">{selectedExamSlot.examName || 'Chưa có'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Loại bài thi:</span>
                  <p className="font-semibold text-gray-900">
                    {examTypes.find(type => type.value === selectedExamSlot.examType)?.label}
                  </p>
                </div>
              </div>

              {/* Rooms List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Danh sách phòng thi ({selectedExamSlot.examSlotRoomDetails.length} phòng):
                </h4>
                {selectedExamSlot.examSlotRoomDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Chưa có phòng thi nào được phân công</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {selectedExamSlot.examSlotRoomDetails.map((room) => (
                      <div key={room.examSlotRoomId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Phòng {room.roomName}
                          </h5>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {room.students.length} sinh viên
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-500">Giáo viên chấm thi:</span>
                            <p className="font-medium">{room.gradeTeacherName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Giáo viên coi thi:</span>
                            <p className="font-medium">{room.proctorName}</p>
                          </div>
                        </div>

                        {/* Students List */}
                        {room.students.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Danh sách sinh viên:
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {room.students.map((student) => (
                                <div key={student.email} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="font-medium">{student.code}</span>
                                  <span>-</span>
                                  <span>{student.fullName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Select Exam Modal */}
        {showExamModal && selectedExamSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Chọn bài thi</h3>
                    <p className="text-sm text-gray-600">{selectedExamSlot.slotName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExamModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4">Chọn bài thi cho ca thi:</h4>
                {exams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Không có bài thi nào phù hợp</p>
                  </div>
                ) : (
                  exams.map(exam => (
                    <div key={exam.examId} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <input
                        type="radio"
                        name="selectedExam"
                        value={exam.examId}
                        checked={selectedExamId === exam.examId.toString()}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{exam.examName}</h5>
                        <p className="text-sm text-gray-600">Loại: {exam.examType}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (selectedExamId && selectedExamSlot) {
                      addExamToSlot(selectedExamSlot.examSlotId, parseInt(selectedExamId), selectedExamSlot.examType);
                    }
                  }}
                  disabled={!selectedExamId}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Thêm bài thi
                </button>
                <button
                  onClick={() => setShowExamModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}