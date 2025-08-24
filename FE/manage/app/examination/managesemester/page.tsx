"use client";

import { Suspense } from "react";
import { Controller } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useManageSemester } from "@/hooks/examination/manageSemesterHook";

const SEMESTER_OPTIONS = [2, 3, 4];

export default function SemesterSetup() {
  const {
    control,
    fields,
    handleSubmit,
    addSemesterField,
    removeSemesterField,
    isLoading,
    semesters,
  } = useManageSemester();

  // Handle semester count change
  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    const currentFields = fields.length;
    
    if (count > currentFields) {
      // Add more fields
      for (let i = currentFields; i < count; i++) {
        addSemesterField();
      }
    } else if (count < currentFields) {
      // Remove fields
      for (let i = currentFields - 1; i >= count; i--) {
        removeSemesterField(i);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 ml-64 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-4">
          <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700 font-medium">Đang tải dữ liệu học kỳ...</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <ToastContainer />
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý học kỳ</h1>
                <p className="text-gray-600 mt-1">Thiết lập và cấu hình học kỳ trong hệ thống</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cấu hình học kỳ
                </h2>
                <p className="text-gray-600 mt-2">Thiết lập số lượng và tên gọi các học kỳ trong năm học</p>
              </div>

              {/* Card Body */}
              <div className="p-8">
                {/* Semester Count Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Số lượng học kỳ
                  </label>
                  <div className="relative">
                    <select
                      onChange={handleCountChange}
                      className="appearance-none w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                      value={fields.length}
                    >
                      {SEMESTER_OPTIONS.map((count) => (
                        <option key={count} value={count}>
                          {count} học kỳ
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Chọn số lượng học kỳ phù hợp với chương trình đào tạo</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Danh sách học kỳ  
                    </h3>
                    {fields.map((field, index) => (
                      <div key={field.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Học kỳ thứ {index + 1}
                        </label>
                        <Controller
                          name={`semesterNames.${index}.name`}
                          control={control}
                          rules={{ required: "Tên học kỳ không được để trống" }}
                          render={({ field: inputField, fieldState: { error } }) => (
                            <>
                              <input
                                {...inputField}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-medium"
                                placeholder={`Ví dụ: Học kỳ ${index + 1} năm 2024-2025`}
                              />
                              {error && (
                                <p className="text-red-500 text-sm mt-1">{error.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Lưu cấu hình học kỳ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Info Card */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Lưu ý quan trọng</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Thay đổi cấu hình học kỳ sẽ ảnh hưởng đến toàn bộ hệ thống</li>
                    <li>• Đảm bảo tên học kỳ rõ ràng và dễ hiểu</li>
                    <li>• Nên bao gồm năm học trong tên để dễ phân biệt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
