// useCreateExamSlotRoom.ts
import { useState, useEffect, useCallback } from "react";
import {
  createExamSlotRoomService,
  Major,
  Subject,
  Semester,
  Year,
  Student,
  Teacher,
  Room,
  Exam,
  SlotOption,
} from "@/services/teacher/createExamSlotRoomService";

export const useCreateExamSlotRoom = () => {
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [majors, setMajors] = useState<Major[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [slotOptions, setSlotOptions] = useState<SlotOption[]>([]);

  // Selected states
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Date states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [splitDate, setSplitDate] = useState("");

  // Split room states
  const [splitRoom, setSplitRoom] = useState<Room | null>(null);
  const [splitSlot, setSplitSlot] = useState<SlotOption | null>(null);
  const [splitTeacher, setSplitTeacher] = useState<Teacher | null>(null);
  const [splitStudents, setSplitStudents] = useState<Student[]>([]);

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showSplitStudentModal, setShowSplitStudentModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  // Form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [
        majorsData,
        semestersData,
        yearsData,
        studentsData,
        teachersData,
        roomsData,
        examsData,
        slotOptionsData,
      ] = await Promise.all([
        createExamSlotRoomService.getMajors(),
        createExamSlotRoomService.getSemesters(),
        createExamSlotRoomService.getYears(),
        createExamSlotRoomService.getStudents(),
        createExamSlotRoomService.getTeachers(),
        createExamSlotRoomService.getRooms(),
        createExamSlotRoomService.getExams(),
        createExamSlotRoomService.getSlotOptions(),
      ]);

      setMajors(majorsData);
      setSemesters(semestersData);
      setYears(yearsData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setRooms(roomsData);
      setExams(examsData);
      setSlotOptions(slotOptionsData);

      // Set default selections
      if (majorsData.length > 0) {
        setSelectedMajor(majorsData[0]);
        // Load subjects for first major
        const subjectsData = await createExamSlotRoomService.getSubjectsByMajor(
          majorsData[0].value
        );
        if (subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0]);
        }
      }
      if (semestersData.length > 0) setSelectedSemester(semestersData[0]);
      if (yearsData.length > 0) setSelectedYear(yearsData[0]);
      if (roomsData.length > 0) setSplitRoom(roomsData[0]);
      if (slotOptionsData.length > 0) setSplitSlot(slotOptionsData[0]);
      if (teachersData.length > 0) setSplitTeacher(teachersData[0]);
      if (examsData.length > 0) setSelectedExam(examsData[0]);

      setSplitStudents(studentsData);
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handle major change
  const handleMajorChange = async (option: Major) => {
    setSelectedMajor(option);
    try {
      const subjectsData = await createExamSlotRoomService.getSubjectsByMajor(
        option.value
      );
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0]);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  // Student management
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) return;

    try {
      const newStudent = await createExamSlotRoomService.addStudent(
        newStudentName,
        students
      );
      setStudents((prev) => [...prev, newStudent]);
      setNewStudentName("");
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      await createExamSlotRoomService.removeStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  // Room management
  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const newRoom = await createExamSlotRoomService.addRoom(newRoomName);
      setRooms((prev) => [...prev, newRoom]);
      setNewRoomName("");
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const handleRemoveRoom = async (id: string) => {
    try {
      await createExamSlotRoomService.removeRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error removing room:", error);
    }
  };

  // Split student management
  const handleAddSplitStudent = async () => {
    if (!newStudentName.trim()) return;

    try {
      const newStudent = await createExamSlotRoomService.addStudent(
        newStudentName,
        splitStudents
      );
      setSplitStudents((prev) => [...prev, newStudent]);
      setNewStudentName("");
    } catch (error) {
      console.error("Error adding split student:", error);
    }
  };

  const handleRemoveSplitStudent = async (id: string) => {
    try {
      await createExamSlotRoomService.removeStudent(id);
      setSplitStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error removing split student:", error);
    }
  };

  // Save exam slot
  const handleSaveExamSlot = async () => {
    if (
      !selectedMajor ||
      !selectedSubject ||
      !selectedSemester ||
      !selectedYear ||
      !splitRoom ||
      !splitSlot ||
      !splitTeacher ||
      !selectedExam
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setIsSaving(true);

      const examSlotData = {
        major: selectedMajor,
        subject: selectedSubject,
        semester: selectedSemester,
        year: selectedYear,
        fromDate,
        toDate,
        students,
        teachers,
        rooms,
        splitRoom,
        splitSlot,
        splitTeacher,
        splitDate,
        splitStudents,
        selectedExam,
      };

      await createExamSlotRoomService.saveExamSlot(examSlotData);
      alert("Đã lưu lịch thi!");
    } catch (error) {
      console.error("Error saving exam slot:", error);
      alert("Có lỗi xảy ra khi lưu lịch thi!");
    } finally {
      setIsSaving(false);
    }
  };

  // Get subjects for current major
  const getSubjectsForCurrentMajor = useCallback(async () => {
    if (!selectedMajor) return [];
    try {
      return await createExamSlotRoomService.getSubjectsByMajor(
        selectedMajor.value
      );
    } catch (error) {
      console.error("Error getting subjects:", error);
      return [];
    }
  }, [selectedMajor]);

  // Effect to update split date when fromDate changes
  useEffect(() => {
    if (fromDate && !splitDate) {
      setSplitDate(fromDate);
    }
  }, [fromDate, splitDate]);

  return {
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
    setSelectedMajor,
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
    getSubjectsForCurrentMajor,
  };
};
