'use client';

import React, { useState, useEffect } from 'react';
import { Suspense } from "react";
import { showError, showSuccess } from '@/utils/toastUtils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/api" || 'https://localhost:7074/api';

interface Chapter {
  id: number;
  chapterName: string;
  description: string;
  course: string | null;
}

interface SubjectInfo {
  subjectId: number;
  subjectName: string;
  course: string;
}

interface ChapterForm {
  chapterName: string;
  description: string;
  course: string;
}

// Helper to get subjectId from URL query param (?subjectId=...)
function getSubjectIdFromQuery() {
  if (typeof window === 'undefined') return 1;
  const params = new URLSearchParams(window.location.search);
  const subjectId = params.get('subjectId');
  return subjectId ? parseInt(subjectId) : 1;
}

function ChapterManagementContent() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [form, setForm] = useState<ChapterForm>({
    chapterName: '',
    description: '',
    course: ''
  });
  const [subjectId, setSubjectId] = useState<number>(getSubjectIdFromQuery());

  // Listen for changes in the URL (for client-side navigation)
  useEffect(() => {
    const handlePopState = () => {
      setSubjectId(getSubjectIdFromQuery());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch subject info (keeping existing API)
  const fetchSubjectInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/Subject/${subjectId}`);
      if (!res.ok) throw new Error('Failed to fetch subject info');
      const data = await res.json();
      setSubjectInfo(data);
    } catch (err: any) {
      showError(err.message || 'Lỗi tải thông tin môn học');
    }
  };

  // Fetch chapters by subject
  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Chapter/GetAllChapterBySub/${subjectId}`);
      if (!res.ok) throw new Error('Failed to fetch chapters');
      const data = await res.json();
      setChapters(data);
    } catch (err: any) {
      showError(err.message || 'Lỗi tải danh sách chương');
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  // Create chapter
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Chapter/${subjectId}/CreateChapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create chapter');
      showSuccess('Tạo chương thành công');
      setShowPopup(false);
      resetForm();
      fetchChapters();
    } catch (err: any) {
      showError(err.message || 'Lỗi tạo chương');
    } finally {
      setLoading(false);
    }
  };

  // Update chapter
  const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingChapter) return;
  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/Chapter/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: subjectId,
        chapterName: form.chapterName,
        description: form.description,
        course: form.course
      }),
    });
    if (!res.ok) throw new Error('Failed to update chapter');
    showSuccess('Cập nhật chương thành công');
    setShowPopup(false);
    resetForm();
    fetchChapters();
  } catch (err: any) {
    showError(err.message || 'Lỗi cập nhật chương');
  } finally {
    setLoading(false);
  }
};

  // Delete chapter
  const handleDelete = async (chapterId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Chapter/${chapterId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete chapter');
      showSuccess('Xóa chương thành công');
      fetchChapters();
    } catch (err: any) {
      showError(err.message || 'Lỗi xóa chương');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapter by ID for editing
  const handleEdit = async (chapter: Chapter) => {
    try {
      const res = await fetch(`${API_BASE}/Chapter/${chapter.id}`);
      if (!res.ok) throw new Error('Failed to fetch chapter details');
      const data = await res.json();
      setEditingChapter(data);
      setForm({
        chapterName: data.chapterName,
        description: data.description,
        course: data.course || '',
        
      });
      setShowPopup(true);
    } catch (err: any) {
      showError(err.message || 'Lỗi tải thông tin chương');
    }
  };

  const openCreatePopup = () => {
    setEditingChapter(null);
    resetForm();
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingChapter(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      chapterName: '',
      description: '',
      course: ''
    });
  };

  useEffect(() => {
    fetchSubjectInfo();
    fetchChapters();
    // eslint-disable-next-line
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý chương</h1>
              <p className="text-gray-600 mt-1">Quản lý các chương của môn học trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Subject Info */}
        {subjectInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-center mb-4 text-blue-700">
              Thông tin môn học
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <span className="text-sm font-medium text-blue-600">Mã môn học</span>
                <p className="text-lg font-semibold text-blue-800">{subjectInfo.course}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl">
                <span className="text-sm font-medium text-indigo-600">Tên môn học</span>
                <p className="text-lg font-semibold text-indigo-800">{subjectInfo.subjectName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Management */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Danh sách chương
                <span className="ml-2 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                  {chapters.length} chương
                </span>
              </h3>
              <button
                onClick={openCreatePopup}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm chương
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">Chưa có chương nào</p>
                <p className="text-gray-400">Bắt đầu bằng cách thêm chương đầu tiên</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {chapters.map((chapter, index) => (
                  <div key={chapter.id} className="bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-100 p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                            Chương {index + 1}
                          </span>
                          <h4 className="text-lg font-semibold text-gray-800">{chapter.chapterName}</h4>
                        </div>
                        <p className="text-gray-600 mb-3">{chapter.description}</p>
                        {chapter.course && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-sm text-blue-600">{chapter.course}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(chapter)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Popup */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-popup overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
                  </h3>
                  <button
                    className="text-white hover:text-gray-200 transition-colors"
                    onClick={closePopup}
                    aria-label="Đóng"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <form onSubmit={editingChapter ? handleUpdate : handleCreate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên chương <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.chapterName}
                      onChange={e => setForm({ ...form, chapterName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nhập tên chương..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nhập mô tả cho chương..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Khóa học/Liên kết
                    </label>
                    <input
                      type="text"
                      value={form.course}
                      onChange={e => setForm({ ...form, course: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nhập liên kết khóa học (tùy chọn)..."
                    />
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingChapter ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    <button
                      type="button"
                      onClick={closePopup}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
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
      `}</style>
    </div>
  );
}

export default function ChapterManagement() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChapterManagementContent />
    </Suspense>
  );
}