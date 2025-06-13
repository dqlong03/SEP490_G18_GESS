"use client";

import { useEffect, useState } from "react";
import { User, fetchUser, updateUser } from "@services/admin/userInfoService";

export function useUserInfo(userId: string | undefined) {
  const [userData, setUserData] = useState<Partial<User>>({});
  const [apiFields, setApiFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUser(userId).then((data) => {
      if (data) {
        setUserData(data);
        setApiFields(Object.keys(data));
      }
      setLoading(false);
    });
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    if (id === "gender") {
      setUserData((prev) => ({
        ...prev,
        gender: value === "" ? undefined : value === "male",
      }));
    } else if (id === "isActive") {
      setUserData((prev) => ({
        ...prev,
        isActive: value === "" ? undefined : value === "active",
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!userId) return false;
    const submitData: Partial<User> = {};
    apiFields.forEach((field) => {
      if (userData[field as keyof User] !== undefined) {
        (submitData as any)[field] = userData[field as keyof User];
      }
    });
    return await updateUser(userId, submitData);
  };

  return {
    userData,
    setUserData,
    apiFields,
    loading,
    handleChange,
    handleSubmit,
  };
}
