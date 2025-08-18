"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import CustomTimePicker from "@/components/examination/CustomTimePicker"; // hoặc đường dẫn phù hợp

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
const examTypeOptions = [
  { value: "Multiple", label: "Trắc nghiệm" },
  { value: "Practice", label: "Tự luận" },
];

const ExamSlotCreatePage = () => {
  const [major, setMajor] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [semester, setSemester] = useState<any>(null);
  const [roomPopup, setRoomPopup] = useState(false);
  const [studentPopup, setStudentPopup] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [startTime, setStartTime] = useState<string>("");
const [endTime, setEndTime] = useState<string>("");
  const [breakTime, setBreakTime] = useState("");
  const [createdSlots, setCreatedSlots] = useState<any[]>([]);
  const [studentFileName, setStudentFileName] = useState<string>('');
  const [studentErrorMsg, setStudentErrorMsg] = useState<string>('');
  const [studentListPopup, setStudentListPopup] = useState(false);
  const [selectedSlotStudents, setSelectedSlotStudents] = useState<any[]>([]);
  const [examType, setExamType] = useState<'Multiple' | 'Practice'>('Multiple');
  const [optimizationType, setOptimizationType] = useState<'room' | 'slot'>('slot');
  const [slotName, setSlotName] = useState('');
  const [majors, setMajors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMajors();
    fetchSemesters();
    fetchRooms();
  }, []);

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

  const validateForm = () => {
    if (!major || !subject || !semester || !date || !duration || !startTime || !endTime || !slotName) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    if (examDate < today) {
      alert('Ngày thi phải lớn hơn hoặc bằng ngày hiện tại!');
      return false;
    }
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const durationMinutes = parseInt(duration) || 0;
    const startPlusDuration = new Date(start.getTime() + durationMinutes * 60000);
    if (startPlusDuration > end) {
      alert('Giờ bắt đầu cộng thời lượng phải nhỏ hơn hoặc bằng giờ kết thúc!');
      return false;
    }
    if (selectedRooms.length === 0 || studentList.length === 0) {
      alert('Vui lòng chọn phòng thi và danh sách sinh viên!');
      return false;
    }
    return true;
  };

  const handleCreateSlots = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const selectedRoomData = rooms.filter(room => selectedRooms.includes(room.roomId));
      const studentsData = studentList.map(student => ({
        email: student.email || "string",
        code: student.mssv || "string",
        fullName: student.name || "string",
        gender: student.gender === 'Nam' || student.gender === true,
        dateOfBirth: student.dob ? new Date(student.dob).toISOString() : new Date().toISOString(),
        urlAvatar: student.avatar || "https://randomuser.me/api/portraits/men/1.jpg"
      }));
      const roomsData = selectedRoomData.map(room => ({
        roomId: room.roomId,
        roomName: room.roomName || "string",
        description: room.description || "string",
        status: room.status || "string",
        capacity: room.capacity || 1
      }));

      
      // Chuyển sang giờ Việt Nam (UTC+7)
        const toVNISOString = (date: Date) => {
          // KHÔNG cộng thêm 7 tiếng nữa!
          return date.toISOString();
        };

      // Tạo các đối tượng Date cùng ngày, khác giờ
      const examDateObj = new Date(date + "T00:00:00");
      const startDateTime = new Date(date + "T" + startTime);
      const endDateTime = new Date(date + "T" + endTime);

    
      const requestBody = {
        students: studentsData,
        rooms: roomsData,
         startDate: toVNISOString(startDateTime),
        duration: parseInt(duration) || 1,
        startTimeInday: toVNISOString(startDateTime),
        endTimeInDay: toVNISOString(endDateTime),
        relaxationTime: parseInt(breakTime) || 1,
        optimizedByRoom: optimizationType === 'room',
        optimizedBySlotExam: optimizationType === 'slot',
        slotName: slotName,
        subjectId: subject?.value || 1,
        semesterId: semester?.value || 1
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
      // Dự liệu bảng dựa vào response body mới
      const processedSlots = result.map((slot: any, index: number) => ({
        stt: index + 1,
       date: new Date(slot.date).toLocaleDateString('vi-VN'),
        startTime: new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        rooms: slot.rooms.map((r: any) => rooms.find(room => room.roomId === r.roomId)?.roomName).join(", "),
        students: slot.rooms.flatMap((r: any) => r.students),
        studentsDisplay: slot.rooms.flatMap((r: any) => r.students.map((s: any) => s.fullName)).join(", "),
        slotName: slot.slotName,
        status: slot.status,
        multiOrPractice: slot.multiOrPractice,
        originalData: slot
      }));
      setCreatedSlots(processedSlots);
      alert('Tạo ca thi thành công!');
    } catch (error) {
      console.error('Error creating exam slots:', error);
      alert('Có lỗi xảy ra khi tạo ca thi!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlots = async () => {
  if (createdSlots.length === 0) {
    alert('Không có ca thi nào để lưu!');
    return;
  }

  const toVNISOString = (date: Date) => date.toISOString();

  try {
    const saveData = createdSlots.map((slot, index) => {
      const slotRooms = slot.originalData?.rooms || [];
      // Lấy ngày, giờ từ originalData nếu có, nếu không lấy từ state
      let slotDateStr = slot.originalData?.date || date;
      let slotStartStr = slot.originalData?.startTime || startTime;
      let slotEndStr = slot.originalData?.endTime || endTime;

      // Nếu là ISO string thì dùng luôn, nếu chỉ là "HH:mm" thì ghép ngày
      let startDateTime: Date;
      let endDateTime: Date;
      let examDateObj: Date;

      // Xử lý ngày (nếu là ISO string thì lấy phần ngày, nếu là yyyy-MM-dd thì giữ nguyên)
      if (/^\d{4}-\d{2}-\d{2}T/.test(slotDateStr)) {
        // ISO string, lấy phần ngày
        slotDateStr = slotDateStr.substring(0, 10);
      }

      // Xử lý giờ bắt đầu
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotStartStr)) {
        startDateTime = new Date(slotStartStr);
      } else if (/^\d{2}:\d{2}/.test(slotStartStr)) {
        startDateTime = new Date(`${slotDateStr}T${slotStartStr}`);
      } else {
        throw new Error('Giờ bắt đầu không hợp lệ');
      }

      // Xử lý giờ kết thúc
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(slotEndStr)) {
        endDateTime = new Date(slotEndStr);
      } else if (/^\d{2}:\d{2}/.test(slotEndStr)) {
        endDateTime = new Date(`${slotDateStr}T${slotEndStr}`);
      } else {
        throw new Error('Giờ kết thúc không hợp lệ');
      }

      // Ngày thi (00:00:00)
      examDateObj = new Date(`${slotDateStr}T00:00:00`);

      // Kiểm tra lại các giá trị Date
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || isNaN(examDateObj.getTime())) {
        throw new Error('Giá trị ngày hoặc giờ không hợp lệ!');
      }

      return {
        subjectId: subject?.value || 1,
        status: slot.status || "Chưa gán bài thi",
        multiOrPractice: examType,
        slotName: slot.slotName || `Slot ${index + 1}`,
        semesterId: semester?.value || 1,
        date: toVNISOString(examDateObj),
        startTime: toVNISOString(startDateTime),
        endTime: toVNISOString(endDateTime),
        rooms: slotRooms.map((room: any) => ({
          roomId: room.roomId,
          students: (room.students || []).map((student: any) => ({
            email: student.email || "string",
            code: student.code || student.mssv || "string",
            fullName: student.fullName || student.name || "string",
            gender: student.gender === 'Nam' || student.gender === true,
            dateOfBirth: student.dateOfBirth || student.dob || new Date().toISOString(),
            urlAvatar: student.urlAvatar || student.avatar || "default.png"
          }))
        }))
      };
    });
    const response = await fetch('https://localhost:7074/api/CreateExamSlot/SaveExamSlot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saveData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to save exam slots: ' + errorText);
    }
    alert('Lưu ca thi thành công!');
    router.push('/examination/examslot/list');
  } catch (error: any) {
    console.error('Error saving exam slots:', error);
    alert(error.message || 'Có lỗi xảy ra khi lưu ca thi!');
  }
};
  const handleStudentEdit = (idx: number, field: string, value: string) => {
    const newList = [...studentList];
    // @ts-ignore
    newList[idx][field] = value;
    setStudentList(newList);
  };

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
            {/* Row 1: 3 fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
            {/* Row 2: 3 fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <label className="block text-sm font-semibold text-gray-700">Tên ca thi</label>
                <input
                  type="text"
                  value={slotName}
                  onChange={e => setSlotName(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập tên ca thi..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Loại bài thi</label>
                <Select
                  options={examTypeOptions}
                  value={examTypeOptions.find(opt => opt.value === examType)}
                  onChange={opt => setExamType(opt?.value as 'Multiple' | 'Practice')}
                  placeholder="Chọn loại bài thi..."
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
            </div>
            {/* Row 3: 4 fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Giờ bắt đầu</label>
                  <CustomTimePicker value={startTime} onChange={val => setStartTime(val)} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Giờ kết thúc</label>
                  <CustomTimePicker value={endTime} onChange={val => setEndTime(val)} />
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
            </div>
            {/* Optimization Options */}
            <div className="pt-6 border-t border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Tùy chọn tối ưu hóa:</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="optimization"
                    value="room"
                    checked={optimizationType === 'room'}
                    onChange={(e) => setOptimizationType(e.target.value as 'room' | 'slot')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Tối ưu theo phòng</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="optimization"
                    value="slot"
                    checked={optimizationType === 'slot'}
                    onChange={(e) => setOptimizationType(e.target.value as 'room' | 'slot')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Tối ưu theo ca thi</span>
                </label>
              </div>
            </div>
            {/* Create Button */}
            <div className="pt-6">
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
        </div>
        {/* Popup phòng thi */}
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
        </Popup>
        {/* Popup sinh viên */}
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
          </div>
        </Popup>
        {/* Bảng ca thi đã tạo */}
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
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Tên ca thi</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Ngày thi</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Bắt đầu</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Kết thúc</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phòng</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Sinh viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
  {createdSlots.flatMap((slot, idx) =>
    slot.originalData.rooms.map((room: any, roomIdx: number) => (
      <tr key={`${idx}-${room.roomId}`} className="hover:bg-blue-50 transition-colors duration-200">
        <td className="py-4 px-6 text-sm font-medium text-gray-900">
          {slot.stt}
        </td>
        <td className="py-4 px-6 text-sm text-gray-700">
          {slot.slotName}
        </td>
        <td className="py-4 px-6 text-sm text-gray-700">
          {slot.date}
        </td>
        <td className="py-4 px-6 text-sm text-gray-700">
          {slot.startTime}
        </td>
        <td className="py-4 px-6 text-sm text-gray-700">
          {slot.endTime}
        </td>
        <td className="py-4 px-6 text-sm text-gray-700">
          {rooms.find(r => r.roomId === slot.originalData.rooms[roomIdx].roomId)?.roomName || `Phòng ${slot.originalData.rooms[roomIdx].roomId}`}
        </td>
        <td className="py-4 px-6">
          <button
            onClick={() => handleViewStudents(room.students)}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Xem ({room.students.length})
          </button>
        </td>
      </tr>
    ))
  )}
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
        )}
        {/* Popup xem danh sách sinh viên trong ca thi */}
        <Popup open={studentListPopup} onClose={() => setStudentListPopup(false)}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Danh sách sinh viên thi</h3>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedSlotStudents.length} sinh viên
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
                <table className="w-full bg-white">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold">STT</th>
                      <th className="py-4 px-6 text-left font-semibold">MSSV</th>
                      <th className="py-4 px-6 text-left font-semibold">Họ tên</th>
                      <th className="py-4 px-6 text-left font-semibold">Email</th>
                      <th className="py-4 px-6 text-left font-semibold">Giới tính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedSlotStudents.map((student, index) => (
                      <tr key={index} className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-4 px-6 font-medium text-gray-900">{index + 1}</td>
                        <td className="py-4 px-6 text-gray-700 font-medium">{student.code || student.mssv}</td>
                        <td className="py-4 px-6 text-gray-900 font-medium">{student.fullName || student.name}</td>
                        <td className="py-4 px-6 text-gray-700">{student.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.gender === true || student.gender === 'Nam'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            {student.gender === true || student.gender === 'Nam' ? 'Nam' : 'Nữ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedSlotStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="font-medium">Không có sinh viên nào trong ca thi này</p>
                </div>
              )}
            </div>
          </div>
        </Popup>
      </div>
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popup {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-popup {
          animation: popup 0.3s ease-out;
        }
        .react-select-container .react-select__control {
          border-radius: 12px;
          border-color: #e5e7eb;
          min-height: 48px;
          box-shadow: none;
          transition: all 0.2s;
        }
        .react-select-container .react-select__control:hover {
          border-color: #3b82f6;
        }
        .react-select-container .react-select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .react-select-container .react-select__value-container {
          padding: 0 16px;
        }
        .react-select-container .react-select__placeholder {
          color: #9ca3af;
          font-weight: 500;
        }
        .react-select-container .react-select__single-value {
          color: #374151;
          font-weight: 500;
        }
        .react-select-container .react-select__menu {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e5e7eb;
        }
        .react-select-container .react-select__option {
          padding: 12px 16px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .react-select-container .react-select__option:hover {
          background-color: #eff6ff;
          color: #1e40af;
        }
        .react-select-container .react-select__option--is-selected {
          background-color: #3b82f6;
          color: white;
        }
        .react-select-container .react-select__option--is-selected:hover {
          background-color: #2563eb;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        table {
          border-collapse: separate;
          border-spacing: 0;
        }
        table th:first-child {
          border-radius: 12px 0 0 0;
        }
        table th:last-child {
          border-radius: 0 12px 0 0;
        }
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .grid-cols-6 {
            grid-template-columns: repeat(2, 1fr);
          }
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .grid-cols-6,
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
          .flex-wrap {
            flex-direction: column;
          }
          .flex-wrap > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ExamSlotCreatePage;