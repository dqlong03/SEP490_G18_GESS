'use client';

import { useEffect } from "react";
import { getUserIdFromToken } from "@/utils/tokenUtils";
import { useRouter } from "next/navigation";
import { Book, Users, FileText, BarChart3, Award, Clock, Shield, Zap } from "lucide-react";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://i.makeagif.com/media/9-10-2019/VszFEB.gif)'
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Hệ thống Quản lý
              <span className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Thi & Chấm điểm
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Chào mừng bạn đến với hệ thống hỗ trợ giáo viên hiện đại trong việc tổ chức, 
              giám sát và chấm điểm các kỳ thi một cách chuyên nghiệp và hiệu quả!
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              <StatsCard icon={<Users />} number="500+" label="Giáo viên" />
              <StatsCard icon={<Book />} number="1000+" label="Lớp học" />
              <StatsCard icon={<FileText />} number="5000+" label="Bài thi" />
              <StatsCard icon={<Award />} number="99%" label="Độ chính xác" />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <FeatureCard
              title="Quản lý lớp học"
              desc="Xem danh sách lớp, thêm/xóa sinh viên, quản lý thông tin lớp học dễ dàng và hiệu quả."
              icon={<Users className="w-8 h-8" />}
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              title="Tổ chức & Giám sát thi"
              desc="Tạo ca thi, điểm danh, cấp mã vào phòng thi, theo dõi trạng thái thi trực tuyến real-time."
              icon={<FileText className="w-8 h-8" />}
              color="from-purple-500 to-pink-500"
            />
            <FeatureCard
              title="Chấm điểm thông minh"
              desc="Chấm điểm bài thi trắc nghiệm tự động, hỗ trợ AI gợi ý chấm bài tự luận, nhập điểm thủ công."
              icon={<Zap className="w-8 h-8" />}
              color="from-green-500 to-emerald-500"
            />
            <FeatureCard
              title="Thống kê & Báo cáo"
              desc="Xem thống kê điểm chi tiết, xuất báo cáo kết quả thi, hỗ trợ đánh giá chất lượng học tập."
              icon={<BarChart3 className="w-8 h-8" />}
              color="from-orange-500 to-red-500"
            />
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HighlightCard
              title="Bảo mật cao"
              desc="Hệ thống được bảo vệ bằng công nghệ mã hóa tiên tiến, đảm bảo tính bảo mật tuyệt đối cho dữ liệu thi cử."
              icon={<Shield className="w-12 h-12 text-blue-400" />}
            />
            <HighlightCard
              title="Thời gian thực"
              desc="Theo dõi và giám sát quá trình thi diễn ra trong thời gian thực, cập nhật trạng thái liên tục."
              icon={<Clock className="w-12 h-12 text-green-400" />}
            />
            <HighlightCard
              title="Dễ sử dụng"
              desc="Giao diện thân thiện, trực quan, dễ sử dụng cho mọi đối tượng giáo viên, không cần đào tạo phức tạp."
              icon={<Award className="w-12 h-12 text-purple-400" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, number, label }: { icon: React.ReactNode; number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
      <div className="text-white/80 mb-2 flex justify-center">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{number}</div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  color,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="group h-full">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 h-full flex flex-col border border-white/20 hover:shadow-3xl transition-all duration-300 hover:scale-105">
        <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-xl mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed flex-grow">{desc}</p>
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center hover:bg-white/20 transition-all duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-white/80 leading-relaxed">{desc}</p>
    </div>
  );
}