'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Select from 'react-select';
import { getUserIdFromToken } from '@/utils/tokenUtils';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  FileText, 
  Plus, 
  Search,
  Eye,
  Trash2,
  Save,
  X,
  ChevronLeft,
  Settings,
  BookOpen,
  Target,
  GraduationCap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { useCallback } from 'react'; // thêm nếu chưa có


const API_URL = "https://localhost:7074";

interface PracticeExamPaperDTO {
  pracExamPaperId: number;
  pracExamPaperName: string;
  year: string;
  semester: string;
}

interface SemesterDTO {
  semesterId: number;
  semesterName: string;
}

interface ExamPaperDetail {
  pracExamPaperId: number;
  pracExamPaperName: string;
  createAt: string;
  subjectName: string;
  semesterName: string;
  categoryExamName: string;
  status: string;
  questions: {
    questionOrder: number;
    content: string;
    answerContent: string;
    score: number;
  }[];
}

export default function CreateEssayExamPage() {
  const router = useRouter();
  const params = useParams();
  const classId = Number(params?.classId);

  // State
  const [examName, setExamName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [students, setStudents] = useState<any[]>([]);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentChecks, setStudentChecks] = useState<Record<string, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [gradeComponents, setGradeComponents] = useState<any[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] = useState<any>(null);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  // Đề thi
  const [showExamPopup, setShowExamPopup] = useState(false);
  const [examChecks, setExamChecks] = useState<Record<number, boolean>>({});
  const [examPapers, setExamPapers] = useState<PracticeExamPaperDTO[]>([]);
  const [selectedExams, setSelectedExams] = useState<PracticeExamPaperDTO[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // subjectId, semesterId
  const [subjectId, setSubjectId] = useState<number | null>(null);

  // Kỳ và năm
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<any>(null);
  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState<{ value: string; label: string } | null>(null);

  // Chi tiết đề thi
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Preview đề thi khi hover (chỉ trong popup)
  const [hoveredExam, setHoveredExam] = useState<PracticeExamPaperDTO | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách sinh viên, đầu điểm, subjectId, semesters, years
  useEffect(() => {
    if (!classId) return;
     fetch(`${API_URL}/api/Class/${classId}/semester-id`)
      .then(res => res.json())
      .then(data => setSemesterId(data));
    fetch(`${API_URL}/api/Class/${classId}/students`)
      .then(res => res.json())
      .then(data => setStudents(data || []));
    fetch(`${API_URL}/api/Class/${classId}/grade-components`)
      .then(res => res.json())
      .then(data => setGradeComponents(
        (data || []).map((g: any) => ({
          value: g.categoryExamId,
          label: g.categoryExamName
        }))
      ));
    fetch(`${API_URL}/api/Class/${classId}/subject-id`)
      .then(res => res.json())
      .then(data => setSubjectId(data));
    // Lấy danh sách kỳ
    fetch(`${API_URL}/api/Semesters`)
      .then(res => res.json())
      .then(data => {
        setSemesters(data || []);
      });
    // Lấy danh sách năm từ năm hiện tại về trước
    const currentYear = new Date().getFullYear();
    const yearArr = [];
    for (let y = currentYear; y >= 2020; y--) {
      yearArr.push({ value: y.toString(), label: y.toString() });
    }
    setYears(yearArr);
  }, [classId]);


  // Lấy danh sách đề thi khi mở popup hoặc khi đổi kỳ/năm
  const fetchExamPapers = async (semesterName: string | null, year: string | null) => {
      setLoadingExams(true);
      try {
        const teacherId = getUserIdFromToken();
        if (!subjectId) throw new Error('Không lấy được subjectId');
        const categoryId = selectedGradeComponent?.value;
        if (!categoryId) throw new Error('Vui lòng chọn đầu điểm');
        const examRes = await fetch(
          `${API_URL}/api/PracticeExam/exams_paper?subjectId=${subjectId}&categoryId=${categoryId}&teacherId=${teacherId}`
        );
        if (!examRes.ok) throw new Error('Không lấy được danh sách đề thi');
        const exams = await examRes.json();
        let filtered = exams || [];

        // Xác định giá trị mặc định nếu chưa chọn
        const semesterFilter = semesterName || semesters[0]?.semesterName;
        const yearFilter = year || years[0]?.value;

        filtered = filtered.filter(
          (e: PracticeExamPaperDTO) =>
            e.semester === semesterFilter &&
            e.year === yearFilter &&
            !selectedExams.some(se => se.pracExamPaperId === e.pracExamPaperId)
        );

        setExamPapers(filtered);
      } catch (err: any) {
        setExamPapers([]);
        alert(err.message || 'Lỗi lấy danh sách đề thi');
      } finally {
        setLoadingExams(false);
      }
    };
  // Khi mở popup chọn đề hoặc đổi kỳ/năm thì load lại đề
  useEffect(() => {
    if (showExamPopup) {
      fetchExamPapers(selectedSemester?.label ?? null, selectedYear?.value ?? null);
    }
    // eslint-disable-next-line
  }, [showExamPopup, selectedSemester, selectedYear, selectedGradeComponent, subjectId]);

  // Popup chọn sinh viên
  const handleOpenStudentPopup = () => setShowStudentPopup(true);

  const handleCheckStudent = (id: string, checked: boolean) => {
    setStudentChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllStudents = () => {
    const allChecked: Record<string, boolean> = {};
    students.forEach((sv: any) => {
      allChecked[sv.studentId] = true;
    });
    setStudentChecks(allChecked);
  };

  const handleUncheckAllStudents = () => {
    setStudentChecks({});
  };

  const handleConfirmStudents = () => {
    setSelectedStudents(students.filter((sv) => studentChecks[sv.studentId]));
    setShowStudentPopup(false);
  };

  // Popup chọn đề thi
  const handleOpenExamPopup = () => {
    setExamChecks({});
    setShowExamPopup(true);
    setSelectedSemester(null);
    setSelectedYear(null);
    setExamPapers([]);
  };

  const handleCheckExam = (id: number, checked: boolean) => {
    setExamChecks((prev) => ({ ...prev, [id]: checked }));
  };

  const handleCheckAllExams = () => {
    const allChecked: Record<number, boolean> = {};
    examPapers.forEach((exam) => {
      allChecked[exam.pracExamPaperId] = true;
    });
    setExamChecks(allChecked);
  };

  const handleUncheckAllExams = () => {
    setExamChecks({});
  };

  const handleSaveExams = () => {
    const selected = examPapers.filter((exam) => examChecks[exam.pracExamPaperId]);
    setSelectedExams(prev => [...prev, ...selected]);
    setShowExamPopup(false);
  };

  const handleRemoveExam = (id: number) => {
    setSelectedExams((prev) => prev.filter((c) => c.pracExamPaperId !== id));
  };

  // Xem chi tiết đề thi
  const handleShowDetail = async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/PracticeExamPaper/DetailExamPaper/${examPaperId}`);
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

  // Preview khi hover trong popup chọn đề thi
  const handleMouseEnterExam = async (exam: PracticeExamPaperDTO, e: React.MouseEvent) => {
    setPreviewPosition({ x: e.clientX, y: e.clientY });
    setHoveredExam(exam);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/PracticeExamPaper/DetailExamPaper/${exam.pracExamPaperId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetailData(data);
    } catch {
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  };
  const handleMouseLeaveExam = () => {
    setHoveredExam(null);
    setPreviewPosition(null);
    setDetailData(null);
  };

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const teacherId = getUserIdFromToken();
      if (!subjectId) throw new Error('Không lấy được subjectId');
      if (!selectedGradeComponent) throw new Error('Vui lòng chọn đầu điểm');
      if (!examName || !startDate || !endDate || !duration || !selectedExams.length || !selectedStudents.length) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }
       if (selectedStudents.length === 0) {
          throw new Error('Vui lòng chọn ít nhất 1 sinh viên!');
        }
      const payload = {
        pracExamName: examName,
        duration: duration,
        startDay: startDate,
        endDay: endDate,
        createAt: new Date().toISOString(),
        teacherId: teacherId,
        categoryExamId: selectedGradeComponent.value,
        subjectId: subjectId,
        status: "Chưa thi",
        classId: classId,
        semesterId: semesterId,
        practiceExamPaperDTO: selectedExams.map(e => ({
          pracExamPaperId: e.pracExamPaperId,
          pracExamPaperName: e.pracExamPaperName,
          year: Date.now().toString().slice(0, 4), // Lấy năm hiện tại
          semester: e.semester
        })),
        studentIds: selectedStudents.map((s: any) => s.studentId)
      };
      const res = await fetch(`${API_URL}/api/PracticeExam/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Tạo bài kiểm tra thất bại');
      alert('Tạo bài kiểm tra thành công!');
      router.push(`/teacher/myclass/classdetail/${classId.toString()}`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo bài kiểm tra');
    } finally {
      setIsSubmitting(false);
    }
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

  // Hàm chuyển trang tạo đề thi mới, bắt buộc chọn kỳ
  const handleCreateNewExamPaper = useCallback(() => {
    router.push(`/teacher/myexampaper/createexampaper/${classId}?semesterId=${semesterId}`);
  }, [router, classId, semesterId]);

  // Hàm parse answerContent thành các ý (nếu là JSON)
  interface GradingCriterion {
    criterionName: string;
    weightPercent: number;
    description: string;
  }
  const parseGradingCriteria = (answerContent: string): GradingCriterion[] => {
    if (!answerContent) return [];
    try {
      const parsed = JSON.parse(answerContent);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            item.criterionName &&
            item.description
        );
      }
    } catch {
      // Nếu không phải JSON thì trả về rỗng
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo bài kiểm tra tự luận</h1>
                <p className="text-gray-600">Thiết lập bài kiểm tra và phân công cho sinh viên</p>
              </div>
            </div>
            
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 font-medium text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sinh viên đã chọn</p>
                <p className="text-2xl font-bold text-blue-600">{selectedStudents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đề thi đã chọn</p>
                <p className="text-2xl font-bold text-green-600">{selectedExams.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thời lượng thi</p>
                <p className="text-2xl font-bold text-purple-600">{duration} phút</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Nhập tên bài kiểm tra"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đầu điểm <span className="text-red-500">*</span>
                </label>
                <Select
                  options={gradeComponents}
                  value={selectedGradeComponent}
                  onChange={setSelectedGradeComponent}
                  placeholder="Chọn đầu điểm"
                  styles={selectStyles}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div>
              
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học kỳ <span className="text-red-500">*</span>
                </label>
                <Select
                  options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                  value={selectedSemester}
                  onChange={setSelectedSemester}
                  placeholder="Chọn học kỳ"
                  styles={selectStyles}
                  noOptionsMessage={() => 'Không có dữ liệu'}
                />
              </div> */}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời lượng thi (phút) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Nhập thời lượng"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student & Exam Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Chọn sinh viên
              </h3>
              
              <button
                type="button"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                onClick={handleOpenStudentPopup}
              >
                <Users className="w-4 h-4" />
                <span>Chọn sinh viên tham gia</span>
              </button>
              
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">
                      Đã chọn {selectedStudents.length} sinh viên
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Exam Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Chọn đề thi
              </h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                  onClick={handleOpenExamPopup}
                >
                  <Search className="w-4 h-4" />
                  <span>Chọn đề thi có sẵn</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateNewExamPaper}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo đề thi mới</span>
                </button>
              </div>
              
              {selectedExams.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      Đã chọn {selectedExams.length} đề thi
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Exams Table */}
          {selectedExams.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Danh sách đề thi đã chọn ({selectedExams.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedExams.map((exam, idx) => (
                      <tr key={exam.pracExamPaperId} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {exam.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {exam.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveExam(exam.pracExamPaperId)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Xóa đề thi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">
                    Tổng số đề thi: <span className="text-purple-600 font-bold">{selectedExams.length}</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !examName || !startDate || !endDate || !duration || !selectedExams.length || !selectedStudents.length}
                    className="flex items-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Tạo bài kiểm tra</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button for Empty State */}
          {selectedExams.length === 0 && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !examName || !startDate || !endDate || !duration || !selectedExams.length || !selectedStudents.length}
                className="flex items-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Tạo bài kiểm tra</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Student Selection Modal */}
        {showStudentPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Danh sách sinh viên trong lớp
                  </h3>
                  <button
                    onClick={() => setShowStudentPopup(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllStudents}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleUncheckAllStudents}
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã sinh viên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((sv, idx) => (
                        <tr key={sv.studentId} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sv.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={!!studentChecks[sv.studentId]}
                              onChange={(e) => handleCheckStudent(sv.studentId, e.target.checked)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowStudentPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStudents}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exam Selection Modal */}
        {showExamPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-8">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[100vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Danh sách đề thi tự luận
                  </h3>
                  <button
                    onClick={() => setShowExamPopup(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                      <Select
                        options={semesters.map(s => ({ value: s.semesterId, label: s.semesterName }))}
                        value={selectedSemester || (semesters.length > 0 ? { value: semesters[0].semesterId, label: semesters[0].semesterName } : null)}
                        onChange={option => {
                          setSelectedSemester(option);
                          setExamPapers([]);
                        }}
                        placeholder="Chọn học kỳ"
                        isClearable
                        styles={selectStyles}
                      />
                    </div>
                    <div>
                      <Select
                        options={years}
                        value={selectedYear || (years.length > 0 ? years[0] : null)}
                        onChange={option => {
                          setSelectedYear(option);
                          setExamPapers([]);
                        }}
                        placeholder="Chọn năm"
                        isClearable
                        styles={selectStyles}
                      />
                    </div>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleCheckAllExams}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={handleUncheckAllExams}
                  >
                    <X className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                </div>
                
                {loadingExams ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 font-medium">Đang tải đề thi...</span>
                  </div>
                ) : examPapers.length > 0 ? (
                  <div className="overflow-x-auto max-h-[50vh] rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đề thi</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Năm</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chọn</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examPapers.map((exam, idx) => (
                          <tr
                            key={exam.pracExamPaperId}
                            className="hover:bg-blue-50 transition-colors duration-200"
                            onMouseEnter={e => handleMouseEnterExam(exam, e)}
                            onMouseLeave={handleMouseLeaveExam}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{exam.pracExamPaperName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {exam.semester}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {exam.year}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={!!examChecks[exam.pracExamPaperId]}
                                onChange={(e) => handleCheckExam(exam.pracExamPaperId, e.target.checked)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                onClick={() => handleShowDetail(exam.pracExamPaperId)}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Preview Tooltip */}
                    {hoveredExam && previewPosition && (
                      <div
                        style={{
                          position: 'fixed',
                          left: previewPosition.x + 20,
                          top: previewPosition.y - 20,
                          zIndex: 1000,
                        }}
                        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px] max-w-[420px] pointer-events-none"
                      >
                        {loadingDetail ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Đang tải chi tiết...</span>
                          </div>
                        ) : detailData ? (
                          <div className="space-y-2">
                            <div><strong>Tên đề thi:</strong> {detailData.pracExamPaperName}</div>
                            <div><strong>Môn học:</strong> {detailData.subjectName}</div>
                            <div><strong>Học kỳ:</strong> {detailData.semesterName}</div>
                            <div><strong>Danh mục:</strong> {detailData.categoryExamName}</div>
                            <div><strong>Trạng thái:</strong> {detailData.status}</div>
                            <div><strong>Ngày tạo:</strong> {new Date(detailData.createAt).toLocaleString()}</div>
                            <div><strong>Số câu hỏi:</strong> {detailData.questions.length}</div>
                          </div>
                        ) : (
                          <div>Không có dữ liệu chi tiết</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có đề thi nào</h3>
                    <p className="text-gray-600">Vui lòng chọn học kỳ và năm hoặc tạo đề thi mới</p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowExamPopup(false)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExams}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu đề thi đã chọn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 font-medium">Đang tải chi tiết...</span>
                  </div>
                ) : detailData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tên đề thi</label>
                        <p className="text-gray-900 font-semibold">{detailData.pracExamPaperName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Môn học</label>
                        <p className="text-gray-900">{detailData.subjectName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Học kỳ</label>
                        <p className="text-gray-900">{detailData.semesterName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Danh mục kỳ thi</label>
                        <p className="text-gray-900">{detailData.categoryExamName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {detailData.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Ngày tạo</label>
                        <p className="text-gray-900">{new Date(detailData.createAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                     <div>
                      <label className="block text-sm font-medium text-gray-600 mb-3">Danh sách câu hỏi</label>
                      <div className="space-y-4">
                        {detailData.questions.map(q => {
                          const criteria = parseGradingCriteria(q.answerContent);
                          return (
                            <div key={q.questionOrder} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                                  {q.questionOrder}
                                </span>
                                <span className="font-medium text-gray-900">Câu {q.questionOrder}</span>
                                <span className="ml-auto text-sm text-gray-600">Điểm: {q.score}</span>
                              </div>
                              <div className="mb-3">
                                <p className="text-gray-800">{q.content}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu chí chấm:</label>
                                {criteria.length > 0 ? (
                                  <ul className="list-disc pl-6 space-y-1">
                                    {criteria.map((c, i) => (
                                      <li key={i}>
                                        <span className="font-semibold">{c.criterionName}</span>
                                        {c.weightPercent ? (
                                          <span className="ml-2 text-xs text-blue-600">({c.weightPercent}%)</span>
                                        ) : null}
                                        : <span>{c.description}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{q.answerContent}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không có dữ liệu chi tiết</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}