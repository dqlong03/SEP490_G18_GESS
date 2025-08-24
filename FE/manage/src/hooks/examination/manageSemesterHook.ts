"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  semesterService,
  SemesterForm,
  Semester,
} from "@/services/examination/manageSemesterService";
import useSWR from "swr";
import { showToast } from "@/utils/toastUtils";
import React from "react";

export const useManageSemester = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Form setup
  const { control, handleSubmit, reset, setValue } = useForm<SemesterForm>({
    defaultValues: {
      semesterNames: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "semesterNames",
  });

  // Fetch semesters
  const { data: semesters = [], mutate } = useSWR<Semester[]>(
    "semesters",
    semesterService.getSemesters
  );

  // Initialize form với dữ liệu từ API
  const initializeForm = () => {
    if (semesters.length > 0) {
      const semesterNames = semesters.map((s) => ({ name: s.semesterName }));
      reset({ semesterNames });
    }
  };

  // Load data when semesters change
  React.useEffect(() => {
    initializeForm();
  }, [semesters]);

  // Submit handler
  const onSubmit = async (data: SemesterForm) => {
    if (data.semesterNames.length === 0) {
      showToast("error", "Vui lòng thêm ít nhất một học kỳ");
      return;
    }

    const hasEmptyName = data.semesterNames.some((x) => !x.name.trim());
    if (hasEmptyName) {
      showToast("error", "Vui lòng điền đầy đủ tên học kỳ");
      return;
    }

    setIsLoading(true);
    try {
      await semesterService.updateSemesters(data);
      showToast("success", "Cập nhật học kỳ thành công!");
      mutate(); // Refresh data
    } catch (error: any) {
      showToast("error", error?.message || "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  // Add semester field
  const addSemesterField = () => {
    append({ name: "" });
  };

  // Remove semester field
  const removeSemesterField = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return {
    // Form
    control,
    fields,
    handleSubmit: handleSubmit(onSubmit),

    // Actions
    addSemesterField,
    removeSemesterField,

    // State
    isLoading,
    semesters,

    // Utils
    initializeForm,
  };
};
