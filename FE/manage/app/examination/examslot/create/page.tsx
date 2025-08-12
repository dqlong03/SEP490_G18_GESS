"use client";
import { url } from "inspector";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from 'xlsx';

function Popup({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[500px] max-w-4xl max-h-[90vh] relative animate-popup overflow-hidden">
        <button
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          onClick={onClose}
        >
          ✕ Đóng
        </button>
        <div className="overflow-y-auto max-h-[80vh] pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}

const ExamSlotCreatePage = () => {
  const [major, setMajor] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [semester, setSemester] = useState<any>(null);
  const [roomPopup, setRoomPopup] = useState(false);
  const [studentPopup, setStudentPopup] = useState(false);
  const [teacherPopup, setTeacherPopup] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakTime, setBreakTime] = useState("");  const [createdSlots, setCreatedSlots] = useState<any[]>([]);
  const [teacherFileName, setTeacherFileName] = useState<string>('');
  const [teacherErrorMsg, setTeacherErrorMsg] = useState<string>('');
  const [studentFileName, setStudentFileName] = useState<string>('');
  const [studentErrorMsg, setStudentErrorMsg] = useState<string>('');
  const [studentListPopup, setStudentListPopup] = useState(false);
  const [selectedSlotStudents, setSelectedSlotStudents] = useState<any[]>([]);
  
  // API data states
  const [majors, setMajors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchMajors();
    fetchSemesters();
    fetchRooms();
  }, []);

  // Fetch subjects when major changes
  useEffect(() => {
    if (major?.value) {
      fetchSubjects(major.value);
    } else {
      setSubjects([]);
      setSubject(null);
    }
  }, [major]);

  const fetchMajors = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/CreateExamSlot/GetAllMajor');
      const data = await response.json();
      setMajors(data.map((item: any) => ({
        value: item.majorId,
        label: item.majorName,
        ...item
      })));
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchSubjects = async (majorId: number) => {
    try {
      const response = await fetch(`https://localhost:7074/api/MultipleExam/subject/${majorId}`);
      const data = await response.json();
      setSubjects(data.map((item: any) => ({
        value: item.subjectId,
        label: item.subjectName,
        ...item
      })));
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Semesters');
      const data = await response.json();
      setSemesters(data.map((item: any) => ({
        value: item.semesterId,
        label: item.semesterName,
        ...item
      })));
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/CreateExamSlot/GetAllRooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };
  const handleCreateSlots = async () => {
    if (!major || !subject || !semester || !date || !duration || !startTime || !endTime || !breakTime) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (selectedRooms.length === 0 || studentList.length === 0 || teacherList.length === 0) {
      alert('Vui lòng chọn phòng thi, danh sách sinh viên và giáo viên!');
      return;
    }

    setLoading(true);
    try {
      const selectedRoomData = rooms.filter(room => selectedRooms.includes(room.roomId));
        // Prepare students data
      const studentsData = studentList.map(student => ({
        email: student.email || "string",
        code: student.mssv || "string",
        fullName: student.name || "string",
        gender: student.gender === 'Nam',
        dateOfBirth: student.dob ? new Date(student.dob).toISOString() : new Date().toISOString(),
        urlAvatar: student.avatar || "https://randomuser.me/api/portraits/men/1.jpg"
      }));// Prepare teachers data  
      const teachersData = teacherList.map(teacher => ({
        teacherId: "2a96a929-c6a1-4501-fc19-08ddb5dca989", // Fixed teacher ID as requested
        userName: teacher.msgv || "string",
        email: teacher.email || "string",
        phoneNumber: "string",
        dateOfBirth: teacher.dob ? new Date(teacher.dob).toISOString() : new Date().toISOString(),
        fullname: teacher.name || "string",
        gender: teacher.gender === 'Nam',
        isActive: true,
        password: "string",
        code: teacher.msgv || "string",
        majorId: major?.value || 1,
        majorName: major?.label || "string",
        hireDate: new Date().toISOString()
      }));      // Prepare rooms data
      const roomsData = selectedRoomData.map(room => ({
        roomId: room.roomId,
        roomName: room.roomName || "string",
        description: room.description || "string",
        status: room.status || "string",
        capacity: room.capacity || 1
      }));      // Prepare grade teachers data
      const gradeTeachersData = teacherList.map(teacher => ({
        teacherId: "2a96a929-c6a1-4501-fc19-08ddb5dca989", // Fixed teacher ID
        fullName: teacher.name || "string"
      }));

      // Combine date and time
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);      const requestBody = {
        students: studentsData,
        teachers: teachersData,
        rooms: roomsData,
        gradeTeachers: gradeTeachersData,
        startDate: startDateTime.toISOString(),
        duration: parseInt(duration) || 1,
        startTimeInday: startDateTime.toISOString(),
        endTimeInDay: endDateTime.toISOString(),
        relaxationTime: parseInt(breakTime) || 1,
        optimizedByRoom: false,
        optimizedByTeacher: false,
        optimizedBySlotExam: true
      };

      const response = await fetch('https://localhost:7074/api/CreateExamSlot/CalculateExamSlot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to create exam slots');
      }

      const result = await response.json();
        // Process the result and update created slots
      const processedSlots = result.map((slot: any, index: number) => ({
        stt: index + 1,
        date: new Date(slot.date).toLocaleDateString('vi-VN'),
        startTime: new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        rooms: slot.rooms.map((r: any) => rooms.find(room => room.roomId === r.roomId)?.roomName).join(", "),
        teachers: slot.proctors.map((p: any) => p.fullName).join(", "),
        graders: slot.graders.map((g: any) => g.fullName).join(", "),
        students: slot.rooms.flatMap((r: any) => r.students),
        studentsDisplay: slot.rooms.flatMap((r: any) => r.students.map((s: any) => s.fullName)).join(", ")
      }));

      setCreatedSlots(processedSlots); // Replace instead of append
      alert('Tạo ca thi thành công!');
      
    } catch (error) {
      console.error('Error creating exam slots:', error);
      alert('Có lỗi xảy ra khi tạo ca thi!');
    } finally {
      setLoading(false);
    }
  };
  const handleStudentEdit = (idx: number, field: string, value: string) => {
    const newList = [...studentList];
    // @ts-ignore
    newList[idx][field] = value;
    setStudentList(newList);
  };

  // Download student template
  const handleDownloadStudentTemplate = () => {
    const header = ['Avatar', 'MSSV', 'Email', 'Giới tính', 'Ngày sinh', 'Họ và tên'];
    const rows = [
      ['https://randomuser.me/api/portraits/men/1.jpg', 'SV001', 'sv001@example.com', 'Nam', '2002-01-01', 'Nguyễn Văn A'],
      ['https://randomuser.me/api/portraits/women/2.jpg', 'SV002', 'sv002@example.com', 'Nữ', '2002-02-02', 'Trần Thị B'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
    XLSX.writeFile(wb, 'mau_sinh_vien.xlsx');
  };

  // Upload and validate student file
  const handleStudentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetInput = () => {
      if (e.target) e.target.value = '';
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      setStudentErrorMsg('');
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (json.length < 2) {
        setStudentErrorMsg('File phải có ít nhất 1 dòng dữ liệu sinh viên.');
        setStudentFileName('');
        resetInput();
        return;
      }
      const header = json[0];
      const requiredHeader = ['Avatar', 'MSSV', 'Email', 'Giới tính', 'Ngày sinh', 'Họ và tên'];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);
      if (!isHeaderValid) {
        setStudentErrorMsg('File mẫu không đúng định dạng hoặc thiếu trường thông tin!');
        setStudentFileName('');
        resetInput();
        return;
      }
      const dataArr = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 6 || row.some((cell: string, idx: number) => cell === '')) {
          setStudentErrorMsg(`Dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ tất cả trường!`);
          setStudentFileName('');
          resetInput();
          return;
        }
        const [avatar, mssv, email, gender, dob, name] = row;
        if (!isValidEmail(email)) {
          setStudentErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${email}`);
          setStudentFileName('');
          resetInput();
          return;
        }
        if (!isValidDate(dob)) {
          setStudentErrorMsg(`Ngày sinh không hợp lệ ở dòng ${i + 1}: ${dob} (Định dạng: YYYY-MM-DD)`);
          setStudentFileName('');
          resetInput();
          return;
        }
        dataArr.push({
          id: Date.now() + i,
          avatar,
          mssv,
          email,
          gender,
          dob,
          name,
        });
      }
      setStudentFileName(file.name);
      setStudentList(dataArr);
      setStudentErrorMsg('');
      resetInput();
    };
    reader.readAsArrayBuffer(file);
  };
  const handleTeacherEdit = (idx: number, field: string, value: string) => {
    const newList = [...teacherList];
    // @ts-ignore
    newList[idx][field] = value;
    setTeacherList(newList);
  };

  // Download teacher template
  const handleDownloadTeacherTemplate = () => {
    const header = ['Avatar', 'MSGV', 'Email', 'Giới tính', 'Ngày sinh', 'Họ và tên'];
    const rows = [
      ['https://randomuser.me/api/portraits/men/1.jpg', 'GV001', 'gv001@example.com', 'Nam', '1980-01-01', 'Thầy Nguyễn Văn A'],
      ['https://randomuser.me/api/portraits/women/2.jpg', 'GV002', 'gv002@example.com', 'Nữ', '1985-02-02', 'Cô Trần Thị B'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
    XLSX.writeFile(wb, 'mau_giao_vien.xlsx');
  };

  // Upload and validate teacher file
  const handleTeacherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const resetInput = () => {
      if (e.target) e.target.value = '';
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      setTeacherErrorMsg('');
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (json.length < 2) {
        setTeacherErrorMsg('File phải có ít nhất 1 dòng dữ liệu giáo viên.');
        setTeacherFileName('');
        resetInput();
        return;
      }
      const header = json[0];
      const requiredHeader = ['Avatar', 'MSGV', 'Email', 'Giới tính', 'Ngày sinh', 'Họ và tên'];
      const isHeaderValid = requiredHeader.every((h, idx) => header[idx] === h);
      if (!isHeaderValid) {
        setTeacherErrorMsg('File mẫu không đúng định dạng hoặc thiếu trường thông tin!');
        setTeacherFileName('');
        resetInput();
        return;
      }
      const dataArr = [];
      for (let i = 1; i < json.length; i++) {
        const row = json[i];
        if (row.length < 6 || row.some((cell: string, idx: number) => cell === '')) {
          setTeacherErrorMsg(`Dòng ${i + 1} thiếu thông tin. Vui lòng điền đầy đủ tất cả trường!`);
          setTeacherFileName('');
          resetInput();
          return;
        }
        const [avatar, msgv, email, gender, dob, name] = row;
        if (!isValidEmail(email)) {
          setTeacherErrorMsg(`Email không hợp lệ ở dòng ${i + 1}: ${email}`);
          setTeacherFileName('');
          resetInput();
          return;
        }
        if (!isValidDate(dob)) {
          setTeacherErrorMsg(`Ngày sinh không hợp lệ ở dòng ${i + 1}: ${dob} (Định dạng: YYYY-MM-DD)`);
          setTeacherFileName('');
          resetInput();
          return;
        }
        dataArr.push({
          id: Date.now() + i,
          avatar,
          msgv,
          email,
          gender,
          dob,
          name,
        });
      }
      setTeacherFileName(file.name);
      setTeacherList(dataArr);
      setTeacherErrorMsg('');
      resetInput();
    };
    reader.readAsArrayBuffer(file);
  };

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isValidDate(date: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  const handleViewStudents = (students: any[]) => {
    setSelectedSlotStudents(students);
    setStudentListPopup(true);
  };

  const handleSaveSlots = () => {
    alert('Lưu ca thi thành công!');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tạo Ca Thi</h1>
              <p className="text-gray-600 mt-1">Thiết lập và quản lý ca thi một cách dễ dàng</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            {/* Row 1: 5 fields */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Ngành</label>
                <Select 
                  options={majors} 
                  value={major} 
                  onChange={setMajor} 
                  placeholder="Chọn ngành..." 
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 48,
                      borderRadius: 12,
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Môn học</label>
                <Select 
                  options={subjects} 
                  value={subject} 
                  onChange={setSubject} 
                  placeholder="Chọn môn học..." 
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isDisabled={!major}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 48,
                      borderRadius: 12,
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Học kỳ</label>
                <Select 
                  options={semesters} 
                  value={semester} 
                  onChange={setSemester} 
                  placeholder="Chọn học kỳ..." 
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 48,
                      borderRadius: 12,
                      borderColor: '#e5e7eb',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#3b82f6' }
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Ngày thi</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Thời lượng (phút)</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Nhập thời lượng..."
                />
              </div>
            </div>

            {/* Row 2: 3 fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Giờ bắt đầu</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Giờ kết thúc</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Thời gian nghỉ (phút)</label>
                <input 
                  type="number" 
                  value={breakTime} 
                  onChange={e => setBreakTime(e.target.value)} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  placeholder="Nhập thời gian nghỉ..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setRoomPopup(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Chọn phòng thi
              </button>
              <button 
                onClick={() => setStudentPopup(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Danh sách sinh viên
              </button>
              <button 
                onClick={() => setTeacherPopup(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Danh sách giáo viên
              </button>
            </div>

            {/* Create Button */}
            <div className="pt-6 border-t border-gray-200">
              <button 
                onClick={handleCreateSlots}
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo ca thi...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tạo ca thi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>        {/* Popup phòng thi */}
        <Popup open={roomPopup} onClose={() => setRoomPopup(false)}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Chọn phòng thi</h3>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
                <table className="w-full bg-white">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold">Chọn</th>
                      <th className="py-4 px-6 text-left font-semibold">Tên phòng</th>
                      <th className="py-4 px-6 text-left font-semibold">Sức chứa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rooms.map((r, index) => (
                      <tr key={r.roomId} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-4 px-6">
                          <input 
                            type="checkbox" 
                            checked={selectedRooms.includes(r.roomId)} 
                            onChange={e => {
                              setSelectedRooms(e.target.checked ? [...selectedRooms, r.roomId] : selectedRooms.filter(id => id !== r.roomId));
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">{r.roomName}</td>
                        <td className="py-4 px-6 text-gray-700">{r.capacity} sinh viên</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedRooms.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-medium">
                    Đã chọn {selectedRooms.length} phòng thi
                  </p>
                </div>
              )}
            </div>
          </div>
        </Popup>{/* Popup sinh viên */}
        <Popup open={studentPopup} onClose={() => setStudentPopup(false)}>
          <h3 className="text-lg font-bold mb-4">Danh sách sinh viên</h3>
          <div className="flex gap-2 mb-4">
            <button 
              type="button"
              onClick={handleDownloadStudentTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
            >
              Tải file mẫu
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold cursor-pointer">
              Tải lên danh sách sinh viên
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleStudentUpload}
                className="hidden"
              />
            </label>
            {studentFileName && (
              <span className="text-gray-600 text-sm ml-2">{studentFileName}</span>
            )}
          </div>
          
          {/* Hiển thị lỗi */}
          {studentErrorMsg && (
            <div className="text-red-600 font-semibold mb-4">{studentErrorMsg}</div>
          )}
          
          <div className="overflow-x-auto rounded shadow bg-white w-full">
            <table className="min-w-[900px] w-full text-sm md:text-base border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <th className="py-2 px-2 border-b min-w-[60px] text-center">STT</th>
                  <th className="py-2 px-2 border-b min-w-[120px] text-center">Avatar</th>
                  <th className="py-2 px-2 border-b min-w-[100px] text-left">MSSV</th>
                  <th className="py-2 px-2 border-b min-w-[220px] text-left">Email</th>
                  <th className="py-2 px-2 border-b min-w-[100px] text-center">Giới tính</th>
                  <th className="py-2 px-2 border-b min-w-[140px] text-center">Ngày sinh</th>
                  <th className="py-2 px-2 border-b min-w-[200px] text-left">Họ và tên</th>
                  <th className="py-2 px-2 border-b min-w-[80px] text-center"></th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((sv, idx) => (
                  <tr key={sv.id} className="hover:bg-blue-50 transition">
                    <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <input
                        type="text"
                        value={sv.avatar || ''}
                        onChange={e => handleStudentEdit(idx, 'avatar', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="URL ảnh"
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <input
                        type="text"
                        value={sv.mssv || ''}
                        onChange={e => handleStudentEdit(idx, 'mssv', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <input
                        type="email"
                        value={sv.email || ''}
                        onChange={e => handleStudentEdit(idx, 'email', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <select
                        value={sv.gender || ''}
                        onChange={e => handleStudentEdit(idx, 'gender', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">--</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <input
                        type="date"
                        value={sv.dob || ''}
                        onChange={e => handleStudentEdit(idx, 'dob', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <input
                        type="text"
                        value={sv.name || ''}
                        onChange={e => handleStudentEdit(idx, 'name', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newList = studentList.filter((_, i) => i !== idx);
                          setStudentList(newList);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setStudentList([...studentList, { id: Date.now(), avatar: '', mssv: '', email: '', gender: '', dob: '', name: '' }])}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
              >
                Thêm sinh viên
              </button>
            </div>
          </div>        </Popup>

        {/* Popup giáo viên */}
        <Popup open={teacherPopup} onClose={() => setTeacherPopup(false)}>
          <h3 className="text-lg font-bold mb-4">Danh sách giáo viên coi thi</h3>
          <div className="flex gap-2 mb-4">
            <button 
              type="button"
              onClick={handleDownloadTeacherTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold"
            >
              Tải file mẫu
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold cursor-pointer">
              Tải lên danh sách giáo viên
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleTeacherUpload}
                className="hidden"
              />
            </label>
            {teacherFileName && (
              <span className="text-gray-600 text-sm ml-2">{teacherFileName}</span>
            )}
          </div>
          
          {/* Hiển thị lỗi */}
          {teacherErrorMsg && (
            <div className="text-red-600 font-semibold mb-4">{teacherErrorMsg}</div>
          )}
          
          <div className="overflow-x-auto rounded shadow bg-white w-full">
            <table className="min-w-[900px] w-full text-sm md:text-base border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <th className="py-2 px-2 border-b min-w-[60px] text-center">STT</th>
                  <th className="py-2 px-2 border-b min-w-[120px] text-center">Avatar</th>
                  <th className="py-2 px-2 border-b min-w-[100px] text-left">MSGV</th>
                  <th className="py-2 px-2 border-b min-w-[220px] text-left">Email</th>
                  <th className="py-2 px-2 border-b min-w-[100px] text-center">Giới tính</th>
                  <th className="py-2 px-2 border-b min-w-[140px] text-center">Ngày sinh</th>
                  <th className="py-2 px-2 border-b min-w-[200px] text-left">Họ và tên</th>
                  <th className="py-2 px-2 border-b min-w-[80px] text-center"></th>
                </tr>
              </thead>
              <tbody>
                {teacherList.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-blue-50 transition">
                    <td className="py-2 px-2 border-b text-center">{idx + 1}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <input
                        type="text"
                        value={t.avatar || ''}
                        onChange={e => handleTeacherEdit(idx, 'avatar', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="URL ảnh"
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <input
                        type="text"
                        value={t.msgv || ''}
                        onChange={e => handleTeacherEdit(idx, 'msgv', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <input
                        type="email"
                        value={t.email || ''}
                        onChange={e => handleTeacherEdit(idx, 'email', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <select
                        value={t.gender || ''}
                        onChange={e => handleTeacherEdit(idx, 'gender', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">--</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <input
                        type="date"
                        value={t.dob || ''}
                        onChange={e => handleTeacherEdit(idx, 'dob', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b">
                      <input
                        type="text"
                        value={t.name || ''}
                        onChange={e => handleTeacherEdit(idx, 'name', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newList = teacherList.filter((_, i) => i !== idx);
                          setTeacherList(newList);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setTeacherList([...teacherList, { id: Date.now(), avatar: '', msgv: '', email: '', gender: '', dob: '', name: '' }])}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold"
              >
                Thêm giáo viên
              </button>
            </div>
          </div>
        </Popup>        {/* Bảng ca thi đã tạo */}
        {createdSlots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Danh sách ca thi đã tạo</h3>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Ngày thi</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Bắt đầu</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Kết thúc</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phòng</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">GV coi thi</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">GV chấm thi</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Sinh viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {createdSlots.map((slot, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{slot.stt}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{slot.date}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{slot.startTime}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{slot.endTime}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{slot.rooms}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{slot.teachers}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{slot.graders}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleViewStudents(slot.students)}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem ({slot.students.length})
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={handleSaveSlots}
                className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu ca thi
              </button>
            </div>
          </div>
        )}        {/* Popup xem danh sách sinh viên của ca thi */}
        <Popup open={studentListPopup} onClose={() => setStudentListPopup(false)}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Danh sách sinh viên trong ca thi</h3>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
                <table className="w-full bg-white">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold">STT</th>
                      <th className="py-4 px-6 text-left font-semibold">Mã sinh viên</th>
                      <th className="py-4 px-6 text-left font-semibold">Họ và tên</th>
                      <th className="py-4 px-6 text-left font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSlotStudents.map((student, idx) => (
                      <tr key={idx} className={`hover:bg-green-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-4 px-6 font-medium text-gray-900">{idx + 1}</td>
                        <td className="py-4 px-6 text-gray-700 font-mono">{student.code}</td>
                        <td className="py-4 px-6 text-gray-800 font-medium">{student.fullName}</td>
                        <td className="py-4 px-6 text-gray-600">{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  Tổng số sinh viên: {selectedSlotStudents.length} người
                </p>
              </div>
            </div>
          </div>
        </Popup>
      </div>      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes popup {
          from { 
            transform: scale(0.95) translateY(-20px); 
            opacity: 0;
          }
          to { 
            transform: scale(1) translateY(0); 
            opacity: 1;
          }
        }
        .animate-popup { 
          animation: popup 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* React Select Custom Styles */
        .react-select__control {
          border-color: #e5e7eb !important;
          box-shadow: none !important;
          transition: all 0.2s !important;
        }
        .react-select__control:hover {
          border-color: #3b82f6 !important;
        }
        .react-select__control--is-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        .react-select__option--is-focused {
          background-color: #dbeafe !important;
          color: #1e40af !important;
        }
        .react-select__option--is-selected {
          background-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default ExamSlotCreatePage;