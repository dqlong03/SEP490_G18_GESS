'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fake data
const subjects = [
  { value: 'IT', label: 'Công nghệ thông tin' },
  { value: 'MATH', label: 'Toán học' },
  { value: 'ENG', label: 'Tiếng Anh' },
];

const roleOptions = [
  { value: 'create', label: 'Tạo đề' },
  { value: 'grade', label: 'Chấm thi' },
  { value: 'teacher', label: 'Giảng viên' },
];

// Mỗi môn 5 giáo viên, chỉ 1 người ra đề và 1 người chấm, còn lại là giảng viên
const fakeTeachers = [
  // IT
  { id: 'GV001', name: 'Nguyễn Văn A', phone: '0912345678', email: 'a.nguyen@gess.edu.vn', role: 'create', subject: 'IT' },
  { id: 'GV002', name: 'Trần Thị B', phone: '0987654321', email: 'b.tran@gess.edu.vn', role: 'grade', subject: 'IT' },
  { id: 'GV007', name: 'Phạm Văn G', phone: '0911111111', email: 'g.pham@gess.edu.vn', role: 'teacher', subject: 'IT' },
  { id: 'GV008', name: 'Lê Thị H', phone: '0922222222', email: 'h.le@gess.edu.vn', role: 'teacher', subject: 'IT' },
  { id: 'GV009', name: 'Hoàng Văn I', phone: '0933333333', email: 'i.hoang@gess.edu.vn', role: 'teacher', subject: 'IT' },
  // MATH
  { id: 'GV003', name: 'Phạm Văn C', phone: '0934567890', email: 'c.pham@gess.edu.vn', role: 'create', subject: 'MATH' },
  { id: 'GV004', name: 'Lê Thị D', phone: '0976543210', email: 'd.le@gess.edu.vn', role: 'grade', subject: 'MATH' },
  { id: 'GV010', name: 'Nguyễn Văn J', phone: '0944444444', email: 'j.nguyen@gess.edu.vn', role: 'teacher', subject: 'MATH' },
  { id: 'GV011', name: 'Trần Thị K', phone: '0955555555', email: 'k.tran@gess.edu.vn', role: 'teacher', subject: 'MATH' },
  { id: 'GV012', name: 'Phạm Văn L', phone: '0966666666', email: 'l.pham@gess.edu.vn', role: 'teacher', subject: 'MATH' },
  // ENG
  { id: 'GV005', name: 'Hoàng Văn E', phone: '0923456789', email: 'e.hoang@gess.edu.vn', role: 'create', subject: 'ENG' },
  { id: 'GV006', name: 'Đỗ Thị F', phone: '0965432109', email: 'f.do@gess.edu.vn', role: 'grade', subject: 'ENG' },
  { id: 'GV013', name: 'Lê Thị M', phone: '0977777777', email: 'm.le@gess.edu.vn', role: 'teacher', subject: 'ENG' },
  { id: 'GV014', name: 'Hoàng Văn N', phone: '0988888888', email: 'n.hoang@gess.edu.vn', role: 'teacher', subject: 'ENG' },
  { id: 'GV015', name: 'Đỗ Thị O', phone: '0999999999', email: 'o.do@gess.edu.vn', role: 'teacher', subject: 'ENG' },
];

type Teacher = typeof fakeTeachers[0];

export default function SetRolePage() {
  const [selectedSubject, setSelectedSubject] = useState<any>(subjects[0]);
  const [searchName, setSearchName] = useState('');
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Lọc dữ liệu
  const filteredTeachers = fakeTeachers.filter(
    (t) =>
      t.subject === selectedSubject?.value &&
      (!searchName || t.name.toLowerCase().includes(searchName.toLowerCase())) &&
      (!selectedRole || t.role === selectedRole.value)
  );

  const totalPages = Math.ceil(filteredTeachers.length / pageSize);
  const pagedTeachers = filteredTeachers.slice((page - 1) * pageSize, page * pageSize);

  // Đổi role (không validate, cho phép đổi bất kỳ ai)
  const handleChangeRole = (teacher: Teacher, newRole: any) => {
    teacher.role = newRole.value;
    toast.success(`Đã đổi role cho ${teacher.name} thành "${newRole.label}"!`, { position: 'top-center' });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-left">Quản lý ngành</h2>
        <form className="flex flex-wrap gap-2 md:gap-4 items-center mb-8">
          <div className="w-56">
            <Select
              options={subjects}
              value={selectedSubject}
              onChange={option => { setSelectedSubject(option); setPage(1); }}
              placeholder="Chọn ngành"
              isSearchable={false}
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
          <input
            type="text"
            placeholder="Tìm giáo viên theo tên"
            value={searchName}
            onChange={e => { setSearchName(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 transition w-56 h-10"
            style={{
              minHeight: '40px',
              borderColor: '#d1d5db',
              boxShadow: 'none',
            }}
          />
          <div className="w-44">
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={option => { setSelectedRole(option); setPage(1); }}
              placeholder="Tìm theo role"
              isClearable
              isSearchable={false}
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
            onClick={() => toast.info('Thêm giáo viên (demo)', { position: 'top-center' })}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold shadow"
          >
            + Thêm giáo viên
          </button>
        </form>
<div className="overflow-x-auto rounded shadow bg-white mb-4">
          <table className="w-full text-sm md:text-base border border-gray-200 table-fixed" style={{ minWidth: '1200px' }}>
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-2 px-2 border-b w-44 text-center">Role</th>
                <th className="py-2 px-2 border-b w-20 text-center">STT</th>
                <th className="py-2 px-2 border-b w-40 text-left">Mã GV</th>
                <th className="py-2 px-2 border-b w-64 text-left">Tên GV</th>
                <th className="py-2 px-2 border-b w-44 text-left">SĐT</th>
                <th className="py-2 px-2 border-b w-72 text-left">Mail</th>
              </tr>
            </thead>
            <tbody>
              {pagedTeachers.length > 0 ? pagedTeachers.map((teacher, idx) => (
                <tr key={teacher.id} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-2 border-b text-center">
                    <Select
                      options={roleOptions}
                      value={roleOptions.find(r => r.value === teacher.role)}
                      onChange={option => {
                        if (option && option.value !== teacher.role) {
                          if (window.confirm(`Bạn có chắc muốn đổi role cho ${teacher.name} thành "${option.label}"?`)) {
                            handleChangeRole(teacher, option);
                          }
                        }
                      }}
                      isSearchable={false}
                      styles={{
                        menu: provided => ({ ...provided, zIndex: 30 }),
                        control: provided => ({
                          ...provided,
                          minHeight: '32px',
                          borderColor: '#d1d5db',
                          boxShadow: 'none',
                          width: '140px',
                        }),
                      }}
                    />
                  </td>
                  <td className="py-2 px-2 border-b text-center">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 border-b">{teacher.id}</td>
                  <td className="py-2 px-2 border-b">{teacher.name}</td>
                  <td className="py-2 px-2 border-b">{teacher.phone}</td>
                  <td className="py-2 px-2 border-b">{teacher.email}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
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
      <ToastContainer />
      <style jsx global>{`
        .table-fixed { table-layout: fixed; }
      `}</style>
      </div>
  );
}