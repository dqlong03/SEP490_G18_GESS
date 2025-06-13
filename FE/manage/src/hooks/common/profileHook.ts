"use client";

import { useEffect, useState } from "react";
import {
  fetchUser,
  updateUser,
  User,
  UserEditFields,
} from "@services/common/profileService";
import { getUserIdFromToken } from "@/utils/tokenUtils";

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<UserEditFields>({});
  const [loading, setLoading] = useState(false);

  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUser(userId)
      .then((data) => {
        if (data) {
          setUser(data);
          setForm({
            fullname: data.fullname,
            phoneNumber: data.phoneNumber,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
            email: data.email,
            userName: data.userName,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "gender") {
      setForm({ ...form, gender: value === "true" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const updated = await updateUser(userId, form);
    if (updated) {
      setUser(updated);
      setEditMode(false);
    } else {
      alert("Cập nhật thất bại");
    }
    setLoading(false);
  };

  return {
    user,
    editMode,
    setEditMode,
    form,
    setForm,
    loading,
    handleChange,
    handleSave,
    userId,
  };
}
