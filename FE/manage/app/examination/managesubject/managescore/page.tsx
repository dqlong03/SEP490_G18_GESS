"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Plus, Edit3, Trash2 } from "lucide-react";
import { Suspense } from "react";
import { useManageScore } from "@hooks/examination/manageScoreHook";
import "@styles/scoreManagement.css";

function ScoreManagementContent() {
  const {
    scores,
    selectedScore,
    subjectInfo,
    examTypes,
    isPopupOpen,
    register,
    handleSubmit,
    handleAddScore,
    handleEditScore,
    handleDeleteScore,
    openEditPopup,
    openCreatePopup,
    closePopup,
    isLoadingSubject,
    isLoadingScores,
    isLoadingExamTypes,
  } = useManageScore();

  if (isLoadingSubject || isLoadingScores || isLoadingExamTypes) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Tính tổng điểm hiện tại
  const currentTotal = scores.reduce((sum, score) => sum + (score.gradeComponent || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Quản lý điểm</h1>
              <p className="text-blue-100">Quản lý và phân bổ điểm cho các môn học</p>
            </div>
            <button
              onClick={openCreatePopup}
              className="bg-white text-blue-600 hover:bg-gray-50 transition-all duration-200 px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Thêm điểm</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                Thông tin môn học
              </h3>
              {subjectInfo ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">Mã môn học</p>
                    <p className="text-lg font-bold text-blue-800">{subjectInfo.course}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-sm text-indigo-600 font-medium mb-1">Tên môn học</p>
                    <p className="text-lg font-bold text-indigo-800">{subjectInfo.subjectName}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-green-600 font-medium mb-1">Tổng điểm hiện tại</p>
                    <p className={`text-2xl font-bold ${currentTotal > 100 ? 'text-red-600' : currentTotal === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {currentTotal.toFixed(1)}%
                    </p>
                    {currentTotal > 100 && (
                      <p className="text-sm text-red-500 mt-1">⚠️ Vượt quá 100%</p>
                    )}
                    {currentTotal === 100 && (
                      <p className="text-sm text-green-500 mt-1">✅ Đầy đủ 100%</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Không có thông tin môn học</p>
              )}
            </div>
          </div>

          {/* Scores Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Danh sách điểm</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">STT</th>
                      <th className="px-6 py-4 text-left font-semibold">Loại bài thi</th>
                      <th className="px-6 py-4 text-center font-semibold">Phần trăm (%)</th>
                      <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!scores ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500">Đang tải dữ liệu...</p>
                          </div>
                        </td>
                      </tr>
                    ) : scores.length > 0 ? (
                      scores.map((score, index) => (
                        <tr
                          key={`${score.subjectId}-${score.categoryExamId}`}
                          className="score-table-row hover:bg-blue-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-gray-900 font-medium">{index + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900 font-medium">
                              {score.categoryExamName || "(Không có tên)"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="percentage-badge">
                              {typeof score.gradeComponent === "number"
                                ? `${score.gradeComponent.toFixed(1)}%`
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => openEditPopup(score)}
                                className="action-button p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                title="Chỉnh sửa"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteScore(score.categoryExamId)}
                                className="action-button p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Chưa có dữ liệu điểm</p>
                            <p className="text-gray-400 text-sm">Nhấn "Thêm điểm" để bắt đầu</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal/Popup */}
        {isPopupOpen && (
          <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="modal-content bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedScore ? "Chỉnh sửa điểm" : "Thêm điểm mới"}
                </h3>
                <button 
                  onClick={closePopup}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(
                  selectedScore ? handleEditScore : handleAddScore
                )}
                className="p-6 space-y-6"
              >
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại bài thi <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("CategoryExamId", { 
                      required: "Vui lòng chọn loại bài thi" 
                    })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    disabled={!!selectedScore}
                  >
                    <option value="">-- Chọn loại bài thi --</option>
                    {examTypes.map((type) => (
                      <option
                        key={type.categoryExamId}
                        value={type.categoryExamId.toString()}
                      >
                        {type.categoryExamName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade Component */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phần trăm điểm (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("GradeComponent", {
                        required: "Vui lòng nhập phần trăm điểm",
                        min: {
                          value: 0.1,
                          message: "Phần trăm điểm phải lớn hơn 0"
                        },
                        max: {
                          value: 100,
                          message: "Phần trăm điểm không được vượt quá 100"
                        },
                        validate: (value) => {
                          const numValue = parseFloat(value.toString());
                          if (numValue <= 0) {
                            return "Phần trăm điểm phải lớn hơn 0";
                          }
                          
                          // Tính tổng điểm mới
                          let newTotal = numValue;
                          if (selectedScore) {
                            // Khi edit, trừ điểm cũ và cộng điểm mới
                            newTotal = currentTotal - selectedScore.gradeComponent + numValue;
                          } else {
                            // Khi thêm mới, cộng vào tổng hiện tại
                            newTotal = currentTotal + numValue;
                          }
                          
                          if (newTotal > 100) {
                            return `Tổng điểm sẽ vượt quá 100% (${newTotal.toFixed(1)}%). Vui lòng điều chỉnh.`;
                          }
                          
                          return true;
                        }
                      })}
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      className="form-input w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ví dụ: 25.5"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng hiện tại: {currentTotal.toFixed(1)}% / 100%
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  {selectedScore && (
                    <button
                      type="button"
                      onClick={() => handleDeleteScore(selectedScore.categoryExamId)}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Xóa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closePopup}
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="gradient-button px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {selectedScore ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreManagement() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ScoreManagementContent />
    </Suspense>
  );
}

export default ScoreManagement;
