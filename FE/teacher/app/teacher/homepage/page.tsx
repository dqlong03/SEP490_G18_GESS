'use client';

import { useEffect } from "react";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useRouter } from "next/navigation";

export default function TeacherHomePage() {
    const router = useRouter(); 
     useEffect(() => {
        if (typeof window !== "undefined") {
            const userId = getUserIdFromToken();
            if (!userId) {
               router.push("/common/login");
            }
        }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <img
          src="https://international.fpt.edu.vn/web/image/image.gallery/1359/image"
          alt="Hệ thống quản lý thi"
          className="w-64 h-64 object-contain mb-6 rounded-xl shadow"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-black-500 mb-4 text-center">
          Hệ thống Quản lý Thi & Chấm điểm
        </h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Chào mừng bạn đến với hệ thống hỗ trợ giáo viên trong việc tổ chức, giám sát và chấm điểm các kỳ thi!
        </p>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            title="Quản lý lớp học"
            desc="Xem danh sách lớp, thêm/xóa sinh viên, quản lý thông tin lớp học dễ dàng."
            icon="📚"
          />
          <FeatureCard
            title="Tổ chức & Giám sát thi"
            desc="Tạo ca thi, điểm danh, cấp mã vào phòng thi, theo dõi trạng thái thi trực tuyến."
            icon="📝"
          />
          <FeatureCard
            title="Chấm điểm tự động & thủ công"
            desc="Chấm điểm bài thi trắc nghiệm tự động, hỗ trợ AI gợi ý chấm bài tự luận, nhập điểm thủ công."
            icon="🎯"
          />
          <FeatureCard
            title="Thống kê & Báo cáo"
            desc="Xem thống kê điểm, xuất báo cáo kết quả thi, hỗ trợ đánh giá chất lượng học tập."
            icon="📊"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="bg-blue-50 rounded-xl shadow p-5 flex flex-col items-center hover:scale-105 transition-transform">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-bold text-blue-800 text-lg mb-1 text-center">{title}</div>
      <div className="text-gray-600 text-center">{desc}</div>
    </div>
  );
}