'use client';

import React, { useEffect, useState } from 'react';
import { getUserIdFromToken } from '@/utils/tokenUtils';

type User = {
  userId: string;
  userName: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Để hiển thị các trường khác nếu có
};

type UserEditFields = {
  fullname?: string;
  phoneNumber?: string;
  gender?: boolean;
  dateOfBirth?: string | null;
};

const API_BASE = 'https://localhost:7074';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<UserEditFields>({});
  const [loading, setLoading] = useState(false);

  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/User/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm({
          fullname: data.fullname,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
        });
      })
      .catch(() => alert('Không thể tải thông tin user'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'gender') {
      setForm({ ...form, gender: value === 'true' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/User/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setUser(updated);
      setEditMode(false);
    } catch {
      alert('Cập nhật thất bại');
    }
    setLoading(false);
  };

  if (!userId) {
    return <div>Không tìm thấy thông tin người dùng.</div>;
  }

  if (loading && !user) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <div>Không tìm thấy thông tin người dùng.</div>;
  }

  // Các trường chỉ cho xem
  const readonlyFields = Object.entries(user).filter(
    ([key]) =>
      !['fullname', 'phoneNumber', 'gender', 'dateOfBirth'].includes(key)
  );

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h1>Thông tin cá nhân</h1>
      {!editMode ? (
        <div>
          {readonlyFields.map(([key, value]) => (
            <p key={key}>
              <b>{key}:</b> {String(value ?? '')}
            </p>
          ))}
          <p>
            <b>Họ tên:</b> {user.fullname}
          </p>
          <p>
            <b>Số điện thoại:</b> {user.phoneNumber || ''}
          </p>
          <p>
            <b>Giới tính:</b> {user.gender === true ? 'Nam' : user.gender === false ? 'Nữ' : ''}
          </p>
          <p>
            <b>Ngày sinh:</b> {user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : ''}
          </p>
          <button onClick={() => setEditMode(true)}>Chỉnh sửa</button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {readonlyFields.map(([key, value]) => (
            <div key={key}>
              <label><b>{key}:</b></label>
              <input value={String(value ?? '')} disabled style={{ width: '100%' }} />
            </div>
          ))}
          <div>
            <label>Họ tên:</label>
            <input
              name="fullname"
              value={form.fullname || ''}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Số điện thoại:</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Giới tính:</label>
            <select
              name="gender"
              value={form.gender === true ? 'true' : form.gender === false ? 'false' : ''}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            >
              <option value="">--Chọn--</option>
              <option value="true">Nam</option>
              <option value="false">Nữ</option>
            </select>
          </div>
          <div>
            <label>Ngày sinh:</label>
            <input
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" disabled={loading}>Lưu</button>
          <button type="button" onClick={() => setEditMode(false)} disabled={loading}>Hủy</button>
        </form>
      )}
    </div>
  );
}
