// CreateExamSlotRoomClient.tsx
'use client';

import React, { Suspense } from 'react';
import Select from 'react-select';
import { useCreateExamSlotRoom } from '@/hooks/teacher/useCreateExamSlotRoom';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Đang tải...</span>
  </div>
);

// Modal component using Tailwind
function SimpleModal({ 
  show, 
  onClose, 
  title, 
  children 
}: { 
  show: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6 animate-popup">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Main component content
function CreateExamSlotRoomContent() {
  const {
    // Loading states
    isLoading,
    isSaving,

    // Data
    majors,
    semesters,
    years,
    students,
    teachers,
    rooms,
    exams,
    slotOptions,

    // Selected states
    selectedMajor,
    selectedSubject,
    selectedSemester,
    selectedYear,
    selectedExam,

    // Date states
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    splitDate,
    setSplitDate,

    // Split room states
    splitRoom,
    setSplitRoom,
    splitSlot,
    setSplitSlot,
    splitTeacher,
    setSplitTeacher,
    splitStudents,

    // Modal states
    showStudentModal,
    setShowStudentModal,
    showTeacherModal,
    setShowTeacherModal,
    showRoomModal,
    setShowRoomModal,
    showSplitStudentModal,
    setShowSplitStudentModal,
    showExamModal,
    setShowExamModal,
    showSplit,
    setShowSplit,

    // Form states
    newStudentName,
    setNewStudentName,
    newRoomName,
    setNewRoomName,

    // Actions
    setSelectedSubject,
    setSelectedSemester,
    setSelectedYear,
    setSelectedExam,
    handleMajorChange,
    handleAddStudent,
    handleRemoveStudent,
    handleAddRoom,
    handleRemoveRoom,
    handleAddSplitStudent,
    handleRemoveSplitStudent,
    handleSaveExamSlot,
    getSubjectsForCurrentMajor
  } = useCreateExamSlotRoom();

  // Get subjects for current major
  const [subjectsForMajor, setSubjectsForMajor] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadSubjects = async () => {
      const subjects = await getSubjectsForCurrentMajor();
      setSubjectsForMajor(subjects);
    };
    loadSubjects();
  }, [getSubjectsForCurrentMajor]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans p-0">
      <div className="max-w-4xl mx-auto py-8 px-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-left">Tạo lịch thi</h2>
        
        <div className="bg-white rounded shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Major Selection */}
            <div>
              <label className="block mb-1 font-semibold">Ngành</label>
              <Select
                options={majors}
                value={selectedMajor}
                onChange={(option) => option && handleMajorChange(option)}
                isSearchable={false}
                placeholder="Chọn ngành..."
              />
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block mb-1 font-semibold">Môn học</label>
              <Select
                options={subjectsForMajor}
                value={selectedSubject}
                onChange={(option) => setSelectedSubject(option)}
                isSearchable={false}
                placeholder="Chọn môn học..."
              />
            </div>

            {/* Semester Selection */}
            <div>
              <label className="block mb-1 font-semibold">Kỳ</label>
              <Select
                options={semesters}
                value={selectedSemester}
                onChange={(option) => setSelectedSemester(option)}
                isSearchable={false}
                placeholder="Chọn kỳ..."
              />
            </div>

            {/* Year Selection */}
            <div>
              <label className="block mb-1 font-semibold">Năm</label>
              <Select
                options={years}
                value={selectedYear}
                onChange={(option) => setSelectedYear(option)}
                isSearchable={false}
                placeholder="Chọn năm..."
              />
            </div>

            {/* From Date */}
            <div>
              <label className="block mb-1 font-semibold">Từ ngày</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block mb-1 font-semibold">Đến ngày</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Management Buttons */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block mb-1 font-semibold">Danh sách sinh viên</label>
              <button 
                className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold mr-2" 
                onClick={() => setShowStudentModal(true)}
              >
                Quản lý ({students.length})
              </button>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Giáo viên coi thi</label>
              <button 
                className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold mr-2" 
                onClick={() => setShowTeacherModal(true)}
              >
                Xem danh sách ({teachers.length})
              </button>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Danh sách phòng thi</label>
              <button 
                className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold" 
                onClick={() => setShowRoomModal(true)}
              >
                Quản lý ({rooms.length})
              </button>
            </div>
          </div>

          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-700" 
            onClick={() => setShowSplit(true)}
          >
            Chia phòng thi
          </button>
        </div>

        {/* Split Room Section */}
        {showSplit && (
          <div className="bg-white rounded shadow p-6 mb-6 animate-popup">
            <h3 className="text-xl font-bold mb-4">Chia phòng thi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Room Selection */}
              <div>
                <label className="block mb-1 font-semibold">Phòng thi</label>
                <Select
                  options={rooms.map(r => ({ value: r.id, label: r.name }))}
                  value={splitRoom ? { value: splitRoom.id, label: splitRoom.name } : null}
                  onChange={(option) => {
                    const room = rooms.find(r => r.id === option?.value);
                    setSplitRoom(room || null);
                  }}
                  isSearchable={false}
                  placeholder="Chọn phòng thi..."
                />
              </div>

              {/* Slot Selection */}
              <div>
                <label className="block mb-1 font-semibold">Slot thi</label>
                <Select
                  options={slotOptions}
                  value={splitSlot}
                  onChange={(option) => setSplitSlot(option)}
                  isSearchable={false}
                  placeholder="Chọn slot..."
                />
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block mb-1 font-semibold">Giáo viên coi thi</label>
                <Select
                  options={teachers.map(t => ({ value: t.id, label: t.name }))}
                  value={splitTeacher ? { value: splitTeacher.id, label: splitTeacher.name } : null}
                  onChange={(option) => {
                    const teacher = teachers.find(t => t.id === option?.value);
                    setSplitTeacher(teacher || null);
                  }}
                  isSearchable={false}
                  placeholder="Chọn giáo viên..."
                />
              </div>

              {/* Exam Date */}
              <div>
                <label className="block mb-1 font-semibold">Ngày thi</label>
                <input
                  type="date"
                  value={splitDate}
                  onChange={(e) => setSplitDate(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            {/* Split Students Management */}
            <div className="mb-4">
              <button 
                className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold" 
                onClick={() => setShowSplitStudentModal(true)}
              >
                Quản lý danh sách sinh viên ({splitStudents.length})
              </button>
            </div>

            {/* Exam Selection */}
            <div className="mb-4">
              <button 
                className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 font-semibold" 
                onClick={() => setShowExamModal(true)}
              >
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

            {/* Save Button */}
            <button 
              className={`px-4 py-2 text-white rounded font-semibold shadow ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleSaveExamSlot}
              disabled={isSaving}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        )}

        {/* Student Management Modal */}
        <SimpleModal 
          show={showStudentModal} 
          onClose={() => setShowStudentModal(false)} 
          title="Quản lý sinh viên"
        >
          <ul className="mb-4 max-h-60 overflow-y-auto">
            {students.map(s => (
              <li key={s.id} className="flex justify-between items-center py-1">
                <span>{s.id} - {s.name}</span>
                <button 
                  className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm" 
                  onClick={() => handleRemoveStudent(s.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Tên sinh viên mới"
              className="border rounded px-2 py-1 flex-1"
            />
            <button 
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" 
              onClick={handleAddStudent}
            >
              Thêm
            </button>
          </div>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" 
              onClick={() => setShowStudentModal(false)}
            >
              Đóng
            </button>
          </div>
        </SimpleModal>

        {/* Room Management Modal */}
        <SimpleModal 
          show={showRoomModal} 
          onClose={() => setShowRoomModal(false)} 
          title="Quản lý phòng thi"
        >
          <ul className="mb-4 max-h-60 overflow-y-auto">
            {rooms.map(r => (
              <li key={r.id} className="flex justify-between items-center py-1">
                <span>{r.id} - {r.name}</span>
                <button 
                  className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm" 
                  onClick={() => handleRemoveRoom(r.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Tên phòng mới"
              className="border rounded px-2 py-1 flex-1"
            />
            <button 
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" 
              onClick={handleAddRoom}
            >
              Thêm
            </button>
          </div>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" 
              onClick={() => setShowRoomModal(false)}
            >
              Đóng
            </button>
          </div>
        </SimpleModal>

        {/* Split Students Management Modal */}
        <SimpleModal 
          show={showSplitStudentModal} 
          onClose={() => setShowSplitStudentModal(false)} 
          title="Quản lý sinh viên chia phòng"
        >
          <ul className="mb-4 max-h-60 overflow-y-auto">
            {splitStudents.map(s => (
              <li key={s.id} className="flex justify-between items-center py-1">
                <span>{s.id} - {s.name}</span>
                <button 
                  className="ml-2 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-sm" 
                  onClick={() => handleRemoveSplitStudent(s.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Tên sinh viên mới"
              className="border rounded px-2 py-1 flex-1"
            />
            <button 
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" 
              onClick={handleAddSplitStudent}
            >
              Thêm
            </button>
          </div>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" 
              onClick={() => setShowSplitStudentModal(false)}
            >
              Đóng
            </button>
          </div>
        </SimpleModal>

        {/* Teacher List Modal */}
        <SimpleModal 
          show={showTeacherModal} 
          onClose={() => setShowTeacherModal(false)} 
          title="Danh sách giáo viên coi thi"
        >
          <ul className="max-h-60 overflow-y-auto">
            {teachers.map(t => (
              <li key={t.id} className="py-1">{t.id} - {t.name}</li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" 
              onClick={() => setShowTeacherModal(false)}
            >
              Đóng
            </button>
          </div>
        </SimpleModal>

        {/* Exam Selection Modal */}
        <SimpleModal 
          show={showExamModal} 
          onClose={() => setShowExamModal(false)} 
          title="Chọn đề thi"
        >
          <div className="max-h-60 overflow-y-auto">
            {exams.map(exam => (
              <div 
                key={exam.id} 
                className="mb-3 p-2 border rounded cursor-pointer hover:bg-blue-100"
                onClick={() => { 
                  setSelectedExam(exam); 
                  setShowExamModal(false); 
                }}
              >
                <div><b>Tên đề:</b> {exam.name}</div>
                <div><b>Loại đề:</b> {exam.type}</div>
                <div><b>Kỳ:</b> {exam.semester}</div>
                <div><b>Năm:</b> {exam.year}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-semibold" 
              onClick={() => setShowExamModal(false)}
            >
              Đóng
            </button>
          </div>
        </SimpleModal>
      </div>

      <style jsx global>{`
        .animate-popup { 
          animation: popup 0.2s;
        }
        @keyframes popup {
          from { 
            transform: scale(0.95); 
            opacity: 0;
          }
          to { 
            transform: scale(1); 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Main export with Suspense wrapper
export default function CreateExamSlotRoomClient() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreateExamSlotRoomContent />
    </Suspense>
  );
}
