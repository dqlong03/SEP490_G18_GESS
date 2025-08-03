'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Settings, 
  Trash2, 
  Edit3, 
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  Award,
  Target
} from 'lucide-react';

const TEACHER_ID = '2A96A929-C6A1-4501-FC19-08DDB5DCA989';
const PAGE_SIZE = 10;

type Subject = {
  subjectId: number;
  subjectName: string;
  description: string;
  course: string;
  noCredits: number;
};

type Teacher = {
  teacherId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  fullname: string;
  gender: boolean;
  code: string;
  isActive: boolean;
  majorId: number;
  majorName: string | null;
  hireDate: string;
  isCreateExam?: boolean;
  isGraded?: boolean;
};

export default function SetRolePage() {
  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [teachersInSubject, setTeachersInSubject] = useState<Teacher[]>([]);
  const [teachersInMajor, setTeachersInMajor] = useState<Teacher[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch subjects
  useEffect(() => {
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/GetAllSubjectsByTeacherId?teacherId=${TEACHER_ID}`)
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data && data.length > 0) {
          setSelectedSubject({
            value: data[0].subjectId,
            label: data[0].subjectName,
            ...data[0],
          });
        }
      })
      .catch(() => toast.error('Không lấy được danh sách môn học'));
  }, []);

  // Fetch teachers in subject
  const fetchTeachersInSubject = () => {
    if (!selectedSubject) {
      setTeachersInSubject([]);
      return;
    }
    setLoading(true);
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/GetAllTeacherHaveSubject?subjectId=${selectedSubject.subjectId}&pageNumber=${page}&pageSize=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeachersInSubject(data);
        } else {
          setTeachersInSubject([]);
        }
      })
      .catch(() => {
        setTeachersInSubject([]);
        toast.error('Không lấy được danh sách giáo viên trong môn học');
      })
      .finally(() => setLoading(false));
    
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/CountPageNumberTeacherHaveSubject?subjectId=${selectedSubject.subjectId}&pageSize=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => setTotalPages(data))
      .catch(() => setTotalPages(1));
  };

  useEffect(() => {
    fetchTeachersInSubject();
    // eslint-disable-next-line
  }, [selectedSubject, page]);

  // Fetch teachers in major (for add modal)
  const fetchTeachersInMajor = () => {
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/GetAllTeacherInMajor?teacherId=${TEACHER_ID}`)
      .then(res => res.json())
      .then(data => setTeachersInMajor(data))
      .catch(() => toast.error('Không lấy được danh sách giáo viên trong ngành'));
  };

  // Add teacher to subject
  const handleAddTeacher = async (teacherId: string) => {
    if (!selectedSubject) {
      toast.warning('Vui lòng chọn môn học trước!');
      return;
    }
    try {
      await fetch(`https://localhost:7074/api/AssignGradeCreateExam/AddTeacherToSubject?teacherId=${teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'POST' });
      toast.success('Đã thêm giáo viên vào môn học!');
      fetchTeachersInMajor();
    } catch {
      toast.error('Có lỗi xảy ra khi thêm giáo viên!');
    }
  };

  // Remove teacher from subject
  const handleRemoveTeacher = async (teacherId: string) => {
    if (!selectedSubject) return;
    if (!window.confirm('Bạn chắc chắn muốn xóa giáo viên này khỏi môn học?')) return;
    try {
      await fetch(`https://localhost:7074/api/AssignGradeCreateExam/DeleteTeacherFromSubject?teacherId=${teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'DELETE' });
      toast.success('Đã xóa giáo viên khỏi môn học!');
      setTeachersInSubject(prev => prev.filter(t => t.teacherId !== teacherId));
    } catch {
      toast.error('Có lỗi xảy ra khi xóa giáo viên!');
    }
  };

  // Toggle role create exam
  const handleToggleCreateExam = async (teacher: Teacher) => {
    if (!selectedSubject) return;
    try {
      await fetch(`https://localhost:7074/api/AssignGradeCreateExam/AssignRoleCreateExam?teacherId=${teacher.teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'POST' });
      toast.success('Đã cập nhật quyền tạo bài kiểm tra!');
      setTeachersInSubject(prev =>
        prev.map(t =>
          t.teacherId === teacher.teacherId
            ? { ...t, isCreateExam: !t.isCreateExam }
            : t
        )
      );
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật quyền!');
    }
  };

  // Toggle role grade exam
  const handleToggleGradeExam = async (teacher: Teacher) => {
    if (!selectedSubject) return;
    try {
      await fetch(`https://localhost:7074/api/AssignGradeCreateExam/AssignRoleGradeExam?teacherId=${teacher.teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'POST' });
      toast.success('Đã cập nhật quyền chấm bài!');
      setTeachersInSubject(prev =>
        prev.map(t =>
          t.teacherId === teacher.teacherId
            ? { ...t, isGraded: !t.isGraded }
            : t
        )
      );
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật quyền!');
    }
  };

  // Subject options for react-select
  const subjectOptions = subjects.map(s => ({
    value: s.subjectId,
    label: s.subjectName,
    ...s,
  }));

  // Khi đóng modal, fetch lại danh sách giáo viên trong môn học
  const handleCloseModal = () => {
    setShowAddModal(false);
    setTimeout(() => {
      fetchTeachersInSubject();
    }, 300);
  };

  const createExamCount = teachersInSubject.filter(t => t.isCreateExam).length;
  const gradeExamCount = teachersInSubject.filter(t => t.isGraded).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý phân quyền giáo viên</h1>
              <p className="text-gray-600">Phân quyền tạo đề và chấm bài theo môn học</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {teachersInSubject.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng giáo viên</p>
                  <p className="text-2xl font-bold text-blue-600">{teachersInSubject.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Được tạo đề</p>
                  <p className="text-2xl font-bold text-green-600">{createExamCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Được chấm bài</p>
                  <p className="text-2xl font-bold text-purple-600">{gradeExamCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Chọn môn học và quản lý
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 min-w-80">
              <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
              <Select
                options={subjectOptions}
                value={selectedSubject ? subjectOptions.find(s => s.value === selectedSubject.subjectId) : null}
                onChange={option => { setSelectedSubject(option); setPage(1); }}
                placeholder="Chọn môn học để quản lý"
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
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (!selectedSubject) {
                  toast.warning('Vui lòng chọn môn học trước!');
                  return;
                }
                setShowAddModal(true);
                fetchTeachersInMajor();
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm giáo viên</span>
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Danh sách giáo viên ({teachersInSubject.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo đề</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chấm bài</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500 font-medium">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : teachersInSubject.length > 0 ? (
                  teachersInSubject.map((teacher, idx) => (
                    <tr key={teacher.teacherId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{teacher.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {teacher.fullname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.email}
                      </td>
                      
                      {/* Toggle tạo đề */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            teacher.isCreateExam ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                          onClick={() => handleToggleCreateExam(teacher)}
                          aria-pressed={teacher.isCreateExam}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                              teacher.isCreateExam ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      
                      {/* Toggle chấm bài */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            teacher.isGraded ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                          onClick={() => handleToggleGradeExam(teacher)}
                          aria-pressed={teacher.isGraded}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                              teacher.isGraded ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      
                      {/* Xóa */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          onClick={() => handleRemoveTeacher(teacher.teacherId)}
                          title="Xóa giáo viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có giáo viên nào</h3>
                      <p className="text-gray-600">Thêm giáo viên vào môn học để bắt đầu phân quyền</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Trang {page} / {totalPages}
              </span>
              
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Hiển thị {teachersInSubject.length} kết quả
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm giáo viên */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                  Thêm giáo viên vào môn học
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GV</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachersInMajor.length > 0 ? (
                      teachersInMajor.map(teacher => (
                        <tr key={teacher.teacherId} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{teacher.code}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {teacher.fullname}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                              onClick={() => handleAddTeacher(teacher.teacherId)}
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Thêm</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có giáo viên nào</h3>
                          <p className="text-gray-600">Tất cả giáo viên trong ngành đã được thêm vào môn học này</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Đóng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}