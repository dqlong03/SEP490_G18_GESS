import { Suspense } from 'react';
import CreateExamSlotRoomClient from '@/components/teacher/CreateExamSlotRoomClient';

// Loading component for Suspense fallback
const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Đang tải trang tạo lịch thi...</p>
    </div>
  </div>
);

export default function CreateTestCalendarPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <CreateExamSlotRoomClient />
    </Suspense>
  );
}