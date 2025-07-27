'use client';

import React, { useState } from 'react';
import Select from 'react-select';

// Fake data
const subjectsByMajor: Record<string, { value: string; label: string }[]> = {
  IT: [
    { value: 'IT01', label: 'Lập trình C' },
    { value: 'IT02', label: 'Cơ sở dữ liệu' },
    { value: 'IT03', label: 'Mạng máy tính' },
  ],
  MATH: [
    { value: 'MATH01', label: 'Giải tích' },
    { value: 'MATH02', label: 'Đại số tuyến tính' },
    { value: 'MATH03', label: 'Xác suất thống kê' },
  ],
  ENG: [
    { value: 'ENG01', label: 'Tiếng Anh cơ bản' },
    { value: 'ENG02', label: 'Tiếng Anh nâng cao' },
    { value: 'ENG03', label: 'Tiếng Anh chuyên ngành' },
  ],
};

const majors = [
  { value: 'IT', label: 'Công nghệ thông tin' },
  { value: 'MATH', label: 'Toán học' },
  { value: 'ENG', label: 'Tiếng Anh' },
];

const semesters = [
  { value: '1', label: 'Kỳ 1' },
  { value: '2', label: 'Kỳ 2' },
  { value: '3', label: 'Kỳ 3' },
  { value: '4', label: 'Kỳ 4' },
];

const years = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

const initialStudents = [
  { id: 'SV001', name: 'Nguyễn Văn A' },
  { id: 'SV002', name: 'Trần Thị B' },
  { id: 'SV003', name: 'Phạm Văn C' },
  { id: 'SV004', name: 'Lê Thị D' },
  { id: 'SV005', name: 'Hoàng Văn E' },
];

const initialTeachers = [
  { id: 'GV001', name: 'Nguyễn Văn A' },
  { id: 'GV002', name: 'Trần Thị B' },
  { id: 'GV003', name: 'Phạm Văn C' },
  { id: 'GV004', name: 'Lê Thị D' },
  { id: 'GV005', name: 'Hoàng Văn E' },
];

const initialRooms = [
  { id: 'BE1344', name: 'Phòng BE1344' },
  { id: 'BE1345', name: 'Phòng BE1345' },
  { id: 'BE1346', name: 'Phòng BE1346' },
];

const fakeExams = [
  { id: 'EX01', name: 'Đề 1', type: 'Giữa kỳ', semester: '1', year: years[0].value },
  { id: 'EX02', name: 'Đề 2', type: 'Cuối kỳ', semester: '2', year: years[1].value },
  { id: 'EX03', name: 'Đề 3', type: 'Giữa kỳ', semester: '3', year: years[2].value },
];

// Modal component dùng Tailwind
function SimpleModal({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 animate-popup">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function CreateTestCalendarPage() {
  const [selectedMajor, setSelectedMajor] = useState<any>(majors[0]);
  const [selectedSubject, setSelectedSubject] = useState<any>(subjectsByMajor[majors[0].value][0]);
  const [selectedSemester, setSelectedSemester] = useState<any>(semesters[0]);
  const [selectedYear, setSelectedYear] = useState<any>(years[0]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [rooms, setRooms] = useState(initialRooms);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [splitRoom, setSplitRoom] = useState<any>(rooms[0]);
  const [splitSlot, setSplitSlot] = useState<any>({ value: '1', label: 'Slot 1' });
  const [splitTeacher, setSplitTeacher] = useState<any>(teachers[0]);
  const [splitDate, setSplitDate] = useState(fromDate);
  const [splitStudents, setSplitStudents] = useState(initialStudents);
  const [showSplitStudentModal, setShowSplitStudentModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(fakeExams[0]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  const slotOptions = [
    { value: '1', label: 'Slot 1' },
    { value: '2', label: 'Slot 2' },
    { value: '3', label: 'Slot 3' },
    { value: '4', label: 'Slot 4' },
  ];

  // Khi chọn ngành thì chọn lại môn đầu tiên
  const handleMajorChange = (option: any) => {
    setSelectedMajor(option);
    setSelectedSubject(subjectsByMajor[option.value][0]);
  };

  // Thêm/xóa sinh viên
  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      const newId = 'SV' + (students.length + 1).toString().padStart(3, '0');
      setStudents([...students, { id: newId, name: newStudentName }]);
      setNewStudentName('');
    }
  };
  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  // Thêm/xóa phòng thi
  const handleAddRoom = () => {
    if (newRoomName.trim()) {
      const newId = 'BE' + (Math.floor(Math.random() * 9000) + 1000);
      setRooms([...rooms, { id: newId, name: newRoomName }]);
      setNewRoomName('');
    }
  };
  const handleRemoveRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  // Thêm/xóa sinh viên chia phòng
  const handleAddSplitStudent = () => {
    if (newStudentName.trim()) {
      const newId = 'SV' + (splitStudents.length + 1).toString().padStart(3, '0');
      setSplitStudents([...splitStudents, { id: newId, name: newStudentName }]);
      setNewStudentName('');
    }
  };
  const handleRemoveSplitStudent = (id: string) => {
    setSplitStudents(splitStudents.filter(s => s.id !== id));
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-4xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo lịch thi</h2>
        <div className="bg-white rounded shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Dropdowns */}
            <div>
              <label className="block mb-1 font-semibold">Ngành</label>
              <Select
                options={majors}
                value={selectedMajor}
                onChange={handleMajorChange}
                isSearchable={false}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Môn học</label>
              <Select
                options={subjectsByMajor[selectedMajor.value]}
                value={selectedSubject}
                onChange={option => setSelectedSubject(option)}
                isSearchable={false}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Kỳ</label>
              <Select
                options={semesters}
                value={selectedSemester}
                onChange={option => setSelectedSemester(option)}
                isSearchable={false}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Năm</label>
              <Select
                options={years}
                value={selectedYear}
                onChange={option => setSelectedYear(option)}
                isSearchable={false}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Từ ngày</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Đến ngày</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
          {/* Danh sách sinh viên, giáo viên, phòng thi */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-1 font-semibold">Danh sách sinh viên</label>
              <button className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold mr-2" onClick={() => setShowStudentModal(true)}>
                Quản lý ({students.length})
              </button>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Giáo viên coi thi</label>
              <button className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold mr-2" onClick={() => setShowTeacherModal(true)}>
                Xem danh sách ({teachers.length})
              </button>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Danh sách phòng thi</label>
              <button className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold" onClick={() => setShowRoomModal(true)}>
                Quản lý ({rooms.length})
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-700" onClick={() => setShowSplit(true)}>
            Chia phòng thi
          </button>
        </div>

        {/* Chia phòng thi */}
        {showSplit && (
          <div className="bg-white rounded shadow p-6 mb-6 animate-popup">
            <h3 className="text-xl font-bold mb-4">Chia phòng thi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">Phòng thi</label>
                <Select
                  options={rooms.map(r => ({ value: r.id, label: r.name }))}
                  value={{ value: splitRoom.id, label: splitRoom.name }}
                  onChange={option => setSplitRoom(rooms.find(r => r.id === option.value))}
                  isSearchable={false}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Slot thi</label>
                <Select
                  options={slotOptions}
                  value={splitSlot}
                  onChange={option => setSplitSlot(option)}
                  isSearchable={false}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Giáo viên coi thi</label>
                <Select
                  options={teachers.map(t => ({ value: t.id, label: t.name }))}
                  value={{ value: splitTeacher.id, label: splitTeacher.name }}
                  onChange={option => setSplitTeacher(teachers.find(t => t.id === option.value))}
                  isSearchable={false}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Ngày thi</label>
                <input
                  type="date"
                  value={splitDate}
                  onChange={e => setSplitDate(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="mb-4">
              <button className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold" onClick={() => setShowSplitStudentModal(true)}>
                Quản lý danh sách sinh viên ({splitStudents.length})
              </button>
            </div>
            <div className="mb-4">
              <button className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold" onClick={() => setShowExamModal(true)}>
                Chọn đề thi
              </button>
              {selectedExam && (
                <div className="mt-2 p-2 border rounded bg-gray-50">
                  <div><b>Tên đề:</b> {selectedExam.name}</div>
                  <div><b>Loại đề:</b> {selectedExam.type}</div>
                  <div><b>Kỳ:</b> {selectedExam.semester}</div>
                  <div><b>Năm:</b> {selectedExam.year}</div>
                </div>
              )}
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700" onClick={() => alert('Đã lưu lịch thi!')}>
              Lưu
            </button>
          </div>
        )}

        {/* Popup quản lý sinh viên */}
        <SimpleModal show={showStudentModal} onClose={() => setShowStudentModal(false)} title="Quản lý sinh viên">
          <ul className="mb-4">
            {students.map(s => (
              <li key={s.id} className="flex justify-between items-center py-1">
                <span>{s.id} - {s.name}</span>
                <button className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm" onClick={() => handleRemoveStudent(s.id)}>Xóa</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
              placeholder="Tên sinh viên mới"
              className="border rounded px-2 py-1 flex-1"
            />
            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleAddStudent}>Thêm</button>
          </div>
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" onClick={() => setShowStudentModal(false)}>Đóng</button>
          </div>
        </SimpleModal>

        {/* Popup quản lý phòng thi */}
        <SimpleModal show={showRoomModal} onClose={() => setShowRoomModal(false)} title="Quản lý phòng thi">
          <ul className="mb-4">
            {rooms.map(r => (
              <li key={r.id} className="flex justify-between items-center py-1">
                <span>{r.id} - {r.name}</span>
                <button className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm" onClick={() => handleRemoveRoom(r.id)}>Xóa</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              placeholder="Tên phòng mới"
              className="border rounded px-2 py-1 flex-1"
            />
            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleAddRoom}>Thêm</button>
          </div>
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" onClick={() => setShowRoomModal(false)}>Đóng</button>
          </div>
        </SimpleModal>

        {/* Popup quản lý sinh viên chia phòng */}
        <SimpleModal show={showSplitStudentModal} onClose={() => setShowSplitStudentModal(false)} title="Quản lý sinh viên chia phòng">
          <ul className="mb-4">
            {splitStudents.map(s => (
              <li key={s.id} className="flex justify-between items-center py-1">
                <span>{s.id} - {s.name}</span>
                <button className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm" onClick={() => handleRemoveSplitStudent(s.id)}>Xóa</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
              placeholder="Tên sinh viên mới"
              className="border rounded px-2 py-1 flex-1"
            />
            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleAddSplitStudent}>Thêm</button>
          </div>
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" onClick={() => setShowSplitStudentModal(false)}>Đóng</button>
          </div>
        </SimpleModal>

        {/* Popup danh sách giáo viên */}
        <SimpleModal show={showTeacherModal} onClose={() => setShowTeacherModal(false)} title="Danh sách giáo viên coi thi">
          <ul>
            {teachers.map(t => (
              <li key={t.id}>{t.id} - {t.name}</li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" onClick={() => setShowTeacherModal(false)}>Đóng</button>
          </div>
        </SimpleModal>

        {/* Popup chọn đề thi */}
        <SimpleModal show={showExamModal} onClose={() => setShowExamModal(false)} title="Chọn đề thi">
          {fakeExams.map(exam => (
            <div key={exam.id} className="mb-3 p-2 border rounded cursor-pointer hover:bg-blue-100"
              onClick={() => { setSelectedExam(exam); setShowExamModal(false); }}>
              <div><b>Tên đề:</b> {exam.name}</div>
              <div><b>Loại đề:</b> {exam.type}</div>
              <div><b>Kỳ:</b> {exam.semester}</div>
              <div><b>Năm:</b> {exam.year}</div>
            </div>
          ))}
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" onClick={() => setShowExamModal(false)}>Đóng</button>
          </div>
        </SimpleModal>
      </div>
      <style jsx global>{`
        .animate-popup { animation: popup 0.2s }
        @keyframes popup {
          from { transform: scale(0.95); opacity: 0 }
         to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}