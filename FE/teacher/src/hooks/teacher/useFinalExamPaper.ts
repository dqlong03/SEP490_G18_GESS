// useFinalExamPaper.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  finalExamPaperService,
  SubjectDTO,
  SemesterDTO,
  PracExamPaperDTO,
  ExamPaperDetail,
  SubjectOption,
  SemesterOption,
  YearOption,
  GradingCriterion,
} from "../../services/teacher/finalExamPaperService";
import { getUserIdFromToken } from "../../utils/tokenUtils";
import { showToast } from "../../utils/toastUtils";

export interface UseFinalExamPaperReturn {
  // Data state
  subjects: SubjectDTO[];
  semesters: SemesterDTO[];
  examPapers: PracExamPaperDTO[];
  detailData: ExamPaperDetail | null;

  // Filter state
  selectedSubject: SubjectOption | null;
  selectedSemester: SemesterOption | null;
  selectedYear: YearOption | null;
  searchText: string;

  // UI state
  showDetail: boolean;
  loading: boolean;
  loadingDetail: boolean;
  fetchError: boolean;

  // Computed values
  subjectOptions: SubjectOption[];
  semesterOptions: SemesterOption[];
  yearOptions: YearOption[];
  filteredExamPapers: PracExamPaperDTO[];
  totalScore: number;
  statistics: {
    totalExams: number;
    hasData: boolean;
  };

  // Handlers
  setSelectedSubject: (subject: SubjectOption | null) => void;
  setSelectedSemester: (semester: SemesterOption | null) => void;
  setSelectedYear: (year: YearOption | null) => void;
  setSearchText: (text: string) => void;
  handleShowDetail: (examPaperId: number) => void;
  handleCloseDetail: () => void;
  parseGradingCriteria: (answerContent: string) => GradingCriterion[];
  formatDate: (dateString: string) => string;
}

export const useFinalExamPaper = (): UseFinalExamPaperReturn => {
  // Data state
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [examPapers, setExamPapers] = useState<PracExamPaperDTO[]>([]);
  const [detailData, setDetailData] = useState<ExamPaperDetail | null>(null);

  // Filter state
  const [selectedSubject, setSelectedSubject] = useState<SubjectOption | null>(
    null
  );
  const [selectedSemester, setSelectedSemester] =
    useState<SemesterOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);
  const [searchText, setSearchText] = useState("");

  // UI state
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Load initial data (subjects, semesters, years)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const teacherId = getUserIdFromToken();
        if (!teacherId) {
          showToast("error", "Không thể xác định giáo viên");
          return;
        }

        const [subjectsData, semestersData] = await Promise.all([
          finalExamPaperService.getSubjectsByTeacherId(teacherId),
          finalExamPaperService.getSemesters(),
        ]);

        setSubjects(subjectsData);
        setSemesters(semestersData);

        // Set default selections
        const { defaultSubject, defaultSemester } =
          finalExamPaperService.utils.getDefaultSelections(
            subjectsData,
            semestersData
          );

        setSelectedSubject(defaultSubject);
        setSelectedSemester(defaultSemester);

        // Set default year (current year)
        const yearOptions = finalExamPaperService.utils.generateYearOptions();
        if (yearOptions.length > 0) {
          setSelectedYear(yearOptions[0]);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        showToast("error", "Không thể tải dữ liệu ban đầu");
      }
    };

    loadInitialData();
  }, []);

  // Fetch exam papers when filters change
  useEffect(() => {
    const fetchExamPapers = async () => {
      if (
        !finalExamPaperService.utils.areFiltersComplete(
          selectedSubject,
          selectedSemester,
          selectedYear
        )
      ) {
        setExamPapers([]);
        setFetchError(false);
        return;
      }

      setLoading(true);
      setFetchError(false);

      try {
        const data = await finalExamPaperService.getExamPapers(
          selectedSubject!.value,
          selectedSemester!.value,
          selectedYear!.value
        );
        setExamPapers(data);
      } catch (error) {
        console.error("Error fetching exam papers:", error);
        setExamPapers([]);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExamPapers();
  }, [selectedSubject, selectedSemester, selectedYear]);

  // Computed values
  const subjectOptions = useMemo(
    () => finalExamPaperService.utils.formatSubjectOptions(subjects),
    [subjects]
  );

  const semesterOptions = useMemo(
    () => finalExamPaperService.utils.formatSemesterOptions(semesters),
    [semesters]
  );

  const yearOptions = useMemo(
    () => finalExamPaperService.utils.generateYearOptions(),
    []
  );

  const filteredExamPapers = useMemo(
    () =>
      finalExamPaperService.utils.filterExamPapersBySearch(
        examPapers,
        searchText
      ),
    [examPapers, searchText]
  );

  const totalScore = useMemo(
    () => finalExamPaperService.utils.calculateTotalScore(detailData),
    [detailData]
  );

  const statistics = useMemo(
    () => finalExamPaperService.utils.generateStatistics(examPapers),
    [examPapers]
  );

  // Detail handlers
  const handleShowDetail = useCallback(async (examPaperId: number) => {
    setShowDetail(true);
    setLoadingDetail(true);

    try {
      const data = await finalExamPaperService.getExamPaperDetail(examPaperId);
      setDetailData(data);
    } catch (error) {
      console.error("Error fetching exam detail:", error);
      showToast("error", "Không thể tải chi tiết đề thi");
      setDetailData(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setDetailData(null);
  }, []);

  // Utility functions exposed from service
  const parseGradingCriteria = useCallback(
    (answerContent: string): GradingCriterion[] => {
      return finalExamPaperService.utils.parseGradingCriteria(answerContent);
    },
    []
  );

  const formatDate = useCallback((dateString: string): string => {
    return finalExamPaperService.utils.formatDate(dateString);
  }, []);

  return {
    // Data state
    subjects,
    semesters,
    examPapers,
    detailData,

    // Filter state
    selectedSubject,
    selectedSemester,
    selectedYear,
    searchText,

    // UI state
    showDetail,
    loading,
    loadingDetail,
    fetchError,

    // Computed values
    subjectOptions,
    semesterOptions,
    yearOptions,
    filteredExamPapers,
    totalScore,
    statistics,

    // Handlers
    setSelectedSubject,
    setSelectedSemester,
    setSelectedYear,
    setSearchText,
    handleShowDetail,
    handleCloseDetail,
    parseGradingCriteria,
    formatDate,
  };
};
