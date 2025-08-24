import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { create } from "zustand";
import useSWR, { mutate } from "swr";
import {
  chapterService,
  Chapter,
  SubjectBasicDTO,
  ChapterFormData,
} from "@services/examination/manageChapterService";

// Zustand store
interface ChapterState {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  isPopupOpen: boolean;
  expandedChapterIds: number[];
  setChapters: (chapters: Chapter[]) => void;
  setSelectedChapter: (chapter: Chapter | null) => void;
  setIsPopupOpen: (isOpen: boolean) => void;
  toggleExpanded: (id: number) => void;
}

const useChapterStore = create<ChapterState>((set) => ({
  chapters: [],
  selectedChapter: null,
  isPopupOpen: false,
  expandedChapterIds: [],
  setChapters: (chapters) => set({ chapters }),
  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  setIsPopupOpen: (isOpen) => set({ isPopupOpen: isOpen }),
  toggleExpanded: (id) =>
    set((state) => ({
      expandedChapterIds: state.expandedChapterIds.includes(id)
        ? state.expandedChapterIds.filter((i) => i !== id)
        : [...state.expandedChapterIds, id],
    })),
}));

export const useManageChapter = () => {
  const {
    chapters,
    selectedChapter,
    isPopupOpen,
    expandedChapterIds,
    setChapters,
    setSelectedChapter,
    setIsPopupOpen,
    toggleExpanded,
  } = useChapterStore();

  const { register, handleSubmit, reset, setValue } =
    useForm<ChapterFormData>();
  const [subjectId, setSubjectId] = useState<string>("");

  // Lấy subjectId từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("subjectId");
    if (id) setSubjectId(id);
    else toast.error("Không tìm thấy subjectId từ URL");
  }, []);

  // Fetch subject info
  const { data: subjectInfo } = useSWR<SubjectBasicDTO>(
    subjectId ? `subject-${subjectId}` : null,
    () => chapterService.getSubjectInfo(subjectId)
  );

  // Fetch chapters
  const { data: chapterData } = useSWR<Chapter[]>(
    subjectId ? `chapters-${subjectId}` : null,
    () => chapterService.getChaptersBySubject(subjectId),
    {
      onSuccess: (data) => {
        setChapters(data);
      },
    }
  );

  // Mutate functions
  const mutateChapters = () => mutate(`chapters-${subjectId}`);

  // Handle save new chapter
  const handleSave: SubmitHandler<ChapterFormData> = async (data) => {
    try {
      await chapterService.createChapter(data, subjectId);
      mutateChapters();
      setIsPopupOpen(false);
      reset();
      toast.success("Đã thêm chương mới!");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  // Handle edit chapter
  const handleEdit: SubmitHandler<ChapterFormData> = async (data) => {
    if (!selectedChapter) return;

    try {
      await chapterService.updateChapter(data, selectedChapter, subjectId);
      mutateChapters();
      setSelectedChapter(null);
      setIsPopupOpen(false);
      reset();
      toast.success("Đã cập nhật chương!");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  // Handle delete chapter
  const handleDelete = async (chapterId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chương này?")) return;

    try {
      await chapterService.deleteChapter(chapterId);
      mutateChapters();
      toast.success("Đã xóa chương!");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  // Open edit popup
  const openEditPopup = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setValue("title", chapter.chapterName);
    setValue("description", chapter.description);
    setIsPopupOpen(true);
  };

  // Open create popup
  const openCreatePopup = () => {
    setSelectedChapter(null);
    reset();
    setIsPopupOpen(true);
  };

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedChapter(null);
    reset();
  };

  return {
    // Data
    chapters,
    selectedChapter,
    subjectInfo,
    subjectId,

    // UI State
    isPopupOpen,
    expandedChapterIds,

    // Form
    register,
    handleSubmit,

    // Actions
    handleSave,
    handleEdit,
    handleDelete,
    openEditPopup,
    openCreatePopup,
    closePopup,
    toggleExpanded,
  };
};
