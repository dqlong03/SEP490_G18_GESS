'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
}, []);;

  // Fetch teachers in subject
  const fetchTeachersInSubject = () => {
    if (!selectedSubject) {
      setTeachersInSubject([]); // Không có môn học thì cũng clear bảng
      return;
    }
    setLoading(true);
    fetch(`https://localhost:7074/api/AssignGradeCreateExam/GetAllTeacherHaveSubject?subjectId=${selectedSubject.subjectId}&pageNumber=${page}&pageSize=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTeachersInSubject(data);
        } else {
          setTeachersInSubject([]); // Không có dữ liệu
        }
      })
      .catch(() => {
        setTeachersInSubject([]); // Lỗi cũng clear bảng
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

  // Add teacher to subject (giữ popup, chỉ toast và cập nhật lại danh sách major)
  const handleAddTeacher = async (teacherId: string) => {
    if (!selectedSubject) {
      toast.warning('Vui lòng chọn môn học trước!');
      return;
    }
    await fetch(`https://localhost:7074/api/AssignGradeCreateExam/AddTeacherToSubject?teacherId=${teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'POST' });
    toast.success('Đã thêm giáo viên vào môn học!');
    // Sau khi thêm, fetch lại danh sách giáo viên ngành để loại bỏ những người đã thêm
    fetchTeachersInMajor();
  };

  // Remove teacher from subject
  const handleRemoveTeacher = async (teacherId: string) => {
    if (!selectedSubject) return;
    if (!window.confirm('Bạn chắc chắn muốn xóa giáo viên này khỏi môn học?')) return;
    await fetch(`https://localhost:7074/api/AssignGradeCreateExam/DeleteTeacherFromSubject?teacherId=${teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'DELETE' });
    toast.success('Đã xóa giáo viên khỏi môn học!');
    setTeachersInSubject(prev => prev.filter(t => t.teacherId !== teacherId));
  };

  // Toggle role create exam
  const handleToggleCreateExam = async (teacher: Teacher) => {
    if (!selectedSubject) return;
    await fetch(`https://localhost:7074/api/AssignGradeCreateExam/AssignRoleCreateExam?teacherId=${teacher.teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'POST' });
    toast.success('Đã cập nhật quyền tạo bài kiểm tra!');
    // Cập nhật lại trạng thái toggle ngay trên UI
    setTeachersInSubject(prev =>
      prev.map(t =>
        t.teacherId === teacher.teacherId
          ? { ...t, isCreateExam: !t.isCreateExam }
          : t
      )
    );
  };

  // Toggle role grade exam
  const handleToggleGradeExam = async (teacher: Teacher) => {
    if (!selectedSubject) return;
    await fetch(`https://localhost:7074/api/AssignGradeCreateExam/AssignRoleGradeExam?teacherId=${teacher.teacherId}&subjectId=${selectedSubject.subjectId}`, { method: 'POST' });
    toast.success('Đã cập nhật quyền chấm bài!');
    setTeachersInSubject(prev =>
      prev.map(t =>
        t.teacherId === teacher.teacherId
          ? { ...t, isGraded: !t.isGraded }
          : t
      )
    );
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

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý phân quyền giáo viên theo môn học</h2>
        <div className="flex flex-wrap gap-2 md:gap-4 items-center mb-8">
          <div className="w-72">
            <Select
              options={subjectOptions}
              value={selectedSubject ? subjectOptions.find(s => s.value === selectedSubject.subjectId) : null}
              onChange={option => { setSelectedSubject(option); setPage(1); }}
              placeholder="Chọn môn học"
              isSearchable
              styles={{
                menu: provided => ({ ...provided, zIndex: 20 }),
                control: provided => ({
                  ...provided,
                  minHeight: '40px',
                  borderColor: '#d1d5db',
                  boxShadow: 'none',
                }),
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
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold shadow"
          >
            + Thêm giáo viên
          </button>
        </div>

       {/* Table teachers in subject */}
      <div className="rounded shadow bg-white mb-4">
        <table className="w-full text-sm md:text-base border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700 font-semibold">
              <th className="py-2 px-2 border-b text-center">STT</th>
              <th className="py-2 px-2 border-b text-left">Mã GV</th>
              <th className="py-2 px-2 border-b text-left">Tên GV</th>
              <th className="py-2 px-2 border-b text-left">SĐT</th>
              <th className="py-2 px-2 border-b text-left">Mail</th>
              <th className="py-2 px-2 border-b text-center">Tạo đề</th>
              <th className="py-2 px-2 border-b text-center">Chấm bài</th>
              <th className="py-2 px-2 border-b text-center">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">Đang tải...</td>
              </tr>
            ) : teachersInSubject.length > 0 ? teachersInSubject.map((teacher, idx) => (
              <tr key={teacher.teacherId} className="hover:bg-blue-50 transition">
                <td className="py-2 px-2 border-b text-center">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="py-2 px-2 border-b">{teacher.code}</td>
                <td className="py-2 px-2 border-b">{teacher.fullname}</td>
                <td className="py-2 px-2 border-b">{teacher.phoneNumber}</td>
                <td className="py-2 px-2 border-b">{teacher.email}</td>
                {/* Toggle tạo đề */}
                <td className="py-2 px-2 border-b text-center">
                  <button
                    type="button"
                    className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${teacher.isCreateExam ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => handleToggleCreateExam(teacher)}
                    aria-pressed={teacher.isCreateExam}
                  >
                    <span
                      className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${teacher.isCreateExam ? 'translate-x-6' : ''}`}
                    />
                  </button>
                </td>
                {/* Toggle chấm bài */}
                <td className="py-2 px-2 border-b text-center">
                  <button
                    type="button"
                    className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${teacher.isGraded ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => handleToggleGradeExam(teacher)}
                    aria-pressed={teacher.isGraded}
                  >
                    <span
                      className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${teacher.isGraded ? 'translate-x-6' : ''}`}
                    />
                  </button>
                </td>
                {/* Xóa */}
                <td className="py-2 px-2 border-b text-center">
                  <button
                    className="text-red-500 hover:text-red-700 font-semibold"
                    onClick={() => handleRemoveTeacher(teacher.teacherId)}
                  >Xóa</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  Không có giáo viên nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        <div className="mt-2 flex flex-wrap justify-left items-center gap-2 text-base ">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="mx-2 font-semibold">
            Trang {page} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Modal thêm giáo viên */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[700px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Thêm giáo viên vào môn học</h3>
            <table className="w-full mb-4 border">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <th className="py-2 px-2 border-b">Mã GV</th>
                  <th className="py-2 px-2 border-b">Tên GV</th>
                  <th className="py-2 px-2 border-b">SĐT</th>
                  <th className="py-2 px-2 border-b">Mail</th>
                  <th className="py-2 px-2 border-b">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {teachersInMajor.length > 0 ? teachersInMajor.map(teacher => (
                  <tr key={teacher.teacherId}>
                    <td className="py-2 px-2 border-b">{teacher.code}</td>
                    <td className="py-2 px-2 border-b">{teacher.fullname}</td>
                    <td className="py-2 px-2 border-b">{teacher.phoneNumber}</td>
                    <td className="py-2 px-2 border-b">{teacher.email}</td>
                    <td className="py-2 px-2 border-b">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition font-semibold"
                        onClick={() => handleAddTeacher(teacher.teacherId)}
                      >
                        Thêm
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      Không có giáo viên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold"
                onClick={handleCloseModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
      <style jsx global>{`
        .table-fixed { table-layout: fixed; }
      `}</style>
    </div>
  );
}