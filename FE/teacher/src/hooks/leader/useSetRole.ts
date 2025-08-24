// useSetRole.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  setRoleService,
  Subject,
  Teacher,
} from "@/services/leader/setRoleService";

const PAGE_SIZE = 10;
const SUBJECTS_PER_PAGE = 6;

interface UseSetRoleProps {
  teacherId: string;
}

export const useSetRole = ({ teacherId }: UseSetRoleProps) => {
  // State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSubjectPage, setCurrentSubjectPage] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [teachersInSubject, setTeachersInSubject] = useState<Teacher[]>([]);
  const [teachersInMajor, setTeachersInMajor] = useState<Teacher[]>([]);
  const [filteredTeachersInMajor, setFilteredTeachersInMajor] = useState<
    Teacher[]
  >([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Search states
  const [searchTeacherInSubject, setSearchTeacherInSubject] = useState("");
  const [searchTeacherInMajor, setSearchTeacherInMajor] = useState("");
  const [debouncedSearchTeacher, setDebouncedSearchTeacher] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTeacher(searchTeacherInSubject);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTeacherInSubject]);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const data = await setRoleService.getAllSubjectsByTeacherId(teacherId);
      setSubjects(data);
      setFilteredSubjects(data);
      if (data && data.length > 0) {
        setSelectedSubject(data[0]);
      }
    } catch (error) {
      toast.error("Không lấy được danh sách môn học");
    }
  }, [teacherId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Filter subjects based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubjects(subjects);
    } else {
      setFilteredSubjects(
        subjects.filter((subject) =>
          subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setCurrentSubjectPage(0);
  }, [searchTerm, subjects]);

  // Filter teachers in major (frontend filter)
  useEffect(() => {
    if (searchTeacherInMajor.trim() === "") {
      setFilteredTeachersInMajor(teachersInMajor);
    } else {
      setFilteredTeachersInMajor(
        teachersInMajor.filter(
          (teacher) =>
            teacher.code
              .toLowerCase()
              .includes(searchTeacherInMajor.toLowerCase()) ||
            teacher.fullname
              .toLowerCase()
              .includes(searchTeacherInMajor.toLowerCase())
        )
      );
    }
  }, [searchTeacherInMajor, teachersInMajor]);

  // Calculate pagination for subjects
  const totalSubjectPages = Math.ceil(
    filteredSubjects.length / SUBJECTS_PER_PAGE
  );
  const currentSubjects = filteredSubjects.slice(
    currentSubjectPage * SUBJECTS_PER_PAGE,
    (currentSubjectPage + 1) * SUBJECTS_PER_PAGE
  );

  // Navigation functions for subject carousel
  const handlePreviousSubjects = () => {
    setCurrentSubjectPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextSubjects = () => {
    setCurrentSubjectPage((prev) => Math.min(totalSubjectPages - 1, prev + 1));
  };

  // Fetch teachers in subject (with debounced search)
  const fetchTeachersInSubject = useCallback(async () => {
    if (!selectedSubject) {
      setTeachersInSubject([]);
      return;
    }
    setLoading(true);

    try {
      const [teachersData, totalPagesData] = await Promise.all([
        setRoleService.getTeachersInSubject(
          selectedSubject.subjectId,
          page,
          PAGE_SIZE,
          debouncedSearchTeacher.trim() || undefined
        ),
        setRoleService.countPageNumberTeacherHaveSubject(
          selectedSubject.subjectId,
          PAGE_SIZE,
          debouncedSearchTeacher.trim() || undefined
        ),
      ]);

      setTeachersInSubject(teachersData);
      setTotalPages(totalPagesData);
    } catch (error) {
      setTeachersInSubject([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, page, debouncedSearchTeacher]);

  useEffect(() => {
    fetchTeachersInSubject();
  }, [fetchTeachersInSubject]);

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTeacher]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTeacherInSubject]);

  // Fetch teachers in major (for add modal)
  const fetchTeachersInMajor = async () => {
    try {
      const data = await setRoleService.getAllTeachersInMajor(teacherId);
      setTeachersInMajor(data);
      setFilteredTeachersInMajor(data);
    } catch (error) {
      toast.error("Không lấy được danh sách giáo viên trong ngành");
    }
  };

  // Add teacher to subject
  const handleAddTeacher = async (teacherId: string) => {
    if (!selectedSubject) {
      toast.warning("Vui lòng chọn môn học trước!");
      return;
    }
    try {
      await setRoleService.addTeacherToSubject(
        teacherId,
        selectedSubject.subjectId
      );
      toast.success("Đã thêm giáo viên vào môn học!");
      fetchTeachersInMajor();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm giáo viên!");
    }
  };

  // Remove teacher from subject
  const handleRemoveTeacher = async (teacherId: string) => {
    if (!selectedSubject) return;
    if (!window.confirm("Bạn chắc chắn muốn xóa giáo viên này khỏi môn học?"))
      return;
    try {
      await setRoleService.removeTeacherFromSubject(
        teacherId,
        selectedSubject.subjectId
      );
      toast.success("Đã xóa giáo viên khỏi môn học!");
      setTeachersInSubject((prev) =>
        prev.filter((t) => t.teacherId !== teacherId)
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa giáo viên!");
    }
  };

  // Toggle role create exam
  const handleToggleCreateExam = async (teacher: Teacher) => {
    if (!selectedSubject) return;
    try {
      await setRoleService.assignRoleCreateExam(
        teacher.teacherId,
        selectedSubject.subjectId
      );
      toast.success("Đã cập nhật quyền tạo bài kiểm tra!");
      setTeachersInSubject((prev) =>
        prev.map((t) =>
          t.teacherId === teacher.teacherId
            ? { ...t, isCreateExam: !t.isCreateExam }
            : t
        )
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật quyền!");
    }
  };

  // Check if teacher is already in subject
  const isTeacherInSubject = (teacherId: string) => {
    return teachersInSubject.some((t) => t.teacherId === teacherId);
  };

  // Handle subject selection
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setPage(1);
    setSearchTeacherInSubject("");
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setSearchTeacherInMajor("");
    setTimeout(() => {
      fetchTeachersInSubject();
    }, 300);
  };

  // Calculate statistics
  const createExamCount = teachersInSubject.filter(
    (t) => t.isCreateExam
  ).length;
  const gradeExamCount = teachersInSubject.filter((t) => t.isGraded).length;

  return {
    // State
    subjects,
    filteredSubjects,
    searchTerm,
    setSearchTerm,
    currentSubjectPage,
    setCurrentSubjectPage,
    selectedSubject,
    teachersInSubject,
    teachersInMajor,
    filteredTeachersInMajor,
    showAddModal,
    setShowAddModal,
    page,
    setPage,
    totalPages,
    loading,
    searchTeacherInSubject,
    setSearchTeacherInSubject,
    searchTeacherInMajor,
    setSearchTeacherInMajor,

    // Computed values
    totalSubjectPages,
    currentSubjects,
    createExamCount,
    gradeExamCount,

    // Functions
    handlePreviousSubjects,
    handleNextSubjects,
    handleAddTeacher,
    handleRemoveTeacher,
    handleToggleCreateExam,
    isTeacherInSubject,
    handleSubjectSelect,
    handleCloseModal,
    fetchTeachersInMajor,

    // Constants
    PAGE_SIZE,
    SUBJECTS_PER_PAGE,
  };
};
