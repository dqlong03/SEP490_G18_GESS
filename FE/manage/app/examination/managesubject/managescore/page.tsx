'use client';

import { useSearchParams } from 'next/navigation';

export default function ManageScorePage() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Quản lý đầu điểm môn học</h2>
      <p>Subject ID: <b>{subjectId}</b></p>
      <div style={{ marginTop: 24 }}>
        {/* Thêm giao diện quản lý đầu điểm ở đây */}
        <p>Chức năng quản lý đầu điểm sẽ được phát triển tại đây.</p>
      </div>
    </div>
  );
}
